"""
OptiBid Energy Platform - Database Connection
Database configuration and connection management
"""

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import asyncpg
import logging
from typing import Generator, AsyncGenerator

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# PostgreSQL Database URL
DATABASE_URL = settings.DATABASE_URL

# Async Database URL for async operations
ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# SQLAlchemy setup
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=settings.DEBUG,
    poolclass=StaticPool,
    connect_args={
        "connect_timeout": 10,
        "application_name": "optibid_api"
    }
)

# Async engine for async operations
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={
        "server_settings": {
            "jit": "off",
            "application_name": "optibid_api_async"
        }
    }
)

# Session makers
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for ORM models
Base = declarative_base()

# Metadata for table reflection
metadata = MetaData()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"Database session error: {e}")
            await session.rollback()
            raise
        finally:
            await session.close()

def get_db_sync() -> Generator[Session, None, None]:
    """Dependency to get synchronous database session"""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

async def init_db():
    """Initialize database tables and run migrations"""
    try:
        # Test database connection
        from sqlalchemy import text
        async with async_engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            logger.info("Database connection established")
        
        # Import all models to ensure they're registered
        from app import models
        
        # Create all tables
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created/verified")
        
        # Initialize extensions (PostGIS, TimescaleDB)
        await init_extensions()
        
        # Run automatic migrations if enabled (development only)
        if settings.ENVIRONMENT == "development":
            try:
                from app.utils.migration_runner import migration_runner
                async with AsyncSessionLocal() as session:
                    await migration_runner.run_migrations_on_startup(session)
            except Exception as e:
                logger.warning(f"Automatic migration check failed: {e}")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

async def init_extensions():
    """Initialize PostgreSQL extensions"""
    try:
        async with async_engine.begin() as conn:
            # Enable required extensions
            extensions = [
                'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
                'CREATE EXTENSION IF NOT EXISTS "postgis"',
                'CREATE EXTENSION IF NOT EXISTS "timescaledb"',
                'CREATE EXTENSION IF NOT EXISTS "pg_cron"',
                'CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"'
            ]
            
            for extension_sql in extensions:
                try:
                    await conn.execute(extension_sql)
                    logger.info(f"Extension enabled: {extension_sql.split()[-2]}")
                except Exception as e:
                    logger.warning(f"Extension {extension_sql} may already exist: {e}")
    
    except Exception as e:
        logger.error(f"Failed to initialize extensions: {e}")

async def close_db():
    """Close database connections"""
    await async_engine.dispose()
    engine.dispose()
    logger.info("Database connections closed")

# Context managers for database operations
class DatabaseManager:
    """Context manager for database operations"""
    
    def __init__(self):
        self.session: AsyncSession = None
    
    async def __aenter__(self) -> AsyncSession:
        self.session = AsyncSessionLocal()
        return self.session
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            if exc_type:
                await self.session.rollback()
            else:
                await self.session.commit()
            await self.session.close()

# Transaction helpers
async def with_transaction(func):
    """Decorator for automatic transaction management"""
    async def wrapper(*args, **kwargs):
        async with DatabaseManager() as session:
            try:
                result = await func(session, *args, **kwargs)
                await session.commit()
                return result
            except Exception as e:
                await session.rollback()
                raise e
    return wrapper

# Health check
async def check_db_health() -> dict:
    """Check database connectivity and health"""
    try:
        async with async_engine.begin() as conn:
            # Test basic connectivity
            result = await conn.execute("SELECT 1 as health_check")
            row = result.fetchone()
            
            # Check extensions
            extensions_result = await conn.execute("""
                SELECT extname FROM pg_extension WHERE extname IN (
                    'uuid-ossp', 'postgis', 'timescaledb'
                )
            """)
            extensions = [row[0] for row in extensions_result.fetchall()]
            
            return {
                "status": "healthy",
                "database": "connected",
                "version": "PostgreSQL",
                "extensions": extensions,
                "timestamp": "2025-11-17T23:31:24Z"
            }
    
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": "2025-11-17T23:31:24Z"
        }

# Connection testing utility
def test_db_connection():
    """Test database connection (synchronous)"""
    try:
        with engine.connect() as conn:
            result = conn.execute("SELECT version()")
            version = result.fetchone()[0]
            logger.info(f"Database connection successful: {version}")
            return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False

if __name__ == "__main__":
    # Test database connection on startup
    if test_db_connection():
        logger.info("Database is ready")
    else:
        logger.error("Database connection failed")
