# OptiBid Energy Platform - Environment Configuration Guide

## Overview

This document provides comprehensive documentation for all environment variables used in the OptiBid Energy Platform backend. It explains which services are required vs optional, their purposes, and deployment scenarios.

## Quick Start

### Minimal Development Setup (PostgreSQL Only)

For basic development and testing, you only need PostgreSQL:

```bash
# Copy the .env file (already configured for minimal setup)
cp .env .env.local

# Start PostgreSQL (using Docker)
docker run -d \
  --name optibid-postgres \
  -e POSTGRES_USER=optibid \
  -e POSTGRES_PASSWORD=optibid_password_2025 \
  -e POSTGRES_DB=optibid \
  -p 5432:5432 \
  postgres:15

# Start the backend
python -m uvicorn app.main:app --reload
```

### Recommended Development Setup (PostgreSQL + Redis)

For better performance and real-time features:

```bash
# Update .env file
ENABLE_REDIS=true
ENABLE_WEBSOCKET=true

# Start Redis
docker run -d \
  --name optibid-redis \
  -p 6379:6379 \
  redis:7-alpine redis-server --requirepass redis_password_2025

# Start the backend
python -m uvicorn app.main:app --reload
```

## Service Categories

### Required Services

These services MUST be available for the application to function:

#### 1. PostgreSQL Database
- **Purpose**: Primary data store for all application data
- **Default**: `postgresql+asyncpg://optibid:optibid_password_2025@localhost:5432/optibid`
- **Environment Variable**: `DATABASE_URL`
- **Impact if unavailable**: Application will not start
- **Required Extensions**: PostGIS, TimescaleDB, uuid-ossp

### Optional Services

These services enhance functionality but are not required. The application will gracefully degrade if they are unavailable:

#### 2. Redis Cache
- **Purpose**: Caching, session management, WebSocket connection state
- **Default**: Disabled (`ENABLE_REDIS=false`)
- **Environment Variables**:
  - `ENABLE_REDIS`: Set to `true` to enable
  - `REDIS_URL`: Connection string (default: `redis://localhost:6379/0`)
- **Impact if unavailable**: 
  - Slower API response times (no caching)
  - In-memory session storage (lost on restart)
  - WebSocket state stored in memory
- **Recommended for**: Production deployments, real-time features

#### 3. WebSocket Service
- **Purpose**: Real-time market data updates, live bidding
- **Default**: Disabled (`ENABLE_WEBSOCKET=false`)
- **Environment Variable**: `ENABLE_WEBSOCKET`
- **Impact if unavailable**: 
  - Clients must poll for updates
  - No real-time notifications
- **Recommended for**: Trading platforms, real-time dashboards

#### 4. Kafka Streaming
- **Purpose**: Real-time market data ingestion and streaming
- **Default**: Disabled (`ENABLE_KAFKA=false`)
- **Environment Variables**:
  - `ENABLE_KAFKA`: Set to `true` to enable
  - `KAFKA_BOOTSTRAP_SERVERS`: Kafka brokers (default: `localhost:9092`)
  - `KAFKA_TOPIC_PREFIX`: Topic prefix (default: `optibid`)
- **Impact if unavailable**: 
  - Market data polled periodically instead of streamed
  - Higher latency for market updates
- **Recommended for**: High-frequency trading, real-time analytics

#### 5. ClickHouse Analytics
- **Purpose**: High-performance OLAP analytics and reporting
- **Default**: Disabled (`ENABLE_CLICKHOUSE=false`)
- **Environment Variables**:
  - `ENABLE_CLICKHOUSE`: Set to `true` to enable
  - `CLICKHOUSE_HOST`: Server host (default: `localhost`)
  - `CLICKHOUSE_PORT`: Server port (default: `8123`)
  - `CLICKHOUSE_USER`: Username (default: `default`)
  - `CLICKHOUSE_PASSWORD`: Password
  - `CLICKHOUSE_DATABASE`: Database name (default: `optibid_analytics`)
- **Impact if unavailable**: 
  - Advanced analytics features unavailable
  - Analytics queries fall back to PostgreSQL (slower)
- **Recommended for**: Enterprise deployments, advanced analytics

