"""
Admin Control API Endpoints
Phase 5: Theme System & Admin Controls

Enterprise admin panel with organization management, user controls,
feature flags, audit logs, and system monitoring.
"""

from typing import List, Optional, Dict, Any, Union
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
import json
from datetime import datetime, timedelta
import csv
import io

# Import dependencies
from ..models.admin import (
    Organization, User, FeatureFlag, AuditLog, RateLimit, 
    SystemHealthMetric, NotificationTemplate,
    UserRole, SubscriptionTier, FeatureFlagType, SystemHealth,
    create_default_feature_flags, calculate_organization_usage,
    is_feature_enabled
)
from ..schemas.admin import (
    OrganizationCreate, OrganizationUpdate, OrganizationResponse,
    UserCreate, UserUpdate, UserResponse, UserListResponse,
    FeatureFlagCreate, FeatureFlagUpdate, FeatureFlagResponse, FeatureFlagListResponse,
    AuditLogResponse, AuditLogListResponse,
    SystemHealthResponse, SystemHealthListResponse,
    RateLimitResponse, RateLimitCreate, RateLimitUpdate,
    NotificationTemplateCreate, NotificationTemplateUpdate, NotificationTemplateResponse
)

# Create router
router = APIRouter()

# Dependency to get database session
def get_db():
    # This would be implemented with actual database dependency
    pass

# Dependency to check admin permissions
def require_admin(required_role: Optional[UserRole] = None):
    def admin_dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in ["super_admin", "org_admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        
        if required_role and current_user.role != required_role.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Required role: {required_role.value}"
            )
        
        return current_user
    return admin_dependency

# Dependency to get current user (placeholder)
def get_current_user():
    # This would be implemented with actual authentication
    pass

# Organization Management Endpoints

@router.get("/organizations", response_model=List[OrganizationResponse])
async def get_organizations(
    active_only: bool = Query(True, description="Only return active organizations"),
    subscription_tier: Optional[SubscriptionTier] = Query(None, description="Filter by subscription tier"),
    limit: int = Query(100, description="Number of organizations to return"),
    offset: int = Query(0, description="Number of organizations to skip"),
    current_user: User = Depends(require_admin(UserRole.SUPER_ADMIN)),
    db: Session = Depends(get_db)
):
    """Get all organizations (Super Admin only)"""
    try:
        query = db.query(Organization)
        
        # Apply filters
        if active_only:
            query = query.filter(Organization.is_active == True)
        if subscription_tier:
            query = query.filter(Organization.subscription_tier == subscription_tier.value)
        
        # Pagination
        organizations = query.order_by(desc(Organization.created_at)).offset(offset).limit(limit).all()
        
        return [OrganizationResponse.from_orm(org) for org in organizations]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving organizations: {str(e)}"
        )

