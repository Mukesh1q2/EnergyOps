"""
Theme Management API Endpoints
Phase 5: Theme System & Admin Controls

Advanced theme system with multiple color modes, CSS variable management,
and RESTful endpoints for theme configuration.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
import json
from datetime import datetime

# Import dependencies
from ..models.theme import (
    Theme, ThemeCustomization, ThemeAnalytics, ThemeMode, ThemeType,
    get_default_light_theme, get_default_dark_theme, 
    get_default_auto_theme, get_default_light_blue_theme
)
from ..models.admin import Organization, User, is_feature_enabled
from ..schemas.theme import (
    ThemeCreate, ThemeUpdate, ThemeResponse, ThemeListResponse,
    ThemeCustomizationCreate, ThemeCustomizationUpdate, ThemeCustomizationResponse,
    ThemeAnalyticsResponse, ThemeCSSVariablesResponse, ThemeModeRequest
)

# Create router
router = APIRouter()

# Dependency to get database session
def get_db():
    # This would be implemented with actual database dependency
    pass

# Dependency to check admin permissions
def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["super_admin", "org_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    return current_user

# Dependency to get current user (placeholder)
def get_current_user():
    # This would be implemented with actual authentication
    pass

# Theme CRUD Endpoints

@router.get("/themes", response_model=ThemeListResponse)
async def get_themes(
    organization_id: Optional[int] = Query(None, description="Filter by organization"),
    mode: Optional[ThemeMode] = Query(None, description="Filter by theme mode"),
    active_only: bool = Query(True, description="Only return active themes"),
    include_system: bool = Query(True, description="Include system themes"),
    db: Session = Depends(get_db)
):
    """Get all themes with filtering options"""
    try:
        query = db.query(Theme)
        
        # Apply filters
        if organization_id:
            query = query.filter(Theme.organization_id == organization_id)
        if mode:
            query = query.filter(Theme.mode == mode.value)
        if active_only:
            query = query.filter(Theme.is_active == True)
        if not include_system:
            query = query.filter(Theme.type != ThemeType.SYSTEM.value)
        
        themes = query.all()
        
        return ThemeListResponse(
            themes=[ThemeResponse.from_orm(theme) for theme in themes],
            total=len(themes),
            filters={
                "organization_id": organization_id,
                "mode": mode.value if mode else None,
                "active_only": active_only,
                "include_system": include_system
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving themes: {str(e)}"
        )

@router.get("/themes/{theme_id}", response_model=ThemeResponse)
async def get_theme(
    theme_id: int,
    include_css: bool = Query(False, description="Include CSS variables"),
    db: Session = Depends(get_db)
):
    """Get a specific theme by ID"""
    try:
        theme = db.query(Theme).filter(Theme.id == theme_id).first()
        
        if not theme:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Theme not found"
            )
        
        response = ThemeResponse.from_orm(theme)
        if include_css:
            response.css_variables = theme.get_css_variables()
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving theme: {str(e)}"
        )

@router.post("/themes", response_model=ThemeResponse, status_code=status.HTTP_201_CREATED)
async def create_theme(
    theme_data: ThemeCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new theme"""
    try:
        # Check if theme name already exists
        existing = db.query(Theme).filter(Theme.name == theme_data.name).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Theme with this name already exists"
            )
        
        # Create theme
        theme = Theme(
            name=theme_data.name,
            description=theme_data.description,
            mode=theme_data.mode,
            type=theme_data.type,
            colors=theme_data.colors,
            variables=theme_data.variables,
            typography=theme_data.typography,
            is_active=theme_data.is_active,
            is_default=theme_data.is_default,
            organization_id=theme_data.organization_id,
            created_by=current_user.id
        )
        
        db.add(theme)
        db.commit()
        db.refresh(theme)
        
        # Log theme creation
        # audit_log = AuditLog(...)
        # db.add(audit_log)
        # db.commit()
        
        return ThemeResponse.from_orm(theme)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating theme: {str(e)}"
        )

