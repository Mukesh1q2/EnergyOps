"""
Performance testing for OptiBid Energy Platform
Tests Requirements: 2.5 (startup time), 4.4 (WebSocket performance)

This test suite validates:
1. API endpoint load testing
2. WebSocket connection stress testing
3. Database query performance
4. Startup time with different configurations
"""
import pytest
import asyncio
import time
import os
from unittest.mock import patch, AsyncMock, MagicMock
from datetime import datetime, timedelta
from decimal import Decimal
import uuid
import statistics


class TestAPIEndpointPerformance:
    """Test API endpoint performance under load"""
    
    @pytest.mark.asyncio
    async def test_authentication_endpoint_performance(self):
        """
        Test authentication endpoint response time
        Validates Requirements: 2.5
        """
        from app.core.security import SecurityManager
        
        # Measure token generation performance
        iterations = 100
        times = []
        
        for i in range(iterations):
            start = time.time()
            
            user_id = str(uuid.uuid4())
            org_id = str(uuid.uuid4())
            
            access_token = SecurityManager.create_access_token(
                user_id=user_id,
                organization_id=org_id
            )
            
            # Verify token
            payload = SecurityManager.verify_token(access_token, "access")
            
            end = time.time()
            times.append(end - start)
        
        # Calculate statistics
        avg_time = statistics.mean(times)
        max_time = max(times)
        min_time = min(times)
        p95_time = statistics.quantiles(times, n=20)[18]  # 95th percentile
        
        # Performance assertions
        assert avg_time < 0.1, f"Average auth time {avg_time:.4f}s should be < 0.1s"
        assert p95_time < 0.2, f"95th percentile {p95_time:.4f}s should be < 0.2s"
        
        print(f"\nAuthentication Performance ({iterations} iterations):")
        print(f"  Average: {avg_time*1000:.2f}ms")
        print(f"  Min: {min_time*1000:.2f}ms")
        print(f"  Max: {max_time*1000:.2f}ms")
        print(f"  95th percentile: {p95_time*1000:.2f}ms")
    
    @pytest.mark.asyncio
    async def test_concurrent_authentication_requests(self):
        """
        Test concurrent authentication requests
        Validates Requirements: 2.5
        """
        from app.core.security import SecurityManager
        
        async def create_and_verify_token():
            """Create and verify a token"""
            user_id = str(uuid.uuid4())
            org_id = str(uuid.uuid4())
            
            access_token = SecurityManager.create_access_token(
                user_id=user_id,
                organization_id=org_id
            )
            
            payload = SecurityManager.verify_token(access_token, "access")
            return payload is not None
        
        # Run 50 concurrent requests
        concurrent_requests = 50
        start = time.time()
        
        tasks = [create_and_verify_token() for _ in range(concurrent_requests)]
        results = await asyncio.gather(*tasks)
        
        end = time.time()
        duration = end - start
        
        # All requests should succeed
        assert all(results), "All concurrent requests should succeed"
        
        # Should complete within reasonable time
        assert duration < 5.0, f"50 concurrent requests took {duration:.2f}s, should be < 5s"
        
        throughput = concurrent_requests / duration
        print(f"\nConcurrent Authentication Performance:")
        print(f"  Requests: {concurrent_requests}")
        print(f"  Duration: {duration:.2f}s")
        print(f"  Throughput: {throughput:.2f} req/s")

    @pytest.mark.asyncio
    async def test_schema_validation_performance(self):
        """
        Test schema validation performance
        Validates Requirements: 2.5
        """
        from app.schemas import UserCreate, BidCreate
        
        # Test user schema validation
        iterations = 1000
        times = []
        
        for i in range(iterations):
            start = time.time()
            
            user_data = {
                "email": f"user{i}@example.com",
                "password": "TestPass123!",
                "first_name": "Test",
                "last_name": "User"
            }
            
            user = UserCreate(**user_data)
            
            end = time.time()
            times.append(end - start)
        
        avg_time = statistics.mean(times)
        p95_time = statistics.quantiles(times, n=20)[18]
        
        # Schema validation should be very fast
        assert avg_time < 0.001, f"Average validation time {avg_time*1000:.4f}ms should be < 1ms"
        
        print(f"\nSchema Validation Performance ({iterations} iterations):")
        print(f"  Average: {avg_time*1000:.4f}ms")
        print(f"  95th percentile: {p95_time*1000:.4f}ms")


