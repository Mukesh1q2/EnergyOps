# OptiBid Energy Platform - Logging Configuration Guide

## Overview

The OptiBid platform uses a comprehensive centralized logging system with support for:
- Structured JSON logging in production
- Multiple log handlers (console, file, rotating files)
- Log aggregation with ELK stack (Elasticsearch, Logstash, Kibana)
- Automatic log rotation
- Security event logging
- Performance monitoring logs

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Application Logs                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Console     │  │  File        │  │  Rotating    │      │
│  │  Handler     │  │  Handler     │  │  File        │      │
│  │              │  │              │  │  Handler     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
│         └─────────────────┼─────────────────┘               │
│                           │                                  │
│                    ┌──────▼───────┐                         │
│                    │   Filebeat   │                         │
│                    │  (Log        │                         │
│                    │   Shipper)   │                         │
│                    └──────┬───────┘                         │
│                           │                                  │
│                    ┌──────▼───────┐                         │
│                    │   Logstash   │                         │
│                    │  (Log        │                         │
│                    │   Processor) │                         │
│                    └──────┬───────┘                         │
│                           │                                  │
│                    ┌──────▼───────┐                         │
│                    │Elasticsearch │                         │
│                    │  (Log        │                         │
│                    │   Storage)   │                         │
│                    └──────┬───────┘                         │
│                           │                                  │
│                    ┌──────▼───────┐                         │
│                    │    Kibana    │                         │
│                    │  (Log        │                         │
│                    │   Viewer)    │                         │
│                    └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

## Log Levels

The platform supports standard Python logging levels:

| Level    | Value | Usage                                      |
|----------|-------|--------------------------------------------|
| DEBUG    | 10    | Detailed diagnostic information            |
| INFO     | 20    | General informational messages             |
| WARNING  | 30    | Warning messages for potential issues      |
| ERROR    | 40    | Error messages for failures                |
| CRITICAL | 50    | Critical errors requiring immediate action |

### Environment-Specific Log Levels

- **Development**: `DEBUG` - All logs including detailed diagnostics
- **Staging**: `INFO` - Informational and above
- **Production**: `WARNING` - Warnings, errors, and critical only (configurable via `LOG_LEVEL` env var)

## Log Files

### Production Log Files

All production logs are stored in `/var/log/optibid/`:

| File              | Purpose                          | Rotation      | Retention |
|-------------------|----------------------------------|---------------|-----------|
| application.log   | General application logs         | 10MB, 10 files| ~100MB    |
| error.log         | Error and critical logs only     | 10MB, 10 files| ~100MB    |
| security.log      | Security events and audit trail  | 10MB, 30 files| ~300MB    |
| access.log        | API access logs                  | 10MB, 10 files| ~100MB    |

### Log Rotation

Logs are automatically rotated using Python's `RotatingFileHandler`:
- **Max file size**: 10MB per file
- **Backup count**: 10 files (30 for security logs)
- **Total storage**: ~100MB per log type (~300MB for security)
- **Encoding**: UTF-8

When a log file reaches 10MB, it's renamed with a numeric suffix (e.g., `application.log.1`) and a new file is created.

## Log Formats

### Development Format (Detailed)

```
2024-11-23 14:30:45 - app.api - INFO - handle_request:123 - Processing bid submission
```

Format: `%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s`

### Production Format (JSON)

```json
{
  "asctime": "2024-11-23T14:30:45.123Z",
  "name": "app.api",
  "levelname": "INFO",
  "funcName": "handle_request",
  "lineno": 123,
  "message": "Processing bid submission",
  "request_id": "abc123",
  "user_id": "user_456",
  "organization_id": "org_789"
}
```

JSON format enables:
- Easy parsing by log aggregation tools
- Structured querying in Elasticsearch
- Consistent field extraction
- Better analytics and monitoring

## Logger Hierarchy

### Application Loggers

| Logger Name       | Purpose                          | Level     |
|-------------------|----------------------------------|-----------|
| app               | Main application logger          | LOG_LEVEL |
| app.api           | API request/response logging     | LOG_LEVEL |
| app.security      | Security events                  | INFO      |
| app.database      | Database operations              | WARNING   |
| uvicorn           | Web server logs                  | INFO      |
| uvicorn.access    | HTTP access logs                 | INFO      |
| sqlalchemy.engine | SQL query logs                   | WARNING   |
| sqlalchemy.pool   | Connection pool logs             | WARNING   |

### Usage Examples

```python
import logging

# Get logger
logger = logging.getLogger("app.api")

# Log messages
logger.debug("Detailed diagnostic information")
logger.info("General informational message")
logger.warning("Warning message")
logger.error("Error message")
logger.critical("Critical error")

# Log with extra context
logger.info(
    "User logged in",
    extra={
        "user_id": "user_123",
        "ip_address": "192.168.1.1",
        "event_type": "login"
    }
)
```

