"""
Dashboard API Endpoints
Phase 3: Enhanced Dashboard & Enterprise Features
"""

from fastapi import (
    APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, 
    File, Form, Query, Path
)
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import asyncio
import json
from datetime import datetime, timedelta

from ...database import get_db
from ...auth.security import get_current_user
from ...models.dashboard import (
    Dashboard, DashboardWidget, DashboardTemplate, DashboardPermission,
    DashboardShare, WidgetLayout, WidgetConfiguration, WidgetType,
    DashboardStatus, DashboardPermission as Permission
)
from ...models.widget import (
    WidgetDataSource, WidgetVisualization, WidgetAlert, WidgetCollaboration,
    DataSourceType, AlertCondition, AlertSeverity
)
from ...schemas.dashboard import (
    DashboardCreate, DashboardUpdate, DashboardResponse, DashboardListResponse,
    WidgetCreate, WidgetUpdate, WidgetResponse,
    TemplateCreate, TemplateResponse,
    LayoutResponse, PermissionResponse
)
from ...schemas.common import PaginationParams, SortParams
from ...services.dashboard_service import DashboardService
from ...utils.permissions import check_dashboard_permission
from ...utils.websocket_manager import WebSocketManager

router = APIRouter(prefix="/api/v1/dashboards", tags=["dashboards"])
security = HTTPBearer()
websocket_manager = WebSocketManager()

