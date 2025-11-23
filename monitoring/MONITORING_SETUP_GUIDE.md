# Monitoring Setup Guide
## OptiBid Energy Platform - Prometheus & Grafana

This guide provides step-by-step instructions for setting up comprehensive monitoring with Prometheus and Grafana.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Prometheus Setup](#prometheus-setup)
4. [Grafana Setup](#grafana-setup)
5. [Alertmanager Setup](#alertmanager-setup)
6. [Application Instrumentation](#application-instrumentation)
7. [Dashboard Configuration](#dashboard-configuration)
8. [Alert Testing](#alert-testing)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### Monitoring Stack Components

- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Alertmanager**: Alert routing and notification
- **Node Exporter**: System metrics
- **Application Metrics**: Custom application metrics

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Monitoring Stack                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │  Prometheus  │◄────────│ Application  │                  │
│  │  Port 9090   │ Scrape  │  Port 8000   │                  │
│  └──────┬───────┘         └──────────────┘                  │
│         │                                                     │
│         │ Alerts          ┌──────────────┐                  │
│         └────────────────►│ Alertmanager │                  │
│                           │  Port 9093   │                  │
│                           └──────┬───────┘                  │
│                                  │                           │
│                                  │ Notifications            │
│                                  ▼                           │
│                           ┌──────────────┐                  │
│                           │ Slack/Email  │                  │
│                           │ PagerDuty    │                  │
│                           └──────────────┘                  │
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   Grafana    │◄────────│  Prometheus  │                  │
│  │  Port 3001   │ Query   │  Port 9090   │                  │
│  └──────────────┘         └──────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### Required Software

- Docker and Docker Compose (recommended)
- OR manual installation:
  - Prometheus 2.40+
  - Grafana 9.0+
  - Alertmanager 0.25+

### Network Requirements

- Prometheus: Port 9090
- Grafana: Port 3001
- Alertmanager: Port 9093
- Application metrics endpoint: Port 8000/metrics

---

## Prometheus Setup

### Option 1: Docker Compose (Recommended)

Create `docker-compose.monitoring.yml`:

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: optibid-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./monitoring/security_rules.yml:/etc/prometheus/security_rules.yml
      - ./monitoring/backup_rules.yml:/etc/prometheus/backup_rules.yml
      - ./monitoring/auth_rules.yml:/etc/prometheus/auth_rules.yml
      - ./monitoring/application_rules.yml:/etc/prometheus/application_rules.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
    restart: unless-stopped
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: optibid-grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_SERVER_ROOT_URL=http://localhost:3001
    restart: unless-stopped
    networks:
      - monitoring
    depends_on:
      - prometheus

  alertmanager:
    image: prom/alertmanager:latest
    container_name: optibid-alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager-data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    restart: unless-stopped
    networks:
      - monitoring

  node-exporter:
    image: prom/node-exporter:latest
    container_name: optibid-node-exporter
    ports:
      - "9100:9100"
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    restart: unless-stopped
    networks:
      - monitoring

volumes:
  prometheus-data:
  grafana-data:
  alertmanager-data:

networks:
  monitoring:
    driver: bridge
```

Start the monitoring stack:

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

### Option 2: Manual Installation

#### Install Prometheus

```bash
# Download Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.40.0/prometheus-2.40.0.linux-amd64.tar.gz
tar xvfz prometheus-2.40.0.linux-amd64.tar.gz
cd prometheus-2.40.0.linux-amd64

# Copy configuration
cp /path/to/monitoring/prometheus.yml ./prometheus.yml
cp /path/to/monitoring/*_rules.yml ./

# Start Prometheus
./prometheus --config.file=prometheus.yml
```

#### Verify Prometheus

```bash
# Check Prometheus is running
curl http://localhost:9090/-/healthy

# Check targets
curl http://localhost:9090/api/v1/targets
```

---

## Grafana Setup

### Access Grafana

1. Open browser: `http://localhost:3001`
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin`
3. Change password on first login

### Add Prometheus Data Source

1. Navigate to Configuration → Data Sources
2. Click "Add data source"
3. Select "Prometheus"
4. Configure:
   - Name: `Prometheus`
   - URL: `http://prometheus:9090` (Docker) or `http://localhost:9090` (manual)
   - Access: `Server`
5. Click "Save & Test"

### Import Dashboards

#### Option 1: Import from Grafana.com

1. Navigate to Dashboards → Import
2. Import these dashboard IDs:
   - **1860**: Node Exporter Full
   - **3662**: Prometheus 2.0 Overview
   - **7362**: PostgreSQL Database
   - **11835**: Redis Dashboard

#### Option 2: Custom Dashboards

See [Dashboard Configuration](#dashboard-configuration) section below.

---

## Alertmanager Setup

### Create Alertmanager Configuration

Create `monitoring/alertmanager.yml`:

```yaml
global:
  resolve_timeout: 5m
  slack_api_url: 'YOUR_SLACK_WEBHOOK_URL'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'
  routes:
    # Critical alerts go to PagerDuty
    - match:
        severity: critical
      receiver: 'pagerduty'
      continue: true
    
    # Security alerts go to security team
    - match:
        category: security
      receiver: 'security-team'
      continue: true
    
    # All alerts go to Slack
    - match_re:
        severity: .*
      receiver: 'slack'

receivers:
  - name: 'default'
    email_configs:
      - to: 'ops@optibid.io'
        from: 'alertmanager@optibid.io'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alertmanager@optibid.io'
        auth_password: 'YOUR_EMAIL_PASSWORD'

  - name: 'slack'
    slack_configs:
      - channel: '#alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
        send_resolved: true

  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_SERVICE_KEY'
        description: '{{ .GroupLabels.alertname }}'

  - name: 'security-team'
    email_configs:
      - to: 'security@optibid.io'
        from: 'alertmanager@optibid.io'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alertmanager@optibid.io'
        auth_password: 'YOUR_EMAIL_PASSWORD'
    slack_configs:
      - channel: '#security-alerts'
        title: 'SECURITY ALERT: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
        send_resolved: true

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'cluster', 'service']
```

### Configure Notification Channels

#### Slack Integration

1. Create Slack webhook:
   - Go to https://api.slack.com/apps
   - Create new app
   - Enable Incoming Webhooks
   - Copy webhook URL

2. Update `alertmanager.yml`:
   ```yaml
   global:
     slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
   ```

#### PagerDuty Integration

1. Create PagerDuty service:
   - Go to PagerDuty dashboard
   - Create new service
   - Copy integration key

2. Update `alertmanager.yml`:
   ```yaml
   pagerduty_configs:
     - service_key: 'YOUR_PAGERDUTY_INTEGRATION_KEY'
   ```

#### Email Integration

1. Configure SMTP settings in `alertmanager.yml`
2. Use app-specific password for Gmail
3. Test email delivery

---

## Application Instrumentation

### Add Prometheus Client to FastAPI

Install dependencies:

```bash
pip install prometheus-client prometheus-fastapi-instrumentator
```

### Instrument Application

Add to `backend/main.py`:

```python
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from prometheus_fastapi_instrumentator import Instrumentator
from fastapi import Response

# Initialize instrumentator
instrumentator = Instrumentator(
    should_group_status_codes=False,
    should_ignore_untemplated=True,
    should_respect_env_var=True,
    should_instrument_requests_inprogress=True,
    excluded_handlers=[".*admin.*", "/metrics"],
    env_var_name="ENABLE_METRICS",
    inprogress_name="http_requests_inprogress",
    inprogress_labels=True,
)

# Instrument app
instrumentator.instrument(app).expose(app, endpoint="/metrics")

# Custom metrics
failed_login_attempts = Counter(
    'failed_login_attempts_total',
    'Total number of failed login attempts',
    ['username', 'ip_address']
)

successful_login_attempts = Counter(
    'successful_login_attempts_total',
    'Total number of successful login attempts',
    ['username']
)

mfa_verification_attempts = Counter(
    'mfa_verification_attempts_total',
    'Total number of MFA verification attempts'
)

mfa_verification_failed = Counter(
    'mfa_verification_failed_total',
    'Total number of failed MFA verifications'
)

invalid_token_attempts = Counter(
    'invalid_token_attempts_total',
    'Total number of invalid token attempts'
)

unauthorized_access_attempts = Counter(
    'unauthorized_access_attempts_total',
    'Total number of unauthorized access attempts',
    ['resource', 'action']
)

rate_limit_exceeded = Counter(
    'rate_limit_exceeded_total',
    'Total number of rate limit violations',
    ['endpoint']
)

database_query_duration = Histogram(
    'database_query_duration_seconds',
    'Database query duration in seconds',
    ['query_type']
)

active_sessions = Gauge(
    'active_sessions_total',
    'Number of active user sessions'
)

websocket_connections_active = Gauge(
    'websocket_connections_active',
    'Number of active WebSocket connections'
)
```

### Use Metrics in Code

```python
# In authentication endpoint
@app.post("/api/auth/login")
async def login(credentials: LoginCredentials):
    try:
        user = await authenticate_user(credentials)
        successful_login_attempts.labels(username=user.username).inc()
        return {"token": create_token(user)}
    except AuthenticationError:
        failed_login_attempts.labels(
            username=credentials.username,
            ip_address=request.client.host
        ).inc()
        raise HTTPException(status_code=401)

# In authorization check
def check_permission(user, resource, action):
    if not has_permission(user, resource, action):
        unauthorized_access_attempts.labels(
            resource=resource,
            action=action
        ).inc()
        raise HTTPException(status_code=403)

# In rate limiter
def check_rate_limit(endpoint):
    if is_rate_limited(endpoint):
        rate_limit_exceeded.labels(endpoint=endpoint).inc()
        raise HTTPException(status_code=429)
```

---

## Dashboard Configuration

### Security Dashboard

Create `monitoring/grafana/dashboards/security-dashboard.json`:

Key panels:
- Failed login attempts (last 24h)
- MFA verification success rate
- Invalid token attempts
- Unauthorized access attempts
- Rate limit violations
- Cross-organization access attempts

### Performance Dashboard

Key panels:
- API response time (p50, p95, p99)
- Request rate
- Error rate
- Database query duration
- Cache hit rate
- WebSocket connections

### Infrastructure Dashboard

Key panels:
- CPU usage
- Memory usage
- Disk usage
- Network I/O
- Database connections
- Redis connections

---

## Alert Testing

### Test Alert Rules

```bash
# Reload Prometheus configuration
curl -X POST http://localhost:9090/-/reload

# Check alert rules
curl http://localhost:9090/api/v1/rules

# Check active alerts
curl http://localhost:9090/api/v1/alerts
```

### Trigger Test Alerts

```bash
# Trigger failed login alert
for i in {1..100}; do
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}'
done

# Check if alert fired
curl http://localhost:9090/api/v1/alerts | jq '.data.alerts[] | select(.labels.alertname=="HighFailedLoginAttempts")'
```

### Test Alertmanager Notifications

```bash
# Send test alert to Alertmanager
curl -X POST http://localhost:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '[{
    "labels": {
      "alertname": "TestAlert",
      "severity": "warning"
    },
    "annotations": {
      "summary": "Test alert",
      "description": "This is a test alert"
    }
  }]'
```

---

## Troubleshooting

### Prometheus Not Scraping Targets

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check application metrics endpoint
curl http://localhost:8000/metrics

# Check Prometheus logs
docker logs optibid-prometheus
```

### Grafana Cannot Connect to Prometheus

```bash
# Test Prometheus from Grafana container
docker exec optibid-grafana curl http://prometheus:9090/-/healthy

# Check network connectivity
docker network inspect monitoring
```

### Alerts Not Firing

```bash
# Check alert rules syntax
promtool check rules monitoring/*.yml

# Check Prometheus logs for rule evaluation
docker logs optibid-prometheus | grep -i alert

# Verify alert conditions are met
curl http://localhost:9090/api/v1/query?query=rate(failed_login_attempts_total[5m])
```

### Alertmanager Not Sending Notifications

```bash
# Check Alertmanager configuration
curl http://localhost:9093/api/v1/status

# Check Alertmanager logs
docker logs optibid-alertmanager

# Test webhook manually
curl -X POST YOUR_SLACK_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text":"Test message"}'
```

---

## Maintenance

### Backup Prometheus Data

```bash
# Create snapshot
curl -X POST http://localhost:9090/api/v1/admin/tsdb/snapshot

# Backup data directory
docker run --rm -v prometheus-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/prometheus-backup.tar.gz /data
```

### Update Dashboards

```bash
# Export dashboard from Grafana UI
# Save to monitoring/grafana/dashboards/

# Reload Grafana provisioning
docker restart optibid-grafana
```

### Rotate Logs

```bash
# Configure log rotation in docker-compose.yml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

---

## Production Checklist

- [ ] Prometheus data retention configured (30 days minimum)
- [ ] Grafana admin password changed
- [ ] Alertmanager notifications configured and tested
- [ ] All critical alerts have runbooks
- [ ] Dashboards created for all key metrics
- [ ] Backup strategy implemented
- [ ] Monitoring stack secured (authentication, HTTPS)
- [ ] Alert fatigue minimized (appropriate thresholds)
- [ ] On-call rotation configured in PagerDuty
- [ ] Monitoring documented and team trained

---

**Last Updated:** 2025-11-23  
**Version:** 1.0
