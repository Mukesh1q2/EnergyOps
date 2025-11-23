"""
Billing & SaaS Operations API
Phase 8: Comprehensive Billing System

REST API endpoints for subscription management, usage tracking,
payment processing, and revenue analytics.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
import uuid

from ..models.billing import (
    SubscriptionPlan, Subscription, UsageRecord, Invoice, Payment,
    CustomerPortal, RevenueEvent, QuotaConfiguration, ChurnAnalysis,
    BillingStatus, BillingInterval, InvoiceStatus, PaymentStatus,
    UsageType, EventType, RevenueEventType,
    create_default_subscription_plans,
    calculate_mrr, calculate_arr, calculate_customer_ltv,
    process_usage_event, check_quota_limits
)

from ..models.admin import Organization, User
from ..schemas.billing import (
    # Plan schemas
    SubscriptionPlanCreate, SubscriptionPlanResponse, SubscriptionPlanUpdate,
    
    # Subscription schemas
    SubscriptionCreate, SubscriptionResponse, SubscriptionUpdate,
    SubscriptionUsageResponse,
    
    # Usage schemas
    UsageRecordCreate, UsageRecordResponse, UsageAnalyticsResponse,
    UsageSummaryResponse,
    
    # Invoice schemas
    InvoiceResponse, InvoiceCreate, InvoiceUpdate,
    InvoiceListResponse,
    
    # Payment schemas
    PaymentResponse, PaymentCreate, PaymentIntentResponse,
    
    # Customer portal schemas
    CustomerPortalResponse, CustomerPortalCreate,
    
    # Analytics schemas
    RevenueAnalyticsResponse, ChurnAnalysisResponse,
    BillingDashboardResponse,
    
    # Quota schemas
    QuotaConfigurationResponse, QuotaConfigurationCreate,
    QuotaCheckResponse
)

# Initialize routers
plans_router = APIRouter(prefix="/plans", tags=["billing-plans"])
subscriptions_router = APIRouter(prefix="/subscriptions", tags=["billing-subscriptions"])
usage_router = APIRouter(prefix="/usage", tags=["billing-usage"])
invoices_router = APIRouter(prefix="/invoices", tags=["billing-invoices"])
payments_router = APIRouter(prefix="/payments", tags=["billing-payments"])
analytics_router = APIRouter(prefix="/analytics", tags=["billing-analytics"])
portal_router = APIRouter(prefix="/portal", tags=["customer-portal"])
quotas_router = APIRouter(prefix="/quotas", tags=["quotas"])

# ===== SUBSCRIPTION PLAN ENDPOINTS =====

@plans_router.post("/", response_model=SubscriptionPlanResponse)
async def create_subscription_plan(
    plan: SubscriptionPlanCreate,
    db: Session = Depends()
):
    """Create a new subscription plan"""
    # Check if plan key already exists
    existing_plan = db.query(SubscriptionPlan).filter(
        SubscriptionPlan.key == plan.key
    ).first()
    
    if existing_plan:
        raise HTTPException(status_code=400, detail="Plan with this key already exists")
    
    # Create new plan
    db_plan = SubscriptionPlan(**plan.dict())
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    
    return SubscriptionPlanResponse.from_orm(db_plan)

@plans_router.get("/", response_model=List[SubscriptionPlanResponse])
async def list_subscription_plans(
    active_only: bool = Query(True, description="Only return active plans"),
    db: Session = Depends()
):
    """List all subscription plans"""
    query = db.query(SubscriptionPlan)
    
    if active_only:
        query = query.filter(SubscriptionPlan.is_active == True)
    
    plans = query.order_by(SubscriptionPlan.sort_order).all()
    
    return [SubscriptionPlanResponse.from_orm(plan) for plan in plans]

@plans_router.get("/{plan_id}", response_model=SubscriptionPlanResponse)
async def get_subscription_plan(plan_id: int, db: Session = Depends()):
    """Get subscription plan by ID"""
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return SubscriptionPlanResponse.from_orm(plan)

@plans_router.put("/{plan_id}", response_model=SubscriptionPlanResponse)
async def update_subscription_plan(
    plan_id: int,
    plan_update: SubscriptionPlanUpdate,
    db: Session = Depends()
):
    """Update subscription plan"""
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Update plan
    for field, value in plan_update.dict(exclude_unset=True).items():
        setattr(plan, field, value)
    
    db.commit()
    db.refresh(plan)
    
    return SubscriptionPlanResponse.from_orm(plan)

@plans_router.delete("/{plan_id}")
async def delete_subscription_plan(plan_id: int, db: Session = Depends()):
    """Delete subscription plan (soft delete)"""
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Check if plan has active subscriptions
    active_subscriptions = db.query(Subscription).filter(
        Subscription.plan_id == plan_id,
        Subscription.status == BillingStatus.ACTIVE.value
    ).count()
    
    if active_subscriptions > 0:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete plan with active subscriptions"
        )
    
    # Soft delete
    plan.is_active = False
    db.commit()
    
    return {"message": "Plan deleted successfully"}

@plans_router.post("/initialize-defaults")
async def initialize_default_plans(db: Session = Depends()):
    """Initialize default subscription plans"""
    # Check if any plans exist
    existing_plans = db.query(SubscriptionPlan).count()
    
    if existing_plans > 0:
        return {"message": "Plans already exist"}
    
    # Create default plans
    default_plans = create_default_subscription_plans()
    
    for plan_data in default_plans:
        plan = SubscriptionPlan(**plan_data)
        db.add(plan)
    
    db.commit()
    
    return {"message": "Default plans created successfully"}

# ===== SUBSCRIPTION MANAGEMENT ENDPOINTS =====

@subscriptions_router.post("/", response_model=SubscriptionResponse)
async def create_subscription(
    subscription_data: SubscriptionCreate,
    db: Session = Depends()
):
    """Create a new subscription"""
    # Verify organization exists
    org = db.query(Organization).filter(
        Organization.id == subscription_data.organization_id
    ).first()
    
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Verify plan exists and is active
    plan = db.query(SubscriptionPlan).filter(
        SubscriptionPlan.id == subscription_data.plan_id,
        SubscriptionPlan.is_active == True
    ).first()
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found or inactive")
    
    # Create subscription
    subscription = Subscription(
        organization_id=subscription_data.organization_id,
        plan_id=subscription_data.plan_id,
        billing_interval=subscription_data.billing_interval,
        is_trial=subscription_data.is_trial,
        trial_ends_at=subscription_data.trial_ends_at,
        custom_price_monthly=subscription_data.custom_price_monthly,
        custom_price_annual=subscription_data.custom_price_annual
    )
    
    # Set billing periods
    now = datetime.now(timezone.utc)
    if subscription.is_trial and subscription_data.trial_ends_at:
        subscription.current_period_start = now
        subscription.current_period_end = subscription_data.trial_ends_at
    else:
        if subscription_data.billing_interval == BillingInterval.MONTHLY.value:
            subscription.current_period_start = now
            subscription.current_period_end = now + timedelta(days=30)
        elif subscription_data.billing_interval == BillingInterval.ANNUAL.value:
            subscription.current_period_start = now
            subscription.current_period_end = now + timedelta(days=365)
        else:  # QUARTERLY
            subscription.current_period_start = now
            subscription.current_period_end = now + timedelta(days=90)
    
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    
    # Update organization subscription info
    org.subscription_tier = plan.key
    org.subscription_status = "active"
    org.is_trial = subscription.is_trial
    org.trial_ends_at = subscription.trial_ends_at
    
    # Update limits
    org.max_users = plan.max_users
    org.max_dashboards = plan.max_dashboards
    org.max_storage_gb = plan.max_storage_gb
    org.api_calls_limit = plan.api_calls_limit_monthly
    
    db.commit()
    
    return SubscriptionResponse.from_orm(subscription)

@subscriptions_router.get("/organization/{organization_id}", response_model=SubscriptionResponse)
async def get_organization_subscription(
    organization_id: int,
    db: Session = Depends()
):
    """Get subscription for organization"""
    subscription = db.query(Subscription).filter(
        Subscription.organization_id == organization_id
    ).order_by(Subscription.created_at.desc()).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="No subscription found for organization")
    
    return SubscriptionResponse.from_orm(subscription)

@subscriptions_router.put("/{subscription_id}/cancel", response_model=SubscriptionResponse)
async def cancel_subscription(
    subscription_id: int,
    immediate: bool = Query(False, description="Cancel immediately or at period end"),
    db: Session = Depends()
):
    """Cancel subscription"""
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    if immediate:
        subscription.canceled_at = datetime.now(timezone.utc)
        subscription.status = BillingStatus.CANCELED.value
        subscription.cancel_at_period_end = False
        
        # Update organization
        org = db.query(Organization).filter(
            Organization.id == subscription.organization_id
        ).first()
        if org:
            org.subscription_status = "canceled"
    else:
        subscription.cancel_at_period_end = True
    
    db.commit()
    db.refresh(subscription)
    
    return SubscriptionResponse.from_orm(subscription)

@subscriptions_router.put("/{subscription_id}/upgrade", response_model=SubscriptionResponse)
async def upgrade_subscription(
    subscription_id: int,
    new_plan_id: int,
    proration_behavior: str = Query("create_prorations", description="How to handle proration"),
    db: Session = Depends()
):
    """Upgrade subscription to new plan"""
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Get new plan
    new_plan = db.query(SubscriptionPlan).filter(
        SubscriptionPlan.id == new_plan_id,
        SubscriptionPlan.is_active == True
    ).first()
    
    if not new_plan:
        raise HTTPException(status_code=404, detail="New plan not found or inactive")
    
    # Handle proration
    now = datetime.now(timezone.utc)
    current_period_end = subscription.current_period_end
    
    if proration_behavior == "create_prorations":
        # Calculate proration amount
        # This would integrate with Stripe's proration calculations
        pass
    
    # Update subscription
    subscription.plan_id = new_plan_id
    subscription.status = BillingStatus.ACTIVE.value
    subscription.cancel_at_period_end = False
    subscription.is_trial = False
    subscription.trial_ends_at = None
    
    # Update organization limits
    org = db.query(Organization).filter(
        Organization.id == subscription.organization_id
    ).first()
    if org:
        org.subscription_tier = new_plan.key
        org.max_users = new_plan.max_users
        org.max_dashboards = new_plan.max_dashboards
        org.max_storage_gb = new_plan.max_storage_gb
        org.api_calls_limit = new_plan.api_calls_limit_monthly
    
    # Log revenue event
    revenue_event = RevenueEvent(
        organization_id=subscription.organization_id,
        event_type=RevenueEventType.SUBSCRIPTION_UPGRADE.value,
        amount=0.00,  # Would calculate proration amount
        subscription_id=subscription_id,
        metadata={"old_plan_id": subscription.plan_id, "new_plan_id": new_plan_id}
    )
    db.add(revenue_event)
    
    db.commit()
    db.refresh(subscription)
    
    return SubscriptionResponse.from_orm(subscription)

@subscriptions_router.get("/{subscription_id}/usage", response_model=SubscriptionUsageResponse)
async def get_subscription_usage(
    subscription_id: int,
    period_start: Optional[datetime] = Query(None, description="Start of usage period"),
    period_end: Optional[datetime] = Query(None, description="End of usage period"),
    db: Session = Depends()
):
    """Get subscription usage for current or specified period"""
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Use subscription period if not specified
    if not period_start:
        period_start = subscription.current_period_start
    if not period_end:
        period_end = subscription.current_period_end
    
    # Get usage records
    usage_records = db.query(UsageRecord).filter(
        UsageRecord.subscription_id == subscription_id,
        UsageRecord.recorded_at >= period_start,
        UsageRecord.recorded_at < period_end
    ).all()
    
    # Calculate usage by type
    usage_by_type = {}
    for record in usage_records:
        usage_type = record.usage_type
        if usage_type not in usage_by_type:
            usage_by_type[usage_type] = 0.0
        usage_by_type[usage_type] += float(record.quantity)
    
    # Get plan limits
    plan = db.query(SubscriptionPlan).filter(
        SubscriptionPlan.id == subscription.plan_id
    ).first()
    
    limits = {
        "max_users": plan.max_users,
        "max_dashboards": plan.max_dashboards,
        "max_storage_gb": plan.max_storage_gb,
        "api_calls_limit_monthly": plan.api_calls_limit_monthly
    }
    
    return SubscriptionUsageResponse(
        subscription_id=subscription_id,
        period_start=period_start,
        period_end=period_end,
        usage_by_type=usage_by_type,
        limits=limits
    )

# ===== USAGE TRACKING ENDPOINTS =====

@usage_router.post("/events", response_model=UsageRecordResponse)
async def record_usage_event(
    event_data: UsageRecordCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends()
):
    """Record usage event for billing"""
    # Verify organization and subscription
    subscription = db.query(Subscription).filter(
        Subscription.organization_id == event_data.organization_id,
        Subscription.status == BillingStatus.ACTIVE.value
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Active subscription not found")
    
    # Create usage record
    usage_record = UsageRecord(
        organization_id=event_data.organization_id,
        subscription_id=subscription.id,
        usage_type=event_data.usage_type,
        quantity=event_data.quantity,
        unit=event_data.unit,
        event_type=event_data.event_type,
        event_data=event_data.event_data,
        resource_id=event_data.resource_id,
        user_id=event_data.user_id,
        dashboard_id=event_data.dashboard_id
    )
    
    # Set billing period
    now = datetime.now(timezone.utc)
    if subscription.billing_interval == BillingInterval.MONTHLY.value:
        period_start = subscription.current_period_start
        period_end = subscription.current_period_end
    else:
        period_start = subscription.current_period_start
        period_end = subscription.current_period_end
    
    usage_record.period_start = period_start
    usage_record.period_end = period_end
    
    db.add(usage_record)
    db.commit()
    db.refresh(usage_record)
    
    # Check quotas in background
    background_tasks.add_task(
        check_quota_limits_async,
        event_data.organization_id,
        event_data.usage_type,
        event_data.quantity
    )
    
    # Update organization current usage
    org = db.query(Organization).filter(
        Organization.id == event_data.organization_id
    ).first()
    
    if event_data.usage_type == UsageType.API_CALLS.value:
        org.current_api_calls = (org.current_api_calls or 0) + 1
    elif event_data.usage_type == UsageType.USERS.value:
        org.current_users = max(org.current_users or 0, event_data.quantity)
    elif event_data.usage_type == UsageType.DASHBOARDS.value:
        org.current_dashboards = max(org.current_dashboards or 0, event_data.quantity)
    
    db.commit()
    
    return UsageRecordResponse.from_orm(usage_record)

@usage_router.get("/analytics/{organization_id}", response_model=UsageAnalyticsResponse)
async def get_usage_analytics(
    organization_id: int,
    period_days: int = Query(30, description="Period in days"),
    usage_type: Optional[UsageType] = Query(None, description="Filter by usage type"),
    db: Session = Depends()
):
    """Get usage analytics for organization"""
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=period_days)
    
    query = db.query(UsageRecord).filter(
        UsageRecord.organization_id == organization_id,
        UsageRecord.recorded_at >= start_date,
        UsageRecord.recorded_at < end_date
    )
    
    if usage_type:
        query = query.filter(UsageRecord.usage_type == usage_type.value)
    
    usage_records = query.all()
    
    # Group by day and type
    daily_usage = {}
    usage_by_type = {}
    
    for record in usage_records:
        day = record.recorded_at.date()
        usage_type_key = record.usage_type
        
        # Daily aggregation
        if day not in daily_usage:
            daily_usage[day] = {}
        if usage_type_key not in daily_usage[day]:
            daily_usage[day][usage_type_key] = 0.0
        daily_usage[day][usage_type_key] += float(record.quantity)
        
        # Type aggregation
        if usage_type_key not in usage_by_type:
            usage_by_type[usage_type_key] = 0.0
        usage_by_type[usage_type_key] += float(record.quantity)
    
    return UsageAnalyticsResponse(
        organization_id=organization_id,
        period_start=start_date,
        period_end=end_date,
        daily_usage=daily_usage,
        usage_by_type=usage_by_type,
        total_events=len(usage_records)
    )

@usage_router.get("/summary/{organization_id}", response_model=UsageSummaryResponse)
async def get_usage_summary(
    organization_id: int,
    db: Session = Depends()
):
    """Get current usage summary for organization"""
    # Get subscription
    subscription = db.query(Subscription).filter(
        Subscription.organization_id == organization_id,
        Subscription.status == BillingStatus.ACTIVE.value
    ).first()
    
    if not subscription:
        return UsageSummaryResponse(
            organization_id=organization_id,
            subscription=None,
            usage_by_type={},
            limits={},
            warnings=[]
        )
    
    # Get current usage
    period_start = subscription.current_period_start
    period_end = subscription.current_period_end
    
    usage_records = db.query(UsageRecord).filter(
        UsageRecord.subscription_id == subscription.id,
        UsageRecord.recorded_at >= period_start,
        UsageRecord.recorded_at < period_end
    ).all()
    
    # Aggregate usage
    usage_by_type = {}
    warnings = []
    
    for record in usage_records:
        usage_type = record.usage_type
        if usage_type not in usage_by_type:
            usage_by_type[usage_type] = 0.0
        usage_by_type[usage_type] += float(record.quantity)
    
    # Get plan limits
    plan = db.query(SubscriptionPlan).filter(
        SubscriptionPlan.id == subscription.plan_id
    ).first()
    
    limits = {
        "max_users": plan.max_users,
        "max_dashboards": plan.max_dashboards,
        "max_storage_gb": plan.max_storage_gb,
        "api_calls_limit_monthly": plan.api_calls_limit_monthly
    }
    
    # Check for warnings
    if usage_by_type.get(UsageType.USERS.value, 0) / limits["max_users"] > 0.8:
        warnings.append("User limit approaching")
    if usage_by_type.get(UsageType.DASHBOARDS.value, 0) / limits["max_dashboards"] > 0.8:
        warnings.append("Dashboard limit approaching")
    if usage_by_type.get(UsageType.API_CALLS.value, 0) / limits["api_calls_limit_monthly"] > 0.8:
        warnings.append("API limit approaching")
    
    return UsageSummaryResponse(
        organization_id=organization_id,
        subscription=SubscriptionResponse.from_orm(subscription),
        usage_by_type=usage_by_type,
        limits=limits,
        warnings=warnings
    )

@usage_router.get("/quota-check/{organization_id}/{usage_type}", response_model=QuotaCheckResponse)
async def check_quota_for_usage(
    organization_id: int,
    usage_type: UsageType,
    quantity: float = Query(..., description="Additional quantity to check"),
    db: Session = Depends()
):
    """Check if usage would exceed quota limits"""
    quota_check = check_quota_limits(organization_id, usage_type, quantity)
    
    return QuotaCheckResponse(
        organization_id=organization_id,
        usage_type=usage_type,
        quantity=quantity,
        within_limits=quota_check["within_limits"],
        current_usage=quota_check["current_usage"],
        limits=quota_check
    )

# Helper function for background quota checking
async def check_quota_limits_async(organization_id: int, usage_type: UsageType, quantity: float):
    """Background task to check quota limits and send notifications if needed"""
    quota_check = check_quota_limits(organization_id, usage_type, quantity)
    
    if not quota_check["within_limits"]:
        # Send notification or take action
        # This would integrate with notification system
        pass

# ===== INVOICE MANAGEMENT ENDPOINTS =====

@invoices_router.get("/", response_model=InvoiceListResponse)
async def list_invoices(
    organization_id: Optional[int] = Query(None, description="Filter by organization"),
    status: Optional[InvoiceStatus] = Query(None, description="Filter by status"),
    limit: int = Query(50, description="Limit results"),
    offset: int = Query(0, description="Offset for pagination"),
    db: Session = Depends()
):
    """List invoices with filtering"""
    query = db.query(Invoice)
    
    if organization_id:
        query = query.filter(Invoice.organization_id == organization_id)
    if status:
        query = query.filter(Invoice.status == status.value)
    
    invoices = query.order_by(Invoice.created_at.desc()).offset(offset).limit(limit).all()
    
    return InvoiceListResponse(
        invoices=[InvoiceResponse.from_orm(inv) for inv in invoices],
        total=query.count(),
        limit=limit,
        offset=offset
    )

@invoices_router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(invoice_id: int, db: Session = Depends()):
    """Get invoice by ID"""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    return InvoiceResponse.from_orm(invoice)

@invoices_router.post("/{invoice_id}/generate-pdf")
async def generate_invoice_pdf(
    invoice_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends()
):
    """Generate PDF for invoice"""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if invoice.pdf_url:
        return {"message": "PDF already generated", "pdf_url": invoice.pdf_url}
    
    # Generate PDF in background
    background_tasks.add_task(generate_pdf_async, invoice_id)
    
    return {"message": "PDF generation started"}

# Helper function for PDF generation
async def generate_pdf_async(invoice_id: int):
    """Background task to generate invoice PDF"""
    # This would implement PDF generation logic
    # For now, just mark as generated
    pass

# ===== PAYMENT PROCESSING ENDPOINTS =====

@payments_router.get("/", response_model=List[PaymentResponse])
async def list_payments(
    organization_id: Optional[int] = Query(None, description="Filter by organization"),
    status: Optional[PaymentStatus] = Query(None, description="Filter by status"),
    limit: int = Query(50, description="Limit results"),
    db: Session = Depends()
):
    """List payments with filtering"""
    query = db.query(Payment)
    
    if organization_id:
        query = query.filter(Payment.organization_id == organization_id)
    if status:
        query = query.filter(Payment.status == status.value)
    
    payments = query.order_by(Payment.created_at.desc()).limit(limit).all()
    
    return [PaymentResponse.from_orm(payment) for payment in payments]

@payments_router.post("/create-payment-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(
    payment_data: PaymentCreate,
    db: Session = Depends()
):
    """Create payment intent for invoice"""
    # Verify organization and invoice
    invoice = db.query(Invoice).filter(
        Invoice.id == payment_data.invoice_id,
        Invoice.organization_id == payment_data.organization_id
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Check if payment already exists
    existing_payment = db.query(Payment).filter(
        Payment.invoice_id == payment_data.invoice_id,
        Payment.status.in_([PaymentStatus.PENDING.value, PaymentStatus.PROCESSING.value])
    ).first()
    
    if existing_payment:
        # Return existing payment intent
        pass
    
    # Create new payment record
    payment = Payment(
        organization_id=payment_data.organization_id,
        invoice_id=payment_data.invoice_id,
        subscription_id=payment_data.subscription_id,
        amount=payment_data.amount,
        currency=payment_data.currency,
        payment_method=payment_data.payment_method
    )
    
    # Generate mock Stripe payment intent
    payment.stripe_payment_intent_id = f"pi_{uuid.uuid4().hex[:24]}"
    payment.status = PaymentStatus.PENDING.value
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    return PaymentIntentResponse(
        payment_id=payment.id,
        client_secret=f"pi_{payment.stripe_payment_intent_id}_secret_test",
        amount=int(payment.amount * 100),  # Stripe expects cents
        currency=payment.currency,
        status=payment.status
    )

@payments_router.post("/{payment_id}/confirm")
async def confirm_payment(
    payment_id: int,
    db: Session = Depends()
):
    """Confirm payment completion"""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Update payment status
    payment.status = PaymentStatus.SUCCEEDED.value
    payment.processed_at = datetime.now(timezone.utc)
    
    # Update invoice
    if payment.invoice_id:
        invoice = db.query(Invoice).filter(Invoice.id == payment.invoice_id).first()
        if invoice:
            invoice.amount_paid += payment.amount
            invoice.status = InvoiceStatus.PAID.value
            invoice.paid_at = datetime.now(timezone.utc)
    
    # Log revenue event
    revenue_event = RevenueEvent(
        organization_id=payment.organization_id,
        event_type=RevenueEventType.PAYMENT_SUCCESS.value,
        amount=payment.amount,
        payment_id=payment_id
    )
    db.add(revenue_event)
    
    db.commit()
    
    return {"message": "Payment confirmed successfully"}

@payments_router.post("/{payment_id}/failed")
async def mark_payment_failed(
    payment_id: int,
    failure_code: str = Query(..., description="Stripe failure code"),
    failure_message: str = Query(..., description="Failure message"),
    db: Session = Depends()
):
    """Mark payment as failed"""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Update payment status
    payment.status = PaymentStatus.FAILED.value
    payment.failure_code = failure_code
    payment.failure_message = failure_message
    payment.processed_at = datetime.now(timezone.utc)
    
    # Update invoice if exists
    if payment.invoice_id:
        invoice = db.query(Invoice).filter(Invoice.id == payment.invoice_id).first()
        if invoice and invoice.status == InvoiceStatus.SENT.value:
            invoice.status = InvoiceStatus.OVERDUE.value
    
    # Log revenue event
    revenue_event = RevenueEvent(
        organization_id=payment.organization_id,
        event_type=RevenueEventType.PAYMENT_FAILURE.value,
        amount=payment.amount,
        payment_id=payment_id,
        metadata={"failure_code": failure_code, "failure_message": failure_message}
    )
    db.add(revenue_event)
    
    db.commit()
    
    return {"message": "Payment marked as failed"}

# ===== CUSTOMER PORTAL ENDPOINTS =====

@portal_router.post("/create-session", response_model=CustomerPortalResponse)
async def create_customer_portal_session(
    portal_data: CustomerPortalCreate,
    db: Session = Depends()
):
    """Create Stripe customer portal session"""
    # Verify organization
    org = db.query(Organization).filter(
        Organization.id == portal_data.organization_id
    ).first()
    
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Get subscription
    subscription = db.query(Subscription).filter(
        Subscription.organization_id = portal_data.organization_id,
        Subscription.status == BillingStatus.ACTIVE.value
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Active subscription not found")
    
    # Create portal session
    portal_session = CustomerPortal(
        organization_id=portal_data.organization_id,
        allowed_actions=portal_data.allowed_actions,
        return_url=portal_data.return_url,
        created_by=portal_data.created_by,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
    )
    
    # Mock Stripe portal session ID
    portal_session.stripe_portal_session_id = f"bps_{uuid.uuid4().hex[:24]}"
    
    db.add(portal_session)
    db.commit()
    db.refresh(portal_session)
    
    # Mock portal URL
    portal_url = f"https://billing.stripe.com/p/session/{portal_session.stripe_portal_session_id}"
    
    return CustomerPortalResponse(
        portal_id=portal_session.id,
        portal_url=portal_url,
        expires_at=portal_session.expires_at
    )

# ===== ANALYTICS ENDPOINTS =====

@analytics_router.get("/revenue/{organization_id}", response_model=RevenueAnalyticsResponse)
async def get_revenue_analytics(
    organization_id: int,
    period_days: int = Query(30, description="Period in days"),
    db: Session = Depends()
):
    """Get revenue analytics for organization"""
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=period_days)
    
    # Get revenue events
    revenue_events = db.query(RevenueEvent).filter(
        RevenueEvent.organization_id == organization_id,
        RevenueEvent.event_timestamp >= start_date,
        RevenueEvent.event_timestamp < end_date
    ).all()
    
    # Calculate metrics
    total_revenue = sum(float(event.amount) for event in revenue_events 
                       if event.event_type == RevenueEventType.PAYMENT_SUCCESS.value)
    
    subscription_upgrades = [event for event in revenue_events 
                           if event.event_type == RevenueEventType.SUBSCRIPTION_UPGRADE.value]
    subscription_cancellations = [event for event in revenue_events 
                                if event.event_type == RevenueEventType.SUBSCRIPTION_CANCEL.value]
    
    # Group by day
    daily_revenue = {}
    for event in revenue_events:
        if event.event_type == RevenueEventType.PAYMENT_SUCCESS.value:
            day = event.event_timestamp.date()
            if day not in daily_revenue:
                daily_revenue[day] = 0.0
            daily_revenue[day] += float(event.amount)
    
    # Get subscription MRR
    subscription = db.query(Subscription).filter(
        Subscription.organization_id = organization_id,
        Subscription.status == BillingStatus.ACTIVE.value
    ).first()
    
    mrr = calculate_mrr(subscription) if subscription else 0.0
    arr = mrr * 12
    
    return RevenueAnalyticsResponse(
        organization_id=organization_id,
        period_start=start_date,
        period_end=end_date,
        total_revenue=total_revenue,
        mrr=mrr,
        arr=arr,
        daily_revenue=daily_revenue,
        subscription_upgrades=len(subscription_upgrades),
        subscription_cancellations=len(subscription_cancellations)
    )

@analytics_router.get("/billing-dashboard/{organization_id}", response_model=BillingDashboardResponse)
async def get_billing_dashboard(
    organization_id: int,
    db: Session = Depends()
):
    """Get comprehensive billing dashboard data"""
    # Get subscription
    subscription = db.query(Subscription).filter(
        Subscription.organization_id = organization_id,
        Subscription.status == BillingStatus.ACTIVE.value
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="No active subscription found")
    
    # Get current usage
    usage_summary = await get_usage_summary(organization_id, db)
    
    # Get recent invoices
    recent_invoices = db.query(Invoice).filter(
        Invoice.organization_id = organization_id
    ).order_by(Invoice.created_at.desc()).limit(5).all()
    
    # Get recent payments
    recent_payments = db.query(Payment).filter(
        Payment.organization_id = organization_id
    ).order_by(Payment.created_at.desc()).limit(5).all()
    
    # Calculate metrics
    mrr = calculate_mrr(subscription)
    arr = mrr * 12
    
    # Get plan info
    plan = db.query(SubscriptionPlan).filter(
        SubscriptionPlan.id == subscription.plan_id
    ).first()
    
    return BillingDashboardResponse(
        organization_id=organization_id,
        subscription=SubscriptionResponse.from_orm(subscription),
        plan=plan.name if plan else "Unknown",
        mrr=mrr,
        arr=arr,
        usage=usage_summary,
        recent_invoices=[InvoiceResponse.from_orm(inv) for inv in recent_invoices],
        recent_payments=[PaymentResponse.from_orm(payment) for payment in recent_payments],
        next_billing_date=subscription.current_period_end
    )

# ===== QUOTA MANAGEMENT ENDPOINTS =====

@quotas_router.post("/", response_model=QuotaConfigurationResponse)
async def create_quota_configuration(
    quota_data: QuotaConfigurationCreate,
    db: Session = Depends()
):
    """Create quota configuration"""
    # Verify organization
    org = db.query(Organization).filter(
        Organization.id == quota_data.organization_id
    ).first()
    
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Create quota configuration
    quota_config = QuotaConfiguration(**quota_data.dict())
    db.add(quota_config)
    db.commit()
    db.refresh(quota_config)
    
    return QuotaConfigurationResponse.from_orm(quota_config)

@quotas_router.get("/organization/{organization_id}", response_model=List[QuotaConfigurationResponse])
async def get_organization_quotas(
    organization_id: int,
    db: Session = Depends()
):
    """Get quota configurations for organization"""
    quotas = db.query(QuotaConfiguration).filter(
        QuotaConfiguration.organization_id == organization_id,
        QuotaConfiguration.is_active == True
    ).all()
    
    return [QuotaConfigurationResponse.from_orm(quota) for quota in quotas]

@quotas_router.put("/{quota_id}", response_model=QuotaConfigurationResponse)
async def update_quota_configuration(
    quota_id: int,
    quota_update: Dict[str, Any],
    db: Session = Depends()
):
    """Update quota configuration"""
    quota = db.query(QuotaConfiguration).filter(
        QuotaConfiguration.id == quota_id
    ).first()
    
    if not quota:
        raise HTTPException(status_code=404, detail="Quota configuration not found")
    
    # Update fields
    for field, value in quota_update.items():
        if hasattr(quota, field):
            setattr(quota, field, value)
    
    db.commit()
    db.refresh(quota)
    
    return QuotaConfigurationResponse.from_orm(quota)

@quotas_router.delete("/{quota_id}")
async def delete_quota_configuration(
    quota_id: int,
    db: Session = Depends()
):
    """Delete quota configuration"""
    quota = db.query(QuotaConfiguration).filter(
        QuotaConfiguration.id == quota_id
    ).first()
    
    if not quota:
        raise HTTPException(status_code=404, detail="Quota configuration not found")
    
    quota.is_active = False
    db.commit()
    
    return {"message": "Quota configuration deleted successfully"}

# Additional analytics endpoints
@analytics_router.get("/churn-analysis/{organization_id}", response_model=ChurnAnalysisResponse)
async def get_churn_analysis(
    organization_id: int,
    period_days: int = Query(90, description="Analysis period in days"),
    db: Session = Depends()
):
    """Get churn analysis for organization"""
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=period_days)
    
    # This would implement comprehensive churn analysis
    # For now, return mock data
    return ChurnAnalysisResponse(
        organization_id=organization_id,
        period_start=start_date,
        period_end=end_date,
        total_customers=100,
        churned_customers=5,
        new_customers=8,
        churn_rate=5.0,
        churned_mrr=250.00,
        new_mrr=400.00,
        net_mrr_change=150.00,
        churn_reasons={"pricing": 30, "features": 25, "support": 20, "other": 25},
        churn_risk_score=0.25,
        risk_factors={"low_usage": 0.3, "support_tickets": 0.2, "login_frequency": 0.25}
    )

# Main router aggregation
billing_router = APIRouter(prefix="/billing")
billing_router.include_router(plans_router)
billing_router.include_router(subscriptions_router)
billing_router.include_router(usage_router)
billing_router.include_router(invoices_router)
billing_router.include_router(payments_router)
billing_router.include_router(analytics_router)
billing_router.include_router(portal_router)
billing_router.include_router(quotas_router)