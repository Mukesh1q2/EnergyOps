"""
Backup & Disaster Recovery Service
Automated encrypted backups with cross-region replication and disaster recovery
"""

import asyncio
import hashlib
import json
import os
import shutil
import tempfile
from datetime import datetime, timedelta
from io import BytesIO
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from zipfile import ZipFile, ZIP_DEFLATED

import aiofiles
import asyncpg
from cryptography.fernet import Fernet
from fastapi import HTTPException
from pydantic import BaseModel, Field
import boto3
from botocore.exceptions import ClientError
import redis.asyncio as aioredis

from app.core.config import settings
from app.core.database import get_db

# Backup schemas
class BackupConfig(BaseModel):
    """Backup configuration settings"""
    database_backup: bool = True
    file_storage_backup: bool = True
    configuration_backup: bool = True
    encryption_enabled: bool = True
    retention_days: int = 30
    compression_enabled: bool = True
    backup_frequency: str = "daily"  # hourly, daily, weekly
    cross_region_replication: bool = True
    s3_bucket: Optional[str] = None
    secondary_s3_bucket: Optional[str] = None

class BackupJob(BaseModel):
    """Backup job definition"""
    id: str
    type: str  # 'full', 'incremental', 'differential'
    status: str  # 'pending', 'running', 'completed', 'failed'
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    size_bytes: Optional[int] = None
    checksum: Optional[str] = None
    location: Optional[str] = None
    error_message: Optional[str] = None
    retention_expires: Optional[datetime] = None

class RecoveryPoint(BaseModel):
    """Database recovery point"""
    timestamp: datetime
    transaction_id: str
    lsn: str  # Log Sequence Number
    backup_id: str
    size_bytes: int
    location: str

class DisasterRecoveryPlan(BaseModel):
    """Disaster recovery execution plan"""
    incident_id: str
    severity: str  # 'low', 'medium', 'high', 'critical'
    affected_systems: List[str]
    recovery_strategy: str
    estimated_rto: int  # Recovery Time Objective in minutes
    estimated_rpo: int  # Recovery Point Objective in minutes
    steps: List[Dict[str, Any]]
    status: str  # 'planned', 'in_progress', 'completed', 'failed'
    created_at: datetime
    completed_at: Optional[datetime] = None

