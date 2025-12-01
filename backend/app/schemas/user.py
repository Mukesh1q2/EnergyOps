"""
OptiBid Energy Platform - User Schemas
User request/response models
"""

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, validator

class UserBase(BaseModel):
    """User base schema"""
    email: EmailStr = Field(..., description="User email")
    first_name: str = Field(..., max_length=100, description="First name")
    last_name: str = Field(..., max_length=100, description="Last name")
    role: str = Field(..., description="User role")
    status: str = Field(..., description="User status")
    email_verified: bool = Field(default=False, description="Email verified status")
    last_login_at: Optional[datetime] = Field(None, description="Last login timestamp")
    login_count: int = Field(default=0, description="Login count")

class UserCreate(BaseModel):
    """User creation schema"""
    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., min_length=8, description="User password")
    first_name: str = Field(..., max_length=100, description="First name")
    last_name: str = Field(..., max_length=100, description="Last name")
    role: str = Field(default="viewer", description="User role")
    organization_id: UUID = Field(..., description="Organization ID")

class UserUpdate(BaseModel):
    """User update schema"""
    email: Optional[EmailStr] = Field(None, description="User email")
    first_name: Optional[str] = Field(None, max_length=100, description="First name")
    last_name: Optional[str] = Field(None, max_length=100, description="Last name")
    role: Optional[str] = Field(None, description="User role")
    status: Optional[str] = Field(None, description="User status")

class UserResponse(UserBase):
    """User response schema"""
    id: UUID = Field(..., description="Unique identifier")
    organization_id: UUID = Field(..., description="Organization ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    class Config:
        from_attributes = True