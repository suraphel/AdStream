import winston from 'winston';
import path from 'path';

// Define log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(logColors);

// Custom format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, stack, ...extra } = info;
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...(stack && { stack }),
      ...extra,
    });
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, stack, ...extra } = info;
    const extraStr = Object.keys(extra).length ? JSON.stringify(extra, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${stack || ''} ${extraStr}`;
  })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Logger configuration
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels: logLevels,
  format: logFormat,
  defaultMeta: {
    service: 'ethiomarket-api',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // HTTP requests log
    new winston.transports.File({
      filename: path.join(logsDir, 'http.log'),
      level: 'http',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// HTTP endpoint transport for centralized logging (if configured)
if (process.env.LOG_HTTP_ENDPOINT) {
  logger.add(
    new winston.transports.Http({
      host: process.env.LOG_HTTP_HOST || 'localhost',
      port: parseInt(process.env.LOG_HTTP_PORT || '9200'),
      path: process.env.LOG_HTTP_PATH || '/logs',
      ssl: process.env.LOG_HTTP_SSL === 'true',
    })
  );
}

// Helper functions for different log types
export const Logger = {
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  http: (message: string, meta?: any) => logger.http(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
  
  // Structured logging methods
  logApiRequest: (req: any, res: any, duration: number) => {
    logger.http('API Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.claims?.sub,
    });
  },
  
  logError: (error: Error, context?: any) => {
    logger.error('Application Error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context,
    });
  },
  
  logUserAction: (action: string, userId: string, details?: any) => {
    logger.info('User Action', {
      action,
      userId,
      ...details,
    });
  },
  
  logBusinessEvent: (event: string, data?: any) => {
    logger.info('Business Event', {
      event,
      ...data,
    });
  },
  
  logSecurityEvent: (event: string, details?: any) => {
    logger.warn('Security Event', {
      event,
      ...details,
    });
  },
};

export default logger;