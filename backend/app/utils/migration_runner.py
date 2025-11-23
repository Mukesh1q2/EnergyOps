"""
Database Migration Runner
Automatically runs pending database migrations
"""

import os
import time
import logging
from typing import Dict, List, Any, Optional
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.utils.migration_tracker import migration_tracker

logger = logging.getLogger(__name__)


class MigrationRunner:
    """Runs database migrations"""
    
    def __init__(self):
        self.migrations_dir = "database/migrations"
        self.dry_run = False
    
    async def run_migration_file(
        self,
        session: AsyncSession,
        migration_path: str,
        version: str,
        name: str
    ) -> Dict[str, Any]:
        """
        Run a single migration file
        
        Args:
            session: Database session
            migration_path: Path to migration SQL file
            version: Migration version
            name: Migration name
            
        Returns:
            Migration execution result
        """
        start_time = time.time()
        
        try:
            # Read migration file
            with open(migration_path, 'r') as f:
                migration_sql = f.read()
            
            if self.dry_run:
                logger.info(f"[DRY RUN] Would execute migration: {name}")
                return {
                    "version": version,
                    "name": name,
                    "success": True,
                    "dry_run": True,
                    "execution_time_ms": 0
                }
            
            # Execute migration
            logger.info(f"Executing migration: {name}")
            
            # Split by semicolons and execute each statement
            statements = [s.strip() for s in migration_sql.split(';') if s.strip()]
            
            for statement in statements:
                if statement:
                    await session.execute(text(statement))
            
            await session.commit()
            
            execution_time_ms = int((time.time() - start_time) * 1000)
            
            # Record migration
            await migration_tracker.record_migration(
                session=session,
                version=version,
                name=name,
                execution_time_ms=execution_time_ms,
                success=True
            )
            
            logger.info(f"✓ Migration {name} completed in {execution_time_ms}ms")
            
            return {
                "version": version,
                "name": name,
                "success": True,
                "execution_time_ms": execution_time_ms
            }
            
        except Exception as e:
            await session.rollback()
            
            execution_time_ms = int((time.time() - start_time) * 1000)
            error_message = str(e)
            
            logger.error(f"✗ Migration {name} failed: {error_message}")
            
            # Record failed migration
            try:
                await migration_tracker.record_migration(
                    session=session,
                    version=version,
                    name=name,
                    execution_time_ms=execution_time_ms,
                    success=False,
                    error_message=error_message
                )
            except Exception as record_error:
                logger.error(f"Failed to record migration failure: {record_error}")
            
            return {
                "version": version,
                "name": name,
                "success": False,
                "execution_time_ms": execution_time_ms,
                "error": error_message
            }
    
    async def run_pending_migrations(
        self,
        session: AsyncSession,
        dry_run: bool = False
    ) -> Dict[str, Any]:
        """
        Run all pending migrations
        
        Args:
            session: Database session
            dry_run: If True, don't actually execute migrations
            
        Returns:
            Migration execution summary
        """
        self.dry_run = dry_run
        
        try:
            # Ensure migration tracking table exists
            await migration_tracker.ensure_migration_table(session)
            
            # Get migration status
            status = await migration_tracker.get_migration_status(session)
            
            if status.get("all_applied"):
                logger.info("All migrations are already applied")
                return {
                    "status": "up_to_date",
                    "message": "All migrations are already applied",
                    "migrations_run": [],
                    "total_run": 0
                }
            
            pending = status.get("pending_migrations", [])
            
            if not pending:
                logger.info("No pending migrations found")
                return {
                    "status": "up_to_date",
                    "message": "No pending migrations found",
                    "migrations_run": [],
                    "total_run": 0
                }
            
            logger.info(f"Found {len(pending)} pending migration(s)")
            
            # Get available migrations with full paths
            available = migration_tracker.get_available_migrations()
            available_map = {m["version"]: m for m in available}
            
            # Run each pending migration
            results = []
            for migration in pending:
                version = migration["version"]
                
                if version not in available_map:
                    logger.error(f"Migration file not found for version: {version}")
                    results.append({
                        "version": version,
                        "name": migration["name"],
                        "success": False,
                        "error": "Migration file not found"
                    })
                    continue
                
                migration_info = available_map[version]
                result = await self.run_migration_file(
                    session=session,
                    migration_path=migration_info["path"],
                    version=version,
                    name=migration_info["name"]
                )
                results.append(result)
                
                # Stop on first failure
                if not result["success"]:
                    logger.error(f"Migration failed, stopping execution")
                    break
            
            # Count successes and failures
            successful = [r for r in results if r["success"]]
            failed = [r for r in results if not r["success"]]
            
            return {
                "status": "completed" if not failed else "failed",
                "message": f"Ran {len(successful)} migration(s) successfully" + 
                          (f", {len(failed)} failed" if failed else ""),
                "migrations_run": results,
                "total_run": len(results),
                "successful": len(successful),
                "failed": len(failed),
                "dry_run": dry_run
            }
            
        except Exception as e:
            logger.error(f"Failed to run migrations: {e}")
            return {
                "status": "error",
                "message": "Failed to run migrations",
                "error": str(e)
            }
    
    async def run_migrations_on_startup(self, session: AsyncSession) -> bool:
        """
        Run migrations automatically on startup (development only)
        
        Args:
            session: Database session
            
        Returns:
            True if migrations ran successfully or were not needed
        """
        # Only run in development mode
        if settings.ENVIRONMENT != "development":
            logger.info("Automatic migrations disabled in non-development environment")
            return True
        
        # Check if auto-migration is enabled
        auto_migrate = os.getenv("AUTO_MIGRATE", "false").lower() == "true"
        
        if not auto_migrate:
            logger.info("Automatic migrations disabled (set AUTO_MIGRATE=true to enable)")
            return True
        
        logger.info("Running automatic migrations on startup...")
        
        try:
            result = await self.run_pending_migrations(session, dry_run=False)
            
            if result["status"] in ["up_to_date", "completed"]:
                logger.info(f"✓ Migrations complete: {result['message']}")
                return True
            else:
                logger.error(f"✗ Migrations failed: {result.get('message', 'Unknown error')}")
                return False
                
        except Exception as e:
            logger.error(f"✗ Failed to run automatic migrations: {e}")
            return False


# Global migration runner instance
migration_runner = MigrationRunner()
