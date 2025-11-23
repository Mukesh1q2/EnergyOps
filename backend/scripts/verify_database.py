"""
Database Verification Script
Verifies database schema, tables, constraints, indexes, and extensions
"""

import asyncio
import sys
from typing import Dict, List, Any
from sqlalchemy import text, inspect
from sqlalchemy.ext.asyncio import create_async_engine
import logging

# Add parent directory to path
sys.path.insert(0, '..')

from app.core.config import get_settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

# Expected tables in the database
EXPECTED_TABLES = [
    'organizations', 'users', 'user_sessions', 'market_operators', 'sites',
    'assets', 'bid_zones', 'asset_bid_zones', 'bids', 'market_prices',
    'market_clearing', 'asset_meters', 'datasets', 'data_ingestions',
    'ml_models', 'model_predictions', 'feature_store', 'dashboards',
    'dashboard_widgets', 'widget_data_cache', 'audit_logs', 'legal_audit_trail',
    'compliance_rules', 'compliance_violations', 'subscription_plans', 'usage_metrics'
]

# Expected extensions
EXPECTED_EXTENSIONS = [
    'uuid-ossp', 'postgis', 'timescaledb', 'pg_stat_statements', 'hstore'
]

# Expected hypertables (TimescaleDB)
EXPECTED_HYPERTABLES = [
    'market_prices', 'market_clearing', 'asset_meters', 
    'model_predictions', 'feature_store', 'widget_data_cache',
    'audit_logs', 'usage_metrics'
]


async def verify_extensions(conn) -> Dict[str, Any]:
    """Verify PostgreSQL extensions are installed"""
    logger.info("Verifying database extensions...")
    
    result = await conn.execute(text("""
        SELECT extname, extversion 
        FROM pg_extension 
        WHERE extname IN :extensions
    """), {"extensions": tuple(EXPECTED_EXTENSIONS)})
    
    installed_extensions = {row[0]: row[1] for row in result.fetchall()}
    
    verification = {
        "status": "pass",
        "installed": installed_extensions,
        "missing": [],
        "details": []
    }
    
    for ext in EXPECTED_EXTENSIONS:
        if ext in installed_extensions:
            verification["details"].append({
                "extension": ext,
                "status": "installed",
                "version": installed_extensions[ext]
            })
            logger.info(f"✓ Extension '{ext}' installed (version: {installed_extensions[ext]})")
        else:
            verification["missing"].append(ext)
            verification["status"] = "fail"
            verification["details"].append({
                "extension": ext,
                "status": "missing"
            })
            logger.error(f"✗ Extension '{ext}' NOT installed")
    
    return verification


async def verify_tables(conn) -> Dict[str, Any]:
    """Verify all expected tables exist"""
    logger.info("Verifying database tables...")
    
    result = await conn.execute(text("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    """))
    
    existing_tables = {row[0] for row in result.fetchall()}
    
    verification = {
        "status": "pass",
        "total_expected": len(EXPECTED_TABLES),
        "total_found": len(existing_tables),
        "existing": list(existing_tables),
        "missing": [],
        "extra": []
    }
    
    # Check for missing tables
    for table in EXPECTED_TABLES:
        if table not in existing_tables:
            verification["missing"].append(table)
            verification["status"] = "fail"
            logger.error(f"✗ Table '{table}' NOT found")
        else:
            logger.info(f"✓ Table '{table}' exists")
    
    # Check for extra tables (not in expected list)
    for table in existing_tables:
        if table not in EXPECTED_TABLES:
            verification["extra"].append(table)
    
    return verification


async def verify_table_structure(conn, table_name: str) -> Dict[str, Any]:
    """Verify structure of a specific table"""
    
    # Get columns
    columns_result = await conn.execute(text("""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = :table_name
        ORDER BY ordinal_position
    """), {"table_name": table_name})
    
    columns = [
        {
            "name": row[0],
            "type": row[1],
            "nullable": row[2] == 'YES',
            "default": row[3]
        }
        for row in columns_result.fetchall()
    ]
    
    # Get constraints
    constraints_result = await conn.execute(text("""
        SELECT 
            tc.constraint_name,
            tc.constraint_type,
            kcu.column_name
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        WHERE tc.table_schema = 'public' AND tc.table_name = :table_name
    """), {"table_name": table_name})
    
    constraints = [
        {
            "name": row[0],
            "type": row[1],
            "column": row[2]
        }
        for row in constraints_result.fetchall()
    ]
    
    return {
        "table": table_name,
        "columns": columns,
        "constraints": constraints,
        "column_count": len(columns),
        "constraint_count": len(constraints)
    }


