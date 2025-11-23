"""
Collaboration Models
Phase 3: Enhanced Dashboard & Enterprise Features
"""

from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Boolean, JSON, 
    ForeignKey, Enum, Float, Table, UniqueConstraint, Index
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum
import uuid

Base = declarative_base()

class SessionStatus(PyEnum):
    ACTIVE = "active"
    IDLE = "idle"
    ENDED = "ended"

class PresenceStatus(PyEnum):
    ONLINE = "online"
    AWAY = "away"
    BUSY = "busy"
    OFFLINE = "offline"

class CommentStatus(PyEnum):
    OPEN = "open"
    RESOLVED = "resolved"
    ARCHIVED = "archived"

class ChangeType(PyEnum):
    WIDGET_ADDED = "widget_added"
    WIDGET_REMOVED = "widget_removed"
    WIDGET_UPDATED = "widget_updated"
    LAYOUT_CHANGED = "layout_changed"
    SETTINGS_CHANGED = "settings_changed"
    PERMISSION_CHANGED = "permission_changed"

class CollaborationSession(Base):
    __tablename__ = "collaboration_sessions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dashboard_id = Column(String(36), ForeignKey("dashboards.id"), nullable=False)
    
    # Session identification
    session_name = Column(String(255), nullable=False)
    session_type = Column(String(50), default="collaboration")  # 'collaboration', 'presentation', 'editing'
    
    # Session configuration
    max_participants = Column(Integer, default=50)
    require_approval = Column(Boolean, default=False)
    allow_anonymous = Column(Boolean, default=False)
    recording_enabled = Column(Boolean, default=False)
    
    # Access control
    invited_users = Column(JSON, default=[])     # list of user IDs
    allowed_domains = Column(JSON, default=[])   # email domains
    password_protected = Column(Boolean, default=False)
    session_password = Column(String(255))
    
    # Session state
    status = Column(Enum(SessionStatus), default=SessionStatus.ACTIVE)
    current_mode = Column(String(50), default="view")  # 'view', 'edit', 'present'
    
    # Activity tracking
    participant_count = Column(Integer, default=0)
    total_duration_minutes = Column(Integer, default=0)
    interaction_count = Column(Integer, default=0)
    
    # Performance metrics
    avg_response_time_ms = Column(Integer, default=0)
    sync_errors = Column(Integer, default=0)
    conflict_count = Column(Integer, default=0)
    
    # Recording and playback
    recording_path = Column(String(500))
    playback_data = Column(JSON, default=[])
    
    # Metadata
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True))
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    dashboard = relationship("Dashboard", back_populates="collaboration_sessions")
    creator = relationship("User", foreign_keys=[created_by])
    cursors = relationship("LiveCursor", back_populates="session", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="session", cascade="all, delete-orphan")
    changes = relationship("DashboardChange", back_populates="session", cascade="all, delete-orphan")
    presences = relationship("UserPresence", back_populates="session", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_session_dashboard', 'dashboard_id'),
        Index('idx_session_status', 'status'),
        Index('idx_session_type', 'session_type'),
        Index('idx_session_creator', 'created_by'),
        Index('idx_session_activity', 'last_activity'),
    )

