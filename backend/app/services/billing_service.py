"""
Billing Service with Stripe Integration
Handles subscription management, usage tracking, and billing operations
"""
import asyncio
import json
import os
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, List, Optional, Any, Union
from enum import Enum
from uuid import UUID

import asyncpg
from fastapi import HTTPException, status
from pydantic import BaseModel, Field
import stripe

# Import PermissionType from rbac_service
from .rbac_service import PermissionType
try:
    from stripe.error import StripeError, InvalidRequestError
except ImportError:
    # Fallback for newer stripe versions
    from stripe import StripeError
    InvalidRequestError = StripeError

# Stripe configuration
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_...")


class BillingPlan(str, Enum):
    """Available billing plans"""
    FREE = "free"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class SubscriptionStatus(str, Enum):
    """Subscription status enum"""
    ACTIVE = "active"
    CANCELED = "canceled"
    PAST_DUE = "past_due"
    UNPAID = "unpaid"
    TRIALING = "trialing"
    INCOMPLETE = "incomplete"
    INCOMPLETE_EXPIRED = "incomplete_expired"


class UsageType(str, Enum):
    """Usage tracking types"""
    API_CALLS = "api_calls"
    DASHBOARD_CREATED = "dashboard_created"
    STORAGE_GB = "storage_gb"
    USERS = "users"
    EXPORTS = "exports"
    SHARES = "shares"


class BillingPlanDefinition(BaseModel):
    """Billing plan definition"""
    plan_id: BillingPlan
    name: str
    description: str
    monthly_price: Decimal
    yearly_price: Optional[Decimal] = None
    currency: str = "usd"
    features: List[str]
    limits: Dict[str, Union[int, str]]
    stripe_price_id_monthly: Optional[str] = None
    stripe_price_id_yearly: Optional[str] = None


class UsageRecord(BaseModel):
    """Usage tracking record"""
    id: UUID = Field(default_factory=uuid.uuid4)
    organization_id: UUID
    usage_type: UsageType
    quantity: int = 1
    metadata: Dict[str, Any] = Field(default_factory=dict)
    recorded_at: datetime = Field(default_factory=datetime.utcnow)
    billing_period_start: datetime
    billing_period_end: datetime


class Subscription(BaseModel):
    """Subscription model"""
    id: UUID = Field(default_factory=uuid.uuid4)
    organization_id: UUID
    plan_id: BillingPlan
    stripe_subscription_id: Optional[str] = None
    status: SubscriptionStatus
    current_period_start: datetime
    current_period_end: datetime
    cancel_at_period_end: bool = False
    canceled_at: Optional[datetime] = None
    trial_start: Optional[datetime] = None
    trial_end: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Invoice(BaseModel):
    """Invoice model"""
    id: UUID = Field(default_factory=uuid.uuid4)
    organization_id: UUID
    subscription_id: UUID
    stripe_invoice_id: Optional[str] = None
    amount: Decimal
    currency: str = "usd"
    status: str
    due_date: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    invoice_url: Optional[str] = None


