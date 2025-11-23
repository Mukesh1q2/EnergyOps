"""
Billing & SaaS Operations Models
Phase 8: Comprehensive Billing System

Enterprise-grade billing system with subscription management,
usage-based metering, payment processing, and revenue analytics.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from enum import Enum
from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, JSON, Text, Float, 
    ForeignKey, Enum as SQLEnum, DECIMAL, LargeBinary
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class BillingInterval(str, Enum):
    """Billing interval enumeration"""
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUAL = "annual"

class BillingStatus(str, Enum):
    """Billing status enumeration"""
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    TRIAL = "trial"
    UNPAID = "unpaid"

class InvoiceStatus(str, Enum):
    """Invoice status enumeration"""
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELED = "canceled"
    REFUNDED = "refunded"

class PaymentStatus(str, Enum):
    """Payment status enumeration"""
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELED = "canceled"
    REFUNDED = "refunded"

class UsageType(str, Enum):
    """Usage type enumeration"""
    API_CALLS = "api_calls"
    STORAGE_GB = "storage_gb"
    USERS = "users"
    DASHBOARDS = "dashboards"
    REALTIME_CONNECTIONS = "realtime_connections"
    DATA_PROCESSING_GB = "data_processing_gb"
    EXPORT_REQUESTS = "export_requests"
    AI_QUERIES = "ai_queries"

class EventType(str, Enum):
    """Usage event type enumeration"""
    API_CALL = "api_call"
    FILE_UPLOAD = "file_upload"
    DASHBOARD_CREATE = "dashboard_create"
    USER_ADD = "user_add"
    REALTIME_CONNECT = "realtime_connect"
    DATA_EXPORT = "data_export"
    AI_QUERY = "ai_query"
    STORAGE_USAGE = "storage_usage"

class RevenueEventType(str, Enum):
    """Revenue event type enumeration"""
    SUBSCRIPTION_START = "subscription_start"
    SUBSCRIPTION_UPGRADE = "subscription_upgrade"
    SUBSCRIPTION_DOWNGRADE = "subscription_downgrade"
    SUBSCRIPTION_CANCEL = "subscription_cancel"
    PAYMENT_SUCCESS = "payment_success"
    PAYMENT_FAILURE = "payment_failure"
    USAGE_BILLING = "usage_billing"
    PRORATION = "proration"
    REFUND = "refund"

class SubscriptionPlan(Base):
    """
    Subscription plan configuration with tiered pricing
    """
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    key = Column(String(50), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    
    # Pricing configuration
    price_monthly = Column(DECIMAL(10, 2), nullable=False, default=0.00)
    price_annual = Column(DECIMAL(10, 2), nullable=False, default=0.00)
    currency = Column(String(3), nullable=False, default="USD")
    
    # Usage limits
    max_users = Column(Integer, nullable=False, default=5)
    max_dashboards = Column(Integer, nullable=False, default=10)
    max_storage_gb = Column(Integer, nullable=False, default=5)
    api_calls_limit_monthly = Column(Integer, nullable=False, default=10000)
    
    # Feature flags
    features = Column(JSON, nullable=False, default={})
    
    # Plan status
    is_active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    
    # Custom pricing support
    allow_custom_pricing = Column(Boolean, default=False)
    custom_pricing_minimum = Column(DECIMAL(10, 2), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert subscription plan to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "key": self.key,
            "description": self.description,
            "price_monthly": float(self.price_monthly),
            "price_annual": float(self.price_annual),
            "currency": self.currency,
            "max_users": self.max_users,
            "max_dashboards": self.max_dashboards,
            "max_storage_gb": self.max_storage_gb,
            "api_calls_limit_monthly": self.api_calls_limit_monthly,
            "features": self.features,
            "is_active": self.is_active,
            "is_public": self.is_public,
            "sort_order": self.sort_order,
            "allow_custom_pricing": self.allow_custom_pricing,
            "custom_pricing_minimum": float(self.custom_pricing_minimum) if self.custom_pricing_minimum else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class Subscription(Base):
    """
    Organization subscription management
    """
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=False)
    
    # Subscription details
    stripe_subscription_id = Column(String(100), nullable=True, unique=True)
    customer_id = Column(String(100), nullable=True)
    
    # Billing configuration
    billing_interval = Column(String(20), nullable=False, default=BillingInterval.MONTHLY.value)
    status = Column(String(20), nullable=False, default=BillingStatus.TRIAL.value)
    
    # Trial management
    is_trial = Column(Boolean, default=False)
    trial_ends_at = Column(DateTime(timezone=True), nullable=True)
    
    # Billing periods
    current_period_start = Column(DateTime(timezone=True), nullable=False)
    current_period_end = Column(DateTime(timezone=True), nullable=False)
    
    # Cancellation
    canceled_at = Column(DateTime(timezone=True), nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)
    
    # Pricing overrides
    custom_price_monthly = Column(DECIMAL(10, 2), nullable=True)
    custom_price_annual = Column(DECIMAL(10, 2), nullable=True)
    
    # Metadata
    metadata = Column(JSON, nullable=True, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    organization = relationship("Organization")
    plan = relationship("SubscriptionPlan")
    usage_records = relationship("UsageRecord", back_populates="subscription")
    invoices = relationship("Invoice", back_populates="subscription")
    payments = relationship("Payment", back_populates="subscription")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert subscription to dictionary"""
        return {
            "id": self.id,
            "organization_id": self.organization_id,
            "plan_id": self.plan_id,
            "stripe_subscription_id": self.stripe_subscription_id,
            "customer_id": self.customer_id,
            "billing_interval": self.billing_interval,
            "status": self.status,
            "is_trial": self.is_trial,
            "trial_ends_at": self.trial_ends_at.isoformat() if self.trial_ends_at else None,
            "current_period_start": self.current_period_start.isoformat() if self.current_period_start else None,
            "current_period_end": self.current_period_end.isoformat() if self.current_period_end else None,
            "canceled_at": self.canceled_at.isoformat() if self.canceled_at else None,
            "cancel_at_period_end": self.cancel_at_period_end,
            "custom_price_monthly": float(self.custom_price_monthly) if self.custom_price_monthly else None,
            "custom_price_annual": float(self.custom_price_annual) if self.custom_price_annual else None,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class UsageRecord(Base):
    """
    Usage tracking for metered billing
    """
    __tablename__ = "usage_records"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=False)
    
    # Usage details
    usage_type = Column(String(50), nullable=False)  # UsageType
    quantity = Column(DECIMAL(15, 6), nullable=False, default=0)
    unit = Column(String(20), nullable=True)
    
    # Event information
    event_type = Column(String(50), nullable=False)  # EventType
    event_data = Column(JSON, nullable=True, default={})
    resource_id = Column(String(100), nullable=True)
    
    # Billing period
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    
    # Attribution
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    dashboard_id = Column(Integer, nullable=True)
    
    # Status
    is_billable = Column(Boolean, default=True)
    is_processed = Column(Boolean, default=False)
    
    # Timestamps
    recorded_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    organization = relationship("Organization")
    subscription = relationship("Subscription", back_populates="usage_records")
    user = relationship("User")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert usage record to dictionary"""
        return {
            "id": self.id,
            "organization_id": self.organization_id,
            "subscription_id": self.subscription_id,
            "usage_type": self.usage_type,
            "quantity": float(self.quantity),
            "unit": self.unit,
            "event_type": self.event_type,
            "event_data": self.event_data,
            "resource_id": self.resource_id,
            "period_start": self.period_start.isoformat() if self.period_start else None,
            "period_end": self.period_end.isoformat() if self.period_end else None,
            "user_id": self.user_id,
            "dashboard_id": self.dashboard_id,
            "is_billable": self.is_billable,
            "is_processed": self.is_processed,
            "recorded_at": self.recorded_at.isoformat() if self.recorded_at else None
        }

class Invoice(Base):
    """
    Invoice generation and management
    """
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=True)
    
    # Invoice details
    invoice_number = Column(String(50), nullable=False, unique=True, index=True)
    stripe_invoice_id = Column(String(100), nullable=True, unique=True)
    
    # Amounts
    subtotal = Column(DECIMAL(10, 2), nullable=False, default=0.00)
    tax_amount = Column(DECIMAL(10, 2), nullable=False, default=0.00)
    total = Column(DECIMAL(10, 2), nullable=False, default=0.00)
    amount_due = Column(DECIMAL(10, 2), nullable=False, default=0.00)
    amount_paid = Column(DECIMAL(10, 2), nullable=False, default=0.00)
    
    # Status and dates
    status = Column(String(20), nullable=False, default=InvoiceStatus.DRAFT.value)
    due_date = Column(DateTime(timezone=True), nullable=False)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    voided_at = Column(DateTime(timezone=True), nullable=True)
    
    # Line items
    line_items = Column(JSON, nullable=True, default=[])
    
    # Billing period
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    
    # Payment information
    payment_terms_days = Column(Integer, default=30)
    late_fee_amount = Column(DECIMAL(10, 2), default=0.00)
    
    # PDF generation
    pdf_url = Column(String(500), nullable=True)
    pdf_generated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    metadata = Column(JSON, nullable=True, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    organization = relationship("Organization")
    subscription = relationship("Subscription", back_populates="invoices")
    payments = relationship("Payment", back_populates="invoice")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert invoice to dictionary"""
        return {
            "id": self.id,
            "organization_id": self.organization_id,
            "subscription_id": self.subscription_id,
            "invoice_number": self.invoice_number,
            "stripe_invoice_id": self.stripe_invoice_id,
            "subtotal": float(self.subtotal),
            "tax_amount": float(self.tax_amount),
            "total": float(self.total),
            "amount_due": float(self.amount_due),
            "amount_paid": float(self.amount_paid),
            "status": self.status,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
            "voided_at": self.voided_at.isoformat() if self.voided_at else None,
            "line_items": self.line_items,
            "period_start": self.period_start.isoformat() if self.period_start else None,
            "period_end": self.period_end.isoformat() if self.period_end else None,
            "payment_terms_days": self.payment_terms_days,
            "late_fee_amount": float(self.late_fee_amount),
            "pdf_url": self.pdf_url,
            "pdf_generated_at": self.pdf_generated_at.isoformat() if self.pdf_generated_at else None,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class Payment(Base):
    """
    Payment processing and tracking
    """
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=True)
    
    # Payment details
    stripe_payment_intent_id = Column(String(100), nullable=True, unique=True)
    stripe_charge_id = Column(String(100), nullable=True, unique=True)
    
    # Amount and currency
    amount = Column(DECIMAL(10, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="USD")
    
    # Status and method
    status = Column(String(20), nullable=False, default=PaymentStatus.PENDING.value)
    payment_method = Column(String(50), nullable=True)  # card, bank_transfer, etc.
    payment_method_details = Column(JSON, nullable=True, default={})
    
    # Failure information
    failure_code = Column(String(100), nullable=True)
    failure_message = Column(Text, nullable=True)
    
    # Receipt information
    receipt_url = Column(String(500), nullable=True)
    receipt_email = Column(String(320), nullable=True)
    
    # Metadata
    metadata = Column(JSON, nullable=True, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    organization = relationship("Organization")
    invoice = relationship("Invoice", back_populates="payments")
    subscription = relationship("Subscription", back_populates="payments")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert payment to dictionary"""
        return {
            "id": self.id,
            "organization_id": self.organization_id,
            "invoice_id": self.invoice_id,
            "subscription_id": self.subscription_id,
            "stripe_payment_intent_id": self.stripe_payment_intent_id,
            "stripe_charge_id": self.stripe_charge_id,
            "amount": float(self.amount),
            "currency": self.currency,
            "status": self.status,
            "payment_method": self.payment_method,
            "payment_method_details": self.payment_method_details,
            "failure_code": self.failure_code,
            "failure_message": self.failure_message,
            "receipt_url": self.receipt_url,
            "receipt_email": self.receipt_email,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "processed_at": self.processed_at.isoformat() if self.processed_at else None
        }

class CustomerPortal(Base):
    """
    Self-service customer portal configuration
    """
    __tablename__ = "customer_portals"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    
    # Stripe customer portal
    stripe_portal_session_id = Column(String(100), nullable=True, unique=True)
    
    # Portal configuration
    allowed_actions = Column(JSON, nullable=True, default={})
    return_url = Column(String(500), nullable=True)
    
    # Status
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    organization = relationship("Organization")
    creator = relationship("User", foreign_keys=[created_by])
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert customer portal to dictionary"""
        return {
            "id": self.id,
            "organization_id": self.organization_id,
            "stripe_portal_session_id": self.stripe_portal_session_id,
            "allowed_actions": self.allowed_actions,
            "return_url": self.return_url,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "used_at": self.used_at.isoformat() if self.used_at else None,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class RevenueEvent(Base):
    """
    Revenue analytics and event tracking
    """
    __tablename__ = "revenue_events"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    
    # Event details
    event_type = Column(String(50), nullable=False)  # RevenueEventType
    amount = Column(DECIMAL(10, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="USD")
    
    # Attribution
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True)
    
    # Period information
    period_start = Column(DateTime(timezone=True), nullable=True)
    period_end = Column(DateTime(timezone=True), nullable=True)
    
    # Additional details
    metadata = Column(JSON, nullable=True, default={})
    
    # Timestamps
    event_timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    organization = relationship("Organization")
    subscription = relationship("Subscription")
    invoice = relationship("Invoice")
    payment = relationship("Payment")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert revenue event to dictionary"""
        return {
            "id": self.id,
            "organization_id": self.organization_id,
            "event_type": self.event_type,
            "amount": float(self.amount),
            "currency": self.currency,
            "subscription_id": self.subscription_id,
            "invoice_id": self.invoice_id,
            "payment_id": self.payment_id,
            "period_start": self.period_start.isoformat() if self.period_start else None,
            "period_end": self.period_end.isoformat() if self.period_end else None,
            "metadata": self.metadata,
            "event_timestamp": self.event_timestamp.isoformat() if self.event_timestamp else None
        }

class QuotaConfiguration(Base):
    """
    Quota management and limits configuration
    """
    __tablename__ = "quota_configurations"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    
    # Quota type
    quota_type = Column(String(50), nullable=False)  # UsageType
    
    # Limits
    soft_limit = Column(DECIMAL(15, 6), nullable=True)  # Warning threshold
    hard_limit = Column(DECIMAL(15, 6), nullable=False)  # Enforced limit
    
    # Time period
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    
    # Actions
    action_on_soft_limit = Column(String(50), default="warn")  # warn, throttle, block
    action_on_hard_limit = Column(String(50), default="block")  # warn, throttle, block
    notification_emails = Column(JSON, nullable=True, default=[])
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    organization = relationship("Organization")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert quota configuration to dictionary"""
        return {
            "id": self.id,
            "organization_id": self.organization_id,
            "quota_type": self.quota_type,
            "soft_limit": float(self.soft_limit) if self.soft_limit else None,
            "hard_limit": float(self.hard_limit),
            "period_start": self.period_start.isoformat() if self.period_start else None,
            "period_end": self.period_end.isoformat() if self.period_end else None,
            "action_on_soft_limit": self.action_on_soft_limit,
            "action_on_hard_limit": self.action_on_hard_limit,
            "notification_emails": self.notification_emails,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class ChurnAnalysis(Base):
    """
    Churn analysis and customer retention tracking
    """
    __tablename__ = "churn_analysis"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    
    # Analysis period
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    
    # Metrics
    total_customers = Column(Integer, default=0)
    churned_customers = Column(Integer, default=0)
    new_customers = Column(Integer, default=0)
    churn_rate = Column(Float, default=0.0)
    
    # Revenue impact
    churned_mrr = Column(DECIMAL(10, 2), default=0.00)
    new_mrr = Column(DECIMAL(10, 2), default=0.00)
    net_mrr_change = Column(DECIMAL(10, 2), default=0.00)
    
    # Churn reasons
    churn_reasons = Column(JSON, nullable=True, default={})
    
    # Risk factors
    churn_risk_score = Column(Float, default=0.0)
    risk_factors = Column(JSON, nullable=True, default={})
    
    # Timestamps
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    organization = relationship("Organization")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert churn analysis to dictionary"""
        return {
            "id": self.id,
            "organization_id": self.organization_id,
            "period_start": self.period_start.isoformat() if self.period_start else None,
            "period_end": self.period_end.isoformat() if self.period_end else None,
            "total_customers": self.total_customers,
            "churned_customers": self.churned_customers,
            "new_customers": self.new_customers,
            "churn_rate": self.churn_rate,
            "churned_mrr": float(self.churned_mrr),
            "new_mrr": float(self.new_mrr),
            "net_mrr_change": float(self.net_mrr_change),
            "churn_reasons": self.churn_reasons,
            "churn_risk_score": self.churn_risk_score,
            "risk_factors": self.risk_factors,
            "calculated_at": self.calculated_at.isoformat() if self.calculated_at else None
        }

# Utility functions for billing operations
def create_default_subscription_plans() -> List[Dict[str, Any]]:
    """Create default subscription plans"""
    return [
        {
            "name": "Free",
            "key": "free",
            "description": "Perfect for getting started with basic features",
            "price_monthly": 0.00,
            "price_annual": 0.00,
            "max_users": 3,
            "max_dashboards": 5,
            "max_storage_gb": 1,
            "api_calls_limit_monthly": 5000,
            "features": {
                "basic_dashboard": True,
                "file_upload": True,
                "basic_analytics": True,
                "export_csv": True,
                "support": "community"
            }
        },
        {
            "name": "Professional",
            "key": "professional",
            "description": "Advanced features for growing teams",
            "price_monthly": 99.00,
            "price_annual": 990.00,  # 2 months free
            "max_users": 25,
            "max_dashboards": 100,
            "max_storage_gb": 50,
            "api_calls_limit_monthly": 100000,
            "features": {
                "everything_in_free": True,
                "knowledge_graphs": True,
                "ai_assistant": True,
                "advanced_analytics": True,
                "real_time_collaboration": True,
                "api_access": True,
                "export_pdf": True,
                "custom_themes": True,
                "support": "email"
            }
        },
        {
            "name": "Enterprise",
            "key": "enterprise",
            "description": "Enterprise-grade features and support",
            "price_monthly": 299.00,
            "price_annual": 2990.00,  # 2 months free
            "max_users": 500,
            "max_dashboards": 1000,
            "max_storage_gb": 500,
            "api_calls_limit_monthly": 1000000,
            "features": {
                "everything_in_professional": True,
                "advanced_security": True,
                "sso_integration": True,
                "priority_support": True,
                "custom_integrations": True,
                "white_labeling": True,
                "dedicated_account_manager": True,
                "sla_guarantee": True
            },
            "allow_custom_pricing": True,
            "custom_pricing_minimum": 250.00
        }
    ]

def calculate_mrr(subscription: Subscription) -> float:
    """Calculate Monthly Recurring Revenue for subscription"""
    if subscription.is_trial or subscription.status != BillingStatus.ACTIVE:
        return 0.0
    
    if subscription.billing_interval == BillingInterval.MONTHLY.value:
        monthly_amount = subscription.custom_price_monthly or subscription.plan.price_monthly
    elif subscription.billing_interval == BillingInterval.ANNUAL.value:
        monthly_amount = (subscription.custom_price_annual or subscription.plan.price_annual) / 12
    else:  # QUARTERLY
        quarterly_amount = (subscription.custom_price_monthly or subscription.plan.price_monthly) * 3
        monthly_amount = quarterly_amount / 3
    
    return float(monthly_amount)

def calculate_arr(subscription: Subscription) -> float:
    """Calculate Annual Recurring Revenue for subscription"""
    if subscription.is_trial or subscription.status != BillingStatus.ACTIVE:
        return 0.0
    
    if subscription.billing_interval == BillingInterval.MONTHLY.value:
        annual_amount = (subscription.custom_price_monthly or subscription.plan.price_monthly) * 12
    else:  # ANNUAL or QUARTERLY
        annual_amount = subscription.custom_price_annual or subscription.plan.price_annual
    
    return float(annual_amount)

def calculate_customer_ltv(organization_id: int, avg_monthly_revenue: float, avg_lifespan_months: float) -> float:
    """Calculate Customer Lifetime Value"""
    return avg_monthly_revenue * avg_lifespan_months

def process_usage_event(
    organization_id: int,
    usage_type: UsageType,
    quantity: float,
    event_type: EventType,
    user_id: Optional[int] = None,
    resource_id: Optional[str] = None,
    event_data: Optional[Dict[str, Any]] = None
) -> UsageRecord:
    """Process a usage event and create usage record"""
    # This would be implemented to create usage records in production
    # For now, return a mock usage record
    from datetime import datetime
    period_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    period_end = period_start + timedelta(days=31)
    
    return UsageRecord(
        organization_id=organization_id,
        subscription_id=1,  # Would be looked up
        usage_type=usage_type.value,
        quantity=quantity,
        unit=usage_type.value,
        event_type=event_type.value,
        event_data=event_data or {},
        resource_id=resource_id,
        period_start=period_start,
        period_end=period_end,
        user_id=user_id
    )

def check_quota_limits(organization_id: int, usage_type: UsageType, quantity: float) -> Dict[str, Any]:
    """Check quota limits for organization"""
    # This would implement quota checking logic
    # For now, return mock response
    return {
        "within_limits": True,
        "current_usage": 1000.0,
        "soft_limit": 5000.0,
        "hard_limit": 10000.0,
        "action": "none"
    }