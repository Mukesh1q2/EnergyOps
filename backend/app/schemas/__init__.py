"""
OptiBid Energy Platform - Pydantic Models
Request/Response models for API validation and serialization
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, validator
from decimal import Decimal

# Base schemas
class BaseSchema(BaseModel):
    """Base schema with common fields"""
    id: UUID = Field(..., description="Unique identifier")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            Decimal: lambda v: float(v) if v is not None else None,
            UUID: lambda v: str(v)
        }

class BaseCreateSchema(BaseModel):
    """Base schema for create operations"""
    class Config:
        orm_mode = True

class BaseUpdateSchema(BaseModel):
    """Base schema for update operations"""
    class Config:
        orm_mode = True

# Common response schemas
class MessageResponse(BaseModel):
    """Generic message response"""
    message: str

class ErrorResponse(BaseModel):
    """Error response schema"""
    error: Dict[str, Any] = Field(..., description="Error details")

class PaginationResponse(BaseModel):
    """Pagination response schema"""
    total: int = Field(..., description="Total number of items")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Items per page")
    pages: int = Field(..., description="Total number of pages")

class PaginatedResponse(BaseModel):
    """Generic paginated response"""
    items: List[Any] = Field(..., description="List of items")
    pagination: PaginationResponse = Field(..., description="Pagination information")

# Authentication schemas
class Token(BaseModel):
    """Token response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Token expiration time in seconds")

class TokenData(BaseModel):
    """Token data schema"""
    user_id: Optional[str] = None
    organization_id: Optional[str] = None

class LoginRequest(BaseModel):
    """Login request schema"""
    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., min_length=8, description="User password")

class RefreshTokenRequest(BaseModel):
    """Refresh token request schema"""
    refresh_token: str = Field(..., description="Refresh token")

class PasswordChangeRequest(BaseModel):
    """Password change request schema"""
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, description="New password")
    confirm_password: str = Field(..., description="Confirm new password")
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

# User schemas
class UserBase(BaseSchema):
    """User base schema"""
    email: EmailStr = Field(..., description="User email")
    first_name: str = Field(..., max_length=100, description="First name")
    last_name: str = Field(..., max_length=100, description="Last name")
    role: str = Field(..., description="User role")
    status: str = Field(..., description="User status")
    email_verified: bool = Field(default=False, description="Email verified status")
    last_login_at: Optional[datetime] = Field(None, description="Last login timestamp")
    login_count: int = Field(default=0, description="Login count")

class UserCreate(BaseCreateSchema):
    """User creation schema"""
    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., min_length=8, description="User password")
    first_name: str = Field(..., max_length=100, description="First name")
    last_name: str = Field(..., max_length=100, description="Last name")
    role: str = Field(default="viewer", description="User role")

class UserUpdate(BaseUpdateSchema):
    """User update schema"""
    email: Optional[EmailStr] = Field(None, description="User email")
    first_name: Optional[str] = Field(None, max_length=100, description="First name")
    last_name: Optional[str] = Field(None, max_length=100, description="Last name")
    role: Optional[str] = Field(None, description="User role")
    status: Optional[str] = Field(None, description="User status")

class UserResponse(UserBase):
    """User response schema"""
    organization_id: UUID = Field(..., description="Organization ID")
    
class UserListResponse(BaseModel):
    """User list response schema"""
    users: List[UserResponse]
    pagination: PaginationResponse

# Organization schemas
class OrganizationBase(BaseSchema):
    """Organization base schema"""
    name: str = Field(..., max_length=255, description="Organization name")
    slug: str = Field(..., max_length=100, description="Organization slug")
    status: str = Field(..., description="Organization status")
    subscription_tier: str = Field(..., description="Subscription tier")
    subscription_expires_at: Optional[datetime] = Field(None, description="Subscription expiration")

class OrganizationCreate(BaseCreateSchema):
    """Organization creation schema"""
    name: str = Field(..., max_length=255, description="Organization name")
    admin_email: EmailStr = Field(..., description="Admin email")
    admin_password: str = Field(..., min_length=8, description="Admin password")
    admin_first_name: str = Field(..., max_length=100, description="Admin first name")
    admin_last_name: str = Field(..., max_length=100, description="Admin last name")