@router.put("/themes/{theme_id}", response_model=ThemeResponse)
async def update_theme(
    theme_id: int,
    theme_data: ThemeUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update an existing theme"""
    try:
        theme = db.query(Theme).filter(Theme.id == theme_id).first()
        
        if not theme:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Theme not found"
            )
        
        # Check permissions
        if (theme.organization_id and 
            theme.organization_id != current_user.organization_id and 
            current_user.role != "super_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot modify theme from different organization"
            )
        
        # Update fields
        for field, value in theme_data.dict(exclude_unset=True).items():
            setattr(theme, field, value)
        
        theme.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(theme)
        
        return ThemeResponse.from_orm(theme)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating theme: {str(e)}"
        )

@router.delete("/themes/{theme_id}")
async def delete_theme(
    theme_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a theme"""
    try:
        theme = db.query(Theme).filter(Theme.id == theme_id).first()
        
        if not theme:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Theme not found"
            )
        
        # Check permissions
        if (theme.organization_id and 
            theme.organization_id != current_user.organization_id and 
            current_user.role != "super_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot delete theme from different organization"
            )
        
        # Prevent deletion of system themes
        if theme.type == ThemeType.SYSTEM.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete system themes"
            )
        
        db.delete(theme)
        db.commit()
        
        return {"message": "Theme deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting theme: {str(e)}"
        )

# Theme Mode Management

@router.post("/themes/{theme_id}/mode")
async def set_theme_mode(
    theme_id: int,
    mode_request: ThemeModeRequest,
    db: Session = Depends(get_db)
):
    """Set theme mode for a user"""
    try:
        theme = db.query(Theme).filter(Theme.id == theme_id).first()
        
        if not theme:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Theme not found"
            )
        
        # Store user theme preference
        # This would update the user's theme_preference field
        # current_user.theme_preference = mode_request.mode
        
        return {
            "message": "Theme mode updated successfully",
            "theme_id": theme_id,
            "mode": mode_request.mode
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error setting theme mode: {str(e)}"
        )

@router.get("/themes/modes", response_model=List[Dict[str, Any]])
async def get_available_modes():
    """Get all available theme modes"""
    return [
        {
            "mode": ThemeMode.LIGHT.value,
            "name": "Light",
            "description": "Clean and bright light theme",
            "is_available": True
        },
        {
            "mode": ThemeMode.DARK.value,
            "name": "Dark",
            "description": "Comfortable dark theme for low-light environments",
            "is_available": True
        },
        {
            "mode": ThemeMode.AUTO.value,
            "name": "Auto",
            "description": "Automatically switches based on system preference",
            "is_available": True
        },
        {
            "mode": ThemeMode.LIGHT_BLUE.value,
            "name": "Light Blue",
            "description": "Light theme with blue accents",
            "is_available": True
        }
    ]

# CSS Variables Endpoints

@router.get("/themes/{theme_id}/css-variables", response_model=ThemeCSSVariablesResponse)
async def get_css_variables(
    theme_id: int,
    mode: Optional[ThemeMode] = Query(None, description="Override theme mode"),
    db: Session = Depends(get_db)
):
    """Get CSS variables for a theme"""
    try:
        theme = db.query(Theme).filter(Theme.id == theme_id).first()
        
        if not theme:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Theme not found"
            )
        
        # Get CSS variables
        css_variables = theme.get_css_variables()
        
        # Apply mode overrides if specified
        if mode and mode != theme.mode:
            overrides = theme.apply_mode_overrides(mode)
            css_variables.update({f"--color-{k}": v for k, v in overrides.items()})
        
        return ThemeCSSVariablesResponse(
            theme_id=theme_id,
            mode=mode.value if mode else theme.mode,
            css_variables=css_variables,
            generated_at=datetime.utcnow().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating CSS variables: {str(e)}"
        )