#### 6. MLflow Model Management
- **Purpose**: ML model tracking, versioning, and deployment
- **Default**: Disabled (`ENABLE_MLFLOW=false`)
- **Environment Variables**:
  - `ENABLE_MLFLOW`: Set to `true` to enable
  - `MLFLOW_TRACKING_URI`: MLflow server (default: `http://localhost:5000`)
  - `MLFLOW_EXPERIMENT_NAME`: Experiment name (default: `optibid_forecasting`)
  - `MODELS_DIR`: Model storage directory (default: `./models`)
- **Impact if unavailable**: 
  - ML model management features unavailable
  - Cannot track model performance or versions
- **Recommended for**: AI/ML features, forecasting

## Environment Variables Reference

### Core Application Settings

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PROJECT_NAME` | No | `OptiBid Energy Platform` | Application name |
| `VERSION` | No | `1.0.0` | Application version |
| `ENVIRONMENT` | Yes | `development` | Environment: development, staging, production |
| `DEBUG` | No | `false` | Enable debug mode (set to false in production) |
| `HOST` | No | `0.0.0.0` | Server host |
| `PORT` | No | `8000` | Server port |
| `BASE_URL` | No | `http://localhost:8000` | Base URL for callbacks and webhooks |
| `ALLOWED_HOSTS` | Yes | `localhost,127.0.0.1,0.0.0.0` | Allowed hosts for CORS |

### Security Settings

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | Yes | (must be set) | Secret key for JWT signing and encryption |
| `ALGORITHM` | No | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `30` | JWT access token expiration (minutes) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | `7` | JWT refresh token expiration (days) |
| `SESSION_TIMEOUT_MINUTES` | No | `30` | Session timeout (minutes) |
| `MAX_CONCURRENT_SESSIONS` | No | `5` | Maximum concurrent sessions per user |
| `TRUSTED_DEVICE_DAYS` | No | `30` | Trusted device duration (days) |
| `SECURITY_HEADERS_ENABLED` | No | `true` | Enable security headers |
| `HSTS_MAX_AGE` | No | `31536000` | HSTS max age (seconds) |
| `CSP_ENABLED` | No | `true` | Enable Content Security Policy |

### Database Settings

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | (must be set) | PostgreSQL connection string |

### Optional Service Flags

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENABLE_REDIS` | No | `false` | Enable Redis caching |
| `ENABLE_WEBSOCKET` | No | `false` | Enable WebSocket real-time updates |
| `ENABLE_KAFKA` | No | `false` | Enable Kafka streaming |
| `ENABLE_CLICKHOUSE` | No | `false` | Enable ClickHouse analytics |
| `ENABLE_MLFLOW` | No | `false` | Enable MLflow model management |

### Redis Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | No | `redis://localhost:6379/0` | Redis connection string |

### Kafka Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `KAFKA_BOOTSTRAP_SERVERS` | No | `localhost:9092` | Kafka bootstrap servers |
| `KAFKA_TOPIC_PREFIX` | No | `optibid` | Kafka topic prefix |

### ClickHouse Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CLICKHOUSE_HOST` | No | `localhost` | ClickHouse server host |
| `CLICKHOUSE_PORT` | No | `8123` | ClickHouse server port |
| `CLICKHOUSE_USER` | No | `default` | ClickHouse username |
| `CLICKHOUSE_PASSWORD` | No | (empty) | ClickHouse password |
| `CLICKHOUSE_DATABASE` | No | `optibid_analytics` | ClickHouse database name |

### MLflow Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MLFLOW_TRACKING_URI` | No | `http://localhost:5000` | MLflow tracking server URI |
| `MLFLOW_EXPERIMENT_NAME` | No | `optibid_forecasting` | MLflow experiment name |
| `MODELS_DIR` | No | `./models` | Model storage directory |

### Feature Flags

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SIMULATION_MODE` | No | `true` | Enable market data simulation |
| `SIMULATION_INTERVAL` | No | `5` | Simulation interval (seconds) |

### Email Configuration (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SMTP_HOST` | No | (none) | SMTP server host |
| `SMTP_PORT` | No | `587` | SMTP server port |
| `SMTP_USERNAME` | No | (none) | SMTP username |
| `SMTP_PASSWORD` | No | (none) | SMTP password |
| `EMAIL_FROM` | No | `noreply@optibid.io` | From email address |