## Structured Logging Utilities

### Security Event Logging

```python
from app.core.logging_config import log_security_event

log_security_event(
    event_type="login_success",
    message="User logged in successfully",
    user_id="user_123",
    ip_address="192.168.1.1",
    user_agent="Mozilla/5.0..."
)
```

### API Request Logging

```python
from app.core.logging_config import log_api_request

log_api_request(
    method="POST",
    path="/api/bids",
    status_code=201,
    duration_ms=45.2,
    user_id="user_123",
    request_id="req_abc123"
)
```

### Database Query Logging

```python
from app.core.logging_config import log_database_query

log_database_query(
    query_type="SELECT",
    duration_ms=12.5,
    table="bids",
    rows_affected=10
)
```

## Sensitive Data Masking

The logging system automatically masks sensitive data:

```python
from app.core.logging_config import mask_sensitive_data

data = {
    "username": "john.doe",
    "password": "secret123",
    "email": "john.doe@example.com",
    "credit_card": "4111-1111-1111-1111"
}

masked = mask_sensitive_data(data)
# Result:
# {
#     "username": "john.doe",
#     "password": "***REDACTED***",
#     "email": "j***@example.com",
#     "credit_card": "****-****-****-****"
# }
```

Automatically masked fields:
- Passwords
- Tokens and API keys
- Credit card numbers
- Email addresses (partially)
- Phone numbers
- Social security numbers

## Configuration

### Environment Variables

```bash
# Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
LOG_LEVEL=INFO

# Environment (development, staging, production)
ENVIRONMENT=production

# Sentry DSN for error tracking (optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
```

### Programmatic Configuration

```python
from app.core.logging_config import setup_logging

# Initialize logging at application startup
setup_logging()
```

## Log Aggregation with ELK Stack

### Filebeat Configuration

Filebeat ships logs from files to Logstash:

```yaml
# Location: logging/filebeat.yml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/optibid/application.log
    json.keys_under_root: true
    fields:
      log_type: application
      app: optibid
```

### Logstash Configuration

Logstash processes and enriches logs:

```ruby
# Location: logging/logstash.conf
filter {
  # Parse JSON logs
  json {
    source => "message"
  }
  
  # Add severity score
  if [log_level] == "CRITICAL" {
    mutate {
      add_field => { "severity_score" => 5 }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "optibid-logs-%{+YYYY.MM.dd}"
  }
}
```

### Elasticsearch Indices

Logs are stored in daily indices:

| Index Pattern              | Purpose           | Retention |
|----------------------------|-------------------|-----------|
| optibid-logs-*             | All logs          | 30 days   |
| optibid-errors-*           | Errors only       | 90 days   |
| optibid-security-*         | Security events   | 365 days  |
| optibid-access-*           | API access logs   | 30 days   |

### Kibana Dashboards

Access logs via Kibana at `http://kibana:5601`

Pre-configured dashboards:
- **Application Overview**: General application health and activity
- **Error Analysis**: Error trends and patterns
- **Security Monitoring**: Security events and anomalies
- **API Performance**: API response times and status codes
- **User Activity**: User actions and behavior

## Monitoring and Alerting

### Log-Based Alerts

Configure alerts in Kibana for:

1. **High Error Rate**
   - Trigger: >10 errors per minute
   - Action: Send email/Slack notification

2. **Security Events**
   - Trigger: Failed login attempts >5 in 5 minutes
   - Action: Alert security team

3. **Slow API Responses**
   - Trigger: Response time >2 seconds
   - Action: Alert DevOps team

4. **Service Unavailability**
   - Trigger: No logs received for 5 minutes
   - Action: Page on-call engineer

### Health Check Integration

The `/health` endpoint includes logging system status:

```bash
curl http://localhost:8000/health
```

Response includes:
```json
{
  "status": "healthy",
  "services": {
    "logging": {
      "status": "available",
      "handlers": ["console", "file", "rotating_file"],
      "log_level": "INFO"
    }
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Logs Not Appearing

**Symptom**: No logs in files or console

**Solutions**:
- Check `LOG_LEVEL` environment variable
- Verify log directory permissions: `chmod 755 /var/log/optibid`
- Check disk space: `df -h`
- Verify logging is initialized: Look for "Logging configured" message

#### 2. Log Files Not Rotating

**Symptom**: Single log file growing indefinitely

**Solutions**:
- Verify `RotatingFileHandler` is configured
- Check file permissions
- Ensure application has write access to log directory
- Review `maxBytes` and `backupCount` settings

#### 3. Missing Logs in Elasticsearch

**Symptom**: Logs in files but not in Elasticsearch

**Solutions**:
- Check Filebeat status: `systemctl status filebeat`
- Verify Filebeat configuration: `filebeat test config`
- Check Logstash status: `systemctl status logstash`
- Review Logstash logs: `tail -f /var/log/logstash/logstash-plain.log`
- Test Elasticsearch connection: `curl http://elasticsearch:9200/_cluster/health`

