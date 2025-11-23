"""Simple database connectivity test"""
import asyncio
import asyncpg
from app.core.config import get_settings

settings = get_settings()

async def test_connection():
    """Test database connection"""
    try:
        # Parse DATABASE_URL
        db_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
        
        print(f"Testing connection to: {db_url.split('@')[1]}")
        
        # Connect to database
        conn = await asyncpg.connect(db_url)
        
        # Test query
        version = await conn.fetchval('SELECT version()')
        print(f"✅ Database connected successfully!")
        print(f"PostgreSQL version: {version[:50]}...")
        
        # Test tables
        tables = await conn.fetch("""
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename
        """)
        
        print(f"\n📊 Found {len(tables)} tables:")
        for table in tables[:10]:
            print(f"  - {table['tablename']}")
        
        if len(tables) > 10:
            print(f"  ... and {len(tables) - 10} more")
        
        await conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(test_connection())
