# OptiBid Energy Platform - Deployment Checklist

## Overview

This document provides a comprehensive checklist for deploying the OptiBid Energy Platform to production environments. Follow each section carefully to ensure a successful deployment.

**Last Updated:** November 23, 2025  
**Version:** 1.0

---

## Pre-Deployment Checks

### 1. Code Quality & Testing

- [ ] All unit tests pass (`pytest backend/tests/`)
- [ ] All integration tests pass
- [ ] End-to-end tests complete successfully
- [ ] Code review completed and approved
- [ ] No critical or high-severity security vulnerabilities
- [ ] Performance tests meet SLA requirements
- [ ] Load testing completed for expected traffic
- [ ] WebSocket stress testing completed

### 2. Environment Configuration

- [ ] Production environment variables configured in `.env`
- [ ] All required services are available and accessible
- [ ] Database connection strings verified
- [ ] Redis connection configured (if using)
- [ ] Kafka connection configured (if using)
- [ ] ClickHouse connection configured (if using)
- [ ] MLflow connection configured (if using)
- [ ] MinIO/S3 storage configured (if using)
- [ ] API keys and secrets rotated for production
- [ ] JWT secret keys generated and secured
- [ ] CORS origins configured correctly
- [ ] Rate limiting configured appropriately

### 3. Database Preparation

- [ ] Database backup completed before migration
- [ ] Database migrations tested in staging environment
- [ ] Migration rollback procedure tested
- [ ] Database indexes verified
- [ ] Database extensions enabled (PostGIS, TimescaleDB, uuid-ossp)
- [ ] Database connection pool configured
- [ ] Database performance tuning completed
- [ ] Seed data prepared (if needed)

### 4. Security Review

- [ ] SSL/TLS certificates installed and valid
- [ ] HTTPS enforced for all endpoints
- [ ] Authentication mechanisms tested
- [ ] Authorization rules verified
- [ ] Password policies enforced
- [ ] Rate limiting configured
- [ ] CORS policies reviewed
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] Secrets management system in place
- [ ] API keys secured in environment variables
- [ ] Database credentials secured
- [ ] Audit logging enabled

### 5. Infrastructure Readiness

- [ ] Production servers provisioned
- [ ] Load balancer configured
- [ ] Auto-scaling policies defined
- [ ] CDN configured for static assets
- [ ] DNS records configured
- [ ] Firewall rules configured
- [ ] Network security groups configured
- [ ] Backup systems configured
- [ ] Disaster recovery plan documented
- [ ] Monitoring infrastructure ready

### 6. Monitoring & Logging

- [ ] Prometheus metrics configured
- [ ] Grafana dashboards created
- [ ] Alert rules configured
- [ ] Alert notification channels tested
- [ ] Centralized logging configured (ELK/Loki)
- [ ] Log retention policies set
- [ ] Error tracking configured (Sentry/similar)
- [ ] APM tools configured (if using)
- [ ] Health check endpoints verified
- [ ] Uptime monitoring configured

### 7. Documentation

- [ ] API documentation up to date
- [ ] Deployment guide reviewed
- [ ] Runbook created for common issues
- [ ] Architecture diagrams updated
- [ ] Service dependency map current
- [ ] Environment variable documentation complete
- [ ] Troubleshooting guide available
- [ ] Contact information for on-call team documented

### 8. Stakeholder Communication

- [ ] Deployment window scheduled and communicated
- [ ] Stakeholders notified of deployment
- [ ] Maintenance page prepared (if needed)
- [ ] Status page updated
- [ ] Support team briefed on changes
- [ ] Customer communication prepared (if needed)

---

## Deployment Steps

### Phase 1: Pre-Deployment (T-60 minutes)

#### Step 1.1: Final Verification
```bash
# Verify all tests pass
cd backend
pytest tests/ -v

# Verify frontend builds successfully
cd ../frontend
npm run build

# Verify Docker images build
docker-compose build
```

#### Step 1.2: Backup Current State
```bash
# Backup database
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup configuration files
tar -czf config_backup_$(date +%Y%m%d_%H%M%S).tar.gz backend/.env frontend/.env.local

# Tag current production version
git tag -a v$(date +%Y%m%d_%H%M%S) -m "Pre-deployment backup"
git push origin --tags
```

#### Step 1.3: Enable Maintenance Mode (if applicable)
```bash
# Display maintenance page
# This depends on your infrastructure setup
# Example for nginx:
# cp maintenance.html /var/www/html/index.html
```

### Phase 2: Database Migration (T-45 minutes)

#### Step 2.1: Apply Database Migrations
```bash
cd backend

# Verify migration status
python -c "from app.utils.migration_tracker import MigrationTracker; tracker = MigrationTracker(); print(tracker.get_migration_status())"

# Run migrations
python -m app.utils.migration_runner

# Verify migrations applied successfully
python scripts/verify_database.py
```

