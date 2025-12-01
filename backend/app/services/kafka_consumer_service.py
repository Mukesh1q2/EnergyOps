"""
Kafka Consumer Service for Real-time Market Data Processing
Handles streaming market data processing, validation, and database storage
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable
from uuid import UUID

from kafka import KafkaConsumer, KafkaProducer
from kafka.admin import KafkaAdminClient, ConfigResource, ConfigResourceType
from kafka.errors import KafkaError
from pydantic import ValidationError

from .market_data_integration import MarketPrice, MarketZone

logger = logging.getLogger(__name__)


class MarketDataProcessor:
    """Processes and validates market data streams"""
    
    def __init__(self):
        self.processing_stats = {
            'total_processed': 0,
            'validation_errors': 0,
            'duplicate_records': 0,
            'last_processed': None
        }
    
    def validate_price_data(self, price_data: Dict[str, Any]) -> Optional[MarketPrice]:
        """Validate and convert raw market data to MarketPrice object"""
        try:
            # Validate required fields
            required_fields = ['timestamp', 'market_zone', 'price_type', 'location', 'price']
            for field in required_fields:
                if field not in price_data:
                    logger.warning(f"Missing required field: {field}")
                    self.processing_stats['validation_errors'] += 1
                    return None
            
            # Convert and validate timestamp
            timestamp = datetime.fromisoformat(price_data['timestamp'].replace('Z', '+00:00'))
            
            # Validate market zone
            try:
                market_zone = MarketZone(price_data['market_zone'])
            except ValueError:
                logger.warning(f"Invalid market zone: {price_data['market_zone']}")
                self.processing_stats['validation_errors'] += 1
                return None
            
            # Convert price and volume
            price = float(price_data['price'])
            volume = float(price_data.get('volume', 0))
            
            # Create MarketPrice object
            market_price = MarketPrice(
                timestamp=timestamp,
                market_zone=market_zone,
                price_type=price_data['price_type'],
                location=price_data['location'],
                price=price,
                volume=volume,
                congestion_cost=price_data.get('congestion_cost'),
                loss_cost=price_data.get('loss_cost'),
                renewable_percentage=price_data.get('renewable_percentage'),
                load_forecast=price_data.get('load_forecast')
            )
            
            # Business logic validations
            if price < -100:  # Negative pricing check
                logger.warning(f"Negative pricing detected: {price} at {timestamp}")
            elif price > 1000:  # Price spike check
                logger.warning(f"Price spike detected: ${price} at {timestamp}")
            
            self.processing_stats['total_processed'] += 1
            self.processing_stats['last_processed'] = timestamp
            
            return market_price
            
        except (ValueError, TypeError) as e:
            logger.error(f"Data validation error: {e}")
            self.processing_stats['validation_errors'] += 1
            return None
    
    def detect_duplicates(self, price_data: MarketPrice, recent_data: List[MarketPrice]) -> bool:
        """Detect duplicate price records"""
        for recent_price in recent_data[-10:]:  # Check last 10 records
            if (recent_price.timestamp == price_data.timestamp and
                recent_price.market_zone == price_data.market_zone and
                recent_price.location == price_data.location and
                abs(recent_price.price - price_data.price) < 0.01):  # Price within 1 cent
                self.processing_stats['duplicate_records'] += 1
                return True
        return False
    
    def calculate_metrics(self, prices: List[MarketPrice]) -> Dict[str, Any]:
        """Calculate market metrics from price data"""
        if not prices:
            return {}
        
        # Group by market zone
        zones = {}
        for price in prices:
            zone = price.market_zone.value
            if zone not in zones:
                zones[zone] = []
            zones[zone].append(price)
        
        metrics = {}
        for zone, zone_prices in zones.items():
            if zone_prices:
                prices_only = [p.price for p in zone_prices]
                volumes = [p.volume for p in zone_prices]
                
                metrics[zone] = {
                    'current_price': zone_prices[-1].price if zone_prices else 0,
                    'avg_price': sum(prices_only) / len(prices_only),
                    'max_price': max(prices_only),
                    'min_price': min(prices_only),
                    'price_volatility': self._calculate_volatility(prices_only),
                    'total_volume': sum(volumes),
                    'avg_volume': sum(volumes) / len(volumes),
                    'renewable_percentage': zone_prices[-1].renewable_percentage if zone_prices[-1].renewable_percentage else 0,
                    'record_count': len(zone_prices),
                    'timestamp': max(p.timestamp for p in zone_prices)
                }
        
        return metrics
    
    def _calculate_volatility(self, prices: List[float]) -> float:
        """Calculate price volatility (standard deviation)"""
        if len(prices) < 2:
            return 0.0
        
        mean_price = sum(prices) / len(prices)
        variance = sum((price - mean_price) ** 2 for price in prices) / len(prices)
        return variance ** 0.5


class MarketDataKafkaConsumer:
    """Kafka consumer for market data streams"""
    
    def __init__(self, bootstrap_servers: str = "localhost:9092", group_id: str = "market_data_processor"):
        self.bootstrap_servers = bootstrap_servers
        self.group_id = group_id
        self.consumer: Optional[KafkaConsumer] = None
        self.producer: Optional[KafkaProducer] = None
        self.processor = MarketDataProcessor()
        self.is_running = False
        self.topics = ['market_data.pjm', 'market_data.caiso', 'market_data.ercot']
        
    async def initialize(self):
        """Initialize Kafka consumer and producer"""
        try:
            # Initialize consumer
            self.consumer = KafkaConsumer(
                *self.topics,
                bootstrap_servers=self.bootstrap_servers,
                group_id=self.group_id,
                auto_offset_reset='latest',
                enable_auto_commit=True,
                auto_commit_interval_ms=5000,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')) if m else None,
                key_deserializer=lambda k: k.decode('utf-8') if k else None
            )
            
            # Initialize producer for processed data
            self.producer = KafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                value_serializer=lambda v: json.dumps(v, default=str).encode('utf-8')
            )
            
            self.is_running = True
            logger.info(f"Kafka consumer initialized for topics: {self.topics}")
            
        except KafkaError as e:
            logger.error(f"Failed to initialize Kafka consumer: {e}")
            raise
    
    async def process_market_data_stream(self):
        """Process real-time market data from Kafka streams"""
        if not self.consumer:
            logger.error("Kafka consumer not initialized")
            return
        
        logger.info("Starting market data stream processing...")
        
        try:
            while self.is_running:
                # Poll for messages
                message_batch = self.consumer.poll(timeout_ms=1000, max_records=100)
                
                if not message_batch:
                    await asyncio.sleep(1)
                    continue
                
                # Process each partition
                for topic_partition, messages in message_batch.items():
                    topic = topic_partition.topic
                    
                    # Extract market zone from topic
                    market_zone = topic.split('.')[-1].upper()
                    
                    logger.debug(f"Processing {len(messages)} messages from {topic}")
                    
                    # Process each message
                    for message in messages:
                        try:
                            # Validate and process the message
                            price_data = self.processor.validate_price_data(message.value)
                            
                            if price_data:
                                # Store in database (implement database storage logic)
                                await self._store_price_data(price_data)
                                
                                # Publish to processed data topic
                                await self._publish_processed_data(price_data)
                                
                                # Calculate and publish metrics
                                await self._update_market_metrics(market_zone)
                                
                        except Exception as e:
                            logger.error(f"Error processing message: {e}")
                            continue
                
                # Commit offsets
                self.consumer.commit()
                
        except KafkaError as e:
            logger.error(f"Kafka consumer error: {e}")
        except Exception as e:
            logger.error(f"Unexpected error in data processing: {e}")
    
    async def _store_price_data(self, price_data: MarketPrice):
        """Store price data in database"""
        try:
            # This would typically write to TimescaleDB
            # For now, we'll just log the operation
            logger.debug(f"Storing price data: {price_data.market_zone.value} - ${price_data.price} at {price_data.location}")
            
            # In production, implement:
            # - PostgreSQL/TimescaleDB storage
            # - Data partitioning by time
            # - Retention policy management
            # - Compression for historical data
            
        except Exception as e:
            logger.error(f"Error storing price data: {e}")
    
    async def _publish_processed_data(self, price_data: MarketPrice):
        """Publish processed and validated data"""
        try:
            topic = "market_data.processed"
            message = {
                'timestamp': price_data.timestamp.isoformat(),
                'market_zone': price_data.market_zone.value,
                'price_type': price_data.price_type,
                'location': price_data.location,
                'price': price_data.price,
                'volume': price_data.volume,
                'validation_status': 'validated',
                'processing_time': datetime.now().isoformat()
            }
            
            self.producer.send(topic, value=message)
            logger.debug(f"Published processed data to {topic}")
            
        except KafkaError as e:
            logger.error(f"Error publishing processed data: {e}")
    
    async def _update_market_metrics(self, market_zone: str):
        """Update and publish market metrics"""
        try:
            # Fetch recent data for metric calculation
            # This is a simplified implementation
            metrics = {
                'market_zone': market_zone,
                'timestamp': datetime.now().isoformat(),
                'metrics_type': 'realtime_update'
            }
            
            topic = "market_metrics"
            self.producer.send(topic, value=metrics)
            logger.debug(f"Published metrics update for {market_zone}")
            
        except KafkaError as e:
            logger.error(f"Error publishing metrics: {e}")
    
    async def get_processing_stats(self) -> Dict[str, Any]:
        """Get processing statistics"""
        return {
            **self.processor.processing_stats,
            'is_running': self.is_running,
            'consumer_topics': list(self.topics),
            'kafka_connection': self.consumer is not None
        }
    
    async def start_consuming(self):
        """Start consuming market data"""
        await self.initialize()
        await self.process_market_data_stream()
    
    async def stop_consuming(self):
        """Stop consuming market data"""
        self.is_running = False
        if self.consumer:
            self.consumer.close()
        if self.producer:
            self.producer.close()
        logger.info("Market data consumer stopped")


class MarketDataStreamManager:
    """Manager for multiple market data streams"""
    
    def __init__(self, bootstrap_servers: str = "localhost:9092"):
        self.bootstrap_servers = bootstrap_servers
        self.consumers: Dict[str, MarketDataKafkaConsumer] = {}
        self.admin_client: Optional[KafkaAdminClient] = None
        
    async def initialize(self):
        """Initialize Kafka admin client"""
        try:
            self.admin_client = KafkaAdminClient(
                bootstrap_servers=self.bootstrap_servers
            )
            logger.info("Kafka admin client initialized")
        except KafkaError as e:
            logger.error(f"Failed to initialize Kafka admin client: {e}")
            raise
    
    async def create_market_topics(self):
        """Create Kafka topics for market data"""
        try:
            topics = {
                'market_data.pjm': {'num_partitions': 3, 'replication_factor': 2},
                'market_data.caiso': {'num_partitions': 3, 'replication_factor': 2},
                'market_data.ercot': {'num_partitions': 3, 'replication_factor': 2},
                'market_data.processed': {'num_partitions': 2, 'replication_factor': 2},
                'market_metrics': {'num_partitions': 2, 'replication_factor': 2},
                'alerts.market_data': {'num_partitions': 2, 'replication_factor': 2}
            }
            
            for topic_name, config in topics.items():
                topic_creation_config = {
                    'topic': topic_name,
                    'num_partitions': config['num_partitions'],
                    'replication_factor': config['replication_factor'],
                    'config_entries': [
                        {'config_name': 'retention.ms', 'config_value': str(30 * 24 * 60 * 60 * 1000)},  # 30 days
                        ('compression.type', 'gzip'),
                        ('cleanup.policy', 'delete')
                    ]
                }
                
                try:
                    self.admin_client.create_topics([topic_creation_config])
                    logger.info(f"Created topic: {topic_name}")
                except Exception as e:
                    # Topic might already exist
                    logger.debug(f"Topic {topic_name} may already exist: {e}")
            
        except Exception as e:
            logger.error(f"Error creating market data topics: {e}")
    
    async def start_consumer_group(self, group_id: str, consumer_count: int = 3):
        """Start multiple consumers for load balancing"""
        for i in range(consumer_count):
            consumer_id = f"{group_id}-{i}"
            consumer = MarketDataKafkaConsumer(
                bootstrap_servers=self.bootstrap_servers,
                group_id=f"{group_id}-{i}"
            )
            
            self.consumers[consumer_id] = consumer
            logger.info(f"Started consumer: {consumer_id}")
        
        # Start all consumers
        consumer_tasks = []
        for consumer in self.consumers.values():
            task = asyncio.create_task(consumer.start_consuming())
            consumer_tasks.append(task)
        
        # Wait for all consumers
        await asyncio.gather(*consumer_tasks)
    
    async def stop_all_consumers(self):
        """Stop all consumers"""
        for consumer in self.consumers.values():
            await consumer.stop_consuming()
        
        if self.admin_client:
            self.admin_client.close()
        
        logger.info("All market data consumers stopped")


# Global market data stream manager
market_data_stream_manager = MarketDataStreamManager()


async def start_market_data_streaming():
    """Start the market data streaming service"""
    await market_data_stream_manager.initialize()
    await market_data_stream_manager.create_market_topics()
    await market_data_stream_manager.start_consumer_group("market_data_processor", 3)


async def stop_market_data_streaming():
    """Stop the market data streaming service"""
    await market_data_stream_manager.stop_all_consumers()