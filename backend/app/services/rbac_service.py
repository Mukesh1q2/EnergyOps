"""
Role-Based Access Control (RBAC) Service
Handles role management, permissions, and access control for organizations
"""
import asyncio
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set, Any
from enum import Enum
from uuid import UUID, uuid4

import asyncpg
from fastapi import HTTPException, status
from pydantic import BaseModel, Field


class RoleType(str, Enum):
    """System-defined roles"""
    SUPER_ADMIN = "super_admin"
    ORG_ADMIN = "org_admin"
    ANALYST = "analyst"
    VIEWER = "viewer"
    BILLING_ADMIN = "billing_admin"


class PermissionType(str, Enum):
    """System-defined permissions"""
    # Organization Management
    ORG_CREATE = "org.create"
    ORG_UPDATE = "org.update"
    ORG_DELETE = "org.delete"
    ORG_BILLING = "org.billing"
    ORG_USAGE_VIEW = "org.usage.view"
    
    # User Management
    USER_INVITE = "user.invite"
    USER_ROLE_ASSIGN = "user.role.assign"
    USER_DEACTIVATE = "user.deactivate"
    USER_AUDIT_VIEW = "user.audit.view"
    
    # Dashboard Management
    DASHBOARD_CREATE = "dashboard.create"
    DASHBOARD_EDIT = "dashboard.edit"
    DASHBOARD_DELETE = "dashboard.delete"
    DASHBOARD_SHARE = "dashboard.share"
    DASHBOARD_EXPORT = "dashboard.export"
    
    # System Administration
    SYSTEM_CONFIG = "system.config"
    SYSTEM_AUDIT_VIEW = "system.audit.view"
    SYSTEM_HEALTH_VIEW = "system.health.view"
    FEATURE_FLAGS = "feature.flags"
    
    # Billing
    BILLING_VIEW = "billing.view"
    BILLING_MANAGE = "billing.manage"
    BILLING_INVOICES = "billing.invoices"
    BILLING_USAGE = "billing.usage"


class RoleDefinition(BaseModel):
    """Role definition with permissions"""
    role_type: RoleType
    name: str
    description: str
    permissions: Set[PermissionType]
    is_system_role: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RoleAssignment(BaseModel):
    """User role assignment"""
    id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    organization_id: UUID
    role_type: RoleType
    assigned_by: UUID
    assigned_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    is_active: bool = True


class PermissionCheck(BaseModel):
    """Permission check request"""
    user_id: UUID
    organization_id: UUID
    permission: PermissionType
    resource_id: Optional[UUID] = None


