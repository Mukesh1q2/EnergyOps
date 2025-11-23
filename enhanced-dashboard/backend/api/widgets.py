"""
Widget API Endpoints
Phase 3: Enhanced Dashboard & Enterprise Features
"""

from fastapi import (
    APIRouter, Depends, HTTPException, BackgroundTasks, Query
)
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import asyncio
import json
from datetime import datetime

from ...database import get_db
from ...auth.security import get_current_user
from ...models.widget import (
    WidgetDataSource, WidgetVisualization, WidgetAlert, WidgetCollaboration,
    DataSourceType, AlertCondition, AlertSeverity
)
from ...models.dashboard import DashboardWidget, WidgetType
from ...schemas.widget import (
    WidgetDataSourceCreate, WidgetDataSourceUpdate, WidgetDataSourceResponse,
    WidgetVisualizationCreate, WidgetVisualizationUpdate, WidgetVisualizationResponse,
    WidgetAlertCreate, WidgetAlertUpdate, WidgetAlertResponse,
    WidgetCollaborationUpdate, WidgetCollaborationResponse
)
from ...schemas.common import PaginationParams
from ...services.widget_service import WidgetService
from ...utils.permissions import check_dashboard_permission
from ...utils.websocket_manager import WebSocketManager

router = APIRouter(prefix="/api/v1/widgets", tags=["widgets"])
security = HTTPBearer()
websocket_manager = WebSocketManager()

