# OptiBid Energy Platform - Service Dependencies

This document provides a comprehensive overview of all services, their dependencies, interactions, and configuration details.

## Table of Contents

1. [Service Architecture Diagram](#service-architecture-diagram)
2. [Service Details](#service-details)
3. [Service Interactions](#service-interactions)
4. [Port Reference](#port-reference)
5. [Dependency Matrix](#dependency-matrix)

---

## Service Architecture Diagram

### Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          OptiBid Energy Platform                             │
└─────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────┐
                                    │  Users   │
                                    └────┬─────┘
                                         │
                                         │ HTTPS/WSS
                                         │
                    ┌────────────────────▼────────────────────┐
                    │      Load Balancer / Nginx              │
                    │         (Production Only)               │
                    │         Port 80/443                     │
                    └────────────┬───────────┬────────────────┘
                                 │           │
                    ┌────────────▼───┐   ┌───▼────────────┐
                    │   Frontend     │   │   Backend      │
                    │   (Next.js)    │   │   (FastAPI)    │
                    │   Port 3000    │   │   Port 8000    │
                    │   [REQUIRED]   │   │   [REQUIRED]   │
                    └────────────────┘   └───┬────────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    │                        │                        │
        ┌───────────▼──────────┐  ┌─────────▼────────┐  ┌───────────▼──────────┐
        │    PostgreSQL        │  │      Redis       │  │       Kafka          │
        │    Port 5432         │  │    Port 6379     │  │     Port 9092        │
        │    [REQUIRED]        │  │    [OPTIONAL]    │  │     [OPTIONAL]       │
        │                      │  │                  │  │                      │
        │  - User data         │  │  - Caching       │  │  - Market data       │
        │  - Market data       │  │  - Sessions      │  │    streaming         │
        │  - Bids              │  │  - WebSocket     │  │  - Event bus         │
        │  - Assets            │  │    state         │  │                      │
        │  - Organizations     │  │  - Rate limiting │  │  + Zookeeper         │
        │                      │  │                  │  │    Port 2181         │
        └──────────────────────┘  └──────────────────┘  └──────────────────────┘

        ┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
        │    ClickHouse        │  │     MLflow       │  │       MinIO          │
        │    Port 8123         │  │    Port 5000     │  │     Port 9001        │
        │    [OPTIONAL]        │  │    [OPTIONAL]    │  │     [OPTIONAL]       │
        │                      │  │                  │  │                      │
        │  - Analytics         │  │  - ML models     │  │  - Backups           │
        │  - OLAP queries      │  │  - Experiments   │  │  - File storage      │
        │  - Time-series       │  │  - Tracking      │  │  - S3-compatible     │
        │    aggregation       │  │                  │  │                      │
        └──────────────────────┘  └──────────────────┘  └──────────────────────┘

                    ┌────────────────────────────────────┐
                    │      External Services             │
                    │      [ALL OPTIONAL]                │
                    ├────────────────────────────────────┤
                    │  - Google Maps API                 │
                    │  - POSOCO API (Indian market)      │
                    │  - Weather API                     │
                    │  - Email (SMTP)                    │
                    │  - SSO Providers (Azure, Okta)     │
                    │  - Payment (Stripe, Razorpay)      │
                    │  - Monitoring (Sentry, Prometheus) │
                    └────────────────────────────────────┘
```

### Minimal Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│         Minimal Deployment (Development)              │
└──────────────────────────────────────────────────────┘

        ┌────────────────┐         ┌────────────────┐
        │   Frontend     │◄───────►│   Backend      │
        │   (Next.js)    │  HTTP   │   (FastAPI)    │
        │   Port 3000    │  WS     │   Port 8000    │
        └────────────────┘         └────────┬───────┘
                                            │
                                            │
                                   ┌────────▼────────┐
                                   │   PostgreSQL    │
                                   │   Port 5432     │
                                   │   [REQUIRED]    │
                                   └─────────────────┘

Features Available:
✅ Authentication
✅ CRUD operations
✅ Market data (simulated)
✅ Bidding
✅ WebSocket (in-memory)

Features Unavailable:
❌ Caching
❌ Real-time streaming
❌ Analytics
❌ ML features
```

### Production Deployment Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    Production Deployment                                  │
└──────────────────────────────────────────────────────────────────────────┘

                            ┌──────────────────┐
                            │  Load Balancer   │
                            │   (Nginx/ALB)    │
                            │   Port 80/443    │
                            └────────┬─────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
        ┌───────────▼──────────┐         ┌───────────▼──────────┐
        │   Frontend Cluster   │         │   Backend Cluster    │
        │   (Multiple Pods)    │         │   (Multiple Pods)    │
        │   Auto-scaling       │         │   Auto-scaling       │
        └──────────────────────┘         └───────────┬──────────┘
                                                     │
                    ┌────────────────────────────────┼────────────────────┐
                    │                                │                    │
        ┌───────────▼──────────┐      ┌──────────────▼──────┐  ┌─────────▼────────┐
        │  PostgreSQL Primary  │      │   Redis Cluster     │  │  Kafka Cluster   │
        │  + Read Replicas     │      │   (3+ nodes)        │  │  (3+ brokers)    │
        │  (Managed Service)   │      │   (Managed Service) │  │  (Managed)       │
        └──────────────────────┘      └─────────────────────┘  └──────────────────┘

        ┌──────────────────────┐      ┌─────────────────────┐  ┌──────────────────┐
        │  ClickHouse Cluster  │      │   MLflow Server     │  │   S3 Storage     │
        │  (Managed Service)   │      │   (Managed)         │  │   (AWS/GCS)      │
        └──────────────────────┘      └─────────────────────┘  └──────────────────┘

        ┌──────────────────────────────────────────────────────────────────────┐
        │                    Monitoring & Observability                         │
        ├──────────────────────────────────────────────────────────────────────┤
        │  Prometheus  │  Grafana  │  Sentry  │  ELK Stack  │  CloudWatch      │
        └──────────────────────────────────────────────────────────────────────┘
```

---

## Service Details

### 1. Frontend (Next.js)

**Status:** REQUIRED  
**Port:** 3000  
**Protocol:** HTTP/HTTPS, WebSocket  
**Purpose:** User interface and client-side application

**Dependencies:**
- Backend API (Port 8000) - REQUIRED
- WebSocket service (Port 8000) - OPTIONAL

**Configuration:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

**Resource Requirements:**
- CPU: 0.5-1 core
- Memory: 512MB-1GB
- Disk: 500MB

**Health Check:**
```bash
curl http://localhost:3000
```

---

### 2. Backend (FastAPI)

**Status:** REQUIRED  
**Port:** 8000  
**Protocol:** HTTP/HTTPS, WebSocket  
**Purpose:** REST API, business logic, WebSocket server

**Dependencies:**
- PostgreSQL (Port 5432) - REQUIRED
- Redis (Port 6379) - OPTIONAL
- Kafka (Port 9092) - OPTIONAL
- ClickHouse (Port 8123) - OPTIONAL
- MLflow (Port 5000) - OPTIONAL

**Configuration:**
```bash
DATABASE_URL=postgresql+asyncpg://...
ENABLE_REDIS=true/false
ENABLE_KAFKA=true/false
ENABLE_CLICKHOUSE=true/false
ENABLE_MLFLOW=true/false
```

**Resource Requirements:**
- CPU: 1-2 cores
- Memory: 1-2GB
- Disk: 1GB

**Health Check:**
```bash
curl http://localhost:8000/health
```

**Graceful Degradation:**
- Without Redis: Uses in-memory caching (slower)
- Without Kafka: Uses polling for market data
- Without ClickHouse: Analytics unavailable
- Without MLflow: ML features unavailable

---

### 3. PostgreSQL

**Status:** REQUIRED  
**Port:** 5432  
**Protocol:** PostgreSQL wire protocol  
**Purpose:** Primary data store

**Dependencies:** None

**Configuration:**
```bash
DATABASE_URL=postgresql+asyncpg://optibid:password@localhost:5432/optibid
```

**Resource Requirements:**
- CPU: 2-4 cores
- Memory: 2-4GB
- Disk: 20GB+ (depends on data volume)

**Extensions Required:**
- uuid-ossp
- PostGIS (optional, for geospatial features)
- TimescaleDB (optional, for time-series optimization)

**Health Check:**
```bash
psql -U optibid -d optibid -c "SELECT 1"
```

**Backup Strategy:**
- Automated daily backups
- Point-in-time recovery
- Replication for high availability

---

### 4. Redis

**Status:** OPTIONAL (Recommended for production)  
**Port:** 6379  
**Protocol:** Redis protocol  
**Purpose:** Caching, session management, WebSocket state

**Dependencies:** None

**Configuration:**
```bash
ENABLE_REDIS=true
REDIS_URL=redis://localhost:6379/0
```

**Resource Requirements:**
- CPU: 0.5-1 core
- Memory: 512MB-2GB
- Disk: 1GB (for persistence)

**Health Check:**
```bash
redis-cli ping
```

**Impact if Unavailable:**
- Slower API responses (no caching)
- WebSocket state stored in-memory (lost on restart)
- Session management uses database (slower)
- Rate limiting uses in-memory (not distributed)

**Persistence:**
- RDB snapshots: Every 15 minutes
- AOF: Append-only file for durability

---

### 5. Kafka

**Status:** OPTIONAL  
**Port:** 9092 (Kafka), 2181 (Zookeeper)  
**Protocol:** Kafka protocol  
**Purpose:** Real-time market data streaming, event bus

**Dependencies:**
- Zookeeper (Port 2181) - REQUIRED for Kafka

**Configuration:**
```bash
ENABLE_KAFKA=true
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_TOPIC_PREFIX=optibid
```

**Resource Requirements:**
- CPU: 2-4 cores
- Memory: 2-4GB
- Disk: 10GB+ (depends on retention)

**Health Check:**
```bash
kafka-topics.sh --list --bootstrap-server localhost:9092
```

**Impact if Unavailable:**
- Market data polled periodically instead of streamed
- Higher latency for market updates
- No event-driven architecture

**Topics:**
- `optibid.market.prices` - Real-time price updates
- `optibid.market.alerts` - Market alerts
- `optibid.bids.events` - Bid lifecycle events

---

### 6. ClickHouse

**Status:** OPTIONAL  
**Port:** 8123 (HTTP), 9000 (Native)  
**Protocol:** HTTP, ClickHouse native  
**Purpose:** OLAP analytics, time-series aggregation

**Dependencies:** None

**Configuration:**
```bash
ENABLE_CLICKHOUSE=true
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_USER=default
CLICKHOUSE_DATABASE=optibid_analytics
```

**Resource Requirements:**
- CPU: 2-4 cores
- Memory: 4-8GB
- Disk: 20GB+ (depends on analytics data)

**Health Check:**
```bash
curl http://localhost:8123/ping
```

**Impact if Unavailable:**
- Advanced analytics features unavailable
- Slower aggregation queries (falls back to PostgreSQL)
- No real-time KPIs

**Use Cases:**
- Market analytics
- Anomaly detection
- Cross-market correlation
- Performance metrics

---

### 7. MLflow

**Status:** OPTIONAL  
**Port:** 5000  
**Protocol:** HTTP  
**Purpose:** ML model tracking, versioning, deployment

**Dependencies:**
- PostgreSQL (for metadata) - Uses main database
- MinIO or S3 (for artifacts) - OPTIONAL

**Configuration:**
```bash
ENABLE_MLFLOW=true
MLFLOW_TRACKING_URI=http://localhost:5000
MLFLOW_EXPERIMENT_NAME=optibid_forecasting
MODELS_DIR=./models
```

**Resource Requirements:**
- CPU: 1-2 cores
- Memory: 1-2GB
- Disk: 5GB+ (for model artifacts)

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Impact if Unavailable:**
- ML model management unavailable
- Forecasting features unavailable
- No model versioning

**Supported Models:**
- TFT (Temporal Fusion Transformer)
- N-BEATS
- DeepAR

---

### 8. MinIO

**Status:** OPTIONAL  
**Port:** 9000 (API), 9001 (Console)  
**Protocol:** S3-compatible HTTP  
**Purpose:** Object storage for backups and file uploads

**Dependencies:** None

**Configuration:**
```bash
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
S3_BACKUP_BUCKET=optibid-backups
```

**Resource Requirements:**
- CPU: 0.5-1 core
- Memory: 512MB-1GB
- Disk: 50GB+ (depends on backup size)

**Health Check:**
```bash
curl http://localhost:9000/minio/health/live
```

**Impact if Unavailable:**
- Automated backups unavailable
- File uploads use local filesystem
- No S3-compatible storage

---

## Service Interactions

### Data Flow Diagrams

#### User Authentication Flow

```
User → Frontend → Backend → PostgreSQL
                     ↓
                   Redis (session cache)
                     ↓
                   JWT Token → Frontend
```

#### Real-time Market Data Flow

```
External API → Kafka → Backend → WebSocket → Frontend
                         ↓
                    PostgreSQL (historical)
                         ↓
                    ClickHouse (analytics)
```

#### Bid Submission Flow

```
User → Frontend → Backend → PostgreSQL (store bid)
                     ↓
                   Kafka (bid event)
                     ↓
                   WebSocket (notify users)
```

#### Analytics Query Flow

```
User → Frontend → Backend → ClickHouse (fast aggregation)
                     ↓
                   Redis (cache result)
                     ↓
                   Frontend (display)
```

---

## Port Reference

| Service | Port(s) | Protocol | Status | Purpose |
|---------|---------|----------|--------|---------|
| Frontend | 3000 | HTTP/WS | REQUIRED | User interface |
| Backend | 8000 | HTTP/WS | REQUIRED | API server |
| PostgreSQL | 5432 | PostgreSQL | REQUIRED | Database |
| Redis | 6379 | Redis | OPTIONAL | Cache/Sessions |
| Kafka | 9092 | Kafka | OPTIONAL | Streaming |
| Zookeeper | 2181 | Zookeeper | OPTIONAL | Kafka coordination |
| ClickHouse | 8123, 9000 | HTTP/Native | OPTIONAL | Analytics |
| MLflow | 5000 | HTTP | OPTIONAL | ML tracking |
| MinIO | 9000, 9001 | HTTP/S3 | OPTIONAL | Object storage |
| Prometheus | 9090 | HTTP | OPTIONAL | Metrics |
| Grafana | 3001 | HTTP | OPTIONAL | Dashboards |

---

## Dependency Matrix

### Service Dependencies

| Service | Depends On | Optional Dependencies | Can Run Without |
|---------|------------|----------------------|-----------------|
| Frontend | Backend | - | All optional services |
| Backend | PostgreSQL | Redis, Kafka, ClickHouse, MLflow | All optional services |
| PostgreSQL | - | - | All other services |
| Redis | - | - | All other services |
| Kafka | Zookeeper | - | All other services |
| ClickHouse | - | - | All other services |
| MLflow | PostgreSQL | MinIO/S3 | All other services |
| MinIO | - | - | All other services |

### Feature Dependencies

| Feature | Required Services | Optional Services | Fallback Behavior |
|---------|------------------|-------------------|-------------------|
| User Authentication | Backend, PostgreSQL | Redis | Sessions in database |
| Market Data Viewing | Backend, PostgreSQL | Redis, Kafka | Polling instead of streaming |
| Real-time Updates | Backend, WebSocket | Redis | In-memory state |
| Bid Management | Backend, PostgreSQL | Redis, Kafka | No real-time notifications |
| Analytics | Backend, PostgreSQL | ClickHouse, Redis | Slower queries on PostgreSQL |
| ML Forecasting | Backend, PostgreSQL | MLflow, MinIO | Feature unavailable |
| File Uploads | Backend | MinIO | Local filesystem |
| Backups | PostgreSQL | MinIO/S3 | Manual backups only |

---

## Network Diagram

### Development Environment

```
┌─────────────────────────────────────────────────────────┐
│                    localhost                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend:3000 ←→ Backend:8000 ←→ PostgreSQL:5432       │
│                        ↓                                 │
│                   Redis:6379 (optional)                  │
│                        ↓                                 │
│                   Kafka:9092 (optional)                  │
│                        ↓                                 │
│                ClickHouse:8123 (optional)                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Production Environment

```
┌─────────────────────────────────────────────────────────────┐
│                    Public Internet                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS/WSS
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  DMZ (Demilitarized Zone)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Load Balancer:443 → Frontend:3000, Backend:8000            │
│                                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Internal Network
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Private Network                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PostgreSQL:5432 (Primary + Replicas)                       │
│  Redis:6379 (Cluster)                                       │
│  Kafka:9092 (Cluster)                                       │
│  ClickHouse:8123 (Cluster)                                  │
│  MLflow:5000                                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Scenarios

### Scenario 1: Minimal (Development)
**Services:** Frontend, Backend, PostgreSQL  
**Use Case:** Local development, testing  
**Cost:** Free  
**Setup Time:** 15 minutes

### Scenario 2: Standard (Staging)
**Services:** Frontend, Backend, PostgreSQL, Redis  
**Use Case:** Staging environment, integration testing  
**Cost:** Low  
**Setup Time:** 30 minutes

### Scenario 3: Full (Development)
**Services:** All services  
**Use Case:** Full feature development, ML development  
**Cost:** Medium  
**Setup Time:** 1 hour (with Docker Compose)

### Scenario 4: Production
**Services:** All services (managed, clustered)  
**Use Case:** Production deployment  
**Cost:** High  
**Setup Time:** 1-2 days

---

## Monitoring & Health Checks

### Health Check Endpoints

```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000

# PostgreSQL
psql -U optibid -d optibid -c "SELECT 1"

# Redis
redis-cli ping

# Kafka
kafka-topics.sh --list --bootstrap-server localhost:9092

# ClickHouse
curl http://localhost:8123/ping

# MLflow
curl http://localhost:5000/health

# MinIO
curl http://localhost:9000/minio/health/live
```

### Monitoring Metrics

**Backend:**
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (%)
- Active connections

**Database:**
- Connection pool usage
- Query execution time
- Slow queries
- Disk usage

**Redis:**
- Hit rate (%)
- Memory usage
- Eviction rate
- Connection count

**Kafka:**
- Message throughput
- Consumer lag
- Partition count
- Disk usage

---

## Security Considerations

### Network Security

1. **Firewall Rules:**
   - Frontend: Allow 3000 from load balancer only
   - Backend: Allow 8000 from frontend only
   - Database: Allow 5432 from backend only
   - Redis: Allow 6379 from backend only

2. **Encryption:**
   - TLS for all external connections
   - Encrypted connections between services
   - Encrypted data at rest

3. **Authentication:**
   - JWT tokens for API authentication
   - Database password authentication
   - Redis password authentication
   - Service-to-service authentication

### Access Control

1. **Principle of Least Privilege:**
   - Each service has minimal required permissions
   - Separate database users for different services
   - Read-only replicas for analytics

2. **Network Segmentation:**
   - Public subnet: Load balancer
   - Private subnet: Application servers
   - Data subnet: Databases

---

## Scaling Guidelines

### Horizontal Scaling

**Frontend:**
- Add more instances behind load balancer
- Use CDN for static assets
- Target: 2-10 instances

**Backend:**
- Add more API server instances
- Use load balancer for distribution
- Target: 3-20 instances

**PostgreSQL:**
- Add read replicas for read-heavy workloads
- Use connection pooling (PgBouncer)
- Target: 1 primary + 2-5 replicas

**Redis:**
- Use Redis Cluster for horizontal scaling
- Shard data across multiple nodes
- Target: 3-6 nodes

**Kafka:**
- Add more brokers for throughput
- Increase partition count
- Target: 3-9 brokers

### Vertical Scaling

**Database:**
- Increase CPU for complex queries
- Increase memory for larger working set
- Increase disk for more data

**Redis:**
- Increase memory for larger cache
- Use Redis Enterprise for advanced features

**ClickHouse:**
- Increase CPU for faster aggregations
- Increase memory for larger datasets

---

## Disaster Recovery

### Backup Strategy

**PostgreSQL:**
- Automated daily backups
- Point-in-time recovery
- Backup retention: 30 days
- Cross-region replication

**Redis:**
- RDB snapshots every 15 minutes
- AOF for durability
- Backup to S3/MinIO

**Configuration:**
- Version control for all config files
- Automated config backups
- Infrastructure as Code (Terraform)

### Recovery Procedures

**Database Failure:**
1. Promote read replica to primary
2. Update backend connection string
3. Verify data integrity
4. Restore from backup if needed

**Service Failure:**
1. Check health endpoints
2. Review logs
3. Restart service
4. Scale horizontally if needed

**Complete System Failure:**
1. Restore from backups
2. Rebuild infrastructure
3. Verify all services
4. Run smoke tests

---

## Cost Optimization

### Development
- Use minimal deployment
- Single instance for each service
- No redundancy
- **Estimated Cost:** $0-50/month

### Staging
- Standard deployment
- Smaller instance sizes
- Limited redundancy
- **Estimated Cost:** $100-300/month

### Production
- Full deployment
- High availability
- Auto-scaling
- Monitoring
- **Estimated Cost:** $500-2000/month

### Cost Reduction Tips
1. Use managed services (reduces operational overhead)
2. Right-size instances (monitor and adjust)
3. Use spot instances for non-critical workloads
4. Implement auto-scaling (scale down during low usage)
5. Use caching effectively (reduce database load)
6. Optimize queries (reduce compute time)
7. Use CDN for static assets (reduce bandwidth)

---

## References

- [Deployment Scenarios](./DEPLOYMENT_SCENARIOS.md)
- [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)
- [Environment Variables](.env.example)
- [API Documentation](http://localhost:8000/api/docs)
