# Security Configuration Guide
## OptiBid Energy Platform

This guide provides detailed instructions for configuring security settings across different environments.

---

## Table of Contents

1. [Environment-Specific Configurations](#environment-specific-configurations)
2. [JWT Token Configuration](#jwt-token-configuration)
3. [CORS Configuration](#cors-configuration)
4. [Rate Limiting Configuration](#rate-limiting-configuration)
5. [Security Headers Configuration](#security-headers-configuration)
6. [Database Security](#database-security)
7. [MFA Configuration](#mfa-configuration)
8. [Secrets Management](#secrets-management)

---

## Environment-Specific Configurations

### Development Environment

**File:** `.env.development`

```bash
# Environment
ENVIRONMENT=development
DEBUG=true

# Security (Development Only - DO NOT USE IN PRODUCTION)
SECRET_KEY=dev-secret-key-change-me
JWT_SECRET_KEY=dev-jwt-secret-key

# Token Expiration (Longer for development convenience)
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30

# CORS (Allow localhost)
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,http://localhost:3000

# Database (Local)
DATABASE_URL=postgresql://optibid:optibid123@localhost:5432/optibid_db

# Redis (Optional in development)
ENABLE_REDIS=false
REDIS_URL=redis://localhost:6379/0

# Rate Limiting (Relaxed for development)
RATE_LIMIT_ENABLED=false
RATE_LIMIT_PER_MINUTE=1000
RATE_LIMIT_PER_HOUR=10000

# Logging
LOG_LEVEL=DEBUG

# Security Headers (Relaxed for development)
SECURITY_HEADERS_ENABLED=false

# MFA (Disabled in development)
MFA_RATE_LIMIT_ATTEMPTS=100

# Simulation Mode
SIMULATION_MODE=true
```

### Staging Environment

**File:** `.env.staging`

```bash
# Environment
ENVIRONMENT=staging
DEBUG=false

# Security (Use strong keys)
SECRET_KEY=<generate-with-openssl-rand-hex-32>
JWT_SECRET_KEY=<generate-with-openssl-rand-hex-32>

# Token Expiration (Production-like)
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS (Staging domains)
ALLOWED_HOSTS=https://staging.optibid.io,https://staging-api.optibid.io

# Database (Staging)
DATABASE_URL=postgresql://optibid_staging:STRONG_PASSWORD@staging-db.example.com:5432/optibid_staging?sslmode=require

# Redis (Required for staging)
ENABLE_REDIS=true
REDIS_URL=redis://staging-redis.example.com:6379/0

# Rate Limiting (Production-like)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=1000

# Logging
LOG_LEVEL=INFO

# Security Headers (Enabled)
SECURITY_HEADERS_ENABLED=true
HSTS_MAX_AGE=31536000
CSP_ENABLED=true

# MFA (Enabled)
MFA_RATE_LIMIT_ATTEMPTS=5
MFA_RATE_LIMIT_WINDOW_MINUTES=15

# Simulation Mode
SIMULATION_MODE=false
```

### Production Environment

**File:** `.env.production`

```bash
# Environment
ENVIRONMENT=production
DEBUG=false

# Security (CRITICAL: Use strong, unique keys)
SECRET_KEY=<generate-with-openssl-rand-hex-32>
JWT_SECRET_KEY=<generate-with-openssl-rand-hex-32>

# Token Expiration
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS (Production domains only)
ALLOWED_HOSTS=https://app.optibid.io,https://api.optibid.io,https://www.optibid.io

# Database (Production with SSL)
DATABASE_URL=postgresql://optibid_prod:STRONG_PASSWORD@prod-db.example.com:5432/optibid_prod?sslmode=require

# Redis (Required for production)
ENABLE_REDIS=true
REDIS_URL=redis://prod-redis.example.com:6379/0

# Rate Limiting (Strict)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=1000
RATE_LIMIT_STORAGE=redis

# Logging
LOG_LEVEL=WARNING
SENTRY_DSN=<your-sentry-dsn>

# Security Headers (Strict)
SECURITY_HEADERS_ENABLED=true
HSTS_MAX_AGE=31536000
CSP_ENABLED=true

# MFA (Strict)
MFA_RATE_LIMIT_ATTEMPTS=5
MFA_RATE_LIMIT_WINDOW_MINUTES=15

# Session Security
SESSION_TIMEOUT_MINUTES=30
MAX_CONCURRENT_SESSIONS=5
TRUSTED_DEVICE_DAYS=30

# Audit Logging
AUDIT_LOG_ENABLED=true
AUDIT_LOG_ENCRYPTED=true
AUDIT_LOG_RETENTION_DAYS=2555

# Compliance
SOC2_COMPLIANCE=true
GDPR_COMPLIANCE=true

# Backup
BACKUP_RETENTION_DAYS=30
CROSS_REGION_REPLICATION=true

# Simulation Mode
SIMULATION_MODE=false
```

---

## JWT Token Configuration

### Generating Secure Keys

```bash
# Generate SECRET_KEY
openssl rand -hex 32

# Generate JWT_SECRET_KEY (can be same as SECRET_KEY or different)
openssl rand -hex 32
```

### Configuration Options

```bash
# Secret Keys (REQUIRED)
SECRET_KEY=<your-secret-key>
JWT_SECRET_KEY=<your-jwt-secret-key>

# Algorithm (Recommended: HS256)
ALGORITHM=HS256
JWT_ALGORITHM=HS256

# Token Expiration
ACCESS_TOKEN_EXPIRE_MINUTES=30    # 30 minutes for access tokens
REFRESH_TOKEN_EXPIRE_DAYS=7       # 7 days for refresh tokens
```

### Token Expiration Guidelines

| Environment | Access Token | Refresh Token | Rationale |
|-------------|--------------|---------------|-----------|
| Development | 60 minutes | 30 days | Convenience for testing |
| Staging | 30 minutes | 7 days | Production-like |
| Production | 30 minutes | 7 days | Security best practice |

### Advanced: Using RS256 (Asymmetric)

If you need to distribute token verification to multiple services:

```bash
# Generate RSA key pair
openssl genrsa -out private_key.pem 2048
openssl rsa -in private_key.pem -pubout -out public_key.pem

# Configuration
JWT_ALGORITHM=RS256
JWT_PRIVATE_KEY_PATH=/path/to/private_key.pem
JWT_PUBLIC_KEY_PATH=/path/to/public_key.pem
```

---

## CORS Configuration

### Development CORS

```bash
# Allow all localhost variants
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,http://localhost:3000,http://localhost:8000
```

### Production CORS

```bash
# Only allow production domains
ALLOWED_HOSTS=https://app.optibid.io,https://api.optibid.io,https://www.optibid.io
```

### CORS Best Practices

1. **Never use `*` with credentials**
   ```python
   # BAD - Security vulnerability
   allow_origins=["*"]
   allow_credentials=True
   
   # GOOD - Explicit origins
   allow_origins=["https://app.optibid.io"]
   allow_credentials=True
   ```

2. **Restrict methods and headers in production**
   ```python
   # Development - Permissive
   allow_methods=["*"]
   allow_headers=["*"]
   
   # Production - Restrictive
   allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
   allow_headers=["Content-Type", "Authorization", "X-Requested-With"]
   ```

3. **Use HTTPS in production**
   ```bash
   # BAD - HTTP in production
   ALLOWED_HOSTS=http://app.optibid.io
   
   # GOOD - HTTPS in production
   ALLOWED_HOSTS=https://app.optibid.io
   ```

---

## Rate Limiting Configuration

### Redis-Based Rate Limiting (Production)

```bash
# Enable Redis
ENABLE_REDIS=true
REDIS_URL=redis://prod-redis.example.com:6379/0

# Enable rate limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_STORAGE=redis

# Configure limits
RATE_LIMIT_DEFAULT_LIMIT_PER_HOUR=1000
RATE_LIMIT_DEFAULT_LIMIT_PER_DAY=10000
RATE_LIMIT_BURST_LIMIT=100
```

### In-Memory Rate Limiting (Development)

```bash
# Disable Redis (uses in-memory fallback)
ENABLE_REDIS=false

# Relaxed limits for development
RATE_LIMIT_ENABLED=false
RATE_LIMIT_PER_MINUTE=1000
RATE_LIMIT_PER_HOUR=10000
```

### Endpoint-Specific Rate Limits

Recommended limits by endpoint type:

| Endpoint Type | Requests/Minute | Requests/Hour | Rationale |
|---------------|-----------------|---------------|-----------|
| Authentication | 5 | 50 | Prevent brute force |
| Password Reset | 3 | 10 | Prevent abuse |
| Read Operations | 100 | 5000 | Normal usage |
| Write Operations | 50 | 2000 | Prevent spam |
| Admin Operations | 200 | 10000 | Higher limits for admins |

### Implementation Example

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# Authentication endpoint - strict
@app.post("/api/auth/login")
@limiter.limit("5/minute")
async def login():
    pass

# Read endpoint - moderate
@app.get("/api/assets")
@limiter.limit("100/minute")
async def get_assets():
    pass

# Write endpoint - moderate
@app.post("/api/bids")
@limiter.limit("50/minute")
async def create_bid():
    pass
```

---

## Security Headers Configuration

### Enabling Security Headers

```bash
# Enable security headers
SECURITY_HEADERS_ENABLED=true

# HSTS Configuration
HSTS_MAX_AGE=31536000  # 1 year in seconds

# CSP Configuration
CSP_ENABLED=true
```

### Security Headers Middleware

Add to `main.py`:

```python
from fastapi import Request
from app.core.security import SECURITY_HEADERS

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    if settings.SECURITY_HEADERS_ENABLED:
        for header, value in SECURITY_HEADERS.items():
            response.headers[header] = value
    
    return response
```

### Content Security Policy (CSP)

Default CSP:
```
Content-Security-Policy: default-src 'self'
```

For applications with external resources:
```python
CSP_POLICY = (
    "default-src 'self'; "
    "script-src 'self' 'unsafe-inline' https://cdn.example.com; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com; "
    "img-src 'self' data: https:; "
    "connect-src 'self' https://api.example.com"
)
```

---

## Database Security

### SSL/TLS Configuration

```bash
# PostgreSQL with SSL
DATABASE_URL=postgresql://user:password@host:5432/db?sslmode=require

# SSL Modes:
# - disable: No SSL
# - allow: Try SSL, fallback to non-SSL
# - prefer: Try SSL, fallback to non-SSL (default)
# - require: Require SSL, fail if unavailable
# - verify-ca: Require SSL and verify CA
# - verify-full: Require SSL and verify hostname
```

### Connection Pooling

```python
# In database.py
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=20,              # Number of connections to maintain
    max_overflow=10,           # Additional connections when pool is full
    pool_timeout=30,           # Timeout waiting for connection
    pool_recycle=3600,         # Recycle connections after 1 hour
    pool_pre_ping=True,        # Verify connections before use
)
```

### Database User Permissions

```sql
-- Create application user with limited permissions
CREATE USER optibid_app WITH PASSWORD 'strong_password';

-- Grant only necessary permissions
GRANT CONNECT ON DATABASE optibid_db TO optibid_app;
GRANT USAGE ON SCHEMA public TO optibid_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO optibid_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO optibid_app;

-- Revoke dangerous permissions
REVOKE CREATE ON SCHEMA public FROM optibid_app;
REVOKE DROP ON ALL TABLES IN SCHEMA public FROM optibid_app;
```

---

## MFA Configuration

### TOTP (Time-based One-Time Password)

```bash
# MFA Settings
MFA_ISSUER_NAME=OptiBid Energy
MFA_BACKUP_CODES_COUNT=10

# Rate Limiting for MFA
MFA_RATE_LIMIT_ATTEMPTS=5
MFA_RATE_LIMIT_WINDOW_MINUTES=15
```

### SMS Configuration (Twilio)

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=<your-account-sid>
TWILIO_AUTH_TOKEN=<your-auth-token>
TWILIO_PHONE_NUMBER=<your-twilio-number>
```

### MFA Enforcement Policies

```bash
# Require MFA for admin accounts
MFA_REQUIRED_FOR_ADMIN=true

# Optional MFA for regular users
MFA_OPTIONAL_FOR_USERS=true

# Grace period before MFA enforcement (days)
MFA_GRACE_PERIOD_DAYS=30
```

---

## Secrets Management

### Using Environment Variables

```bash
# .env file (never commit to git)
SECRET_KEY=<your-secret>
DATABASE_URL=postgresql://user:pass@host/db
```

### Using AWS Secrets Manager

```python
import boto3
import json

def get_secret(secret_name):
    client = boto3.client('secretsmanager', region_name='us-east-1')
    response = client.get_secret_value(SecretId=secret_name)
    return json.loads(response['SecretString'])

# Usage
secrets = get_secret('optibid/production')
SECRET_KEY = secrets['SECRET_KEY']
DATABASE_URL = secrets['DATABASE_URL']
```

### Using HashiCorp Vault

```python
import hvac

client = hvac.Client(url='https://vault.example.com')
client.auth.approle.login(
    role_id='your-role-id',
    secret_id='your-secret-id'
)

# Read secrets
secrets = client.secrets.kv.v2.read_secret_version(
    path='optibid/production'
)

SECRET_KEY = secrets['data']['data']['SECRET_KEY']
```

### Secrets Rotation

```bash
# Rotate secrets regularly
# 1. Generate new secret
NEW_SECRET=$(openssl rand -hex 32)

# 2. Update in secrets manager
aws secretsmanager update-secret \
    --secret-id optibid/production/SECRET_KEY \
    --secret-string "$NEW_SECRET"

# 3. Deploy application with new secret
# 4. Verify application is working
# 5. Remove old secret
```

---

## Security Monitoring

### Logging Configuration

```bash
# Production Logging
LOG_LEVEL=WARNING
SENTRY_DSN=<your-sentry-dsn>

# Audit Logging
AUDIT_LOG_ENABLED=true
AUDIT_LOG_ENCRYPTED=true
AUDIT_LOG_RETENTION_DAYS=2555  # 7 years
```

### Monitoring Alerts

Set up alerts for:
- Failed authentication attempts (> 5 in 5 minutes)
- Rate limit violations (> 100 in 1 minute)
- Unusual API usage patterns
- Database connection failures
- Redis connection failures

### Security Metrics

Track:
- Authentication success/failure rate
- Token expiration rate
- Rate limit hit rate
- API response times
- Error rates by endpoint

---

## Troubleshooting

### Common Issues

1. **CORS Errors**
   ```
   Error: CORS policy: No 'Access-Control-Allow-Origin' header
   
   Solution: Verify ALLOWED_HOSTS includes the frontend domain
   ```

2. **JWT Token Invalid**
   ```
   Error: Invalid token
   
   Solution: Check SECRET_KEY matches between token generation and verification
   ```

3. **Rate Limit Not Working**
   ```
   Error: Rate limiting not enforced
   
   Solution: Verify ENABLE_REDIS=true and Redis is accessible
   ```

4. **Database SSL Error**
   ```
   Error: SSL connection required
   
   Solution: Add ?sslmode=require to DATABASE_URL
   ```

---

## Security Checklist

Before deploying to production:

- [ ] Change all default secrets and keys
- [ ] Configure ALLOWED_HOSTS for production domains
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Enable Redis for rate limiting
- [ ] Enable security headers
- [ ] Configure audit logging
- [ ] Set up monitoring and alerts
- [ ] Test authentication and authorization
- [ ] Test rate limiting
- [ ] Review and test CORS configuration
- [ ] Enable MFA for admin accounts
- [ ] Configure database SSL
- [ ] Set up secrets management
- [ ] Document all security configurations

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [CORS Specification](https://www.w3.org/TR/cors/)
- [Security Headers](https://securityheaders.com/)

---

**Last Updated:** 2025-11-23  
**Version:** 1.0
