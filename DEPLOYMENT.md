# EduOS Deployment & Operations Guide

## Quick Start

### Development Environment
```bash
# Clone environment
cp .env.development .env

# Start all services with Docker
docker-compose up -d

# Access services
- API: http://localhost:3000
- Admin Dashboard: http://localhost:3001
- Marketing: http://localhost:3002
- Health Check: http://localhost:3000/health
- Metrics: http://localhost:3000/metrics
- Dashboard: http://localhost:3000/admin/dashboard
```

### Production Deployment

#### Prerequisites
- Docker & Docker Compose
- PostgreSQL 16+ (managed service recommended)
- Redis 7+ (managed service recommended)
- SSL/TLS certificates
- DNS configuration

#### Step 1: Environment Setup
```bash
# Create production environment
cp .env.production .env.production.local

# Update with actual values
export NODE_ENV=production
export DATABASE_URL=postgres://user:pass@db-host:5432/edos
export REDIS_URL=redis://redis-host:6379
export JWT_ACCESS_SECRET=$(openssl rand -base64 32)
export JWT_REFRESH_SECRET=$(openssl rand -base64 32)
```

#### Step 2: Build Images
```bash
docker-compose build

# Or push to registry
docker tag edos-api:latest myregistry.azurecr.io/edos-api:latest
docker push myregistry.azurecr.io/edos-api:latest
```

#### Step 3: Deploy
```bash
# Single machine deployment
docker-compose -f docker-compose.yml up -d

# Or Kubernetes (recommended for production)
kubectl apply -f k8s/
```

#### Step 4: Verify Deployment
```bash
# Check health
curl http://localhost:3000/health

# Check readiness
curl http://localhost:3000/ready

# Check liveness
curl http://localhost:3000/live

# View metrics
curl http://localhost:3000/metrics

# Access dashboard
curl http://localhost:3000/admin/dashboard
```

## Health Checks & Probes

### Kubernetes Probes Configuration
```yaml
livenessProbe:
  httpGet:
    path: /live
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5

startupProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 0
  periodSeconds: 10
  failureThreshold: 30
```

## Monitoring & Observability

### Metrics
- Prometheus endpoint: `GET /metrics`
- Metrics include:
  - HTTP request duration
  - Database query performance
  - Job queue status
  - PDF generation times
  - Analytics aggregation times
  - Process memory/CPU

### Health Dashboard
- Access: `GET /admin/dashboard`
- Shows:
  - System health status
  - Queue statistics
  - Automation workflows
  - Performance metrics

### Logs
- Format: Structured JSON via pino
- Should be shipped to centralized logging (ELK, Splunk, etc.)
- Contains correlation IDs for request tracing

## Operational Procedures

### Handling Pending Workflows

1. **View Pending Workflows**
   ```bash
   curl http://localhost:3000/admin/workflows/pending
   ```

2. **Approve Workflow**
   ```bash
   curl -X POST http://localhost:3000/admin/workflows/{workflowId}/approve \
     -H "Content-Type: application/json" \
     -d '{"approvedBy": "operator@company.com"}'
   ```

3. **Reject Workflow**
   ```bash
   curl -X POST http://localhost:3000/admin/workflows/{workflowId}/reject \
     -H "Content-Type: application/json" \
     -d '{"reason": "Information needs verification"}'
   ```

### Viewing Workflow History
```bash
curl "http://localhost:3000/admin/workflows/history?limit=50"
```

### System Information
```bash
curl http://localhost:3000/admin/system-info
```

## Scaling Considerations

### Horizontal Scaling

1. **API Servers**
   - Deploy multiple API containers behind load balancer
   - Use shared Redis for queue coordination
   - No session affinity required (stateless)

2. **Background Jobs**
   - Scale workers independently
   - Multiple workers can process same queue
   - BullMQ handles concurrency

3. **Database**
   - Use managed PostgreSQL (AWS RDS, Azure Database, etc.)
   - Connection pooling via environment
   - Enable read replicas if needed

### Vertical Scaling
- Increase container memory/CPU in orchestrator
- Monitor memory usage via `/metrics`
- Adjust GC settings if needed

## Backup & Recovery

### Database Backups
```bash
# Daily backups (recommended via managed service)
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Or automated via AWS RDS, Azure Database
```

### Workflow Recovery
- Workflows persist to `/app/storage/workflows`
- Mount persistent volume in Kubernetes
- Backup location should be in persistent storage

### Disaster Recovery
1. Restore database from latest backup
2. Clear Redis queue
3. Redeploy application
4. Workers will pick up pending jobs

## Troubleshooting

### Service Won't Start
```bash
# Check logs
docker-compose logs api

# Check environment
docker-compose config

# Verify database connection
psql $DATABASE_URL -c "SELECT 1"

# Check Redis
redis-cli -u $REDIS_URL ping
```

### High Memory Usage
```bash
# Check memory metrics
curl http://localhost:3000/admin/system-info

# Check Node heap
curl http://localhost:3000/metrics | grep "process_memory"

# Restart service
docker-compose restart api
```

### Jobs Not Processing
```bash
# Check queue status
curl http://localhost:3000/admin/dashboard

# Check Redis connection
redis-cli -u $REDIS_URL CLIENT LIST

# View job failures
# (Implement job failure monitoring in dashboard)
```

### Database Connection Issues
```bash
# Check connection pool
# (Add connection pool monitoring to metrics)

# Verify credentials
psql -h $DB_HOST -U $DB_USER -d $DB_NAME

# Check connection limits
# psql=> SELECT count(*) FROM pg_stat_activity;
```

## Security Checklist

- [ ] SSL/TLS enabled for all traffic
- [ ] JWT secrets are strong (32+ characters)
- [ ] Database credentials in secrets manager
- [ ] Redis requires password authentication
- [ ] CORS configured for specific domains
- [ ] Rate limiting enabled
- [ ] Audit logging enabled
- [ ] Monitoring and alerting configured
- [ ] Regular security updates
- [ ] Backup encryption enabled
- [ ] Access logs reviewed regularly

## Performance Optimization

### Database
- Monitor slow queries
- Add indexes as needed
- Use connection pooling
- Archive old data regularly

### Redis
- Monitor memory usage
- Configure eviction policy
- Use Redis persistence if needed
- Monitor key size

### API
- Monitor request latency via `/metrics`
- Check job processing times
- Monitor error rates
- Scale workers as needed

## Maintenance

### Regular Tasks
- **Daily**: Monitor health checks, error rates
- **Weekly**: Review logs, backup verification
- **Monthly**: Performance analysis, security review
- **Quarterly**: Dependency updates, security audit

### Scheduled Jobs
- Daily analytics aggregation (configurable time)
- Daily old file cleanup
- Weekly data archival
- Monthly risk score updates

## Support & Escalation

### Support Contacts
- On-Call Engineer: Check escalation policy
- Database Admin: For schema/migration issues
- Infrastructure Team: For deployment/scaling issues

### Runbooks
- High memory usage → Check jobs, consider scaling
- Database slow queries → Add index, optimize query
- Jobs not processing → Check Redis, restart workers
- API errors → Check logs, health status

## Documentation

- Full API docs: `services/api-server/openapi/`
- Architecture: `PRODUCTION_ENGINEERING.md`
- Deployment: This file
- Troubleshooting: See sections above