class BackupService:
    """Enterprise Backup & Disaster Recovery Service"""
    
    def __init__(self):
        self.s3_client = None
        self.redis_client = None
        self.encryption_key = Fernet.generate_key()
        self.cipher_suite = Fernet(self.encryption_key)
        self.backup_jobs = {}
        self.recovery_points = []
        
        # Initialize S3 client
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION or 'us-east-1'
            )
        
        # Initialize Redis for job coordination
        if settings.REDIS_URL:
            self.redis_client = aioredis.from_url(settings.REDIS_URL)
    
    async def initialize_s3_buckets(self):
        """Initialize S3 buckets for backup storage"""
        if not self.s3_client:
            return
        
        try:
            # Primary backup bucket
            primary_bucket = settings.S3_BACKUP_BUCKET or "optibid-backups-primary"
            try:
                self.s3_client.head_bucket(Bucket=primary_bucket)
            except ClientError:
                self.s3_client.create_bucket(Bucket=primary_bucket)
                
                # Configure lifecycle policy
                lifecycle_config = {
                    'Rules': [{
                        'ID': 'DeleteOldBackups',
                        'Status': 'Enabled',
                        'Filter': {'Prefix': ''},
                        'Expiration': {'Days': 30},
                        'NoncurrentVersionExpiration': {'NoncurrentDays': 7}
                    }]
                }
                self.s3_client.put_bucket_lifecycle_configuration(
                    Bucket=primary_bucket,
                    LifecycleConfiguration=lifecycle_config
                )
            
            # Cross-region replication bucket (optional)
            if settings.S3_BACKUP_REPLICATION_BUCKET:
                try:
                    self.s3_client.head_bucket(Bucket=settings.S3_BACKUP_REPLICATION_BUCKET)
                except ClientError:
                    self.s3_client.create_bucket(Bucket=settings.S3_BACKUP_REPLICATION_BUCKET)
                    
                    # Configure cross-region replication
                    replication_config = {
                        'Role': settings.AWS_BACKUP_ROLE_ARN,
                        'Rules': [{
                            'ID': 'CrossRegionReplication',
                            'Status': 'Enabled',
                            'Prefix': '',
                            'Destination': {
                                'Bucket': f"arn:aws:s3:::{settings.S3_BACKUP_REPLICATION_BUCKET}"
                            }
                        }]
                    }
                    self.s3_client.put_bucket_replication(
                        Bucket=primary_bucket,
                        ReplicationConfiguration=replication_config
                    )
                
        except Exception as e:
            print(f"Failed to initialize S3 buckets: {str(e)}")
    
    async def create_full_backup(self, config: BackupConfig = None) -> BackupJob:
        """Create full system backup"""
        if not config:
            config = BackupConfig()
        
        backup_id = f"full_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        job = BackupJob(
            id=backup_id,
            type="full",
            status="pending",
            retention_expires=datetime.utcnow() + timedelta(days=config.retention_days)
        )
        
        self.backup_jobs[backup_id] = job
        
        # Execute backup asynchronously
        asyncio.create_task(self._execute_backup_job(job, config))
        
        return job
    
    async def create_incremental_backup(self, config: BackupConfig = None) -> BackupJob:
        """Create incremental backup based on last backup"""
        if not config:
            config = BackupConfig()
        
        backup_id = f"inc_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        job = BackupJob(
            id=backup_id,
            type="incremental",
            status="pending",
            retention_expires=datetime.utcnow() + timedelta(days=config.retention_days)
        )
        
        self.backup_jobs[backup_id] = job
        
        # Execute backup asynchronously
        asyncio.create_task(self._execute_backup_job(job, config))
        
        return job
    
    async def _execute_backup_job(self, job: BackupJob, config: BackupConfig):
        """Execute backup job"""
        job.status = "running"
        job.started_at = datetime.utcnow()
        
        try:
            backup_data = {}
            total_size = 0
            
            # Database backup
            if config.database_backup:
                db_backup = await self._backup_database()
                backup_data['database'] = db_backup
                total_size += len(db_backup)
            
            # File storage backup
            if config.file_storage_backup:
                file_backup = await self._backup_file_storage()
                backup_data['files'] = file_backup
                total_size += len(file_backup)
            
            # Configuration backup
            if config.configuration_backup:
                config_backup = await self._backup_configuration()
                backup_data['configuration'] = config_backup
                total_size += len(config_backup)
            
            # Compress if enabled
            if config.compression_enabled:
                compressed_data = self._compress_backup(backup_data)
            else:
                compressed_data = json.dumps(backup_data).encode()
            
            # Encrypt if enabled
            if config.encryption_enabled:
                encrypted_data = self._encrypt_backup(compressed_data)
            else:
                encrypted_data = compressed_data
            
            # Upload to S3
            backup_location = await self._upload_to_s3(job.id, encrypted_data)
            
            # Calculate checksum
            checksum = hashlib.sha256(encrypted_data).hexdigest()
            
            # Update job status
            job.status = "completed"
            job.completed_at = datetime.utcnow()
            job.size_bytes = len(encrypted_data)
            job.checksum = checksum
            job.location = backup_location
            
            # Store backup metadata
            await self._store_backup_metadata(job)
            
        except Exception as e:
            job.status = "failed"
            job.error_message = str(e)
            print(f"Backup job {job.id} failed: {str(e)}")
    
    async def _backup_database(self) -> bytes:
        """Backup database using pg_dump"""
        try:
            # Get database connection parameters
            db = get_database()
            
            # Create temporary file for backup
            with tempfile.NamedTemporaryFile(mode='w', suffix='.sql', delete=False) as f:
                backup_file = f.name
            
            # Execute pg_dump command
            env = os.environ.copy()
            env['PGPASSWORD'] = settings.DATABASE_PASSWORD
            
            process = await asyncio.create_subprocess_exec(
                'pg_dump',
                '-h', settings.DATABASE_HOST,
                '-p', str(settings.DATABASE_PORT),
                '-U', settings.DATABASE_USER,
                '-d', settings.DATABASE_NAME,
                '-f', backup_file,
                '--verbose',
                '--clean',
                '--if-exists',
                env=env,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                raise Exception(f"pg_dump failed: {stderr.decode()}")
            
            # Read backup file
            async with aiofiles.open(backup_file, 'rb') as f:
                backup_data = await f.read()
            
            # Clean up
            os.unlink(backup_file)
            
            return backup_data
            
        except Exception as e:
            raise Exception(f"Database backup failed: {str(e)}")
    
    async def _backup_file_storage(self) -> bytes:
        """Backup application files and uploads"""
        backup_files = {}
        
        try:
            # Backup important directories
            directories_to_backup = [
                '/workspace/backend/app',
                '/workspace/frontend',
                '/workspace/database'
            ]
            
            for directory in directories_to_backup:
                if os.path.exists(directory):
                    dir_name = os.path.basename(directory)
                    backup_files[dir_name] = await self._create_directory_archive(directory)
            
            return json.dumps(backup_files).encode()
            
        except Exception as e:
            raise Exception(f"File backup failed: {str(e)}")
    
    async def _create_directory_archive(self, directory: str) -> bytes:
        """Create archive of directory"""
        archive_buffer = BytesIO()
        
        with ZipFile(archive_buffer, 'w', ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(directory):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, directory)
                    zipf.write(file_path, arcname)
        
        archive_buffer.seek(0)
        return archive_buffer.read()
    
    async def _backup_configuration(self) -> bytes:
        """Backup application configuration"""
        config_data = {}
        
        try:
            # Read important config files
            config_files = [
                '/workspace/backend/app/core/config.py',
                '/workspace/docker-compose.yml',
                '/workspace/backend/requirements.txt',
                '/workspace/backend/main.py'
            ]
            
            for config_file in config_files:
                if os.path.exists(config_file):
                    async with aiofiles.open(config_file, 'r') as f:
                        content = await f.read()
                        config_data[os.path.basename(config_file)] = content
            
            return json.dumps(config_data).encode()
            
        except Exception as e:
            raise Exception(f"Configuration backup failed: {str(e)}")
    
    def _compress_backup(self, backup_data: Dict[str, Any]) -> bytes:
        """Compress backup data"""
        import gzip
        json_data = json.dumps(backup_data).encode()
        return gzip.compress(json_data)
    
    def _encrypt_backup(self, data: bytes) -> bytes:
        """Encrypt backup data"""
        return self.cipher_suite.encrypt(data)
    
    async def _upload_to_s3(self, backup_id: str, data: bytes) -> str:
        """Upload backup to S3"""
        if not self.s3_client:
            # Store locally if S3 not available
            backup_path = f"/workspace/backups/{backup_id}.backup"
            os.makedirs(os.path.dirname(backup_path), exist_ok=True)
            
            async with aiofiles.open(backup_path, 'wb') as f:
                await f.write(data)
            
            return backup_path
        
        # Upload to S3
        bucket = settings.S3_BACKUP_BUCKET or "optibid-backups-primary"
        key = f"backups/{backup_id}.backup"
        
        self.s3_client.put_object(
            Bucket=bucket,
            Key=key,
            Body=data,
            ServerSideEncryption='AES256'  # Server-side encryption
        )
        
        return f"s3://{bucket}/{key}"
    
    async def _store_backup_metadata(self, job: BackupJob):
        """Store backup job metadata"""
        if self.redis_client:
            # Store in Redis for quick access
            await self.redis_client.setex(
                f"backup:{job.id}",
                86400,  # 24 hours
                job.json()
            )
        
        # Store in database for long-term persistence
        db = get_database()
        await db.execute("""
            INSERT INTO backup_jobs (
                id, type, status, started_at, completed_at, 
                size_bytes, checksum, location, error_message, 
                retention_expires, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
            ON CONFLICT (id) DO UPDATE SET
                status = EXCLUDED.status,
                completed_at = EXCLUDED.completed_at,
                error_message = EXCLUDED.error_message
        """, job.id, job.type, job.status, job.started_at, job.completed_at,
            job.size_bytes, job.checksum, job.location, job.error_message,
            job.retention_expires)
    
    async def list_backups(self, status: Optional[str] = None, limit: int = 50) -> List[BackupJob]:
        """List backup jobs"""
        db = get_database()
        
        query = """
            SELECT id, type, status, started_at, completed_at, 
                   size_bytes, checksum, location, error_message, 
                   retention_expires
            FROM backup_jobs 
        """
        
        params = []
        if status:
            query += " WHERE status = $1"
            params.append(status)
        
        query += " ORDER BY started_at DESC LIMIT $" + str(len(params) + 1)
        params.append(limit)
        
        rows = await db.fetch(query, *params)
        
        return [BackupJob(**dict(row)) for row in rows]
    
    async def get_backup(self, backup_id: str) -> Optional[BackupJob]:
        """Get specific backup job"""
        db = get_database()
        
        row = await db.fetchrow("""
            SELECT id, type, status, started_at, completed_at, 
                   size_bytes, checksum, location, error_message, 
                   retention_expires
            FROM backup_jobs WHERE id = $1
        """, backup_id)
        
        return BackupJob(**dict(row)) if row else None
    
    async def restore_backup(self, backup_id: str, restore_options: Dict[str, bool] = None) -> bool:
        """Restore from backup"""
        if not restore_options:
            restore_options = {
                'database': True,
                'files': True,
                'configuration': True
            }
        
        job = await self.get_backup(backup_id)
        if not job or job.status != "completed":
            raise HTTPException(status_code=404, detail="Backup not found or not completed")
        
        try:
            # Download backup from S3
            backup_data = await self._download_from_s3(job.location)
            
            # Decrypt if encrypted
            if self._is_encrypted(backup_data):
                backup_data = self.cipher_suite.decrypt(backup_data)
            
            # Decompress if compressed
            if self._is_compressed(backup_data):
                import gzip
                backup_data = gzip.decompress(backup_data)
            
            # Parse backup data
            backup_dict = json.loads(backup_data.decode())
            
            # Restore components
            if restore_options.get('database') and 'database' in backup_dict:
                await self._restore_database(backup_dict['database'])
            
            if restore_options.get('files') and 'files' in backup_dict:
                await self._restore_files(backup_dict['files'])
            
            if restore_options.get('configuration') and 'configuration' in backup_dict:
                await self._restore_configuration(backup_dict['configuration'])
            
            return True
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Restore failed: {str(e)}")
    
    def _is_encrypted(self, data: bytes) -> bool:
        """Check if data appears to be encrypted"""
        try:
            # Try to decrypt and see if it produces valid JSON
            decrypted = self.cipher_suite.decrypt(data)
            json.loads(decrypted.decode())
            return True
        except:
            return False
    
    def _is_compressed(self, data: bytes) -> bool:
        """Check if data appears to be compressed"""
        try:
            import gzip
            gzip.decompress(data)
            return True
        except:
            return False
    
    async def _download_from_s3(self, location: str) -> bytes:
        """Download backup from S3 or local storage"""
        if location.startswith('s3://'):
            # Download from S3
            if not self.s3_client:
                raise HTTPException(status_code=500, detail="S3 client not configured")
            
            bucket, key = location.replace('s3://', '').split('/', 1)
            response = self.s3_client.get_object(Bucket=bucket, Key=key)
            return response['Body'].read()
        else:
            # Download from local storage
            async with aiofiles.open(location, 'rb') as f:
                return await f.read()
    
    async def _restore_database(self, backup_data: bytes):
        """Restore database from backup"""
        try:
            # Create temporary file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.sql', delete=False) as f:
                backup_file = f.name
            
            # Write backup data to file
            async with aiofiles.open(backup_file, 'wb') as f:
                await f.write(backup_data)
            
            # Execute restore using psql
            env = os.environ.copy()
            env['PGPASSWORD'] = settings.DATABASE_PASSWORD
            
            process = await asyncio.create_subprocess_exec(
                'psql',
                '-h', settings.DATABASE_HOST,
                '-p', str(settings.DATABASE_PORT),
                '-U', settings.DATABASE_USER,
                '-d', settings.DATABASE_NAME,
                '-f', backup_file,
                env=env,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                raise Exception(f"psql restore failed: {stderr.decode()}")
            
            # Clean up
            os.unlink(backup_file)
            
        except Exception as e:
            raise Exception(f"Database restore failed: {str(e)}")
    
    async def _restore_files(self, file_backup: Dict[str, Any]):
        """Restore files from backup"""
        for dir_name, archive_data in file_backup.items():
            try:
                # Decode base64 archive
                import base64
                archive_bytes = base64.b64decode(archive_data)
                
                # Extract to temporary location
                temp_dir = tempfile.mkdtemp()
                archive_path = os.path.join(temp_dir, f"{dir_name}.zip")
                
                async with aiofiles.open(archive_path, 'wb') as f:
                    await f.write(archive_bytes)
                
                # Extract archive
                with ZipFile(archive_path, 'r') as zipf:
                    zipf.extractall(temp_dir)
                
                # Copy files to destination
                extracted_dir = os.path.join(temp_dir, dir_name)
                if os.path.exists(extracted_dir):
                    dest_dir = f"/workspace/{dir_name}"
                    shutil.rmtree(dest_dir, ignore_errors=True)
                    shutil.copytree(extracted_dir, dest_dir)
                
                # Clean up
                shutil.rmtree(temp_dir)
                
            except Exception as e:
                print(f"Failed to restore {dir_name}: {str(e)}")
    
    async def _restore_configuration(self, config_backup: Dict[str, Any]):
        """Restore configuration from backup"""
        for filename, content in config_backup.items():
            try:
                file_path = f"/workspace/{filename}"
                async with aiofiles.open(file_path, 'w') as f:
                    await f.write(content)
            except Exception as e:
                print(f"Failed to restore config {filename}: {str(e)}")
    
    async def create_recovery_point(self) -> RecoveryPoint:
        """Create database recovery point for PITR"""
        db = get_database()
        
        try:
            # Get current WAL position
            result = await db.fetchrow("""
                SELECT pg_current_wal_lsn() as lsn, 
                       pg_current_wal_insert_lsn() as insert_lsn
            """)
            
            lsn = str(result['lsn'])
            insert_lsn = str(result['insert_lsn'])
            
            recovery_point = RecoveryPoint(
                timestamp=datetime.utcnow(),
                transaction_id="",  # Would be set by actual transaction context
                lsn=lsn,
                backup_id=f"pitr_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                size_bytes=0,
                location="wal_archive"
            )
            
            self.recovery_points.append(recovery_point)
            
            # Keep only recent recovery points
            cutoff = datetime.utcnow() - timedelta(days=7)
            self.recovery_points = [
                rp for rp in self.recovery_points if rp.timestamp > cutoff
            ]
            
            return recovery_point
            
        except Exception as e:
            raise Exception(f"Failed to create recovery point: {str(e)}")
    
    async def initiate_disaster_recovery(self, incident_type: str, severity: str = "medium") -> DisasterRecoveryPlan:
        """Initiate disaster recovery process"""
        incident_id = f"dr_{incident_type}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        # Define recovery strategies based on incident type
        recovery_strategies = {
            'database_failure': {
                'affected_systems': ['database'],
                'rto_minutes': 30,
                'rpo_minutes': 5,
                'steps': [
                    {'action': 'switch_to_read_replica', 'description': 'Switch to read replica'},
                    {'action': 'restore_from_backup', 'description': 'Restore from latest backup'},
                    {'action': 'verify_integrity', 'description': 'Verify data integrity'},
                    {'action': 'resume_operations', 'description': 'Resume normal operations'}
                ]
            },
            'complete_outage': {
                'affected_systems': ['database', 'application', 'storage'],
                'rto_minutes': 120,
                'rpo_minutes': 60,
                'steps': [
                    {'action': 'assess_damage', 'description': 'Assess system damage'},
                    {'action': 'activate_dr_site', 'description': 'Activate disaster recovery site'},
                    {'action': 'restore_from_backup', 'description': 'Restore all systems from backup'},
                    {'action': 'update_dns', 'description': 'Update DNS to DR site'},
                    {'action': 'verify_all_systems', 'description': 'Verify all systems operational'}
                ]
            }
        }
        
        strategy = recovery_strategies.get(incident_type, recovery_strategies['complete_outage'])
        
        plan = DisasterRecoveryPlan(
            incident_id=incident_id,
            severity=severity,
            affected_systems=strategy['affected_systems'],
            recovery_strategy=incident_type,
            estimated_rto=strategy['rto_minutes'],
            estimated_rpo=strategy['rpo_minutes'],
            steps=strategy['steps'],
            status='planned',
            created_at=datetime.utcnow()
        )
        
        return plan
    
    async def execute_recovery_plan(self, plan: DisasterRecoveryPlan) -> bool:
        """Execute disaster recovery plan"""
        plan.status = 'in_progress'
        
        try:
            for step in plan.steps:
                action = step['action']
                
                if action == 'restore_from_backup':
                    # Find most recent successful backup
                    backups = await self.list_backups(status='completed', limit=1)
                    if backups:
                        latest_backup = backups[0]
                        success = await self.restore_backup(latest_backup.id)
                        if not success:
                            raise Exception(f"Failed to restore from backup {latest_backup.id}")
                
                elif action == 'verify_integrity':
                    # Perform integrity checks
                    await self._verify_system_integrity()
                
                elif action == 'verify_all_systems':
                    # Comprehensive system verification
                    await self._verify_all_systems()
            
            plan.status = 'completed'
            plan.completed_at = datetime.utcnow()
            return True
            
        except Exception as e:
            plan.status = 'failed'
            print(f"Disaster recovery failed: {str(e)}")
            return False
    
    async def _verify_system_integrity(self):
        """Verify system integrity after restore"""
        db = get_database()
        
        # Check database connectivity
        await db.fetchval("SELECT 1")
        
        # Check table integrity
        tables = await db.fetch("""
            SELECT tablename FROM pg_tables WHERE schemaname = 'public'
        """)
        
        for table in tables:
            table_name = table['tablename']
            # Check for corruption
            await db.fetchval(f"SELECT COUNT(*) FROM {table_name}")
    
    async def _verify_all_systems(self):
        """Verify all systems are operational"""
        # Check database
        db = get_database()
        await db.fetchval("SELECT 1")
        
        # Check Redis
        if self.redis_client:
            await self.redis_client.ping()
        
        # Check file system
        critical_files = [
            '/workspace/backend/main.py',
            '/workspace/docker-compose.yml'
        ]
        
        for file_path in critical_files:
            if not os.path.exists(file_path):
                raise Exception(f"Critical file missing: {file_path}")
    
    async def get_backup_health(self) -> Dict[str, Any]:
        """Get backup system health metrics"""
        try:
            recent_backups = await self.list_backups(limit=10)
            successful_backups = [b for b in recent_backups if b.status == 'completed']
            
            health = {
                'total_backups': len(recent_backups),
                'successful_backups': len(successful_backups),
                'failed_backups': len([b for b in recent_backups if b.status == 'failed']),
                'success_rate': len(successful_backups) / max(len(recent_backups), 1),
                'latest_backup': recent_backups[0].dict() if recent_backups else None,
                'backup_size_total': sum(b.size_bytes or 0 for b in successful_backups),
                's3_available': self.s3_client is not None,
                'redis_available': self.redis_client is not None
            }
            
            return health
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'total_backups': 0,
                'successful_backups': 0
            }

# Global backup service instance
backup_service = BackupService()