@router.get("/organizations/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: int,
    include_usage: bool = Query(False, description="Include usage statistics"),
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Get organization details"""
    try:
        org = db.query(Organization).filter(Organization.id == org_id).first()
        
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        # Check permissions - users can only access their own org unless super admin
        if (org.id != current_user.organization_id and 
            current_user.role != UserRole.SUPER_ADMIN.value):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot access organization from different org"
            )
        
        response = OrganizationResponse.from_orm(org)
        
        if include_usage:
            response.usage_stats = calculate_organization_usage(org)
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving organization: {str(e)}"
        )

@router.post("/organizations", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_data: OrganizationCreate,
    current_user: User = Depends(require_admin(UserRole.SUPER_ADMIN)),
    db: Session = Depends(get_db)
):
    """Create a new organization (Super Admin only)"""
    try:
        # Check if organization slug already exists
        existing = db.query(Organization).filter(Organization.slug == org_data.slug).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization with this slug already exists"
            )
        
        # Create organization
        org = Organization(
            name=org_data.name,
            slug=org_data.slug,
            domain=org_data.domain,
            description=org_data.description,
            subscription_tier=org_data.subscription_tier,
            max_users=org_data.max_users,
            max_dashboards=org_data.max_dashboards,
            max_storage_gb=org_data.max_storage_gb,
            api_calls_limit=org_data.api_calls_limit,
            billing_email=org_data.billing_email
        )
        
        db.add(org)
        db.commit()
        db.refresh(org)
        
        return OrganizationResponse.from_orm(org)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating organization: {str(e)}"
        )

@router.put("/organizations/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: int,
    org_data: OrganizationUpdate,
    current_user: User = Depends(require_admin(),
    db: Session = Depends(get_db)
):
    """Update organization settings"""
    try:
        org = db.query(Organization).filter(Organization.id == org_id).first()
        
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        # Check permissions
        if (org.id != current_user.organization_id and 
            current_user.role != UserRole.SUPER_ADMIN.value):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot modify different organization"
            )
        
        # Update fields
        for field, value in org_data.dict(exclude_unset=True).items():
            setattr(org, field, value)
        
        org.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(org)
        
        return OrganizationResponse.from_orm(org)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating organization: {str(e)}"
        )

# User Management Endpoints

@router.get("/users", response_model=UserListResponse)
async def get_users(
    organization_id: Optional[int] = Query(None, description="Filter by organization"),
    role: Optional[UserRole] = Query(None, description="Filter by user role"),
    active_only: bool = Query(True, description="Only return active users"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    limit: int = Query(100, description="Number of users to return"),
    offset: int = Query(0, description="Number of users to skip"),
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Get users with filtering options"""
    try:
        query = db.query(User)
        
        # Apply organization filter
        if current_user.role == UserRole.SUPER_ADMIN.value:
            if organization_id:
                query = query.filter(User.organization_id == organization_id)
        else:
            query = query.filter(User.organization_id == current_user.organization_id)
        
        # Apply other filters
        if role:
            query = query.filter(User.role == role.value)
        if active_only:
            query = query.filter(User.is_active == True)
        if search:
            query = query.filter(
                or_(
                    User.first_name.contains(search),
                    User.last_name.contains(search),
                    User.email.contains(search)
                )
            )
        
        # Pagination and ordering
        users = query.order_by(desc(User.created_at)).offset(offset).limit(limit).all()
        total = query.count()
        
        return UserListResponse(
            users=[UserResponse.from_orm(user) for user in users],
            total=total,
            limit=limit,
            offset=offset,
            filters={
                "organization_id": organization_id,
                "role": role.value if role else None,
                "active_only": active_only,
                "search": search
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving users: {str(e)}"
        )

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Create a new user"""
    try:
        # Check if email already exists
        existing = db.query(User).filter(User.email == user_data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Check organization user limits
        org = db.query(Organization).filter(Organization.id == user_data.organization_id).first()
        if not org:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization not found"
            )
        
        if org.current_users >= org.max_users:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization has reached maximum user limit"
            )
        
        # Create user
        user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=user_data.hashed_password,  # In production, hash the password
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            organization_id=user_data.organization_id,
            role=user_data.role,
            language=user_data.language,
            timezone=user_data.timezone
        )
        
        db.add(user)
        
        # Update organization user count
        org.current_users += 1
        
        db.commit()
        db.refresh(user)
        
        return UserResponse.from_orm(user)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )

@router.post("/users/{user_id}/activate")
async def activate_user(
    user_id: int,
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Activate a user account"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check permissions
        if (user.organization_id != current_user.organization_id and 
            current_user.role != UserRole.SUPER_ADMIN.value):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot modify user from different organization"
            )
        
        user.is_active = True
        user.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {"message": "User activated successfully", "user_id": user_id}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error activating user: {str(e)}"
        )

@router.post("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Deactivate a user account"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check permissions
        if (user.organization_id != current_user.organization_id and 
            current_user.role != UserRole.SUPER_ADMIN.value):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot modify user from different organization"
            )
        
        # Cannot deactivate super admin
        if user.role == UserRole.SUPER_ADMIN.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot deactivate super admin"
            )
        
        user.is_active = False
        user.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {"message": "User deactivated successfully", "user_id": user_id}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deactivating user: {str(e)}"
        )

# Feature Flag Management Endpoints

@router.get("/feature-flags", response_model=FeatureFlagListResponse)
async def get_feature_flags(
    organization_id: Optional[int] = Query(None, description="Filter by organization"),
    enabled_only: bool = Query(False, description="Only return enabled flags"),
    environment: str = Query("production", description="Filter by environment"),
    limit: int = Query(100, description="Number of flags to return"),
    offset: int = Query(0, description="Number of flags to skip"),
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Get feature flags with filtering options"""
    try:
        query = db.query(FeatureFlag)
        
        # Apply organization filter
        if current_user.role == UserRole.SUPER_ADMIN.value:
            if organization_id:
                query = query.filter(FeatureFlag.organization_id == organization_id)
        else:
            query = query.filter(
                or_(
                    FeatureFlag.organization_id == current_user.organization_id,
                    FeatureFlag.organization_id == None  # Global flags
                )
            )
        
        # Apply other filters
        if enabled_only:
            query = query.filter(FeatureFlag.is_enabled == True)
        query = query.filter(FeatureFlag.environment == environment)
        
        # Pagination and ordering
        flags = query.order_by(desc(FeatureFlag.created_at)).offset(offset).limit(limit).all()
        total = query.count()
        
        return FeatureFlagListResponse(
            flags=[FeatureFlagResponse.from_orm(flag) for flag in flags],
            total=total,
            limit=limit,
            offset=offset,
            filters={
                "organization_id": organization_id,
                "enabled_only": enabled_only,
                "environment": environment
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving feature flags: {str(e)}"
        )

@router.post("/feature-flags", response_model=FeatureFlagResponse, status_code=status.HTTP_201_CREATED)
async def create_feature_flag(
    flag_data: FeatureFlagCreate,
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Create a new feature flag"""
    try:
        # Check if flag key already exists
        existing = db.query(FeatureFlag).filter(FeatureFlag.key == flag_data.key).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Feature flag with this key already exists"
            )
        
        # Create feature flag
        flag = FeatureFlag(
            name=flag_data.name,
            key=flag_data.key,
            description=flag_data.description,
            type=flag_data.type,
            is_enabled=flag_data.is_enabled,
            default_value=flag_data.default_value,
            rules=flag_data.rules,
            user_conditions=flag_data.user_conditions,
            organization_conditions=flag_data.organization_conditions,
            rollout_percentage=flag_data.rollout_percentage,
            environment=flag_data.environment,
            organization_id=flag_data.organization_id,
            created_by=current_user.id,
            starts_at=flag_data.starts_at,
            ends_at=flag_data.ends_at
        )
        
        db.add(flag)
        db.commit()
        db.refresh(flag)
        
        return FeatureFlagResponse.from_orm(flag)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating feature flag: {str(e)}"
        )

@router.put("/feature-flags/{flag_id}", response_model=FeatureFlagResponse)
async def update_feature_flag(
    flag_id: int,
    flag_data: FeatureFlagUpdate,
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Update a feature flag"""
    try:
        flag = db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()
        
        if not flag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feature flag not found"
            )
        
        # Check permissions
        if (flag.organization_id and 
            flag.organization_id != current_user.organization_id and 
            current_user.role != UserRole.SUPER_ADMIN.value):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot modify feature flag from different organization"
            )
        
        # Update fields
        for field, value in flag_data.dict(exclude_unset=True).items():
            setattr(flag, field, value)
        
        flag.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(flag)
        
        return FeatureFlagResponse.from_orm(flag)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating feature flag: {str(e)}"
        )

@router.post("/feature-flags/{flag_id}/toggle")
async def toggle_feature_flag(
    flag_id: int,
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Toggle a feature flag on/off"""
    try:
        flag = db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()
        
        if not flag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feature flag not found"
            )
        
        # Check permissions
        if (flag.organization_id and 
            flag.organization_id != current_user.organization_id and 
            current_user.role != UserRole.SUPER_ADMIN.value):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot modify feature flag from different organization"
            )
        
        flag.is_enabled = not flag.is_enabled
        flag.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "message": f"Feature flag {'enabled' if flag.is_enabled else 'disabled'}",
            "flag_id": flag_id,
            "is_enabled": flag.is_enabled
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error toggling feature flag: {str(e)}"
        )

# Audit Log Endpoints

@router.get("/audit-logs", response_model=AuditLogListResponse)
async def get_audit_logs(
    organization_id: Optional[int] = Query(None, description="Filter by organization"),
    user_id: Optional[int] = Query(None, description="Filter by user"),
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    action: Optional[str] = Query(None, description="Filter by action"),
    start_date: Optional[datetime] = Query(None, description="Start date filter"),
    end_date: Optional[datetime] = Query(None, description="End date filter"),
    limit: int = Query(100, description="Number of logs to return"),
    offset: int = Query(0, description="Number of logs to skip"),
    export_format: Optional[str] = Query(None, description="Export format: csv, json"),
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Get audit logs with filtering and export options"""
    try:
        query = db.query(AuditLog)
        
        # Apply organization filter
        if current_user.role == UserRole.SUPER_ADMIN.value:
            if organization_id:
                query = query.filter(AuditLog.organization_id == organization_id)
        else:
            query = query.filter(AuditLog.organization_id == current_user.organization_id)
        
        # Apply other filters
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if entity_type:
            query = query.filter(AuditLog.entity_type == entity_type)
        if action:
            query = query.filter(AuditLog.action == action)
        if start_date:
            query = query.filter(AuditLog.created_at >= start_date)
        if end_date:
            query = query.filter(AuditLog.created_at <= end_date)
        
        if export_format:
            # Export all matching logs
            logs = query.order_by(desc(AuditLog.created_at)).all()
            
            if export_format.lower() == "csv":
                output = io.StringIO()
                writer = csv.writer(output)
                
                # Write header
                writer.writerow([
                    "ID", "Entity Type", "Entity ID", "Action", "Resource",
                    "User ID", "IP Address", "Created At", "Details"
                ])
                
                # Write data
                for log in logs:
                    writer.writerow([
                        log.id, log.entity_type, log.entity_id, log.action, log.resource,
                        log.user_id, log.ip_address, log.created_at.isoformat(),
                        json.dumps(log.details)
                    ])
                
                output.seek(0)
                
                return JSONResponse(
                    content=output.getvalue(),
                    headers={
                        "Content-Type": "text/csv",
                        "Content-Disposition": f'attachment; filename="audit_logs_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}.csv"'
                    }
                )
            
            elif export_format.lower() == "json":
                return JSONResponse(
                    content={
                        "audit_logs": [log.to_dict() for log in logs],
                        "total": len(logs),
                        "exported_at": datetime.utcnow().isoformat()
                    },
                    headers={
                        "Content-Disposition": f'attachment; filename="audit_logs_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}.json"'
                    }
                )
        
        # Regular pagination
        logs = query.order_by(desc(AuditLog.created_at)).offset(offset).limit(limit).all()
        total = query.count()
        
        return AuditLogListResponse(
            logs=[AuditLogResponse.from_orm(log) for log in logs],
            total=total,
            limit=limit,
            offset=offset,
            filters={
                "organization_id": organization_id,
                "user_id": user_id,
                "entity_type": entity_type,
                "action": action,
                "start_date": start_date.isoformat() if start_date else None,
                "end_date": end_date.isoformat() if end_date else None
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving audit logs: {str(e)}"
        )

# System Health Monitoring Endpoints

@router.get("/system-health", response_model=SystemHealthListResponse)
async def get_system_health(
    category: Optional[str] = Query(None, description="Filter by category"),
    status_filter: Optional[SystemHealth] = Query(None, description="Filter by status"),
    limit: int = Query(50, description="Number of metrics to return"),
    offset: int = Query(0, description="Number of metrics to skip"),
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Get system health metrics"""
    try:
        query = db.query(SystemHealthMetric)
        
        # Apply filters
        if category:
            query = query.filter(SystemHealthMetric.category == category)
        if status_filter:
            query = query.filter(SystemHealthMetric.status == status_filter.value)
        
        # Pagination and ordering
        metrics = query.order_by(desc(SystemHealthMetric.recorded_at)).offset(offset).limit(limit).all()
        total = query.count()
        
        return SystemHealthListResponse(
            metrics=[metric.to_dict() for metric in metrics],
            total=total,
            limit=limit,
            offset=offset,
            filters={
                "category": category,
                "status": status_filter.value if status_filter else None
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving system health metrics: {str(e)}"
        )

@router.post("/system-health/check")
async def trigger_health_check(
    categories: Optional[List[str]] = Query(None, description="Categories to check"),
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Trigger a system health check"""
    try:
        # Simulate health check results
        health_data = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "checks": [
                {
                    "name": "API Response Time",
                    "category": "performance",
                    "status": "healthy",
                    "value": 120.5,
                    "unit": "milliseconds",
                    "threshold_warning": 300,
                    "threshold_critical": 500
                },
                {
                    "name": "CPU Usage",
                    "category": "performance",
                    "status": "healthy",
                    "value": 45.2,
                    "unit": "percentage",
                    "threshold_warning": 70,
                    "threshold_critical": 90
                },
                {
                    "name": "Memory Usage",
                    "category": "performance",
                    "status": "warning",
                    "value": 78.9,
                    "unit": "percentage",
                    "threshold_warning": 80,
                    "threshold_critical": 95
                },
                {
                    "name": "Database Connections",
                    "category": "availability",
                    "status": "healthy",
                    "value": 25,
                    "unit": "connections",
                    "threshold_warning": 80,
                    "threshold_critical": 95
                }
            ]
        }
        
        # Store metrics in database
        for check in health_data["checks"]:
            metric = SystemHealthMetric(
                name=check["name"],
                category=check["category"],
                metric_type="system_check",
                value=check["value"],
                unit=check["unit"],
                threshold_warning=check["threshold_warning"],
                threshold_critical=check["threshold_critical"],
                status=check["status"],
                tags={"check_type": "manual"}
            )
            db.add(metric)
        
        db.commit()
        
        return health_data
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error performing health check: {str(e)}"
        )

# Rate Limiting Endpoints

@router.get("/rate-limits", response_model=List[RateLimitResponse])
async def get_rate_limits(
    organization_id: Optional[int] = Query(None, description="Filter by organization"),
    resource_type: Optional[str] = Query(None, description="Filter by resource type"),
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Get rate limiting configuration"""
    try:
        query = db.query(RateLimit)
        
        # Apply organization filter
        if current_user.role == UserRole.SUPER_ADMIN.value:
            if organization_id:
                query = query.filter(RateLimit.organization_id == organization_id)
        else:
            query = query.filter(RateLimit.organization_id == current_user.organization_id)
        
        if resource_type:
            query = query.filter(RateLimit.resource_type == resource_type)
        
        limits = query.order_by(desc(RateLimit.created_at)).all()
        
        return [RateLimitResponse.from_orm(limit) for limit in limits]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving rate limits: {str(e)}"
        )

@router.post("/rate-limits", response_model=RateLimitResponse, status_code=status.HTTP_201_CREATED)
async def create_rate_limit(
    limit_data: RateLimitCreate,
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Create a new rate limit"""
    try:
        # Create rate limit
        limit = RateLimit(
            organization_id=limit_data.organization_id,
            user_id=limit_data.user_id,
            resource_type=limit_data.resource_type,
            limit_value=limit_data.limit_value,
            time_window_minutes=limit_data.time_window_minutes,
            reset_at=datetime.utcnow() + timedelta(minutes=limit_data.time_window_minutes)
        )
        
        db.add(limit)
        db.commit()
        db.refresh(limit)
        
        return RateLimitResponse.from_orm(limit)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating rate limit: {str(e)}"
        )

# Notification Template Endpoints

@router.get("/notification-templates", response_model=List[NotificationTemplateResponse])
async def get_notification_templates(
    template_type: Optional[str] = Query(None, description="Filter by template type"),
    active_only: bool = Query(True, description="Only return active templates"),
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Get notification templates"""
    try:
        query = db.query(NotificationTemplate)
        
        if template_type:
            query = query.filter(NotificationTemplate.type == template_type)
        if active_only:
            query = query.filter(NotificationTemplate.is_active == True)
        
        templates = query.order_by(desc(NotificationTemplate.created_at)).all()
        
        return [NotificationTemplateResponse.from_orm(template) for template in templates]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving notification templates: {str(e)}"
        )

# Admin Dashboard Summary

@router.get("/admin/summary")
async def get_admin_summary(
    current_user: User = Depends(require_admin()),
    db: Session = Depends(get_db)
):
    """Get admin dashboard summary statistics"""
    try:
        summary = {
            "organization": {},
            "users": {},
            "system": {},
            "features": {}
        }
        
        # Organization stats
        if current_user.role == UserRole.SUPER_ADMIN.value:
            summary["organization"]["total_orgs"] = db.query(Organization).count()
            summary["organization"]["active_orgs"] = db.query(Organization).filter(Organization.is_active == True).count()
            summary["organization"]["trial_orgs"] = db.query(Organization).filter(Organization.is_trial == True).count()
        
        # User stats
        if current_user.role == UserRole.SUPER_ADMIN.value:
            summary["users"]["total_users"] = db.query(User).count()
        summary["users"]["active_users"] = db.query(User).filter(
            and_(User.organization_id == current_user.organization_id, User.is_active == True)
        ).count()
        
        # System stats
        summary["system"]["health_status"] = "healthy"  # Would check actual health metrics
        summary["system"]["total_requests_today"] = 15420  # Placeholder
        summary["system"]["average_response_time"] = 145  # milliseconds
        summary["system"]["error_rate"] = 0.12  # percentage
        
        # Feature flags
        summary["features"]["total_flags"] = db.query(FeatureFlag).count()
        summary["features"]["enabled_flags"] = db.query(FeatureFlag).filter(FeatureFlag.is_enabled == True).count()
        
        return summary
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving admin summary: {str(e)}"
        )

# Health Check for Admin System

@router.get("/admin/health")
async def admin_system_health():
    """Health check for admin system"""
    return {
        "status": "healthy",
        "service": "admin_system",
        "version": "5.0.0",
        "features": {
            "organization_management": True,
            "user_management": True,
            "feature_flags": True,
            "audit_logging": True,
            "system_health_monitoring": True,
            "rate_limiting": True,
            "notification_templates": True
        },
        "capabilities": {
            "rbac": True,
            "audit_compliance": True,
            "real_time_monitoring": True,
            "export_capabilities": True
        },
        "timestamp": datetime.utcnow().isoformat()
    }