class OrganizationUpdate(BaseUpdateSchema):
    """Organization update schema"""
    name: Optional[str] = Field(None, max_length=255, description="Organization name")
    status: Optional[str] = Field(None, description="Organization status")
    subscription_tier: Optional[str] = Field(None, description="Subscription tier")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class OrganizationResponse(OrganizationBase):
    """Organization response schema"""
    user_count: Optional[int] = Field(None, description="Number of users")

# Asset schemas
class AssetBase(BaseSchema):
    """Asset base schema"""
    name: str = Field(..., max_length=255, description="Asset name")
    asset_type: str = Field(..., description="Asset type")
    capacity_mw: Decimal = Field(..., gt=0, description="Capacity in MW")
    status: str = Field(..., description="Asset status")
    commissioning_date: Optional[datetime] = Field(None, description="Commissioning date")
    decommissioning_date: Optional[datetime] = Field(None, description="Decommissioning date")

class AssetCreate(BaseCreateSchema):
    """Asset creation schema"""
    site_id: UUID = Field(..., description="Site ID")
    name: str = Field(..., max_length=255, description="Asset name")
    asset_type: str = Field(..., description="Asset type")
    capacity_mw: Decimal = Field(..., gt=0, description="Capacity in MW")
    commissioning_date: Optional[datetime] = Field(None, description="Commissioning date")
    decommissioning_date: Optional[datetime] = Field(None, description="Decommissioning date")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class AssetUpdate(BaseUpdateSchema):
    """Asset update schema"""
    name: Optional[str] = Field(None, max_length=255, description="Asset name")
    asset_type: Optional[str] = Field(None, description="Asset type")
    capacity_mw: Optional[Decimal] = Field(None, gt=0, description="Capacity in MW")
    status: Optional[str] = Field(None, description="Asset status")
    commissioning_date: Optional[datetime] = Field(None, description="Commissioning date")
    decommissioning_date: Optional[datetime] = Field(None, description="Decommissioning date")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class AssetResponse(AssetBase):
    """Asset response schema"""
    organization_id: UUID = Field(..., description="Organization ID")
    site_id: UUID = Field(..., description="Site ID")
    site_name: Optional[str] = Field(None, description="Site name")
    bid_zones: List[str] = Field(default_factory=list, description="Bid zones")

class AssetListResponse(BaseModel):
    """Asset list response schema"""
    assets: List[AssetResponse]
    pagination: PaginationResponse

# Bid schemas
class BidBase(BaseSchema):
    """Bid base schema"""
    bid_number: Optional[str] = Field(None, max_length=100, description="Bid number")
    status: str = Field(..., description="Bid status")
    offer_type: str = Field(..., description="Offer type (buy/sell)")
    market_type: str = Field(..., description="Market type")
    delivery_start: datetime = Field(..., description="Delivery start time")
    delivery_end: datetime = Field(..., description="Delivery end time")
    quantity_mw: Decimal = Field(..., gt=0, description="Quantity in MW")
    price_rupees: Optional[Decimal] = Field(None, ge=0, description="Price in INR per MW")
    currency: str = Field(default="INR", description="Currency")
    submitted_at: Optional[datetime] = Field(None, description="Submission time")
    response_at: Optional[datetime] = Field(None, description="Response time")
    notes: Optional[str] = Field(None, description="Notes")

class BidCreate(BaseCreateSchema):
    """Bid creation schema"""
    market_operator_id: UUID = Field(..., description="Market operator ID")
    bid_zone_id: UUID = Field(..., description="Bid zone ID")
    asset_id: Optional[UUID] = Field(None, description="Asset ID")
    bid_number: Optional[str] = Field(None, max_length=100, description="Bid number")
    offer_type: str = Field(..., description="Offer type (buy/sell)")
    market_type: str = Field(..., description="Market type")
    delivery_start: datetime = Field(..., description="Delivery start time")
    delivery_end: datetime = Field(..., description="Delivery end time")
    quantity_mw: Decimal = Field(..., gt=0, description="Quantity in MW")
    price_rupees: Optional[Decimal] = Field(None, ge=0, description="Price in INR per MW")
    notes: Optional[str] = Field(None, description="Notes")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class BidUpdate(BaseUpdateSchema):
    """Bid update schema"""
    bid_number: Optional[str] = Field(None, max_length=100, description="Bid number")
    status: Optional[str] = Field(None, description="Bid status")
    quantity_mw: Optional[Decimal] = Field(None, gt=0, description="Quantity in MW")
    price_rupees: Optional[Decimal] = Field(None, ge=0, description="Price in INR per MW")
    notes: Optional[str] = Field(None, description="Notes")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class BidResponse(BidBase):
    """Bid response schema"""
    organization_id: UUID = Field(..., description="Organization ID")
    market_operator_id: UUID = Field(..., description="Market operator ID")
    bid_zone_id: UUID = Field(..., description="Bid zone ID")
    asset_id: Optional[UUID] = Field(None, description="Asset ID")
    market_operator_name: Optional[str] = Field(None, description="Market operator name")
    bid_zone_name: Optional[str] = Field(None, description="Bid zone name")
    asset_name: Optional[str] = Field(None, description="Asset name")
    site_name: Optional[str] = Field(None, description="Site name")

