# OptiBid Energy Platform - Production Deployment Guide

**Version:** 1.0  
**Date:** 2025-11-21 18:31:50  
**Environment:** Production  

---

## 🎯 Overview

This guide provides step-by-step instructions for deploying the OptiBid Energy Platform to production environments. The deployment process is fully automated with comprehensive error handling and rollback capabilities.

### 📋 Prerequisites

- **System Requirements:**
  - Node.js 18.19.0 or higher
  - npm 9.0.0 or higher
  - PM2 5.3.0 or higher
  - PostgreSQL 14.0 or higher
  - Redis 6.0 or higher

- **Access Requirements:**
  - Production server access (SSH)
  - Database admin privileges
  - External API credentials
  - SSL certificate configuration

---

## 🏗️ Infrastructure Requirements

### **Server Specifications**

#### **Production Server (Minimum)**
```
CPU: 4 cores
RAM: 8GB
Storage: 100GB SSD
Bandwidth: 1Gbps
OS: Ubuntu 20.04 LTS or higher
```

#### **Production Server (Recommended)**
```
CPU: 8 cores
RAM: 16GB
Storage: 200GB SSD
Bandwidth: 2Gbps
OS: Ubuntu 22.04 LTS
```

#### **Database Server**
```
CPU: 4 cores
RAM: 8GB
Storage: 200GB SSD
PostgreSQL: 14.0+
Connection Pool: 20 connections
```

#### **Redis Server**
```
CPU: 2 cores
RAM: 4GB
Storage: 50GB SSD
Redis: 6.0+
Persistence: RDB + AOF
```

### **Network Requirements**

- **Firewall Ports:**
  - HTTP: 80 (redirect to HTTPS)
  - HTTPS: 443
  - SSH: 22 (restricted access)
  - Database: 5432 (internal only)
  - Redis: 6379 (internal only)

- **External Connections:**
  - SendGrid API: api.sendgrid.com:443
  - Twilio API: api.twilio.com:443
  - Sentry: o123456.sentry.io:443

---

## 🔐 Environment Configuration

### **Production Environment Variables**

Create `.env.production.local` with the following variables:

```bash
# ===========================================
# OPTIBID ENERGY PLATFORM - PRODUCTION
# ===========================================

# Application Configuration
NODE_ENV=production
PORT=3000
APP_NAME=OptiBid Energy Platform
APP_VERSION=1.0.0

# Database Configuration
DATABASE_URL=postgresql://username:password@db-host:5432/optibid_prod
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20
DATABASE_TIMEOUT=30000

# Redis Configuration
REDIS_URL=redis://redis-host:6379
SESSION_REDIS_URL=redis://redis-host:6379/1
RATE_LIMIT_REDIS_URL=redis://redis-host:6379/2

# JWT Configuration
JWT_SECRET=your-256-bit-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# Encryption Configuration
ENCRYPTION_KEY=your-32-byte-encryption-key-here

# Email Service (SendGrid)
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
SENDGRID_FROM_EMAIL=noreply@optibid-energy.com
SENDGRID_FROM_NAME=OptiBid Energy Platform
EMAIL_VERIFICATION_TEMPLATE_ID=your-template-id

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=ACyour-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_VERIFY_SERVICE_SID=VAYour-twilio-verify-service-sid

# Monitoring (Sentry)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=1.0.0

# Security Configuration
CORS_ORIGIN=https://optibid-energy.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
SESSION_TIMEOUT=3600
ACCOUNT_LOCKOUT_THRESHOLD=5
ACCOUNT_LOCKOUT_DURATION=1800

# Feature Flags
ENABLE_REGISTRATION=true
ENABLE_EMAIL_VERIFICATION=true
ENABLE_SMS_VERIFICATION=true
ENABLE_MFA=true
ENABLE_RATE_LIMITING=true

# Performance Configuration
MAX_FILE_UPLOAD_SIZE=10485760
API_TIMEOUT=30000
REDIS_TTL=3600
CACHE_TTL=1800

# External API Configuration
WEATHER_API_KEY=your-weather-api-key
ENERGY_PRICE_API_KEY=your-energy-api-key
```

### **Security Configuration**

```bash
# SSL/TLS Configuration
SSL_CERT_PATH=/path/to/ssl/cert.pem
SSL_KEY_PATH=/path/to/ssl/private-key.pem
SSL_CA_PATH=/path/to/ssl/ca-cert.pem

# Additional Security Headers
HSTS_MAX_AGE=31536000
CONTENT_SECURITY_POLICY="default-src 'self'"
X_FRAME_OPTIONS=DENY
X_CONTENT_TYPE_OPTIONS=nosniff
```

---

## 📦 Pre-Deployment Setup

### **Step 1: Server Preparation**

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Redis
sudo apt install redis-server -y

# Create application user
sudo useradd -m -s /bin/bash optibid
sudo usermod -aG sudo optibid
```

### **Step 2: Application Directory Setup**

```bash
# Switch to application user
sudo su - optibid

# Create application directory
mkdir -p /opt/optibid-energy
cd /opt/optibid-energy

# Clone or upload application files
# (Upload your application files here)

# Set proper permissions
sudo chown -R optibid:optibid /opt/optibid-energy
chmod -R 755 /opt/optibid-energy
```

### **Step 3: Database Setup**

```bash
# Switch to postgres user
sudo su - postgres

# Create database and user
createdb optibid_prod
psql -c "CREATE USER optibid_user WITH PASSWORD 'secure_password_here';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE optibid_prod TO optibid_user;"
psql -c "ALTER USER optibid_user CREATEDB;"

# Exit postgres user
exit
```

### **Step 4: Redis Configuration**

```bash
# Configure Redis
sudo nano /etc/redis/redis.conf

# Key configurations to set:
# maxmemory 2gb
# maxmemory-policy allkeys-lru
# save 900 1
# save 300 10
# save 60 10000

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

---

## 🚀 Deployment Process

### **Step 1: Dependency Installation**

```bash
# Navigate to application directory
cd /opt/optibid-energy

# Install dependencies
npm ci --production

# Verify installation
npm list --depth=0
```

### **Step 2: Environment Configuration**

```bash
# Create production environment file
cp .env.production .env.production.local

# Edit configuration
nano .env.production.local
# (Update all API keys and configuration values)

# Verify environment file
cat .env.production.local
```

### **Step 3: Database Migration**

```bash
# Run database migrations
npm run db:migrate

# Verify migration success
npm run db:status

# Seed initial data (if required)
npm run db:seed
```

### **Step 4: Build Application**

```bash
# Build production application
npm run build

# Verify build success
npm run build:verify

# Check build output
ls -la .next/
```

### **Step 5: Automated Deployment**

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh production

# Monitor deployment output
# Deployment script will:
# 1. Perform pre-deployment checks
# 2. Stop existing application
# 3. Backup current deployment
# 4. Install dependencies
# 5. Run migrations
# 6. Start new application
# 7. Verify health
# 8. Complete deployment
```

### **Step 6: Process Management**

```bash
# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup

# Monitor processes
pm2 status
pm2 logs optibid-energy-platform
```

---

## ✅ Post-Deployment Verification

### **Health Checks**

```bash
# Check application health
curl -f http://localhost:3000/api/health

# Check database connectivity
npm run db:health-check

# Check Redis connectivity
npm run redis:health-check

# Check external service integrations
npm run services:health-check
```

### **Performance Verification**

```bash
# Load testing (basic)
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/health

# Check memory usage
free -h
pm2 monit

# Check disk usage
df -h

# Check network connectivity
netstat -tlnp | grep 3000
```

### **Service Integration Tests**

```bash
# Test email service
npm run test:email-service

# Test SMS service
npm run test:sms-service

# Test monitoring integration
npm run test:monitoring
```

---

## 🔍 Monitoring Setup

### **Sentry Configuration**

```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});
```

### **PM2 Monitoring**

```bash
# Start monitoring dashboard
pm2 monit

# Check logs
pm2 logs --lines 100

# Monitor specific process
pm2 logs optibid-energy-platform --lines 50 --nostream
```

### **System Monitoring**

```bash
# Setup system monitoring
sudo apt install htop iotop nethogs -y

# Create monitoring script
cat > /opt/optibid-energy/scripts/monitor.sh << 'EOF'
#!/bin/bash
echo "=== System Status ==="
free -h
df -h
pm2 status
tail -n 20 /var/log/optibid-energy/error.log
EOF

chmod +x /opt/optibid-energy/scripts/monitor.sh
```

---

## 🔧 Troubleshooting

### **Common Issues and Solutions**

#### **Issue 1: Application Won't Start**

```bash
# Check logs
pm2 logs optibid-energy-platform --lines 50

# Check environment
pm2 env 0

# Restart application
pm2 restart optibid-energy-platform

# Check port conflicts
netstat -tlnp | grep 3000
```

#### **Issue 2: Database Connection Failed**

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U optibid_user -d optibid_prod -c "SELECT 1;"

# Check connection string
echo $DATABASE_URL
```

#### **Issue 3: Redis Connection Failed**

```bash
# Check Redis status
sudo systemctl status redis-server

# Test Redis connection
redis-cli ping

# Check Redis logs
sudo tail -f /var/log/redis/redis-server.log
```

#### **Issue 4: External API Failures**

```bash
# Test SendGrid
curl -X POST "https://api.sendgrid.com/v3/mail/send" \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"noreply@optibid-energy.com"},"subject":"Test","content":[{"type":"text/plain","value":"Test"}]}'

# Test Twilio
curl -X GET "https://api.twilio.com/2010-04-01/Accounts.json" \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
```

---

## 🔄 Rollback Procedures

### **Automated Rollback**

```bash
# Emergency rollback
./scripts/deploy.sh rollback

# Or manually:
pm2 stop optibid-energy-platform

# Restore previous version
cp -r /opt/optibid-energy/backups/previous-version /opt/optibid-energy/current

# Restart application
pm2 start ecosystem.config.js --env production
```

### **Database Rollback**

```bash
# Rollback database migration
npm run db:rollback

# Restore from backup
pg_restore -h localhost -U optibid_user -d optibid_prod backup.sql
```

---

## 📋 Go-Live Checklist

### **Final Pre-Launch Verification**

- [ ] **Application Health:** All health checks pass
- [ ] **Database:** All migrations applied successfully
- [ ] **External Services:** SendGrid, Twilio, Sentry connected
- [ ] **Security:** SSL certificates installed and configured
- [ ] **Monitoring:** Sentry receiving events
- [ ] **Performance:** Response times within targets
- [ ] **Backup:** Latest backup completed
- [ ] **Team Notification:** All stakeholders informed

### **Launch Steps**

1. **Final verification run**
2. **Switch DNS to production (if applicable)**
3. **Enable production traffic**
4. **Monitor for 24 hours**
5. **Document any issues**
6. **Complete go-live report**

---

## 📞 Support Contacts

### **Technical Support**
- **Primary:** DevOps Team
- **Secondary:** Development Team
- **Escalation:** CTO

### **External Service Support**
- **SendGrid Support:** https://support.sendgrid.com
- **Twilio Support:** https://support.twilio.com
- **Sentry Support:** https://sentry.io/support

---

**Document Owner:** MiniMax Agent  
**Last Updated:** 2025-11-21 18:31:50  
**Version:** 1.0  
**Status:** PRODUCTION READY ✅