"""
OptiBid Energy Platform - User CRUD Operations
CRUD operations for User model
"""

from typing import Any, Dict, List, Optional, Union
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from fastapi import HTTPException, status

from app.models import User
from app.schemas import UserCreate, UserUpdate, UserResponse
from app.core.password import verify_password, get_password_hash
from app.crud.base import CRUDBase

class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    """CRUD operations for User"""
    
    def __init__(self):
        super().__init__(User)
    
    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[User]:
        """Get user by email"""
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
    
    async def authenticate(self, db: AsyncSession, *, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = await self.get_by_email(db, email=email)
        if not user:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
        
        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is not active"
            )
        
        return user
    
    async def create(self, db: AsyncSession, *, obj_in: UserCreate, user_id: Optional[str] = None) -> User:
        """Create new user"""
        # Check if user already exists
        existing_user = await self.get_by_email(db, email=obj_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Hash password
        obj_in_data = obj_in.dict()
        obj_in_data["password_hash"] = get_password_hash(obj_in.password)
        
        # Remove password field from data
        obj_in_data.pop("password", None)
        
        return await super().create(db, obj_in=UserCreate(**obj_in_data), user_id=user_id)
    
    async def update_password(
        self, 
        db: AsyncSession, 
        *, 
        db_obj: User, 
        current_password: str, 
        new_password: str
    ) -> User:
        """Update user password with current password verification"""
        # Verify current password
        if not verify_password(current_password, db_obj.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Hash new password
        db_obj.password_hash = get_password_hash(new_password)
        
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def reset_password(self, db: AsyncSession, *, user_id: UUID, new_password: str) -> User:
        """Reset user password (admin operation)"""
        db_obj = await self.get(db, id=user_id)
        if not db_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        db_obj.password_hash = get_password_hash(new_password)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def get_multi_by_organization(
        self,
        db: AsyncSession,
        *,
        organization_id: UUID,
        skip: int = 0,
        limit: int = 100,
        role: Optional[str] = None,
        status: Optional[str] = None,
        include_inactive: bool = False
    ) -> List[User]:
        """Get users by organization with filtering"""
        filters = {"organization_id": organization_id}
        
        if role:
            filters["role"] = role
        
        if not include_inactive:
            filters["deleted_at"] = None
        
        if status:
            filters["status"] = status
        
        return await self.get_multi(db, skip=skip, limit=limit, filters=filters)
    
    async def count_by_organization(
        self,
        db: AsyncSession,
        *,
        organization_id: UUID,
        role: Optional[str] = None,
        status: Optional[str] = None,
        include_inactive: bool = False
    ) -> int:
        """Count users by organization with filtering"""
        filters = {"organization_id": organization_id}
        
        if role:
            filters["role"] = role
        
        if not include_inactive:
            filters["deleted_at"] = None
        
        if status:
            filters["status"] = status
        
        return await self.count(db, filters=filters)
    
    async def update_last_login(
        self,
        db: AsyncSession,
        *,
        user_id: UUID,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> User:
        """Update user's last login information"""
        db_obj = await self.get(db, id=user_id)
        if not db_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        db_obj.last_login_at = func.now()
        db_obj.login_count = User.login_count + 1
        
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def verify_email(self, db: AsyncSession, *, user_id: UUID) -> User:
        """Verify user email"""
        db_obj = await self.get(db, id=user_id)
        if not db_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        db_obj.email_verified = True
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def deactivate(self, db: AsyncSession, *, user_id: UUID) -> User:
        """Deactivate user (soft delete)"""
        return await self.delete(db, id=user_id)
    
    async def activate(self, db: AsyncSession, *, user_id: UUID) -> User:
        """Activate user"""
        db_obj = await self.get(db, id=user_id)
        if not db_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        db_obj.status = "active"
        db_obj.deleted_at = None
        
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def search_users(
        self,
        db: AsyncSession,
        *,
        search_term: str,
        organization_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[User]:
        """Search users by name or email"""
        search_fields = ["first_name", "last_name", "email"]
        filters = {}
        
        if organization_id:
            filters["organization_id"] = organization_id
        
        return await self.search(
            db,
            search_term=search_term,
            search_fields=search_fields,
            skip=skip,
            limit=limit,
            filters=filters
        )
    
    async def get_user_statistics(self, db: AsyncSession, *, organization_id: UUID) -> Dict[str, Any]:
        """Get user statistics for organization"""
        # Total users
        total_users = await self.count_by_organization(db, organization_id=organization_id)
        
        # Active users
        active_users = await self.count_by_organization(
            db, 
            organization_id=organization_id, 
            status="active"
        )
        
        # Users by role
        role_stats = {}
        for role in ["admin", "analyst", "trader", "viewer", "customer_success"]:
            count = await self.count_by_organization(
                db,
                organization_id=organization_id,
                role=role
            )
            role_stats[role] = count
        
        # Users by status
        status_stats = {}
        for status_val in ["active", "inactive", "suspended", "pending_verification"]:
            count = await self.count_by_organization(
                db,
                organization_id=organization_id,
                status=status_val
            )
            status_stats[status_val] = count
        
        # Recent signups (last 30 days)
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        recent_signups_result = await db.execute(
            select(func.count(User.id)).where(
                and_(
                    User.organization_id == organization_id,
                    User.created_at >= thirty_days_ago
                )
            )
        )
        recent_signups = recent_signups_result.scalar()
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": total_users - active_users,
            "role_distribution": role_stats,
            "status_distribution": status_stats,
            "recent_signups_30_days": recent_signups
        }
    
    async def transfer_to_organization(
        self,
        db: AsyncSession,
        *,
        user_id: UUID,
        target_organization_id: UUID
    ) -> User:
        """Transfer user to different organization"""
        db_obj = await self.get(db, id=user_id)
        if not db_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        db_obj.organization_id = target_organization_id
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def bulk_update_role(
        self,
        db: AsyncSession,
        *,
        user_ids: List[UUID],
        role: str,
        admin_user_id: UUID
    ) -> int:
        """Bulk update user roles"""
        from app.crud.base import apply_filters
        
        query = select(User).where(User.id.in_(user_ids))
        query = apply_filters(query, User, {"organization_id": User.organization_id})
        
        result = await db.execute(
            update(User).where(User.id.in_(user_ids)).values(role=role)
        )
        await db.commit()
        return result.rowcount
    
    async def check_email_availability(self, db: AsyncSession, *, email: str) -> bool:
        """Check if email is available for registration"""
        existing_user = await self.get_by_email(db, email=email)
        return existing_user is None
    
    async def get_users_with_expired_sessions(self, db: AsyncSession) -> List[User]:
        """Get users with expired sessions (for cleanup)"""
        from datetime import datetime, timedelta
        
        # This would typically involve joining with session table
        # For now, return users who haven't logged in recently
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        result = await db.execute(
            select(User).where(
                or_(
                    User.last_login_at < thirty_days_ago,
                    User.last_login_at.is_(None)
                )
            ).limit(100)
        )
        return result.scalars().all()
    
    async def get_user_permissions(self, user: User) -> List[str]:
        """Get user permissions based on role"""
        permissions = {
            "admin": [
                "*"  # All permissions
            ],
            "analyst": [
                "assets:read", "assets:write",
                "bids:read", "bids:write", "bids:submit",
                "market_data:read", "market_data:export",
                "datasets:read", "datasets:write", "datasets:manage",
                "dashboards:read", "dashboards:write", "dashboards:create",
                "ml_models:read", "ml_models:write", "ml_models:train",
                "compliance:read", "compliance:write",
                "users:read", "billing:read"
            ],
            "trader": [
                "assets:read",
                "bids:read", "bids:write", "bids:submit",
                "market_data:read", "market_data:export",
                "dashboards:read", "dashboards:create",
                "compliance:read"
            ],
            "viewer": [
                "assets:read",
                "bids:read",
                "market_data:read",
                "dashboards:read"
            ],
            "customer_success": [
                "users:read", "users:write", "users:create",
                "organizations:read", "organizations:write",
                "billing:read", "billing:write",
                "compliance:read",
                "dashboards:read"
            ]
        }
        
        return permissions.get(user.role, [])

# Create singleton instance
user_crud = CRUDUser()