class BidListResponse(BaseModel):
    """Bid list response schema"""
    bids: List[BidResponse]
    pagination: PaginationResponse

# Market data schemas
class MarketPriceQuery(BaseModel):
    """Market price query schema"""
    market_operator_id: Optional[UUID] = Field(None, description="Market operator ID")
    bid_zone_id: Optional[UUID] = Field(None, description="Bid zone ID")
    market_type: Optional[str] = Field(None, description="Market type")
    start_time: datetime = Field(..., description="Start time")
    end_time: datetime = Field(..., description="End time")
    limit: int = Field(default=1000, le=10000, description="Maximum records")

class MarketPriceResponse(BaseModel):
    """Market price response schema"""
    time: datetime = Field(..., description="Timestamp")
    market_operator_id: UUID = Field(..., description="Market operator ID")
    bid_zone_id: UUID = Field(..., description="Bid zone ID")
    market_type: str = Field(..., description="Market type")
    price_rupees: Optional[Decimal] = Field(None, description="Price in INR per MW")
    volume_mwh: Optional[Decimal] = Field(None, description="Volume in MWh")
    currency: str = Field(default="INR", description="Currency")

class MarketPriceListResponse(BaseModel):
    """Market price list response schema"""
    prices: List[MarketPriceResponse]
    total: int = Field(..., description="Total number of records")

# Real-time Market Data schemas
class MarketDataBase(BaseSchema):
    """Market data base schema for real-time updates"""
    timestamp: datetime = Field(..., description="Data timestamp")
    market_zone: str = Field(..., description="Market zone (e.g., pjm, caiso, ercot)")
    price: float = Field(..., ge=0, description="Price per MW")
    volume: float = Field(..., ge=0, description="Trading volume")
    asset_id: Optional[UUID] = Field(None, description="Associated asset ID")
    bid_id: Optional[UUID] = Field(None, description="Associated bid ID")
    event_type: str = Field(default="price_update", description="Event type")

class MarketDataCreate(BaseCreateSchema):
    """Market data creation schema"""
    timestamp: datetime = Field(..., description="Data timestamp")
    market_zone: str = Field(..., description="Market zone (e.g., pjm, caiso, ercot)")
    price: float = Field(..., ge=0, description="Price per MW")
    volume: float = Field(..., ge=0, description="Trading volume")
    asset_id: Optional[UUID] = Field(None, description="Associated asset ID")
    bid_id: Optional[UUID] = Field(None, description="Associated bid ID")
    event_type: str = Field(default="price_update", description="Event type")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class MarketDataUpdate(BaseUpdateSchema):
    """Market data update schema"""
    price: Optional[float] = Field(None, ge=0, description="Price per MW")
    volume: Optional[float] = Field(None, ge=0, description="Trading volume")
    event_type: Optional[str] = Field(None, description="Event type")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class MarketDataResponse(MarketDataBase):
    """Market data response schema"""
    organization_id: UUID = Field(..., description="Organization ID")
    asset_name: Optional[str] = Field(None, description="Associated asset name")
    bid_number: Optional[str] = Field(None, description="Associated bid number")

class MarketDataListResponse(BaseModel):
    """Market data list response schema"""
    data: List[MarketDataResponse]
    pagination: PaginationResponse

