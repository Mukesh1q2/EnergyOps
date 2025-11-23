"""
OptiBid Energy Platform - Logging Configuration
Centralized logging configuration with support for multiple handlers and formatters
"""

import logging
import logging.config
import sys
from typing import Dict, Any
from pathlib import Path

from app.core.config import settings


def get_logging_config() -> Dict[str, Any]:
    """
    Get logging configuration based on environment
    
    Returns comprehensive logging configuration with:
    - Console handler for development
    - File handlers for production
    - JSON formatting for structured logging
    - Separate handlers for errors and security events
    """
    
    # Determine log format based on environment
    if settings.ENVIRONMENT == "production":
        default_formatter = "json"
    else:
        default_formatter = "detailed"
    
    # Base configuration
    config = {
        "version": 1,
        "disable_existing_loggers": False,
        
        "formatters": {
            # Simple format for development
            "simple": {
                "format": "%(levelname)s - %(message)s",
            },
            
            # Default format with timestamp
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            
            # Detailed format with function and line number
            "detailed": {
                "format": (
                    "%(asctime)s - %(name)s - %(levelname)s - "
                    "%(funcName)s:%(lineno)d - %(message)s"
                ),
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            
            # JSON format for structured logging
            "json": {
                "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
                "format": (
                    "%(asctime)s %(name)s %(levelname)s %(funcName)s "
                    "%(lineno)d %(message)s"
                ),
            },
        },
        
        "handlers": {
            # Console handler (always enabled)
            "console": {
                "class": "logging.StreamHandler",
                "level": settings.LOG_LEVEL,
                "formatter": default_formatter,
                "stream": sys.stdout,
            },
        },
        
        "root": {
            "level": settings.LOG_LEVEL,
            "handlers": ["console"],
        },
        
        "loggers": {
            # Application logger
            "app": {
                "level": settings.LOG_LEVEL,
                "handlers": ["console"],
                "propagate": False,
            },
            
            # Security logger
            "app.security": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False,
            },
            
            # Database logger
            "app.database": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            
            # API logger
            "app.api": {
                "level": settings.LOG_LEVEL,
                "handlers": ["console"],
                "propagate": False,
            },
            
            # Uvicorn logger
            "uvicorn": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False,
            },
            
            # Uvicorn access logger
            "uvicorn.access": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False,
            },
            
            # SQLAlchemy logger (reduce verbosity)
            "sqlalchemy.engine": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            
            # SQLAlchemy pool logger
            "sqlalchemy.pool": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
        },
    }
    
    # Add file handlers for production
    if settings.ENVIRONMENT == "production":
        # Ensure log directory exists
        log_dir = Path("/var/log/optibid")
        log_dir.mkdir(parents=True, exist_ok=True)
        
        # Application log file
        config["handlers"]["file"] = {
            "class": "logging.handlers.RotatingFileHandler",
            "level": settings.LOG_LEVEL,
            "formatter": "json",
            "filename": str(log_dir / "application.log"),
            "maxBytes": 10485760,  # 10MB
            "backupCount": 10,
            "encoding": "utf-8",
        }
        
        # Error log file
        config["handlers"]["error_file"] = {
            "class": "logging.handlers.RotatingFileHandler",
            "level": "ERROR",
            "formatter": "detailed",
            "filename": str(log_dir / "error.log"),
            "maxBytes": 10485760,  # 10MB
            "backupCount": 10,
            "encoding": "utf-8",
        }
        
        # Security log file
        config["handlers"]["security_file"] = {
            "class": "logging.handlers.RotatingFileHandler",
            "level": "INFO",
            "formatter": "json",
            "filename": str(log_dir / "security.log"),
            "maxBytes": 10485760,  # 10MB
            "backupCount": 30,  # Keep more security logs
            "encoding": "utf-8",
        }
        
        # Access log file
        config["handlers"]["access_file"] = {
            "class": "logging.handlers.RotatingFileHandler",
            "level": "INFO",
            "formatter": "json",
            "filename": str(log_dir / "access.log"),
            "maxBytes": 10485760,  # 10MB
            "backupCount": 10,
            "encoding": "utf-8",
        }
        
        # Update root and logger handlers
        config["root"]["handlers"] = ["console", "file", "error_file"]
        config["loggers"]["app"]["handlers"] = ["console", "file", "error_file"]
        config["loggers"]["app.security"]["handlers"] = ["console", "security_file"]
        config["loggers"]["uvicorn.access"]["handlers"] = ["console", "access_file"]
    
    return config


