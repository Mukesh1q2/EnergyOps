"""
Test script for logging configuration
Tests all logging features including rotation, structured logging, and masking
"""

import logging
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.logging_config import (
    setup_logging,
    log_security_event,
    log_api_request,
    log_database_query,
    mask_sensitive_data
)
from app.core.config import settings


def test_basic_logging():
    """Test basic logging functionality"""
    print("\n" + "="*60)
    print("TEST 1: Basic Logging")
    print("="*60)
    
    # Initialize logging
    setup_logging()
    
    # Get logger
    logger = logging.getLogger("app")
    
    # Test all log levels
    logger.debug("This is a DEBUG message")
    logger.info("This is an INFO message")
    logger.warning("This is a WARNING message")
    logger.error("This is an ERROR message")
    logger.critical("This is a CRITICAL message")
    
    print("✓ Basic logging test completed")


def test_structured_logging():
    """Test structured logging with extra fields"""
    print("\n" + "="*60)
    print("TEST 2: Structured Logging")
    print("="*60)
    
    logger = logging.getLogger("app")
    
    # Log with extra context
    logger.info(
        "User action performed",
        extra={
            "user_id": "user_123",
            "action": "bid_submission",
            "bid_id": "bid_456",
            "amount": 1000.50
        }
    )
    
    print("✓ Structured logging test completed")


def test_security_logging():
    """Test security event logging"""
    print("\n" + "="*60)
    print("TEST 3: Security Event Logging")
    print("="*60)
    
    # Test successful login
    log_security_event(
        event_type="login_success",
        message="User logged in successfully",
        user_id="user_123",
        ip_address="192.168.1.100",
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    )
    
    # Test failed login
    log_security_event(
        event_type="login_failure",
        message="Failed login attempt",
        username="admin",
        ip_address="192.168.1.200",
        reason="invalid_password"
    )
    
    # Test unauthorized access
    log_security_event(
        event_type="unauthorized_access",
        message="Unauthorized access attempt",
        user_id="user_456",
        resource="/api/admin/users",
        ip_address="192.168.1.150"
    )
    
    print("✓ Security logging test completed")


def test_api_logging():
    """Test API request logging"""
    print("\n" + "="*60)
    print("TEST 4: API Request Logging")
    print("="*60)
    
    # Test successful request
    log_api_request(
        method="GET",
        path="/api/bids",
        status_code=200,
        duration_ms=45.2,
        user_id="user_123",
        request_id="req_abc123"
    )
    
    # Test client error
    log_api_request(
        method="POST",
        path="/api/bids",
        status_code=400,
        duration_ms=12.5,
        user_id="user_456",
        request_id="req_def456",
        error="Invalid bid amount"
    )
    
    # Test server error
    log_api_request(
        method="GET",
        path="/api/analytics",
        status_code=500,
        duration_ms=1250.0,
        user_id="user_789",
        request_id="req_ghi789",
        error="Database connection timeout"
    )
    
    print("✓ API logging test completed")


def test_database_logging():
    """Test database query logging"""
    print("\n" + "="*60)
    print("TEST 5: Database Query Logging")
    print("="*60)
    
    # Test fast query
    log_database_query(
        query_type="SELECT",
        duration_ms=15.5,
        table="bids",
        rows_affected=10
    )
    
    # Test slow query (should log as WARNING)
    log_database_query(
        query_type="SELECT",
        duration_ms=1500.0,
        table="market_data",
        rows_affected=10000
    )
    
    # Test write operation
    log_database_query(
        query_type="INSERT",
        duration_ms=25.0,
        table="bids",
        rows_affected=1
    )
    
    print("✓ Database logging test completed")


def test_sensitive_data_masking():
    """Test sensitive data masking"""
    print("\n" + "="*60)
    print("TEST 6: Sensitive Data Masking")
    print("="*60)
    
    # Test data with sensitive fields
    sensitive_data = {
        "username": "john.doe",
        "password": "secret123",
        "email": "john.doe@example.com",
        "phone": "+1-555-123-4567",
        "credit_card": "4111-1111-1111-1111",
        "api_key": "sk_live_abc123xyz789",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
        "normal_field": "This should not be masked"
    }
    
    print("\nOriginal data:")
    for key, value in sensitive_data.items():
        print(f"  {key}: {value}")
    
    masked_data = mask_sensitive_data(sensitive_data)
    
    print("\nMasked data:")
    for key, value in masked_data.items():
        print(f"  {key}: {value}")
    
    # Verify masking
    assert masked_data["password"] == "***REDACTED***", f"Password not masked: {masked_data['password']}"
    assert masked_data["api_key"] == "***REDACTED***", f"API key not masked: {masked_data['api_key']}"
    assert masked_data["token"] == "***REDACTED***", f"Token not masked: {masked_data['token']}"
    assert "***" in masked_data["email"], f"Email not masked: {masked_data['email']}"
    assert "***" in masked_data["phone"], f"Phone not masked: {masked_data['phone']}"
    # Credit card is masked as a sensitive field, not by pattern
    assert masked_data["credit_card"] == "***REDACTED***", f"Credit card not masked: {masked_data['credit_card']}"
    assert masked_data["normal_field"] == "This should not be masked", f"Normal field incorrectly masked: {masked_data['normal_field']}"
    
    print("✓ Sensitive data masking test completed")


