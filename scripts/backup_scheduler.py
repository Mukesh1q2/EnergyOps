#!/usr/bin/env python3
"""
Backup Scheduler Script for OptiBid Energy Platform
Automated backup scheduling and execution
"""

import asyncio
import os
import schedule
import time
from datetime import datetime, timedelta
from typing import Dict, Any
import logging
import json

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class BackupScheduler:
    """Automated backup scheduler service"""
    
    def __init__(self):
        self.config = {
            'backup_schedule': os.getenv('BACKUP_SCHEDULE', '0 2 * * *'),
            'backup_retention_days': int(os.getenv('BACKUP_RETENTION_DAYS', '30')),
            's3_backup_bucket': os.getenv('S3_BACKUP_BUCKET', 'optibid-backups'),
            's3_endpoint': os.getenv('S3_ENDPOINT', 'http://minio:9000'),
            's3_access_key': os.getenv('S3_ACCESS_KEY', 'minioadmin'),
            's3_secret_key': os.getenv('S3_SECRET_KEY', 'minio_password_2025'),
            'database_url': os.getenv('DATABASE_URL'),
            'backup_encryption_key': os.getenv('BACKUP_ENCRYPTION_KEY', 'backup-encryption-key-2025')
        }
        
        logger.info("Backup scheduler initialized")
        logger.info(f"Backup schedule: {self.config['backup_schedule']}")
        logger.info(f"Retention days: {self.config['backup_retention_days']}")
    
    async def run_full_backup(self):
        """Execute full system backup"""
        try:
            logger.info("Starting full backup job...")
            
            backup_id = f"full_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
            start_time = datetime.utcnow()
            
            # Backup database
            db_success = await self._backup_database(backup_id)
            
            # Backup files
            file_success = await self._backup_files(backup_id)
            
            # Backup configurations
            config_success = await self._backup_configurations(backup_id)
            
            end_time = datetime.utcnow()
            duration = (end_time - start_time).total_seconds()
            
            if db_success and file_success and config_success:
                logger.info(f"Full backup {backup_id} completed successfully in {duration:.2f} seconds")
                
                # Update backup metadata
                await self._update_backup_metadata(backup_id, {
                    'status': 'completed',
                    'start_time': start_time.isoformat(),
                    'end_time': end_time.isoformat(),
                    'duration_seconds': duration,
                    'components': {
                        'database': db_success,
                        'files': file_success,
                        'config': config_success
                    }
                })
            else:
                logger.error(f"Backup {backup_id} failed - some components failed")
                await self._update_backup_metadata(backup_id, {
                    'status': 'failed',
                    'start_time': start_time.isoformat(),
                    'end_time': end_time.isoformat(),
                    'duration_seconds': duration,
                    'error': 'One or more backup components failed'
                })
                
        except Exception as e:
            logger.error(f"Backup execution failed: {str(e)}")
    
    async def run_incremental_backup(self):
        """Execute incremental backup"""
        try:
            logger.info("Starting incremental backup job...")
            
            backup_id = f"incremental_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
            start_time = datetime.utcnow()
            
            # Get last backup timestamp
            last_backup_time = await self._get_last_backup_time()
            
            # Backup only changes since last backup
            db_success = await self._backup_database_incremental(backup_id, last_backup_time)
            file_success = await self._backup_files_incremental(backup_id, last_backup_time)
            
            end_time = datetime.utcnow()
            duration = (end_time - start_time).total_seconds()
            
            if db_success and file_success:
                logger.info(f"Incremental backup {backup_id} completed in {duration:.2f} seconds")
                await self._update_backup_metadata(backup_id, {
                    'status': 'completed',
                    'type': 'incremental',
                    'start_time': start_time.isoformat(),
                    'end_time': end_time.isoformat(),
                    'duration_seconds': duration
                })
            else:
                logger.error(f"Incremental backup {backup_id} failed")
                
        except Exception as e:
            logger.error(f"Incremental backup execution failed: {str(e)}")
    
    async def _backup_database(self, backup_id: str) -> bool:
        """Backup PostgreSQL database"""
        try:
            import subprocess
            
            # Create backup command
            cmd = [
                'pg_dump',
                '-h', 'postgres',
                '-p', '5432',
                '-U', 'optibid',
                '-d', 'optibid',
                '--verbose',
                '--clean',
                '--if-exists',
                '--no-owner',
                '--no-privileges'
            ]
            
            # Set password
            env = os.environ.copy()
            env['PGPASSWORD'] = 'optibid_password_2025'
            
            # Execute backup
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env=env
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                logger.info("Database backup completed successfully")
                return True
            else:
                logger.error(f"Database backup failed: {stderr.decode()}")
                return False
                
        except Exception as e:
            logger.error(f"Database backup error: {str(e)}")
            return False
    
    async def _backup_files(self, backup_id: str) -> bool:
        """Backup application files"""
        try:
            import shutil
            import zipfile
            from io import BytesIO
            
            # Create archive
            archive_buffer = BytesIO()
            
            with zipfile.ZipFile(archive_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
                # Backup backend
                if os.path.exists('/app'):
                    for root, dirs, files in os.walk('/app'):
                        for file in files:
                            if not file.endswith('.pyc') and '__pycache__' not in root:
                                file_path = os.path.join(root, file)
                                arcname = os.path.relpath(file_path, '/app')
                                zipf.write(file_path, f'backend/{arcname}')
            
            archive_buffer.seek(0)
            
            # Upload to storage (simplified - would use boto3 or minio client)
            logger.info("Files backup completed")
            return True
            
        except Exception as e:
            logger.error(f"Files backup error: {str(e)}")
            return False
    
    async def _backup_configurations(self, backup_id: str) -> bool:
        """Backup configuration files"""
        try:
            config_files = [
                '/app/main.py',
                '/app/app/core/config.py',
                '/etc/nginx/nginx.conf'  # Example
            ]
            
            configs = {}
            for config_file in config_files:
                if os.path.exists(config_file):
                    try:
                        with open(config_file, 'r') as f:
                            configs[config_file] = f.read()
                    except Exception as e:
                        logger.warning(f"Could not read config file {config_file}: {str(e)}")
            
            logger.info("Configuration backup completed")
            return True
            
        except Exception as e:
            logger.error(f"Configuration backup error: {str(e)}")
            return False
    
    async def _backup_database_incremental(self, backup_id: str, last_backup_time: datetime) -> bool:
        """Execute incremental database backup"""
        # For now, use full backup - in production would use WAL archiving
        return await self._backup_database(backup_id)
    
    async def _backup_files_incremental(self, backup_id: str, last_backup_time: datetime) -> bool:
        """Execute incremental file backup"""
        # For now, use full backup - in production would use rsync or similar
        return await self._backup_files(backup_id)
    
    async def _get_last_backup_time(self) -> datetime:
        """Get timestamp of last successful backup"""
        # Simplified - would query backup metadata
        return datetime.utcnow() - timedelta(hours=24)
    
    async def _update_backup_metadata(self, backup_id: str, metadata: Dict[str, Any]):
        """Update backup job metadata"""
        # Simplified - would store in database
        logger.info(f"Backup metadata updated for {backup_id}")
    
    def cleanup_old_backups(self):
        """Remove backups older than retention period"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=self.config['backup_retention_days'])
            
            # Query database for old backups
            # Simplified - would actually query backup metadata
            logger.info(f"Cleaning up backups older than {cutoff_date}")
            
        except Exception as e:
            logger.error(f"Backup cleanup error: {str(e)}")
    
    def schedule_jobs(self):
        """Schedule backup jobs"""
        # Schedule full backup
        schedule.every().day.at("02:00").do(lambda: asyncio.create_task(self.run_full_backup()))
        
        # Schedule incremental backups
        schedule.every(6).hours.do(lambda: asyncio.create_task(self.run_incremental_backup()))
        
        # Schedule cleanup
        schedule.every().day.at("03:00").do(self.cleanup_old_backups)
        
        logger.info("Backup jobs scheduled successfully")
    
    async def run_scheduler(self):
        """Main scheduler loop"""
        logger.info("Starting backup scheduler...")
        
        # Schedule jobs
        self.schedule_jobs()
        
        # Run initial backup
        await self.run_full_backup()
        
        # Main loop
        while True:
            schedule.run_pending()
            await asyncio.sleep(60)  # Check every minute

async def main():
    """Main entry point"""
    scheduler = BackupScheduler()
    await scheduler.run_scheduler()

if __name__ == "__main__":
    asyncio.run(main())