# Data Source Management
@router.post("/{widget_id}/data-sources", response_model=WidgetDataSourceResponse)
async def create_data_source(
    widget_id: str,
    data_source_data: WidgetDataSourceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create data source for widget"""
    # Get widget and check permissions
    widget = db.query(DashboardWidget).filter(
        DashboardWidget.id == widget_id
    ).first()
    
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=widget.dashboard_id, 
        required="editor"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    widget_service = WidgetService(db)
    data_source = await widget_service.create_data_source(
        widget_id=widget_id,
        data=data_source_data
    )
    
    return data_source

@router.get("/{widget_id}/data-sources", response_model=List[WidgetDataSourceResponse])
async def list_data_sources(
    widget_id: str,
    is_active: Optional[bool] = Query(None),
    source_type: Optional[DataSourceType] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List data sources for widget"""
    # Get widget and check permissions
    widget = db.query(DashboardWidget).filter(
        DashboardWidget.id == widget_id
    ).first()
    
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=widget.dashboard_id, 
        required="viewer"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    widget_service = WidgetService(db)
    data_sources = await widget_service.list_data_sources(
        widget_id=widget_id,
        is_active=is_active,
        source_type=source_type
    )
    
    return data_sources

@router.get("/data-sources/{data_source_id}", response_model=WidgetDataSourceResponse)
async def get_data_source(
    data_source_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get data source by ID"""
    widget_service = WidgetService(db)
    data_source = await widget_service.get_data_source(data_source_id)
    
    if not data_source:
        raise HTTPException(status_code=404, detail="Data source not found")
    
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=data_source.widget.dashboard_id, 
        required="viewer"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    return data_source

@router.put("/data-sources/{data_source_id}", response_model=WidgetDataSourceResponse)
async def update_data_source(
    data_source_id: str,
    data_source_data: WidgetDataSourceUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update data source"""
    widget_service = WidgetService(db)
    data_source = await widget_service.get_data_source(data_source_id)
    
    if not data_source:
        raise HTTPException(status_code=404, detail="Data source not found")
    
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=data_source.widget.dashboard_id, 
        required="editor"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    updated_data_source = await widget_service.update_data_source(
        data_source_id=data_source_id,
        data=data_source_data
    )
    
    # Invalidate cache and trigger refresh
    await widget_service.invalidate_data_source_cache(data_source_id)
    
    return updated_data_source

@router.delete("/data-sources/{data_source_id}")
async def delete_data_source(
    data_source_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete data source"""
    widget_service = WidgetService(db)
    data_source = await widget_service.get_data_source(data_source_id)
    
    if not data_source:
        raise HTTPException(status_code=404, detail="Data source not found")
    
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=data_source.widget.dashboard_id, 
        required="editor"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    success = await widget_service.delete_data_source(data_source_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete data source")
    
    return {"message": "Data source deleted successfully"}

@router.post("/data-sources/{data_source_id}/refresh")
async def refresh_data_source(
    data_source_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Refresh data source data"""
    widget_service = WidgetService(db)
    data_source = await widget_service.get_data_source(data_source_id)
    
    if not data_source:
        raise HTTPException(status_code=404, detail="Data source not found")
    
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=data_source.widget.dashboard_id, 
        required="viewer"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Start refresh in background
    background_tasks.add_task(
        widget_service.refresh_data_source,
        data_source_id=data_source_id
    )
    
    return {"message": "Data source refresh started"}

# Data Source Testing and Configuration
@router.post("/data-sources/{data_source_id}/test")
async def test_data_source_connection(
    data_source_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Test data source connection"""
    widget_service = WidgetService(db)
    data_source = await widget_service.get_data_source(data_source_id)
    
    if not data_source:
        raise HTTPException(status_code=404, detail="Data source not found")
    
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=data_source.widget.dashboard_id, 
        required="editor"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Test connection
    test_result = await widget_service.test_data_source_connection(data_source_id)
    
    return {
        "connection_successful": test_result.get("success", False),
        "response_time_ms": test_result.get("response_time"),
        "error_message": test_result.get("error"),
        "sample_data": test_result.get("sample_data")
    }

@router.get("/data-sources/{data_source_id}/preview")
async def preview_data_source_data(
    data_source_id: str,
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Preview data from data source"""
    widget_service = WidgetService(db)
    data_source = await widget_service.get_data_source(data_source_id)
    
    if not data_source:
        raise HTTPException(status_code=404, detail="Data source not found")
    
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=data_source.widget.dashboard_id, 
        required="viewer"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Get preview data
    preview_data = await widget_service.get_data_preview(
        data_source_id=data_source_id,
        limit=limit
    )
    
    return preview_data

# Visualization Management
@router.post("/{widget_id}/visualizations", response_model=WidgetVisualizationResponse)
async def create_visualization(
    widget_id: str,
    visualization_data: WidgetVisualizationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create visualization for widget"""
    # Get widget and check permissions
    widget = db.query(DashboardWidget).filter(
        DashboardWidget.id == widget_id
    ).first()
    
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=widget.dashboard_id, 
        required="editor"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    widget_service = WidgetService(db)
    visualization = await widget_service.create_visualization(
        widget_id=widget_id,
        data=visualization_data
    )
    
    return visualization

@router.put("/visualizations/{visualization_id}", response_model=WidgetVisualizationResponse)
async def update_visualization(
    visualization_id: str,
    visualization_data: WidgetVisualizationUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update visualization configuration"""
    widget_service = WidgetService(db)
    visualization = await widget_service.get_visualization(visualization_id)
    
    if not visualization:
        raise HTTPException(status_code=404, detail="Visualization not found")
    
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=visualization.widget.dashboard_id, 
        required="editor"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    updated_visualization = await widget_service.update_visualization(
        visualization_id=visualization_id,
        data=visualization_data
    )
    
    return updated_visualization

@router.delete("/visualizations/{visualization_id}")
async def delete_visualization(
    visualization_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete visualization"""
    widget_service = WidgetService(db)
    visualization = await widget_service.get_visualization(visualization_id)
    
    if not visualization:
        raise HTTPException(status_code=404, detail="Visualization not found")
    
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=visualization.widget.dashboard_id, 
        required="editor"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    success = await widget_service.delete_visualization(visualization_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete visualization")
    
    return {"message": "Visualization deleted successfully"}

# Alert Management
@router.post("/{widget_id}/alerts", response_model=WidgetAlertResponse)
async def create_alert(
    widget_id: str,
    alert_data: WidgetAlertCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create alert for widget"""
    # Get widget and check permissions
    widget = db.query(DashboardWidget).filter(
        DashboardWidget.id == widget_id
    ).first()
    
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=widget.dashboard_id, 
        required="editor"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    widget_service = WidgetService(db)
    alert = await widget_service.create_alert(
        widget_id=widget_id,
        data=alert_data
    )
    
    return alert

@router.put("/alerts/{alert_id}", response_model=WidgetAlertResponse)
async def update_alert(
    alert_id: str,
    alert_data: WidgetAlertUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update alert configuration"""
    widget_service = WidgetService(db)
    alert = await widget_service.get_alert(alert_id)
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=alert.widget.dashboard_id, 
        required="editor"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    updated_alert = await widget_service.update_alert(
        alert_id=alert_id,
        data=alert_data
    )
    
    return updated_alert

@router.post("/alerts/{alert_id}/toggle")
async def toggle_alert(
    alert_id: str,
    enabled: bool,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Enable/disable alert"""
    widget_service = WidgetService(db)
    alert = await widget_service.get_alert(alert_id)
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=alert.widget.dashboard_id, 
        required="editor"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    updated_alert = await widget_service.toggle_alert(alert_id, enabled)
    
    return {"message": f"Alert {'enabled' if enabled else 'disabled'}", "alert": updated_alert}

@router.delete("/alerts/{alert_id}")
async def delete_alert(
    alert_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete alert"""
    widget_service = WidgetService(db)
    alert = await widget_service.get_alert(alert_id)
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=alert.widget.dashboard_id, 
        required="editor"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    success = await widget_service.delete_alert(alert_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete alert")
    
    return {"message": "Alert deleted successfully"}

@router.get("/alerts/{alert_id}/history")
async def get_alert_history(
    alert_id: str,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get alert trigger history"""
    widget_service = WidgetService(db)
    alert = await widget_service.get_alert(alert_id)
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=alert.widget.dashboard_id, 
        required="viewer"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    history = await widget_service.get_alert_history(alert_id, days=days)
    
    return history

# Collaboration Settings
@router.put("/{widget_id}/collaboration", response_model=WidgetCollaborationResponse)
async def update_collaboration_settings(
    widget_id: str,
    collaboration_data: WidgetCollaborationUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update widget collaboration settings"""
    # Get widget and check permissions
    widget = db.query(DashboardWidget).filter(
        DashboardWidget.id == widget_id
    ).first()
    
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=widget.dashboard_id, 
        required="editor"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    widget_service = WidgetService(db)
    collaboration = await widget_service.update_collaboration_settings(
        widget_id=widget_id,
        data=collaboration_data
    )
    
    return collaboration

@router.get("/{widget_id}/collaboration/stats")
async def get_collaboration_stats(
    widget_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get widget collaboration statistics"""
    # Get widget and check permissions
    widget = db.query(DashboardWidget).filter(
        DashboardWidget.id == widget_id
    ).first()
    
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=widget.dashboard_id, 
        required="viewer"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    widget_service = WidgetService(db)
    stats = await widget_service.get_collaboration_stats(widget_id)
    
    return stats

# Widget Performance and Analytics
@router.get("/{widget_id}/performance")
async def get_widget_performance(
    widget_id: str,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get widget performance metrics"""
    # Get widget and check permissions
    widget = db.query(DashboardWidget).filter(
        DashboardWidget.id == widget_id
    ).first()
    
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=widget.dashboard_id, 
        required="viewer"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    widget_service = WidgetService(db)
    performance = await widget_service.get_performance_metrics(widget_id, days=days)
    
    return performance

@router.get("/{widget_id}/data-quality")
async def get_widget_data_quality(
    widget_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get widget data quality assessment"""
    # Get widget and check permissions
    widget = db.query(DashboardWidget).filter(
        DashboardWidget.id == widget_id
    ).first()
    
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=widget.dashboard_id, 
        required="viewer"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    widget_service = WidgetService(db)
    quality = await widget_service.assess_data_quality(widget_id)
    
    return quality

# Widget Export and Templates
@router.post("/{widget_id}/export")
async def export_widget(
    widget_id: str,
    include_data: bool = Query(False),
    format: str = Query("json"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Export widget configuration"""
    # Get widget and check permissions
    widget = db.query(DashboardWidget).filter(
        DashboardWidget.id == widget_id
    ).first()
    
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=widget.dashboard_id, 
        required="viewer"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    widget_service = WidgetService(db)
    export_data = await widget_service.export_widget(
        widget_id=widget_id,
        include_data=include_data,
        format=format
    )
    
    return export_data

@router.post("/templates")
async def create_widget_template(
    widget_id: str,
    template_name: str,
    template_description: Optional[str] = None,
    is_public: bool = False,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create widget template from existing widget"""
    # Get widget and check permissions
    widget = db.query(DashboardWidget).filter(
        DashboardWidget.id == widget_id
    ).first()
    
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=widget.dashboard_id, 
        required="editor"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    widget_service = WidgetService(db)
    template = await widget_service.create_template(
        widget_id=widget_id,
        template_name=template_name,
        template_description=template_description,
        is_public=is_public,
        created_by=current_user.id
    )
    
    return {"message": "Widget template created successfully", "template": template}

@router.get("/templates", response_model=List[Dict])
async def list_widget_templates(
    widget_type: Optional[WidgetType] = Query(None),
    is_public: Optional[bool] = Query(None),
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List available widget templates"""
    widget_service = WidgetService(db)
    templates = await widget_service.list_templates(
        widget_type=widget_type,
        is_public=is_public,
        pagination=pagination
    )
    
    return templates