"""
Billing & SaaS Operations Schemas
Phase 8: Comprehensive Billing System

Pydantic validation schemas for billing API requests and responses.
"""

from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field, validator
from decimal import Decimal

from ..models.billing import (
    BillingInterval, BillingStatus, InvoiceStatus, PaymentStatus,
    UsageType, EventType, RevenueEventType
)

# ===== SUBSCRIPTION PLAN SCHEMAS =====

class SubscriptionPlanBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    key: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    price_monthly: Decimal = Field(..., ge=0)
    price_annual: Decimal = Field(..., ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    max_users: int = Field(..., ge=1)
    max_dashboards: int = Field(..., ge=1)
    max_storage_gb: int = Field(..., ge=0)
    api_calls_limit_monthly: int = Field(..., ge=0)
    features: Dict[str, Any] = Field(default_factory=dict)
    sort_order: int = Field(default=0)
    allow_custom_pricing: bool = Field(default=False)
    custom_price_minimum: Optional[Decimal] = Field(None, ge=0)

class SubscriptionPlanCreate(SubscriptionPlanBase):
    is_active: bool = Field(default=True)
    is_public: bool = Field(default=True)

class SubscriptionPlanUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price_monthly: Optional[Decimal] = Field(None, ge=0)
    price_annual: Optional[Decimal] = Field(None, ge=0)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    max_users: Optional[int] = Field(None, ge=1)
    max_dashboards: Optional[int] = Field(None, ge=1)
    max_storage_gb: Optional[int] = Field(None, ge=0)
    api_calls_limit_monthly: Optional[int] = Field(None, ge=0)
    features: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    is_public: Optional[bool] = None
    sort_order: Optional[int] = None
    allow_custom_pricing: Optional[bool] = None
    custom_price_minimum: Optional[Decimal] = Field(None, ge=0)

class SubscriptionPlanResponse(SubscriptionPlanBase):
    id: int
    is_active: bool
    is_public: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm(cls, plan):
        return cls(
            id=plan.id,
            name=plan.name,
            key=plan.key,
            description=plan.description,
            price_monthly=plan.price_monthly,
            price_annual=plan.price_annual,
            currency=plan.currency,
            max_users=plan.max_users,
            max_dashboards=plan.max_dashboards,
            max_storage_gb=plan.max_storage_gb,
            api_calls_limit_monthly=plan.api_calls_limit_monthly,
            features=plan.features or {},
            is_active=plan.is_active,
            is_public=plan.is_public,
            sort_order=plan.sort_order,
            allow_custom_pricing=plan.allow_custom_pricing,
            custom_price_minimum=plan.custom_price_minimum,
            created_at=plan.created_at,
            updated_at=plan.updated_at
        )

# ===== SUBSCRIPTION SCHEMAS =====

class SubscriptionBase(BaseModel):
    billing_interval: BillingInterval = Field(default=BillingInterval.MONTHLY)
    is_trial: bool = Field(default=False)
    trial_ends_at: Optional[datetime] = None
    custom_price_monthly: Optional[Decimal] = Field(None, ge=0)
    custom_price_annual: Optional[Decimal] = Field(None, ge=0)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class SubscriptionCreate(SubscriptionBase):
    organization_id: int = Field(..., gt=0)
    plan_id: int = Field(..., gt=0)

class SubscriptionUpdate(BaseModel):
    billing_interval: Optional[BillingInterval] = None
    is_trial: Optional[bool] = None
    trial_ends_at: Optional[datetime] = None
    cancel_at_period_end: Optional[bool] = None
    custom_price_monthly: Optional[Decimal] = Field(None, ge=0)
    custom_price_annual: Optional[Decimal] = Field(None, ge=0)
    metadata: Optional[Dict[str, Any]] = None

class SubscriptionResponse(BaseModel):
    id: int
    organization_id: int
    plan_id: int
    stripe_subscription_id: Optional[str]
    customer_id: Optional[str]
    billing_interval: str
    status: str
    is_trial: bool
    trial_ends_at: Optional[datetime]
    current_period_start: Optional[datetime]
    current_period_end: Optional[datetime]
    canceled_at: Optional[datetime]
    cancel_at_period_end: bool
    custom_price_monthly: Optional[Decimal]
    custom_price_annual: Optional[Decimal]
    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm(cls, subscription):
        return cls(
            id=subscription.id,
            organization_id=subscription.organization_id,
            plan_id=subscription.plan_id,
            stripe_subscription_id=subscription.stripe_subscription_id,
            customer_id=subscription.customer_id,
            billing_interval=subscription.billing_interval,
            status=subscription.status,
            is_trial=subscription.is_trial,
            trial_ends_at=subscription.trial_ends_at,
            current_period_start=subscription.current_period_start,
            current_period_end=subscription.current_period_end,
            canceled_at=subscription.canceled_at,
            cancel_at_period_end=subscription.cancel_at_period_end,
            custom_price_monthly=subscription.custom_price_monthly,
            custom_price_annual=subscription.custom_price_annual,
            metadata=subscription.metadata or {},
            created_at=subscription.created_at,
            updated_at=subscription.updated_at
        )

class SubscriptionUsageResponse(BaseModel):
    subscription_id: int
    period_start: datetime
    period_end: datetime
    usage_by_type: Dict[str, float]
    limits: Dict[str, int]

# ===== USAGE TRACKING SCHEMAS =====

class UsageRecordBase(BaseModel):
    organization_id: int = Field(..., gt=0)
    usage_type: UsageType
    quantity: Decimal = Field(..., gt=0)
    unit: Optional[str] = Field(None, max_length=20)
    event_type: EventType
    event_data: Dict[str, Any] = Field(default_factory=dict)
    resource_id: Optional[str] = Field(None, max_length=100)
    user_id: Optional[int] = Field(None, gt=0)
    dashboard_id: Optional[int] = Field(None, gt=0)
    is_billable: bool = Field(default=True)

class UsageRecordCreate(UsageRecordBase):
    pass

class UsageRecordResponse(BaseModel):
    id: int
    organization_id: int
    subscription_id: int
    usage_type: str
    quantity: Decimal
    unit: Optional[str]
    event_type: str
    event_data: Dict[str, Any]
    resource_id: Optional[str]
    period_start: Optional[datetime]
    period_end: Optional[datetime]
    user_id: Optional[int]
    dashboard_id: Optional[int]
    is_billable: bool
    is_processed: bool
    recorded_at: datetime
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm(cls, usage_record):
        return cls(
            id=usage_record.id,
            organization_id=usage_record.organization_id,
            subscription_id=usage_record.subscription_id,
            usage_type=usage_record.usage_type,
            quantity=usage_record.quantity,
            unit=usage_record.unit,
            event_type=usage_record.event_type,
            event_data=usage_record.event_data or {},
            resource_id=usage_record.resource_id,
            period_start=usage_record.period_start,
            period_end=usage_record.period_end,
            user_id=usage_record.user_id,
            dashboard_id=usage_record.dashboard_id,
            is_billable=usage_record.is_billable,
            is_processed=usage_record.is_processed,
            recorded_at=usage_record.recorded_at
        )

class UsageAnalyticsResponse(BaseModel):
    organization_id: int
    period_start: datetime
    period_end: datetime
    daily_usage: Dict[str, Dict[str, float]]
    usage_by_type: Dict[str, float]
    total_events: int

class UsageSummaryResponse(BaseModel):
    organization_id: int
    subscription: Optional[SubscriptionResponse]
    usage_by_type: Dict[str, float]
    limits: Dict[str, Union[int, float]]
    warnings: List[str]

class QuotaCheckResponse(BaseModel):
    organization_id: int
    usage_type: UsageType
    quantity: float
    within_limits: bool
    current_usage: float
    limits: Dict[str, float]

# ===== INVOICE SCHEMAS =====

class InvoiceBase(BaseModel):
    organization_id: int = Field(..., gt=0)
    subscription_id: Optional[int] = Field(None, gt=0)
    subtotal: Decimal = Field(..., ge=0)
    tax_amount: Decimal = Field(default=0, ge=0)
    total: Decimal = Field(..., ge=0)
    amount_due: Decimal = Field(..., ge=0)
    amount_paid: Decimal = Field(default=0, ge=0)
    status: InvoiceStatus = Field(default=InvoiceStatus.DRAFT)
    due_date: datetime
    line_items: List[Dict[str, Any]] = Field(default_factory=list)
    period_start: datetime
    period_end: datetime
    payment_terms_days: int = Field(default=30, ge=1)
    late_fee_amount: Decimal = Field(default=0, ge=0)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceUpdate(BaseModel):
    subtotal: Optional[Decimal] = Field(None, ge=0)
    tax_amount: Optional[Decimal] = Field(None, ge=0)
    total: Optional[Decimal] = Field(None, ge=0)
    status: Optional[InvoiceStatus] = None
    due_date: Optional[datetime] = None
    line_items: Optional[List[Dict[str, Any]]] = None
    payment_terms_days: Optional[int] = Field(None, ge=1)
    late_fee_amount: Optional[Decimal] = Field(None, ge=0)
    metadata: Optional[Dict[str, Any]] = None
    pdf_url: Optional[str] = Field(None, max_length=500)

class InvoiceResponse(BaseModel):
    id: int
    organization_id: int
    subscription_id: Optional[int]
    invoice_number: str
    stripe_invoice_id: Optional[str]
    subtotal: Decimal
    tax_amount: Decimal
    total: Decimal
    amount_due: Decimal
    amount_paid: Decimal
    status: str
    due_date: Optional[datetime]
    paid_at: Optional[datetime]
    voided_at: Optional[datetime]
    line_items: List[Dict[str, Any]]
    period_start: datetime
    period_end: datetime
    payment_terms_days: int
    late_fee_amount: Decimal
    pdf_url: Optional[str]
    pdf_generated_at: Optional[datetime]
    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm(cls, invoice):
        return cls(
            id=invoice.id,
            organization_id=invoice.organization_id,
            subscription_id=invoice.subscription_id,
            invoice_number=invoice.invoice_number,
            stripe_invoice_id=invoice.stripe_invoice_id,
            subtotal=invoice.subtotal,
            tax_amount=invoice.tax_amount,
            total=invoice.total,
            amount_due=invoice.amount_due,
            amount_paid=invoice.amount_paid,
            status=invoice.status,
            due_date=invoice.due_date,
            paid_at=invoice.paid_at,
            voided_at=invoice.voided_at,
            line_items=invoice.line_items or [],
            period_start=invoice.period_start,
            period_end=invoice.period_end,
            payment_terms_days=invoice.payment_terms_days,
            late_fee_amount=invoice.late_fee_amount,
            pdf_url=invoice.pdf_url,
            pdf_generated_at=invoice.pdf_generated_at,
            metadata=invoice.metadata or {},
            created_at=invoice.created_at,
            updated_at=invoice.updated_at
        )

class InvoiceListResponse(BaseModel):
    invoices: List[InvoiceResponse]
    total: int
    limit: int
    offset: int

# ===== PAYMENT SCHEMAS =====

class PaymentBase(BaseModel):
    organization_id: int = Field(..., gt=0)
    invoice_id: Optional[int] = Field(None, gt=0)
    subscription_id: Optional[int] = Field(None, gt=0)
    amount: Decimal = Field(..., gt=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    payment_method: Optional[str] = Field(None, max_length=50)
    payment_method_details: Dict[str, Any] = Field(default_factory=dict)
    receipt_email: Optional[str] = Field(None, max_length=320)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(BaseModel):
    id: int
    organization_id: int
    invoice_id: Optional[int]
    subscription_id: Optional[int]
    stripe_payment_intent_id: Optional[str]
    stripe_charge_id: Optional[str]
    amount: Decimal
    currency: str
    status: str
    payment_method: Optional[str]
    payment_method_details: Dict[str, Any]
    failure_code: Optional[str]
    failure_message: Optional[str]
    receipt_url: Optional[str]
    receipt_email: Optional[str]
    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: Optional[datetime]
    processed_at: Optional[datetime]
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm(cls, payment):
        return cls(
            id=payment.id,
            organization_id=payment.organization_id,
            invoice_id=payment.invoice_id,
            subscription_id=payment.subscription_id,
            stripe_payment_intent_id=payment.stripe_payment_intent_id,
            stripe_charge_id=payment.stripe_charge_id,
            amount=payment.amount,
            currency=payment.currency,
            status=payment.status,
            payment_method=payment.payment_method,
            payment_method_details=payment.payment_method_details or {},
            failure_code=payment.failure_code,
            failure_message=payment.failure_message,
            receipt_url=payment.receipt_url,
            receipt_email=payment.receipt_email,
            metadata=payment.metadata or {},
            created_at=payment.created_at,
            updated_at=payment.updated_at,
            processed_at=payment.processed_at
        )

class PaymentIntentResponse(BaseModel):
    payment_id: int
    client_secret: str
    amount: int
    currency: str
    status: str

# ===== CUSTOMER PORTAL SCHEMAS =====

class CustomerPortalBase(BaseModel):
    organization_id: int = Field(..., gt=0)
    allowed_actions: Dict[str, Any] = Field(default_factory=dict)
    return_url: Optional[str] = Field(None, max_length=500)
    created_by: int = Field(..., gt=0)

class CustomerPortalCreate(CustomerPortalBase):
    pass

class CustomerPortalResponse(BaseModel):
    portal_id: int
    portal_url: str
    expires_at: datetime
    
    @classmethod
    def from_orm(cls, portal):
        return cls(
            portal_id=portal.id,
            portal_url=f"https://billing.stripe.com/p/session/{portal.stripe_portal_session_id}",
            expires_at=portal.expires_at
        )

# ===== ANALYTICS SCHEMAS =====

class RevenueAnalyticsResponse(BaseModel):
    organization_id: int
    period_start: datetime
    period_end: datetime
    total_revenue: float
    mrr: float
    arr: float
    daily_revenue: Dict[str, float]
    subscription_upgrades: int
    subscription_cancellations: int

class ChurnAnalysisResponse(BaseModel):
    organization_id: int
    period_start: datetime
    period_end: datetime
    total_customers: int
    churned_customers: int
    new_customers: int
    churn_rate: float
    churned_mrr: float
    new_mrr: float
    net_mrr_change: float
    churn_reasons: Dict[str, float]
    churn_risk_score: float
    risk_factors: Dict[str, float]

class BillingDashboardResponse(BaseModel):
    organization_id: int
    subscription: SubscriptionResponse
    plan: str
    mrr: float
    arr: float
    usage: UsageSummaryResponse
    recent_invoices: List[InvoiceResponse]
    recent_payments: List[PaymentResponse]
    next_billing_date: Optional[datetime]

# ===== QUOTA SCHEMAS =====

class QuotaConfigurationBase(BaseModel):
    organization_id: int = Field(..., gt=0)
    quota_type: UsageType
    soft_limit: Optional[Decimal] = Field(None, gt=0)
    hard_limit: Decimal = Field(..., gt=0)
    period_start: datetime
    period_end: datetime
    action_on_soft_limit: str = Field(default="warn", max_length=50)
    action_on_hard_limit: str = Field(default="block", max_length=50)
    notification_emails: List[str] = Field(default_factory=list)

class QuotaConfigurationCreate(QuotaConfigurationBase):
    is_active: bool = Field(default=True)

class QuotaConfigurationResponse(BaseModel):
    id: int
    organization_id: int
    quota_type: str
    soft_limit: Optional[Decimal]
    hard_limit: Decimal
    period_start: datetime
    period_end: datetime
    action_on_soft_limit: str
    action_on_hard_limit: str
    notification_emails: List[str]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm(cls, quota):
        return cls(
            id=quota.id,
            organization_id=quota.organization_id,
            quota_type=quota.quota_type,
            soft_limit=quota.soft_limit,
            hard_limit=quota.hard_limit,
            period_start=quota.period_start,
            period_end=quota.period_end,
            action_on_soft_limit=quota.action_on_soft_limit,
            action_on_hard_limit=quota.action_on_hard_limit,
            notification_emails=quota.notification_emails or [],
            is_active=quota.is_active,
            created_at=quota.created_at,
            updated_at=quota.updated_at
        )

# ===== ENUM VALIDATION HELPERS =====

class BillingIntervalEnum(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not isinstance(v, str):
            raise TypeError('string required')
        if v not in [interval.value for interval in BillingInterval]:
            raise ValueError(f'invalid billing interval: {v}')
        return v

class UsageTypeEnum(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not isinstance(v, str):
            raise TypeError('string required')
        if v not in [usage_type.value for usage_type in UsageType]:
            raise ValueError(f'invalid usage type: {v}')
        return v

class EventTypeEnum(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not isinstance(v, str):
            raise TypeError('string required')
        if v not in [event_type.value for event_type in EventType]:
            raise ValueError(f'invalid event type: {v}')
        return v

# ===== RESPONSE MODELS FOR AGGREGATED DATA =====

class SubscriptionWithPlan(BaseModel):
    subscription: SubscriptionResponse
    plan: SubscriptionPlanResponse

class UsageWithLimits(BaseModel):
    current_usage: Dict[str, float]
    limits: Dict[str, Union[int, float]]
    usage_percentage: Dict[str, float]
    warnings: List[str]

class BillingSummary(BaseModel):
    organization_id: int
    current_subscription: Optional[SubscriptionResponse]
    current_plan: Optional[SubscriptionPlanResponse]
    mrr: float
    arr: float
    usage: Optional[UsageWithLimits]
    next_billing_date: Optional[datetime]
    payment_method_on_file: bool
    invoice_count: int
    overdue_invoices: int

class RevenueBreakdown(BaseModel):
    total_revenue: float
    subscription_revenue: float
    usage_revenue: float
    one_time_revenue: float
    refunds: float
    net_revenue: float

# ===== REQUEST MODELS FOR BULK OPERATIONS =====

class BulkUsageRecord(BaseModel):
    events: List[UsageRecordCreate]

class BulkInvoiceCreate(BaseModel):
    invoices: List[InvoiceCreate]

class BulkPaymentProcess(BaseModel):
    payment_ids: List[int]
    action: str  # 'refund', 'charge', 'cancel'

# ===== ERROR RESPONSE MODELS =====

class BillingErrorResponse(BaseModel):
    error: str
    message: str
    code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class QuotaExceededError(BaseModel):
    error: str = "quota_exceeded"
    message: str
    quota_type: str
    current_usage: float
    limit: float
    upgrade_url: Optional[str] = None

class PaymentFailedError(BaseModel):
    error: str = "payment_failed"
    message: str
    payment_id: int
    failure_code: Optional[str] = None
    retry_after: Optional[int] = None  # seconds

# ===== WEBHOOK SCHEMAS =====

class StripeWebhookEvent(BaseModel):
    id: str
    object: str
    type: str
    data: Dict[str, Any]
    created: int

class PaymentWebhookData(BaseModel):
    object: Dict[str, Any]

class SubscriptionWebhookData(BaseModel):
    object: Dict[str, Any]

class InvoiceWebhookData(BaseModel):
    object: Dict[str, Any]

# ===== FILTER AND SEARCH SCHEMAS =====

class InvoiceFilter(BaseModel):
    organization_id: Optional[int] = None
    status: Optional[InvoiceStatus] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    amount_min: Optional[Decimal] = None
    amount_max: Optional[Decimal] = None

class PaymentFilter(BaseModel):
    organization_id: Optional[int] = None
    status: Optional[PaymentStatus] = None
    payment_method: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    amount_min: Optional[Decimal] = None
    amount_max: Optional[Decimal] = None

class UsageFilter(BaseModel):
    organization_id: Optional[int] = None
    usage_type: Optional[UsageType] = None
    event_type: Optional[EventType] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    user_id: Optional[int] = None
    dashboard_id: Optional[int] = None

class DateRange(BaseModel):
    start_date: datetime
    end_date: datetime
    
    @validator('end_date')
    def end_date_after_start_date(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v