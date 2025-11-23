"""
Admin Router - Admin panel and billing endpoints
Handles organization management, user administration, feature flags, billing, and usage tracking
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from ..core.database import get_db
from ..services.rbac_service import RBACService, RoleType, PermissionType
from ..services.admin_service import AdminService, FeatureFlag, FeatureFlagStatus, SystemHealth, AuditLog, AdminConfig, ThemeConfig
from ..services.billing_service import BillingService, BillingPlan, Subscription, Invoice, UsageRecord
from ..services.usage_tracking_service import UsageTrackingService, QuotaStatus
from ..services.rbac_service import get_rbac_service
from ..services.billing_service import get_billing_service
from ..services.admin_service import get_admin_service
from ..services.usage_tracking_service import get_usage_tracking_service

# Initialize router
admin_router = APIRouter(prefix="/admin", tags=["Admin Panel"])

# Pydantic models for API requests/responses

class CreateFeatureFlagRequest(BaseModel):
    name: str
    description: Optional[str] = None
    status: FeatureFlagStatus
    rollout_percentage: int = Field(default=0, ge=0, le=100)
    target_organizations: List[UUID] = Field(default_factory=list)
    target_users: List[UUID] = Field(default_factory=list)
    environment: str = Field(default="production")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class UpdateFeatureFlagRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[FeatureFlagStatus] = None
    rollout_percentage: Optional[int] = Field(default=None, ge=0, le=100)
    target_organizations: Optional[List[UUID]] = None
    target_users: Optional[List[UUID]] = None
    metadata: Optional[Dict[str, Any]] = None


class CreateSubscriptionRequest(BaseModel):
    plan_id: BillingPlan
    stripe_customer_id: str
    payment_method_id: str
    billing_cycle: str = Field(default="monthly", pattern="^(monthly|yearly)$")
    stripe_email: Optional[str] = None


class RecordUsageRequest(BaseModel):
    usage_type: str
    quantity: int = Field(default=1, gt=0)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class UpdateAdminConfigRequest(BaseModel):
    theme: Optional[ThemeConfig] = None
    allowed_domains: Optional[List[str]] = None
    max_users: Optional[int] = None
    session_timeout_hours: Optional[int] = None
    require_email_verification: Optional[bool] = None
    allow_self_registration: Optional[bool] = None
    maintenance_mode: Optional[bool] = None
    maintenance_message: Optional[str] = None
    custom_css: Optional[str] = None
    custom_js: Optional[str] = None
    api_rate_limit_per_hour: Optional[int] = None


class AuditLogQuery(BaseModel):
    organization_id: Optional[UUID] = None
    resource_type: Optional[str] = None
    action: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    limit: int = Field(default=100, ge=1, le=1000)


class UsageAnalyticsRequest(BaseModel):
    organization_id: UUID
    start_date: datetime
    end_date: datetime


# Dependency injection
async def get_services(
    db=Depends(get_db)
):
    """Get all service instances"""
    # Initialize services (in real implementation, these would be injected)
    rbac_service = RBACService(db)
    await rbac_service.initialize()
    
    billing_service = BillingService(db, rbac_service)
    await billing_service.initialize()
    
    admin_service = AdminService(db, rbac_service, billing_service)
    await admin_service.initialize()
    
    # Note: Redis pool would be injected in real implementation
    # For now, we'll mock it
    from unittest.mock import MagicMock
    redis_pool = MagicMock()
    
    usage_tracking_service = UsageTrackingService(db, redis_pool, billing_service)
    await usage_tracking_service.initialize()
    
    return {
        "rbac_service": rbac_service,
        "billing_service": billing_service,
        "admin_service": admin_service,
        "usage_tracking_service": usage_tracking_service
    }


# Feature Flag Management

@admin_router.get("/feature-flags")
async def get_feature_flags(
    organization_id: Optional[UUID] = None,
    environment: str = "production",
    services: Dict = Depends(get_services),
    request: Request = None
):
    """Get all feature flags (with permission filtering)"""
    services_dict = services
    user_id = UUID("123e4567-e89b-12d3-a456-426614174000")  # Mock user ID
    
    try:
        flags = await services_dict["admin_service"].get_feature_flags(
            organization_id=organization_id,
            user_id=user_id,
            environment=environment
        )
        
        return {
            "success": True,
            "data": [flag.dict() for flag in flags]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@admin_router.post("/feature-flags")
async def create_feature_flag(
    request: CreateFeatureFlagRequest,
    organization_id: Optional[UUID] = None,
    services: Dict = Depends(get_services)
):
    """Create a new feature flag"""
    services_dict = services
    user_id = UUID("123e4567-e89b-12d3-a456-426614174000")  # Mock user ID
    
    try:
        flag = await services_dict["admin_service"].create_feature_flag(
            name=request.name,
            description=request.description,
            status=request.status,
            created_by=user_id,
            organization_id=organization_id,
            rollout_percentage=request.rollout_percentage,
            target_organizations=request.target_organizations,
            target_users=request.target_users,
            environment=request.environment,
            metadata=request.metadata
        )
        
        return {
            "success": True,
            "data": flag.dict(),
            "message": "Feature flag created successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@admin_router.put("/feature-flags/{flag_id}")
async def update_feature_flag(
    flag_id: UUID,
    request: UpdateFeatureFlagRequest,
    organization_id: Optional[UUID] = None,
    services: Dict = Depends(get_services)
):
    """Update an existing feature flag"""
    services_dict = services
    user_id = UUID("123e4567-e89b-12d3-a456-426614174000")  # Mock user ID
    
    try:
        updates = request.dict(exclude_unset=True)
        
        # Convert FeatureFlagStatus to string value if present
        if 'status' in updates and updates['status']:
            updates['status'] = updates['status']
        
        flag = await services_dict["admin_service"].update_feature_flag(
            flag_id=flag_id,
            user_id=user_id,
            organization_id=organization_id,
            **updates
        )
        
        return {
            "success": True,
            "data": flag.dict(),
            "message": "Feature flag updated successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@admin_router.get("/feature-flags/check/{feature_name}")
async def check_feature_enabled(
    feature_name: str,
    organization_id: UUID,
    environment: str = "production",
    services: Dict = Depends(get_services)
):
    """Check if a specific feature is enabled"""
    services_dict = services
    
    try:
        enabled = await services_dict["admin_service"].is_feature_enabled(
            feature_name=feature_name,
            organization_id=organization_id,
            environment=environment
        )
        
        return {
            "success": True,
            "data": {
                "feature_name": feature_name,
                "enabled": enabled,
                "organization_id": organization_id,
                "environment": environment
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# Admin Configuration

@admin_router.get("/config/{organization_id}")
async def get_admin_config(
    organization_id: UUID,
    services: Dict = Depends(get_services)
):
    """Get admin configuration for organization"""
    services_dict = services
    user_id = UUID("123e4567-e89b-12d3-a456-426614174000")  # Mock user ID
    
    try:
        config = await services_dict["admin_service"].get_admin_config(
            organization_id=organization_id,
            user_id=user_id
        )
        
        return {
            "success": True,
            "data": config.dict()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@admin_router.put("/config/{organization_id}")
async def update_admin_config(
    organization_id: UUID,
    request: UpdateAdminConfigRequest,
    services: Dict = Depends(get_services)
):
    """Update admin configuration for organization"""
    services_dict = services
    user_id = UUID("123e4567-e89b-12d3-a456-426614174000")  # Mock user ID
    
    try:
        config = await services_dict["admin_service"].create_admin_config(
            organization_id=organization_id,
            user_id=user_id,
            config=request  # Will create new if not exists
        )
        
        return {
            "success": True,
            "data": config.dict(),
            "message": "Admin configuration updated successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# System Health

@admin_router.get("/health")
async def get_system_health(
    organization_id: Optional[UUID] = None,
    services: Dict = Depends(get_services)
):
    """Get system health status"""
    services_dict = services
    user_id = UUID("123e4567-e89b-12d3-a456-426614174000")  # Mock user ID
    
    try:
        health_status = await services_dict["admin_service"].get_system_health(
            user_id=user_id,
            organization_id=organization_id
        )
        
        return {
            "success": True,
            "data": [health.dict() for health in health_status]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# Audit Logs

@admin_router.post("/audit-logs")
async def get_audit_logs(
    request: AuditLogQuery,
    services: Dict = Depends(get_services)
):
    """Get audit logs with filtering"""
    services_dict = services
    user_id = UUID("123e4567-e89b-12d3-a456-426614174000")  # Mock user ID
    
    try:
        logs = await services_dict["admin_service"].get_audit_logs(
            user_id=user_id,
            organization_id=request.organization_id,
            resource_type=request.resource_type,
            action=request.action,
            start_date=request.start_date,
            end_date=request.end_date,
            limit=request.limit
        )
        
        return {
            "success": True,
            "data": [log.dict() for log in logs],
            "total": len(logs)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# Billing Management

@admin_router.get("/billing/subscription/{organization_id}")
async def get_subscription(
    organization_id: UUID,
    services: Dict = Depends(get_services)
):
    """Get current subscription for organization"""
    services_dict = services
    
    try:
        subscription = await services_dict["billing_service"].get_subscription(
            organization_id=organization_id
        )
        
        if not subscription:
            return {
                "success": True,
                "data": None,
                "message": "No active subscription found"
            }
        
        return {
            "success": True,
            "data": subscription.dict()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@admin_router.post("/billing/subscription")
async def create_subscription(
    request: CreateSubscriptionRequest,
    organization_id: UUID,
    services: Dict = Depends(get_services)
):
    """Create a new subscription"""
    services_dict = services
    user_id = UUID("123e4567-e89b-12d3-a456-426614174000")  # Mock user ID
    
    try:
        subscription = await services_dict["billing_service"].create_subscription(
            organization_id=organization_id,
            plan_id=request.plan_id,
            stripe_customer_id=request.stripe_customer_id,
            payment_method_id=request.payment_method_id,
            billing_cycle=request.billing_cycle,
            user_id=user_id
        )
        
        return {
            "success": True,
            "data": subscription.dict(),
            "message": "Subscription created successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@admin_router.delete("/billing/subscription/{organization_id}")
async def cancel_subscription(
    organization_id: UUID,
    cancel_at_period_end: bool = True,
    services: Dict = Depends(get_services)
):
    """Cancel subscription"""
    services_dict = services
    user_id = UUID("123e4567-e89b-12d3-a456-426614174000")  # Mock user ID
    
    try:
        success = await services_dict["billing_service"].cancel_subscription(
            organization_id=organization_id,
            cancel_at_period_end=cancel_at_period_end,
            user_id=user_id
        )
        
        return {
            "success": success,
            "message": "Subscription cancellation initiated" if success else "Failed to cancel subscription"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@admin_router.get("/billing/invoices/{organization_id}")
async def get_invoices(
    organization_id: UUID,
    limit: int = 50,
    services: Dict = Depends(get_services)
):
    """Get invoices for organization"""
    services_dict = services
    user_id = UUID("123e4567-e89b-12d3-a456-426614174000")  # Mock user ID
    
    try:
        invoices = await services_dict["billing_service"].get_invoices(
            organization_id=organization_id,
            limit=limit,
            user_id=user_id
        )
        
        return {
            "success": True,
            "data": [invoice.dict() for invoice in invoices]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# Usage Tracking

@admin_router.post("/usage/track")
async def track_usage(
    request: RecordUsageRequest,
    organization_id: UUID,
    services: Dict = Depends(get_services)
):
    """Record usage event"""
    services_dict = services
    user_id = UUID("123e4567-e89b-12d3-a456-426614174000")  # Mock user ID
    
    try:
        usage_event = await services_dict["usage_tracking_service"].track_usage(
            organization_id=organization_id,
            event_type=request.usage_type,
            user_id=user_id,
            metadata=request.metadata
        )
        
        return {
            "success": True,
            "data": usage_event.dict(),
            "message": "Usage recorded successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@admin_router.get("/usage/quota/{organization_id}")
async def get_quota_status(
    organization_id: UUID,
    services: Dict = Depends(get_services)
):
    """Get quota status for organization"""
    services_dict = services
    user_id = UUID("123e4567-e89b-12d3-a456-426614174000")  # Mock user ID
    
    try:
        quota_status = await services_dict["usage_tracking_service"].get_quota_status(
            organization_id=organization_id,
            user_id=user_id
        )
        
        return {
            "success": True,
            "data": [quota.dict() for quota in quota_status]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@admin_router.get("/usage/analytics")
async def get_usage_analytics(
    organization_id: UUID,
    start_date: datetime,
    end_date: datetime,
    services: Dict = Depends(get_services)
):
    """Get usage analytics"""
    services_dict = services
    user_id = UUID("123e4567-e89b-12d3-a456-426614174000")  # Mock user ID
    
    try:
        analytics = await services_dict["usage_tracking_service"].get_usage_analytics(
            organization_id=organization_id,
            start_date=start_date,
            end_date=end_date,
            user_id=user_id
        )
        
        return {
            "success": True,
            "data": analytics
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@admin_router.post("/usage/rate-limit-check")
async def check_rate_limit(
    organization_id: UUID,
    endpoint: str,
    services: Dict = Depends(get_services)
):
    """Check rate limit status for an endpoint"""
    services_dict = services
    user_id = UUID("123e4567-e89b-12d3-a456-426614174000")  # Mock user ID
    
    try:
        allowed, details = await services_dict["usage_tracking_service"].check_rate_limit(
            organization_id=organization_id,
            endpoint=endpoint,
            user_id=user_id
        )
        
        return {
            "success": True,
            "data": {
                "allowed": allowed,
                "details": details,
                "organization_id": organization_id,
                "endpoint": endpoint
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# Organization Management

@admin_router.get("/organizations/{organization_id}/summary")
async def get_organization_summary(
    organization_id: UUID,
    services: Dict = Depends(get_services)
):
    """Get comprehensive organization summary"""
    services_dict = services
    user_id = UUID("123e4567-e89b-12d3-a456-426614174000")  # Mock user ID
    
    try:
        summary = await services_dict["admin_service"].get_organization_summary(
            user_id=user_id,
            organization_id=organization_id
        )
        
        return {
            "success": True,
            "data": summary
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@admin_router.put("/organizations/{organization_id}/settings")
async def update_organization_settings(
    organization_id: UUID,
    name: Optional[str] = None,
    description: Optional[str] = None,
    is_active: Optional[bool] = None,
    services: Dict = Depends(get_services)
):
    """Update organization settings"""
    services_dict = services
    user_id = UUID("123e4567-e89b-12d3-a456-426614174000")  # Mock user ID
    
    try:
        success = await services_dict["admin_service"].update_organization_settings(
            organization_id=organization_id,
            user_id=user_id,
            name=name,
            description=description,
            is_active=is_active
        )
        
        return {
            "success": success,
            "message": "Organization settings updated successfully" if success else "No changes made"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# Billing Analytics

@admin_router.get("/billing/analytics")
async def get_billing_analytics(
    organization_id: UUID,
    start_date: datetime,
    end_date: datetime,
    services: Dict = Depends(get_services)
):
    """Get billing analytics and insights"""
    services_dict = services
    user_id = UUID("123e4567-e89b-12d3-a456-426614174000")  # Mock user ID
    
    try:
        analytics = await services_dict["billing_service"].get_billing_analytics(
            organization_id=organization_id,
            start_date=start_date,
            end_date=end_date,
            user_id=user_id
        )
        
        return {
            "success": True,
            "data": analytics
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# Webhook endpoint for Stripe events
@admin_router.post("/webhooks/stripe")
async def stripe_webhook(request: Request, services: Dict = Depends(get_services)):
    """Handle Stripe webhook events"""
    services_dict = services
    
    try:
        # Get raw body for signature verification
        body = await request.body()
        signature = request.headers.get("stripe-signature")
        
        # In production, verify signature and parse event
        # For now, assume it's a valid event
        event_data = {"type": "test", "data": {"object": {}}}
        
        await services_dict["billing_service"].sync_stripe_webhooks(event_data)
        
        return {"success": True, "message": "Webhook processed successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
