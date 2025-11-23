"""
OptiBid Energy Platform - Database Seed Script
Populates database with sample test data for development

This script is idempotent - it can be run multiple times safely.
It will skip existing data and only create missing records.

Usage:
    python backend/scripts/seed_database.py
"""

import asyncio
import sys
import logging
from datetime import datetime, timedelta
from decimal import Decimal
import random
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext

from app.core.database import AsyncSessionLocal, init_db
from app.models import (
    Organization, User, MarketOperator, BidZone, Site, Asset,
    AssetBidZone, SubscriptionPlan, Dataset
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed_subscription_plans(session):
    """Seed subscription plans"""
    logger.info("Seeding subscription plans...")
    
    plans = [
        {
            "name": "Trial",
            "tier": "trial",
            "price_monthly": Decimal("0.00"),
            "price_yearly": Decimal("0.00"),
            "features": {
                "api_calls": "unlimited",
                "dashboards": 3,
                "storage_gb": 5,
                "support": "community"
            },
            "limits": {
                "max_users": 5,
                "max_assets": 10,
                "data_retention_days": 30
            },
            "is_active": True
        },
        {
            "name": "Basic",
            "tier": "basic",
            "price_monthly": Decimal("999.00"),
            "price_yearly": Decimal("9999.00"),
            "features": {
                "api_calls": "unlimited",
                "dashboards": 10,
                "storage_gb": 100,
                "support": "email"
            },
            "limits": {
                "max_users": 25,
                "max_assets": 100,
                "data_retention_days": 365
            },
            "is_active": True
        },
        {
            "name": "Professional",
            "tier": "professional",
            "price_monthly": Decimal("2999.00"),
            "price_yearly": Decimal("29999.00"),
            "features": {
                "api_calls": "unlimited",
                "dashboards": 50,
                "storage_gb": 500,
                "support": "priority"
            },
            "limits": {
                "max_users": 100,
                "max_assets": 500,
                "data_retention_days": 1825
            },
            "is_active": True
        },
        {
            "name": "Enterprise",
            "tier": "enterprise",
            "price_monthly": Decimal("9999.00"),
            "price_yearly": Decimal("99999.00"),
            "features": {
                "api_calls": "unlimited",
                "dashboards": "unlimited",
                "storage_gb": "unlimited",
                "support": "dedicated"
            },
            "limits": {
                "max_users": "unlimited",
                "max_assets": "unlimited",
                "data_retention_days": "unlimited"
            },
            "is_active": True
        }
    ]
    
    created_count = 0
    for plan_data in plans:
        result = await session.execute(
            select(SubscriptionPlan).where(SubscriptionPlan.tier == plan_data["tier"])
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            plan = SubscriptionPlan(**plan_data)
            session.add(plan)
            created_count += 1
            logger.info(f"  Created subscription plan: {plan_data['name']}")
        else:
            logger.info(f"  Subscription plan already exists: {plan_data['name']}")
    
    await session.commit()
    logger.info(f"✅ Subscription plans: {created_count} created\n")


async def seed_market_operators(session):
    """Seed Indian market operators"""
    logger.info("Seeding market operators...")
    
    operators = [
        {
            "name": "Power System Operation Corporation Limited",
            "code": "POSOCO",
            "region": "All India",
            "country": "India",
            "timezone": "Asia/Kolkata",
            "contact_email": "contact@posoco.in"
        },
        {
            "name": "Northern Regional Load Despatch Centre",
            "code": "NRLDC",
            "region": "Northern Region",
            "country": "India",
            "timezone": "Asia/Kolkata",
            "contact_email": "nldc@posoco.in"
        },
        {
            "name": "Western Regional Load Despatch Centre",
            "code": "WRLDC",
            "region": "Western Region",
            "country": "India",
            "timezone": "Asia/Kolkata",
            "contact_email": "wldc@posoco.in"
        },
        {
            "name": "Southern Regional Load Despatch Centre",
            "code": "SRLDC",
            "region": "Southern Region",
            "country": "India",
            "timezone": "Asia/Kolkata",
            "contact_email": "sldc@posoco.in"
        },
        {
            "name": "Eastern Regional Load Despatch Centre",
            "code": "ERLDC",
            "region": "Eastern Region",
            "country": "India",
            "timezone": "Asia/Kolkata",
            "contact_email": "eldc@posoco.in"
        },
        {
            "name": "State Load Despatch Centre Delhi",
            "code": "SLDC-Delhi",
            "region": "Delhi",
            "country": "India",
            "timezone": "Asia/Kolkata",
            "contact_email": "sldc-delhi@gov.in"
        },
        {
            "name": "State Load Despatch Centre Maharashtra",
            "code": "SLDC-Maharashtra",
            "region": "Maharashtra",
            "country": "India",
            "timezone": "Asia/Kolkata",
            "contact_email": "sldc-maharashtra@gov.in"
        }
    ]
    
    created_count = 0
    operator_map = {}
    
    for op_data in operators:
        result = await session.execute(
            select(MarketOperator).where(MarketOperator.code == op_data["code"])
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            operator = MarketOperator(**op_data)
            session.add(operator)
            await session.flush()
            operator_map[op_data["code"]] = operator
            created_count += 1
            logger.info(f"  Created market operator: {op_data['name']}")
        else:
            operator_map[op_data["code"]] = existing
            logger.info(f"  Market operator already exists: {op_data['name']}")
    
    await session.commit()
    logger.info(f"✅ Market operators: {created_count} created\n")
    return operator_map


async def seed_bid_zones(session, operator_map):
    """Seed bid zones"""
    logger.info("Seeding bid zones...")
    
    zones = [
        {"operator_code": "NRLDC", "zone_code": "NR", "zone_name": "Northern Region"},
        {"operator_code": "WRLDC", "zone_code": "WR", "zone_name": "Western Region"},
        {"operator_code": "SRLDC", "zone_code": "SR", "zone_name": "Southern Region"},
        {"operator_code": "ERLDC", "zone_code": "ER", "zone_name": "Eastern Region"},
        {"operator_code": "SLDC-Delhi", "zone_code": "DEL", "zone_name": "Delhi"},
        {"operator_code": "SLDC-Maharashtra", "zone_code": "MH", "zone_name": "Maharashtra"}
    ]
    
    created_count = 0
    zone_map = {}
    
    for zone_data in zones:
        operator = operator_map.get(zone_data["operator_code"])
        if not operator:
            logger.warning(f"  Operator not found: {zone_data['operator_code']}")
            continue
        
        result = await session.execute(
            select(BidZone).where(
                BidZone.market_operator_id == operator.id,
                BidZone.zone_code == zone_data["zone_code"]
            )
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            zone = BidZone(
                market_operator_id=operator.id,
                zone_code=zone_data["zone_code"],
                zone_name=zone_data["zone_name"]
            )
            session.add(zone)
            await session.flush()
            zone_map[zone_data["zone_code"]] = zone
            created_count += 1
            logger.info(f"  Created bid zone: {zone_data['zone_name']}")
        else:
            zone_map[zone_data["zone_code"]] = existing
            logger.info(f"  Bid zone already exists: {zone_data['zone_name']}")
    
    await session.commit()
    logger.info(f"✅ Bid zones: {created_count} created\n")
    return zone_map


async def seed_organizations_and_users(session):
    """Seed sample organizations and users"""
    logger.info("Seeding organizations and users...")
    
    orgs_data = [
        {
            "name": "Green Energy Corp",
            "slug": "green-energy-corp",
            "status": "active",
            "subscription_tier": "enterprise",
            "users": [
                {
                    "email": "admin@greenenergy.com",
                    "password": "admin123",
                    "first_name": "Admin",
                    "last_name": "User",
                    "role": "admin",
                    "status": "active",
                    "email_verified": True
                },
                {
                    "email": "trader@greenenergy.com",
                    "password": "trader123",
                    "first_name": "Trader",
                    "last_name": "User",
                    "role": "trader",
                    "status": "active",
                    "email_verified": True
                }
            ]
        },
        {
            "name": "Solar Power Solutions",
            "slug": "solar-power-solutions",
            "status": "active",
            "subscription_tier": "professional",
            "users": [
                {
                    "email": "admin@solarpower.com",
                    "password": "admin123",
                    "first_name": "Solar",
                    "last_name": "Admin",
                    "role": "admin",
                    "status": "active",
                    "email_verified": True
                }
            ]
        },
        {
            "name": "Test Organization",
            "slug": "test-org",
            "status": "active",
            "subscription_tier": "trial",
            "users": [
                {
                    "email": "admin@optibid.com",
                    "password": "admin123",
                    "first_name": "Admin",
                    "last_name": "User",
                    "role": "admin",
                    "status": "active",
                    "email_verified": True
                },
                {
                    "email": "trader@optibid.com",
                    "password": "trader123",
                    "first_name": "Trader",
                    "last_name": "User",
                    "role": "trader",
                    "status": "active",
                    "email_verified": True
                },
                {
                    "email": "analyst@optibid.com",
                    "password": "analyst123",
                    "first_name": "Analyst",
                    "last_name": "User",
                    "role": "analyst",
                    "status": "active",
                    "email_verified": True
                },
                {
                    "email": "viewer@optibid.com",
                    "password": "viewer123",
                    "first_name": "Viewer",
                    "last_name": "User",
                    "role": "viewer",
                    "status": "active",
                    "email_verified": True
                }
            ]
        }
    ]
    
    org_count = 0
    user_count = 0
    org_map = {}
    
    for org_data in orgs_data:
        users_data = org_data.pop("users")
        
        result = await session.execute(
            select(Organization).where(Organization.slug == org_data["slug"])
        )
        org = result.scalar_one_or_none()
        
        if not org:
            org = Organization(**org_data)
            session.add(org)
            await session.flush()
            org_count += 1
            logger.info(f"  Created organization: {org_data['name']}")
        else:
            logger.info(f"  Organization already exists: {org_data['name']}")
        
        org_map[org_data["slug"]] = org
        
        # Create users for this organization
        for user_data in users_data:
            result = await session.execute(
                select(User).where(User.email == user_data["email"])
            )
            existing_user = result.scalar_one_or_none()
            
            if not existing_user:
                password = user_data.pop("password")
                user = User(
                    organization_id=org.id,
                    password_hash=pwd_context.hash(password),
                    **user_data
                )
                session.add(user)
                user_count += 1
                logger.info(f"    Created user: {user_data['email']} (role: {user_data['role']})")
            else:
                logger.info(f"    User already exists: {user_data['email']}")
    
    await session.commit()
    logger.info(f"✅ Organizations: {org_count} created, Users: {user_count} created\n")
    return org_map


async def seed_sites_and_assets(session, org_map, zone_map):
    """Seed sample sites and assets"""
    logger.info("Seeding sites and assets...")
    
    sites_data = [
        {
            "org_slug": "green-energy-corp",
            "name": "Mumbai Solar Plant",
            "description": "500 MW solar installation in Mumbai",
            "address": "Plot 123, Solar Park, Panvel",
            "city": "Mumbai",
            "state": "Maharashtra",
            "country": "India",
            "timezone": "Asia/Kolkata",
            "assets": [
                {
                    "name": "Solar Farm Block A",
                    "asset_type": "solar",
                    "capacity_mw": Decimal("250.000"),
                    "status": "online",
                    "commissioning_date": datetime(2023, 1, 15),
                    "bid_zones": ["MH"]
                },
                {
                    "name": "Solar Farm Block B",
                    "asset_type": "solar",
                    "capacity_mw": Decimal("250.000"),
                    "status": "online",
                    "commissioning_date": datetime(2023, 2, 20),
                    "bid_zones": ["MH"]
                }
            ]
        },
        {
            "org_slug": "solar-power-solutions",
            "name": "Delhi Wind Farm",
            "description": "300 MW wind installation near Delhi",
            "address": "Wind Park, Sector 45",
            "city": "Gurugram",
            "state": "Haryana",
            "country": "India",
            "timezone": "Asia/Kolkata",
            "assets": [
                {
                    "name": "Wind Turbine Array 1",
                    "asset_type": "wind",
                    "capacity_mw": Decimal("150.000"),
                    "status": "online",
                    "commissioning_date": datetime(2022, 6, 10),
                    "bid_zones": ["DEL"]
                },
                {
                    "name": "Wind Turbine Array 2",
                    "asset_type": "wind",
                    "capacity_mw": Decimal("150.000"),
                    "status": "online",
                    "commissioning_date": datetime(2022, 8, 15),
                    "bid_zones": ["DEL"]
                }
            ]
        }
    ]
    
    site_count = 0
    asset_count = 0
    
    for site_data in sites_data:
        org = org_map.get(site_data["org_slug"])
        if not org:
            logger.warning(f"  Organization not found: {site_data['org_slug']}")
            continue
        
        assets_data = site_data.pop("assets")
        org_slug = site_data.pop("org_slug")
        
        result = await session.execute(
            select(Site).where(
                Site.organization_id == org.id,
                Site.name == site_data["name"]
            )
        )
        site = result.scalar_one_or_none()
        
        if not site:
            site = Site(organization_id=org.id, **site_data)
            session.add(site)
            await session.flush()
            site_count += 1
            logger.info(f"  Created site: {site_data['name']}")
        else:
            logger.info(f"  Site already exists: {site_data['name']}")
        
        # Create assets for this site
        for asset_data in assets_data:
            bid_zone_codes = asset_data.pop("bid_zones")
            
            result = await session.execute(
                select(Asset).where(
                    Asset.site_id == site.id,
                    Asset.name == asset_data["name"]
                )
            )
            asset = result.scalar_one_or_none()
            
            if not asset:
                asset = Asset(
                    organization_id=org.id,
                    site_id=site.id,
                    **asset_data
                )
                session.add(asset)
                await session.flush()
                asset_count += 1
                logger.info(f"    Created asset: {asset_data['name']}")
                
                # Map asset to bid zones
                for zone_code in bid_zone_codes:
                    zone = zone_map.get(zone_code)
                    if zone:
                        result = await session.execute(
                            select(AssetBidZone).where(
                                AssetBidZone.asset_id == asset.id,
                                AssetBidZone.bid_zone_id == zone.id
                            )
                        )
                        existing_mapping = result.scalar_one_or_none()
                        
                        if not existing_mapping:
                            mapping = AssetBidZone(
                                asset_id=asset.id,
                                bid_zone_id=zone.id,
                                capacity_share=Decimal("1.0000")
                            )
                            session.add(mapping)
                            logger.info(f"      Mapped to bid zone: {zone_code}")
            else:
                logger.info(f"    Asset already exists: {asset_data['name']}")
    
    await session.commit()
    logger.info(f"✅ Sites: {site_count} created, Assets: {asset_count} created\n")


async def seed_market_prices(session, operator_map, zone_map):
    """Seed sample market price data for the last 7 days"""
    logger.info("Seeding market price data...")
    
    # Check if we already have recent market data
    result = await session.execute(
        text("""
            SELECT COUNT(*) FROM market_prices 
            WHERE time > NOW() - INTERVAL '7 days'
        """)
    )
    existing_count = result.scalar()
    
    if existing_count > 100:
        logger.info(f"  Market price data already exists ({existing_count} records)")
        logger.info("✅ Market prices: skipped (data exists)\n")
        return
    
    # Generate sample data for Maharashtra zone
    mh_zone = zone_map.get("MH")
    if not mh_zone:
        logger.warning("  Maharashtra zone not found, skipping market data")
        return
    
    operator = operator_map.get("SLDC-Maharashtra")
    if not operator:
        logger.warning("  Maharashtra operator not found, skipping market data")
        return
    
    # Generate hourly data for last 7 days
    start_time = datetime.now() - timedelta(days=7)
    current_time = start_time
    end_time = datetime.now()
    
    records_created = 0
    batch_size = 100
    batch = []
    
    while current_time <= end_time:
        # Generate realistic price (base ~4000 INR/MWh with variations)
        hour = current_time.hour
        base_price = 4000
        
        # Peak hours (5-10 PM) have higher prices
        if 17 <= hour <= 22:
            price_adjustment = 1000
        # Day time (9 AM - 5 PM)
        elif 9 <= hour <= 17:
            price_adjustment = 500
        # Night time (11 PM - 6 AM)
        elif hour >= 23 or hour <= 6:
            price_adjustment = -800
        else:
            price_adjustment = 200
        
        # Add random variation
        price = base_price + price_adjustment + random.uniform(-200, 200)
        volume = 1000 + random.uniform(0, 500)
        
        batch.append({
            "time": current_time,
            "market_operator_id": str(operator.id),
            "bid_zone_id": str(mh_zone.id),
            "market_type": "day_ahead",
            "price_rupees": round(price, 2),
            "volume_mwh": round(volume, 2),
            "currency": "INR"
        })
        
        if len(batch) >= batch_size:
            try:
                await session.execute(
                    text("""
                        INSERT INTO market_prices 
                        (time, market_operator_id, bid_zone_id, market_type, price_rupees, volume_mwh, currency)
                        VALUES 
                        (:time, :market_operator_id, :bid_zone_id, :market_type, :price_rupees, :volume_mwh, :currency)
                        ON CONFLICT (time, market_operator_id, bid_zone_id, market_type) DO NOTHING
                    """),
                    batch
                )
                records_created += len(batch)
                batch = []
            except Exception as e:
                logger.warning(f"  Error inserting market prices: {e}")
        
        current_time += timedelta(hours=1)
    
    # Insert remaining records
    if batch:
        try:
            await session.execute(
                text("""
                    INSERT INTO market_prices 
                    (time, market_operator_id, bid_zone_id, market_type, price_rupees, volume_mwh, currency)
                    VALUES 
                    (:time, :market_operator_id, :bid_zone_id, :market_type, :price_rupees, :volume_mwh, :currency)
                    ON CONFLICT (time, market_operator_id, bid_zone_id, market_type) DO NOTHING
                """),
                batch
            )
            records_created += len(batch)
        except Exception as e:
            logger.warning(f"  Error inserting market prices: {e}")
    
    await session.commit()
    logger.info(f"✅ Market prices: {records_created} records created\n")


async def main():
    """Main seed function"""
    logger.info("="*60)
    logger.info("OptiBid Energy Platform - Database Seeding")
    logger.info("="*60)
    logger.info("")
    
    try:
        # Initialize database
        logger.info("Initializing database connection...")
        await init_db()
        logger.info("✅ Database connection established\n")
        
        async with AsyncSessionLocal() as session:
            # Seed data in order
            await seed_subscription_plans(session)
            operator_map = await seed_market_operators(session)
            zone_map = await seed_bid_zones(session, operator_map)
            org_map = await seed_organizations_and_users(session)
            await seed_sites_and_assets(session, org_map, zone_map)
            await seed_market_prices(session, operator_map, zone_map)
        
        logger.info("="*60)
        logger.info("🎉 DATABASE SEEDING COMPLETE")
        logger.info("="*60)
        logger.info("")
        logger.info("Test Credentials:")
        logger.info("-" * 60)
        logger.info("Admin:   admin@optibid.com / admin123")
        logger.info("Trader:  trader@optibid.com / trader123")
        logger.info("Analyst: analyst@optibid.com / analyst123")
        logger.info("Viewer:  viewer@optibid.com / viewer123")
        logger.info("")
        logger.info("Access the platform:")
        logger.info("  Frontend: http://localhost:3000")
        logger.info("  API Docs: http://localhost:8000/api/docs")
        logger.info("="*60)
        
    except Exception as e:
        logger.error(f"❌ Seeding failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