class LiveCursor(Base):
    __tablename__ = "live_cursors"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("collaboration_sessions.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Cursor position
    widget_id = Column(String(36), ForeignKey("dashboard_widgets.id"), nullable=True)  # optional
    x = Column(Float, nullable=False)
    y = Column(Float, nullable=False)
    z_index = Column(Integer, default=0)
    
    # Cursor appearance
    color = Column(String(7), default="#3B82F6")  # hex color
    cursor_type = Column(String(20), default="default")  # 'default', 'pointer', 'crosshair', etc.
    label = Column(String(100))  # optional label
    
    # Cursor state
    is_visible = Column(Boolean, default=True)
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    movement_count = Column(Integer, default=0)
    
    # Performance
    update_frequency_hz = Column(Integer, default=10)  # updates per second
    lag_compensation = Column(Float, default=0.0)  # milliseconds
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))
    
    # Relationships
    session = relationship("CollaborationSession", back_populates="cursors")
    user = relationship("User", back_populates="live_cursors")
    widget = relationship("DashboardWidget")
    
    __table_args__ = (
        Index('idx_cursor_session', 'session_id'),
        Index('idx_cursor_user', 'user_id'),
        Index('idx_cursor_widget', 'widget_id'),
        Index('idx_cursor_activity', 'last_activity'),
        UniqueConstraint('session_id', 'user_id', name='unique_user_session_cursor'),
    )

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("collaboration_sessions.id"), nullable=False)
    widget_id = Column(String(36), ForeignKey("dashboard_widgets.id"), nullable=True)
    
    # Comment identification
    parent_comment_id = Column(String(36), ForeignKey("comments.id"), nullable=True)  # for replies
    comment_type = Column(String(50), default="general")  # 'general', 'suggestion', 'question', 'approval'
    
    # Comment content
    content = Column(Text, nullable=False)
    formatted_content = Column(Text)  # HTML/Markdown rendered content
    attachments = Column(JSON, default=[])  # file attachments
    
    # Position and context (for anchored comments)
    anchor_x = Column(Float)
    anchor_y = Column(Float)
    anchor_widget_state = Column(JSON, default={})  # snapshot of widget at comment time
    
    # Comment state
    status = Column(Enum(CommentStatus), default=CommentStatus.OPEN)
    priority = Column(String(20), default="normal")  # 'low', 'normal', 'high', 'urgent'
    
    # Engagement
    upvotes = Column(Integer, default=0)
    downvotes = Column(Integer, default=0)
    is_edited = Column(Boolean, default=False)
    edit_count = Column(Integer, default=0)
    
    # Resolution
    resolved_by = Column(String(36), ForeignKey("users.id"))
    resolved_at = Column(DateTime(timezone=True))
    resolution_notes = Column(Text)
    
    # Metadata
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    session = relationship("CollaborationSession", back_populates="comments")
    widget = relationship("DashboardWidget", back_populates="comments")
    creator = relationship("User", foreign_keys=[created_by], back_populates="comments")
    parent = relationship("Comment", remote_side=[id], back_populates="replies")
    replies = relationship("Comment", back_populates="parent", cascade="all, delete-orphan")
    mentions = relationship("Mention", back_populates="comment", cascade="all, delete-orphan")
    votes = relationship("CommentVote", back_populates="comment", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_comment_session', 'session_id'),
        Index('idx_comment_widget', 'widget_id'),
        Index('idx_comment_parent', 'parent_comment_id'),
        Index('idx_comment_creator', 'created_by'),
        Index('idx_comment_status', 'status'),
        Index('idx_comment_activity', 'last_activity'),
    )

class Mention(Base):
    __tablename__ = "mentions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    comment_id = Column(String(36), ForeignKey("comments.id"), nullable=False)
    mentioned_user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Mention context
    mention_text = Column(String(255), nullable=False)  # the @username text
    position_in_comment = Column(Integer, nullable=False)  # character position
    
    # Notification state
    is_notified = Column(Boolean, default=False)
    notification_sent_at = Column(DateTime(timezone=True))
    
    # Engagement
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    comment = relationship("Comment", back_populates="mentions")
    mentioned_user = relationship("User", back_populates="mentions")
    
    __table_args__ = (
        Index('idx_mention_comment', 'comment_id'),
        Index('idx_mention_user', 'mentioned_user_id'),
        Index('idx_mention_read', 'is_read'),
    )

class DashboardChange(Base):
    __tablename__ = "dashboard_changes"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("collaboration_sessions.id"), nullable=False)
    dashboard_id = Column(String(36), ForeignKey("dashboards.id"), nullable=False)
    
    # Change identification
    change_type = Column(Enum(ChangeType), nullable=False)
    change_description = Column(String(255), nullable=False)
    
    # Change details
    target_type = Column(String(50))  # 'dashboard', 'widget', 'setting'
    target_id = Column(String(36))    # ID of the changed item
    
    # Change data
    old_value = Column(JSON)
    new_value = Column(JSON)
    change_metadata = Column(JSON, default={})
    
    # Change context
    context_data = Column(JSON, default={})  # additional context
    user_agent = Column(Text)
    ip_address = Column(String(45))
    
    # Conflict resolution
    conflict_id = Column(String(36))  # for tracking concurrent changes
    resolution_strategy = Column(String(50))  # 'merge', 'override', 'reject'
    resolved_by = Column(String(36), ForeignKey("users.id"))
    resolved_at = Column(DateTime(timezone=True))
    
    # Change impact
    impact_score = Column(Float, default=0.0)  # 0.0 to 1.0
    rollback_available = Column(Boolean, default=True)
    
    # Metadata
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    session = relationship("CollaborationSession", back_populates="changes")
    dashboard = relationship("Dashboard", back_populates="changes")
    author = relationship("User", foreign_keys=[created_by])
    resolver = relationship("User", foreign_keys=[resolved_by])
    
    __table_args__ = (
        Index('idx_change_session', 'session_id'),
        Index('idx_change_dashboard', 'dashboard_id'),
        Index('idx_change_type', 'change_type'),
        Index('idx_change_creator', 'created_by'),
        Index('idx_change_time', 'created_at'),
        Index('idx_change_target', 'target_type', 'target_id'),
    )

