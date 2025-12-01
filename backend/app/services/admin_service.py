"""
Admin Service - Comprehensive admin panel functionality
Handles organization management, user administration, feature flags, and system controls
"""
import asyncio
import json
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from enum import Enum
from uuid import UUID, uuid4

import asyncpg
from fastapi import HTTPException, status
from pydantic import BaseModel, Field


class FeatureFlagStatus(str, Enum):
    """Feature flag status"""
    ENABLED = "enabled"
    DISABLED = "disabled"
    BETA = "beta"
    ROLLOUT = "rollout"


class SystemHealthStatus(str, Enum):
    """System health status"""
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"
    UNKNOWN = "unknown"


class ThemeConfig(BaseModel):
    """Theme configuration"""
    primary_color: str = "#3B82F6"
    secondary_color: str = "#64748B"
    accent_color: str = "#10B981"
    background_color: str = "#FFFFFF"
    text_color: str = "#1F2937"
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None


class FeatureFlag(BaseModel):
    """Feature flag configuration"""
    id: UUID = Field(default_factory=uuid4)
    name: str
    description: Optional[str] = None
    status: FeatureFlagStatus
    rollout_percentage: int = Field(default=0, ge=0, le=100)
    target_organizations: List[UUID] = Field(default_factory=list)
    target_users: List[UUID] = Field(default_factory=list)
    environment: str = Field(default="production")
    created_by: UUID
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SystemHealth(BaseModel):
    """System health metrics"""
    service_name: str
    status: SystemHealthStatus
    uptime: timedelta
    response_time_ms: float
    cpu_usage_percent: float
    memory_usage_percent: float
    disk_usage_percent: float
    active_connections: int
    last_check: datetime = Field(default_factory=datetime.utcnow)
    error_rate_percent: float = 0.0
    details: Dict[str, Any] = Field(default_factory=dict)