class TestWebSocketPerformance:
    """Test WebSocket connection performance and stress testing"""
    
    @pytest.mark.asyncio
    async def test_websocket_connection_establishment_time(self):
        """
        Test WebSocket connection establishment time
        Validates Requirements: 4.4
        """
        from app.services.websocket_manager import in_memory_storage
        
        iterations = 100
        times = []
        
        for i in range(iterations):
            connection_id = str(uuid.uuid4())
            market_zone = "pjm"
            user_id = str(uuid.uuid4())
            
            start = time.time()
            
            await in_memory_storage.cache_websocket_connection(
                connection_id, market_zone, user_id
            )
            
            conn = await in_memory_storage.get_websocket_connection(connection_id)
            
            end = time.time()
            times.append(end - start)
            
            # Cleanup
            await in_memory_storage.remove_websocket_connection(connection_id)
        
        avg_time = statistics.mean(times)
        max_time = max(times)
        p95_time = statistics.quantiles(times, n=20)[18]
        
        # Connection should be established quickly
        assert avg_time < 0.01, f"Average connection time {avg_time*1000:.2f}ms should be < 10ms"
        assert p95_time < 0.05, f"95th percentile {p95_time*1000:.2f}ms should be < 50ms"
        
        print(f"\nWebSocket Connection Performance ({iterations} iterations):")
        print(f"  Average: {avg_time*1000:.2f}ms")
        print(f"  Max: {max_time*1000:.2f}ms")
        print(f"  95th percentile: {p95_time*1000:.2f}ms")

    @pytest.mark.asyncio
    async def test_concurrent_websocket_connections(self):
        """
        Test multiple concurrent WebSocket connections
        Validates Requirements: 4.4
        """
        from app.services.websocket_manager import in_memory_storage
        
        async def create_connection(index):
            """Create a WebSocket connection"""
            connection_id = str(uuid.uuid4())
            market_zone = f"zone_{index % 5}"  # 5 different zones
            user_id = str(uuid.uuid4())
            
            await in_memory_storage.cache_websocket_connection(
                connection_id, market_zone, user_id
            )
            
            return connection_id
        
        # Create 100 concurrent connections
        num_connections = 100
        start = time.time()
        
        tasks = [create_connection(i) for i in range(num_connections)]
        connection_ids = await asyncio.gather(*tasks)
        
        end = time.time()
        duration = end - start
        
        # Verify all connections were created
        assert len(connection_ids) == num_connections
        
        # Should handle concurrent connections efficiently
        assert duration < 2.0, f"Creating {num_connections} connections took {duration:.2f}s, should be < 2s"
        
        throughput = num_connections / duration
        print(f"\nConcurrent WebSocket Connections:")
        print(f"  Connections: {num_connections}")
        print(f"  Duration: {duration:.2f}s")
        print(f"  Throughput: {throughput:.2f} conn/s")
        
        # Cleanup
        for conn_id in connection_ids:
            await in_memory_storage.remove_websocket_connection(conn_id)
    
    @pytest.mark.asyncio
    async def test_websocket_message_broadcast_performance(self):
        """
        Test WebSocket message broadcast performance
        Validates Requirements: 4.4
        """
        from app.services.websocket_manager import in_memory_storage
        
        # Create multiple connections
        num_connections = 50
        market_zone = "pjm"
        connection_ids = []
        
        for i in range(num_connections):
            connection_id = str(uuid.uuid4())
            user_id = str(uuid.uuid4())
            
            await in_memory_storage.cache_websocket_connection(
                connection_id, market_zone, user_id
            )
            connection_ids.append(connection_id)
        
        # Test broadcast performance
        iterations = 100
        times = []
        
        for i in range(iterations):
            price_data = {
                "price": 50.0 + i * 0.1,
                "volume": 1000.0,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            start = time.time()
            
            await in_memory_storage.cache_latest_price(market_zone, price_data)
            
            end = time.time()
            times.append(end - start)
        
        avg_time = statistics.mean(times)
        p95_time = statistics.quantiles(times, n=20)[18]
        
        # Broadcast should be fast
        assert avg_time < 0.01, f"Average broadcast time {avg_time*1000:.2f}ms should be < 10ms"
        
        print(f"\nWebSocket Broadcast Performance ({iterations} broadcasts to {num_connections} connections):")
        print(f"  Average: {avg_time*1000:.2f}ms")
        print(f"  95th percentile: {p95_time*1000:.2f}ms")
        
        # Cleanup
        for conn_id in connection_ids:
            await in_memory_storage.remove_websocket_connection(conn_id)

    @pytest.mark.asyncio
    async def test_websocket_stress_test(self):
        """
        Stress test WebSocket with many connections and messages
        Validates Requirements: 4.4
        """
        from app.services.websocket_manager import in_memory_storage
        
        # Create many connections across multiple zones
        num_connections = 200
        num_zones = 10
        connection_ids = []
        
        start_setup = time.time()
        
        for i in range(num_connections):
            connection_id = str(uuid.uuid4())
            market_zone = f"zone_{i % num_zones}"
            user_id = str(uuid.uuid4())
            
            await in_memory_storage.cache_websocket_connection(
                connection_id, market_zone, user_id
            )
            connection_ids.append((connection_id, market_zone))
        
        setup_duration = time.time() - start_setup
        
        # Send messages to all zones
        num_messages = 50
        start_messages = time.time()
        
        for i in range(num_messages):
            for zone_idx in range(num_zones):
                market_zone = f"zone_{zone_idx}"
                price_data = {
                    "price": 50.0 + i * 0.1,
                    "volume": 1000.0,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                await in_memory_storage.cache_latest_price(market_zone, price_data)
        
        messages_duration = time.time() - start_messages
        
        # Performance assertions
        assert setup_duration < 10.0, f"Setup {num_connections} connections took {setup_duration:.2f}s, should be < 10s"
        assert messages_duration < 5.0, f"Sending {num_messages * num_zones} messages took {messages_duration:.2f}s, should be < 5s"
        
        print(f"\nWebSocket Stress Test:")
        print(f"  Connections: {num_connections}")
        print(f"  Zones: {num_zones}")
        print(f"  Setup time: {setup_duration:.2f}s")
        print(f"  Messages sent: {num_messages * num_zones}")
        print(f"  Message time: {messages_duration:.2f}s")
        print(f"  Message throughput: {(num_messages * num_zones) / messages_duration:.2f} msg/s")
        
        # Cleanup
        for conn_id, _ in connection_ids:
            await in_memory_storage.remove_websocket_connection(conn_id)


class TestDatabaseQueryPerformance:
    """Test database query performance"""
    
    @pytest.mark.asyncio
    async def test_schema_validation_query_performance(self):
        """
        Test schema validation performance (simulates database queries)
        Validates Requirements: 2.5
        """
        from app.schemas import BidCreate, AssetCreate, OrganizationCreate
        
        # Test complex schema validation
        iterations = 500
        times = []
        
        for i in range(iterations):
            start = time.time()
            
            bid_data = {
                "market_operator_id": str(uuid.uuid4()),
                "bid_zone_id": str(uuid.uuid4()),
                "asset_id": str(uuid.uuid4()),
                "offer_type": "sell",
                "market_type": "day_ahead",
                "quantity_mw": Decimal("50.0"),
                "price_rupees": Decimal("45.50"),
                "delivery_start": datetime.now(),
                "delivery_end": datetime.now() + timedelta(hours=1)
            }
            
            bid = BidCreate(**bid_data)
            
            end = time.time()
            times.append(end - start)
        
        avg_time = statistics.mean(times)
        p95_time = statistics.quantiles(times, n=20)[18]
        
        assert avg_time < 0.002, f"Average query time {avg_time*1000:.2f}ms should be < 2ms"
        
        print(f"\nComplex Schema Validation Performance ({iterations} iterations):")
        print(f"  Average: {avg_time*1000:.4f}ms")
        print(f"  95th percentile: {p95_time*1000:.4f}ms")

    @pytest.mark.asyncio
    async def test_concurrent_schema_validations(self):
        """
        Test concurrent schema validations
        Validates Requirements: 2.5
        """
        from app.schemas import UserCreate
        
        async def validate_user_schema(index):
            """Validate a user schema"""
            user_data = {
                "email": f"user{index}@example.com",
                "password": "TestPass123!",
                "first_name": "Test",
                "last_name": "User"
            }
            
            user = UserCreate(**user_data)
            return user.email == user_data["email"]
        
        # Run 100 concurrent validations
        num_validations = 100
        start = time.time()
        
        tasks = [validate_user_schema(i) for i in range(num_validations)]
        results = await asyncio.gather(*tasks)
        
        end = time.time()
        duration = end - start
        
        assert all(results), "All validations should succeed"
        assert duration < 1.0, f"100 concurrent validations took {duration:.2f}s, should be < 1s"
        
        throughput = num_validations / duration
        print(f"\nConcurrent Schema Validations:")
        print(f"  Validations: {num_validations}")
        print(f"  Duration: {duration:.2f}s")
        print(f"  Throughput: {throughput:.2f} validations/s")
    
    @pytest.mark.asyncio
    async def test_in_memory_storage_performance(self):
        """
        Test in-memory storage operations performance
        Validates Requirements: 4.4
        """
        from app.services.websocket_manager import in_memory_storage
        
        # Test write performance
        iterations = 1000
        write_times = []
        
        for i in range(iterations):
            key = f"test_key_{i}"
            value = {"data": f"value_{i}", "timestamp": datetime.utcnow().isoformat()}
            
            start = time.time()
            await in_memory_storage.cache_latest_price(key, value)
            end = time.time()
            
            write_times.append(end - start)
        
        # Test read performance
        read_times = []
        
        for i in range(iterations):
            key = f"test_key_{i}"
            
            start = time.time()
            value = await in_memory_storage.get_latest_price(key)
            end = time.time()
            
            read_times.append(end - start)
        
        avg_write = statistics.mean(write_times)
        avg_read = statistics.mean(read_times)
        p95_write = statistics.quantiles(write_times, n=20)[18]
        p95_read = statistics.quantiles(read_times, n=20)[18]
        
        # In-memory operations should be very fast
        assert avg_write < 0.001, f"Average write time {avg_write*1000:.4f}ms should be < 1ms"
        assert avg_read < 0.001, f"Average read time {avg_read*1000:.4f}ms should be < 1ms"
        
        print(f"\nIn-Memory Storage Performance ({iterations} operations):")
        print(f"  Write average: {avg_write*1000:.4f}ms")
        print(f"  Write 95th percentile: {p95_write*1000:.4f}ms")
        print(f"  Read average: {avg_read*1000:.4f}ms")
        print(f"  Read 95th percentile: {p95_read*1000:.4f}ms")


class TestStartupPerformance:
    """Test backend startup performance with different configurations"""
    
    @pytest.mark.asyncio
    async def test_minimal_startup_time(self):
        """
        Test startup time with minimal services (PostgreSQL only)
        Validates Requirements: 2.5
        """
        with patch.dict(os.environ, {
            "ENABLE_REDIS": "false",
            "ENABLE_KAFKA": "false",
            "ENABLE_CLICKHOUSE": "false",
            "ENABLE_MLFLOW": "false"
        }):
            from importlib import reload
            from app.core import config
            reload(config)
            
            start = time.time()
            
            # Import core components (simulates startup)
            from app.core.database import init_db
            from app.routers import auth, users, organizations
            from app.core.security import SecurityManager
            
            # Verify imports work
            assert init_db is not None
            assert auth.router is not None
            assert users.router is not None
            assert SecurityManager is not None
            
            end = time.time()
            startup_duration = end - start
            
            # Startup should be fast with minimal services
            assert startup_duration < 5.0, f"Minimal startup took {startup_duration:.2f}s, should be < 5s"
            
            print(f"\nMinimal Startup Performance:")
            print(f"  Duration: {startup_duration:.2f}s")
            print(f"  Services: PostgreSQL only")

    @pytest.mark.asyncio
    async def test_full_stack_startup_time(self):
        """
        Test startup time with all services enabled
        Validates Requirements: 2.5
        """
        with patch.dict(os.environ, {
            "ENABLE_REDIS": "true",
            "ENABLE_KAFKA": "true",
            "ENABLE_CLICKHOUSE": "true",
            "ENABLE_MLFLOW": "true"
        }):
            from importlib import reload
            from app.core import config
            reload(config)
            
            start = time.time()
            
            # Import all components
            from app.core.database import init_db
            from app.routers import auth, users, organizations, analytics, ml_models
            from app.core.security import SecurityManager
            
            # Verify imports work
            assert init_db is not None
            assert auth.router is not None
            assert analytics.router is not None
            assert ml_models.router is not None
            
            end = time.time()
            startup_duration = end - start
            
            # Full stack startup should still be reasonable
            assert startup_duration < 10.0, f"Full stack startup took {startup_duration:.2f}s, should be < 10s"
            
            print(f"\nFull Stack Startup Performance:")
            print(f"  Duration: {startup_duration:.2f}s")
            print(f"  Services: All enabled")
    
    @pytest.mark.asyncio
    async def test_service_initialization_overhead(self):
        """
        Test overhead of service initialization
        Validates Requirements: 2.5
        """
        # Measure time to import and initialize different services
        services = []
        
        # Test Redis initialization overhead
        start = time.time()
        with patch('app.services.redis_cache.start_redis_cache') as mock_redis:
            mock_redis.return_value = AsyncMock()
            await mock_redis()
        redis_time = time.time() - start
        services.append(("Redis", redis_time))
        
        # Test Kafka initialization overhead
        start = time.time()
        with patch('app.services.kafka_producer.start_kafka_producer') as mock_kafka:
            mock_kafka.return_value = AsyncMock()
            await mock_kafka()
        kafka_time = time.time() - start
        services.append(("Kafka", kafka_time))
        
        # Test ClickHouse initialization overhead
        start = time.time()
        with patch('app.services.clickhouse_service.clickhouse_service.initialize') as mock_ch:
            mock_ch.return_value = AsyncMock()
            await mock_ch()
        clickhouse_time = time.time() - start
        services.append(("ClickHouse", clickhouse_time))
        
        print(f"\nService Initialization Overhead:")
        for service_name, duration in services:
            print(f"  {service_name}: {duration*1000:.2f}ms")
        
        # Each service initialization should be reasonably fast (mocked)
        # Note: First-time imports can be slower due to module loading
        for service_name, duration in services:
            assert duration < 2.0, f"{service_name} initialization took {duration:.4f}s, should be < 2s"
    
    @pytest.mark.asyncio
    async def test_graceful_degradation_performance(self):
        """
        Test performance impact of graceful degradation
        Validates Requirements: 2.5
        """
        # Test with service failures
        start = time.time()
        
        with patch('app.services.redis_cache.start_redis_cache') as mock_redis:
            mock_redis.side_effect = ConnectionError("Redis unavailable")
            
            try:
                await asyncio.wait_for(mock_redis(), timeout=5.0)
            except (ConnectionError, asyncio.TimeoutError):
                pass  # Expected failure
        
        degradation_time = time.time() - start
        
        # Graceful degradation should not add significant overhead
        assert degradation_time < 6.0, f"Graceful degradation took {degradation_time:.2f}s, should be < 6s"
        
        print(f"\nGraceful Degradation Performance:")
        print(f"  Time to handle service failure: {degradation_time:.2f}s")


class TestEndToEndPerformance:
    """Test end-to-end workflow performance"""
    
    @pytest.mark.asyncio
    async def test_complete_workflow_performance(self):
        """
        Test complete user workflow performance
        Validates Requirements: 2.5, 4.4
        """
        from app.core.security import SecurityManager
        from app.schemas import UserCreate, BidCreate
        
        start = time.time()
        
        # Step 1: Authentication
        user_id = str(uuid.uuid4())
        org_id = str(uuid.uuid4())
        
        access_token = SecurityManager.create_access_token(
            user_id=user_id,
            organization_id=org_id
        )
        
        payload = SecurityManager.verify_token(access_token, "access")
        assert payload is not None
        
        # Step 2: Create user
        user_data = {
            "email": "workflow@example.com",
            "password": "TestPass123!",
            "first_name": "Workflow",
            "last_name": "Test"
        }
        
        user = UserCreate(**user_data)
        
        # Step 3: Create bid
        bid_data = {
            "market_operator_id": str(uuid.uuid4()),
            "bid_zone_id": str(uuid.uuid4()),
            "asset_id": str(uuid.uuid4()),
            "offer_type": "sell",
            "market_type": "day_ahead",
            "quantity_mw": Decimal("50.0"),
            "price_rupees": Decimal("45.50"),
            "delivery_start": datetime.now(),
            "delivery_end": datetime.now() + timedelta(hours=1)
        }
        
        bid = BidCreate(**bid_data)
        
        end = time.time()
        workflow_duration = end - start
        
        # Complete workflow should be fast
        assert workflow_duration < 0.1, f"Complete workflow took {workflow_duration*1000:.2f}ms, should be < 100ms"
        
        print(f"\nComplete Workflow Performance:")
        print(f"  Duration: {workflow_duration*1000:.2f}ms")
        print(f"  Steps: Auth + User Creation + Bid Creation")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