class UserPresence(Base):
    __tablename__ = "user_presence"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("collaboration_sessions.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Presence state
    status = Column(Enum(PresenceStatus), default=PresenceStatus.ONLINE)
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    
    # Activity tracking
    action_type = Column(String(50))  # 'viewing', 'editing', 'commenting', 'presenting'
    action_target = Column(String(36))  # widget_id or dashboard_id
    
    # User device info
    device_type = Column(String(50))  # 'desktop', 'mobile', 'tablet'
    browser_info = Column(String(200))
    screen_resolution = Column(String(20))
    
    # Interaction metrics
    cursor_movements = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    scroll_events = Column(Integer, default=0)
    keypresses = Column(Integer, default=0)
    
    # Performance metrics
    latency_ms = Column(Integer, default=0)
    packet_loss = Column(Float, default=0.0)
    connection_quality = Column(String(20), default="good")  # 'poor', 'fair', 'good', 'excellent'
    
    # Session participation
    join_time = Column(DateTime(timezone=True), server_default=func.now())
    total_active_time = Column(Integer, default=0)  # seconds
    idle_time = Column(Integer, default=0)  # seconds
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    session = relationship("CollaborationSession", back_populates="presences")
    user = relationship("User", back_populates="user_presence")
    
    __table_args__ = (
        Index('idx_presence_session', 'session_id'),
        Index('idx_presence_user', 'user_id'),
        Index('idx_presence_status', 'status'),
        Index('idx_presence_activity', 'last_seen'),
        UniqueConstraint('session_id', 'user_id', name='unique_user_session_presence'),
    )

# Additional tables for enhanced collaboration features
comment_votes = Table(
    'comment_votes',
    Base.metadata,
    Column('id', String(36), primary_key=True, default=lambda: str(uuid.uuid4())),
    Column('comment_id', String(36), ForeignKey('comments.id'), nullable=False),
    Column('user_id', String(36), ForeignKey('users.id'), nullable=False),
    Column('vote_type', String(10), nullable=False),  # 'upvote', 'downvote'
    Column('created_at', DateTime(timezone=True), server_default=func.now()),
    Index('idx_vote_comment', 'comment_id'),
    Index('idx_vote_user', 'user_id'),
    UniqueConstraint('comment_id', 'user_id', name='unique_user_comment_vote')
)

collaboration_activity_log = Table(
    'collaboration_activity_log',
    Base.metadata,
    Column('id', String(36), primary_key=True, default=lambda: str(uuid.uuid4())),
    Column('session_id', String(36), ForeignKey('collaboration_sessions.id'), nullable=False),
    Column('user_id', String(36), ForeignKey('users.id'), nullable=False),
    Column('activity_type', String(50), nullable=False),
    Column('activity_data', JSON, default={}),
    Column('timestamp', DateTime(timezone=True), server_default=func.now()),
    Index('idx_activity_session', 'session_id'),
    Index('idx_activity_user', 'user_id'),
    Index('idx_activity_type', 'activity_type'),
    Index('idx_activity_time', 'timestamp')
)

# Real-time configuration and settings
real_time_config = Table(
    'real_time_config',
    Base.metadata,
    Column('id', String(36), primary_key=True, default=lambda: str(uuid.uuid4())),
    Column('dashboard_id', String(36), ForeignKey('dashboards.id'), nullable=False),
    Column('config_type', String(50), nullable=False),  # 'sync', 'conflict_resolution', 'performance'
    Column('config_data', JSON, nullable=False),
    Column('is_active', Boolean, default=True),
    Column('created_by', String(36), ForeignKey('users.id')),
    Column('created_at', DateTime(timezone=True), server_default=func.now()),
    Column('updated_at', DateTime(timezone=True), onupdate=func.now()),
    Index('idx_realtime_dashboard', 'dashboard_id'),
    Index('idx_realtime_type', 'config_type')
)