# OptiBid Logging - Quick Reference Guide

## Quick Start

### 1. Basic Logging

```python
import logging

# Get logger
logger = logging.getLogger("app")

# Log messages
logger.info("User logged in")
logger.warning("High memory usage detected")
logger.error("Failed to connect to database")
```

### 2. Structured Logging

```python
# Add context to logs
logger.info(
    "Bid submitted",
    extra={
        "user_id": "user_123",
        "bid_id": "bid_456",
        "amount": 1000.50
    }
)
```

### 3. Security Events

```python
from app.core.logging_config import log_security_event

log_security_event(
    event_type="login_success",
    message="User logged in",
    user_id="user_123",
    ip_address="192.168.1.1"
)
```

### 4. API Requests

```python
from app.core.logging_config import log_api_request

log_api_request(
    method="POST",
    path="/api/bids",
    status_code=201,
    duration_ms=45.2
)
```

### 5. Database Queries

```python
from app.core.logging_config import log_database_query

log_database_query(
    query_type="SELECT",
    duration_ms=12.5,
    table="bids"
)
```

## Log Levels

| Level    | When to Use                           |
|----------|---------------------------------------|
| DEBUG    | Detailed diagnostic information       |
| INFO     | General informational messages        |
| WARNING  | Potential issues or degraded service  |
| ERROR    | Errors that need attention            |
| CRITICAL | Critical failures requiring immediate action |

## Environment Configuration

### Development
```bash
ENVIRONMENT=development
LOG_LEVEL=DEBUG
```
- Console output only
- Detailed formatting with function names and line numbers
- All log levels visible

### Production
```bash
ENVIRONMENT=production
LOG_LEVEL=WARNING
```
- File output with rotation
- JSON structured logging
- Only warnings, errors, and critical logs

## Log Files (Production)

| File            | Purpose                    | Location                      |
|-----------------|----------------------------|-------------------------------|
| application.log | All application logs       | /var/log/optibid/application.log |
| error.log       | Errors and critical only   | /var/log/optibid/error.log    |
| security.log    | Security events            | /var/log/optibid/security.log |
| access.log      | API access logs            | /var/log/optibid/access.log   |

## Sensitive Data Masking

```python
from app.core.logging_config import mask_sensitive_data

data = {
    "username": "john",
    "password": "secret",  # Will be masked
    "email": "john@example.com"  # Will be partially masked
}

masked = mask_sensitive_data(data)
# Result: {"username": "john", "password": "***REDACTED***", "email": "j***@example.com"}
```

Automatically masked:
- Passwords
- Tokens
- API keys
- Credit cards
- Email addresses (partial)
- Phone numbers

## Common Patterns

### Exception Logging
```python
try:
    # Some operation
    result = risky_operation()
except Exception as e:
    logger.exception("Operation failed")  # Includes stack trace
```

### Conditional Logging
```python
if logger.isEnabledFor(logging.DEBUG):
    logger.debug(f"Expensive operation result: {expensive_function()}")
```

### Context Manager
```python
with logger.contextualize(request_id="req_123"):
    logger.info("Processing request")
```

## Viewing Logs

### Console (Development)
Logs appear in terminal where application is running

### Files (Production)
```bash
# View latest logs
tail -f /var/log/optibid/application.log

# Search for errors
grep ERROR /var/log/optibid/application.log

# View last 100 lines
tail -n 100 /var/log/optibid/application.log
```

### Kibana (Production with ELK)
1. Navigate to http://kibana:5601
2. Go to Discover
3. Select index pattern: `optibid-logs-*`
4. Filter and search logs

## Troubleshooting

### No logs appearing
1. Check LOG_LEVEL environment variable
2. Verify logger name matches configured loggers
3. Check file permissions on /var/log/optibid

### Logs not rotating
1. Verify RotatingFileHandler is configured
2. Check disk space
3. Ensure write permissions

### Missing logs in Elasticsearch
1. Check Filebeat status: `systemctl status filebeat`
2. Verify Logstash is running: `systemctl status logstash`
3. Test Elasticsearch: `curl http://elasticsearch:9200/_cluster/health`

## Performance Tips

1. Use appropriate log level (WARNING in production)
2. Avoid logging in tight loops
3. Use lazy evaluation: `logger.debug("Data: %s", data)` not `logger.debug(f"Data: {data}")`
4. Don't log large objects

## Security Best Practices

1. Never log passwords or tokens directly
2. Use `mask_sensitive_data()` for user data
3. Enable `AUDIT_LOG_ENCRYPTED` in production
4. Restrict access to log files (chmod 640)
5. Review security logs regularly

## Testing

Run logging tests:
```bash
cd backend
python test_logging_config.py
```

## Support

For detailed documentation, see: `LOGGING_CONFIGURATION.md`
