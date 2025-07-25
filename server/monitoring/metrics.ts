import express from 'express';
import promClient from 'prom-client';

// Create a Registry
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({
  register,
  prefix: 'ethiomarket_',
});

// Custom metrics
const httpRequestsTotal = new promClient.Counter({
  name: 'ethiomarket_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDuration = new promClient.Histogram({
  name: 'ethiomarket_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

const activeConnections = new promClient.Gauge({
  name: 'ethiomarket_active_connections',
  help: 'Number of active connections',
});

const databaseQueryDuration = new promClient.Histogram({
  name: 'ethiomarket_database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

const listingsTotal = new promClient.Gauge({
  name: 'ethiomarket_listings_total',
  help: 'Total number of listings',
  labelNames: ['status', 'category'],
});

const usersTotal = new promClient.Gauge({
  name: 'ethiomarket_users_total',
  help: 'Total number of users',
  labelNames: ['status'],
});

const imageUploadsTotal = new promClient.Counter({
  name: 'ethiomarket_image_uploads_total',
  help: 'Total number of image uploads',
  labelNames: ['status', 'size_category'],
});

const searchRequestsTotal = new promClient.Counter({
  name: 'ethiomarket_search_requests_total',
  help: 'Total number of search requests',
  labelNames: ['category', 'has_results'],
});

const favoriteActionsTotal = new promClient.Counter({
  name: 'ethiomarket_favorite_actions_total',
  help: 'Total number of favorite actions',
  labelNames: ['action'], // 'add' or 'remove'
});

const errorRate = new promClient.Counter({
  name: 'ethiomarket_errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'severity'],
});

// Register all metrics
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDuration);
register.registerMetric(activeConnections);
register.registerMetric(databaseQueryDuration);
register.registerMetric(listingsTotal);
register.registerMetric(usersTotal);
register.registerMetric(imageUploadsTotal);
register.registerMetric(searchRequestsTotal);
register.registerMetric(favoriteActionsTotal);
register.registerMetric(errorRate);

// Middleware to track HTTP metrics
export const metricsMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const startTime = Date.now();
  
  // Increment active connections
  activeConnections.inc();
  
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    const route = req.route?.path || req.path;
    
    // Record metrics
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    });
    
    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: res.statusCode,
      },
      duration
    );
    
    // Decrement active connections
    activeConnections.dec();
  });
  
  next();
};

// Business metrics helpers
export const Metrics = {
  // Database metrics
  recordDatabaseQuery: (operation: string, table: string, duration: number) => {
    databaseQueryDuration.observe(
      { operation, table },
      duration / 1000 // Convert to seconds
    );
  },
  
  // Listing metrics
  updateListingsCount: (status: string, category: string, count: number) => {
    listingsTotal.set({ status, category }, count);
  },
  
  // User metrics
  updateUsersCount: (status: string, count: number) => {
    usersTotal.set({ status }, count);
  },
  
  // Image upload metrics
  recordImageUpload: (success: boolean, sizeCategory: string) => {
    imageUploadsTotal.inc({
      status: success ? 'success' : 'failure',
      size_category: sizeCategory,
    });
  },
  
  // Search metrics
  recordSearchRequest: (category: string, hasResults: boolean) => {
    searchRequestsTotal.inc({
      category,
      has_results: hasResults ? 'true' : 'false',
    });
  },
  
  // Favorite metrics
  recordFavoriteAction: (action: 'add' | 'remove') => {
    favoriteActionsTotal.inc({ action });
  },
  
  // Error metrics
  recordError: (type: string, severity: 'low' | 'medium' | 'high' | 'critical') => {
    errorRate.inc({ type, severity });
  },
};

// Metrics endpoint
export const metricsHandler = async (req: express.Request, res: express.Response) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end('Error collecting metrics');
  }
};

export { register };