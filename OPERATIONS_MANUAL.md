# OptiBid Energy Platform - Operations Manual

**Version:** 1.0  
**Date:** 2025-11-21 18:31:50  
**Environment:** Production  

---

## 🎯 Overview

This operations manual provides comprehensive guidance for operating, monitoring, maintaining, and troubleshooting the OptiBid Energy Platform in production environments.

### 📋 Document Scope

- **Platform Operations:** Daily operations and procedures
- **Monitoring & Alerting:** System monitoring and alert management
- **Incident Response:** Emergency procedures and escalation
- **Maintenance:** Regular maintenance tasks and schedules
- **Troubleshooting:** Common issues and resolution procedures

---

## 📊 System Architecture Overview

### **Component Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                      │
│                 Port: 3000 (HTTPS)                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                API Gateway (Express)                       │
│              Authentication & Authorization                │
└─────────────────────┬───────────────────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼────┐      ┌────▼────┐      ┌─────▼─────┐
│ Redis  │      │PostgreSQL│      │  Services │
│ Cache  │      │Database  │      │(SendGrid, │
│ :6379  │      │  :5432   │      │ Twilio,   │
│        │      │          │      │  Sentry)  │
└────────┘      └──────────┘      └───────────┘
```

### **Service Dependencies**

- **Core Services:** PostgreSQL, Redis
- **External APIs:** SendGrid, Twilio, Sentry
- **Infrastructure:** PM2, Nginx (optional), SSL certificates

---

## 🔍 Monitoring & Observability

### **Application Monitoring (Sentry)**

#### **Key Metrics to Monitor**

1. **Error Rates**
   - Target: < 0.1% error rate
   - Alert threshold: > 1% for 5 minutes
   - Critical: > 5% for 1 minute

2. **Response Times**
   - Target: < 200ms for 95% of requests
   - Alert threshold: > 500ms for 5 minutes
   - Critical: > 1s for 2 minutes

3. **User Activity**
   - Failed login attempts
   - Registration rate changes
   - API usage anomalies

#### **Sentry Alert Configuration**

```javascript
// Example alert rules in Sentry dashboard
Rule: Error rate > 1% for 5 minutes
Action: Send alert to #ops-alerts Slack channel
Escalation: Page on-call engineer after 10 minutes

Rule: API response time > 500ms
Action: Send alert to #performance Slack channel
Escalation: Auto-pause deployment pipeline
```

### **Infrastructure Monitoring**

#### **PM2 Monitoring**

```bash
# Monitor processes
pm2 monit

# Check process status
pm2 status

# View logs
pm2 logs --lines 50

# Restart specific process
pm2 restart optibid-energy-platform

# Restart all processes
pm2 restart all
```

#### **System Resource Monitoring**

```bash
# CPU and Memory usage
htop
free -h

# Disk usage
df -h
du -sh /opt/optibid-energy

# Network connections
netstat -tlnp | grep :3000

# Process tree
pstree -p $(pgrep -f optibid)
```

#### **Database Monitoring**

```bash
# PostgreSQL status
sudo systemctl status postgresql

# Active connections
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Database size
psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('optibid_prod'));"

# Slow queries
psql -U postgres -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

#### **Redis Monitoring**

```bash
# Redis status
redis-cli info server

# Memory usage
redis-cli info memory

# Key space
redis-cli info keyspace

# Slow log
redis-cli slowlog get 10
```

---

## 🚨 Alert Management

### **Alert Severity Levels**

#### **P1 - Critical (Immediate Response)**
- Complete system outage
- Database connection failure
- Security breach indicators
- Data corruption detected

**Response Time:** 15 minutes  
**Escalation:** Page on-call engineer  
**Communication:** Status page + stakeholder notification

#### **P2 - High (1 Hour Response)**
- API error rate > 5%
- Response time > 1 second
- External service integration failures
- Performance degradation

**Response Time:** 1 hour  
**Escalation:** Team lead notification  
**Communication:** Slack channel + email

#### **P3 - Medium (4 Hour Response)**
- Warning-level system alerts
- Resource usage warnings
- Non-critical feature failures
- Capacity planning alerts

**Response Time:** 4 hours  
**Escalation:** Daily team standup  
**Communication:** Project management tool

### **Alert Response Procedures**

#### **P1 Critical Alert Response**

1. **Immediate Actions (0-15 minutes)**
   - Acknowledge alert
   - Assess impact and scope
   - Activate incident response team
   - Update status page

2. **Investigation (15-30 minutes)**
   - Check system logs
   - Review recent deployments
   - Analyze monitoring data
   - Identify root cause

3. **Resolution (30-60 minutes)**
   - Implement fix or workaround
   - Test resolution
   - Monitor for stability
   - Update stakeholder status