### External APIs (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_MAPS_API_KEY` | No | (none) | Google Maps API key |
| `OPENAI_API_KEY` | No | (none) | OpenAI API key |
| `WEATHER_API_KEY` | No | (none) | Weather API key |
| `MAPBOX_ACCESS_TOKEN` | No | (none) | Mapbox access token |
| `POSOCO_API_URL` | No | `https://prl.iposoco.in/api` | POSOCO API URL |
| `SLDC_API_KEY` | No | (none) | SLDC API key |

### Monitoring & Logging (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LOG_LEVEL` | No | `INFO` | Log level: DEBUG, INFO, WARNING, ERROR, CRITICAL |
| `SENTRY_DSN` | No | (none) | Sentry error tracking DSN |
| `PROMETHEUS_ENABLED` | No | `false` | Enable Prometheus metrics |
| `GRAFANA_ENABLED` | No | `false` | Enable Grafana dashboards |

### Rate Limiting (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RATE_LIMIT_ENABLED` | No | `true` | Enable rate limiting |
| `RATE_LIMIT_STORAGE` | No | `redis` | Rate limit storage: redis or memory |
| `RATE_LIMIT_DEFAULT_LIMIT_PER_HOUR` | No | `1000` | Default rate limit per hour |
| `RATE_LIMIT_DEFAULT_LIMIT_PER_DAY` | No | `10000` | Default rate limit per day |
| `RATE_LIMIT_BURST_LIMIT` | No | `100` | Burst limit for short-term spikes |

### SSO Configuration (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AZURE_AD_CLIENT_ID` | No | (none) | Azure AD client ID |
| `AZURE_AD_CLIENT_SECRET` | No | (none) | Azure AD client secret |
| `AZURE_AD_TENANT_ID` | No | (none) | Azure AD tenant ID |
| `OKTA_CLIENT_ID` | No | (none) | Okta client ID |
| `OKTA_CLIENT_SECRET` | No | (none) | Okta client secret |
| `OKTA_ISSUER` | No | (none) | Okta issuer URL |
| `GOOGLE_CLIENT_ID` | No | (none) | Google Workspace client ID |
| `GOOGLE_CLIENT_SECRET` | No | (none) | Google Workspace client secret |

### Multi-Factor Authentication (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TWILIO_ACCOUNT_SID` | No | (none) | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | No | (none) | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | No | (none) | Twilio phone number |
| `MFA_ISSUER_NAME` | No | `OptiBid Energy` | MFA issuer name |
| `MFA_BACKUP_CODES_COUNT` | No | `10` | Number of backup codes |
| `MFA_RATE_LIMIT_ATTEMPTS` | No | `5` | MFA rate limit attempts |
| `MFA_RATE_LIMIT_WINDOW_MINUTES` | No | `15` | MFA rate limit window (minutes) |

### Payment Processing (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STRIPE_PUBLIC_KEY` | No | (none) | Stripe public key |
| `STRIPE_SECRET_KEY` | No | (none) | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | No | (none) | Stripe webhook secret |
| `STRIPE_API_VERSION` | No | `2023-10-16` | Stripe API version |
| `RAZORPAY_KEY_ID` | No | (none) | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | No | (none) | Razorpay key secret |

### Cloud Storage & Backups (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AWS_ACCESS_KEY_ID` | No | (none) | AWS access key ID |
| `AWS_SECRET_ACCESS_KEY` | No | (none) | AWS secret access key |
| `AWS_REGION` | No | `us-east-1` | AWS region |
| `S3_BACKUP_BUCKET` | No | (none) | S3 backup bucket |
| `S3_BACKUP_REPLICATION_BUCKET` | No | (none) | S3 replication bucket |

### Compliance & Audit (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AUDIT_LOG_ENABLED` | No | `true` | Enable audit logging |
| `AUDIT_LOG_RETENTION_DAYS` | No | `2555` | Audit log retention (7 years) |
| `AUDIT_LOG_ENCRYPTED` | No | `true` | Encrypt audit logs |
| `SOC2_COMPLIANCE` | No | `false` | Enable SOC2 compliance mode |
| `GDPR_COMPLIANCE` | No | `false` | Enable GDPR compliance mode |
| `DATA_RETENTION_DAYS` | No | `2555` | Data retention period (7 years) |

## Deployment Scenarios

### Scenario 1: Minimal Development (PostgreSQL Only)

**Use Case**: Local development, testing, learning the platform

**Required Services**:
- PostgreSQL