class PriceStatisticsResponse(BaseModel):
    """Price statistics response schema"""
    average: float = Field(..., description="Average price")
    minimum: float = Field(..., description="Minimum price")
    maximum: float = Field(..., description="Maximum price")
    stddev: float = Field(..., description="Standard deviation")
    count: int = Field(..., description="Number of data points")
    time_period_hours: int = Field(..., description="Time period in hours")
    market_zone: str = Field(..., description="Market zone")

class VolumeStatisticsResponse(BaseModel):
    """Volume statistics response schema"""
    total_volume: float = Field(..., description="Total volume")
    average_volume: float = Field(..., description="Average volume")
    min_volume: float = Field(..., description="Minimum volume")
    max_volume: float = Field(..., description="Maximum volume")
    time_period_hours: int = Field(..., description="Time period in hours")
    market_zone: str = Field(..., description="Market zone")

class PriceChangeResponse(BaseModel):
    """Price change event response schema"""
    timestamp: str = Field(..., description="Event timestamp")
    previous_price: float = Field(..., description="Previous price")
    current_price: float = Field(..., description="Current price")
    change_percent: float = Field(..., description="Change percentage")
    change_absolute: float = Field(..., description="Absolute change")
    volume: float = Field(..., description="Trading volume")
    change_type: str = Field(..., description="Change type (increase/decrease)")

# WebSocket message schemas
class WebSocketMessage(BaseModel):
    """WebSocket message schema"""
    type: str = Field(..., description="Message type")
    market_zone: Optional[str] = Field(None, description="Market zone")
    data: Optional[Dict[str, Any]] = Field(None, description="Message data")
    timestamp: str = Field(..., description="Message timestamp")

class PriceUpdateMessage(BaseModel):
    """Price update WebSocket message"""
    type: str = Field(default="price_update", description="Message type")
    market_zone: str = Field(..., description="Market zone")
    price: float = Field(..., description="Current price")
    volume: float = Field(..., description="Trading volume")
    timestamp: str = Field(..., description="Update timestamp")

class MarketAlertMessage(BaseModel):
    """Market alert WebSocket message"""
    type: str = Field(default="market_alert", description="Message type")
    market_zone: str = Field(..., description="Market zone")
    alert_type: str = Field(..., description="Alert type")
    message: str = Field(..., description="Alert message")
    severity: str = Field(default="info", description="Alert severity")
    timestamp: str = Field(..., description="Alert timestamp")

class ConnectionStatsResponse(BaseModel):
    """WebSocket connection statistics response"""
    total_connections: int = Field(..., description="Total active connections")
    connections_by_zone: Dict[str, int] = Field(..., description="Connections per market zone")
    active_zones: List[str] = Field(..., description="Active market zones")
    timestamp: str = Field(..., description="Statistics timestamp")

# Dashboard schemas
class DashboardBase(BaseSchema):
    """Dashboard base schema"""
    name: str = Field(..., max_length=255, description="Dashboard name")
    description: Optional[str] = Field(None, description="Dashboard description")
    dashboard_type: str = Field(..., description="Dashboard type")
    layout_config: Dict[str, Any] = Field(..., description="Layout configuration")
    is_public: bool = Field(default=False, description="Public visibility")
    is_template: bool = Field(default=False, description="Is template")

class DashboardCreate(BaseCreateSchema):
    """Dashboard creation schema"""
    name: str = Field(..., max_length=255, description="Dashboard name")
    description: Optional[str] = Field(None, description="Dashboard description")
    dashboard_type: str = Field(default="custom", description="Dashboard type")
    layout_config: Dict[str, Any] = Field(default_factory=dict, description="Layout configuration")
    is_public: bool = Field(default=False, description="Public visibility")
    is_template: bool = Field(default=False, description="Is template")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class DashboardUpdate(BaseUpdateSchema):
    """Dashboard update schema"""
    name: Optional[str] = Field(None, max_length=255, description="Dashboard name")
    description: Optional[str] = Field(None, description="Dashboard description")
    dashboard_type: Optional[str] = Field(None, description="Dashboard type")
    layout_config: Optional[Dict[str, Any]] = Field(None, description="Layout configuration")
    is_public: Optional[bool] = Field(None, description="Public visibility")
    is_template: Optional[bool] = Field(None, description="Is template")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class DashboardResponse(DashboardBase):
    """Dashboard response schema"""
    organization_id: UUID = Field(..., description="Organization ID")
    created_by: UUID = Field(..., description="Creator user ID")
    widget_count: int = Field(default=0, description="Number of widgets")