#### 4. High Disk Usage

**Symptom**: Log files consuming too much disk space

**Solutions**:
- Reduce `backupCount` in logging configuration
- Implement log cleanup cron job
- Adjust log retention policies in Elasticsearch
- Increase log level to reduce verbosity

### Log Cleanup

Manual cleanup of old logs:

```bash
# Remove logs older than 30 days
find /var/log/optibid -name "*.log.*" -mtime +30 -delete

# Remove old Elasticsearch indices
curl -X DELETE "http://elasticsearch:9200/optibid-logs-2024.10.*"
```

Automated cleanup with cron:

```bash
# Add to crontab
0 2 * * * find /var/log/optibid -name "*.log.*" -mtime +30 -delete
```

## Performance Considerations

### Log Volume

Typical log volumes:
- **Development**: ~100MB/day
- **Staging**: ~500MB/day
- **Production**: ~2-5GB/day (depends on traffic)

### Performance Impact

Logging overhead:
- **Console logging**: ~0.1ms per log entry
- **File logging**: ~0.5ms per log entry
- **JSON formatting**: ~0.2ms per log entry
- **Total**: <1ms per log entry

### Optimization Tips

1. **Use appropriate log levels**
   - Production: WARNING or INFO
   - Development: DEBUG

2. **Avoid logging in tight loops**
   ```python
   # Bad
   for item in large_list:
       logger.debug(f"Processing {item}")
   
   # Good
   logger.debug(f"Processing {len(large_list)} items")
   ```

3. **Use lazy evaluation**
   ```python
   # Bad - string formatting always happens
   logger.debug("User data: " + str(user_data))
   
   # Good - formatting only if DEBUG enabled
   logger.debug("User data: %s", user_data)
   ```

4. **Batch log writes**
   - Use buffered handlers for high-volume logs
   - Configure appropriate flush intervals

## Security Best Practices

1. **Never log sensitive data**
   - Use `mask_sensitive_data()` utility
   - Avoid logging passwords, tokens, API keys

2. **Encrypt security logs**
   - Enable `AUDIT_LOG_ENCRYPTED` in production
   - Use encryption at rest for log storage

3. **Restrict log access**
   - Set appropriate file permissions (640)
   - Limit access to log directories
   - Use RBAC in Kibana

4. **Monitor for security events**
   - Set up alerts for suspicious patterns
   - Review security logs regularly
   - Implement log integrity checks

5. **Comply with regulations**
   - Retain logs per compliance requirements (GDPR, SOC2)
   - Implement log anonymization where required
   - Document log retention policies

## Testing

### Test Logging Configuration

```python
import logging
from app.core.logging_config import setup_logging

# Initialize logging
setup_logging()

# Test different log levels
logger = logging.getLogger("app")
logger.debug("Debug message")
logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message")
logger.critical("Critical message")

# Test structured logging
logger.info(
    "Test event",
    extra={
        "event_type": "test",
        "test_id": "test_123"
    }
)
```

### Verify Log Rotation

```bash
# Generate large log file
for i in {1..100000}; do
  echo "Test log entry $i" >> /var/log/optibid/application.log
done

# Check rotation
ls -lh /var/log/optibid/application.log*
```

### Test Log Aggregation

```bash
# Check Filebeat is shipping logs
curl http://localhost:5066/stats

# Query Elasticsearch
curl -X GET "http://elasticsearch:9200/optibid-logs-*/_search?pretty" \
  -H 'Content-Type: application/json' \
  -d '{"query": {"match_all": {}}, "size": 10}'

# View in Kibana
# Navigate to http://kibana:5601
# Go to Discover > optibid-logs-*
```

## References

- [Python Logging Documentation](https://docs.python.org/3/library/logging.html)
- [Filebeat Documentation](https://www.elastic.co/guide/en/beats/filebeat/current/index.html)
- [Logstash Documentation](https://www.elastic.co/guide/en/logstash/current/index.html)
- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Kibana Documentation](https://www.elastic.co/guide/en/kibana/current/index.html)

## Support

For logging-related issues:
1. Check this documentation
2. Review application logs
3. Check ELK stack health
4. Contact DevOps team