class BillingService:
    """Comprehensive billing and subscription service"""
    
    def __init__(self, db_pool: asyncpg.Pool, rbac_service):
        self.db_pool = db_pool
        self.rbac_service = rbac_service
        self._plan_definitions = self._initialize_plans()
    
    def _initialize_plans(self) -> Dict[BillingPlan, BillingPlanDefinition]:
        """Initialize billing plan definitions"""
        return {
            BillingPlan.FREE: BillingPlanDefinition(
                plan_id=BillingPlan.FREE,
                name="Free",
                description="Free tier for development and testing",
                monthly_price=Decimal("0.00"),
                yearly_price=None,
                features=[
                    "Basic dashboards",
                    "Up to 3 users",
                    "1GB storage",
                    "100 API calls/day",
                    "Community support"
                ],
                limits={
                    "users": 3,
                    "storage_gb": 1,
                    "api_calls_per_day": 100,
                    "dashboards": 5,
                    "exports_per_month": 10
                }
            ),
            BillingPlan.STARTER: BillingPlanDefinition(
                plan_id=BillingPlan.STARTER,
                name="Starter",
                description="Perfect for small teams getting started",
                monthly_price=Decimal("99.00"),
                yearly_price=Decimal("999.00"),  # 2 months free
                features=[
                    "All dashboard features",
                    "Up to 10 users",
                    "10GB storage",
                    "10,000 API calls/day",
                    "Basic forecasting",
                    "Email support"
                ],
                limits={
                    "users": 10,
                    "storage_gb": 10,
                    "api_calls_per_day": 10000,
                    "dashboards": 25,
                    "exports_per_month": 100
                },
                stripe_price_id_monthly="price_starter_monthly",
                stripe_price_id_yearly="price_starter_yearly"
            ),
            BillingPlan.PROFESSIONAL: BillingPlanDefinition(
                plan_id=BillingPlan.PROFESSIONAL,
                name="Professional",
                description="Advanced features for growing organizations",
                monthly_price=Decimal("499.00"),
                yearly_price=Decimal("4999.00"),  # 2 months free
                features=[
                    "All Starter features",
                    "Up to 50 users",
                    "100GB storage",
                    "100,000 API calls/day",
                    "Real-time optimization",
                    "Advanced ML models",
                    "Priority support",
                    "Custom integrations"
                ],
                limits={
                    "users": 50,
                    "storage_gb": 100,
                    "api_calls_per_day": 100000,
                    "dashboards": 100,
                    "exports_per_month": 1000
                },
                stripe_price_id_monthly="price_professional_monthly",
                stripe_price_id_yearly="price_professional_yearly"
            ),
            BillingPlan.ENTERPRISE: BillingPlanDefinition(
                plan_id=BillingPlan.ENTERPRISE,
                name="Enterprise",
                description="Custom solutions for large organizations",
                monthly_price=Decimal("0.00"),  # Custom pricing
                yearly_price=None,
                features=[
                    "All Professional features",
                    "Unlimited users",
                    "Unlimited storage",
                    "Unlimited API calls",
                    "On-premise deployment",
                    "Custom SLA",
                    "Dedicated support",
                    "Custom integrations",
                    "Advanced security"
                ],
                limits={
                    "users": "unlimited",
                    "storage_gb": "unlimited",
                    "api_calls_per_day": "unlimited",
                    "dashboards": "unlimited",
                    "exports_per_month": "unlimited"
                }
            )
        }
    
    async def initialize(self):
        """Initialize billing service and create required database tables"""
        async with self.db_pool.acquire() as conn:
            # Create billing_plans table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS billing_plans (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    plan_id VARCHAR(50) NOT NULL UNIQUE,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    monthly_price DECIMAL(10,2) NOT NULL,
                    yearly_price DECIMAL(10,2),
                    currency VARCHAR(3) DEFAULT 'usd',
                    features JSONB NOT NULL DEFAULT '[]',
                    limits JSONB NOT NULL DEFAULT '{}',
                    stripe_price_id_monthly VARCHAR(255),
                    stripe_price_id_yearly VARCHAR(255),
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """)
            
            # Create subscriptions table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS subscriptions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    organization_id UUID NOT NULL REFERENCES organizations(id),
                    plan_id VARCHAR(50) NOT NULL REFERENCES billing_plans(plan_id),
                    stripe_subscription_id VARCHAR(255) UNIQUE,
                    status VARCHAR(50) NOT NULL,
                    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
                    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
                    cancel_at_period_end BOOLEAN DEFAULT false,
                    canceled_at TIMESTAMP WITH TIME ZONE,
                    trial_start TIMESTAMP WITH TIME ZONE,
                    trial_end TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """)
            
            # Create usage_records table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS usage_records (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    organization_id UUID NOT NULL REFERENCES organizations(id),
                    usage_type VARCHAR(50) NOT NULL,
                    quantity INTEGER NOT NULL DEFAULT 1,
                    metadata JSONB NOT NULL DEFAULT '{}',
                    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    billing_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
                    billing_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
                    INDEX idx_usage_org_period (organization_id, billing_period_start, billing_period_end)
                )
            """)
            
            # Create invoices table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS invoices (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    organization_id UUID NOT NULL REFERENCES organizations(id),
                    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
                    stripe_invoice_id VARCHAR(255) UNIQUE,
                    amount DECIMAL(10,2) NOT NULL,
                    currency VARCHAR(3) DEFAULT 'usd',
                    status VARCHAR(50) NOT NULL,
                    due_date TIMESTAMP WITH TIME ZONE,
                    paid_at TIMESTAMP WITH TIME ZONE,
                    invoice_url TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """)
            
            # Create indexes
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_subscriptions_org 
                ON subscriptions(organization_id)
            """)
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_usage_records_org_period 
                ON usage_records(organization_id, billing_period_start, billing_period_end, usage_type)
            """)
            
            # Insert billing plans
            await self._insert_billing_plans(conn)
    
    async def _insert_billing_plans(self, conn: asyncpg.Connection):
        """Insert billing plan definitions into database"""
        for plan_def in self._plan_definitions.values():
            await conn.execute("""
                INSERT INTO billing_plans 
                (plan_id, name, description, monthly_price, yearly_price, currency,
                 features, limits, stripe_price_id_monthly, stripe_price_id_yearly)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (plan_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    monthly_price = EXCLUDED.monthly_price,
                    yearly_price = EXCLUDED.yearly_price,
                    features = EXCLUDED.features,
                    limits = EXCLUDED.limits,
                    stripe_price_id_monthly = EXCLUDED.stripe_price_id_monthly,
                    stripe_price_id_yearly = EXCLUDED.stripe_price_id_yearly,
                    updated_at = NOW()
            """,
                plan_def.plan_id.value,
                plan_def.name,
                plan_def.description,
                plan_def.monthly_price,
                plan_def.yearly_price,
                plan_def.currency,
                json.dumps(plan_def.features),
                json.dumps(plan_def.limits),
                plan_def.stripe_price_id_monthly,
                plan_def.stripe_price_id_yearly
            )
    
    async def create_subscription(
        self,
        organization_id: UUID,
        plan_id: BillingPlan,
        stripe_customer_id: str,
        payment_method_id: str,
        billing_cycle: str = "monthly",  # monthly or yearly
        user_id: UUID = None
    ) -> Subscription:
        """Create a new subscription"""
        # Check permissions if user_id provided
        if user_id:
            await self.rbac_service.require_permission(
                user_id, organization_id, PermissionType.BILLING_MANAGE
            )
        
        plan_def = self._plan_definitions[plan_id]
        
        if plan_id == BillingPlan.FREE:
            # Handle free tier subscription
            return await self._create_free_subscription(organization_id)
        
        if plan_id == BillingPlan.ENTERPRISE:
            # Enterprise plans require custom setup
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Enterprise plans require custom setup. Please contact sales."
            )
        
        try:
            # Create or retrieve Stripe customer
            customer = await self._ensure_stripe_customer(stripe_customer_id)
            
            # Attach payment method to customer
            await stripe.PaymentMethod.attach(
                payment_method_id,
                customer=customer.id
            )
            
            # Set as default payment method
            await stripe.Customer.modify(
                customer.id,
                invoice_settings={"default_payment_method": payment_method_id}
            )
            
            # Get Stripe price ID
            price_id = (plan_def.stripe_price_id_monthly 
                       if billing_cycle == "monthly" 
                       else plan_def.stripe_price_id_yearly)
            
            if not price_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stripe price ID not configured for {billing_cycle} billing of {plan_id}"
                )
            
            # Create Stripe subscription
            stripe_subscription = stripe.Subscription.create(
                customer=customer.id,
                items=[{"price": price_id}],
                payment_behavior="default_incomplete",
                payment_settings={"save_default_payment_method": "on_subscription"},
                expand=["latest_invoice.payment_intent"],
            )
            
            # Store subscription in database
            async with self.db_pool.acquire() as conn:
                subscription_id = uuid.uuid4()
                
                await conn.execute("""
                    INSERT INTO subscriptions 
                    (id, organization_id, plan_id, stripe_subscription_id, status,
                     current_period_start, current_period_end)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                """,
                    subscription_id,
                    organization_id,
                    plan_id.value,
                    stripe_subscription.id,
                    stripe_subscription.status,
                    datetime.fromtimestamp(stripe_subscription.current_period_start),
                    datetime.fromtimestamp(stripe_subscription.current_period_end)
                )
                
                return Subscription(
                    id=subscription_id,
                    organization_id=organization_id,
                    plan_id=plan_id,
                    stripe_subscription_id=stripe_subscription.id,
                    status=SubscriptionStatus(stripe_subscription.status),
                    current_period_start=datetime.fromtimestamp(stripe_subscription.current_period_start),
                    current_period_end=datetime.fromtimestamp(stripe_subscription.current_period_end)
                )
        
        except StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stripe error: {str(e)}"
            )
    
    async def _create_free_subscription(self, organization_id: UUID) -> Subscription:
        """Create a free tier subscription"""
        async with self.db_pool.acquire() as conn:
            subscription_id = uuid.uuid4()
            now = datetime.utcnow()
            period_end = now + timedelta(days=365)  # Free tier doesn't expire
            
            await conn.execute("""
                INSERT INTO subscriptions 
                (id, organization_id, plan_id, status, current_period_start, current_period_end)
                VALUES ($1, $2, $3, $4, $5, $6)
            """,
                subscription_id,
                organization_id,
                BillingPlan.FREE.value,
                SubscriptionStatus.ACTIVE.value,
                now,
                period_end
            )
            
            return Subscription(
                id=subscription_id,
                organization_id=organization_id,
                plan_id=BillingPlan.FREE,
                status=SubscriptionStatus.ACTIVE,
                current_period_start=now,
                current_period_end=period_end
            )
    
    async def _ensure_stripe_customer(self, stripe_customer_id: str):
        """Ensure Stripe customer exists or create one"""
        try:
            return stripe.Customer.retrieve(stripe_customer_id)
        except InvalidRequestError:
            # Customer doesn't exist, create new one
            return stripe.Customer.create()
    
    async def get_subscription(self, organization_id: UUID) -> Optional[Subscription]:
        """Get current subscription for organization"""
        async with self.db_pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT s.*, bp.plan_id as plan_type
                FROM subscriptions s
                JOIN billing_plans bp ON s.plan_id = bp.plan_id
                WHERE s.organization_id = $1 
                ORDER BY s.created_at DESC
                LIMIT 1
            """, organization_id)
            
            if not row:
                return None
            
            return Subscription(
                id=row['id'],
                organization_id=row['organization_id'],
                plan_id=BillingPlan(row['plan_id']),
                stripe_subscription_id=row['stripe_subscription_id'],
                status=SubscriptionStatus(row['status']),
                current_period_start=row['current_period_start'],
                current_period_end=row['current_period_end'],
                cancel_at_period_end=row['cancel_at_period_end'],
                canceled_at=row['canceled_at'],
                trial_start=row['trial_start'],
                trial_end=row['trial_end'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            )
    
    async def record_usage(
        self,
        organization_id: UUID,
        usage_type: UsageType,
        quantity: int = 1,
        metadata: Dict[str, Any] = None,
        user_id: UUID = None
    ) -> UsageRecord:
        """Record usage for billing purposes"""
        if user_id:
            await self.rbac_service.require_permission(
                user_id, organization_id, PermissionType.BILLING_VIEW
            )
        
        # Get current subscription to determine billing period
        subscription = await self.get_subscription(organization_id)
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active subscription found"
            )
        
        # Calculate billing period
        now = datetime.utcnow()
        period_start = subscription.current_period_start
        period_end = subscription.current_period_end
        
        if now < period_start or now > period_end:
            # Adjust for current billing period
            while now > period_end:
                period_start = period_end
                period_end = period_end + timedelta(days=30)  # Assume monthly
        
        usage_record = UsageRecord(
            organization_id=organization_id,
            usage_type=usage_type,
            quantity=quantity,
            metadata=metadata or {},
            billing_period_start=period_start,
            billing_period_end=period_end
        )
        
        async with self.db_pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO usage_records 
                (organization_id, usage_type, quantity, metadata, 
                 billing_period_start, billing_period_end)
                VALUES ($1, $2, $3, $4, $5, $6)
            """,
                usage_record.organization_id,
                usage_record.usage_type.value,
                usage_record.quantity,
                json.dumps(usage_record.metadata),
                usage_record.billing_period_start,
                usage_record.billing_period_end
            )
        
        return usage_record
    
    async def get_usage_summary(
        self,
        organization_id: UUID,
        period_start: Optional[datetime] = None,
        period_end: Optional[datetime] = None,
        user_id: UUID = None
    ) -> Dict[str, Any]:
        """Get usage summary for current or specified period"""
        if user_id:
            await self.rbac_service.require_permission(
                user_id, organization_id, PermissionType.BILLING_VIEW
            )
        
        # Get subscription and determine period if not provided
        subscription = await self.get_subscription(organization_id)
        if not subscription:
            return {"error": "No active subscription found"}
        
        if not period_start or not period_end:
            period_start = subscription.current_period_start
            period_end = subscription.current_period_end
        
        async with self.db_pool.acquire() as conn:
            # Get usage summary by type
            usage_summary = await conn.fetch("""
                SELECT usage_type, 
                       SUM(quantity) as total_quantity,
                       COUNT(*) as record_count,
                       MIN(recorded_at) as first_recorded,
                       MAX(recorded_at) as last_recorded
                FROM usage_records
                WHERE organization_id = $1 
                AND billing_period_start >= $2 
                AND billing_period_end <= $3
                GROUP BY usage_type
                ORDER BY usage_type
            """, organization_id, period_start, period_end)
            
            summary = {
                "organization_id": organization_id,
                "period_start": period_start,
                "period_end": period_end,
                "subscription_plan": subscription.plan_id.value,
                "usage_by_type": {}
            }
            
            for row in usage_summary:
                summary["usage_by_type"][row['usage_type']] = {
                    "total_quantity": row['total_quantity'],
                    "record_count": row['record_count'],
                    "first_recorded": row['first_recorded'],
                    "last_recorded": row['last_recorded']
                }
            
            return summary
    
    async def check_usage_limits(
        self,
        organization_id: UUID,
        user_id: UUID = None
    ) -> Dict[str, Dict[str, Any]]:
        """Check current usage against plan limits"""
        if user_id:
            await self.rbac_service.require_permission(
                user_id, organization_id, PermissionType.BILLING_VIEW
            )
        
        subscription = await self.get_subscription(organization_id)
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active subscription found"
            )
        
        plan_def = self._plan_definitions[subscription.plan_id]
        usage_summary = await self.get_usage_summary(organization_id)
        
        limit_status = {}
        
        for limit_key, limit_value in plan_def.limits.items():
            current_usage = 0
            
            # Map limit keys to usage types
            usage_type_mapping = {
                "users": UsageType.USERS,
                "storage_gb": UsageType.STORAGE_GB,
                "api_calls_per_day": UsageType.API_CALLS,
                "dashboards": UsageType.DASHBOARD_CREATED,
                "exports_per_month": UsageType.EXPORTS
            }
            
            usage_type = usage_type_mapping.get(limit_key)
            if usage_type and usage_type.value in usage_summary.get("usage_by_type", {}):
                current_usage = usage_summary["usage_by_type"][usage_type.value]["total_quantity"]
            
            # Determine limit status
            if limit_value == "unlimited":
                status = "unlimited"
            elif current_usage >= limit_value:
                status = "exceeded"
            elif current_usage >= limit_value * 0.8:  # 80% threshold
                status = "warning"
            else:
                status = "ok"
            
            limit_status[limit_key] = {
                "limit": limit_value,
                "current_usage": current_usage,
                "remaining": (limit_value - current_usage) if limit_value != "unlimited" else "unlimited",
                "status": status,
                "percentage": ((current_usage / limit_value) * 100) if limit_value != "unlimited" else 0
            }
        
        return limit_status
    
    async def get_invoices(
        self,
        organization_id: UUID,
        limit: int = 50,
        user_id: UUID = None
    ) -> List[Invoice]:
        """Get invoices for organization"""
        if user_id:
            await self.rbac_service.require_permission(
                user_id, organization_id, PermissionType.BILLING_VIEW
            )
        
        async with self.db_pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT i.*, s.plan_id
                FROM invoices i
                JOIN subscriptions s ON i.subscription_id = s.id
                WHERE i.organization_id = $1
                ORDER BY i.created_at DESC
                LIMIT $2
            """, organization_id, limit)
            
            return [
                Invoice(
                    id=row['id'],
                    organization_id=row['organization_id'],
                    subscription_id=row['subscription_id'],
                    stripe_invoice_id=row['stripe_invoice_id'],
                    amount=row['amount'],
                    currency=row['currency'],
                    status=row['status'],
                    due_date=row['due_date'],
                    paid_at=row['paid_at'],
                    created_at=row['created_at'],
                    invoice_url=row['invoice_url']
                )
                for row in rows
            ]
    
    async def cancel_subscription(
        self,
        organization_id: UUID,
        cancel_at_period_end: bool = True,
        user_id: UUID = None
    ) -> bool:
        """Cancel subscription"""
        if user_id:
            await self.rbac_service.require_permission(
                user_id, organization_id, PermissionType.BILLING_MANAGE
            )
        
        subscription = await self.get_subscription(organization_id)
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active subscription found"
            )
        
        if subscription.plan_id in [BillingPlan.FREE, BillingPlan.ENTERPRISE]:
            # Handle free and enterprise plans
            async with self.db_pool.acquire() as conn:
                await conn.execute("""
                    UPDATE subscriptions 
                    SET cancel_at_period_end = $1, canceled_at = NOW()
                    WHERE id = $2
                """, cancel_at_period_end, subscription.id)
            return True
        
        try:
            # Cancel Stripe subscription
            if subscription.stripe_subscription_id:
                stripe.Subscription.modify(
                    subscription.stripe_subscription_id,
                    cancel_at_period_end=cancel_at_period_end
                )
            
            # Update database
            async with self.db_pool.acquire() as conn:
                await conn.execute("""
                    UPDATE subscriptions 
                    SET cancel_at_period_end = $1, 
                        canceled_at = CASE WHEN $1 = false THEN NOW() ELSE canceled_at END,
                        updated_at = NOW()
                    WHERE id = $2
                """, cancel_at_period_end, subscription.id)
            
            return True
        
        except StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stripe error: {str(e)}"
            )
    
    async def get_billing_analytics(
        self,
        organization_id: UUID,
        start_date: datetime,
        end_date: datetime,
        user_id: UUID = None
    ) -> Dict[str, Any]:
        """Get billing analytics and insights"""
        if user_id:
            await self.rbac_service.require_permission(
                user_id, organization_id, PermissionType.BILLING_VIEW
            )
        
        async with self.db_pool.acquire() as conn:
            # Get revenue analytics
            revenue_data = await conn.fetch("""
                SELECT 
                    DATE_TRUNC('month', created_at) as month,
                    SUM(amount) as total_revenue,
                    COUNT(*) as invoice_count,
                    AVG(amount) as avg_invoice_amount
                FROM invoices
                WHERE organization_id = $1 
                AND created_at >= $2 
                AND created_at <= $3
                AND status = 'paid'
                GROUP BY DATE_TRUNC('month', created_at)
                ORDER BY month
            """, organization_id, start_date, end_date)
            
            # Get usage trends
            usage_trends = await conn.fetch("""
                SELECT 
                    usage_type,
                    DATE_TRUNC('day', recorded_at) as date,
                    SUM(quantity) as total_quantity
                FROM usage_records
                WHERE organization_id = $1 
                AND recorded_at >= $2 
                AND recorded_at <= $3
                GROUP BY usage_type, DATE_TRUNC('day', recorded_at)
                ORDER BY usage_type, date
            """, organization_id, start_date, end_date)
            
            return {
                "organization_id": organization_id,
                "period": {
                    "start_date": start_date,
                    "end_date": end_date
                },
                "revenue_analytics": [
                    {
                        "month": row['month'],
                        "total_revenue": float(row['total_revenue']),
                        "invoice_count": row['invoice_count'],
                        "avg_invoice_amount": float(row['avg_invoice_amount'])
                    }
                    for row in revenue_data
                ],
                "usage_trends": [
                    {
                        "usage_type": row['usage_type'],
                        "date": row['date'],
                        "total_quantity": row['total_quantity']
                    }
                    for row in usage_trends
                ]
            }
    
    async def sync_stripe_webhooks(self, event_data: Dict[str, Any]):
        """Sync Stripe webhook events"""
        try:
            event_type = event_data['type']
            event_object = event_data['data']['object']
            
            if event_type == 'customer.subscription.created':
                await self._handle_subscription_created(event_object)
            elif event_type == 'customer.subscription.updated':
                await self._handle_subscription_updated(event_object)
            elif event_type == 'customer.subscription.deleted':
                await self._handle_subscription_deleted(event_object)
            elif event_type == 'invoice.payment_succeeded':
                await self._handle_invoice_paid(event_object)
            elif event_type == 'invoice.payment_failed':
                await self._handle_invoice_failed(event_object)
        
        except Exception as e:
            # Log error but don't fail webhook processing
            print(f"Error processing Stripe webhook: {e}")
    
    async def _handle_subscription_created(self, subscription_data):
        """Handle Stripe subscription created event"""
        # Implementation for subscription creation
        pass
    
    async def _handle_subscription_updated(self, subscription_data):
        """Handle Stripe subscription updated event"""
        # Implementation for subscription updates
        pass
    
    async def _handle_subscription_deleted(self, subscription_data):
        """Handle Stripe subscription deleted event"""
        # Implementation for subscription deletion
        pass
    
    async def _handle_invoice_paid(self, invoice_data):
        """Handle Stripe invoice paid event"""
        # Implementation for invoice payment success
        pass
    
    async def _handle_invoice_failed(self, invoice_data):
        """Handle Stripe invoice failed event"""
        # Implementation for invoice payment failure
        pass


# Dependency injection function
def get_billing_service(db_pool: asyncpg.Pool, rbac_service) -> BillingService:
    """Get billing service instance"""
    return BillingService(db_pool, rbac_service)
