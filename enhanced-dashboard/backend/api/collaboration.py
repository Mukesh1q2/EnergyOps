"""
Collaboration API Endpoints
Phase 3: Enhanced Dashboard & Enterprise Features
"""

from fastapi import (
    APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect,
    Query, Path, BackgroundTasks
)
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Set
import asyncio
import json
from datetime import datetime

from ...database import get_db
from ...auth.security import get_current_user
from ...models.collaboration import (
    CollaborationSession, LiveCursor, Comment, Mention, DashboardChange,
    UserPresence, SessionStatus, PresenceStatus, CommentStatus, ChangeType
)
from ...models.dashboard import Dashboard
from ...schemas.collaboration import (
    CollaborationSessionCreate, CollaborationSessionResponse,
    LiveCursorUpdate, LiveCursorResponse, CommentCreate, CommentResponse,
    MentionResponse, DashboardChangeResponse, UserPresenceResponse
)
from ...schemas.common import PaginationParams
from ...services.collaboration_service import CollaborationService
from ...utils.permissions import check_dashboard_permission
from ...utils.websocket_manager import WebSocketManager

router = APIRouter(prefix="/api/v1/collaboration", tags=["collaboration"])
security = HTTPBearer()
collaboration_service = CollaborationService()

# Active connections storage (in production, use Redis)
active_connections: Dict[str, Set[WebSocket]] = {}
connection_sessions: Dict[str, Dict[str, Any]] = {}

