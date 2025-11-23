#!/usr/bin/env python3
"""
Test script to verify service initialization logging
Tests Requirements 2.2 and 8.2 from the project-analysis spec
"""
import asyncio
import sys
import os
import io
import logging
from contextlib import asynccontextmanager
from datetime import datetime

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

class LogCapture:
    """Capture log output for verification"""
    def __init__(self):
        self.logs = []
        self.handler = None
        
    def setup(self):
        """Setup log capture"""
        self.handler = logging.StreamHandler(io.StringIO())
        self.handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        ))
        
        # Create a custom handler that captures to our list
        class ListHandler(logging.Handler):
            def __init__(self, log_list):
                super().__init__()
                self.log_list = log_list
                
            def emit(self, record):
                self.log_list.append(self.format(record))
        
        self.handler = ListHandler(self.logs)
        self.handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        ))
        
        # Add to root logger
        logging.getLogger().addHandler(self.handler)
        logging.getLogger().setLevel(logging.INFO)
        
    def get_logs(self):
        """Get captured logs as string"""
        return '\n'.join(self.logs)
        
    def cleanup(self):
        """Remove handler"""
        if self.handler:
            logging.getLogger().removeHandler(self.handler)

async def test_logging_requirements():
    """Test that all logging requirements are met"""
    print("=" * 70)
    print("Testing Service Initialization Logging")
    print("=" * 70)
    
    # Set minimal configuration to avoid actual service connections
    os.environ["ENABLE_REDIS"] = "false"
    os.environ["ENABLE_KAFKA"] = "false"
    os.environ["ENABLE_CLICKHOUSE"] = "false"
    os.environ["ENABLE_MLFLOW"] = "false"
    os.environ["SIMULATION_MODE"] = "false"
    os.environ["DATABASE_URL"] = "postgresql://test:test@localhost:5432/test"
    
    # Capture logs
    log_capture = LogCapture()
    log_capture.setup()
    
    try:
        # Import and start the application
        from main import app
        from contextlib import asynccontextmanager
        
        # Manually trigger the lifespan to capture startup logs
        async with app.router.lifespan_context(app):
            # App is now started, logs should be captured
            pass
        
        # Get the captured logs
        log_output = log_capture.get_logs()
        
        # Test Requirements
        tests_passed = []
        tests_failed = []
        
        # Requirement 1: Log service initialization attempts with timestamps
        print("\n[Test 1] Checking for timestamps in log messages...")
        if "Starting OptiBid Energy Platform API" in log_output:
            # Check if timestamp format is present (YYYY-MM-DD HH:MM:SS)
            has_timestamp = any(
                line.split(' - ')[0] for line in log_output.split('\n') 
                if ' - ' in line and len(line.split(' - ')[0]) >= 19
            )
            if has_timestamp:
                print("  ✓ PASS: Timestamps are present in log messages")
                tests_passed.append("Timestamps in logs")
            else:
                print("  ✗ FAIL: Timestamps not found in expected format")
                tests_failed.append("Timestamps in logs")
        else:
            print("  ✗ FAIL: Startup log message not found")
            tests_failed.append("Timestamps in logs")
        
        # Requirement 2: Log success/failure for each service
        print("\n[Test 2] Checking for success/failure indicators...")
        success_indicators = ["✓", "✗", "⊘"]
        has_indicators = any(indicator in log_output for indicator in success_indicators)
        if has_indicators:
            print("  ✓ PASS: Success/failure indicators (✓/✗/⊘) are present")
            tests_passed.append("Success/failure indicators")
        else:
            print("  ✗ FAIL: Success/failure indicators not found")
            tests_failed.append("Success/failure indicators")
        
        # Requirement 3: Log which features are available/unavailable
        print("\n[Test 3] Checking for feature availability messages...")
        feature_keywords = ["available", "unavailable", "limited", "disabled"]
        has_feature_info = any(keyword.lower() in log_output.lower() for keyword in feature_keywords)
        if has_feature_info:
            print("  ✓ PASS: Feature availability information is logged")
            tests_passed.append("Feature availability")
        else:
            print("  ✗ FAIL: Feature availability information not found")
            tests_failed.append("Feature availability")
        
        # Requirement 4: Add startup summary log message
        print("\n[Test 4] Checking for startup summary...")
        summary_keywords = ["SUMMARY", "Services Running", "Startup Duration"]
        has_summary = all(keyword in log_output for keyword in summary_keywords)
        if has_summary:
            print("  ✓ PASS: Startup summary is present")
            tests_passed.append("Startup summary")
        else:
            print("  ✗ FAIL: Startup summary not found")
            tests_failed.append("Startup summary")
        
        # Additional check: Startup time logged
        print("\n[Test 5] Checking for startup time...")
        if "Startup Time:" in log_output:
            print("  ✓ PASS: Startup time is logged")
            tests_passed.append("Startup time")
        else:
            print("  ✗ FAIL: Startup time not found")
            tests_failed.append("Startup time")
        
        # Additional check: Startup duration logged
        print("\n[Test 6] Checking for startup duration...")
        if "Startup Duration:" in log_output and "seconds" in log_output:
            print("  ✓ PASS: Startup duration is logged")
            tests_passed.append("Startup duration")
        else:
            print("  ✗ FAIL: Startup duration not found")
            tests_failed.append("Startup duration")
        
        # Additional check: Service status tracking
        print("\n[Test 7] Checking for service status tracking...")
        services = ["Database", "Redis", "Kafka", "ClickHouse", "MLflow"]
        services_logged = sum(1 for service in services if service in log_output)
        if services_logged >= 3:  # At least 3 services should be mentioned
            print(f"  ✓ PASS: Service status tracked ({services_logged}/{len(services)} services)")
            tests_passed.append("Service status tracking")
        else:
            print(f"  ✗ FAIL: Insufficient service status tracking ({services_logged}/{len(services)} services)")
            tests_failed.append("Service status tracking")
        
        # Print summary
        print("\n" + "=" * 70)
        print("Test Summary")
        print("=" * 70)
        print(f"Tests Passed: {len(tests_passed)}/{len(tests_passed) + len(tests_failed)}")
        
        if tests_passed:
            print("\nPassed Tests:")
            for test in tests_passed:
                print(f"  ✓ {test}")
        
        if tests_failed:
            print("\nFailed Tests:")
            for test in tests_failed:
                print(f"  ✗ {test}")
        
        # Print sample log output
        print("\n" + "=" * 70)
        print("Sample Log Output (first 20 lines)")
        print("=" * 70)
        log_lines = log_output.split('\n')[:20]
        for line in log_lines:
            if line.strip():
                print(line)
        
        return len(tests_failed) == 0
        
    except Exception as e:
        print(f"\n✗ Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        # Clean up handler
        log_capture.cleanup()

async def main():
    """Run logging tests"""
    print("\n" + "=" * 70)
    print("Service Initialization Logging Tests")
    print("Requirements: 2.2, 8.2")
    print("=" * 70)
    
    success = await test_logging_requirements()
    
    print("\n" + "=" * 70)
    if success:
        print("✓ All logging requirements verified!")
        print("  → Service initialization attempts are logged with timestamps")
        print("  → Success/failure is logged for each service")
        print("  → Feature availability is logged")
        print("  → Startup summary is present")
        return 0
    else:
        print("✗ Some logging requirements not met")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