4. **Post-Incident (60+ minutes)**
   - Document incident details
   - Conduct root cause analysis
   - Create improvement action items
   - Share lessons learned

---

## 🔧 Maintenance Procedures

### **Daily Maintenance Tasks**

#### **Automated (via Cron)**
- Database backup (2:00 AM)
- Log rotation (daily)
- Health check monitoring (every 5 minutes)
- Security scan (nightly)

#### **Manual Verification**
```bash
# Morning health check script
cat > /opt/optibid-energy/scripts/daily-check.sh << 'EOF'
#!/bin/bash

echo "=== Daily Health Check - $(date) ==="

# Check application status
if ! pm2 list | grep -q "online"; then
    echo "❌ Application is not running"
    exit 1
fi

# Check database connection
if ! npm run db:health-check > /dev/null; then
    echo "❌ Database connection failed"
    exit 1
fi

# Check Redis connection
if ! npm run redis:health-check > /dev/null; then
    echo "❌ Redis connection failed"
    exit 1
fi

# Check disk space
DISK_USAGE=$(df -h /opt | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️ Disk usage high: ${DISK_USAGE}%"
fi

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
if (( $(echo "$MEM_USAGE > 80" | bc -l) )); then
    echo "⚠️ Memory usage high: ${MEM_USAGE}%"
fi

echo "✅ Daily health check completed"
EOF

chmod +x /opt/optibid-energy/scripts/daily-check.sh

# Add to crontab
# 0 9 * * * /opt/optibid-energy/scripts/daily-check.sh
```

### **Weekly Maintenance Tasks**

#### **Performance Review**
```bash
# Weekly performance analysis
cat > /opt/optibid-energy/scripts/weekly-review.sh << 'EOF'
#!/bin/bash

echo "=== Weekly Performance Review - $(date) ==="

# Application metrics
npm run metrics:generate > /tmp/app-metrics-$(date +%Y%m%d).txt

# Database performance
psql -U postgres -d optibid_prod -f /opt/optibid-energy/scripts/db-performance.sql

# Error analysis
sentry-cli releases files 1.0.0 list --format=json | jq '.' > /tmp/sentry-stats-$(date +%Y%m%d).json

# Generate weekly report
echo "Weekly report generated at /tmp/weekly-report-$(date +%Y%m%d).txt"
EOF
```

#### **Security Audit**
- Review user access logs
- Check for failed authentication attempts
- Verify SSL certificate status
- Update security patches
- Review backup integrity

### **Monthly Maintenance Tasks**

#### **Capacity Planning**
```bash
# Monthly capacity analysis
cat > /opt/optibid-energy/scripts/capacity-planning.sh << 'EOF'
#!/bin/bash

# CPU usage trend
sar -u 1 1 > /tmp/cpu-trend-$(date +%Y%m).txt

# Memory usage trend
free -h > /tmp/memory-trend-$(date +%Y%m).txt

# Disk usage trend
df -h > /tmp/disk-trend-$(date +%Y%m).txt

# Network usage
iftop -t -s 10 > /tmp/network-trend-$(date +%Y%m).txt

# Database growth
psql -U postgres -d optibid_prod -c "
SELECT schemaname,tablename,attname,n_distinct,correlation 
FROM pg_stats 
WHERE schemaname = 'public';" > /tmp/db-growth-$(date +%Y%m).txt
```

#### **Disaster Recovery Test**
- Test backup restoration
- Verify failover procedures
- Update disaster recovery documentation
- Train team on DR procedures

---

## 🔍 Troubleshooting Guide

### **Common Issues and Solutions**

#### **Issue 1: Application Not Responding**

**Symptoms:**
- HTTP 502/503 errors
- PM2 shows process as "online" but no response
- Timeout errors

**Diagnostic Steps:**
```bash
# Check process status
pm2 status
pm2 logs optibid-energy-platform --lines 50

# Check system resources
htop
df -h
free -h

# Check network
netstat -tlnp | grep :3000

# Check logs
tail -f /var/log/optibid-energy/error.log
```

**Resolution:**
```bash
# Restart application
pm2 restart optibid-energy-platform

# If persistent issues, full restart
pm2 stop all
pm2 start ecosystem.config.js --env production

# Check environment variables
pm2 env 0
```

#### **Issue 2: Database Connection Failed**

**Symptoms:**
- "Connection refused" errors
- Authentication failures
- Slow query responses

**Diagnostic Steps:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection manually
psql -h localhost -U optibid_user -d optibid_prod -c "SELECT 1;"

# Check connection limits
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

