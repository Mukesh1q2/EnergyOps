"""
Database Migration Tracker
Tracks applied migrations and provides migration status information
"""

import os
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


class MigrationTracker:
    """Tracks database migrations and their status"""
    
    def __init__(self):
        self.migrations_dir = "database/migrations"
        self._migration_cache = None
        self._cache_timestamp = None
    
    async def ensure_migration_table(self, session: AsyncSession) -> None:
        """
        Ensure the schema_migrations table exists
        
        Args:
            session: Database session
        """
        try:
            await session.execute(text("""
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    id SERIAL PRIMARY KEY,
                    version VARCHAR(255) UNIQUE NOT NULL,
                    name VARCHAR(500) NOT NULL,
                    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    execution_time_ms INTEGER,
                    checksum VARCHAR(64),
                    success BOOLEAN DEFAULT TRUE,
                    error_message TEXT
                )
            """))
            await session.commit()
            logger.info("Migration tracking table ensured")
        except Exception as e:
            logger.error(f"Failed to create migration tracking table: {e}")
            await session.rollback()
            raise
    
    def get_available_migrations(self) -> List[Dict[str, str]]:
        """
        Get list of available migration files
        
        Returns:
            List of migration file information
        """
        migrations = []
        
        if not os.path.exists(self.migrations_dir):
            logger.warning(f"Migrations directory not found: {self.migrations_dir}")
            return migrations
        
        for filename in sorted(os.listdir(self.migrations_dir)):
            if filename.endswith('.sql'):
                # Extract version from filename (e.g., "001_initial_schema.sql" -> "001")
                version = filename.split('_')[0]
                name = filename.replace('.sql', '')
                
                migrations.append({
                    "version": version,
                    "name": name,
                    "filename": filename,
                    "path": os.path.join(self.migrations_dir, filename)
                })
        
        return migrations
    
    async def get_applied_migrations(self, session: AsyncSession) -> List[Dict[str, Any]]:
        """
        Get list of applied migrations from database
        
        Args:
            session: Database session
            
        Returns:
            List of applied migration information
        """
        try:
            # Ensure migration table exists
            await self.ensure_migration_table(session)
            
            result = await session.execute(text("""
                SELECT 
                    version,
                    name,
                    applied_at,
                    execution_time_ms,
                    success,
                    error_message
                FROM schema_migrations
                ORDER BY version
            """))
            
            migrations = []
            for row in result.fetchall():
                migrations.append({
                    "version": row[0],
                    "name": row[1],
                    "applied_at": row[2].isoformat() if row[2] else None,
                    "execution_time_ms": row[3],
                    "success": row[4],
                    "error_message": row[5]
                })
            
            return migrations
            
        except Exception as e:
            logger.error(f"Failed to get applied migrations: {e}")
            return []
    
    async def record_migration(
        self,
        session: AsyncSession,
        version: str,
        name: str,
        execution_time_ms: int,
        success: bool = True,
        error_message: Optional[str] = None
    ) -> None:
        """
        Record a migration execution
        
        Args:
            session: Database session
            version: Migration version
            name: Migration name
            execution_time_ms: Execution time in milliseconds
            success: Whether migration succeeded
            error_message: Error message if failed
        """
        try:
            await session.execute(text("""
                INSERT INTO schema_migrations 
                (version, name, execution_time_ms, success, error_message)
                VALUES (:version, :name, :execution_time_ms, :success, :error_message)
                ON CONFLICT (version) DO UPDATE SET
                    applied_at = NOW(),
                    execution_time_ms = :execution_time_ms,
                    success = :success,
                    error_message = :error_message
            """), {
                "version": version,
                "name": name,
                "execution_time_ms": execution_time_ms,
                "success": success,
                "error_message": error_message
            })
            await session.commit()
            logger.info(f"Recorded migration: {version} - {name}")
        except Exception as e:
            logger.error(f"Failed to record migration: {e}")
            await session.rollback()
            raise
    
    async def get_migration_status(self, session: AsyncSession) -> Dict[str, Any]:
        """
        Get comprehensive migration status
        
        Args:
            session: Database session
            
        Returns:
            Migration status information
        """
        try:
            available = self.get_available_migrations()
            applied = await self.get_applied_migrations(session)
            
            applied_versions = {m["version"] for m in applied}
            available_versions = {m["version"] for m in available}
            
            pending = [m for m in available if m["version"] not in applied_versions]
            
            # Get latest applied migration
            latest_applied = applied[-1] if applied else None
            
            # Check if all migrations are applied
            all_applied = len(pending) == 0
            
            # Get failed migrations
            failed = [m for m in applied if not m.get("success", True)]
            
            status = {
                "current_version": latest_applied["version"] if latest_applied else None,
                "latest_migration": latest_applied["name"] if latest_applied else None,
                "total_available": len(available),
                "total_applied": len(applied),
                "pending_count": len(pending),
                "failed_count": len(failed),
                "all_applied": all_applied,
                "status": "up_to_date" if all_applied and len(failed) == 0 else "pending" if len(pending) > 0 else "failed",
                "applied_migrations": applied,
                "pending_migrations": [{"version": m["version"], "name": m["name"]} for m in pending],
                "failed_migrations": [{"version": m["version"], "name": m["name"], "error": m.get("error_message")} for m in failed],
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            
            return status
            
        except Exception as e:
            logger.error(f"Failed to get migration status: {e}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
    
    async def get_migration_history(self, session: AsyncSession, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get recent migration history
        
        Args:
            session: Database session
            limit: Maximum number of migrations to return
            
        Returns:
            List of recent migrations
        """
        try:
            result = await session.execute(text("""
                SELECT 
                    version,
                    name,
                    applied_at,
                    execution_time_ms,
                    success
                FROM schema_migrations
                ORDER BY applied_at DESC
                LIMIT :limit
            """), {"limit": limit})
            
            history = []
            for row in result.fetchall():
                history.append({
                    "version": row[0],
                    "name": row[1],
                    "applied_at": row[2].isoformat() if row[2] else None,
                    "execution_time_ms": row[3],
                    "success": row[4]
                })
            
            return history
            
        except Exception as e:
            logger.error(f"Failed to get migration history: {e}")
            return []


# Global migration tracker instance
migration_tracker = MigrationTracker()