def setup_logging():
    """
    Setup logging configuration
    
    This should be called once at application startup to configure
    all loggers with the appropriate handlers and formatters.
    """
    config = get_logging_config()
    logging.config.dictConfig(config)
    
    # Log startup message
    logger = logging.getLogger("app")
    logger.info(
        f"Logging configured for {settings.ENVIRONMENT} environment "
        f"with level {settings.LOG_LEVEL}"
    )
    
    # Log configuration details
    if settings.ENVIRONMENT == "production":
        logger.info("Production logging enabled:")
        logger.info("  - JSON structured logging")
        logger.info("  - File rotation: 10MB per file, 10 backups")
        logger.info("  - Security logs: 30 backups")
        logger.info("  - Log directory: /var/log/optibid")
    else:
        logger.info("Development logging enabled:")
        logger.info("  - Console output with detailed formatting")
        logger.info("  - No file logging")


# Custom filter to add request context
class RequestContextFilter(logging.Filter):
    """
    Add request context to log records
    
    This filter adds request_id, user_id, and other contextual
    information to log records for better traceability.
    """
    
    def filter(self, record):
        # Try to get request context from contextvars
        try:
            from app.core.context import get_request_context
            context = get_request_context()
            record.request_id = context.get("request_id", "")
            record.user_id = context.get("user_id", "")
            record.organization_id = context.get("organization_id", "")
        except Exception:
            record.request_id = ""
            record.user_id = ""
            record.organization_id = ""
        
        return True


# Utility functions for structured logging
def log_security_event(
    event_type: str,
    message: str,
    **kwargs
):
    """
    Log a security event with structured data
    
    Args:
        event_type: Type of security event (login, logout, unauthorized_access, etc.)
        message: Human-readable message
        **kwargs: Additional structured data
    """
    logger = logging.getLogger("app.security")
    logger.info(
        message,
        extra={
            "event_type": event_type,
            **kwargs
        }
    )


def log_api_request(
    method: str,
    path: str,
    status_code: int,
    duration_ms: float,
    **kwargs
):
    """
    Log an API request with structured data
    
    Args:
        method: HTTP method
        path: Request path
        status_code: Response status code
        duration_ms: Request duration in milliseconds
        **kwargs: Additional structured data
    """
    logger = logging.getLogger("app.api")
    
    # Determine log level based on status code
    if status_code >= 500:
        log_level = logging.ERROR
    elif status_code >= 400:
        log_level = logging.WARNING
    else:
        log_level = logging.INFO
    
    logger.log(
        log_level,
        f"{method} {path} {status_code} {duration_ms:.2f}ms",
        extra={
            "event_type": "api_request",
            "method": method,
            "path": path,
            "status_code": status_code,
            "duration_ms": duration_ms,
            **kwargs
        }
    )


def log_database_query(
    query_type: str,
    duration_ms: float,
    **kwargs
):
    """
    Log a database query with structured data
    
    Args:
        query_type: Type of query (SELECT, INSERT, UPDATE, DELETE)
        duration_ms: Query duration in milliseconds
        **kwargs: Additional structured data
    """
    logger = logging.getLogger("app.database")
    
    # Log slow queries as warnings
    if duration_ms > 1000:  # > 1 second
        log_level = logging.WARNING
    else:
        log_level = logging.DEBUG
    
    logger.log(
        log_level,
        f"{query_type} query took {duration_ms:.2f}ms",
        extra={
            "event_type": "database_query",
            "query_type": query_type,
            "duration_ms": duration_ms,
            **kwargs
        }
    )


def mask_sensitive_data(data: dict) -> dict:
    """
    Mask sensitive data in logs
    
    Args:
        data: Dictionary containing potentially sensitive data
        
    Returns:
        Dictionary with sensitive fields masked
    """
    import re
    
    sensitive_fields = [
        "password", "token", "api_key", "secret", "authorization",
        "credit_card", "ssn", "social_security"
    ]
    
    masked_data = data.copy()
    
    for key, value in masked_data.items():
        # Mask sensitive field names
        if any(field in key.lower() for field in sensitive_fields):
            masked_data[key] = "***REDACTED***"
        
        # Mask sensitive patterns in strings
        elif isinstance(value, str):
            # Mask credit card numbers
            value = re.sub(
                r'\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}',
                '****-****-****-****',
                value
            )
            
            # Mask email addresses (partially)
            value = re.sub(
                r'([\w\.-]+)@([\w\.-]+)',
                lambda m: f"{m.group(1)[0]}***@{m.group(2)}",
                value
            )
            
            # Mask phone numbers
            value = re.sub(
                r'\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
                '***-***-****',
                value
            )
            
            masked_data[key] = value
        
        # Recursively mask nested dictionaries
        elif isinstance(value, dict):
            masked_data[key] = mask_sensitive_data(value)
    
    return masked_data


# Export public API
__all__ = [
    "get_logging_config",
    "setup_logging",
    "RequestContextFilter",
    "log_security_event",
    "log_api_request",
    "log_database_query",
    "mask_sensitive_data",
]