class DashboardListResponse(BaseModel):
    """Dashboard list response schema"""
    dashboards: List[DashboardResponse]
    pagination: PaginationResponse

# Widget schemas
class WidgetBase(BaseSchema):
    """Widget base schema"""
    name: str = Field(..., max_length=255, description="Widget name")
    widget_type: str = Field(..., description="Widget type")
    position_x: int = Field(..., ge=0, description="X position")
    position_y: int = Field(..., ge=0, description="Y position")
    width: int = Field(default=6, ge=1, description="Width in grid units")
    height: int = Field(default=4, ge=1, description="Height in grid units")
    configuration: Dict[str, Any] = Field(..., description="Widget configuration")
    refresh_interval: int = Field(default=300, ge=30, description="Refresh interval in seconds")
    is_visible: bool = Field(default=True, description="Visibility")

class WidgetCreate(BaseCreateSchema):
    """Widget creation schema"""
    name: str = Field(..., max_length=255, description="Widget name")
    widget_type: str = Field(..., description="Widget type")
    position_x: int = Field(..., ge=0, description="X position")
    position_y: int = Field(..., ge=0, description="Y position")
    width: int = Field(default=6, ge=1, description="Width in grid units")
    height: int = Field(default=4, ge=1, description="Height in grid units")
    configuration: Dict[str, Any] = Field(..., description="Widget configuration")
    data_source_id: Optional[UUID] = Field(None, description="Data source ID")
    refresh_interval: int = Field(default=300, ge=30, description="Refresh interval in seconds")
    is_visible: bool = Field(default=True, description="Visibility")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class WidgetUpdate(BaseUpdateSchema):
    """Widget update schema"""
    name: Optional[str] = Field(None, max_length=255, description="Widget name")
    widget_type: Optional[str] = Field(None, description="Widget type")
    position_x: Optional[int] = Field(None, ge=0, description="X position")
    position_y: Optional[int] = Field(None, ge=0, description="Y position")
    width: Optional[int] = Field(None, ge=1, description="Width in grid units")
    height: Optional[int] = Field(None, ge=1, description="Height in grid units")
    configuration: Optional[Dict[str, Any]] = Field(None, description="Widget configuration")
    data_source_id: Optional[UUID] = Field(None, description="Data source ID")
    refresh_interval: Optional[int] = Field(None, ge=30, description="Refresh interval in seconds")
    is_visible: Optional[bool] = Field(None, description="Visibility")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class WidgetResponse(WidgetBase):
    """Widget response schema"""
    dashboard_id: UUID = Field(..., description="Dashboard ID")
    data_source_id: Optional[UUID] = Field(None, description="Data source ID")

class WidgetListResponse(BaseModel):
    """Widget list response schema"""
    widgets: List[WidgetResponse]
    pagination: PaginationResponse

# Export all schemas
__all__ = [
    "BaseSchema", "BaseCreateSchema", "BaseUpdateSchema",
    "MessageResponse", "ErrorResponse", "PaginationResponse", "PaginatedResponse",
    "Token", "TokenData", "LoginRequest", "RefreshTokenRequest", "PasswordChangeRequest",
    "UserBase", "UserCreate", "UserUpdate", "UserResponse", "UserListResponse",
    "OrganizationBase", "OrganizationCreate", "OrganizationUpdate", "OrganizationResponse",
    "AssetBase", "AssetCreate", "AssetUpdate", "AssetResponse", "AssetListResponse",
    "BidBase", "BidCreate", "BidUpdate", "BidResponse", "BidListResponse",
    "MarketPriceQuery", "MarketPriceResponse", "MarketPriceListResponse",
    "MarketDataBase", "MarketDataCreate", "MarketDataUpdate", "MarketDataResponse", "MarketDataListResponse",
    "PriceStatisticsResponse", "VolumeStatisticsResponse", "PriceChangeResponse",
    "WebSocketMessage", "PriceUpdateMessage", "MarketAlertMessage", "ConnectionStatsResponse",
    "DashboardBase", "DashboardCreate", "DashboardUpdate", "DashboardResponse", "DashboardListResponse",
    "WidgetBase", "WidgetCreate", "WidgetUpdate", "WidgetResponse", "WidgetListResponse"
]
