"""
OptiBid Energy Platform - Organization CRUD Operations
CRUD operations for Organization model
"""

from typing import Any, Dict, List, Optional, Union
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, text
from fastapi import HTTPException, status

from app.models import Organization
from app.schemas import OrganizationCreate, OrganizationUpdate
from app.crud.base import CRUDBase
from app.core.password import get_password_hash

class CRUDOrganization(CRUDBase[Organization, OrganizationCreate, OrganizationUpdate]):
    """CRUD operations for Organization"""
    
    def __init__(self):
        super().__init__(Organization)
    
    async def get_by_slug(self, db: AsyncSession, *, slug: str) -> Optional[Organization]:
        """Get organization by slug"""
        result = await db.execute(select(Organization).where(Organization.slug == slug))
        return result.scalar_one_or_none()
    
    async def create_with_admin(
        self, 
        db: AsyncSession, 
        *, 
        obj_in: OrganizationCreate,
        admin_password_hash: str
    ) -> Organization:
        """Create organization with admin user"""
        # Check if slug is unique
        existing_org = await self.get_by_slug(db, slug=obj_in.slug)
        if existing_org:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization with this slug already exists"
            )
        
        # Create organization
        org_data = obj_in.dict()
        org_data["status"] = "trial"  # Default status
        org_data["subscription_tier"] = "trial"
        
        org = await self.create(db, obj_in=OrganizationCreate(**org_data))
        
        # Create admin user in a transaction
        from app.models import User
        admin_user = User(
            organization_id=org.id,
            email=obj_in.admin_email,
            password_hash=admin_password_hash,
            first_name=obj_in.admin_first_name,
            last_name=obj_in.admin_last_name,
            role="admin",
            status="active",
            email_verified=True
        )
        db.add(admin_user)
        await db.commit()
        await db.refresh(admin_user)
        
        return org
    
    async def update_subscription(
        self,
        db: AsyncSession,
        *,
        organization_id: UUID,
        subscription_tier: str,
        expires_at: Optional[datetime] = None
    ) -> Organization:
        """Update organization subscription"""
        db_obj = await self.get(db, id=organization_id)
        if not db_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        db_obj.subscription_tier = subscription_tier
        if expires_at:
            db_obj.subscription_expires_at = expires_at
        
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def get_organization_users_count(self, db: AsyncSession, *, organization_id: UUID) -> int:
        """Get user count for organization"""
        from app.models import User
        
        result = await db.execute(
            select(func.count(User.id)).where(
                and_(
                    User.organization_id == organization_id,
                    User.deleted_at.is_(None)
                )
            )
        )
        return result.scalar()
    
    async def get_organization_assets_count(self, db: AsyncSession, *, organization_id: UUID) -> int:
        """Get asset count for organization"""
        from app.models.asset import Asset
        
        result = await db.execute(
            select(func.count(Asset.id)).where(
                Asset.organization_id == organization_id
            )
        )
        return result.scalar()
    
    async def get_organization_stats(self, db: AsyncSession, *, organization_id: UUID) -> Dict[str, Any]:
        """Get comprehensive organization statistics"""
        # Basic counts
        users_count = await self.get_organization_users_count(db, organization_id=organization_id)
        assets_count = await self.get_organization_assets_count(db, organization_id=organization_id)
        
        # Active assets
        from app.models.asset import Asset
        result = await db.execute(
            select(func.count(Asset.id)).where(
                and_(
                    Asset.organization_id == organization_id,
                    Asset.status == "online"
                )
            )
        )
        active_assets_count = result.scalar()
        
        # Total capacity
        result = await db.execute(
            select(func.sum(Asset.capacity_mw)).where(
                Asset.organization_id == organization_id
            )
        )
        total_capacity = result.scalar() or 0
        
        # Recent bids
        from app.models.bid import Bid
        from datetime import datetime, timedelta
        
        last_30_days = datetime.utcnow() - timedelta(days=30)
        result = await db.execute(
            select(func.count(Bid.id)).where(
                and_(
                    Bid.organization_id == organization_id,
                    Bid.created_at >= last_30_days
                )
            )
        )
        recent_bids_count = result.scalar()
        
        # Total bids
        result = await db.execute(
            select(func.count(Bid.id)).where(
                Bid.organization_id == organization_id
            )
        )
        total_bids_count = result.scalar()
        
        # Accepted bids percentage
        if total_bids_count > 0:
            result = await db.execute(
                select(func.count(Bid.id)).where(
                    and_(
                        Bid.organization_id == organization_id,
                        Bid.status == "accepted"
                    )
                )
            )
            accepted_bids = result.scalar()
            accepted_bids_percentage = (accepted_bids / total_bids_count) * 100
        else:
            accepted_bids_percentage = 0
        
        # Dashboards count
        from app.models.dashboard import Dashboard
        result = await db.execute(
            select(func.count(Dashboard.id)).where(
                Dashboard.organization_id == organization_id
            )
        )
        dashboards_count = result.scalar()
        
        # Active users (logged in last 30 days)
        result = await db.execute(
            select(func.count(User.id)).where(
                and_(
                    User.organization_id == organization_id,
                    User.last_login_at >= last_30_days,
                    User.deleted_at.is_(None)
                )
            )
        )
        active_users_30d = result.scalar()
        
        return {
            "users_count": users_count,
            "active_users_30d": active_users_30d,
            "assets_count": assets_count,
            "active_assets_count": active_assets_count,
            "total_capacity_mw": float(total_capacity),
            "total_bids": total_bids_count,
            "recent_bids_30d": recent_bids_count,
            "accepted_bids_percentage": round(accepted_bids_percentage, 2),
            "dashboards_count": dashboards_count
        }
    
    async def search_organizations(
        self,
        db: AsyncSession,
        *,
        search_term: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Organization]:
        """Search organizations by name"""
        return await self.search(
            db,
            search_term=search_term,
            search_fields=["name", "slug"],
            skip=skip,
            limit=limit
        )
    
    async def get_active_organizations(self, db: AsyncSession) -> List[Organization]:
        """Get all active organizations"""
        return await self.get_multi(db, filters={"status": "active"})
    
    async def get_trial_organizations(self, db: AsyncSession) -> List[Organization]:
        """Get trial organizations that might need conversion"""
        return await self.get_multi(db, filters={"status": "trial"})
    
    async def get_organizations_by_subscription(self, db: AsyncSession, *, tier: str) -> List[Organization]:
        """Get organizations by subscription tier"""
        return await self.get_multi(db, filters={"subscription_tier": tier})
    
    async def check_subscription_limits(
        self,
        db: AsyncSession,
        *,
        organization_id: UUID,
        resource_type: str
    ) -> Dict[str, Any]:
        """Check if organization has reached subscription limits"""
        org = await self.get(db, id=organization_id)
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        # Define limits by tier
        limits = {
            "trial": {
                "max_users": 5,
                "max_assets": 10,
                "max_dashboards": 3,
                "data_retention_days": 30
            },
            "basic": {
                "max_users": 25,
                "max_assets": 100,
                "max_dashboards": 10,
                "data_retention_days": 365
            },
            "professional": {
                "max_users": 100,
                "max_assets": 500,
                "max_dashboards": 50,
                "data_retention_days": 1825
            },
            "enterprise": {
                "max_users": -1,  # Unlimited
                "max_assets": -1,  # Unlimited
                "max_dashboards": -1,  # Unlimited
                "data_retention_days": 2555  # 7 years
            }
        }
        
        tier_limits = limits.get(org.subscription_tier, limits["trial"])
        
        # Get current usage
        current_usage = {}
        
        if resource_type == "users":
            current_usage["current"] = await self.get_organization_users_count(db, organization_id=organization_id)
            current_usage["limit"] = tier_limits["max_users"]
            
        elif resource_type == "assets":
            current_usage["current"] = await self.get_organization_assets_count(db, organization_id=organization_id)
            current_usage["limit"] = tier_limits["max_assets"]
            
        elif resource_type == "dashboards":
            from app.models.dashboard import Dashboard
            result = await db.execute(
                select(func.count(Dashboard.id)).where(
                    Dashboard.organization_id == organization_id
                )
            )
            current_usage["current"] = result.scalar()
            current_usage["limit"] = tier_limits["max_dashboards"]
        
        current_usage["within_limit"] = (
            current_usage["limit"] == -1 or 
            current_usage["current"] < current_usage["limit"]
        )
        
        return current_usage
    
    async def deactivate_organization(self, db: AsyncSession, *, organization_id: UUID) -> Organization:
        """Deactivate organization"""
        db_obj = await self.get(db, id=organization_id)
        if not db_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        db_obj.status = "inactive"
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def activate_organization(self, db: AsyncSession, *, organization_id: UUID) -> Organization:
        """Activate organization"""
        db_obj = await self.get(db, id=organization_id)
        if not db_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        db_obj.status = "active"
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def transfer_to_tier(
        self,
        db: AsyncSession,
        *,
        organization_id: UUID,
        new_tier: str
    ) -> Organization:
        """Transfer organization to new subscription tier"""
        db_obj = await self.get(db, id=organization_id)
        if not db_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        # Validate tier
        valid_tiers = ["trial", "basic", "professional", "enterprise"]
        if new_tier not in valid_tiers:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid subscription tier. Valid tiers: {', '.join(valid_tiers)}"
            )
        
        db_obj.subscription_tier = new_tier
        
        # Set expiration date for paid tiers
        if new_tier != "trial":
            from datetime import datetime, timedelta
            db_obj.subscription_expires_at = datetime.utcnow() + timedelta(days=30)  # 30 days
        
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

# Create singleton instance
organization_crud = CRUDOrganization()
