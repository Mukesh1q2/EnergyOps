"""
OptiBid Energy Platform - Organization Schemas
Organization request/response models
"""

from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field

class OrganizationBase(BaseModel):
    """Organization base schema"""
    name: str = Field(..., max_length=255, description="Organization name")
    slug: str = Field(..., max_length=100, description="Organization slug")
    status: str = Field(..., description="Organization status")
    subscription_tier: str = Field(..., description="Subscription tier")
    subscription_expires_at: Optional[datetime] = Field(None, description="Subscription expiration")

class OrganizationCreate(BaseModel):
    """Organization creation schema"""
    name: str = Field(..., max_length=255, description="Organization name")
    slug: str = Field(..., max_length=100, description="Organization slug")
    status: str = Field(default="trial", description="Organization status")
    subscription_tier: str = Field(default="trial", description="Subscription tier")
    subscription_expires_at: Optional[datetime] = Field(None, description="Subscription expiration")
    org_metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class OrganizationUpdate(BaseModel):
    """Organization update schema"""
    name: Optional[str] = Field(None, max_length=255, description="Organization name")
    status: Optional[str] = Field(None, description="Organization status")
    subscription_tier: Optional[str] = Field(None, description="Subscription tier")
    subscription_expires_at: Optional[datetime] = Field(None, description="Subscription expiration")
    org_metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class OrganizationResponse(OrganizationBase):
    """Organization response schema"""
    id: UUID = Field(..., description="Unique identifier")
    user_count: Optional[int] = Field(None, description="Number of users")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    class Config:
        from_attributes = True