async def verify_indexes(conn) -> Dict[str, Any]:
    """Verify indexes are created"""
    logger.info("Verifying database indexes...")
    
    result = await conn.execute(text("""
        SELECT 
            schemaname,
            tablename,
            indexname,
            indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname
    """))
    
    indexes = [
        {
            "table": row[1],
            "index": row[2],
            "definition": row[3]
        }
        for row in result.fetchall()
    ]
    
    verification = {
        "status": "pass",
        "total_indexes": len(indexes),
        "indexes": indexes,
        "by_table": {}
    }
    
    # Group by table
    for idx in indexes:
        table = idx["table"]
        if table not in verification["by_table"]:
            verification["by_table"][table] = []
        verification["by_table"][table].append(idx["index"])
    
    logger.info(f"✓ Found {len(indexes)} indexes across all tables")
    
    return verification


async def verify_foreign_keys(conn) -> Dict[str, Any]:
    """Verify foreign key constraints"""
    logger.info("Verifying foreign key constraints...")
    
    result = await conn.execute(text("""
        SELECT
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            tc.constraint_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
        ORDER BY tc.table_name, kcu.column_name
    """))
    
    foreign_keys = [
        {
            "table": row[0],
            "column": row[1],
            "references_table": row[2],
            "references_column": row[3],
            "constraint_name": row[4]
        }
        for row in result.fetchall()
    ]
    
    verification = {
        "status": "pass",
        "total_foreign_keys": len(foreign_keys),
        "foreign_keys": foreign_keys
    }
    
    logger.info(f"✓ Found {len(foreign_keys)} foreign key constraints")
    
    return verification


async def verify_hypertables(conn) -> Dict[str, Any]:
    """Verify TimescaleDB hypertables"""
    logger.info("Verifying TimescaleDB hypertables...")
    
    try:
        result = await conn.execute(text("""
            SELECT hypertable_name, num_dimensions
            FROM timescaledb_information.hypertables
            WHERE hypertable_schema = 'public'
        """))
        
        hypertables = {row[0]: row[1] for row in result.fetchall()}
        
        verification = {
            "status": "pass",
            "hypertables": hypertables,
            "missing": [],
            "details": []
        }
        
        for table in EXPECTED_HYPERTABLES:
            if table in hypertables:
                verification["details"].append({
                    "table": table,
                    "status": "hypertable",
                    "dimensions": hypertables[table]
                })
                logger.info(f"✓ Table '{table}' is a hypertable")
            else:
                verification["missing"].append(table)
                verification["status"] = "partial"
                verification["details"].append({
                    "table": table,
                    "status": "not_hypertable"
                })
                logger.warning(f"⚠ Table '{table}' is NOT a hypertable")
        
        return verification
        
    except Exception as e:
        logger.warning(f"⚠ Could not verify hypertables: {e}")
        return {
            "status": "skipped",
            "error": str(e),
            "message": "TimescaleDB extension may not be available"
        }


async def verify_enums(conn) -> Dict[str, Any]:
    """Verify custom enum types"""
    logger.info("Verifying custom enum types...")
    
    result = await conn.execute(text("""
        SELECT t.typname, e.enumlabel
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
        ORDER BY t.typname, e.enumsortorder
    """))
    
    enums = {}
    for row in result.fetchall():
        type_name = row[0]
        enum_value = row[1]
        if type_name not in enums:
            enums[type_name] = []
        enums[type_name].append(enum_value)
    
    verification = {
        "status": "pass",
        "total_enums": len(enums),
        "enums": enums
    }
    
    logger.info(f"✓ Found {len(enums)} custom enum types")
    
    return verification


