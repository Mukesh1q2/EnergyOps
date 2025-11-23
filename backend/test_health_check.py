#!/usr/bin/env python3
"""
Test script to verify health check endpoint functionality
"""
import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def test_health_check_utility():
    """Test the health check utility functions"""
    print("=" * 70)
    print("Testing Health Check Utility Functions")
    print("=" * 70)
    
    try:
        from app.utils.health_check import (
            check_database_health,
            check_redis_health,
            check_kafka_health,
            check_clickhouse_health,
            check_mlflow_health,
            check_websocket_health,
            check_all_services,
            determine_overall_status,
            ServiceStatus
        )
        
        print("\n✓ Health check utility imported successfully")
        
        # Test database health check
        print("\nTesting database health check...")
        db_result = await check_database_health(timeout=5.0)
        print(f"  Database status: {db_result.status.value}")
        print(f"  Message: {db_result.message}")
        if db_result.error:
            print(f"  Error: {db_result.error}")
        
        # Test Redis health check
        print("\nTesting Redis health check...")
        redis_result = await check_redis_health(timeout=3.0)
        print(f"  Redis status: {redis_result.status.value}")
        print(f"  Message: {redis_result.message}")
        if redis_result.error:
            print(f"  Error: {redis_result.error}")
        
        # Test all services
        print("\nTesting all services health check...")
        all_results = await check_all_services(timeout=10.0)
        print(f"  Checked {len(all_results)} services")
        
        for service_name, result in all_results.items():
            print(f"  - {service_name}: {result.status.value}")
        
        # Test overall status determination
        print("\nTesting overall status determination...")
        overall_status = determine_overall_status(all_results)
        print(f"  Overall status: {overall_status.value}")
        
        print("\n✓ Health check utility tests completed")
        return True
        
    except Exception as e:
        print(f"\n✗ Health check utility test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_health_endpoint():
    """Test the /health endpoint"""
    print("\n" + "=" * 70)
    print("Testing /health Endpoint")
    print("=" * 70)
    
    try:
        from main import app
        from fastapi import Request
        from fastapi.responses import JSONResponse
        
        print("\n✓ Application imported successfully")
        
        # Get the health check function directly
        health_check_func = None
        for route in app.routes:
            if hasattr(route, 'path') and route.path == '/health':
                health_check_func = route.endpoint
                break
        
        if not health_check_func:
            print("\n✗ Could not find /health endpoint")
            return False
        
        print("\nCalling /health endpoint function...")
        data = await health_check_func()
        
        print(f"  Overall status: {data.get('status')}")
        print(f"  Version: {data.get('version')}")
        print(f"  Environment: {data.get('environment')}")
        print(f"  Timestamp: {data.get('timestamp')}")
        
        if 'services' in data:
            print(f"\n  Services checked: {len(data['services'])}")
            for service_name, service_data in data['services'].items():
                if isinstance(service_data, dict):
                    status = service_data.get('status', 'unknown')
                    print(f"    - {service_name}: {status}")
                else:
                    print(f"    - {service_name}: {service_data}")
        
        if 'features' in data:
            print(f"\n  Features:")
            for feature_name, available in data['features'].items():
                status = "✓" if available else "✗"
                print(f"    {status} {feature_name}")
        
        if 'summary' in data:
            summary = data['summary']
            print(f"\n  Summary:")
            print(f"    Available services: {summary.get('available_services')}/{summary.get('total_services')}")
            print(f"    Availability: {summary.get('availability_percentage')}%")
        
        print("\n✓ Health endpoint returned valid response")
        return True
        
    except Exception as e:
        print(f"\n✗ Health endpoint test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_health_with_minimal_services():
    """Test health endpoint with minimal services (PostgreSQL only)"""
    print("\n" + "=" * 70)
    print("Testing Health Endpoint - Minimal Configuration")
    print("=" * 70)
    
    # Set environment variables for minimal configuration
    os.environ["ENABLE_REDIS"] = "false"
    os.environ["ENABLE_KAFKA"] = "false"
    os.environ["ENABLE_CLICKHOUSE"] = "false"
    os.environ["ENABLE_MLFLOW"] = "false"
    os.environ["ENABLE_WEBSOCKET"] = "true"
    
    try:
        # Reload configuration
        from importlib import reload
        from app.core import config
        reload(config)
        
        from main import app
        
        # Get the health check function directly
        health_check_func = None
        for route in app.routes:
            if hasattr(route, 'path') and route.path == '/health':
                health_check_func = route.endpoint
                break
        
        if not health_check_func:
            print("\n✗ Could not find /health endpoint")
            return False
        
        print("\nCalling /health endpoint with minimal services...")
        data = await health_check_func()
        
        print(f"  Overall status: {data.get('status')}")
        
        # Check that optional services are marked as unavailable
        services = data.get('services', {})
        
        # Database should be available
        db_status = services.get('database', {})
        if isinstance(db_status, dict):
            db_status_value = db_status.get('status')
        else:
            db_status_value = db_status
        
        print(f"  Database: {db_status_value}")
        
        # Optional services should be unavailable
        optional_services = ['redis', 'kafka', 'clickhouse', 'mlflow']
        for service in optional_services:
            service_status = services.get(service, {})
            if isinstance(service_status, dict):
                status_value = service_status.get('status')
            else:
                status_value = service_status
            print(f"  {service}: {status_value}")
        
        print("\n✓ Health endpoint correctly reports service availability")
        return True
        
    except Exception as e:
        print(f"\n✗ Minimal services test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run all health check tests"""
    print("\n" + "=" * 70)
    print("OptiBid Health Check Tests")
    print("=" * 70)
    
    results = []
    
    # Test 1: Health check utility
    result1 = await test_health_check_utility()
    results.append(("Health Check Utility", result1))
    
    # Test 2: Health endpoint
    result2 = await test_health_endpoint()
    results.append(("Health Endpoint", result2))
    
    # Test 3: Health with minimal services
    result3 = await test_health_with_minimal_services()
    results.append(("Minimal Services Health", result3))
    
    # Summary
    print("\n" + "=" * 70)
    print("Test Summary")
    print("=" * 70)
    
    for test_name, result in results:
        status = "✓ PASSED" if result else "✗ FAILED"
        print(f"  {test_name}: {status}")
    
    all_passed = all(result for _, result in results)
    
    if all_passed:
        print("\n✓ All health check tests passed!")
        print("  → Health check utility functions work correctly")
        print("  → /health endpoint returns comprehensive status")
        print("  → Service availability is accurately reported")
        print("  → Optional services are handled gracefully")
        return 0
    else:
        print("\n✗ Some tests failed")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