class RBACService:
    """Role-Based Access Control Service"""
    
    def __init__(self, db_pool: asyncpg.Pool):
        self.db_pool = db_pool
        self._role_definitions: Dict[RoleType, RoleDefinition] = {}
        self._role_permissions: Dict[RoleType, Set[PermissionType]] = {}
        self._initialize_default_roles()
    
    def _initialize_default_roles(self):
        """Initialize system-defined roles and permissions"""
        self._role_definitions = {
            RoleType.SUPER_ADMIN: RoleDefinition(
                role_type=RoleType.SUPER_ADMIN,
                name="Super Administrator",
                description="Full system access with all permissions",
                permissions=set(PermissionType),
                is_system_role=True
            ),
            RoleType.ORG_ADMIN: RoleDefinition(
                role_type=RoleType.ORG_ADMIN,
                name="Organization Administrator",
                description="Full organization management access",
                permissions={
                    PermissionType.ORG_CREATE, PermissionType.ORG_UPDATE,
                    PermissionType.USER_INVITE, PermissionType.USER_ROLE_ASSIGN,
                    PermissionType.USER_DEACTIVATE, PermissionType.DASHBOARD_CREATE,
                    PermissionType.DASHBOARD_EDIT, PermissionType.DASHBOARD_DELETE,
                    PermissionType.DASHBOARD_SHARE, PermissionType.BILLING_VIEW,
                    PermissionType.BILLING_MANAGE, PermissionType.BILLING_INVOICES,
                    PermissionType.BILLING_USAGE
                },
                is_system_role=True
            ),
            RoleType.BILLING_ADMIN: RoleDefinition(
                role_type=RoleType.BILLING_ADMIN,
                name="Billing Administrator",
                description="Billing and financial management access",
                permissions={
                    PermissionType.ORG_BILLING, PermissionType.BILLING_VIEW,
                    PermissionType.BILLING_MANAGE, PermissionType.BILLING_INVOICES,
                    PermissionType.BILLING_USAGE, PermissionType.USER_AUDIT_VIEW
                },
                is_system_role=True
            ),
            RoleType.ANALYST: RoleDefinition(
                role_type=RoleType.ANALYST,
                name="Energy Analyst",
                description="Analyst with dashboard and analysis access",
                permissions={
                    PermissionType.DASHBOARD_CREATE, PermissionType.DASHBOARD_EDIT,
                    PermissionType.DASHBOARD_DELETE, PermissionType.DASHBOARD_SHARE,
                    PermissionType.DASHBOARD_EXPORT, PermissionType.BILLING_VIEW,
                    PermissionType.BILLING_USAGE
                },
                is_system_role=True
            ),
            RoleType.VIEWER: RoleDefinition(
                role_type=RoleType.VIEWER,
                name="Dashboard Viewer",
                description="Read-only access to dashboards and reports",
                permissions={
                    PermissionType.DASHBOARD_SHARE, PermissionType.DASHBOARD_EXPORT
                },
                is_system_role=True
            )
        }
        
        # Build permission lookup
        for role_type, role_def in self._role_definitions.items():
            self._role_permissions[role_type] = role_def.permissions
    
    async def initialize(self):
        """Initialize RBAC service and create required database tables"""
        async with self.db_pool.acquire() as conn:
            # Create roles table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS roles (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    role_type VARCHAR(50) NOT NULL UNIQUE,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    permissions JSONB NOT NULL DEFAULT '[]',
                    is_system_role BOOLEAN DEFAULT false,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """)
            
            # Create role_assignments table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS role_assignments (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES users(id),
                    organization_id UUID NOT NULL REFERENCES organizations(id),
                    role_type VARCHAR(50) NOT NULL REFERENCES roles(role_type),
                    assigned_by UUID NOT NULL REFERENCES users(id),
                    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    expires_at TIMESTAMP WITH TIME ZONE,
                    is_active BOOLEAN DEFAULT true,
                    UNIQUE(user_id, organization_id, role_type)
                )
            """)
            
            # Create permission_logs table for audit trail
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS permission_logs (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL,
                    organization_id UUID NOT NULL,
                    permission VARCHAR(100) NOT NULL,
                    resource_type VARCHAR(50),
                    resource_id UUID,
                    action VARCHAR(50) NOT NULL,
                    allowed BOOLEAN NOT NULL,
                    reason VARCHAR(255),
                    ip_address INET,
                    user_agent TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """)
            
            # Create indexes
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_role_assignments_user_org 
                ON role_assignments(user_id, organization_id)
            """)
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_permission_logs_user_org 
                ON permission_logs(user_id, organization_id, created_at)
            """)
            
            # Insert default roles
            await self._insert_default_roles(conn)
    
    async def _insert_default_roles(self, conn: asyncpg.Connection):
        """Insert default system roles"""
        for role_type, role_def in self._role_definitions.items():
            permissions_list = list(role_def.permissions)
            
            await conn.execute("""
                INSERT INTO roles (role_type, name, description, permissions, is_system_role)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (role_type) DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    permissions = EXCLUDED.permissions,
                    updated_at = NOW()
            """, 
                role_type.value,
                role_def.name,
                role_def.description,
                permissions_list,
                role_def.is_system_role
            )
    
    async def assign_role(
        self,
        user_id: UUID,
        organization_id: UUID,
        role_type: RoleType,
        assigned_by: UUID,
        expires_at: Optional[datetime] = None
    ) -> RoleAssignment:
        """Assign a role to a user within an organization"""
        async with self.db_pool.acquire() as conn:
            # Verify the assignee exists
            user_exists = await conn.fetchval(
                "SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)",
                user_id
            )
            if not user_exists:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            # Verify organization exists
            org_exists = await conn.fetchval(
                "SELECT EXISTS(SELECT 1 FROM organizations WHERE id = $1)",
                organization_id
            )
            if not org_exists:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Organization not found"
                )
            
            # Create role assignment
            assignment_id = uuid4()
            await conn.execute("""
                INSERT INTO role_assignments 
                (id, user_id, organization_id, role_type, assigned_by, expires_at)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (user_id, organization_id, role_type) DO UPDATE SET
                    assigned_by = EXCLUDED.assigned_by,
                    assigned_at = NOW(),
                    expires_at = EXCLUDED.expires_at,
                    is_active = true
            """, assignment_id, user_id, organization_id, role_type.value, assigned_by, expires_at)
            
            return RoleAssignment(
                id=assignment_id,
                user_id=user_id,
                organization_id=organization_id,
                role_type=role_type,
                assigned_by=assigned_by,
                expires_at=expires_at
            )
    
    async def remove_role(
        self,
        user_id: UUID,
        organization_id: UUID,
        role_type: RoleType
    ) -> bool:
        """Remove a role from a user"""
        async with self.db_pool.acquire() as conn:
            result = await conn.execute("""
                UPDATE role_assignments 
                SET is_active = false 
                WHERE user_id = $1 AND organization_id = $2 AND role_type = $3
            """, user_id, organization_id, role_type.value)
            
            return result.split()[-1] != "0"  # Check if any rows were updated
    
    async def get_user_roles(
        self,
        user_id: UUID,
        organization_id: UUID
    ) -> List[RoleAssignment]:
        """Get all active roles for a user in an organization"""
        async with self.db_pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT ra.id, ra.user_id, ra.organization_id, ra.role_type,
                       ra.assigned_by, ra.assigned_at, ra.expires_at, ra.is_active
                FROM role_assignments ra
                WHERE ra.user_id = $1 AND ra.organization_id = $2 
                AND ra.is_active = true
                AND (ra.expires_at IS NULL OR ra.expires_at > NOW())
                ORDER BY ra.assigned_at DESC
            """, user_id, organization_id)
            
            return [
                RoleAssignment(
                    id=row['id'],
                    user_id=row['user_id'],
                    organization_id=row['organization_id'],
                    role_type=RoleType(row['role_type']),
                    assigned_by=row['assigned_by'],
                    assigned_at=row['assigned_at'],
                    expires_at=row['expires_at'],
                    is_active=row['is_active']
                )
                for row in rows
            ]
    
    async def check_permission(
        self,
        user_id: UUID,
        organization_id: UUID,
        permission: PermissionType,
        resource_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> bool:
        """Check if a user has a specific permission"""
        async with self.db_pool.acquire() as conn:
            # Get user roles
            user_roles = await self.get_user_roles(user_id, organization_id)
            
            # Aggregate all permissions
            user_permissions = set()
            for role_assignment in user_roles:
                role_type = role_assignment.role_type
                if role_type in self._role_permissions:
                    user_permissions.update(self._role_permissions[role_type])
            
            # Check permission
            has_permission = permission in user_permissions
            
            # Log permission check
            await self._log_permission_check(
                conn, user_id, organization_id, permission, resource_id,
                "check", has_permission, ip_address, user_agent
            )
            
            return has_permission
    
    async def require_permission(
        self,
        user_id: UUID,
        organization_id: UUID,
        permission: PermissionType,
        resource_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Require a permission, raise exception if not granted"""
        has_permission = await self.check_permission(
            user_id, organization_id, permission, resource_id, ip_address, user_agent
        )
        
        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {permission.value}"
            )
    
    async def _log_permission_check(
        self,
        conn: asyncpg.Connection,
        user_id: UUID,
        organization_id: UUID,
        permission: PermissionType,
        resource_id: Optional[UUID],
        action: str,
        allowed: bool,
        ip_address: Optional[str],
        user_agent: Optional[str]
    ):
        """Log permission check for audit trail"""
        await conn.execute("""
            INSERT INTO permission_logs 
            (user_id, organization_id, permission, resource_id, action, 
             allowed, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        """, user_id, organization_id, permission.value, resource_id, 
             action, allowed, ip_address, user_agent)
    
    async def get_organization_users(
        self,
        organization_id: UUID,
        role_filter: Optional[RoleType] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get all users in an organization with their roles"""
        async with self.db_pool.acquire() as conn:
            query = """
                SELECT DISTINCT u.id, u.email, u.first_name, u.last_name,
                       u.is_active, u.created_at, u.last_login,
                       array_agg(DISTINCT ra.role_type) FILTER (WHERE ra.is_active) as roles
                FROM users u
                JOIN role_assignments ra ON u.id = ra.user_id
                WHERE ra.organization_id = $1 AND ra.is_active = true
            """
            params = [organization_id]
            
            if role_filter:
                query += " AND ra.role_type = $2"
                params.append(role_filter.value)
            
            query += """
                GROUP BY u.id, u.email, u.first_name, u.last_name,
                         u.is_active, u.created_at, u.last_login
                ORDER BY u.created_at DESC
                LIMIT $""" + str(len(params) + 1) + f" OFFSET ${len(params) + 1}"
            params.extend([limit, offset])
            
            rows = await conn.fetch(query, *params)
            
            return [
                {
                    'id': row['id'],
                    'email': row['email'],
                    'first_name': row['first_name'],
                    'last_name': row['last_name'],
                    'is_active': row['is_active'],
                    'created_at': row['created_at'],
                    'last_login': row['last_login'],
                    'roles': [RoleType(role) for role in row['roles']] if row['roles'] else []
                }
                for row in rows
            ]
    
    async def get_permission_logs(
        self,
        organization_id: Optional[UUID] = None,
        user_id: Optional[UUID] = None,
        permission: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get permission audit logs"""
        async with self.db_pool.acquire() as conn:
            query = """
                SELECT pl.*, u.email, o.name as organization_name
                FROM permission_logs pl
                LEFT JOIN users u ON pl.user_id = u.id
                LEFT JOIN organizations o ON pl.organization_id = o.id
                WHERE 1=1
            """
            params = []
            
            if organization_id:
                query += " AND pl.organization_id = $" + str(len(params) + 1)
                params.append(organization_id)
            
            if user_id:
                query += " AND pl.user_id = $" + str(len(params) + 1)
                params.append(user_id)
            
            if permission:
                query += " AND pl.permission = $" + str(len(params) + 1)
                params.append(permission)
            
            if start_date:
                query += " AND pl.created_at >= $" + str(len(params) + 1)
                params.append(start_date)
            
            if end_date:
                query += " AND pl.created_at <= $" + str(len(params) + 1)
                params.append(end_date)
            
            query += " ORDER BY pl.created_at DESC LIMIT $" + str(len(params) + 1)
            params.append(limit)
            
            rows = await conn.fetch(query, *params)
            
            return [
                {
                    'id': row['id'],
                    'user_id': row['user_id'],
                    'user_email': row['email'],
                    'organization_id': row['organization_id'],
                    'organization_name': row['organization_name'],
                    'permission': row['permission'],
                    'resource_type': row['resource_type'],
                    'resource_id': row['resource_id'],
                    'action': row['action'],
                    'allowed': row['allowed'],
                    'reason': row['reason'],
                    'ip_address': str(row['ip_address']) if row['ip_address'] else None,
                    'user_agent': row['user_agent'],
                    'created_at': row['created_at']
                }
                for row in rows
            ]
    
    async def cleanup_expired_assignments(self) -> int:
        """Clean up expired role assignments"""
        async with self.db_pool.acquire() as conn:
            result = await conn.execute("""
                UPDATE role_assignments 
                SET is_active = false 
                WHERE expires_at IS NOT NULL AND expires_at <= NOW() AND is_active = true
            """)
            
            return int(result.split()[-1])  # Return number of updated rows
    
    async def get_available_roles(self) -> List[RoleDefinition]:
        """Get all available roles in the system"""
        return list(self._role_definitions.values())
    
    async def get_role_permissions(self, role_type: RoleType) -> Set[PermissionType]:
        """Get permissions for a specific role"""
        return self._role_permissions.get(role_type, set())
    
    async def create_custom_role(
        self,
        name: str,
        description: str,
        permissions: Set[PermissionType],
        created_by: UUID
    ) -> RoleDefinition:
        """Create a custom role (for future enhancement)"""
        # This would involve database storage for custom roles
        # For now, return a role definition that can be stored
        role_type = RoleType.CUSTOM  # Would need to extend RoleType enum
        
        return RoleDefinition(
            role_type=role_type,
            name=name,
            description=description,
            permissions=permissions,
            is_system_role=False
        )


# Create singleton instance
_rbac_service = None

def get_rbac_service() -> RBACService:
    """Get RBAC service singleton"""
    global _rbac_service
    if _rbac_service is None:
        _rbac_service = RBACService()
    return _rbac_service