#### Step 2.2: Verify Database State
```bash
# Check table count
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

# Verify critical tables exist
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"

# Check for any errors in logs
tail -n 100 /var/log/postgresql/postgresql.log
```

### Phase 3: Backend Deployment (T-30 minutes)

#### Step 3.1: Deploy Backend Application
```bash
# Pull latest code
git fetch origin
git checkout main
git pull origin main

# Install dependencies
cd backend
pip install -r requirements.txt

# Build Docker image (if using Docker)
docker build -t optibid-backend:latest .

# Or deploy to Kubernetes
kubectl apply -f kubernetes/k8s-backend-deployment.yaml
```

#### Step 3.2: Start Backend Services
```bash
# Start backend (Docker Compose)
docker-compose up -d backend

# Or start with systemd
systemctl restart optibid-backend

# Or start with PM2
pm2 restart optibid-backend
```

#### Step 3.3: Verify Backend Health
```bash
# Wait for backend to start
sleep 30

# Check health endpoint
curl -f http://localhost:8000/health || echo "Health check failed"

# Verify service status
curl http://localhost:8000/health | jq '.services'

# Check logs for errors
docker-compose logs backend --tail=100
# Or: journalctl -u optibid-backend -n 100
```

### Phase 4: Frontend Deployment (T-15 minutes)

#### Step 4.1: Build Frontend
```bash
cd frontend

# Install dependencies
npm ci

# Build production bundle
npm run build

# Verify build output
ls -lh .next/
```

#### Step 4.2: Deploy Frontend
```bash
# Deploy to Docker
docker build -t optibid-frontend:latest .
docker-compose up -d frontend

# Or deploy to Kubernetes
kubectl apply -f kubernetes/k8s-frontend-deployment.yaml

# Or deploy static files to CDN
aws s3 sync .next/static s3://optibid-static/
```

#### Step 4.3: Verify Frontend
```bash
# Check frontend is accessible
curl -f http://localhost:3000 || echo "Frontend not accessible"

# Verify static assets load
curl -I http://localhost:3000/_next/static/css/main.css

# Check logs
docker-compose logs frontend --tail=100
```

### Phase 5: Service Verification (T-10 minutes)

#### Step 5.1: Verify All Services
```bash
# Check all containers are running
docker-compose ps

# Verify database connectivity
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1;"

# Verify Redis (if using)
redis-cli -h $REDIS_HOST ping

# Verify Kafka (if using)
kafka-topics.sh --bootstrap-server $KAFKA_HOST:9092 --list

# Verify ClickHouse (if using)
curl http://$CLICKHOUSE_HOST:8123/ping
```

#### Step 5.2: Test Critical Endpoints
```bash
# Test authentication
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'

# Test market data endpoint
curl http://localhost:8000/api/market-data/latest

# Test WebSocket connection
wscat -c ws://localhost:8000/api/ws/ws/market/PJM
```

#### Step 5.3: Verify Monitoring
```bash
# Check Prometheus is scraping metrics
curl http://localhost:9090/api/v1/targets

# Verify Grafana dashboards load
curl -f http://localhost:3001/api/health

# Test alert rules
curl http://localhost:9090/api/v1/rules
```

### Phase 6: Disable Maintenance Mode (T-5 minutes)

#### Step 6.1: Remove Maintenance Page
```bash
# Remove maintenance page
# rm /var/www/html/index.html

# Reload web server
# nginx -s reload
```

#### Step 6.2: Update Status Page
```bash
# Update status page to show all systems operational
# This depends on your status page provider
```

### Phase 7: Post-Deployment Monitoring (T+0 to T+60 minutes)

#### Step 7.1: Monitor Application Logs
```bash
# Watch backend logs
docker-compose logs -f backend

# Watch frontend logs
docker-compose logs -f frontend

# Watch for errors
docker-compose logs backend frontend | grep -i error
```

#### Step 7.2: Monitor Metrics
- [ ] Check CPU usage in Grafana
- [ ] Check memory usage in Grafana
- [ ] Check request rate and latency
- [ ] Check error rate
- [ ] Check database connection pool
- [ ] Check WebSocket connection count

#### Step 7.3: Monitor Alerts
- [ ] Verify no critical alerts firing
- [ ] Check alert notification channels
- [ ] Review any warnings

---

## Rollback Procedure

### When to Rollback

Initiate rollback if:
- Critical functionality is broken
- Error rate exceeds 5%
- Performance degradation > 50%
- Database corruption detected
- Security vulnerability introduced
- Stakeholder approval for rollback

### Rollback Steps

#### Step 1: Stop New Deployment
```bash
# Stop new services
docker-compose down

# Or scale down Kubernetes deployment
kubectl scale deployment optibid-backend --replicas=0
kubectl scale deployment optibid-frontend --replicas=0
```

#### Step 2: Restore Database (if migrations were applied)
```bash
# Stop application to prevent writes
docker-compose stop backend

# Restore database from backup
psql -h $DB_HOST -U $DB_USER -d $DB_NAME < backup_YYYYMMDD_HHMMSS.sql

# Verify restoration
python scripts/verify_database.py
```