class AuditLog(BaseModel):
    """Audit log entry"""
    id: UUID = Field(default_factory=uuid4)
    organization_id: Optional[UUID]
    user_id: Optional[UUID]
    action: str
    resource_type: str
    resource_id: Optional[UUID]
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AdminConfig(BaseModel):
    """Admin configuration settings"""
    organization_id: UUID
    theme: ThemeConfig = Field(default_factory=ThemeConfig)
    allowed_domains: List[str] = Field(default_factory=list)
    max_users: int = 100
    session_timeout_hours: int = 24
    require_email_verification: bool = True
    allow_self_registration: bool = False
    maintenance_mode: bool = False
    maintenance_message: Optional[str] = None
    custom_css: Optional[str] = None
    custom_js: Optional[str] = None
    api_rate_limit_per_hour: int = 1000
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AdminService:
    """Comprehensive admin panel service"""
    
    def __init__(self, db_pool: asyncpg.Pool, rbac_service, billing_service):
        self.db_pool = db_pool
        self.rbac_service = rbac_service
        self.billing_service = billing_service
    
    async def initialize(self):
        """Initialize admin service and create required database tables"""
        async with self.db_pool.acquire() as conn:
            # Create feature_flags table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS feature_flags (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(255) NOT NULL UNIQUE,
                    description TEXT,
                    status VARCHAR(50) NOT NULL,
                    rollout_percentage INTEGER DEFAULT 0,
                    target_organizations JSONB NOT NULL DEFAULT '[]',
                    target_users JSONB NOT NULL DEFAULT '[]',
                    environment VARCHAR(50) DEFAULT 'production',
                    created_by UUID NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    metadata JSONB NOT NULL DEFAULT '{}'
                )
            """)
            
            # Create admin_configs table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS admin_configs (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    organization_id UUID NOT NULL REFERENCES organizations(id),
                    theme JSONB NOT NULL DEFAULT '{}',
                    allowed_domains JSONB NOT NULL DEFAULT '[]',
                    max_users INTEGER DEFAULT 100,
                    session_timeout_hours INTEGER DEFAULT 24,
                    require_email_verification BOOLEAN DEFAULT true,
                    allow_self_registration BOOLEAN DEFAULT false,
                    maintenance_mode BOOLEAN DEFAULT false,
                    maintenance_message TEXT,
                    custom_css TEXT,
                    custom_js TEXT,
                    api_rate_limit_per_hour INTEGER DEFAULT 1000,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(organization_id)
                )
            """)
            
            # Create system_health table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS system_health (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    service_name VARCHAR(255) NOT NULL,
                    status VARCHAR(50) NOT NULL,
                    uptime_seconds INTEGER NOT NULL,
                    response_time_ms DECIMAL(10,2) NOT NULL,
                    cpu_usage_percent DECIMAL(5,2) NOT NULL,
                    memory_usage_percent DECIMAL(5,2) NOT NULL,
                    disk_usage_percent DECIMAL(5,2) NOT NULL,
                    active_connections INTEGER NOT NULL,
                    error_rate_percent DECIMAL(5,2) DEFAULT 0.0,
                    details JSONB NOT NULL DEFAULT '{}',
                    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(service_name, checked_at)
                )
            """)
            
            # Create audit_logs table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    organization_id UUID REFERENCES organizations(id),
                    user_id UUID REFERENCES users(id),
                    action VARCHAR(255) NOT NULL,
                    resource_type VARCHAR(100) NOT NULL,
                    resource_id UUID,
                    old_values JSONB,
                    new_values JSONB,
                    ip_address INET,
                    user_agent TEXT,
                    metadata JSONB NOT NULL DEFAULT '{}',
                    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """)
            
            # Create indexes
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_feature_flags_status 
                ON feature_flags(status, environment)
            """)
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_audit_logs_org_user 
                ON audit_logs(organization_id, user_id, timestamp)
            """)
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_audit_logs_action 
                ON audit_logs(action, timestamp)
            """)
    
    # Feature Flag Management
    
    async def create_feature_flag(
        self,
        name: str,
        description: str,
        status: FeatureFlagStatus,
        created_by: UUID,
        organization_id: Optional[UUID] = None,
        rollout_percentage: int = 0,
        target_organizations: List[UUID] = None,
        target_users: List[UUID] = None,
        environment: str = "production",
        metadata: Dict[str, Any] = None
    ) -> FeatureFlag:
        """Create a new feature flag"""
        
        if organization_id:
            await self.rbac_service.require_permission(
                created_by, organization_id, "feature.flags"
            )
        
        flag = FeatureFlag(
            name=name,
            description=description,
            status=status,
            rollout_percentage=rollout_percentage,
            target_organizations=target_organizations or [],
            target_users=target_users or [],
            environment=environment,
            created_by=created_by,
            metadata=metadata or {}
        )
        
        async with self.db_pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO feature_flags 
                (name, description, status, rollout_percentage, target_organizations,
                 target_users, environment, created_by, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            """,
                flag.name,
                flag.description,
                flag.status.value,
                flag.rollout_percentage,
                json.dumps(flag.target_organizations),
                json.dumps(flag.target_users),
                flag.environment,
                flag.created_by,
                json.dumps(flag.metadata)
            )
        
        return flag
    
    async def update_feature_flag(
        self,
        flag_id: UUID,
        user_id: UUID,
        organization_id: Optional[UUID] = None,
        **updates
    ) -> FeatureFlag:
        """Update an existing feature flag"""
        
        if organization_id:
            await self.rbac_service.require_permission(
                user_id, organization_id, "feature.flags"
            )
        
        async with self.db_pool.acquire() as conn:
            # Get current flag
            row = await conn.fetchrow("""
                SELECT * FROM feature_flags WHERE id = $1
            """, flag_id)
            
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Feature flag not found"
                )
            
            # Build update query dynamically
            set_clauses = []
            params = [flag_id]
            param_count = 1
            
            for field, value in updates.items():
                if field in ['name', 'description', 'status', 'rollout_percentage', 
                           'target_organizations', 'target_users', 'environment', 'metadata']:
                    param_count += 1
                    if field in ['target_organizations', 'target_users', 'metadata']:
                        set_clauses.append(f"{field} = ${param_count}")
                        params.append(json.dumps(value))
                    else:
                        set_clauses.append(f"{field} = ${param_count}")
                        if field == 'status':
                            params.append(value.value)
                        else:
                            params.append(value)
            
            if not set_clauses:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No valid fields to update"
                )
            
            set_clauses.append("updated_at = NOW()")
            
            query = f"""
                UPDATE feature_flags 
                SET {', '.join(set_clauses)}
                WHERE id = $1
            """
            
            await conn.execute(query, *params)
            
            # Return updated flag
            row = await conn.fetchrow("SELECT * FROM feature_flags WHERE id = $1", flag_id)
            
            return FeatureFlag(
                id=row['id'],
                name=row['name'],
                description=row['description'],
                status=FeatureFlagStatus(row['status']),
                rollout_percentage=row['rollout_percentage'],
                target_organizations=json.loads(row['target_organizations']),
                target_users=json.loads(row['target_users']),
                environment=row['environment'],
                created_by=row['created_by'],
                created_at=row['created_at'],
                updated_at=row['updated_at'],
                metadata=json.loads(row['metadata'])
            )
    
    async def get_feature_flags(
        self,
        organization_id: Optional[UUID] = None,
        user_id: Optional[UUID] = None,
        environment: str = "production"
    ) -> List[FeatureFlag]:
        """Get all feature flags (filtered by permissions)"""
        
        if organization_id:
            await self.rbac_service.require_permission(
                user_id, organization_id, "feature.flags"
            )
        
        async with self.db_pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT * FROM feature_flags 
                WHERE environment = $1
                ORDER BY name
            """, environment)
            
            flags = []
            for row in rows:
                # Check if user/org has access to this flag
                target_orgs = json.loads(row['target_organizations'])
                target_users = json.loads(row['target_users'])
                
                if (organization_id and organization_id in target_orgs) or \
                   (user_id and user_id in target_users) or \
                   not target_orgs:  # Global flag if no specific targets
                    
                    flags.append(FeatureFlag(
                        id=row['id'],
                        name=row['name'],
                        description=row['description'],
                        status=FeatureFlagStatus(row['status']),
                        rollout_percentage=row['rollout_percentage'],
                        target_organizations=target_orgs,
                        target_users=target_users,
                        environment=row['environment'],
                        created_by=row['created_by'],
                        created_at=row['created_at'],
                        updated_at=row['updated_at'],
                        metadata=json.loads(row['metadata'])
                    ))
            
            return flags
    
    async def is_feature_enabled(
        self,
        feature_name: str,
        organization_id: UUID,
        user_id: Optional[UUID] = None,
        environment: str = "production"
    ) -> bool:
        """Check if a feature is enabled for a specific organization/user"""
        
        async with self.db_pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT * FROM feature_flags 
                WHERE name = $1 AND environment = $2
                LIMIT 1
            """, feature_name, environment)
            
            if not row:
                return False
            
            status = FeatureFlagStatus(row['status'])
            
            # Check status
            if status == FeatureFlagStatus.DISABLED:
                return False
            elif status == FeatureFlagStatus.ENABLED:
                return True
            
            # For BETA and ROLLOUT, check targeting
            target_orgs = json.loads(row['target_organizations'])
            target_users = json.loads(row['target_users'])
            
            # Check if specifically targeted
            if organization_id in target_orgs or (user_id and user_id in target_users):
                return True
            
            # For rollout, use percentage-based check
            if status == FeatureFlagStatus.ROLLOUT:
                if organization_id:
                    # Use org ID hash for consistent rollout
                    org_hash = int(hashlib.md5(str(organization_id).encode()).hexdigest(), 16)
                    return (org_hash % 100) < row['rollout_percentage']
            
            return False
    
    # Admin Configuration Management
    
    async def get_admin_config(self, organization_id: UUID, user_id: UUID) -> AdminConfig:
        """Get admin configuration for organization"""
        
        await self.rbac_service.require_permission(
            user_id, organization_id, "system.config"
        )
        
        async with self.db_pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT * FROM admin_configs WHERE organization_id = $1
            """, organization_id)
            
            if not row:
                # Create default config
                return await self.create_admin_config(organization_id, user_id)
            
            return AdminConfig(
                organization_id=row['organization_id'],
                theme=ThemeConfig(**json.loads(row['theme'] or '{}')),
                allowed_domains=json.loads(row['allowed_domains'] or '[]'),
                max_users=row['max_users'],
                session_timeout_hours=row['session_timeout_hours'],
                require_email_verification=row['require_email_verification'],
                allow_self_registration=row['allow_self_registration'],
                maintenance_mode=row['maintenance_mode'],
                maintenance_message=row['maintenance_message'],
                custom_css=row['custom_css'],
                custom_js=row['custom_js'],
                api_rate_limit_per_hour=row['api_rate_limit_per_hour'],
                updated_at=row['updated_at']
            )
    
    async def create_admin_config(
        self,
        organization_id: UUID,
        user_id: UUID,
        config: Optional[AdminConfig] = None
    ) -> AdminConfig:
        """Create or update admin configuration"""
        
        await self.rbac_service.require_permission(
            user_id, organization_id, "system.config"
        )
        
        if not config:
            config = AdminConfig(organization_id=organization_id)
        
        async with self.db_pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO admin_configs 
                (organization_id, theme, allowed_domains, max_users, session_timeout_hours,
                 require_email_verification, allow_self_registration, maintenance_mode,
                 maintenance_message, custom_css, custom_js, api_rate_limit_per_hour)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT (organization_id) DO UPDATE SET
                    theme = EXCLUDED.theme,
                    allowed_domains = EXCLUDED.allowed_domains,
                    max_users = EXCLUDED.max_users,
                    session_timeout_hours = EXCLUDED.session_timeout_hours,
                    require_email_verification = EXCLUDED.require_email_verification,
                    allow_self_registration = EXCLUDED.allow_self_registration,
                    maintenance_mode = EXCLUDED.maintenance_mode,
                    maintenance_message = EXCLUDED.maintenance_message,
                    custom_css = EXCLUDED.custom_css,
                    custom_js = EXCLUDED.custom_js,
                    api_rate_limit_per_hour = EXCLUDED.api_rate_limit_per_hour,
                    updated_at = NOW()
            """,
                config.organization_id,
                json.dumps(config.theme.dict()),
                json.dumps(config.allowed_domains),
                config.max_users,
                config.session_timeout_hours,
                config.require_email_verification,
                config.allow_self_registration,
                config.maintenance_mode,
                config.maintenance_message,
                config.custom_css,
                config.custom_js,
                config.api_rate_limit_per_hour
            )
        
        return config
    
    # System Health Monitoring
    
    async def record_health_check(
        self,
        service_name: str,
        status: SystemHealthStatus,
        uptime_seconds: int,
        response_time_ms: float,
        cpu_usage_percent: float,
        memory_usage_percent: float,
        disk_usage_percent: float,
        active_connections: int,
        error_rate_percent: float = 0.0,
        details: Dict[str, Any] = None
    ) -> SystemHealth:
        """Record a health check result"""
        
        health = SystemHealth(
            service_name=service_name,
            status=status,
            uptime=timedelta(seconds=uptime_seconds),
            response_time_ms=response_time_ms,
            cpu_usage_percent=cpu_usage_percent,
            memory_usage_percent=memory_usage_percent,
            disk_usage_percent=disk_usage_percent,
            active_connections=active_connections,
            error_rate_percent=error_rate_percent,
            details=details or {}
        )
        
        async with self.db_pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO system_health 
                (service_name, status, uptime_seconds, response_time_ms,
                 cpu_usage_percent, memory_usage_percent, disk_usage_percent,
                 active_connections, error_rate_percent, details)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            """,
                health.service_name,
                health.status.value,
                int(health.uptime.total_seconds()),
                health.response_time_ms,
                health.cpu_usage_percent,
                health.memory_usage_percent,
                health.disk_usage_percent,
                health.active_connections,
                health.error_rate_percent,
                json.dumps(health.details)
            )
        
        return health
    
    async def get_system_health(
        self,
        user_id: UUID,
        organization_id: Optional[UUID] = None
    ) -> List[SystemHealth]:
        """Get current system health status"""
        
        if organization_id:
            await self.rbac_service.require_permission(
                user_id, organization_id, "system.health.view"
            )
        
        async with self.db_pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT DISTINCT ON (service_name) service_name, status, uptime_seconds,
                       response_time_ms, cpu_usage_percent, memory_usage_percent,
                       disk_usage_percent, active_connections, error_rate_percent,
                       details, checked_at
                FROM system_health
                ORDER BY service_name, checked_at DESC
            """)
            
            return [
                SystemHealth(
                    service_name=row['service_name'],
                    status=SystemHealthStatus(row['status']),
                    uptime=timedelta(seconds=row['uptime_seconds']),
                    response_time_ms=float(row['response_time_ms']),
                    cpu_usage_percent=float(row['cpu_usage_percent']),
                    memory_usage_percent=float(row['memory_usage_percent']),
                    disk_usage_percent=float(row['disk_usage_percent']),
                    active_connections=row['active_connections'],
                    error_rate_percent=float(row['error_rate_percent']),
                    checked_at=row['checked_at'],
                    details=json.loads(row['details'] or '{}')
                )
                for row in rows
            ]
    
    # Audit Logging
    
    async def log_audit_event(
        self,
        action: str,
        resource_type: str,
        organization_id: Optional[UUID] = None,
        user_id: Optional[UUID] = None,
        resource_id: Optional[UUID] = None,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        """Log an audit event"""
        
        audit_log = AuditLog(
            organization_id=organization_id,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address,
            user_agent=user_agent,
            metadata=metadata or {}
        )
        
        async with self.db_pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO audit_logs 
                (organization_id, user_id, action, resource_type, resource_id,
                 old_values, new_values, ip_address, user_agent, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            """,
                audit_log.organization_id,
                audit_log.user_id,
                audit_log.action,
                audit_log.resource_type,
                audit_log.resource_id,
                json.dumps(audit_log.old_values),
                json.dumps(audit_log.new_values),
                audit_log.ip_address,
                audit_log.user_agent,
                json.dumps(audit_log.metadata)
            )
        
        return audit_log
    
    async def get_audit_logs(
        self,
        user_id: UUID,
        organization_id: Optional[UUID] = None,
        resource_type: Optional[str] = None,
        action: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100
    ) -> List[AuditLog]:
        """Get audit logs (filtered by permissions)"""
        
        if organization_id:
            await self.rbac_service.require_permission(
                user_id, organization_id, "system.audit.view"
            )
        
        async with self.db_pool.acquire() as conn:
            query = """
                SELECT al.*, u.email, o.name as organization_name
                FROM audit_logs al
                LEFT JOIN users u ON al.user_id = u.id
                LEFT JOIN organizations o ON al.organization_id = o.id
                WHERE 1=1
            """
            params = []
            param_count = 0
            
            if organization_id:
                param_count += 1
                query += f" AND al.organization_id = ${param_count}"
                params.append(organization_id)
            
            if resource_type:
                param_count += 1
                query += f" AND al.resource_type = ${param_count}"
                params.append(resource_type)
            
            if action:
                param_count += 1
                query += f" AND al.action = ${param_count}"
                params.append(action)
            
            if start_date:
                param_count += 1
                query += f" AND al.timestamp >= ${param_count}"
                params.append(start_date)
            
            if end_date:
                param_count += 1
                query += f" AND al.timestamp <= ${param_count}"
                params.append(end_date)
            
            param_count += 1
            query += f" ORDER BY al.timestamp DESC LIMIT ${param_count}"
            params.append(limit)
            
            rows = await conn.fetch(query, *params)
            
            return [
                AuditLog(
                    id=row['id'],
                    organization_id=row['organization_id'],
                    user_id=row['user_id'],
                    action=row['action'],
                    resource_type=row['resource_type'],
                    resource_id=row['resource_id'],
                    old_values=json.loads(row['old_values']) if row['old_values'] else None,
                    new_values=json.loads(row['new_values']) if row['new_values'] else None,
                    ip_address=str(row['ip_address']) if row['ip_address'] else None,
                    user_agent=row['user_agent'],
                    timestamp=row['timestamp'],
                    metadata=json.loads(row['metadata'] or '{}')
                )
                for row in rows
            ]
    
    # Organization Management
    
    async def get_organization_summary(
        self,
        user_id: UUID,
        organization_id: UUID
    ) -> Dict[str, Any]:
        """Get comprehensive organization summary for admin panel"""
        
        await self.rbac_service.require_permission(
            user_id, organization_id, "org.usage.view"
        )
        
        async with self.db_pool.acquire() as conn:
            # Get organization details
            org_row = await conn.fetchrow("""
                SELECT o.*, 
                       COUNT(DISTINCT u.id) as total_users,
                       COUNT(DISTINCT d.id) as total_dashboards,
                       s.status as subscription_status,
                       s.plan_id as subscription_plan
                FROM organizations o
                LEFT JOIN users u ON o.id = u.organization_id
                LEFT JOIN dashboards d ON o.id = d.organization_id
                LEFT JOIN subscriptions s ON o.id = s.organization_id
                WHERE o.id = $1
                GROUP BY o.id, s.status, s.plan_id
            """, organization_id)
            
            if not org_row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Organization not found"
                )
            
            # Get usage statistics
            usage_summary = await self.billing_service.get_usage_summary(organization_id)
            
            # Get user count by role
            role_stats = await conn.fetch("""
                SELECT role_type, COUNT(*) as user_count
                FROM role_assignments
                WHERE organization_id = $1 AND is_active = true
                GROUP BY role_type
            """, organization_id)
            
            return {
                "organization": {
                    "id": org_row['id'],
                    "name": org_row['name'],
                    "description": org_row['description'],
                    "created_at": org_row['created_at'],
                    "updated_at": org_row['updated_at']
                },
                "statistics": {
                    "total_users": org_row['total_users'],
                    "total_dashboards": org_row['total_dashboards'],
                    "subscription_status": org_row['subscription_status'],
                    "subscription_plan": org_row['subscription_plan']
                },
                "usage": usage_summary,
                "role_distribution": {
                    row['role_type']: row['user_count'] 
                    for row in role_stats
                }
            }
    
    async def update_organization_settings(
        self,
        organization_id: UUID,
        user_id: UUID,
        name: Optional[str] = None,
        description: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> bool:
        """Update organization settings"""
        
        await self.rbac_service.require_permission(
            user_id, organization_id, "org.update"
        )
        
        set_clauses = []
        params = []
        param_count = 0
        
        if name is not None:
            param_count += 1
            set_clauses.append(f"name = ${param_count}")
            params.append(name)
        
        if description is not None:
            param_count += 1
            set_clauses.append(f"description = ${param_count}")
            params.append(description)
        
        if is_active is not None:
            param_count += 1
            set_clauses.append(f"is_active = ${param_count}")
            params.append(is_active)
        
        if not set_clauses:
            return False
        
        set_clauses.append("updated_at = NOW()")
        param_count += 1
        
        query = f"""
            UPDATE organizations 
            SET {', '.join(set_clauses)}
            WHERE id = ${param_count}
        """
        params.append(organization_id)
        
        async with self.db_pool.acquire() as conn:
            result = await conn.execute(query, *params)
            
            # Log audit event
            await self.log_audit_event(
                action="organization.update",
                resource_type="organization",
                resource_id=organization_id,
                user_id=user_id,
                organization_id=organization_id,
                new_values={"name": name, "description": description, "is_active": is_active}
            )
            
            return result.split()[-1] != "0"


# Dependency injection function
def get_admin_service(db_pool: asyncpg.Pool, rbac_service, billing_service) -> AdminService:
    """Get admin service instance"""
    return AdminService(db_pool, rbac_service, billing_service)