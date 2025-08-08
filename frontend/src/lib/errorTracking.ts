import React from 'react';

interface ErrorDetails {
  message: string;
  stack?: string;
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

class FrontendErrorTracker {
  private isEnabled = true;
  private endpoint = '/api/errors/frontend';
  private userId: string | null = null;
  private sessionId: string;
  private language: 'en' | 'am' = 'en';

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  // Initialize with user context
  initialize(userId?: string, language: 'en' | 'am' = 'en') {
    this.userId = userId || null;
    this.language = language;
  }

  // Generate a unique session ID
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Set up global error handlers
  private setupGlobalErrorHandlers() {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        severity: 'high',
        context: {
          route: window.location.pathname,
          action: 'uncaught_error',
        },
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        severity: 'high',
        context: {
          route: window.location.pathname,
          action: 'unhandled_rejection',
        },
      });
    });

    // Handle React error boundaries (if using React)
    if (typeof window !== 'undefined' && (window as any).React) {
      const originalConsoleError = console.error;
      console.error = (...args: any[]) => {
        const message = args.join(' ');
        if (message.includes('Error caught by Error Boundary')) {
          this.trackError({
            message,
            severity: 'medium',
            errorBoundary: 'React Error Boundary',
            context: {
              route: window.location.pathname,
              action: 'react_error_boundary',
            },
          });
        }
        originalConsoleError(...args);
      };
    }
  }

  // Main method to track errors
  async trackError(error: ErrorDetails) {
    if (!this.isEnabled) return;

    try {
      const payload = {
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        userId: this.userId,
        sessionId: this.sessionId,
        language: this.language,
        componentStack: error.componentStack,
        errorBoundary: error.errorBoundary,
        severity: error.severity,
        context: {
          ...error.context,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
        },
      };

      // Send to backend
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.group('🚨 Frontend Error Tracked');
        console.error('Message:', error.message);
        console.error('Severity:', error.severity);
        console.error('Context:', error.context);
        console.error('Stack:', error.stack);
        console.groupEnd();
      }
    } catch (trackingError) {
      console.error('Failed to track error:', trackingError);
    }
  }

  // Track API errors specifically
  trackApiError(url: string, status: number, response: any, context?: any) {
    this.trackError({
      message: `API Error: ${status} ${response?.message || 'Unknown error'}`,
      severity: status >= 500 ? 'high' : 'medium',
      context: {
        route: window.location.pathname,
        action: 'api_error',
        apiUrl: url,
        apiStatus: status,
        apiResponse: response,
        ...context,
      },
    });
  }

  // Track user action errors
  trackUserActionError(action: string, error: Error, context?: any) {
    this.trackError({
      message: `User Action Error: ${action} - ${error.message}`,
      stack: error.stack,
      severity: 'medium',
      context: {
        route: window.location.pathname,
        action: 'user_action_error',
        userAction: action,
        ...context,
      },
    });
  }

  // Track component errors (for use in error boundaries)
  trackComponentError(error: Error, errorInfo: any, componentName?: string) {
    this.trackError({
      message: `Component Error: ${error.message}`,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      severity: 'medium',
      errorBoundary: componentName,
      context: {
        route: window.location.pathname,
        action: 'component_error',
        component: componentName,
      },
    });
  }

  // Track critical errors (payment, auth, etc.)
  trackCriticalError(message: string, context?: any) {
    this.trackError({
      message: `CRITICAL: ${message}`,
      severity: 'critical',
      context: {
        route: window.location.pathname,
        action: 'critical_error',
        ...context,
      },
    });
  }

  // Enable/disable error tracking
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Set custom endpoint
  setEndpoint(endpoint: string) {
    this.endpoint = endpoint;
  }
}

// Create global instance
const errorTracker = new FrontendErrorTracker();

export default errorTracker;

// React Error Boundary Component
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<any> },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<any> }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    errorTracker.trackComponentError(error, errorInfo, 'ErrorBoundary');
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent) {
        return React.createElement(FallbackComponent);
      }
      
      return React.createElement(
        'div',
        { className: 'flex flex-col items-center justify-center min-h-screen p-4' },
        React.createElement(
          'div',
          { className: 'text-center' },
          React.createElement('h2', { className: 'text-2xl font-bold text-red-600 mb-4' }, 'Something went wrong'),
          React.createElement('p', { className: 'text-gray-600 mb-4' }, "We've been notified about this error and will fix it soon."),
          React.createElement(
            'button',
            {
              onClick: () => window.location.reload(),
              className: 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
            },
            'Reload Page'
          )
        )
      );
    }

    return this.props.children;
  }
}

// Hook for using error tracker in React components
export const useErrorTracking = () => {
  return {
    trackError: (error: ErrorDetails) => errorTracker.trackError(error),
    trackApiError: (url: string, status: number, response: any, context?: any) =>
      errorTracker.trackApiError(url, status, response, context),
    trackUserActionError: (action: string, error: Error, context?: any) =>
      errorTracker.trackUserActionError(action, error, context),
    trackCriticalError: (message: string, context?: any) =>
      errorTracker.trackCriticalError(message, context),
  };
};