**Resolution:**
```bash
# Restart PostgreSQL
sudo systemctl restart postgresql

# Check connection pool settings
sudo nano /etc/postgresql/14/main/postgresql.conf
# max_connections = 200
# shared_buffers = 256MB

# Restart and verify
sudo systemctl restart postgresql
```

#### **Issue 3: Redis Connection Failed**

**Symptoms:**
- Session storage failures
- Rate limiting not working
- Cache misses

**Diagnostic Steps:**
```bash
# Check Redis status
sudo systemctl status redis-server

# Test connection
redis-cli ping
redis-cli info server

# Check memory usage
redis-cli info memory

# Check slow log
redis-cli slowlog get 10
```

**Resolution:**
```bash
# Restart Redis
sudo systemctl restart redis-server

# Check Redis configuration
sudo nano /etc/redis/redis.conf
# maxmemory 2gb
# maxmemory-policy allkeys-lru

# Restart and verify
sudo systemctl restart redis-server
```

#### **Issue 4: High CPU/Memory Usage**

**Symptoms:**
- Slow response times
- System performance degradation
- Process kills

**Diagnostic Steps:**
```bash
# Identify high-usage processes
htop

# Check specific process
pm2 show optibid-energy-platform

# Check Node.js memory usage
node --inspect /opt/optibid-energy/app.js &
```

**Resolution:**
```bash
# Restart application
pm2 restart optibid-energy-platform

# Check for memory leaks
node --max-old-space-size=4096 /opt/optibid-energy/app.js

# Monitor with PM2 monit
pm2 monit

# Scale application if needed
pm2 scale optibid-energy-platform 4
```

#### **Issue 5: External API Failures**

**Symptoms:**
- Email not sending
- SMS not delivered
- Monitoring data missing

**Diagnostic Steps:**
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

**Resolution:**
```bash
# Update API credentials
nano .env.production.local
# Update SENDGRID_API_KEY or TWILIO_AUTH_TOKEN

# Restart application
pm2 restart optibid-energy-platform

# Test service integration
npm run test:email-service
npm run test:sms-service
```

---

## 🔄 Incident Response Procedures

### **Incident Classification**

#### **Severity 1 - Critical**
- Complete system outage
- Data loss or corruption
- Security breach

**Response:** Page on-call engineer immediately

#### **Severity 2 - High**
- Major functionality unavailable
- Performance severely degraded
- Multiple service failures

**Response:** 15-minute response time

#### **Severity 3 - Medium**
- Minor functionality issues
- Performance degradation
- Single service failure

**Response:** 1-hour response time

### **Incident Response Workflow**

1. **Detection & Alert**
   - Automated monitoring triggers
   - Manual discovery by team
   - Customer reported issues

2. **Assessment & Triage**
   - Confirm issue and scope
   - Assign severity level
   - Notify appropriate team members

3. **Investigation & Diagnosis**
   - Analyze logs and metrics
   - Identify root cause
   - Develop resolution plan

4. **Resolution & Recovery**
   - Implement fix or workaround
   - Test resolution
   - Monitor for stability

5. **Communication**
   - Update status page
   - Notify stakeholders
   - Document incident

6. **Post-Incident Review**
   - Root cause analysis
   - Document lessons learned
   - Update procedures and training

### **Emergency Contacts**

#### **On-Call Rotation**
- **Primary:** DevOps Engineer
- **Secondary:** Senior Developer
- **Escalation:** Engineering Manager

#### **External Support**
- **Hosting Provider:** 24/7 support line
- **Database Support:** PostgreSQL community support
- **Cloud Provider:** AWS/Azure support

---

## 📋 Compliance & Security

### **Data Protection**

#### **GDPR Compliance**
- User data anonymization procedures
- Data retention policies
- Right to deletion implementation
- Data portability procedures

#### **Audit Logging**
```bash
# Review audit logs
grep "SECURITY" /var/log/optibid-energy/application.log | tail -50

# Monitor failed login attempts
grep "LOGIN_FAILED" /var/log/optibid-energy/auth.log

# Check for suspicious activities
grep "SUSPICIOUS" /var/log/optibid-energy/security.log
```

### **Security Monitoring**

#### **Intrusion Detection**
- Monitor for failed authentication attempts
- Track unusual API usage patterns
- Alert on privilege escalation attempts

#### **Vulnerability Management**
- Regular security updates
- Dependency vulnerability scanning
- Penetration testing schedule

---

## 📈 Performance Optimization

### **Database Optimization**

#### **Query Performance**
```sql
-- Identify slow queries
SELECT query, mean_time, calls, total_time 
FROM pg_stat_statements 
WHERE mean_time > 1000 
ORDER BY mean_time DESC;

-- Check database statistics
ANALYZE;

-- Update table statistics
VACUUM ANALYZE;
```

