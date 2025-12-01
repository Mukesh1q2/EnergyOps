#!/usr/bin/env python3
"""
Market Data Simulator for Real-time Testing
Generates realistic market data and simulates price movements
"""

import asyncio
import json
import logging
import random
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from uuid import uuid4

import aiohttp
import numpy as np
from faker import Faker

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Market configuration
MARKET_ZONES = {
    'pjm': {'base_price': 52.50, 'volatility': 8.0, 'volume_range': (500, 2000)},
    'caiso': {'base_price': 48.30, 'volatility': 6.5, 'volume_range': (300, 1500)},
    'ercot': {'base_price': 45.80, 'volatility': 7.2, 'volume_range': (400, 1800)},
    'nyiso': {'base_price': 55.20, 'volatility': 9.0, 'volume_range': (600, 2200)},
    'miso': {'base_price': 41.70, 'volatility': 5.8, 'volume_range': (350, 1600)},
    'spp': {'base_price': 38.90, 'volatility': 6.0, 'volume_range': (250, 1200)}
}

class MarketDataSimulator:
    """Simulates real-time market data for testing"""
    
    def __init__(self, api_base_url: str = "http://localhost:8000"):
        self.api_base_url = api_base_url
        self.running = False
        self.current_prices = {}
        self.fake = Faker()
        
        # Initialize current prices
        for zone, config in MARKET_ZONES.items():
            self.current_prices[zone] = config['base_price']
        
        logger.info(f"Market Data Simulator initialized with {len(MARKET_ZONES)} zones")
    
    async def start_simulation(self, interval_seconds: int = 5, duration_minutes: Optional[int] = None):
        """Start the market data simulation"""
        self.running = True
        start_time = time.time()
        
        logger.info(f"Starting market data simulation (interval: {interval_seconds}s)")
        
        try:
            while self.running:
                # Generate data for all market zones
                tasks = []
                for zone in MARKET_ZONES.keys():
                    task = self.generate_and_send_data(zone)
                    tasks.append(task)
                
                # Send data for all zones concurrently
                await asyncio.gather(*tasks)
                
                # Calculate next interval with some randomness
                actual_interval = interval_seconds + random.uniform(-1, 1)
                
                # Check duration limit
                if duration_minutes:
                    elapsed_minutes = (time.time() - start_time) / 60
                    if elapsed_minutes >= duration_minutes:
                        logger.info(f"Simulation duration ({duration_minutes} minutes) reached")
                        break
                
                await asyncio.sleep(max(actual_interval, 1))  # Minimum 1 second
                
        except KeyboardInterrupt:
            logger.info("Simulation interrupted by user")
        except Exception as e:
            logger.error(f"Simulation error: {e}")
        finally:
            self.running = False
            logger.info("Market data simulation stopped")
    
    async def generate_and_send_data(self, market_zone: str):
        """Generate and send data for a specific market zone"""
        try:
            # Generate realistic price movement
            config = MARKET_ZONES[market_zone]
            current_price = self.current_prices[market_zone]
            
            # Use random walk with mean reversion
            volatility = config['volatility']
            mean_price = config['base_price']
            
            # Price change with mean reversion
            random_change = np.random.normal(0, volatility)
            mean_reversion = (mean_price - current_price) * 0.1  # Slow mean reversion
            
            new_price = current_price + random_change + mean_reversion
            new_price = max(new_price, 5.0)  # Ensure positive price
            
            # Generate volume
            min_vol, max_vol = config['volume_range']
            volume = random.uniform(min_vol, max_vol)
            
            # Generate timestamp
            timestamp = datetime.utcnow()
            
            # Send to API
            success = await self.send_price_update(market_zone, new_price, volume, timestamp)
            
            if success:
                self.current_prices[market_zone] = new_price
                logger.info(f"Data sent - {market_zone}: ${new_price:.2f}/MW ({volume:.0f} MW)")
            
            # Occasionally send alerts
            if random.random() < 0.05:  # 5% chance
                await self.send_market_alert(market_zone)
            
            # Occasionally send bid updates
            if random.random() < 0.03:  # 3% chance
                await self.send_bid_update(market_zone)
            
        except Exception as e:
            logger.error(f"Error generating data for {market_zone}: {e}")
    
    async def send_price_update(self, market_zone: str, price: float, volume: float, timestamp: datetime) -> bool:
        """Send price update to the API"""
        try:
            data = {
                'market_zone': market_zone,
                'price': round(price, 2),
                'volume': round(volume, 2),
                'timestamp': timestamp.isoformat()
            }
            
            async with aiohttp.ClientSession() as session:
                url = f"{self.api_base_url}/api/ws/ws/broadcast/price"
                async with session.post(url, json=data) as response:
                    if response.status == 200:
                        return True
                    else:
                        logger.warning(f"API response {response.status} for {market_zone}")
                        return False
                        
        except Exception as e:
            logger.error(f"Failed to send price update for {market_zone}: {e}")
            return False
    
    async def send_market_alert(self, market_zone: str):
        """Send market alert"""
        alert_types = [
            'price_spike', 'volume_surge', 'system_maintenance', 
            'weather_impact', 'demand_forecast', 'transmission_constraints'
        ]
        severities = ['info', 'warning', 'critical']
        
        alert_type = random.choice(alert_types)
        severity = random.choice(severities)
        
        # Generate realistic messages
        messages = {
            'price_spike': f"Significant price increase detected in {market_zone.upper()}",
            'volume_surge': f"High trading volume observed in {market_zone.upper()}",
            'system_maintenance': f"Scheduled maintenance affecting {market_zone.upper()} operations",
            'weather_impact': f"Weather conditions influencing {market_zone.upper()} pricing",
            'demand_forecast': f"Updated demand forecast for {market_zone.upper()} market",
            'transmission_constraints': f"Transmission limitations affecting {market_zone.upper()}"
        }
        
        message = messages.get(alert_type, f"Market update for {market_zone.upper()}")
        
        try:
            data = {
                'market_zone': market_zone,
                'alert_type': alert_type,
                'message': message,
                'severity': severity
            }
            
            async with aiohttp.ClientSession() as session:
                url = f"{self.api_base_url}/api/ws/ws/broadcast/alert"
                async with session.post(url, json=data) as response:
                    if response.status == 200:
                        logger.info(f"Alert sent - {market_zone}: {alert_type} ({severity})")
                        return True
                        
        except Exception as e:
            logger.error(f"Failed to send alert for {market_zone}: {e}")
            return False
    
    async def send_bid_update(self, market_zone: str):
        """Send bid status update"""
        bid_statuses = ['submitted', 'accepted', 'rejected', 'modified', 'expired']
        
        bid_id = str(uuid4())[:8]
        status = random.choice(bid_statuses)
        price = self.current_prices[market_zone] + random.uniform(-2, 2)
        
        try:
            # For demo, we'll use the price update mechanism to simulate bid updates
            data = {
                'market_zone': market_zone,
                'price': round(price, 2),
                'volume': random.uniform(100, 500),
                'timestamp': datetime.utcnow().isoformat()
            }
            
            async with aiohttp.ClientSession() as session:
                url = f"{self.api_base_url}/api/ws/ws/broadcast/price"
                async with session.post(url, json=data) as response:
                    if response.status == 200:
                        logger.info(f"Bid update simulated - {market_zone}: {status} (${price:.2f})")
                        
        except Exception as e:
            logger.error(f"Failed to send bid update for {market_zone}: {e}")
    
    async def stop_simulation(self):
        """Stop the simulation"""
        self.running = False
        logger.info("Stopping market data simulation...")
    
    def get_current_prices(self) -> Dict[str, float]:
        """Get current simulated prices"""
        return self.current_prices.copy()
    
    def reset_prices(self):
        """Reset prices to base values"""
        for zone, config in MARKET_ZONES.items():
            self.current_prices[zone] = config['base_price']
        logger.info("Prices reset to base values")


async def main():
    """Main function to run the simulation"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Market Data Simulator')
    parser.add_argument('--interval', type=int, default=5, help='Update interval in seconds')
    parser.add_argument('--duration', type=int, help='Simulation duration in minutes')
    parser.add_argument('--url', default='http://localhost:8000', help='API base URL')
    parser.add_argument('--zones', nargs='+', default=list(MARKET_ZONES.keys()), 
                       help='Market zones to simulate')
    
    args = parser.parse_args()
    
    # Filter zones if specified
    available_zones = {k: v for k, v in MARKET_ZONES.items() if k in args.zones}
    
    simulator = MarketDataSimulator(args.url)
    simulator.MARKET_ZONES = available_zones  # Update zones
    
    try:
        await simulator.start_simulation(
            interval_seconds=args.interval,
            duration_minutes=args.duration
        )
    except KeyboardInterrupt:
        logger.info("Simulation interrupted")
    finally:
        await simulator.stop_simulation()


if __name__ == "__main__":
    # Install required dependencies if not available
    try:
        import aiohttp
        import numpy as np
        from faker import Faker
    except ImportError as e:
        print(f"Missing dependencies: {e}")
        print("Please install: pip install aiohttp numpy faker")
        exit(1)
    
    asyncio.run(main())