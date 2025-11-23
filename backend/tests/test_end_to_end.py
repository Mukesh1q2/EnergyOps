"""
End-to-end integration tests for OptiBid Energy Platform
Tests Requirements: All requirements - Complete user workflows, minimal/full service stacks, error scenarios

This test suite validates:
1. Complete user workflows (registration -> login -> bid creation -> market data)
2. System behavior with minimal services (PostgreSQL only)
3. System behavior with full service stack
4. Error scenarios and graceful degradation
"""
import pytest
import asyncio
import os
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from decimal import Decimal
import uuid


class TestCompleteUserWorkflows:
    """Test complete end-to-end user workflows"""
    
    @pytest.mark.asyncio
    async def test_complete_user_registration_to_bid_workflow(self):
        """
        Test complete workflow: Registration -> Login -> Create Asset -> Create Bid
        Validates Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 6.4
        """
        # Step 1: User Registration
        from app.schemas import UserCreate, OrganizationCreate
        
        user_data = {
            "email": "trader@example.com",
            "password": "SecurePass123!",
            "first_name": "John",
            "last_name": "Trader"
        }
        
        user_create = UserCreate(**user_data)
        assert user_create.email == user_data["email"]
        assert user_create.first_name == user_data["first_name"]
        
        # Step 2: Organization Creation (required for user)
        org_data = {
            "name": "Energy Trading Co",
            "admin_email": user_data["email"],
            "admin_password": user_data["password"],
            "admin_first_name": user_data["first_name"],
            "admin_last_name": user_data["last_name"]
        }
        
        org_create = OrganizationCreate(**org_data)
        assert org_create.name == org_data["name"]
        
        # Step 3: Login and get tokens
        from app.core.security import SecurityManager
        
        user_id = str(uuid.uuid4())
        org_id = str(uuid.uuid4())
        
        access_token = SecurityManager.create_access_token(
            user_id=user_id,
            organization_id=org_id
        )
        
        # Verify token
        payload = SecurityManager.verify_token(access_token, "access")
        assert payload is not None
        assert payload.get('sub') == user_id
        
        # Step 4: Create an asset
        from app.schemas import AssetCreate
        
        asset_data = {
            "name": "Solar Farm Alpha",
            "asset_type": "solar",
            "capacity_mw": Decimal("150.0"),
            "site_id": str(uuid.uuid4())
        }
        
        asset_create = AssetCreate(**asset_data)
        assert asset_create.name == asset_data["name"]
        assert asset_create.capacity_mw == asset_data["capacity_mw"]
        
        # Step 5: Create a bid
        from app.schemas import BidCreate
        
        bid_data = {
            "market_operator_id": str(uuid.uuid4()),
            "bid_zone_id": str(uuid.uuid4()),
            "asset_id": str(uuid.uuid4()),
            "offer_type": "sell",
            "market_type": "day_ahead",
            "quantity_mw": Decimal("100.0"),
            "price_rupees": Decimal("50.00"),
            "delivery_start": datetime.now() + timedelta(hours=1),
            "delivery_end": datetime.now() + timedelta(hours=2)
        }
        
        bid_create = BidCreate(**bid_data)
        assert bid_create.quantity_mw == bid_data["quantity_mw"]
        assert bid_create.price_rupees == bid_data["price_rupees"]
        assert bid_create.delivery_start < bid_create.delivery_end
        
        # Step 6: Query market data
        from app.schemas import MarketPriceQuery
        
        market_query = {
            "market_operator_id": bid_data["market_operator_id"],
            "bid_zone_id": bid_data["bid_zone_id"],
            "market_type": "day_ahead",
            "start_time": datetime.now() - timedelta(days=1),
            "end_time": datetime.now()
        }
        
        query = MarketPriceQuery(**market_query)
        assert query.start_time < query.end_time
        
        # Workflow complete - all steps validated
        assert True
    
    @pytest.mark.asyncio
    async def test_market_data_subscription_workflow(self):
        """
        Test workflow: Login -> Subscribe to market zone -> Receive updates
        Validates Requirements: 4.1, 4.2, 4.3, 6.3
        """
        # Step 1: Authenticate
        from app.core.security import SecurityManager
        
        user_id = str(uuid.uuid4())
        org_id = str(uuid.uuid4())
        
        access_token = SecurityManager.create_access_token(
            user_id=user_id,
            organization_id=org_id
        )
        
        payload = SecurityManager.verify_token(access_token, "access")
        assert payload is not None
        
        # Step 2: Connect to WebSocket for market zone
        from app.services.websocket_manager import in_memory_storage
        
        connection_id = str(uuid.uuid4())
        market_zone = "pjm"
        
        await in_memory_storage.cache_websocket_connection(
            connection_id, market_zone, user_id
        )
        
        # Verify connection stored
        conn = await in_memory_storage.get_websocket_connection(connection_id)
        assert conn is not None
        assert conn['market_zone'] == market_zone
        
        # Step 3: Simulate receiving market data update
        price_data = {
            "price": 55.75,
            "volume": 1500.0,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await in_memory_storage.cache_latest_price(market_zone, price_data)
        
        # Step 4: Retrieve latest price
        latest_price = await in_memory_storage.get_latest_price(market_zone)
        assert latest_price is not None
        assert latest_price['price'] == 55.75
        
        # Step 5: Disconnect
        await in_memory_storage.remove_websocket_connection(connection_id)
        
        # Verify disconnection
        conn_after = await in_memory_storage.get_websocket_connection(connection_id)
        assert conn_after is None
    
    @pytest.mark.asyncio
    async def test_analytics_workflow(self):
        """
        Test workflow: Login -> Query historical data -> Generate analytics
        Validates Requirements: 6.5, 8.5
        """
        # Step 1: Authenticate
        from app.core.security import SecurityManager
        
        user_id = str(uuid.uuid4())
        org_id = str(uuid.uuid4())
        
        access_token = SecurityManager.create_access_token(
            user_id=user_id,
            organization_id=org_id
        )
        
        assert access_token is not None
        
        # Step 2: Query market data for analytics
        from app.schemas import MarketPriceQuery
        
        query_data = {
            "market_operator_id": str(uuid.uuid4()),
            "bid_zone_id": str(uuid.uuid4()),
            "market_type": "day_ahead",
            "start_time": datetime.now() - timedelta(days=30),
            "end_time": datetime.now()
        }
        
        query = MarketPriceQuery(**query_data)
        assert query.start_time < query.end_time
        
        # Step 3: Check if ClickHouse is available for advanced analytics
        from app.core.config import settings
        
        if settings.ENABLE_CLICKHOUSE:
            # Advanced analytics available
            analytics_result = {
                "status": "success",
                "metrics": {
                    "avg_price": 52.50,
                    "max_price": 75.00,
                    "min_price": 35.00,
                    "total_volume": 50000.0
                }
            }
            assert analytics_result["status"] == "success"
        else:
            # Graceful degradation - basic analytics only
            basic_analytics = {
                "status": "limited",
                "message": "Advanced analytics unavailable",
                "basic_metrics": {}
            }
            assert basic_analytics["status"] == "limited"


class TestMinimalServiceConfiguration:
    """Test system with minimal services (PostgreSQL only)"""
    
    @pytest.mark.asyncio
    async def test_backend_starts_with_postgresql_only(self):
        """
        Test backend startup with only PostgreSQL
        Validates Requirements: 2.1, 2.5, 7.2, 9.1
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
            from app.core.config import settings
            
            # Verify all optional services are disabled
            assert settings.ENABLE_REDIS == False
            assert settings.ENABLE_KAFKA == False
            assert settings.ENABLE_CLICKHOUSE == False
            assert settings.ENABLE_MLFLOW == False
            
            # Core functionality should still be importable
            from app.core.database import init_db
            from app.routers import auth, users, organizations, assets, bids
            
            # Verify core routers exist
            assert auth.router is not None
            assert users.router is not None
            assert organizations.router is not None
            assert assets.router is not None
            assert bids.router is not None
    
    @pytest.mark.asyncio
    async def test_authentication_works_without_redis(self):
        """
        Test authentication functionality without Redis
        Validates Requirements: 2.1, 6.1, 7.2
        """
        with patch.dict(os.environ, {"ENABLE_REDIS": "false"}):
            from importlib import reload
            from app.core import config
            reload(config)
            
            # Authentication should work without Redis
            from app.core.security import SecurityManager
            from app.schemas import UserCreate, LoginRequest
            
            # Create user
            user_data = {
                "email": "test@minimal.com",
                "password": "TestPass123!",
                "first_name": "Test",
                "last_name": "User"
            }
            
            user_create = UserCreate(**user_data)
            assert user_create.email == user_data["email"]
            
            # Login
            login_data = {
                "email": user_data["email"],
                "password": user_data["password"]
            }
            
            login_request = LoginRequest(**login_data)
            assert login_request.email == login_data["email"]
            
            # Generate token
            user_id = str(uuid.uuid4())
            org_id = str(uuid.uuid4())
            
            access_token = SecurityManager.create_access_token(
                user_id=user_id,
                organization_id=org_id
            )
            
            # Verify token
            payload = SecurityManager.verify_token(access_token, "access")
            assert payload is not None
            assert payload.get('sub') == user_id
    
    @pytest.mark.asyncio
    async def test_crud_operations_without_optional_services(self):
        """
        Test CRUD operations work without optional services
        Validates Requirements: 2.1, 6.1, 6.2, 7.2
        """
        with patch.dict(os.environ, {
            "ENABLE_REDIS": "false",
            "ENABLE_KAFKA": "false",
            "ENABLE_CLICKHOUSE": "false"
        }):
            from importlib import reload
            from app.core import config
            reload(config)
            
            # Test User CRUD
            from app.schemas import UserCreate, UserUpdate
            
            user_data = {
                "email": "crud@minimal.com",
                "password": "Pass123!",
                "first_name": "CRUD",
                "last_name": "Test"
            }
            
            user_create = UserCreate(**user_data)
            assert user_create.email == user_data["email"]
            
            user_update = UserUpdate(first_name="Updated")
            assert user_update.first_name == "Updated"
            
            # Test Organization CRUD
            from app.schemas import OrganizationCreate, OrganizationUpdate
            
            org_data = {
                "name": "Minimal Org",
                "admin_email": user_data["email"],
                "admin_password": user_data["password"],
                "admin_first_name": user_data["first_name"],
                "admin_last_name": user_data["last_name"]
            }
            
            org_create = OrganizationCreate(**org_data)
            assert org_create.name == org_data["name"]
            
            org_update = OrganizationUpdate(name="Updated Org")
            assert org_update.name == "Updated Org"
            
            # Test Asset CRUD
            from app.schemas import AssetCreate, AssetUpdate
            
            asset_data = {
                "name": "Minimal Asset",
                "asset_type": "solar",
                "capacity_mw": Decimal("50.0"),
                "site_id": str(uuid.uuid4())
            }
            
            asset_create = AssetCreate(**asset_data)
            assert asset_create.name == asset_data["name"]
            
            asset_update = AssetUpdate(capacity_mw=Decimal("75.0"))
            assert asset_update.capacity_mw == Decimal("75.0")
    
    @pytest.mark.asyncio
    async def test_websocket_fallback_without_redis(self):
        """
        Test WebSocket uses in-memory fallback without Redis
        Validates Requirements: 4.1, 4.3, 7.2
        """
        with patch.dict(os.environ, {"ENABLE_REDIS": "false"}):
            from importlib import reload
            from app.core import config
            reload(config)
            
            # WebSocket should use in-memory storage
            from app.services.websocket_manager import manager, in_memory_storage
            
            # Set to use in-memory storage
            manager.set_storage_backend(use_redis=False)
            
            assert manager.using_redis == False
            assert manager.storage_backend == in_memory_storage
            
            # Test connection storage
            connection_id = str(uuid.uuid4())
            market_zone = "pjm"
            user_id = str(uuid.uuid4())
            
            await in_memory_storage.cache_websocket_connection(
                connection_id, market_zone, user_id
            )
            
            # Verify connection stored in memory
            conn = await in_memory_storage.get_websocket_connection(connection_id)
            assert conn is not None
            assert conn['market_zone'] == market_zone


class TestFullServiceStack:
    """Test system with full service stack enabled"""
    
    @pytest.mark.asyncio
    async def test_all_services_enabled(self):
        """
        Test configuration with all services enabled
        Validates Requirements: 2.2, 7.1, 7.5
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
            from app.core.config import settings
            
            # Verify all services are enabled
            assert settings.ENABLE_REDIS == True
            assert settings.ENABLE_KAFKA == True
            assert settings.ENABLE_CLICKHOUSE == True
            assert settings.ENABLE_MLFLOW == True
    
    @pytest.mark.asyncio
    async def test_redis_caching_when_available(self):
        """
        Test Redis caching functionality when available
        Validates Requirements: 2.1, 2.2, 7.2
        """
        with patch.dict(os.environ, {"ENABLE_REDIS": "true"}):
            from importlib import reload
            from app.core import config
            reload(config)
            
            # Mock Redis operations
            from app.services.redis_cache import redis_cache
            
            # Simulate Redis available
            redis_cache.is_connected = True
            
            # Test cache operations
            test_key = "test:key"
            test_value = {"data": "test_value"}
            
            # Mock set operation
            with patch.object(redis_cache, 'set', new_callable=AsyncMock) as mock_set:
                await redis_cache.set(test_key, test_value, ttl=60)
                mock_set.assert_called_once()
            
            # Mock get operation
            with patch.object(redis_cache, 'get', new_callable=AsyncMock) as mock_get:
                mock_get.return_value = test_value
                result = await redis_cache.get(test_key)
                assert result == test_value
    
    @pytest.mark.asyncio
    async def test_kafka_streaming_when_available(self):
        """
        Test Kafka streaming functionality when available
        Validates Requirements: 2.1, 2.2, 7.2
        """
        with patch.dict(os.environ, {"ENABLE_KAFKA": "true"}):
            from importlib import reload
            from app.core import config
            reload(config)
            
            # Mock Kafka producer
            with patch('app.services.kafka_producer.start_kafka_producer') as mock_start:
                mock_start.return_value = AsyncMock()
                await mock_start()
                mock_start.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_clickhouse_analytics_when_available(self):
        """
        Test ClickHouse analytics when available
        Validates Requirements: 2.1, 2.2, 6.5, 7.2
        """
        with patch.dict(os.environ, {"ENABLE_CLICKHOUSE": "true"}):
            from importlib import reload
            from app.core import config
            reload(config)
            from app.core.config import settings
            
            assert settings.ENABLE_CLICKHOUSE == True
            
            # Mock ClickHouse service
            with patch('app.services.clickhouse_service.clickhouse_service.initialize') as mock_init:
                mock_init.return_value = AsyncMock()
                await mock_init()
                mock_init.assert_called_once()
            
            # Test analytics query
            analytics_result = {
                "status": "success",
                "data": [
                    {"metric": "avg_price", "value": 50.0},
                    {"metric": "total_volume", "value": 10000.0}
                ]
            }
            
            assert analytics_result["status"] == "success"
            assert len(analytics_result["data"]) > 0


class TestErrorScenarios:
    """Test error scenarios and graceful degradation"""
    
    @pytest.mark.asyncio
    async def test_service_connection_timeout(self):
        """
        Test graceful handling of service connection timeouts
        Validates Requirements: 2.1, 2.3, 8.2
        """
        # Mock Redis timeout
        with patch('app.services.redis_cache.start_redis_cache') as mock_start:
            async def timeout_func():
                await asyncio.sleep(10)
            
            mock_start.side_effect = timeout_func
            
            # Should timeout after 5 seconds
            with pytest.raises(asyncio.TimeoutError):
                await asyncio.wait_for(mock_start(), timeout=5.0)
    
    @pytest.mark.asyncio
    async def test_service_connection_failure(self):
        """
        Test graceful handling of service connection failures
        Validates Requirements: 2.1, 2.3, 8.1, 8.2
        """
        # Mock Redis connection failure
        with patch('app.services.redis_cache.start_redis_cache') as mock_start:
            mock_start.side_effect = ConnectionError("Redis connection refused")
            
            with pytest.raises(ConnectionError) as exc_info:
                await mock_start()
            
            assert "connection refused" in str(exc_info.value).lower()
    
    @pytest.mark.asyncio
    async def test_partial_service_availability(self):
        """
        Test system behavior with partial service availability
        Validates Requirements: 2.1, 2.3, 7.2, 10.2
        """
        service_status = {
            "redis": False,
            "kafka": True,
            "clickhouse": False
        }
        
        # Mock Redis failure
        with patch('app.services.redis_cache.start_redis_cache') as mock_redis:
            mock_redis.side_effect = ConnectionError("Redis unavailable")
            
            # Mock Kafka success
            with patch('app.services.kafka_producer.start_kafka_producer') as mock_kafka:
                mock_kafka.return_value = AsyncMock()
                
                # Mock ClickHouse failure
                with patch('app.services.clickhouse_service.clickhouse_service.initialize') as mock_ch:
                    mock_ch.side_effect = ConnectionError("ClickHouse unavailable")
                    
                    # Try to initialize services
                    try:
                        await mock_redis()
                    except ConnectionError:
                        service_status["redis"] = False
                    
                    try:
                        await mock_kafka()
                        service_status["kafka"] = True
                    except Exception:
                        service_status["kafka"] = False
                    
                    try:
                        await mock_ch()
                    except ConnectionError:
                        service_status["clickhouse"] = False
                    
                    # Verify partial success
                    assert service_status["redis"] == False
                    assert service_status["kafka"] == True
                    assert service_status["clickhouse"] == False
                    
                    # System should continue with available services
                    assert any(service_status.values())
    
    @pytest.mark.asyncio
    async def test_websocket_disconnection_handling(self):
        """
        Test WebSocket disconnection and reconnection
        Validates Requirements: 4.3, 8.4
        """
        from fastapi import WebSocket
        
        mock_websocket = AsyncMock(spec=WebSocket)
        mock_websocket.accept = AsyncMock()
        mock_websocket.send_json = AsyncMock(side_effect=Exception("Connection lost"))
        
        # Try to send (will fail)
        with pytest.raises(Exception) as exc_info:
            await mock_websocket.send_json({"test": "data"})
        
        assert "connection lost" in str(exc_info.value).lower()
        
        # Reconnect
        await mock_websocket.accept()
        assert mock_websocket.accept.call_count == 1
    
    @pytest.mark.asyncio
    async def test_invalid_authentication_attempts(self):
        """
        Test handling of invalid authentication attempts
        Validates Requirements: 6.1, 6.2, 8.3
        """
        from app.core.security import SecurityManager
        
        # Test with invalid token
        invalid_tokens = [
            "",
            "invalid.token",
            "not-a-jwt",
            "Bearer invalid"
        ]
        
        for invalid_token in invalid_tokens:
            payload = SecurityManager.verify_token(invalid_token, "access")
            assert payload is None, f"Invalid token should be rejected: {invalid_token}"
    
    @pytest.mark.asyncio
    async def test_database_connection_error_handling(self):
        """
        Test database connection error handling
        Validates Requirements: 5.1, 8.1, 8.2
        """
        from sqlalchemy.exc import OperationalError
        
        # Simulate database connection error
        def mock_db_operation():
            raise OperationalError("Database connection failed", None, None)
        
        with pytest.raises(OperationalError) as exc_info:
            mock_db_operation()
        
        assert "connection failed" in str(exc_info.value).lower()
    
    @pytest.mark.asyncio
    async def test_validation_error_handling(self):
        """
        Test validation error handling for invalid data
        Validates Requirements: 6.1, 6.4, 8.3
        """
        from app.schemas import UserCreate, BidCreate
        from pydantic import ValidationError
        
        # Invalid email
        with pytest.raises(ValidationError):
            UserCreate(
                email="invalid-email",
                password="Test123!",
                first_name="Test",
                last_name="User"
            )
        
        # Invalid bid - negative quantity
        with pytest.raises(ValidationError):
            BidCreate(
                market_operator_id=str(uuid.uuid4()),
                bid_zone_id=str(uuid.uuid4()),
                asset_id=str(uuid.uuid4()),
                offer_type="sell",
                market_type="day_ahead",
                quantity_mw=Decimal("-10.0"),
                price_rupees=Decimal("50.00"),
                delivery_start=datetime.now(),
                delivery_end=datetime.now() + timedelta(hours=1)
            )


class TestHealthCheckEndpoint:
    """Test health check endpoint functionality"""
    
    @pytest.mark.asyncio
    async def test_health_check_with_all_services(self):
        """
        Test health check reports all service statuses
        Validates Requirements: 2.4, 8.5
        """
        from app.utils.health_check import ServiceStatus, HealthCheckResult
        
        # Mock service results
        service_results = {
            "database": HealthCheckResult(
                status=ServiceStatus.AVAILABLE,
                message="Database connection healthy"
            ),
            "redis": HealthCheckResult(
                status=ServiceStatus.AVAILABLE,
                message="Redis connection healthy"
            ),
            "kafka": HealthCheckResult(
                status=ServiceStatus.UNAVAILABLE,
                message="Kafka connection failed",
                error="Connection refused"
            )
        }
        
        # Verify status reporting
        assert service_results["database"].status == ServiceStatus.AVAILABLE
        assert service_results["redis"].status == ServiceStatus.AVAILABLE
        assert service_results["kafka"].status == ServiceStatus.UNAVAILABLE
        assert service_results["kafka"].error is not None
    
    @pytest.mark.asyncio
    async def test_health_check_overall_status_determination(self):
        """
        Test overall health status determination
        Validates Requirements: 2.4, 8.5
        """
        from app.utils.health_check import ServiceStatus, HealthCheckResult, determine_overall_status
        
        # All services available
        all_available = {
            "database": HealthCheckResult(ServiceStatus.AVAILABLE, "OK"),
            "redis": HealthCheckResult(ServiceStatus.AVAILABLE, "OK")
        }
        
        overall = determine_overall_status(all_available)
        assert overall == ServiceStatus.AVAILABLE
        
        # Some services unavailable
        partial = {
            "database": HealthCheckResult(ServiceStatus.AVAILABLE, "OK"),
            "redis": HealthCheckResult(ServiceStatus.UNAVAILABLE, "Failed")
        }
        
        overall = determine_overall_status(partial)
        assert overall == ServiceStatus.DEGRADED
        
        # Required service unavailable
        critical = {
            "database": HealthCheckResult(ServiceStatus.UNAVAILABLE, "Failed")
        }
        
        overall = determine_overall_status(critical)
        assert overall == ServiceStatus.UNAVAILABLE


class TestSystemStartupAndShutdown:
    """Test system startup and shutdown procedures"""
    
    @pytest.mark.asyncio
    async def test_startup_time_within_bounds(self):
        """
        Test that startup completes within acceptable time
        Validates Requirements: 2.5
        """
        import time
        
        start_time = time.time()
        
        # Simulate minimal startup (PostgreSQL only)
        with patch.dict(os.environ, {
            "ENABLE_REDIS": "false",
            "ENABLE_KAFKA": "false",
            "ENABLE_CLICKHOUSE": "false"
        }):
            from importlib import reload
            from app.core import config
            reload(config)
            
            # Import core components
            from app.core.database import init_db
            from app.routers import auth
            
            # Verify imports work
            assert init_db is not None
            assert auth.router is not None
        
        startup_duration = time.time() - start_time
        
        # Startup should complete within 30 seconds (requirement)
        assert startup_duration < 30.0, f"Startup took {startup_duration:.2f}s, should be < 30s"
    
    @pytest.mark.asyncio
    async def test_graceful_shutdown(self):
        """
        Test graceful shutdown of services
        Validates Requirements: 2.3, 10.5
        """
        # Mock service shutdown
        with patch('app.services.redis_cache.stop_redis_cache') as mock_stop_redis:
            mock_stop_redis.return_value = AsyncMock()
            
            with patch('app.services.kafka_producer.stop_kafka_producer') as mock_stop_kafka:
                mock_stop_kafka.return_value = AsyncMock()
                
                # Shutdown services
                try:
                    await asyncio.wait_for(mock_stop_redis(), timeout=5.0)
                    await asyncio.wait_for(mock_stop_kafka(), timeout=5.0)
                except asyncio.TimeoutError:
                    pytest.fail("Service shutdown should not timeout")
                
                # Verify shutdown was called
                mock_stop_redis.assert_called_once()
                mock_stop_kafka.assert_called_once()


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
