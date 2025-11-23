# OptiBid Energy Platform - Deployment Scenarios

This document provides detailed deployment guides for different scenarios, from minimal development setups to full enterprise production deployments.

## Table of Contents

1. [Minimal Deployment (PostgreSQL Only)](#minimal-deployment-postgresql-only)
2. [Standard Development Deployment](#standard-development-deployment)
3. [Full Development Deployment (All Services)](#full-development-deployment-all-services)
4. [Production Deployment](#production-deployment)
5. [Docker Compose Deployment](#docker-compose-deployment)
6. [Kubernetes Deployment](#kubernetes-deployment)

---

## Minimal Deployment (PostgreSQL Only)

**Use Case:** Quick local development, testing core features, CI/CD pipelines

**Services Required:**
- PostgreSQL (Port 5432)

**Services Optional:**
- All other services disabled

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

1. **Install PostgreSQL**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql@14
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**
   ```bash
   psql -U postgres
   CREATE DATABASE optibid;
   CREATE USER optibid WITH PASSWORD 'optibid_password';
   GRANT ALL PRIVILEGES ON DATABASE optibid TO optibid;
   \q
   ```

3. **Configure Environment**
   ```bash
   cd backend
   cp .env.example .env
   ```

4. **Edit `.env` file (minimal configuration)**
   ```bash
   # Required
   DATABASE_URL=postgresql+asyncpg://optibid:optibid_password@localhost:5432/optibid
   SECRET_KEY=your-secret-key-here-change-in-production
   
   # Optional services - all disabled
   ENABLE_REDIS=false
   ENABLE_KAFKA=false
   ENABLE_CLICKHOUSE=false
   ENABLE_MLFLOW=false
   
   # Development settings
   ENVIRONMENT=development
   DEBUG=true
   SIMULATION_MODE=true
   ```

5. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

6. **Run Migrations**
   ```bash
   # Migrations will run automatically on startup in development mode
   # Or run manually:
   python -m alembic upgrade head
   ```

7. **Start Backend**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   ```

3. **Edit `.env.local`**
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_WS_URL=ws://localhost:8000
   ```

4. **Start Frontend**
   ```bash
   npm run dev
   ```

### Verification

1. **Check Backend Health**
   ```bash
   curl http://localhost:8000/health
   ```
   
   Expected response:
   ```json
   {
     "status": "healthy",
     "services": {
       "database": "available",
       "redis": "unavailable",
       "kafka": "unavailable",
       "clickhouse": "unavailable"
     }
   }
   ```

2. **Access Frontend**
   - Open browser: http://localhost:3000
   - You should see the login page

### Features Available

✅ User authentication (login, registration)
✅ Basic CRUD operations
✅ Market data viewing (simulated)
✅ Bid creation and management
✅ Asset management
✅ WebSocket connections (in-memory state)

### Features Unavailable

❌ Redis caching (slower performance)
❌ Real-time Kafka streaming
❌ Advanced analytics (ClickHouse)
❌ ML model management (MLflow)

---

## Standard Development Deployment

**Use Case:** Full-featured local development with caching and real-time features

**Services Required:**
- PostgreSQL (Port 5432)
- Redis (Port 6379)

**Services Optional:**
- Kafka, ClickHouse, MLflow

### Additional Setup (Beyond Minimal)

1. **Install Redis**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install redis-server
   
   # macOS
   brew install redis
   
   # Windows
   # Download from https://github.com/microsoftarchive/redis/releases
   ```

2. **Start Redis**
   ```bash
   redis-server
   ```

3. **Update `.env`**
   ```bash
   ENABLE_REDIS=true
   REDIS_URL=redis://localhost:6379/0
   ```

4. **Restart Backend**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Additional Features Enabled

✅ Redis caching (improved performance)
✅ WebSocket state persistence
✅ Session management
✅ Rate limiting

---

## Full Development Deployment (All Services)

**Use Case:** Testing all features, ML development, analytics development

**Services Required:**
- PostgreSQL (Port 5432)
- Redis (Port 6379)
- Kafka (Port 9092)
- ClickHouse (Port 8123)
- MLflow (Port 5000)

### Using Docker Compose (Recommended)

See [Docker Compose Deployment](#docker-compose-deployment) section below.

### Manual Setup

1. **Install Kafka**
   ```bash
   # Download Kafka
   wget https://downloads.apache.org/kafka/3.6.0/kafka_2.13-3.6.0.tgz
   tar -xzf kafka_2.13-3.6.0.tgz
   cd kafka_2.13-3.6.0
   
   # Start Zookeeper
   bin/zookeeper-server-start.sh config/zookeeper.properties
   
   # Start Kafka (in new terminal)
   bin/kafka-server-start.sh config/server.properties
   ```

2. **Install ClickHouse**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install -y apt-transport-https ca-certificates dirmngr
   sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754
   echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee /etc/apt/sources.list.d/clickhouse.list
   sudo apt-get update
   sudo apt-get install -y clickhouse-server clickhouse-client
   
   # Start ClickHouse
   sudo service clickhouse-server start
   ```

3. **Install MLflow**
   ```bash
   pip install mlflow
   
   # Start MLflow server
   mlflow server --host 0.0.0.0 --port 5000
   ```

4. **Update `.env`**
   ```bash
   ENABLE_REDIS=true
   ENABLE_KAFKA=true
   ENABLE_CLICKHOUSE=true
   ENABLE_MLFLOW=true
   
   REDIS_URL=redis://localhost:6379/0
   KAFKA_BOOTSTRAP_SERVERS=localhost:9092
   CLICKHOUSE_HOST=localhost
   CLICKHOUSE_PORT=8123
   MLFLOW_TRACKING_URI=http://localhost:5000
   ```

5. **Restart Backend**

### All Features Enabled

✅ All minimal deployment features
✅ Redis caching
✅ Real-time Kafka streaming
✅ Advanced analytics (ClickHouse)
✅ ML model management (MLflow)
✅ Market data simulation
✅ Forecasting and predictions

---

## Production Deployment

**Use Case:** Production environment with high availability, security, and monitoring

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer (Nginx)                    │
│                         Port 80/443                          │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
┌────────▼────────┐             ┌───────▼────────┐
│   Frontend      │             │   Backend      │
│   (Next.js)     │             │   (FastAPI)    │
│   Multiple      │             │   Multiple     │
│   Instances     │             │   Instances    │
└─────────────────┘             └────────┬───────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
            ┌───────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐
            │  PostgreSQL  │     │    Redis    │     │    Kafka    │
            │   Primary    │     │   Cluster   │     │   Cluster   │
            │  + Replica   │     │             │     │             │
            └──────────────┘     └─────────────┘     └─────────────┘
```

### Prerequisites

- Kubernetes cluster OR VM infrastructure
- Domain name with SSL certificate
- Monitoring infrastructure (Prometheus, Grafana)
- Log aggregation (ELK stack or similar)
- Backup storage (S3 or equivalent)

### Production Configuration

1. **Environment Variables**
   ```bash
   # Application
   ENVIRONMENT=production
   DEBUG=false
   BASE_URL=https://api.optibid.io
   
   # Security
   SECRET_KEY=<strong-random-key-from-secrets-manager>
   ALLOWED_HOSTS=optibid.io,api.optibid.io
   SECURITY_HEADERS_ENABLED=true
   CSP_ENABLED=true
   
   # Database (managed service recommended)
   DATABASE_URL=postgresql+asyncpg://user:pass@db-primary.internal:5432/optibid
   
   # Redis (managed service recommended)
   ENABLE_REDIS=true
   REDIS_URL=redis://redis-cluster.internal:6379/0
   
   # Kafka (managed service recommended)
   ENABLE_KAFKA=true
   KAFKA_BOOTSTRAP_SERVERS=kafka-1.internal:9092,kafka-2.internal:9092,kafka-3.internal:9092
   
   # ClickHouse (optional, for analytics)
   ENABLE_CLICKHOUSE=true
   CLICKHOUSE_HOST=clickhouse.internal
   
   # Monitoring
   SENTRY_DSN=<your-sentry-dsn>
   PROMETHEUS_ENABLED=true
   LOG_LEVEL=INFO
   
   # Email
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USERNAME=<username>
   SMTP_PASSWORD=<password>
   EMAIL_FROM=noreply@optibid.io
   
   # Backups
   AWS_ACCESS_KEY_ID=<key-id>
   AWS_SECRET_ACCESS_KEY=<secret-key>
   S3_BACKUP_BUCKET=optibid-backups
   
   # Rate Limiting
   RATE_LIMIT_ENABLED=true
   RATE_LIMIT_STORAGE=redis
   
   # Compliance
   AUDIT_LOG_ENABLED=true
   AUDIT_LOG_ENCRYPTED=true
   SOC2_COMPLIANCE=true
   GDPR_COMPLIANCE=true
   ```

2. **Database Setup**
   - Use managed PostgreSQL service (AWS RDS, Google Cloud SQL, Azure Database)
   - Enable automated backups
   - Configure read replicas for scaling
   - Enable connection pooling (PgBouncer)
   - Set up monitoring and alerting

3. **Redis Setup**
   - Use managed Redis service (AWS ElastiCache, Google Memorystore, Azure Cache)
   - Enable persistence (AOF + RDB)
   - Configure cluster mode for high availability
   - Set up monitoring

4. **Application Deployment**
   - Use container orchestration (Kubernetes recommended)
   - Deploy multiple backend instances (minimum 3)
   - Deploy multiple frontend instances (minimum 2)
   - Configure health checks
   - Set up auto-scaling based on CPU/memory
   - Configure rolling updates with zero downtime

5. **Load Balancer Configuration**
   - SSL/TLS termination
   - HTTP/2 support
   - WebSocket support
   - Rate limiting
   - DDoS protection
   - Health check endpoints

6. **Monitoring & Alerting**
   - Prometheus for metrics collection
   - Grafana for visualization
   - Alert rules for:
     - High error rates
     - Slow response times
     - Service unavailability
     - High resource usage
     - Failed health checks

7. **Logging**
   - Centralized logging (ELK, Splunk, or CloudWatch)
   - Structured JSON logs
   - Log retention policy
   - Log-based alerting

8. **Backups**
   - Automated daily database backups
   - Backup retention: 30 days
   - Cross-region replication
   - Regular restore testing
   - Backup encryption

9. **Security**
   - WAF (Web Application Firewall)
   - DDoS protection
   - Regular security audits
   - Dependency vulnerability scanning
   - Secrets management (AWS Secrets Manager, HashiCorp Vault)
   - Network segmentation
   - Principle of least privilege

### Deployment Checklist

- [ ] SSL certificates configured
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Secrets stored securely
- [ ] Health checks passing
- [ ] Monitoring dashboards created
- [ ] Alert rules configured
- [ ] Backup system tested
- [ ] Load testing completed
- [ ] Security scan passed
- [ ] Documentation updated
- [ ] Rollback plan documented
- [ ] On-call rotation established

### Scaling Guidelines

**Horizontal Scaling:**
- Backend: Scale based on CPU (target 70%)
- Frontend: Scale based on requests/second
- Database: Use read replicas for read-heavy workloads

**Vertical Scaling:**
- Database: Increase instance size for write-heavy workloads
- Redis: Increase memory for larger cache

**Performance Targets:**
- API response time: < 200ms (p95)
- WebSocket latency: < 100ms
- Database query time: < 50ms (p95)
- Uptime: 99.9% (8.76 hours downtime/year)

---

## Docker Compose Deployment

**Use Case:** Quick setup with all services, development teams, demo environments

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd optibid-platform
   ```

2. **Configure Environment**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

3. **Edit `backend/.env`**
   ```bash
   DATABASE_URL=postgresql+asyncpg://optibid:optibid_password@postgres:5432/optibid
   REDIS_URL=redis://redis:6379/0
   KAFKA_BOOTSTRAP_SERVERS=kafka:9092
   CLICKHOUSE_HOST=clickhouse
   MLFLOW_TRACKING_URI=http://mlflow:5000
   
   ENABLE_REDIS=true
   ENABLE_KAFKA=true
   ENABLE_CLICKHOUSE=true
   ENABLE_MLFLOW=true
   ```

4. **Start All Services**
   ```bash
   docker-compose up -d
   ```

5. **View Logs**
   ```bash
   docker-compose logs -f
   ```

6. **Check Service Status**
   ```bash
   docker-compose ps
   ```

### Docker Compose File

The `docker-compose.yml` includes:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Kafka + Zookeeper (port 9092)
- ClickHouse (port 8123)
- MLflow (port 5000)
- Backend API (port 8000)
- Frontend (port 3000)

### Service URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs
- MLflow UI: http://localhost:5000
- ClickHouse: http://localhost:8123

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v
```

### Troubleshooting

**Services not starting:**
```bash
# Check logs
docker-compose logs <service-name>

# Restart specific service
docker-compose restart <service-name>

# Rebuild containers
docker-compose up -d --build
```

**Port conflicts:**
```bash
# Check what's using the port
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Change ports in docker-compose.yml
```

**Database connection issues:**
```bash
# Access PostgreSQL
docker-compose exec postgres psql -U optibid -d optibid

# Check database logs
docker-compose logs postgres
```

---

## Kubernetes Deployment

**Use Case:** Production-grade deployment with high availability and auto-scaling

### Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- Helm 3.0+
- Container registry access

### Deployment Steps

1. **Create Namespace**
   ```bash
   kubectl create namespace optibid-production
   ```

2. **Create Secrets**
   ```bash
   kubectl create secret generic optibid-secrets \
     --from-literal=database-url='postgresql+asyncpg://...' \
     --from-literal=secret-key='...' \
     --from-literal=redis-url='redis://...' \
     -n optibid-production
   ```

3. **Deploy Using Helm**
   ```bash
   cd kubernetes/helm/optibid
   helm install optibid . -n optibid-production
   ```

4. **Verify Deployment**
   ```bash
   kubectl get pods -n optibid-production
   kubectl get services -n optibid-production
   ```

5. **Access Application**
   ```bash
   # Get load balancer IP
   kubectl get svc optibid-frontend -n optibid-production
   ```

### Kubernetes Resources

The Helm chart includes:
- Deployments (backend, frontend)
- Services (ClusterIP, LoadBalancer)
- ConfigMaps (configuration)
- Secrets (sensitive data)
- Ingress (routing)
- HorizontalPodAutoscaler (auto-scaling)
- PersistentVolumeClaims (storage)

### Monitoring

```bash
# View logs
kubectl logs -f deployment/optibid-backend -n optibid-production

# Check resource usage
kubectl top pods -n optibid-production

# Describe pod
kubectl describe pod <pod-name> -n optibid-production
```

### Scaling

```bash
# Manual scaling
kubectl scale deployment optibid-backend --replicas=5 -n optibid-production

# Auto-scaling is configured via HPA
kubectl get hpa -n optibid-production
```

### Updates

```bash
# Rolling update
helm upgrade optibid . -n optibid-production

# Rollback
helm rollback optibid -n optibid-production
```

---

## Comparison Matrix

| Feature | Minimal | Standard Dev | Full Dev | Production |
|---------|---------|--------------|----------|------------|
| PostgreSQL | ✅ | ✅ | ✅ | ✅ |
| Redis | ❌ | ✅ | ✅ | ✅ |
| Kafka | ❌ | ❌ | ✅ | ✅ |
| ClickHouse | ❌ | ❌ | ✅ | ✅ |
| MLflow | ❌ | ❌ | ✅ | ✅ |
| Load Balancer | ❌ | ❌ | ❌ | ✅ |
| High Availability | ❌ | ❌ | ❌ | ✅ |
| Auto-scaling | ❌ | ❌ | ❌ | ✅ |
| Monitoring | ❌ | ❌ | ❌ | ✅ |
| Backups | ❌ | ❌ | ❌ | ✅ |
| SSL/TLS | ❌ | ❌ | ❌ | ✅ |

---

## Next Steps

After deployment:
1. Run health checks
2. Verify all services are running
3. Test authentication flow
4. Create test data
5. Monitor logs for errors
6. Set up monitoring dashboards
7. Configure backups
8. Document any customizations

For troubleshooting, see [TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)
