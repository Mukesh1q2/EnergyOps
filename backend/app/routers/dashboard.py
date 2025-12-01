"""
Dashboard Router - Manages user dashboard configuration, widgets, and layouts
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

# Pydantic models for request/response
class WidgetConfig(BaseModel):
    id: Optional[str] = None
    type: str
    title: str
    position: Dict[str, Any]
    config: Dict[str, Any]
    permissions: List[str]

class LayoutConfig(BaseModel):
    layout: str
    widgets: List[Dict[str, Any]]

class DashboardConfig(BaseModel):
    widgets: List[Dict[str, Any]]
    layout: str
    theme: str
    permissions: List[str]

# Default widgets for new users
DEFAULT_WIDGETS = [
    {
        "id": "default-energy-chart",
        "type": "energy-generation-chart",
        "title": "Real-time Energy Generation",
        "position": {"x": 0, "y": 0, "w": 8, "h": 4},
        "config": {
            "dataSource": "all",
            "timeRange": "24h",
            "aggregation": "sum"
        },
        "permissions": ["view-energy-data"]
    },
    {
        "id": "default-market-prices",
        "type": "market-prices-widget",
        "title": "Market Prices - PJM Zone",
        "position": {"x": 8, "y": 0, "w": 4, "h": 4},
        "config": {
            "marketZone": "PJM",
            "priceType": "LMP",
            "showTrend": True
        },
        "permissions": ["view-market-data"]
    },
    {
        "id": "default-asset-grid",
        "type": "asset-status-grid",
        "title": "Asset Status Overview",
        "position": {"x": 0, "y": 4, "w": 12, "h": 3},
        "config": {
            "assetTypes": ["solar", "wind", "battery"],
            "showMetrics": True,
            "refreshInterval": "1m"
        },
        "permissions": ["view-asset-data"]
    }
]

@router.get("/user-config")
async def get_user_dashboard_config(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's dashboard configuration including widgets and layout.
    Returns default configuration if user has no saved config.
    """
    try:
        # In a real implementation, this would fetch from database
        # For now, return default widgets
        user_permissions = getattr(current_user, 'permissions', []) or ['view-energy-data', 'view-market-data', 'view-asset-data']
        
        return {
            "success": True,
            "data": {
                "widgets": DEFAULT_WIDGETS,
                "layout": "grid",
                "theme": "light",
                "permissions": user_permissions
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load dashboard configuration: {str(e)}"
        )

@router.get("/widgets/default")
async def get_default_widgets():
    """
    Get default widgets for new users or dashboard reset.
    """
    return {
        "success": True,
        "data": {
            "widgets": DEFAULT_WIDGETS,
            "layout": "grid"
        }
    }

@router.post("/widgets")
async def add_widget(
    widget: WidgetConfig,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a new widget to user's dashboard.
    """
    try:
        # Generate widget ID if not provided
        if not widget.id:
            widget.id = f"widget-{uuid.uuid4()}"
        
        # In a real implementation, save to database
        # For now, return the widget with generated ID
        widget_data = widget.dict()
        widget_data["created_at"] = datetime.utcnow().isoformat()
        
        return {
            "success": True,
            "data": widget_data,
            "message": "Widget added successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add widget: {str(e)}"
        )

@router.put("/widgets/{widget_id}")
async def update_widget(
    widget_id: str,
    updates: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing widget configuration.
    """
    try:
        # In a real implementation, update in database
        # For now, return the updated widget
        updated_widget = {
            "id": widget_id,
            **updates,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        return {
            "success": True,
            "data": updated_widget,
            "message": "Widget updated successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update widget: {str(e)}"
        )

@router.delete("/widgets/{widget_id}")
async def delete_widget(
    widget_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a widget from user's dashboard.
    """
    try:
        # In a real implementation, delete from database
        return {
            "success": True,
            "message": f"Widget {widget_id} deleted successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete widget: {str(e)}"
        )

@router.put("/layout")
async def update_dashboard_layout(
    layout_config: LayoutConfig,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save dashboard layout changes including widget positions.
    """
    try:
        # In a real implementation, save to database
        return {
            "success": True,
            "data": {
                "layout": layout_config.layout,
                "widgets": layout_config.widgets,
                "updated_at": datetime.utcnow().isoformat()
            },
            "message": "Dashboard layout updated successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update layout: {str(e)}"
        )

@router.post("/config")
async def save_dashboard_config(
    config: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save complete dashboard configuration including settings, theme, preferences.
    """
    try:
        # Extract configuration data
        dashboard_id = config.get('dashboard_id', 'default')
        settings = config.get('settings', {})
        
        # In a real implementation, save to database
        # For now, return success with the saved configuration
        saved_config = {
            "dashboard_id": dashboard_id,
            "name": settings.get('name', 'My Dashboard'),
            "description": settings.get('description', ''),
            "theme": settings.get('theme', 'light'),
            "language": settings.get('language', 'en'),
            "timezone": settings.get('timezone', 'America/New_York'),
            "currency": settings.get('currency', 'USD'),
            "autoRefresh": settings.get('autoRefresh', '5m'),
            "notifications": settings.get('notifications', {}),
            "privacy": settings.get('privacy', {}),
            "performance": settings.get('performance', {}),
            "accessibility": settings.get('accessibility', {}),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        return {
            "success": True,
            "data": saved_config,
            "message": "Dashboard configuration saved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save configuration: {str(e)}"
        )