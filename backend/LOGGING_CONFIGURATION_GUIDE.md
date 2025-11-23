# Logging Configuration Guide
## OptiBid Energy Platform

This guide provides comprehensive instructions for configuring centralized logging, log levels, log rotation, and log aggregation.

---

## Table of Contents

1. [Overview](#overview)
2. [Log Levels](#log-levels)
3. [Logging Architecture](#logging-architecture)
4. [Local Development Logging](#local-development-logging)
5. [Production Logging](#production-logging)
6. [Centralized Logging](#centralized-logging)
7. [Log Rotation](#log-rotation)
8. [Log Aggregation](#log-aggregation)
9. [Structured Logging](#structured-logging)
10. [Security Logging](#security-logging)
11. [Troubleshooting](#troubleshooting)

---

## Overview

### Logging Goals

- **Observability**: Track application behavior and performance
- **Debugging**: Identify and diagnose issues quickly
- **Security**: Audit security events and detect threats
- **Compliance**: Meet regulatory requirements for audit trails
- **Performance**: Minimal impact on application performance

### Logging Stack

```
┌─────────────────────────────────────────────────────────────┐
│                     Logging Stack                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │ Application  │────────►│   Filebeat   │                  │
│  │   Logs       │  Write  │  (Shipper)   │                  │
│  └──────────────┘         └──────┬───────┘                  │
│                                   │                           │
│                                   │ Forward                  │
│                                   ▼                           │
│                           ┌──────────────┐                  │
│                           │ Logstash     │                  │
│                           │ (Processing) │                  │
│                           └──────┬───────┘                  │
│                                   │                           │
│                                   │ Index                    │
│                                   ▼                           │
│                           ┌──────────────┐                  │
│                           │Elasticsearch │                  │
│                           │  (Storage)   │                  │
│                           └──────┬───────┘                  │
│                                   │                           │
│                                   │ Query                    │
│                                   ▼                           │
│                           ┌──────────────┐                  │
│                           │    Kibana    │                  │
│                           │(Visualization)│                  │
│                           └──────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Log Levels

### Standard Log Levels

| Level | Value | Usage | Production |
|-------|-------|-------|------------|
| DEBUG | 10 | Detailed diagnostic information | ❌ No |
| INFO | 20 | General informational messages | ✓ Yes |
| WARNING | 30 | Warning messages for potential issues | ✓ Yes |
| ERROR | 40 | Error messages for failures | ✓ Yes |
| CRITICAL | 50 | Critical failures requiring immediate attention | ✓ Yes |

### Environment-Specific Levels

```bash
# Development
LOG_LEVEL=DEBUG

# Staging
LOG_LEVEL=INFO

# Production
LOG_LEVEL=WARNING
```

### Component-Specific Levels

```python
# In config.py
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "loggers": {
        "app": {"level": "INFO"},
        "app.security": {"level": "WARNING"},
        "app.database": {"level": "WARNING"},
        "app.api": {"level": "INFO"},
        "uvicorn": {"level": "INFO"},
        "sqlalchemy": {"level": "WARNING"},
    }
}
```

---

## Logging Architecture

### Log Types

1. **Application Logs**: General application events
2. **Access Logs**: HTTP request/response logs
3. **Error Logs**: Application errors and exceptions
4. **Security Logs**: Authentication, authorization, security events
5. **Audit Logs**: User actions and data changes
6. **Performance Logs**: Performance metrics and slow queries

### Log Destinations

1. **Console (stdout/stderr)**: Development and container logs
2. **File**: Local file storage with rotation
3. **Syslog**: System logging daemon
4. **Centralized**: ELK Stack, CloudWatch, Splunk

---

## Local Development Logging

### Basic Configuration

Create `backend/app/core/logging_config.py`:

```python
import logging
import sys
from typing import Dict, Any
from app.core.config import settings

def get_logging_config() -> Dict[str, Any]:
    """Get logging configuration based on environment"""
    
    # Base configuration
    config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "detailed": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "json": {
                "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
                "format": "%(asctime)s %(name)s %(levelname)s %(funcName)s %(lineno)d %(message)s",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": settings.LOG_LEVEL,
                "formatter": "default",
                "stream": sys.stdout,
            },
        },
        "root": {
            "level": settings.LOG_LEVEL,
            "handlers": ["console"],
        },
        "loggers": {
            "app": {
                "level": settings.LOG_LEVEL,
                "handlers": ["console"],
                "propagate": False,
            },
            "uvicorn": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False,
            },
            "sqlalchemy.engine": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
        },
    }
    
    return config

def setup_logging():
    """Setup logging configuration"""
    import logging.config
    config = get_logging_config()
    logging.config.dictConfig(config)
```

### Usage in Application

```python
# In main.py
from app.core.logging_config import setup_logging

# Setup logging on startup
setup_logging()

# Use logger
import logging
logger = logging.getLogger("app")

logger.info("Application started")
logger.warning("This is a warning")
logger.error("This is an error")
```

---

## Production Logging

### File-Based Logging

```python
# Add file handler to logging config
"handlers": {
    "console": {
        "class": "logging.StreamHandler",
        "level": settings.LOG_LEVEL,
        "formatter": "json",
        "stream": sys.stdout,
    },
    "file": {
        "class": "logging.handlers.RotatingFileHandler",
        "level": settings.LOG_LEVEL,
        "formatter": "json",
        "filename": "/var/log/optibid/application.log",
        "maxBytes": 10485760,  # 10MB
        "backupCount": 10,
    },
    "error_file": {
        "class": "logging.handlers.RotatingFileHandler",
        "level": "ERROR",
        "formatter": "detailed",
        "filename": "/var/log/optibid/error.log",
        "maxBytes": 10485760,  # 10MB
        "backupCount": 10,
    },
    "security_file": {
        "class": "logging.handlers.RotatingFileHandler",
        "level": "INFO",
        "formatter": "json",
        "filename": "/var/log/optibid/security.log",
        "maxBytes": 10485760,  # 10MB
        "backupCount": 30,  # Keep more security logs
    },
},
"root": {
    "level": settings.LOG_LEVEL,
    "handlers": ["console", "file", "error_file"],
},
"loggers": {
    "app.security": {
        "level": "INFO",
        "handlers": ["security_file"],
        "propagate": False,
    },
}
```

### Environment Configuration

```bash
# Production .env
LOG_LEVEL=WARNING
LOG_FORMAT=json
LOG_FILE_PATH=/var/log/optibid/application.log
LOG_MAX_BYTES=10485760
LOG_BACKUP_COUNT=10
```

---

## Centralized Logging

### Option 1: ELK Stack (Elasticsearch, Logstash, Kibana)

#### Docker Compose Configuration

Create `docker-compose.logging.yml`:

```yaml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.10.0
    container_name: optibid-elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    networks:
      - logging

  logstash:
    image: docker.elastic.co/logstash/logstash:8.10.0
    container_name: optibid-logstash
    ports:
      - "5000:5000"
      - "9600:9600"
    volumes:
      - ./logging/logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    networks:
      - logging
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.10.0
    container_name: optibid-kibana
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    networks:
      - logging
    depends_on:
      - elasticsearch

  filebeat:
    image: docker.elastic.co/beats/filebeat:8.10.0
    container_name: optibid-filebeat
    user: root
    volumes:
      - ./logging/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
      - /var/log/optibid:/var/log/optibid:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - logging
    depends_on:
      - logstash

volumes:
  elasticsearch-data:

networks:
  logging:
    driver: bridge
```

#### Logstash Configuration

Create `logging/logstash.conf`:

```conf
input {
  beats {
    port => 5000
  }
}

filter {
  # Parse JSON logs
  if [message] =~ /^\{.*\}$/ {
    json {
      source => "message"
    }
  }
  
  # Add timestamp
  date {
    match => [ "timestamp", "ISO8601" ]
    target => "@timestamp"
  }
  
  # Parse log level
  if [levelname] {
    mutate {
      rename => { "levelname" => "log_level" }
    }
  }
  
  # Extract security events
  if [name] == "app.security" {
    mutate {
      add_tag => [ "security" ]
    }
  }
  
  # Extract error events
  if [log_level] == "ERROR" or [log_level] == "CRITICAL" {
    mutate {
      add_tag => [ "error" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "optibid-logs-%{+YYYY.MM.dd}"
  }
  
  # Output errors to separate index
  if "error" in [tags] {
    elasticsearch {
      hosts => ["elasticsearch:9200"]
      index => "optibid-errors-%{+YYYY.MM.dd}"
    }
  }
  
  # Output security events to separate index
  if "security" in [tags] {
    elasticsearch {
      hosts => ["elasticsearch:9200"]
      index => "optibid-security-%{+YYYY.MM.dd}"
    }
  }
}
```

#### Filebeat Configuration

Create `logging/filebeat.yml`:

```yaml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/optibid/*.log
    json.keys_under_root: true
    json.add_error_key: true
    fields:
      app: optibid
      environment: ${ENVIRONMENT:production}

  - type: container
    enabled: true
    paths:
      - '/var/lib/docker/containers/*/*.log'
    processors:
      - add_docker_metadata:
          host: "unix:///var/run/docker.sock"

output.logstash:
  hosts: ["logstash:5000"]

logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/filebeat
  name: filebeat
  keepfiles: 7
  permissions: 0644
```

### Option 2: AWS CloudWatch

```python
# Install watchtower
# pip install watchtower

import watchtower
import boto3

# Add CloudWatch handler
cloudwatch_handler = watchtower.CloudWatchLogHandler(
    log_group="/optibid/application",
    stream_name="{machine_name}/{logger_name}",
    boto3_client=boto3.client("logs", region_name="us-east-1")
)

# Add to logging config
"handlers": {
    "cloudwatch": {
        "()": "watchtower.CloudWatchLogHandler",
        "log_group": "/optibid/application",
        "stream_name": "{machine_name}/{logger_name}",
        "level": "INFO",
        "formatter": "json",
    },
}
```

### Option 3: Splunk

```python
# Install splunk-handler
# pip install splunk-handler

from splunk_handler import SplunkHandler

splunk_handler = SplunkHandler(
    host='splunk.example.com',
    port='8088',
    token='YOUR-SPLUNK-TOKEN',
    index='optibid',
    sourcetype='json'
)

# Add to logging config
"handlers": {
    "splunk": {
        "()": "splunk_handler.SplunkHandler",
        "host": "splunk.example.com",
        "port": "8088",
        "token": "YOUR-SPLUNK-TOKEN",
        "index": "optibid",
        "sourcetype": "json",
        "level": "INFO",
        "formatter": "json",
    },
}
```

---

## Log Rotation

### Using RotatingFileHandler

```python
from logging.handlers import RotatingFileHandler

handler = RotatingFileHandler(
    filename="/var/log/optibid/application.log",
    maxBytes=10485760,  # 10MB
    backupCount=10,     # Keep 10 backup files
)
```

### Using TimedRotatingFileHandler

```python
from logging.handlers import TimedRotatingFileHandler

handler = TimedRotatingFileHandler(
    filename="/var/log/optibid/application.log",
    when="midnight",    # Rotate at midnight
    interval=1,         # Every 1 day
    backupCount=30,     # Keep 30 days
)
```

### Using logrotate (Linux)

Create `/etc/logrotate.d/optibid`:

```conf
/var/log/optibid/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 optibid optibid
    sharedscripts
    postrotate
        systemctl reload optibid
    endscript
}
```

Test logrotate:

```bash
# Test configuration
logrotate -d /etc/logrotate.d/optibid

# Force rotation
logrotate -f /etc/logrotate.d/optibid
```

---

## Log Aggregation

### Querying Logs in Kibana

1. Access Kibana: `http://localhost:5601`
2. Create index pattern: `optibid-logs-*`
3. Discover logs with filters:
   - `log_level: ERROR`
   - `name: app.security`
   - `@timestamp: [now-1h TO now]`

### Creating Kibana Dashboards

1. Navigate to Dashboard → Create dashboard
2. Add visualizations:
   - Error rate over time
   - Log level distribution
   - Top error messages
   - Security events timeline
   - API response times

### Setting Up Alerts

1. Navigate to Stack Management → Rules and Connectors
2. Create rule:
   - Type: Elasticsearch query
   - Index: `optibid-errors-*`
   - Query: `log_level: CRITICAL`
   - Threshold: > 0
   - Action: Send email/Slack notification

---

## Structured Logging

### JSON Logging

```python
# Install python-json-logger
# pip install python-json-logger

from pythonjsonlogger import jsonlogger

# Configure JSON formatter
formatter = jsonlogger.JsonFormatter(
    "%(asctime)s %(name)s %(levelname)s %(funcName)s %(lineno)d %(message)s"
)

# Use in logging config
"formatters": {
    "json": {
        "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
        "format": "%(asctime)s %(name)s %(levelname)s %(funcName)s %(lineno)d %(message)s",
    },
}
```

### Structured Log Messages

```python
import logging
import json

logger = logging.getLogger("app")

# Bad - Unstructured
logger.info(f"User {user_id} logged in from {ip_address}")

# Good - Structured
logger.info(
    "User logged in",
    extra={
        "user_id": user_id,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "event_type": "login",
    }
)
```

### Context Logging

```python
from contextvars import ContextVar

# Create context variable for request ID
request_id_var: ContextVar[str] = ContextVar("request_id", default="")

# Middleware to set request ID
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request_id_var.set(request_id)
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# Custom filter to add request ID to logs
class RequestIDFilter(logging.Filter):
    def filter(self, record):
        record.request_id = request_id_var.get()
        return True

# Add filter to handlers
handler.addFilter(RequestIDFilter())

# Update formatter to include request_id
"format": "%(asctime)s - %(request_id)s - %(name)s - %(levelname)s - %(message)s"
```

---

## Security Logging

### What to Log

1. **Authentication Events**
   - Login attempts (success/failure)
   - Logout events
   - Password changes
   - MFA verification
   - Account lockouts

2. **Authorization Events**
   - Permission denied
   - Role changes
   - Privilege escalation attempts
   - Cross-organization access attempts

3. **Data Access**
   - Sensitive data access
   - Data exports
   - Data deletions
   - Bulk operations

4. **Security Events**
   - Rate limit violations
   - Invalid tokens
   - SQL injection attempts
   - XSS attempts
   - CSRF attempts

### Security Logging Example

```python
import logging

security_logger = logging.getLogger("app.security")

# Login attempt
security_logger.info(
    "Login attempt",
    extra={
        "event_type": "login_attempt",
        "username": username,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "success": False,
        "failure_reason": "invalid_password",
    }
)

# Unauthorized access
security_logger.warning(
    "Unauthorized access attempt",
    extra={
        "event_type": "unauthorized_access",
        "user_id": user_id,
        "resource": resource,
        "action": action,
        "ip_address": ip_address,
    }
)

# Security incident
security_logger.critical(
    "Security incident detected",
    extra={
        "event_type": "security_incident",
        "incident_type": "sql_injection",
        "user_id": user_id,
        "ip_address": ip_address,
        "payload": sanitized_payload,
    }
)
```

### Sensitive Data Masking

```python
import re

def mask_sensitive_data(data: dict) -> dict:
    """Mask sensitive data in logs"""
    sensitive_fields = ["password", "token", "api_key", "secret"]
    
    masked_data = data.copy()
    for key, value in masked_data.items():
        if any(field in key.lower() for field in sensitive_fields):
            masked_data[key] = "***REDACTED***"
        elif isinstance(value, str):
            # Mask credit card numbers
            masked_data[key] = re.sub(r'\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}', '****-****-****-****', value)
            # Mask email addresses
            masked_data[key] = re.sub(r'[\w\.-]+@[\w\.-]+', '***@***.***', value)
    
    return masked_data

# Use in logging
logger.info("User data", extra=mask_sensitive_data(user_data))
```

---

## Troubleshooting

### Logs Not Appearing

```bash
# Check log file permissions
ls -la /var/log/optibid/

# Check log directory exists
mkdir -p /var/log/optibid
chown optibid:optibid /var/log/optibid

# Check logging configuration
python -c "from app.core.logging_config import get_logging_config; import json; print(json.dumps(get_logging_config(), indent=2))"

# Check log level
echo $LOG_LEVEL
```

### Elasticsearch Connection Issues

```bash
# Check Elasticsearch is running
curl http://localhost:9200/_cluster/health

# Check Logstash is receiving logs
curl http://localhost:9600/_node/stats/pipelines

# Check Filebeat is shipping logs
docker logs optibid-filebeat
```

### High Log Volume

```bash
# Check log file sizes
du -sh /var/log/optibid/*

# Check log rotation
logrotate -d /etc/logrotate.d/optibid

# Increase log level to reduce volume
LOG_LEVEL=WARNING
```

---

## Production Checklist

- [ ] Log level set to WARNING or ERROR
- [ ] JSON logging enabled
- [ ] Log rotation configured
- [ ] Centralized logging set up (ELK/CloudWatch/Splunk)
- [ ] Security logging enabled
- [ ] Sensitive data masking implemented
- [ ] Log retention policy defined
- [ ] Log backup strategy implemented
- [ ] Log monitoring and alerting configured
- [ ] Team trained on log analysis

---

**Last Updated:** 2025-11-23  
**Version:** 1.0
