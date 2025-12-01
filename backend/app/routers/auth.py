"""
OptiBid Energy Platform - Authentication Router - Phase 4: Enterprise Security & Compliance
Enhanced authentication with SSO, MFA, and backup & disaster recovery
"""

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from uuid import UUID
from urllib.parse import unquote
import secrets

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.core.config import get_settings, settings
from app.core.security import SecurityManager, get_current_user
from app.schemas.auth import LoginRequest, Token, RefreshTokenRequest, PasswordChangeRequest
from app.schemas.user import UserResponse, UserCreate
from app.models import User, Organization
from app.crud.user import user_crud
from app.crud.organization import organization_crud
from app.utils.logger import setup_logger

# Phase 4: Enterprise Security Services
from app.services.sso_service import sso_service
from app.services.mfa_service import mfa_service, MFASetupRequest, MFAVerificationRequest
from app.services.backup_service import backup_service

logger = setup_logger(__name__)
settings = get_settings()
security = HTTPBearer()

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
async def login(
    request: Request,
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Authenticate user and return access token
    """
    try:
        # Authenticate user
        user = await user_crud.authenticate(
            db, 
            email=login_data.email, 
            password=login_data.password
        )
        
        if not user:
            logger.warning(f"Failed login attempt for email: {login_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if user.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account has been deactivated"
            )
        
        # Generate tokens
        access_token = SecurityManager.create_access_token(
            user_id=str(user.id),
            organization_id=str(user.organization_id)
        )
        refresh_token = SecurityManager.create_refresh_token(
            user_id=str(user.id),
            organization_id=str(user.organization_id)
        )
        
        # Update last login
        await user_crud.update_last_login(
            db,
            user_id=user.id,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent")
        )
        
        # Create session record
        from app.models.user import UserSession
        session = UserSession(
            user_id=user.id,
            session_token=access_token,
            refresh_token=refresh_token,
            expires_at=datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent")
        )
        db.add(session)
        await db.commit()
        
        logger.info(f"User {user.email} logged in successfully")
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/register", response_model=UserResponse)
async def register(
    request: Request,
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Register new user with organization
    """
    try:
        # Check if email already exists
        existing_user = await user_crud.get_by_email(db, email=user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        password_hash = SecurityManager.get_password_hash(user_data.password)
        
        # Create organization and admin user
        org_slug = user_data.email.split("@")[0] + "-org"
        
        org = await organization_crud.create_with_admin(
            db,
            obj_in=user_data,
            admin_password_hash=password_hash
        )
        
        logger.info(f"New organization created: {org.name} with admin: {user_data.email}")
        
        # Return user data (without password hash)
        return UserResponse(
            id=org.users[0].id,
            email=org.users[0].email,
            first_name=org.users[0].first_name,
            last_name=org.users[0].last_name,
            role=org.users[0].role,
            status=org.users[0].status,
            email_verified=org.users[0].email_verified,
            organization_id=org.id,
            created_at=org.users[0].created_at,
            updated_at=org.users[0].updated_at,
            last_login_at=None,
            login_count=0
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: Request,
    refresh_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Refresh access token using refresh token
    """
    try:
        # Verify refresh token
        payload = SecurityManager.verify_token(refresh_data.refresh_token, "refresh")
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        user_id = payload.get("sub")
        organization_id = payload.get("org_id")
        
        if not user_id or not organization_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        # Get user
        user = await user_crud.get(db, id=UUID(user_id))
        if not user or user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Generate new tokens
        access_token = SecurityManager.create_access_token(
            user_id=str(user.id),
            organization_id=str(user.organization_id)
        )
        new_refresh_token = SecurityManager.create_refresh_token(
            user_id=str(user.id),
            organization_id=str(user.organization_id)
        )
        
        # Update session
        from app.models.user import UserSession
        session = await db.execute(
            select(UserSession).where(
                UserSession.refresh_token == refresh_data.refresh_token
            )
        )
        db_session = session.scalar_one_or_none()
        
        if db_session:
            db_session.refresh_token = new_refresh_token
            db_session.last_used_at = datetime.utcnow()
            await db.commit()
        
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )

@router.post("/logout")
async def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Logout user and invalidate session
    """
    try:
        # Remove session from database
        from app.models.user import UserSession
        
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
            session_result = await db.execute(
                select(UserSession).where(
                    UserSession.session_token == token
                )
            )
            session = session_result.scalar_one_or_none()
            
            if session:
                await db.delete(session)
                await db.commit()
        
        logger.info(f"User {current_user.email} logged out")
        
        return {"message": "Successfully logged out"}
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get current user information
    """
    # Get organization info
    org = await organization_crud.get(db, id=current_user.organization_id)
    
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=current_user.role,
        status=current_user.status,
        email_verified=current_user.email_verified,
        organization_id=current_user.organization_id,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
        last_login_at=current_user.last_login_at,
        login_count=current_user.login_count
    )

@router.post("/change-password")
async def change_password(
    password_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Change user password
    """
    try:
        await user_crud.update_password(
            db,
            db_obj=current_user,
            current_password=password_data.current_password,
            new_password=password_data.new_password
        )
        
        logger.info(f"Password changed for user: {current_user.email}")
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed"
        )

@router.post("/reset-password/{user_id}")
async def reset_password(
    user_id: UUID,
    new_password: str,
    admin_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Reset user password (admin operation)
    """
    try:
        # Check if current user is admin
        if admin_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can reset passwords"
            )
        
        # Reset password
        await user_crud.reset_password(db, user_id=user_id, new_password=new_password)
        
        logger.info(f"Password reset for user {user_id} by admin {admin_user.email}")
        
        return {"message": "Password reset successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset failed"
        )

@router.post("/verify-email/{user_id}")
async def verify_email(
    user_id: UUID,
    admin_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Verify user email (admin operation)
    """
    try:
        # Check if current user is admin
        if admin_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can verify emails"
            )
        
        # Verify email
        user = await user_crud.verify_email(db, user_id=user_id)
        
        logger.info(f"Email verified for user {user_id} by admin {admin_user.email}")
        
        return {"message": "Email verified successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email verification failed"
        )

@router.get("/health")
async def auth_health_check():
    """
    Health check for authentication service
    """
    return {
        "status": "healthy",
        "service": "authentication",
        "timestamp": datetime.utcnow().isoformat()
    }

# Phase 4: Enterprise Security & Compliance Endpoints

# Helper functions
def get_client_info(request: Request) -> Dict[str, str]:
    """Extract client information from request"""
    return {
        "ip_address": request.client.host if request.client else "unknown",
        "user_agent": request.headers.get("user-agent", "unknown"),
        "accept_language": request.headers.get("accept-language", "unknown"),
        "referer": request.headers.get("referer", "unknown")
    }

# SSO Authentication Endpoints
@router.get("/sso/metadata")
async def get_saml_metadata():
    """Get SAML 2.0 metadata for IdP configuration"""
    try:
        metadata = sso_service.get_saml_metadata()
        return {
            "metadata": metadata,
            "entity_id": sso_service.sso_providers["saml_enterprise"].metadata["entity_id"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate metadata: {str(e)}")

@router.get("/sso/initiate/{provider_id}")
async def initiate_sso_login(provider_id: str, redirect_to: str = "/dashboard"):
    """Initiate SSO login for SAML or OIDC providers"""
    try:
        if provider_id in ["azure_ad", "okta", "google_workspace"]:
            # OIDC flow
            auth_url = await sso_service.initiate_oidc_auth(provider_id, state=redirect_to)
            return RedirectResponse(url=auth_url)
        elif provider_id == "saml_enterprise":
            # SAML flow
            auth_url = await sso_service.initiate_saml_auth(provider_id, relay_state=redirect_to)
            return RedirectResponse(url=auth_url)
        else:
            raise HTTPException(status_code=400, detail="Unsupported SSO provider")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SSO initiation failed: {str(e)}")

@router.post("/saml/acs")
async def saml_assertion_consumer_service(request: Request):
    """SAML Assertion Consumer Service endpoint"""
    try:
        form_data = await request.form()
        saml_response = form_data.get("SAMLResponse")
        relay_state = form_data.get("RelayState", "/dashboard")
        
        if not saml_response:
            raise HTTPException(status_code=400, detail="Missing SAML response")
        
        # Process SAML response
        sso_result = await sso_service.process_saml_response(saml_response, relay_state)
        
        if not sso_result.success:
            return HTMLResponse(
                content=f"""
                <html>
                <body>
                    <h1>Authentication Failed</h1>
                    <p>{sso_result.error}</p>
                    <a href="/login">Return to Login</a>
                </body>
                </html>
                """,
                status_code=401
            )
        
        # Create JWT tokens
        access_token = sso_service.create_jwt_token({
            "user_id": sso_result.user_id,
            "email": sso_result.email,
            "organization_id": sso_result.organization_id,
            "role": sso_result.role
        })
        
        refresh_token = sso_service.create_refresh_token({
            "user_id": sso_result.user_id
        })
        
        # Set cookies and redirect
        response = RedirectResponse(url=sso_result.redirect_url or "/dashboard")
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=900  # 15 minutes
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=604800  # 7 days
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SAML processing failed: {str(e)}")

@router.get("/oidc/callback/{provider_id}")
async def oidc_callback(provider_id: str, code: str, state: str, request: Request):
    """OIDC callback endpoint"""
    try:
        # Process OIDC callback
        sso_result = await sso_service.process_oidc_callback(provider_id, code, state)
        
        if not sso_result.success:
            return HTMLResponse(
                content=f"""
                <html>
                <body>
                    <h1>Authentication Failed</h1>
                    <p>{sso_result.error}</p>
                    <a href="/login">Return to Login</a>
                </body>
                </html>
                """,
                status_code=401
            )
        
        # Create JWT tokens
        access_token = sso_service.create_jwt_token({
            "user_id": sso_result.user_id,
            "email": sso_result.email,
            "organization_id": sso_result.organization_id,
            "role": sso_result.role
        })
        
        refresh_token = sso_service.create_refresh_token({
            "user_id": sso_result.user_id
        })
        
        # Set cookies and redirect
        response = RedirectResponse(url=state)
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=900
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=604800
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OIDC callback failed: {str(e)}")

# Multi-Factor Authentication (MFA) Endpoints
@router.post("/mfa/setup")
async def setup_mfa(request: MFASetupRequest):
    """Setup MFA for user"""
    try:
        result = await mfa_service.setup_mfa(request)
        return result.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MFA setup failed: {str(e)}")

@router.post("/mfa/verify")
async def verify_mfa(request: MFAVerificationRequest, req: Request):
    """Verify MFA during login"""
    try:
        client_info = get_client_info(req)
        result = await mfa_service.verify_mfa_login(
            request, 
            client_info["ip_address"]
        )
        return result.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MFA verification failed: {str(e)}")

@router.post("/mfa/verify-setup")
async def verify_mfa_setup(user_id: str, code: str, temp_token: str):
    """Verify MFA setup"""
    try:
        success = await mfa_service.verify_mfa_setup(user_id, code, temp_token)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MFA setup verification failed: {str(e)}")

@router.get("/mfa/status/{user_id}")
async def get_mfa_status(user_id: str, current_user: User = Depends(get_current_user)):
    """Get user's MFA status"""
    try:
        # Check if user can access this information
        if str(current_user.id) != user_id and current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Access denied")
        
        # TODO: Query database for user's MFA status
        mfa_status = {
            "enabled": False,
            "methods": [],
            "trusted_devices": 0,
            "backup_codes_remaining": 0
        }
        return mfa_status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get MFA status: {str(e)}")

@router.delete("/mfa/disable/{method}")
async def disable_mfa(method: str, user_id: str, current_user: User = Depends(get_current_user)):
    """Disable MFA for user"""
    try:
        # Check permissions
        if str(current_user.id) != user_id and current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Access denied")
        
        success = await mfa_service.disable_mfa(user_id, method)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MFA disable failed: {str(e)}")

# Session Management Enhanced
@router.post("/refresh", response_model=Token)
async def refresh_token_enhanced(request: RefreshTokenRequest, req: Request):
    """Enhanced token refresh with security checks"""
    try:
        client_info = get_client_info(req)
        
        # Verify refresh token
        payload = SecurityManager.verify_token(request.refresh_token, "refresh")
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        user_id = payload.get("sub")
        organization_id = payload.get("org_id")
        
        if not user_id or not organization_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        # Get user
        user = await user_crud.get(db, id=UUID(user_id))
        if not user or user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Generate new tokens
        access_token = SecurityManager.create_access_token(
            user_id=str(user.id),
            organization_id=str(user.organization_id)
        )
        new_refresh_token = SecurityManager.create_refresh_token(
            user_id=str(user.id),
            organization_id=str(user.organization_id)
        )
        
        # Update session with security info
        from app.models.user import UserSession
        session_result = await db.execute(
            select(UserSession).where(
                UserSession.refresh_token == request.refresh_token
            )
        )
        db_session = session_result.scalar_one_or_none()
        
        if db_session:
            db_session.refresh_token = new_refresh_token
            db_session.last_used_at = datetime.utcnow()
            db_session.ip_address = client_info["ip_address"]
            await db.commit()
        
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )

@router.get("/session-info")
async def get_session_info(current_user: User = Depends(get_current_user), request: Request = None):
    """Get current session information"""
    try:
        client_info = get_client_info(request)
        
        return {
            "user_id": str(current_user.id),
            "login_time": current_user.last_login_at or datetime.utcnow(),
            "ip_address": client_info["ip_address"],
            "user_agent": client_info["user_agent"],
            "organization_id": str(current_user.organization_id) if current_user.organization_id else None,
            "role": current_user.role,
            "status": current_user.status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get session info: {str(e)}")

# Security Monitoring & Audit
@router.get("/security/logs")
async def get_security_logs(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Get security audit logs for user (admin only)"""
    try:
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # TODO: Query audit logs from database
        logs = []
        return {"logs": logs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get security logs: {str(e)}")

@router.get("/security/sessions")
async def get_active_sessions(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Get user's active sessions"""
    try:
        from app.models.user import UserSession
        
        # Get user's active sessions
        sessions_result = await db.execute(
            select(UserSession).where(
                UserSession.user_id == current_user.id,
                UserSession.expires_at > datetime.utcnow()
            ).order_by(UserSession.last_used_at.desc())
        )
        
        sessions = []
        for session in sessions_result.scalars().all():
            sessions.append({
                "session_id": str(session.id),
                "created_at": session.created_at,
                "last_used_at": session.last_used_at,
                "ip_address": session.ip_address,
                "user_agent": session.user_agent,
                "expires_at": session.expires_at
            })
        
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get sessions: {str(e)}")

@router.delete("/security/sessions/{session_id}")
async def revoke_session(session_id: UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Revoke specific session"""
    try:
        from app.models.user import UserSession
        
        # Get session
        session_result = await db.execute(
            select(UserSession).where(
                UserSession.id == session_id,
                UserSession.user_id == current_user.id
            )
        )
        session = session_result.scalar_one_or_none()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Revoke session
        await db.delete(session)
        await db.commit()
        
        return {"message": "Session revoked successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to revoke session: {str(e)}")

# Backup & Disaster Recovery Endpoints
@router.post("/backup/create")
async def create_system_backup(current_user: User = Depends(get_current_user)):
    """Create system backup (admin only)"""
    try:
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        backup_job = await backup_service.create_full_backup()
        return {"backup_job": backup_job.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup creation failed: {str(e)}")

@router.get("/backup/status")
async def get_backup_status(current_user: User = Depends(get_current_user)):
    """Get backup system status"""
    try:
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        health = await backup_service.get_backup_health()
        return health
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get backup status: {str(e)}")

@router.get("/backup/list")
async def list_backups(current_user: User = Depends(get_current_user), status: Optional[str] = None):
    """List backup jobs (admin only)"""
    try:
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        backups = await backup_service.list_backups(status=status)
        return {"backups": [backup.dict() for backup in backups]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list backups: {str(e)}")

@router.post("/backup/restore/{backup_id}")
async def restore_backup(backup_id: str, current_user: User = Depends(get_current_user)):
    """Restore from backup (admin only)"""
    try:
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        success = await backup_service.restore_backup(backup_id)
        return {"success": success, "message": "Backup restored successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup restore failed: {str(e)}")

@router.post("/disaster-recovery/initiate")
async def initiate_disaster_recovery(incident_type: str, severity: str = "medium", current_user: User = Depends(get_current_user)):
    """Initiate disaster recovery (admin only)"""
    try:
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        plan = await backup_service.initiate_disaster_recovery(incident_type, severity)
        return {"recovery_plan": plan.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DR initiation failed: {str(e)}")

@router.post("/disaster-recovery/execute")
async def execute_disaster_recovery(plan_data: dict, current_user: User = Depends(get_current_user)):
    """Execute disaster recovery plan (admin only)"""
    try:
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Recreate plan object
        from app.services.backup_service import DisasterRecoveryPlan
        plan = DisasterRecoveryPlan(**plan_data)
        
        success = await backup_service.execute_recovery_plan(plan)
        return {"success": success, "status": plan.status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DR execution failed: {str(e)}")

# Enhanced Login with MFA Support
@router.post("/login-enhanced")
async def login_enhanced(login_data: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Enhanced login with MFA support"""
    try:
        client_info = get_client_info(request)
        
        # Authenticate user
        user = await user_crud.authenticate(
            db, 
            email=login_data.email, 
            password=login_data.password
        )
        
        if not user:
            logger.warning(f"Failed login attempt for email: {login_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if user.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account has been deactivated"
            )
        
        # Check if user has MFA enabled (placeholder)
        # TODO: Query actual MFA status from database
        mfa_enabled = False  # Placeholder
        
        if mfa_enabled:
            # Generate temporary token for MFA verification
            temp_token = secrets.token_urlsafe(32)
            
            return {
                "success": True,
                "mfa_required": True,
                "temp_token": temp_token,
                "message": "MFA verification required"
            }
        else:
            # Direct login without MFA
            access_token = SecurityManager.create_access_token(
                user_id=str(user.id),
                organization_id=str(user.organization_id)
            )
            refresh_token = SecurityManager.create_refresh_token(
                user_id=str(user.id),
                organization_id=str(user.organization_id)
            )
            
            # Update last login
            await user_crud.update_last_login(
                db,
                user_id=user.id,
                ip_address=client_info["ip_address"],
                user_agent=client_info["user_agent"]
            )
            
            # Create session record
            from app.models.user import UserSession
            session = UserSession(
                user_id=user.id,
                session_token=access_token,
                refresh_token=refresh_token,
                expires_at=datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
                ip_address=client_info["ip_address"],
                user_agent=client_info["user_agent"]
            )
            db.add(session)
            await db.commit()
            
            logger.info(f"User {user.email} logged in successfully")
            
            return {
                "success": True,
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "role": user.role,
                    "organization_id": str(user.organization_id) if user.organization_id else None
                }
            }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Enhanced login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )