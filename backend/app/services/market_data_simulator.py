"""
Market Data Simulator for Testing
Generates realistic market data for PJM, CAISO, and ERCOT markets
"""

import asyncio
import json
import logging
import os
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from uuid import uuid4

import aiohttp

# Lazy import for Kafka
KafkaProducer = None
KafkaError = None

def _load_kafka():
    """Lazy load Kafka modules"""
    global KafkaProducer, KafkaError
    if KafkaProducer is None:
        try:
            from kafka import KafkaProducer as KP
            from kafka.errors import KafkaError as KE
            KafkaProducer = KP
            KafkaError = KE
            return True
        except ImportError:
            logging.warning("kafka-python not installed, Kafka features disabled")
            return False
    return True

from .market_data_integration import MarketZone

logger = logging.getLogger(__name__)


class MarketDataSimulator:
    """Simulates realistic market data for testing and development"""
    
    def __init__(self, bootstrap_servers: str = None):
        self.bootstrap_servers = bootstrap_servers or os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
        self._producer = None
        self._kafka_enabled = os.getenv("ENABLE_KAFKA", "false").lower() == "true"
        self.running = False
        self.tasks = []
    
    @property
    def producer(self):
        """Lazy initialization of Kafka producer"""
        if self._producer is None and self._kafka_enabled:
            if not _load_kafka():
                self._kafka_enabled = False
                return None
            try:
                self._producer = KafkaProducer(
                    bootstrap_servers=self.bootstrap_servers,
                    value_serializer=lambda v: json.dumps(v, default=str).encode('utf-8'),
                    key_serializer=lambda k: str(k).encode('utf-8') if k else None,
                    request_timeout_ms=5000
                )
                logging.info(f"Kafka producer connected for simulator")
            except Exception as e:
                logging.warning(f"Kafka producer initialization failed: {e}")
                self._kafka_enabled = False
        return self._producer
        
        # Market configuration
        self.market_configs = {
            MarketZone.PJM: {
                'base_price': 35.0,
                'price_volatility': 0.3,
                'base_volume': 25000.0,
                'renewable_base': 25.0,
                'locations': ['COMED', 'ATLANTIC', 'BGE', 'DOMINION', 'PECO', 'PPL', 'PSE_G']
            },
            MarketZone.CAISO: {
                'base_price': 28.0,
                'price_volatility': 0.4,
                'base_volume': 22000.0,
                'renewable_base': 45.0,
                'locations': ['CAISO_HUB', 'PG_E_BAY', 'SIEBEL_NAPA', 'SIERRA', 'N_1604', 'S_1802', 'FRESNO']
            },
            MarketZone.ERCOT: {
                'base_price': 32.0,
                'price_volatility': 0.25,
                'base_volume': 45000.0,
                'renewable_base': 35.0,
                'locations': ['AUSTIN', 'COASTAL', 'DALLAS', 'FORT_WORTH', 'HOUSTON', 'NORTH', 'SOUTH']
            }
        }
        
        # Time-based price patterns
        self.hourly_patterns = {
            # Peak hours (6-10 AM, 5-9 PM)
            'peak': [6, 7, 8, 9, 17, 18, 19, 20, 21],
            # Shoulder hours
            'shoulder': [10, 11, 12, 13, 14, 15, 16],
            # Off-peak hours
            'off_peak': [0, 1, 2, 3, 4, 5, 22, 23]
        }
    
    def _calculate_price_multiplier(self, market_zone: MarketZone, current_hour: int) -> float:
        """Calculate price multiplier based on time of day"""
        if current_hour in self.hourly_patterns['peak']:
            return random.uniform(1.3, 2.0)  # Peak pricing
        elif current_hour in self.hourly_patterns['shoulder']:
            return random.uniform(0.9, 1.2)  # Shoulder pricing
        else:
            return random.uniform(0.5, 0.8)  # Off-peak pricing
    
    def _simulate_load_forecast(self, market_zone: MarketZone, base_volume: float, current_hour: int) -> float:
        """Simulate realistic load forecast"""
        # Time-based load pattern
        hour_multiplier = self._calculate_price_multiplier(market_zone, current_hour)
        
        # Add some randomness
        randomness = random.uniform(0.8, 1.2)
        
        # Day of week effect (weekends have lower demand)
        now = datetime.now()
        if now.weekday() >= 5:  # Weekend
            weekend_factor = 0.85
        else:
            weekend_factor = 1.0
        
        return base_volume * hour_multiplier * randomness * weekend_factor
    
    def _simulate_renewable_percentage(self, base_percentage: float, current_hour: int) -> float:
        """Simulate renewable energy percentage"""
        # Solar peaks around noon
        if 10 <= current_hour <= 16:
            solar_boost = random.uniform(0.1, 0.3)
            renewable_pct = min(base_percentage + solar_boost, 85.0)
        else:
            renewable_pct = max(base_percentage * random.uniform(0.7, 1.0), 5.0)
        
        return round(renewable_pct, 2)
    
    def _generate_price_data(self, market_zone: MarketZone, timestamp: datetime) -> Dict:
        """Generate realistic price data for a market zone"""
        config = self.market_configs[market_zone]
        current_hour = timestamp.hour
        
        # Calculate base metrics
        price_multiplier = self._calculate_price_multiplier(market_zone, current_hour)
        base_price = config['base_price']
        
        # Price with volatility
        volatility = random.gauss(0, config['price_volatility'])
        price = base_price * price_multiplier * (1 + volatility)
        price = max(price, -50.0)  # Prevent extreme negative prices
        
        # Volume based on load forecast
        load_forecast = self._simulate_load_forecast(market_zone, config['base_volume'], current_hour)
        
        # Renewable percentage
        renewable_percentage = self._simulate_renewable_percentage(config['renewable_base'], current_hour)
        
        # Congestion and loss costs
        congestion_cost = random.uniform(-5.0, 15.0)
        loss_cost = random.uniform(-2.0, 5.0)
        
        # Select random location
        location = random.choice(config['locations'])
        
        return {
            'timestamp': timestamp.isoformat(),
            'market_zone': market_zone.value,
            'price_type': 'RT_LMP',
            'location': location,
            'price': round(price, 2),
            'volume': round(load_forecast, 2),
            'congestion_cost': round(congestion_cost, 4),
            'loss_cost': round(loss_cost, 4),
            'renewable_percentage': renewable_percentage,
            'load_forecast': round(load_forecast, 2),
            'data_source': 'simulator',
            'event_id': str(uuid4())
        }
    
    async def _simulate_single_update(self, market_zone: MarketZone) -> bool:
        """Simulate a single market data update"""
        try:
            timestamp = datetime.now()
            price_data = self._generate_price_data(market_zone, timestamp)
            
            # Publish to Kafka if enabled
            if self._kafka_enabled and self.producer:
                topic = f"market_data.{market_zone.value.lower()}"
                key = f"{market_zone.value.lower()}.{timestamp.isoformat()}"
                self.producer.send(topic, key=key.encode('utf-8'), value=price_data)
            
            logger.debug(f"Simulated {market_zone.value} data: ${price_data['price']:.2f} at {price_data['location']}")
            return True
            
        except Exception as e:
            logger.error(f"Error simulating {market_zone.value} data: {e}")
            return False
    
    async def _simulate_bulk_update(self, market_zone: MarketZone, count: int = 10) -> int:
        """Simulate multiple data points for backfill testing"""
        success_count = 0
        
        # Generate data points for the past 24 hours
        now = datetime.now()
        
        for i in range(count):
            timestamp = now - timedelta(hours=count-i)
            price_data = self._generate_price_data(market_zone, timestamp)
            
            try:
                if self._kafka_enabled and self.producer:
                    topic = f"market_data.{market_zone.value.lower()}"
                    key = f"{market_zone.value.lower()}.{timestamp.isoformat()}"
                    self.producer.send(topic, key=key.encode('utf-8'), value=price_data)
                success_count += 1
                
            except Exception as e:
                logger.error(f"Error sending bulk data for {market_zone.value}: {e}")
                continue
        
        logger.info(f"Simulated {success_count} bulk data points for {market_zone.value}")
        return success_count
    
    async def start_simulation(self, update_interval: int = 30, market_zones: Optional[List[MarketZone]] = None):
        """Start continuous market data simulation"""
        if market_zones is None:
            market_zones = list(MarketZone)
        
        self.running = True
        logger.info(f"Starting market data simulation for {len(market_zones)} zones")
        
        while self.running:
            tasks = []
            
            for market_zone in market_zones:
                task = asyncio.create_task(
                    self._simulate_single_update(market_zone)
                )
                tasks.append(task)
            
            # Wait for all updates to complete
            await asyncio.gather(*tasks, return_exceptions=True)
            
            # Wait for next update cycle
            await asyncio.sleep(update_interval)
    
    async def simulate_historical_data(self, start_date: datetime, end_date: datetime, 
                                     market_zones: Optional[List[MarketZone]] = None):
        """Simulate historical data for testing backfill functionality"""
        if market_zones is None:
            market_zones = list(MarketZone)
        
        logger.info(f"Starting historical simulation from {start_date} to {end_date}")
        
        total_records = 0
        
        for market_zone in market_zones:
            # Simulate 15-minute intervals for the date range
            current_date = start_date
            while current_date <= end_date:
                for hour in range(24):
                    for minute in [0, 15, 30, 45]:  # 15-minute intervals
                        timestamp = current_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
                        
                        try:
                            price_data = self._generate_price_data(market_zone, timestamp)
                            price_data['timestamp'] = timestamp.isoformat()
                            
                            if self._kafka_enabled and self.producer:
                                topic = f"market_data.{market_zone.value.lower()}"
                                key = f"{market_zone.value.lower()}.{timestamp.isoformat()}"
                                self.producer.send(topic, key=key.encode('utf-8'), value=price_data)
                            total_records += 1
                            
                        except Exception as e:
                            logger.error(f"Error simulating historical data: {e}")
                            continue
                
                current_date += timedelta(days=1)
        
        logger.info(f"Historical simulation completed. Total records: {total_records}")
        return total_records
    
    async def stop_simulation(self):
        """Stop the simulation"""
        self.running = False
        
        # Cancel all running tasks
        for task in self.tasks:
            if not task.done():
                task.cancel()
        
        # Close Kafka producer if initialized
        if self._producer:
            self._producer.close()
        
        logger.info("Market data simulation stopped")


# Global simulator instance (lazy initialization - won't connect to Kafka until used)
market_simulator = MarketDataSimulator()


async def start_real_time_simulation():
    """Start real-time market data simulation"""
    await market_simulator.start_simulation(update_interval=30)


async def simulate_historical_data_batch(start_date: datetime, end_date: datetime):
    """Simulate historical data for backfill testing"""
    return await market_simulator.simulate_historical_data(start_date, end_date)


async def stop_market_simulation():
    """Stop market data simulation"""
    await market_simulator.stop_simulation()


# CLI interface for testing
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Market Data Simulator")
    parser.add_argument("--mode", choices=["realtime", "historical"], default="realtime")
    parser.add_argument("--start-date", type=str, help="Start date for historical simulation (YYYY-MM-DD)")
    parser.add_argument("--end-date", type=str, help="End date for historical simulation (YYYY-MM-DD)")
    parser.add_argument("--zones", nargs="+", choices=["PJM", "CAISO", "ERCOT"], default=["PJM", "CAISO", "ERCOT"])
    parser.add_argument("--interval", type=int, default=30, help="Update interval in seconds")
    
    args = parser.parse_args()
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    async def main():
        if args.mode == "realtime":
            zones = [MarketZone(zone) for zone in args.zones]
            await market_simulator.start_simulation(update_interval=args.interval, market_zones=zones)
        elif args.mode == "historical":
            if not args.start_date or not args.end_date:
                print("Error: --start-date and --end-date required for historical mode")
                return
            
            start_date = datetime.fromisoformat(args.start_date)
            end_date = datetime.fromisoformat(args.end_date)
            
            zones = [MarketZone(zone) for zone in args.zones]
            count = await market_simulator.simulate_historical_data(start_date, end_date, zones)
            print(f"Simulated {count} historical records")
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        asyncio.run(stop_market_simulation())