# Dashboard CRUD Operations
@router.post("/", response_model=DashboardResponse)
async def create_dashboard(
    dashboard_data: DashboardCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new dashboard"""
    dashboard_service = DashboardService(db)
    
    try:
        dashboard = await dashboard_service.create_dashboard(
            data=dashboard_data,
            user_id=current_user.id
        )
        
        # Broadcast creation event
        await websocket_manager.broadcast_to_org(
            org_id=dashboard.organization_id,
            event="dashboard_created",
            data={"dashboard_id": dashboard.id, "name": dashboard.name}
        )
        
        return dashboard
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=DashboardListResponse)
async def list_dashboards(
    organization_id: Optional[str] = Query(None),
    status: Optional[DashboardStatus] = Query(None),
    tags: Optional[List[str]] = Query(None),
    pagination: PaginationParams = Depends(),
    sort: SortParams = Depends(),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List dashboards with filtering and pagination"""
    dashboard_service = DashboardService(db)
    
    dashboards, total = await dashboard_service.list_dashboards(
        user_id=current_user.id,
        organization_id=organization_id,
        status=status,
        tags=tags,
        pagination=pagination,
        sort=sort
    )
    
    return DashboardListResponse(
        dashboards=dashboards,
        total=total,
        page=pagination.page,
        size=pagination.size,
        pages=(total + pagination.size - 1) // pagination.size
    )

@router.get("/{dashboard_id}", response_model=DashboardResponse)
async def get_dashboard(
    dashboard_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get dashboard by ID"""
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=dashboard_id, 
        required=Permission.VIEWER
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    dashboard_service = DashboardService(db)
    dashboard = await dashboard_service.get_dashboard(dashboard_id)
    
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    
    return dashboard

@router.put("/{dashboard_id}", response_model=DashboardResponse)
async def update_dashboard(
    dashboard_id: str,
    dashboard_data: DashboardUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update dashboard"""
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=dashboard_id, 
        required=Permission.EDITOR
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    dashboard_service = DashboardService(db)
    dashboard = await dashboard_service.update_dashboard(
        dashboard_id=dashboard_id,
        data=dashboard_data
    )
    
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    
    return dashboard

@router.delete("/{dashboard_id}")
async def delete_dashboard(
    dashboard_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete dashboard"""
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=dashboard_id, 
        required=Permission.OWNER
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    dashboard_service = DashboardService(db)
    success = await dashboard_service.delete_dashboard(dashboard_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    
    return {"message": "Dashboard deleted successfully"}

# Widget Management
@router.post("/{dashboard_id}/widgets", response_model=WidgetResponse)
async def create_widget(
    dashboard_id: str,
    widget_data: WidgetCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new widget in dashboard"""
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=dashboard_id, 
        required=Permission.EDITOR
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    dashboard_service = DashboardService(db)
    widget = await dashboard_service.create_widget(
        dashboard_id=dashboard_id,
        data=widget_data
    )
    
    # Broadcast widget creation
    await websocket_manager.broadcast_to_dashboard(
        dashboard_id=dashboard_id,
        event="widget_created",
        data={
            "widget_id": widget.id,
            "title": widget.title,
            "widget_type": widget.widget_type.value
        }
    )
    
    return widget

@router.get("/{dashboard_id}/widgets", response_model=List[WidgetResponse])
async def list_dashboard_widgets(
    dashboard_id: str,
    widget_type: Optional[WidgetType] = Query(None),
    is_visible: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List widgets in dashboard"""
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=dashboard_id, 
        required=Permission.VIEWER
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    dashboard_service = DashboardService(db)
    widgets = await dashboard_service.list_widgets(
        dashboard_id=dashboard_id,
        widget_type=widget_type,
        is_visible=is_visible
    )
    
    return widgets

@router.put("/{dashboard_id}/widgets/{widget_id}", response_model=WidgetResponse)
async def update_widget(
    dashboard_id: str,
    widget_id: str,
    widget_data: WidgetUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update widget configuration"""
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=dashboard_id, 
        required=Permission.EDITOR
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    dashboard_service = DashboardService(db)
    widget = await dashboard_service.update_widget(
        widget_id=widget_id,
        data=widget_data
    )
    
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    # Broadcast widget update
    await websocket_manager.broadcast_to_dashboard(
        dashboard_id=dashboard_id,
        event="widget_updated",
        data={
            "widget_id": widget.id,
            "updates": widget_data.dict(exclude_unset=True)
        }
    )
    
    return widget

@router.delete("/{dashboard_id}/widgets/{widget_id}")
async def delete_widget(
    dashboard_id: str,
    widget_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete widget from dashboard"""
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=dashboard_id, 
        required=Permission.EDITOR
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    dashboard_service = DashboardService(db)
    success = await dashboard_service.delete_widget(widget_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    # Broadcast widget deletion
    await websocket_manager.broadcast_to_dashboard(
        dashboard_id=dashboard_id,
        event="widget_deleted",
        data={"widget_id": widget_id}
    )
    
    return {"message": "Widget deleted successfully"}

# Layout Management
@router.get("/{dashboard_id}/layout", response_model=LayoutResponse)
async def get_dashboard_layout(
    dashboard_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get dashboard layout"""
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=dashboard_id, 
        required=Permission.VIEWER
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    dashboard_service = DashboardService(db)
    layout = await dashboard_service.get_layout(dashboard_id)
    
    return layout or LayoutResponse(
        dashboard_id=dashboard_id,
        layout_data={},
        layout_version=1
    )

@router.put("/{dashboard_id}/layout", response_model=LayoutResponse)
async def update_dashboard_layout(
    dashboard_id: str,
    layout_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update dashboard layout"""
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=dashboard_id, 
        required=Permission.EDITOR
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    dashboard_service = DashboardService(db)
    layout = await dashboard_service.update_layout(
        dashboard_id=dashboard_id,
        layout_data=layout_data,
        user_id=current_user.id
    )
    
    # Broadcast layout change
    await websocket_manager.broadcast_to_dashboard(
        dashboard_id=dashboard_id,
        event="layout_changed",
        data={"layout_data": layout_data}
    )
    
    return layout

# Dashboard Templates
@router.get("/templates/", response_model=List[TemplateResponse])
async def list_dashboard_templates(
    category: Optional[str] = Query(None),
    is_public: Optional[bool] = Query(True),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List available dashboard templates"""
    dashboard_service = DashboardService(db)
    templates = await dashboard_service.list_templates(
        category=category,
        is_public=is_public
    )
    
    return templates

@router.post("/templates/", response_model=TemplateResponse)
async def create_template(
    template_data: TemplateCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create dashboard template"""
    dashboard_service = DashboardService(db)
    template = await dashboard_service.create_template(
        data=template_data,
        user_id=current_user.id
    )
    
    return template

@router.post("/{dashboard_id}/create-from-template/{template_id}")
async def create_dashboard_from_template(
    dashboard_id: str,
    template_id: str,
    dashboard_name: str = Form(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create dashboard from template"""
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=dashboard_id, 
        required=Permission.EDITOR
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    dashboard_service = DashboardService(db)
    success = await dashboard_service.create_from_template(
        dashboard_id=dashboard_id,
        template_id=template_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to create from template")
    
    return {"message": "Dashboard created from template successfully"}

# Permissions Management
@router.get("/{dashboard_id}/permissions", response_model=List[PermissionResponse])
async def get_dashboard_permissions(
    dashboard_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get dashboard permissions"""
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=dashboard_id, 
        required=Permission.ADMIN
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    dashboard_service = DashboardService(db)
    permissions = await dashboard_service.get_permissions(dashboard_id)
    
    return permissions

@router.post("/{dashboard_id}/permissions")
async def manage_dashboard_permission(
    dashboard_id: str,
    user_id: str = Form(...),
    permission: Permission = Form(...),
    can_view: bool = Form(True),
    can_edit: bool = Form(False),
    can_delete: bool = Form(False),
    can_share: bool = Form(False),
    can_manage_users: bool = Form(False),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Manage dashboard permissions"""
    # Check permissions
    owner_permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=dashboard_id, 
        required=Permission.ADMIN
    )
    
    if not owner_permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    dashboard_service = DashboardService(db)
    perm = await dashboard_service.manage_permission(
        dashboard_id=dashboard_id,
        user_id=user_id,
        permission=permission,
        can_view=can_view,
        can_edit=can_edit,
        can_delete=can_delete,
        can_share=can_share,
        can_manage_users=can_manage_users
    )
    
    # Broadcast permission change
    await websocket_manager.broadcast_to_dashboard(
        dashboard_id=dashboard_id,
        event="permission_changed",
        data={
            "user_id": user_id,
            "permission": permission.value
        }
    )
    
    return {"message": "Permission updated successfully", "permission": perm}

# Dashboard Sharing
@router.post("/{dashboard_id}/share")
async def share_dashboard(
    dashboard_id: str,
    share_type: str = Form(...),
    requires_authentication: bool = Form(True),
    allowed_domains: Optional[List[str]] = Form(None),
    expires_at: Optional[datetime] = Form(None),
    allow_comments: bool = Form(False),
    allow_editing: bool = Form(False),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create dashboard share link"""
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=dashboard_id, 
        required=Permission.SHARE
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    dashboard_service = DashboardService(db)
    share = await dashboard_service.create_share(
        dashboard_id=dashboard_id,
        share_type=share_type,
        requires_authentication=requires_authentication,
        allowed_domains=allowed_domains or [],
        expires_at=expires_at,
        allow_comments=allow_comments,
        allow_editing=allow_editing,
        created_by=current_user.id
    )
    
    return {
        "message": "Dashboard share created successfully",
        "share_url": f"/shared/{share.token}",
        "share": share
    }

@router.delete("/{dashboard_id}/share/{share_id}")
async def revoke_dashboard_share(
    dashboard_id: str,
    share_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Revoke dashboard share"""
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=dashboard_id, 
        required=Permission.SHARE
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    dashboard_service = DashboardService(db)
    success = await dashboard_service.revoke_share(share_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Share not found")
    
    return {"message": "Dashboard share revoked successfully"}

# Dashboard Analytics
@router.get("/{dashboard_id}/analytics")
async def get_dashboard_analytics(
    dashboard_id: str,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get dashboard analytics"""
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=dashboard_id, 
        required=Permission.VIEWER
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    dashboard_service = DashboardService(db)
    analytics = await dashboard_service.get_analytics(
        dashboard_id=dashboard_id,
        days=days
    )
    
    return analytics

# Dashboard Export/Import
@router.post("/{dashboard_id}/export")
async def export_dashboard(
    dashboard_id: str,
    include_data: bool = Form(False),
    format: str = Form("json"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Export dashboard configuration"""
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=dashboard_id, 
        required=Permission.VIEWER
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    dashboard_service = DashboardService(db)
    export_data = await dashboard_service.export_dashboard(
        dashboard_id=dashboard_id,
        include_data=include_data,
        format=format
    )
    
    return export_data

@router.post("/import")
async def import_dashboard(
    dashboard_data: Dict[str, Any],
    dashboard_name: str = Form(...),
    organization_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Import dashboard configuration"""
    dashboard_service = DashboardService(db)
    dashboard = await dashboard_service.import_dashboard(
        dashboard_data=dashboard_data,
        dashboard_name=dashboard_name,
        organization_id=organization_id,
        user_id=current_user.id
    )
    
    return {"message": "Dashboard imported successfully", "dashboard": dashboard}