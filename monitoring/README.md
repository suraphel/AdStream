# EthioMarket Monitoring & Observability Stack

This directory contains the complete monitoring and observability infrastructure for EthioMarket, supporting both English and Amharic languages.

## Overview

The monitoring stack includes:
- **Prometheus** - Metrics collection and alerting
- **Grafana** - Dashboards and visualization
- **AlertManager** - Alert routing and notifications
- **Node Exporter** - System metrics
- **Structured Logging** - Winston-based logging with rotation
- **Error Tracking** - Frontend and backend error capture
- **Health Checks** - Application health monitoring

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js application running on port 5000

### Deploy Monitoring Stack

```bash
# English deployment
./deploy-monitoring.sh

# Amharic deployment
./deploy-monitoring.sh am
```

### Access URLs
- **Grafana Dashboard**: http://localhost:3000 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **AlertManager**: http://localhost:9093
- **Application Metrics**: http://localhost:5000/metrics
- **Health Check**: http://localhost:5000/health

## Architecture

### Metrics Collection
- **API Metrics**: Request rates, response times, error rates
- **Business Metrics**: User activity, listings, searches, favorites
- **System Metrics**: CPU, memory, disk, network
- **Database Metrics**: Query performance, connection pools
- **Image Upload Metrics**: Success rates, file sizes

### Logging Strategy
- **Structured Logging**: JSON format with timestamps
- **Log Levels**: Error, Warn, Info, HTTP, Debug
- **Log Rotation**: 5MB files, 5 file retention
- **Centralized Logs**: Optional HTTP endpoint forwarding

### Error Tracking
- **Frontend Errors**: Uncaught exceptions, React errors, API failures
- **Backend Errors**: Application errors, database errors, validation errors
- **Error Analytics**: Grouping by type, severity, frequency
- **Real-time Alerts**: Critical error notifications

## Dashboards

### 1. Overview Dashboard
- System health overview
- API performance metrics
- Error rates and response times
- Active users and connections

### 2. Business Metrics (ኢትዮማርኬት - የንግድ መለኪያዎች)
- Listing statistics by category
- User activity patterns
- Search success rates
- Geographic distribution
- Revenue and transaction metrics

### 3. Error Tracking (ኢትዮማርኬት - የስህተት ክትትል)
- Error rates by severity
- Frontend vs backend errors
- Error trends and patterns
- Recent error events

## Alerting Rules

### Critical Alerts
- **Database Connection Down**: Immediate notification
- **High Error Rate**: >10% error rate for 2 minutes
- **Critical Frontend Errors**: Any critical severity errors
- **Disk Space Low**: <10% remaining space

### Warning Alerts
- **High Response Time**: >2 seconds 95th percentile
- **High Memory Usage**: >90% memory utilization
- **Low Search Results**: >80% empty search results
- **Image Upload Failures**: >5% failure rate

## Configuration

### Environment Variables

```env
# Logging Configuration
LOG_LEVEL=info
LOG_HTTP_ENDPOINT=false
LOG_HTTP_HOST=localhost
LOG_HTTP_PORT=9200
LOG_HTTP_PATH=/logs
LOG_HTTP_SSL=false

# Metrics Configuration
METRICS_PREFIX=ethiomarket_
METRICS_INTERVAL=15000

# Application Configuration
NODE_ENV=production
```

### Prometheus Configuration

The Prometheus configuration automatically discovers:
- EthioMarket API metrics (http://localhost:5000/metrics)
- Node exporter system metrics
- Grafana internal metrics

### Grafana Configuration

Pre-configured dashboards include:
- Datasource: Prometheus
- Refresh intervals: 10s-5m depending on dashboard
- Language support: Template variables for EN/AM
- Alert annotations: Bilingual alert messages

## API Endpoints

### Health Checks
```
GET /health          - Comprehensive health check
GET /health/ready    - Readiness probe
GET /health/live     - Liveness probe
```

### Metrics
```
GET /metrics         - Prometheus metrics endpoint
```

### Error Tracking
```
POST /api/errors/frontend     - Report frontend errors
GET  /api/errors/analytics    - Error analytics (authenticated)
GET  /api/errors/recent       - Recent errors (authenticated)
```

## Frontend Integration

### Error Tracking Setup

```javascript
import errorTracker from '@/lib/errorTracking';

// Initialize with user context
errorTracker.initialize(userId, language);

// Track custom errors
errorTracker.trackError({
  message: 'Payment failed',
  severity: 'critical',
  context: { orderId: '123', amount: 100 }
});

// Track API errors
errorTracker.trackApiError('/api/payments', 500, response);
```

### Error Boundary Usage

```jsx
import { ErrorBoundary } from '@/lib/errorTracking';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

## Troubleshooting

### Common Issues

1. **Grafana Permission Issues**
   ```bash
   sudo chown -R 472:472 monitoring/grafana/data
   ```

2. **Prometheus Target Down**
   - Check application is running on port 5000
   - Verify firewall settings
   - Check Docker network connectivity

3. **Missing Dashboards**
   - Ensure dashboard JSON files are in `grafana/dashboards/`
   - Check provisioning configuration
   - Restart Grafana container

### Logs Location
- **Application Logs**: `./logs/`
- **Container Logs**: `docker-compose logs [service]`
- **Grafana Logs**: `docker-compose logs grafana`

## Scaling Considerations

### High Availability
- Use Prometheus federation for multiple instances
- Configure Grafana with external database
- Implement distributed tracing with Jaeger

### Performance Optimization
- Adjust metrics retention policies
- Configure recording rules for complex queries
- Use Grafana query caching

### Security
- Configure HTTPS for Grafana
- Set up authentication providers (LDAP, OAuth)
- Implement network policies in Kubernetes

## Maintenance

### Regular Tasks
- Review and update alert thresholds
- Analyze error patterns and trends
- Update dashboard visualizations
- Monitor disk usage for metrics storage

### Backup Strategy
- Export Grafana dashboards regularly
- Backup Prometheus configuration
- Document custom alert rules and queries

## Support

For issues related to monitoring and observability:
1. Check service health: `docker-compose ps`
2. Review logs: `docker-compose logs [service]`
3. Verify configuration files
4. Test connectivity between services

Language Support: All dashboards and alerts support both English and Amharic languages through template variables and annotations.