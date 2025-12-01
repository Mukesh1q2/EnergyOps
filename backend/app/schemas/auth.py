"""
OptiBid Energy Platform - Authentication Schemas
Pydantic models for authentication endpoints
"""

from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Schema for user login request"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="User password")


class Token(BaseModel):
    """Schema for authentication token response"""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")
    user_id: UUID = Field(..., description="User ID")
    email: EmailStr = Field(..., description="User email")
    role: str = Field(..., description="User role")


class RefreshTokenRequest(BaseModel):
    """Schema for token refresh request"""
    refresh_token: str = Field(..., description="Valid refresh token")


class PasswordChangeRequest(BaseModel):
    """Schema for password change request"""
    current_password: str = Field(..., min_length=8, description="Current password")
    new_password: str = Field(..., min_length=8, description="New password")
    confirm_password: str = Field(..., min_length=8, description="Confirm new password")