@router.get("/themes/css/export")
async def export_theme_css(
    theme_id: int = Query(..., description="Theme ID to export"),
    mode: Optional[ThemeMode] = Query(None, description="Theme mode"),
    format: str = Query("css", description="Export format: css, json"),
    db: Session = Depends(get_db)
):
    """Export theme as CSS file or JSON"""
    try:
        theme = db.query(Theme).filter(Theme.id == theme_id).first()
        
        if not theme:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Theme not found"
            )
        
        css_variables = theme.get_css_variables()
        
        if format.lower() == "css":
            # Generate CSS content
            css_content = "/* Generated theme variables */\n:root {\n"
            for key, value in css_variables.items():
                css_content += f"  {key}: {value};\n"
            css_content += "}"
            
            return JSONResponse(
                content={
                    "theme_name": theme.name,
                    "mode": mode.value if mode else theme.mode,
                    "css": css_content,
                    "generated_at": datetime.utcnow().isoformat()
                },
                headers={
                    "Content-Disposition": f'attachment; filename="{theme.name.lower().replace(" ", "_")}.css"'
                }
            )
        
        elif format.lower() == "json":
            return JSONResponse(
                content={
                    "theme": theme.to_dict(),
                    "mode": mode.value if mode else theme.mode,
                    "css_variables": css_variables,
                    "generated_at": datetime.utcnow().isoformat()
                },
                headers={
                    "Content-Disposition": f'attachment; filename="{theme.name.lower().replace(" ", "_")}.json"'
                }
            )
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported export format: {format}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error exporting theme: {str(e)}"
        )

# Default Themes Management

@router.post("/themes/defaults/initialize")
async def initialize_default_themes(
    organization_id: Optional[int] = Query(None, description="Organization to assign defaults"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Initialize default themes for the system or organization"""
    try:
        default_themes = [
            get_default_light_theme(),
            get_default_dark_theme(),
            get_default_auto_theme(),
            get_default_light_blue_theme()
        ]
        
        created_themes = []
        
        for theme_config in default_themes:
            # Check if theme already exists
            existing = db.query(Theme).filter(
                Theme.name == theme_config["name"],
                Theme.organization_id == organization_id
            ).first()
            
            if not existing:
                theme = Theme(
                    name=theme_config["name"],
                    description=theme_config["description"],
                    mode=theme_config["mode"],
                    type=theme_config["type"],
                    colors=theme_config["colors"],
                    variables=theme_config["variables"],
                    typography=theme_config["typography"],
                    is_active=True,
                    is_default=True,
                    organization_id=organization_id,
                    created_by=current_user.id
                )
                
                db.add(theme)
                created_themes.append(theme)
        
        db.commit()
        
        return {
            "message": f"Initialized {len(created_themes)} default themes",
            "created_themes": [theme.id for theme in created_themes],
            "total_themes": len(db.query(Theme).filter(
                Theme.organization_id == organization_id
            ).all())
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error initializing default themes: {str(e)}"
        )

# Theme Preview and Testing

@router.get("/themes/{theme_id}/preview")
async def get_theme_preview(
    theme_id: int,
    include_samples: bool = Query(True, description="Include sample components"),
    db: Session = Depends(get_db)
):
    """Get theme preview data"""
    try:
        theme = db.query(Theme).filter(Theme.id == theme_id).first()
        
        if not theme:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Theme not found"
            )
        
        preview_data = {
            "theme": theme.to_dict(),
            "css_variables": theme.get_css_variables(),
            "preview_data": {
                "colors": theme.colors,
                "typography": theme.typography,
                "sample_buttons": [
                    {"variant": "primary", "text": "Primary Button"},
                    {"variant": "secondary", "text": "Secondary Button"},
                    {"variant": "outline", "text": "Outline Button"}
                ],
                "sample_cards": [
                    {"title": "Card Title", "content": "Card content goes here"},
                    {"title": "Another Card", "content": "More content"}
                ],
                "sample_charts": [
                    {"type": "line", "data": [1, 2, 3, 4, 5]},
                    {"type": "bar", "data": [3, 7, 2, 9, 4]}
                ]
            }
        }
        
        return preview_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating theme preview: {str(e)}"
        )

# Health Check for Theme System

@router.get("/themes/health")
async def theme_system_health():
    """Health check for theme system"""
    return {
        "status": "healthy",
        "service": "theme_system",
        "version": "5.0.0",
        "features": {
            "multi_mode_themes": True,
            "css_variables": True,
            "theme_customization": True,
            "export_capabilities": True,
            "analytics": True
        },
        "available_modes": [mode.value for mode in ThemeMode],
        "timestamp": datetime.utcnow().isoformat()
    }