#### **Connection Pool Tuning**
```javascript
// Optimize connection pool settings
const poolConfig = {
  min: 5,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxUses: 7500,
  reapIntervalMillis: 1000,
  createTimeoutMillis: 3000,
  destroyTimeoutMillis: 5000,
  createRetryIntervalMillis: 100
};
```

### **Application Optimization**

#### **Caching Strategy**
- Implement Redis caching for frequently accessed data
- Use CDN for static assets
- Cache database query results
- Implement application-level caching

#### **Resource Monitoring**
```bash
# Monitor memory usage
node --expose-gc /opt/optibid-energy/app.js

# Profile CPU usage
node --prof /opt/optibid-energy/app.js
node --prof-process isolate-*.log > profile.txt

# Monitor event loop lag
const monitor = setInterval(() => {
  const lag = process.hrtime();
  console.log(`Event loop lag: ${lag}ns`);
}, 1000);
```

---

## 📊 Reporting & Documentation

### **Daily Operations Report**

```bash
# Generate daily report
cat > /opt/optibid-energy/scripts/daily-report.sh << 'EOF'
#!/bin/bash

REPORT_FILE="/tmp/daily-ops-report-$(date +%Y%m%d).txt"

echo "=== OptiBid Energy Platform - Daily Operations Report ===" > $REPORT_FILE
echo "Date: $(date)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# System Status
echo "SYSTEM STATUS:" >> $REPORT_FILE
pm2 status >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Performance Metrics
echo "PERFORMANCE METRICS:" >> $REPORT_FILE
uptime >> $REPORT_FILE
free -h >> $REPORT_FILE
df -h /opt >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Error Summary
echo "ERROR SUMMARY:" >> $REPORT_FILE
grep "ERROR" /var/log/optibid-energy/error.log | tail -10 >> $REPORT_FILE
echo "" >> $REPORT_FILE

# User Activity
echo "USER ACTIVITY:" >> $REPORT_FILE
psql -U postgres -d optibid_prod -c "SELECT COUNT(*) FROM users WHERE created_at > CURRENT_DATE;" >> $REPORT_FILE

echo "Report generated: $REPORT_FILE"
EOF

chmod +x /opt/optibid-energy/scripts/daily-report.sh
```

### **Weekly Summary Report**

#### **Key Metrics to Track**
- System uptime percentage
- Average response times
- Error rates
- User engagement metrics
- Performance trends
- Resource utilization

#### **Report Distribution**
- Engineering team
- Product management
- Executive stakeholders
- External auditors (if applicable)

---

## 🎓 Training & Documentation

### **Operator Training**

#### **New Team Member Onboarding**
1. **System Architecture Overview** (2 hours)
2. **Monitoring and Alerting** (1 hour)
3. **Troubleshooting Procedures** (2 hours)
4. **Emergency Response** (1 hour)
5. **Security Best Practices** (1 hour)

#### **Ongoing Training**
- Monthly incident review sessions
- Quarterly disaster recovery drills
- Annual security training updates
- Platform feature training sessions

### **Documentation Maintenance**

#### **Living Documents**
- Runbooks and procedures
- Architecture diagrams
- Contact information
- Emergency procedures

#### **Version Control**
- All operational procedures under version control
- Regular review and updates
- Change management process
- Documentation quality checks

---

## 📞 Support Escalation

### **Internal Escalation Path**

1. **Level 1:** Junior DevOps Engineer
2. **Level 2:** Senior DevOps Engineer
3. **Level 3:** Engineering Manager
4. **Level 4:** CTO

### **External Escalation Path**

1. **Application Issues:** Internal development team
2. **Infrastructure Issues:** Cloud provider support
3. **Database Issues:** PostgreSQL community/enterprise support
4. **Security Issues:** External security consultant

---

## 🔍 Continuous Improvement

### **Metrics and KPIs**

#### **Operational KPIs**
- **System Uptime:** Target 99.9%
- **Mean Time to Recovery:** Target < 30 minutes
- **Mean Time to Detection:** Target < 5 minutes
- **Customer Satisfaction:** Target > 95%

#### **Performance KPIs**
- **API Response Time:** Target < 200ms
- **Database Query Time:** Target < 100ms
- **Error Rate:** Target < 0.1%
- **Throughput:** Target > 1000 requests/second

### **Improvement Process**

1. **Regular Reviews:** Weekly team meetings
2. **Incident Analysis:** Post-incident reviews
3. **Performance Tuning:** Monthly optimization reviews
4. **Technology Updates:** Quarterly upgrade assessments

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-21 18:31:50  
**Next Review:** 2025-12-21  
**Document Owner:** MiniMax Agent  
**Approval Status:** ✅ APPROVED FOR PRODUCTION USE