async def run_verification():
    """Run complete database verification"""
    logger.info("=" * 60)
    logger.info("DATABASE VERIFICATION SCRIPT")
    logger.info("=" * 60)
    
    # Create async engine
    database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(database_url, echo=False)
    
    results = {
        "overall_status": "pass",
        "timestamp": "2025-11-17T23:31:24Z",
        "database_url": settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else "unknown",
        "verifications": {}
    }
    
    try:
        async with engine.begin() as conn:
            # Test connection
            await conn.execute(text("SELECT 1"))
            logger.info("✓ Database connection successful\n")
            
            # Run verifications
            results["verifications"]["extensions"] = await verify_extensions(conn)
            print()
            
            results["verifications"]["tables"] = await verify_tables(conn)
            print()
            
            results["verifications"]["indexes"] = await verify_indexes(conn)
            print()
            
            results["verifications"]["foreign_keys"] = await verify_foreign_keys(conn)
            print()
            
            results["verifications"]["hypertables"] = await verify_hypertables(conn)
            print()
            
            results["verifications"]["enums"] = await verify_enums(conn)
            print()
            
            # Detailed table structure for critical tables
            logger.info("Verifying detailed structure of critical tables...")
            critical_tables = ['users', 'organizations', 'bids', 'assets']
            results["verifications"]["table_structures"] = {}
            
            for table in critical_tables:
                if table in results["verifications"]["tables"]["existing"]:
                    structure = await verify_table_structure(conn, table)
                    results["verifications"]["table_structures"][table] = structure
                    logger.info(f"✓ Table '{table}': {structure['column_count']} columns, {structure['constraint_count']} constraints")
            
            # Determine overall status
            for key, verification in results["verifications"].items():
                if isinstance(verification, dict) and verification.get("status") == "fail":
                    results["overall_status"] = "fail"
                    break
                elif isinstance(verification, dict) and verification.get("status") == "partial":
                    if results["overall_status"] != "fail":
                        results["overall_status"] = "partial"
            
    except Exception as e:
        logger.error(f"✗ Database verification failed: {e}")
        results["overall_status"] = "error"
        results["error"] = str(e)
        return results
    
    finally:
        await engine.dispose()
    
    # Print summary
    logger.info("\n" + "=" * 60)
    logger.info("VERIFICATION SUMMARY")
    logger.info("=" * 60)
    logger.info(f"Overall Status: {results['overall_status'].upper()}")
    
    if results["verifications"].get("extensions"):
        ext_status = results["verifications"]["extensions"]["status"]
        logger.info(f"Extensions: {ext_status.upper()}")
        if results["verifications"]["extensions"]["missing"]:
            missing_exts = results["verifications"]["extensions"]["missing"]
            logger.info(f"  Missing: {', '.join(missing_exts)}")
    
    if results["verifications"].get("tables"):
        tbl_status = results["verifications"]["tables"]["status"]
        logger.info(f"Tables: {tbl_status.upper()}")
        total_found = results['verifications']['tables']['total_found']
        total_expected = results['verifications']['tables']['total_expected']
        logger.info(f"  Found: {total_found}/{total_expected}")
        if results["verifications"]["tables"]["missing"]:
            missing_tables = results['verifications']['tables']['missing']
            logger.info(f"  Missing: {', '.join(missing_tables)}")
    
    if results["verifications"].get("indexes"):
        total_indexes = results['verifications']['indexes']['total_indexes']
        logger.info(f"Indexes: {total_indexes} total")
    
    if results["verifications"].get("foreign_keys"):
        total_fks = results['verifications']['foreign_keys']['total_foreign_keys']
        logger.info(f"Foreign Keys: {total_fks} total")
    
    if results["verifications"].get("hypertables"):
        ht_status = results["verifications"]["hypertables"]["status"]
        logger.info(f"Hypertables: {ht_status.upper()}")
    
    logger.info("=" * 60)
    
    return results


if __name__ == "__main__":
    results = asyncio.run(run_verification())
    
    # Exit with appropriate code
    if results["overall_status"] == "pass":
        sys.exit(0)
    elif results["overall_status"] == "partial":
        sys.exit(1)
    else:
        sys.exit(2)