# Collaboration Sessions
@router.post("/sessions", response_model=CollaborationSessionResponse)
async def create_collaboration_session(
    session_data: CollaborationSessionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new collaboration session"""
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=session_data.dashboard_id, 
        required="editor"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    session = await collaboration_service.create_session(
        data=session_data,
        user_id=current_user.id
    )
    
    return session

@router.get("/sessions", response_model=List[CollaborationSessionResponse])
async def list_collaboration_sessions(
    dashboard_id: Optional[str] = Query(None),
    status: Optional[SessionStatus] = Query(None),
    session_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List collaboration sessions"""
    sessions = await collaboration_service.list_sessions(
        user_id=current_user.id,
        dashboard_id=dashboard_id,
        status=status,
        session_type=session_type
    )
    
    return sessions

@router.get("/sessions/{session_id}", response_model=CollaborationSessionResponse)
async def get_collaboration_session(
    session_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get collaboration session details"""
    session = await collaboration_service.get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=session.dashboard_id, 
        required="viewer"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    return session

@router.put("/sessions/{session_id}")
async def update_collaboration_session(
    session_id: str,
    session_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update collaboration session"""
    session = await collaboration_service.get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check permissions (only session creator or dashboard admin)
    if (session.created_by != current_user.id and
        not await check_dashboard_permission(db, current_user.id, session.dashboard_id, "admin")):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    updated_session = await collaboration_service.update_session(
        session_id=session_id,
        data=session_data
    )
    
    # Broadcast update to connected clients
    await broadcast_to_session(
        session_id=session_id,
        event="session_updated",
        data=updated_session.dict()
    )
    
    return updated_session

@router.post("/sessions/{session_id}/join")
async def join_collaboration_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Join a collaboration session"""
    session = await collaboration_service.get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check permissions
    permission = await check_dashboard_permission(
        db=db, 
        user_id=current_user.id, 
        dashboard_id=session.dashboard_id, 
        required="viewer"
    )
    
    if not permission:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Join session
    success = await collaboration_service.join_session(
        session_id=session_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to join session")
    
    # Broadcast user join
    await broadcast_to_session(
        session_id=session_id,
        event="user_joined",
        data={
            "user_id": current_user.id,
            "username": current_user.username,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    
    return {"message": "Successfully joined session"}

@router.post("/sessions/{session_id}/leave")
async def leave_collaboration_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Leave a collaboration session"""
    success = await collaboration_service.leave_session(
        session_id=session_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to leave session")
    
    # Broadcast user leave
    await broadcast_to_session(
        session_id=session_id,
        event="user_left",
        data={
            "user_id": current_user.id,
            "username": current_user.username,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    
    return {"message": "Successfully left session"}

@router.delete("/sessions/{session_id}")
async def end_collaboration_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """End a collaboration session"""
    session = await collaboration_service.get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check permissions (only session creator or dashboard admin)
    if (session.created_by != current_user.id and
        not await check_dashboard_permission(db, current_user.id, session.dashboard_id, "admin")):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    success = await collaboration_service.end_session(session_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to end session")
    
    # Broadcast session end
    await broadcast_to_session(
        session_id=session_id,
        event="session_ended",
        data={"session_id": session_id}
    )
    
    return {"message": "Session ended successfully"}

# Live Cursors
@router.post("/sessions/{session_id}/cursors")
async def update_live_cursor(
    session_id: str,
    cursor_data: LiveCursorUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update live cursor position"""
    # Verify user is in session
    if not await collaboration_service.is_user_in_session(session_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a session participant")
    
    cursor = await collaboration_service.update_cursor(
        session_id=session_id,
        user_id=current_user.id,
        cursor_data=cursor_data
    )
    
    # Broadcast cursor update
    await broadcast_to_session(
        session_id=session_id,
        event="cursor_updated",
        data={
            "user_id": current_user.id,
            "cursor": cursor.dict(),
            "timestamp": datetime.utcnow().isoformat()
        },
        exclude_user=current_user.id
    )
    
    return cursor

@router.get("/sessions/{session_id}/cursors", response_model=List[LiveCursorResponse])
async def get_active_cursors(
    session_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all active cursors in session"""
    # Verify user is in session
    if not await collaboration_service.is_user_in_session(session_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a session participant")
    
    cursors = await collaboration_service.get_active_cursors(session_id)
    
    return cursors

@router.delete("/sessions/{session_id}/cursors/{cursor_id}")
async def remove_live_cursor(
    session_id: str,
    cursor_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Remove live cursor"""
    # Verify user is in session
    if not await collaboration_service.is_user_in_session(session_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a session participant")
    
    success = await collaboration_service.remove_cursor(
        session_id=session_id,
        cursor_id=cursor_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to remove cursor")
    
    # Broadcast cursor removal
    await broadcast_to_session(
        session_id=session_id,
        event="cursor_removed",
        data={"cursor_id": cursor_id},
        exclude_user=current_user.id
    )
    
    return {"message": "Cursor removed successfully"}

# Comments and Annotations
@router.post("/sessions/{session_id}/comments", response_model=CommentResponse)
async def create_comment(
    session_id: str,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a comment"""
    # Verify user is in session
    if not await collaboration_service.is_user_in_session(session_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a session participant")
    
    comment = await collaboration_service.create_comment(
        session_id=session_id,
        data=comment_data,
        user_id=current_user.id
    )
    
    # Handle mentions
    mentioned_users = await collaboration_service.process_mentions(
        comment_id=comment.id,
        content=comment.content,
        user_id=current_user.id
    )
    
    # Broadcast comment creation
    await broadcast_to_session(
        session_id=session_id,
        event="comment_created",
        data={
            "comment": comment.dict(),
            "mentions": mentioned_users,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    
    return comment

@router.get("/sessions/{session_id}/comments", response_model=List[CommentResponse])
async def get_session_comments(
    session_id: str,
    widget_id: Optional[str] = Query(None),
    parent_comment_id: Optional[str] = Query(None),
    status: Optional[CommentStatus] = Query(None),
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get comments in session"""
    # Verify user is in session
    if not await collaboration_service.is_user_in_session(session_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a session participant")
    
    comments = await collaboration_service.get_comments(
        session_id=session_id,
        widget_id=widget_id,
        parent_comment_id=parent_comment_id,
        status=status,
        pagination=pagination
    )
    
    return comments

@router.put("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: str,
    content: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update comment"""
    comment = await collaboration_service.get_comment(comment_id)
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check permissions (only comment author)
    if comment.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Only the comment author can edit it")
    
    updated_comment = await collaboration_service.update_comment(
        comment_id=comment_id,
        content=content,
        user_id=current_user.id
    )
    
    # Broadcast comment update
    await broadcast_to_session(
        session_id=comment.session_id,
        event="comment_updated",
        data={
            "comment": updated_comment.dict(),
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    
    return updated_comment

@router.post("/comments/{comment_id}/resolve")
async def resolve_comment(
    comment_id: str,
    resolution_notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Resolve comment"""
    comment = await collaboration_service.get_comment(comment_id)
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check permissions (comment author or dashboard admin)
    if (comment.created_by != current_user.id and
        not await check_dashboard_permission(db, current_user.id, comment.session.dashboard_id, "admin")):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    resolved_comment = await collaboration_service.resolve_comment(
        comment_id=comment_id,
        resolved_by=current_user.id,
        resolution_notes=resolution_notes
    )
    
    # Broadcast comment resolution
    await broadcast_to_session(
        session_id=comment.session_id,
        event="comment_resolved",
        data={
            "comment_id": comment_id,
            "resolved_by": current_user.id,
            "resolution_notes": resolution_notes,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    
    return resolved_comment

@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete comment"""
    comment = await collaboration_service.get_comment(comment_id)
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check permissions (comment author or dashboard admin)
    if (comment.created_by != current_user.id and
        not await check_dashboard_permission(db, current_user.id, comment.session.dashboard_id, "admin")):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    success = await collaboration_service.delete_comment(comment_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete comment")
    
    # Broadcast comment deletion
    await broadcast_to_session(
        session_id=comment.session_id,
        event="comment_deleted",
        data={
            "comment_id": comment_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    
    return {"message": "Comment deleted successfully"}

@router.post("/comments/{comment_id}/vote")
async def vote_comment(
    comment_id: str,
    vote_type: str,  # 'upvote' or 'downvote'
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Vote on comment"""
    comment = await collaboration_service.get_comment(comment_id)
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Verify user is in session
    if not await collaboration_service.is_user_in_session(comment.session_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a session participant")
    
    result = await collaboration_service.vote_comment(
        comment_id=comment_id,
        user_id=current_user.id,
        vote_type=vote_type
    )
    
    # Broadcast vote update
    await broadcast_to_session(
        session_id=comment.session_id,
        event="comment_voted",
        data={
            "comment_id": comment_id,
            "user_id": current_user.id,
            "vote_type": vote_type,
            "result": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    
    return result

# Dashboard Changes and Version Control
@router.get("/sessions/{session_id}/changes", response_model=List[DashboardChangeResponse])
async def get_dashboard_changes(
    session_id: str,
    change_type: Optional[ChangeType] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get dashboard changes in session"""
    # Verify user is in session
    if not await collaboration_service.is_user_in_session(session_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a session participant")
    
    changes = await collaboration_service.get_changes(
        session_id=session_id,
        change_type=change_type,
        limit=limit
    )
    
    return changes

@router.post("/sessions/{session_id}/changes", response_model=DashboardChangeResponse)
async def record_dashboard_change(
    session_id: str,
    change_type: ChangeType,
    target_type: str,
    target_id: Optional[str] = None,
    old_value: Optional[Dict[str, Any]] = None,
    new_value: Optional[Dict[str, Any]] = None,
    change_description: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Record a dashboard change"""
    # Verify user is in session
    if not await collaboration_service.is_user_in_session(session_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a session participant")
    
    change = await collaboration_service.record_change(
        session_id=session_id,
        dashboard_id=await collaboration_service.get_session_dashboard_id(session_id),
        change_type=change_type,
        target_type=target_type,
        target_id=target_id,
        old_value=old_value,
        new_value=new_value,
        change_description=change_description or f"{change_type.value.replace('_', ' ').title()}",
        user_id=current_user.id
    )
    
    # Broadcast change
    await broadcast_to_session(
        session_id=session_id,
        event="dashboard_changed",
        data={
            "change": change.dict(),
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    
    return change

# User Presence
@router.post("/sessions/{session_id}/presence")
async def update_user_presence(
    session_id: str,
    status: PresenceStatus,
    action_type: Optional[str] = None,
    action_target: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update user presence status"""
    # Verify user is in session
    if not await collaboration_service.is_user_in_session(session_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a session participant")
    
    presence = await collaboration_service.update_presence(
        session_id=session_id,
        user_id=current_user.id,
        status=status,
        action_type=action_type,
        action_target=action_target
    )
    
    # Broadcast presence update
    await broadcast_to_session(
        session_id=session_id,
        event="presence_updated",
        data={
            "user_id": current_user.id,
            "presence": presence.dict(),
            "timestamp": datetime.utcnow().isoformat()
        },
        exclude_user=current_user.id
    )
    
    return presence

@router.get("/sessions/{session_id}/presence", response_model=List[UserPresenceResponse])
async def get_session_presence(
    session_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all user presence states in session"""
    # Verify user is in session
    if not await collaboration_service.is_user_in_session(session_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a session participant")
    
    presence_states = await collaboration_service.get_session_presence(session_id)
    
    return presence_states

# WebSocket endpoints
@router.websocket("/ws/sessions/{session_id}")
async def websocket_session_endpoint(
    websocket: WebSocket,
    session_id: str,
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for real-time collaboration"""
    await websocket.accept()
    
    # Extract user info from token (in production, validate JWT)
    try:
        # For now, we'll accept the connection and handle auth in message processing
        connection_id = f"{session_id}_{datetime.utcnow().timestamp()}"
        active_connections.setdefault(session_id, set()).add(websocket)
        connection_sessions[connection_id] = {
            "session_id": session_id,
            "connected_at": datetime.utcnow(),
            "last_activity": datetime.utcnow()
        }
        
        # Send welcome message
        await websocket.send_json({
            "event": "connected",
            "data": {
                "connection_id": connection_id,
                "session_id": session_id,
                "timestamp": datetime.utcnow().isoformat()
            }
        })
        
        while True:
            try:
                # Receive message
                data = await websocket.receive_json()
                await handle_websocket_message(connection_id, data, db, websocket)
                
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await websocket.send_json({
                    "event": "error",
                    "data": {"message": "Invalid JSON data"}
                })
            except Exception as e:
                await websocket.send_json({
                    "event": "error", 
                    "data": {"message": f"Server error: {str(e)}"}
                })
                
    except Exception as e:
        await websocket.close(code=4000, reason=str(e))
    finally:
        # Cleanup
        if session_id in active_connections:
            active_connections[session_id].discard(websocket)
            if not active_connections[session_id]:
                del active_connections[session_id]
        
        connection_sessions.pop(connection_id, None)

# Helper functions
async def broadcast_to_session(
    session_id: str,
    event: str,
    data: Dict[str, Any],
    exclude_user: Optional[str] = None
):
    """Broadcast message to all users in session"""
    if session_id not in active_connections:
        return
    
    message = {
        "event": event,
        "data": data,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Send to all connected clients
    disconnected = []
    for websocket in active_connections[session_id]:
        try:
            # Filter out messages for specific user if needed
            connection_id = None
            for conn_id, conn_data in connection_sessions.items():
                if conn_data.get("session_id") == session_id:
                    # In production, track user IDs properly
                    pass
            
            await websocket.send_json(message)
        except:
            disconnected.append(websocket)
    
    # Remove disconnected clients
    for websocket in disconnected:
        active_connections[session_id].discard(websocket)

async def handle_websocket_message(
    connection_id: str, 
    data: Dict[str, Any], 
    db: Session, 
    websocket: WebSocket
):
    """Handle incoming WebSocket messages"""
    event = data.get("event")
    message_data = data.get("data", {})
    
    if event == "cursor_update":
        # Handle cursor update
        await handle_cursor_update(connection_id, message_data, db, websocket)
    elif event == "presence_update":
        # Handle presence update
        await handle_presence_update(connection_id, message_data, db, websocket)
    elif event == "typing_indicator":
        # Handle typing indicator
        await handle_typing_indicator(connection_id, message_data, db, websocket)
    else:
        await websocket.send_json({
            "event": "error",
            "data": {"message": f"Unknown event: {event}"}
        })

async def handle_cursor_update(connection_id: str, data: Dict[str, Any], db: Session, websocket: WebSocket):
    """Handle cursor update via WebSocket"""
    session_data = connection_sessions.get(connection_id)
    if not session_data:
        return
    
    # In production, validate user permissions and update cursor
    # For now, just broadcast the cursor update
    await broadcast_to_session(
        session_data["session_id"],
        "cursor_updated",
        data,
        exclude_user=None
    )

async def handle_presence_update(connection_id: str, data: Dict[str, Any], db: Session, websocket: WebSocket):
    """Handle presence update via WebSocket"""
    session_data = connection_sessions.get(connection_id)
    if not session_data:
        return
    
    # In production, update user presence and broadcast
    await broadcast_to_session(
        session_data["session_id"],
        "presence_updated",
        data,
        exclude_user=None
    )

async def handle_typing_indicator(connection_id: str, data: Dict[str, Any], db: Session, websocket: WebSocket):
    """Handle typing indicator via WebSocket"""
    session_data = connection_sessions.get(connection_id)
    if not session_data:
        return
    
    # Broadcast typing indicator
    await broadcast_to_session(
        session_data["session_id"],
        "typing_indicator",
        data,
        exclude_user=data.get("user_id")
    )