**Configuration**:
```bash
DATABASE_URL=postgresql+asyncpg://optibid:optibid_password@localhost:5432/optibid
SECRET_KEY=dev-secret-key-change-in-production
ENVIRONMENT=development
DEBUG=true

# All optional services disabled (default)
ENABLE_REDIS=false
ENABLE_WEBSOCKET=false
ENABLE_KAFKA=false
ENABLE_CLICKHOUSE=false
ENABLE_MLFLOW=false
```

**Features Available**:
- User authentication and authorization
- Asset management
- Bid creation and submission
- Market data viewing (simulated or polled)
- Basic analytics

**Features Limited**:
- No real-time updates (must refresh page)
- Slower API responses (no caching)
- No advanced analytics
- No ML features

### Scenario 2: Recommended Development (PostgreSQL + Redis + WebSocket)

**Use Case**: Full-featured local development

**Required Services**:
- PostgreSQL
- Redis

**Configuration**:
```bash
DATABASE_URL=postgresql+asyncpg://optibid:optibid_password@localhost:5432/optibid
SECRET_KEY=dev-secret-key-change-in-production
ENVIRONMENT=development
DEBUG=true

# Enable Redis and WebSocket for better experience
ENABLE_REDIS=true
REDIS_URL=redis://localhost:6379/0
ENABLE_WEBSOCKET=true

# Other services remain disabled
ENABLE_KAFKA=false
ENABLE_CLICKHOUSE=false
ENABLE_MLFLOW=false
```

**Features Available**:
- All minimal features
- Real-time market data updates
- Fast API responses (caching)
- WebSocket notifications
- Session persistence

**Features Limited**:
- No advanced analytics (ClickHouse)
- No ML features (MLflow)
- No real-time streaming (Kafka)

### Scenario 3: Production Deployment (Standard)

**Use Case**: Production deployment for small to medium organizations

**Required Services**:
- PostgreSQL
- Redis

**Configuration**:
```bash
DATABASE_URL=postgresql+asyncpg://user:password@db.example.com:5432/optibid
SECRET_KEY=<generate-with-openssl-rand-hex-32>
ENVIRONMENT=production
DEBUG=false
BASE_URL=https://api.optibid.io

# Enable Redis and WebSocket
ENABLE_REDIS=true
REDIS_URL=redis://redis.example.com:6379/0
ENABLE_WEBSOCKET=true

# Email notifications
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=<sendgrid-api-key>
EMAIL_FROM=noreply@optibid.io

# Monitoring
SENTRY_DSN=<sentry-dsn>
LOG_LEVEL=INFO

# Security
SECURITY_HEADERS_ENABLED=true
HSTS_MAX_AGE=31536000
CSP_ENABLED=true

# Other services disabled
ENABLE_KAFKA=false
ENABLE_CLICKHOUSE=false
ENABLE_MLFLOW=false
```

**Features Available**:
- All development features
- Email notifications
- Error tracking
- Production-grade security
- High availability (with Redis cluster)

### Scenario 4: Enterprise Deployment (Full Stack)

**Use Case**: Large enterprise with advanced analytics and ML requirements

**Required Services**:
- PostgreSQL (with replication)
- Redis (cluster)
- Kafka (cluster)
- ClickHouse (cluster)
- MLflow

**Configuration**:
```bash
DATABASE_URL=postgresql+asyncpg://user:password@db-primary.example.com:5432/optibid
SECRET_KEY=<generate-with-openssl-rand-hex-32>
ENVIRONMENT=production
DEBUG=false
BASE_URL=https://api.optibid.io

# Enable all services
ENABLE_REDIS=true
REDIS_URL=redis://redis-cluster.example.com:6379/0

ENABLE_WEBSOCKET=true

ENABLE_KAFKA=true
KAFKA_BOOTSTRAP_SERVERS=kafka1.example.com:9092,kafka2.example.com:9092,kafka3.example.com:9092

ENABLE_CLICKHOUSE=true
CLICKHOUSE_HOST=clickhouse-cluster.example.com
CLICKHOUSE_PORT=8123
CLICKHOUSE_USER=optibid
CLICKHOUSE_PASSWORD=<secure-password>
CLICKHOUSE_DATABASE=optibid_analytics

ENABLE_MLFLOW=true
MLFLOW_TRACKING_URI=https://mlflow.example.com
MLFLOW_EXPERIMENT_NAME=optibid_forecasting

# SSO
AZURE_AD_CLIENT_ID=<client-id>
AZURE_AD_CLIENT_SECRET=<client-secret>
AZURE_AD_TENANT_ID=<tenant-id>

# MFA
TWILIO_ACCOUNT_SID=<account-sid>
TWILIO_AUTH_TOKEN=<auth-token>
TWILIO_PHONE_NUMBER=<phone-number>

# Payment Processing
STRIPE_SECRET_KEY=<stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<webhook-secret>

# Cloud Storage
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>
S3_BACKUP_BUCKET=optibid-backups
S3_BACKUP_REPLICATION_BUCKET=optibid-backups-replica

# Compliance
SOC2_COMPLIANCE=true
GDPR_COMPLIANCE=true
AUDIT_LOG_ENCRYPTED=true

# Monitoring
SENTRY_DSN=<sentry-dsn>
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true
```

