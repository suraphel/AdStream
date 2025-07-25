import express from 'express';
import { Logger } from '../logging/Logger';
import { Metrics } from './metrics';

export interface FrontendError {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  language?: 'en' | 'am';
  componentStack?: string;
  errorBoundary?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: {
    route?: string;
    action?: string;
    props?: any;
    state?: any;
  };
}

export interface ErrorAnalytics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByPage: Record<string, number>;
  errorsByLanguage: Record<string, number>;
  errorsByTimeOfDay: Record<string, number>;
  commonStackTraces: Array<{
    stack: string;
    count: number;
    lastSeen: string;
  }>;
  topUserAgents: Record<string, number>;
}

class ErrorTracker {
  private errors: FrontendError[] = [];
  private maxStoredErrors = 1000;

  // Store frontend error
  trackFrontendError(error: FrontendError) {
    // Add to in-memory storage (in production, use a proper database)
    this.errors.unshift(error);
    
    // Keep only recent errors
    if (this.errors.length > this.maxStoredErrors) {
      this.errors = this.errors.slice(0, this.maxStoredErrors);
    }

    // Log the error
    Logger.error('Frontend Error', {
      message: error.message,
      url: error.url,
      userAgent: error.userAgent,
      userId: error.userId,
      language: error.language,
      severity: error.severity,
      stack: error.stack,
      context: error.context,
    });

    // Record metrics
    Metrics.recordError('frontend', error.severity);

    // Alert on critical errors
    if (error.severity === 'critical') {
      this.alertCriticalError(error);
    }
  }

  // Get error analytics
  getErrorAnalytics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): ErrorAnalytics {
    const now = new Date();
    const cutoff = new Date();
    
    switch (timeRange) {
      case '1h':
        cutoff.setHours(now.getHours() - 1);
        break;
      case '24h':
        cutoff.setDate(now.getDate() - 1);
        break;
      case '7d':
        cutoff.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(now.getDate() - 30);
        break;
    }

    const filteredErrors = this.errors.filter(
      error => new Date(error.timestamp) >= cutoff
    );

    const errorsByType: Record<string, number> = {};
    const errorsByPage: Record<string, number> = {};
    const errorsByLanguage: Record<string, number> = {};
    const errorsByTimeOfDay: Record<string, number> = {};
    const stackTraces: Record<string, { count: number; lastSeen: string }> = {};
    const topUserAgents: Record<string, number> = {};

    filteredErrors.forEach(error => {
      // Group by error type (first line of stack trace)
      const errorType = error.message.split('\n')[0] || 'Unknown';
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;

      // Group by page URL
      const page = new URL(error.url).pathname;
      errorsByPage[page] = (errorsByPage[page] || 0) + 1;

      // Group by language
      const language = error.language || 'unknown';
      errorsByLanguage[language] = (errorsByLanguage[language] || 0) + 1;

      // Group by time of day
      const hour = new Date(error.timestamp).getHours();
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      errorsByTimeOfDay[timeSlot] = (errorsByTimeOfDay[timeSlot] || 0) + 1;

      // Track stack traces
      if (error.stack) {
        const stackKey = error.stack.split('\n').slice(0, 3).join('\n');
        if (!stackTraces[stackKey]) {
          stackTraces[stackKey] = { count: 0, lastSeen: error.timestamp };
        }
        stackTraces[stackKey].count++;
        stackTraces[stackKey].lastSeen = error.timestamp;
      }

      // Track user agents
      const userAgent = error.userAgent.split(' ')[0] || 'Unknown';
      topUserAgents[userAgent] = (topUserAgents[userAgent] || 0) + 1;
    });

    // Convert stack traces to sorted array
    const commonStackTraces = Object.entries(stackTraces)
      .map(([stack, data]) => ({ stack, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors: filteredErrors.length,
      errorsByType,
      errorsByPage,
      errorsByLanguage,
      errorsByTimeOfDay,
      commonStackTraces,
      topUserAgents,
    };
  }

  // Get recent errors
  getRecentErrors(limit: number = 50): FrontendError[] {
    return this.errors.slice(0, limit);
  }

  // Alert on critical errors
  private alertCriticalError(error: FrontendError) {
    Logger.error('CRITICAL Frontend Error', {
      message: 'Critical error detected',
      error: error.message,
      url: error.url,
      userId: error.userId,
      stack: error.stack,
      context: error.context,
    });

    // In production, you might want to:
    // - Send to Slack/Teams
    // - Send email alerts
    // - Create incident tickets
    // - Trigger PagerDuty alerts
  }
}

const errorTracker = new ErrorTracker();

// Middleware for handling frontend error reports
export const frontendErrorHandler = (req: express.Request, res: express.Response) => {
  try {
    const error: FrontendError = req.body;
    
    // Validate required fields
    if (!error.message || !error.url || !error.timestamp) {
      return res.status(400).json({
        error: 'Missing required fields: message, url, timestamp',
        errorAm: 'አስፈላጊ መረጃዎች ይጎድላሉ: መልእክት, ሊንክ, ጊዜ'
      });
    }

    // Add server-side context
    const enrichedError: FrontendError = {
      ...error,
      userAgent: req.get('User-Agent') || error.userAgent,
      userId: (req as any).user?.claims?.sub || error.userId,
    };

    // Track the error
    errorTracker.trackFrontendError(enrichedError);

    res.status(200).json({
      message: 'Error tracked successfully',
      messageAm: 'ስህተት በተሳካ ሁኔታ ተመዝግቧል'
    });
    
  } catch (error) {
    Logger.logError(error as Error, { component: 'error-tracking' });
    res.status(500).json({
      error: 'Failed to track error',
      errorAm: 'ስህተት መመዝገብ አልተሳካም'
    });
  }
};

// API endpoint for error analytics
export const errorAnalyticsHandler = (req: express.Request, res: express.Response) => {
  try {
    const timeRange = req.query.timeRange as '1h' | '24h' | '7d' | '30d' || '24h';
    const analytics = errorTracker.getErrorAnalytics(timeRange);
    
    res.json({
      analytics,
      message: 'Error analytics retrieved successfully',
      messageAm: 'የስህተት ትንተና በተሳካ ሁኔታ ተመልሷል'
    });
    
  } catch (error) {
    Logger.logError(error as Error, { component: 'error-analytics' });
    res.status(500).json({
      error: 'Failed to retrieve error analytics',
      errorAm: 'የስህተት ትንተና ማግኘት አልተሳካም'
    });
  }
};

// API endpoint for recent errors
export const recentErrorsHandler = (req: express.Request, res: express.Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const errors = errorTracker.getRecentErrors(limit);
    
    res.json({
      errors,
      count: errors.length,
      message: 'Recent errors retrieved successfully',
      messageAm: 'የቅርብ ጊዜ ስህተቶች በተሳካ ሁኔታ ተመልሷል'
    });
    
  } catch (error) {
    Logger.logError(error as Error, { component: 'recent-errors' });
    res.status(500).json({
      error: 'Failed to retrieve recent errors',
      errorAm: 'የቅርብ ጊዜ ስህተቶች ማግኘት አልተሳካም'
    });
  }
};

export default errorTracker;