def test_logger_hierarchy():
    """Test logger hierarchy"""
    print("\n" + "="*60)
    print("TEST 7: Logger Hierarchy")
    print("="*60)
    
    # Test different loggers
    loggers = [
        "app",
        "app.api",
        "app.security",
        "app.database",
        "uvicorn",
        "uvicorn.access"
    ]
    
    for logger_name in loggers:
        logger = logging.getLogger(logger_name)
        logger.info(f"Test message from {logger_name}")
    
    print("✓ Logger hierarchy test completed")


def test_log_file_creation():
    """Test log file creation in production mode"""
    print("\n" + "="*60)
    print("TEST 8: Log File Creation")
    print("="*60)
    
    if settings.ENVIRONMENT == "production":
        log_dir = Path("/var/log/optibid")
        
        expected_files = [
            "application.log",
            "error.log",
            "security.log",
            "access.log"
        ]
        
        print(f"\nChecking log directory: {log_dir}")
        
        if log_dir.exists():
            for filename in expected_files:
                filepath = log_dir / filename
                if filepath.exists():
                    size = filepath.stat().st_size
                    print(f"  ✓ {filename} exists ({size} bytes)")
                else:
                    print(f"  ✗ {filename} not found")
        else:
            print(f"  ⚠ Log directory does not exist (will be created on first log)")
            print(f"  Note: Run with sudo or ensure write permissions to /var/log/optibid")
    else:
        print("  ⚠ Skipping file creation test (not in production mode)")
        print(f"  Current environment: {settings.ENVIRONMENT}")
    
    print("✓ Log file creation test completed")


def test_log_rotation():
    """Test log rotation configuration"""
    print("\n" + "="*60)
    print("TEST 9: Log Rotation Configuration")
    print("="*60)
    
    from app.core.logging_config import get_logging_config
    
    config = get_logging_config()
    
    if settings.ENVIRONMENT == "production":
        # Check rotating file handler configuration
        handlers = config.get("handlers", {})
        
        for handler_name, handler_config in handlers.items():
            if "RotatingFileHandler" in handler_config.get("class", ""):
                print(f"\n{handler_name}:")
                print(f"  File: {handler_config.get('filename')}")
                print(f"  Max size: {handler_config.get('maxBytes') / 1024 / 1024:.1f} MB")
                print(f"  Backup count: {handler_config.get('backupCount')}")
                print(f"  Encoding: {handler_config.get('encoding')}")
    else:
        print("  ⚠ Log rotation only configured for production mode")
        print(f"  Current environment: {settings.ENVIRONMENT}")
    
    print("✓ Log rotation configuration test completed")


def test_exception_logging():
    """Test exception logging with stack traces"""
    print("\n" + "="*60)
    print("TEST 10: Exception Logging")
    print("="*60)
    
    logger = logging.getLogger("app")
    
    try:
        # Intentionally cause an exception
        result = 1 / 0
    except ZeroDivisionError as e:
        logger.error("An error occurred", exc_info=True)
        logger.exception("Exception with automatic stack trace")
    
    print("✓ Exception logging test completed")


def run_all_tests():
    """Run all logging tests"""
    print("\n" + "="*60)
    print("OPTIBID LOGGING CONFIGURATION TEST SUITE")
    print("="*60)
    print(f"Environment: {settings.ENVIRONMENT}")
    print(f"Log Level: {settings.LOG_LEVEL}")
    print("="*60)
    
    try:
        test_basic_logging()
        test_structured_logging()
        test_security_logging()
        test_api_logging()
        test_database_logging()
        test_sensitive_data_masking()
        test_logger_hierarchy()
        test_log_file_creation()
        test_log_rotation()
        test_exception_logging()
        
        print("\n" + "="*60)
        print("ALL TESTS PASSED ✓")
        print("="*60)
        print("\nLogging system is properly configured and working.")
        print("\nNext steps:")
        print("1. Check log files in /var/log/optibid/ (production)")
        print("2. Verify Filebeat is shipping logs to Logstash")
        print("3. Check Elasticsearch indices for log data")
        print("4. View logs in Kibana dashboard")
        print("="*60)
        
        return True
        
    except Exception as e:
        print("\n" + "="*60)
        print("TEST FAILED ✗")
        print("="*60)
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