#### Step 3: Revert to Previous Version
```bash
# Checkout previous version
git checkout <previous-tag>

# Or pull previous Docker images
docker pull optibid-backend:<previous-version>
docker pull optibid-frontend:<previous-version>

# Update docker-compose.yml to use previous versions
# Then restart services
docker-compose up -d
```

#### Step 4: Verify Rollback
```bash
# Check health endpoint
curl http://localhost:8000/health

# Verify frontend loads
curl http://localhost:3000

# Test critical functionality
# Run smoke tests
pytest backend/tests/test_critical_paths.py
```

#### Step 5: Communicate Rollback
- [ ] Notify stakeholders of rollback
- [ ] Update status page
- [ ] Document rollback reason
- [ ] Schedule post-mortem meeting

---

## Post-Deployment Verification

### Immediate Verification (T+0 to T+15 minutes)

#### Functional Tests
- [ ] User can log in successfully
- [ ] User can register new account
- [ ] Dashboard loads with real-time data
- [ ] Market data displays correctly
- [ ] Bid creation and submission works
- [ ] Asset management functions properly
- [ ] WebSocket connections establish successfully
- [ ] Real-time updates are received

#### Performance Tests
- [ ] API response times < 200ms (p95)
- [ ] Page load times < 3 seconds
- [ ] WebSocket latency < 100ms
- [ ] Database query times acceptable
- [ ] No memory leaks detected
- [ ] CPU usage within normal range

#### Security Tests
- [ ] HTTPS enforced
- [ ] Authentication required for protected endpoints
- [ ] Authorization rules enforced
- [ ] Rate limiting active
- [ ] CORS policies working
- [ ] Security headers present

### Short-term Verification (T+15 to T+60 minutes)

#### Monitoring Checks
- [ ] No error spikes in logs
- [ ] No unusual traffic patterns
- [ ] No memory leaks
- [ ] No database connection issues
- [ ] No WebSocket connection drops
- [ ] All services reporting healthy

#### User Experience
- [ ] No user-reported issues
- [ ] Support tickets within normal range
- [ ] User feedback positive
- [ ] No accessibility issues reported

### Long-term Verification (T+1 hour to T+24 hours)

#### Stability Checks
- [ ] Application stable over 24 hours
- [ ] No memory leaks over time
- [ ] No performance degradation
- [ ] No data integrity issues
- [ ] Backup jobs running successfully
- [ ] Scheduled tasks executing properly

#### Business Metrics
- [ ] User engagement metrics normal
- [ ] Transaction success rate normal
- [ ] Revenue metrics on track
- [ ] No unusual patterns in analytics

---

## Emergency Contacts

### On-Call Team
- **Primary On-Call:** [Name] - [Phone] - [Email]
- **Secondary On-Call:** [Name] - [Phone] - [Email]
- **Engineering Manager:** [Name] - [Phone] - [Email]

### Service Providers
- **Cloud Provider Support:** [Contact Info]
- **Database Support:** [Contact Info]
- **CDN Support:** [Contact Info]
- **Monitoring Support:** [Contact Info]

### Escalation Path
1. On-call engineer attempts resolution (15 minutes)
2. Escalate to secondary on-call (30 minutes)
3. Escalate to engineering manager (45 minutes)
4. Initiate rollback procedure (60 minutes)

---

## Post-Deployment Tasks

### Immediate (Within 24 hours)
- [ ] Document any issues encountered
- [ ] Update runbook with lessons learned
- [ ] Review monitoring alerts and adjust thresholds
- [ ] Verify all backup jobs completed
- [ ] Send deployment summary to stakeholders

### Short-term (Within 1 week)
- [ ] Conduct post-deployment retrospective
- [ ] Update deployment documentation
- [ ] Address any technical debt introduced
- [ ] Review and optimize performance
- [ ] Update capacity planning

### Long-term (Within 1 month)
- [ ] Analyze deployment metrics
- [ ] Identify process improvements
- [ ] Update disaster recovery procedures
- [ ] Review and update monitoring
- [ ] Plan next deployment cycle

---

## Deployment Sign-off

### Pre-Deployment Approval
- [ ] **Engineering Lead:** _________________ Date: _______
- [ ] **DevOps Lead:** _________________ Date: _______
- [ ] **Security Lead:** _________________ Date: _______
- [ ] **Product Manager:** _________________ Date: _______

### Post-Deployment Verification
- [ ] **Deployment Engineer:** _________________ Date: _______
- [ ] **QA Lead:** _________________ Date: _______
- [ ] **Operations Manager:** _________________ Date: _______

---

## Notes

Use this section to document any deployment-specific notes, issues encountered, or deviations from the standard procedure.

**Deployment Date:** _________________  
**Deployment Engineer:** _________________  
**Version Deployed:** _________________

**Notes:**
```
