import express from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { Logger } from '../logging/Logger';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  checks: {
    database: HealthCheck;
    memory: HealthCheck;
    disk: HealthCheck;
    imageStorage: HealthCheck;
  };
  version: string;
  environment: string;
}

interface HealthCheck {
  status: 'pass' | 'fail' | 'warn';
  duration: number;
  details?: any;
  error?: string;
}

const formatBytes = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const checkDatabase = async (): Promise<HealthCheck> => {
  const start = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    return {
      status: 'pass',
      duration: Date.now() - start,
      details: {
        connection: 'active',
        pool: 'healthy'
      }
    };
  } catch (error) {
    Logger.logError(error as Error, { component: 'health-check', check: 'database' });
    return {
      status: 'fail',
      duration: Date.now() - start,
      error: (error as Error).message
    };
  }
};

const checkMemory = async (): Promise<HealthCheck> => {
  const start = Date.now();
  try {
    const memUsage = process.memoryUsage();
    const totalMem = require('os').totalmem();
    const freeMem = require('os').freemem();
    const usedMemPercentage = ((totalMem - freeMem) / totalMem) * 100;
    
    const status = usedMemPercentage > 90 ? 'fail' : usedMemPercentage > 80 ? 'warn' : 'pass';
    
    return {
      status,
      duration: Date.now() - start,
      details: {
        rss: formatBytes(memUsage.rss),
        heapTotal: formatBytes(memUsage.heapTotal),
        heapUsed: formatBytes(memUsage.heapUsed),
        external: formatBytes(memUsage.external),
        systemMemoryUsed: `${usedMemPercentage.toFixed(2)}%`,
        totalMemory: formatBytes(totalMem),
        freeMemory: formatBytes(freeMem)
      }
    };
  } catch (error) {
    return {
      status: 'fail',
      duration: Date.now() - start,
      error: (error as Error).message
    };
  }
};

const checkDisk = async (): Promise<HealthCheck> => {
  const start = Date.now();
  try {
    const fs = require('fs');
    const stats = fs.statSync(process.cwd());
    
    // Simple disk check - in production, you'd want more sophisticated monitoring
    return {
      status: 'pass',
      duration: Date.now() - start,
      details: {
        accessible: true,
        workingDirectory: process.cwd()
      }
    };
  } catch (error) {
    return {
      status: 'fail',
      duration: Date.now() - start,
      error: (error as Error).message
    };
  }
};

const checkImageStorage = async (): Promise<HealthCheck> => {
  const start = Date.now();
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // Check if uploads directory exists and is writable
    await fs.access(uploadsDir, require('fs').constants.W_OK);
    
    // Get directory stats
    const stats = await fs.stat(uploadsDir);
    
    return {
      status: 'pass',
      duration: Date.now() - start,
      details: {
        directory: uploadsDir,
        accessible: true,
        writable: true,
        created: stats.birthtime
      }
    };
  } catch (error) {
    return {
      status: 'fail',
      duration: Date.now() - start,
      error: (error as Error).message
    };
  }
};

export const healthCheckHandler = async (req: express.Request, res: express.Response) => {
  const startTime = Date.now();
  
  try {
    // Run all health checks in parallel
    const [databaseCheck, memoryCheck, diskCheck, imageStorageCheck] = await Promise.all([
      checkDatabase(),
      checkMemory(),
      checkDisk(),
      checkImageStorage()
    ]);
    
    const checks = {
      database: databaseCheck,
      memory: memoryCheck,
      disk: diskCheck,
      imageStorage: imageStorageCheck
    };
    
    // Determine overall status
    const hasFailures = Object.values(checks).some(check => check.status === 'fail');
    const hasWarnings = Object.values(checks).some(check => check.status === 'warn');
    
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded';
    if (hasFailures) {
      overallStatus = 'unhealthy';
    } else if (hasWarnings) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }
    
    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
    
    // Set appropriate HTTP status code
    const statusCode = overallStatus === 'unhealthy' ? 503 : 200;
    
    // Log health check
    Logger.info('Health Check', {
      status: overallStatus,
      duration: `${Date.now() - startTime}ms`,
      checks: Object.entries(checks).map(([name, check]) => ({
        name,
        status: check.status,
        duration: check.duration
      }))
    });
    
    res.status(statusCode).json(result);
    
  } catch (error) {
    Logger.logError(error as Error, { component: 'health-check' });
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: (error as Error).message
    });
  }
};

// Simplified readiness check
export const readinessHandler = async (req: express.Request, res: express.Response) => {
  try {
    // Quick database connectivity check
    await db.execute(sql`SELECT 1`);
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: (error as Error).message });
  }
};

// Liveness check
export const livenessHandler = (req: express.Request, res: express.Response) => {
  res.status(200).json({ 
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};