**Features Available**:
- All features enabled
- Real-time streaming analytics
- Advanced ML forecasting
- Enterprise SSO
- Multi-factor authentication
- Payment processing
- Automated backups
- Compliance features
- Full observability

## Troubleshooting

### Backend Won't Start

**Symptom**: Backend hangs or fails to start

**Possible Causes**:
1. Required service (PostgreSQL) is not available
2. Optional service is enabled but not available
3. Invalid environment variable values

**Solutions**:
1. Check PostgreSQL is running: `docker ps | grep postgres`
2. Disable optional services if not needed:
   ```bash
   ENABLE_REDIS=false
   ENABLE_KAFKA=false
   ENABLE_CLICKHOUSE=false
   ENABLE_MLFLOW=false
   ```
3. Check logs for specific error messages
4. Verify DATABASE_URL is correct

### Slow API Responses

**Symptom**: API endpoints are slow to respond

**Possible Causes**:
1. Redis caching is disabled
2. Database queries are not optimized
3. No database indexes

**Solutions**:
1. Enable Redis caching:
   ```bash
   ENABLE_REDIS=true
   REDIS_URL=redis://localhost:6379/0
   ```
2. Check database query performance
3. Ensure database indexes are created

### WebSocket Not Working

**Symptom**: Real-time updates not appearing

**Possible Causes**:
1. WebSocket is disabled
2. Redis is unavailable (WebSocket state storage)
3. Client not connecting properly

**Solutions**:
1. Enable WebSocket:
   ```bash
   ENABLE_WEBSOCKET=true
   ```
2. Enable Redis for WebSocket state:
   ```bash
   ENABLE_REDIS=true
   ```
3. Check browser console for WebSocket errors
4. Verify WebSocket endpoint is accessible

### Analytics Features Not Available

**Symptom**: Analytics endpoints return errors

**Possible Causes**:
1. ClickHouse is disabled or unavailable
2. ClickHouse database not initialized

**Solutions**:
1. Enable ClickHouse:
   ```bash
   ENABLE_CLICKHOUSE=true
   CLICKHOUSE_HOST=localhost
   CLICKHOUSE_PORT=8123
   ```
2. Initialize ClickHouse database
3. Check ClickHouse logs for errors

## Security Best Practices

### Production Deployment

1. **Change SECRET_KEY**: Generate a secure random key
   ```bash
   openssl rand -hex 32
   ```

2. **Disable DEBUG**: Set `DEBUG=false` in production

3. **Use HTTPS**: Set `BASE_URL` to HTTPS endpoint

4. **Enable Security Headers**: 
   ```bash
   SECURITY_HEADERS_ENABLED=true
   HSTS_MAX_AGE=31536000
   CSP_ENABLED=true
   ```

5. **Configure CORS**: Set `ALLOWED_HOSTS` to specific domains

6. **Enable Rate Limiting**:
   ```bash
   RATE_LIMIT_ENABLED=true
   RATE_LIMIT_STORAGE=redis
   ```

7. **Use Strong Database Passwords**: Never use default passwords

8. **Enable Audit Logging**:
   ```bash
   AUDIT_LOG_ENABLED=true
   AUDIT_LOG_ENCRYPTED=true
   ```

9. **Configure MFA**: Enable multi-factor authentication for admin users

10. **Set Up Monitoring**: Configure Sentry for error tracking

## Support

For additional help:
- Check the main README.md for general documentation
- Review the API documentation at `/api/docs`
- Check application logs for error messages
- Consult the troubleshooting guide above

## Version History

- **v1.0.0** (2025-01-XX): Initial release with comprehensive environment configuration
