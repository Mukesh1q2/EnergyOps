"""
File Processing Models
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

class FileType(PyEnum):
    CSV = "csv"
    EXCEL = "excel"
    JSON = "json"
    PDF = "pdf"
    IMAGE = "image"
    TEXT = "text"
    XML = "xml"
    YAML = "yaml"

class ProcessingStatus(PyEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class DataQuality(PyEnum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    CRITICAL = "critical"

class FileUpload(Base):
    __tablename__ = "file_uploads"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=True)
    
    # File identification
    original_filename = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)  # stored filename
    file_type = Column(Enum(FileType), nullable=False)
    mime_type = Column(String(100), nullable=False)
    
    # File details
    file_size = Column(Integer, nullable=False)  # bytes
    file_path = Column(String(500), nullable=False)  # storage path
    file_hash = Column(String(64), nullable=False)  # SHA256 hash
    
    # Processing configuration
    auto_process = Column(Boolean, default=True)
    detect_schema = Column(Boolean, default=True)
    validate_data = Column(Boolean, default=True)
    create_visualizations = Column(Boolean, default=True)
    
    # Security
    scan_virus = Column(Boolean, default=True)
    quarantine_policy = Column(String(20), default="safe")
    access_level = Column(String(20), default="private")
    
    # Metadata
    upload_ip = Column(String(45))  # IPv6 support
    user_agent = Column(Text)
    tags = Column(JSON, default=[])
    
    # State
    processing_status = Column(Enum(ProcessingStatus), default=ProcessingStatus.PENDING)
    error_message = Column(Text)
    processing_started = Column(DateTime(timezone=True))
    processing_completed = Column(DateTime(timezone=True))
    
    # Results
    row_count = Column(Integer, default=0)
    column_count = Column(Integer, default=0)
    detected_schema = Column(JSON, default={})
    data_quality_score = Column(Float, default=0.0)
    
    # Usage tracking
    download_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    last_accessed = Column(DateTime(timezone=True))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="file_uploads")
    organization = relationship("Organization", back_populates="file_uploads")
    processing_jobs = relationship("FileProcessingJob", back_populates="file_upload", cascade="all, delete-orphan")
    schema_mappings = relationship("SchemaMapping", back_populates="file_upload", cascade="all, delete-orphan")
    validations = relationship("DataValidation", back_populates="file_upload", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_file_upload_user', 'user_id'),
        Index('idx_file_upload_org', 'organization_id'),
        Index('idx_file_upload_type', 'file_type'),
        Index('idx_file_upload_status', 'processing_status'),
        Index('idx_file_upload_hash', 'file_hash'),
        Index('idx_file_upload_access', 'last_accessed'),
    )

class FileProcessingJob(Base):
    __tablename__ = "file_processing_jobs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    file_upload_id = Column(String(36), ForeignKey("file_uploads.id"), nullable=False)
    
    # Job identification
    job_type = Column(String(100), nullable=False)  # 'schema_detection', 'validation', 'visualization'
    priority = Column(Integer, default=5)  # 1=highest, 10=lowest
    queue_name = Column(String(50), default="default")
    
    # Job configuration
    job_config = Column(JSON, default={})
    processing_options = Column(JSON, default={})
    
    # Job state
    status = Column(Enum(ProcessingStatus), default=ProcessingStatus.PENDING)
    progress = Column(Float, default=0.0)  # 0.0 to 1.0
    current_step = Column(String(100))
    steps_total = Column(Integer, default=1)
    
    # Execution details
    worker_id = Column(String(100))
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    duration_seconds = Column(Integer)
    
    # Results
    result_data = Column(JSON, default={})
    error_details = Column(Text)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    file_upload = relationship("FileUpload", back_populates="processing_jobs")
    results = relationship("ProcessingResult", back_populates="job", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_job_file', 'file_upload_id'),
        Index('idx_job_type', 'job_type'),
        Index('idx_job_status', 'status'),
        Index('idx_job_priority', 'priority'),
        Index('idx_job_worker', 'worker_id'),
    )

class SchemaMapping(Base):
    __tablename__ = "schema_mappings"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    file_upload_id = Column(String(36), ForeignKey("file_uploads.id"), nullable=False)
    
    # Mapping identification
    mapping_name = Column(String(255), nullable=False)
    mapping_type = Column(String(50), nullable=False)  # 'auto', 'manual', 'template'
    confidence_score = Column(Float, default=0.0)
    
    # Original schema (from file)
    original_columns = Column(JSON, nullable=False)  # [{name, type, sample_values}]
    
    # Mapped schema (to standardized format)
    mapped_columns = Column(JSON, nullable=False)  # [{name, data_type, constraints, transformers}]
    
    # ML/AI suggestions
    ai_suggestions = Column(JSON, default=[])
    ai_confidence = Column(JSON, default={})  # confidence per column mapping
    
    # Validation rules
    validation_rules = Column(JSON, default=[])
    custom_transformers = Column(JSON, default=[])
    
    # Mapping metadata
    applied_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    is_approved = Column(Boolean, default=False)
    approval_notes = Column(Text)
    
    # Usage statistics
    usage_count = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    last_used = Column(DateTime(timezone=True))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    file_upload = relationship("FileUpload", back_populates="schema_mappings")
    creator = relationship("User", back_populates="schema_mappings")
    
    __table_args__ = (
        Index('idx_mapping_file', 'file_upload_id'),
        Index('idx_mapping_type', 'mapping_type'),
        Index('idx_mapping_confidence', 'confidence_score'),
        Index('idx_mapping_applied', 'is_approved'),
    )

class DataValidation(Base):
    __tablename__ = "data_validations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    file_upload_id = Column(String(36), ForeignKey("file_uploads.id"), nullable=False)
    
    # Validation identification
    validation_name = Column(String(255), nullable=False)
    validation_type = Column(String(50), nullable=False)  # 'schema', 'data_quality', 'business_rules'
    
    # Validation rules
    rules = Column(JSON, nullable=False)  # validation rule definitions
    threshold_config = Column(JSON, default={})  # thresholds for warnings/errors
    
    # Results
    overall_score = Column(Float, default=0.0)  # 0.0 to 1.0
    quality_level = Column(Enum(DataQuality), default=DataQuality.FAIR)
    
    # Detailed results
    column_validations = Column(JSON, default=[])  # per-column validation results
    row_validations = Column(JSON, default=[])    # per-row validation results
    summary_stats = Column(JSON, default={})      # descriptive statistics
    
    # Issues found
    errors = Column(JSON, default=[])   # critical issues
    warnings = Column(JSON, default=[]) # warnings
    suggestions = Column(JSON, default=[]) # improvement suggestions
    
    # Performance
    validation_time_ms = Column(Integer)
    rows_processed = Column(Integer, default=0)
    columns_processed = Column(Integer, default=0)
    
    # Recommendations
    recommended_actions = Column(JSON, default=[])
    data_cleaning_steps = Column(JSON, default=[])
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    file_upload = relationship("FileUpload", back_populates="validations")
    column_analyses = relationship("ColumnAnalysis", back_populates="validation", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_validation_file', 'file_upload_id'),
        Index('idx_validation_type', 'validation_type'),
        Index('idx_validation_quality', 'quality_level'),
        Index('idx_validation_score', 'overall_score'),
    )

class ColumnAnalysis(Base):
    __tablename__ = "column_analyses"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    validation_id = Column(String(36), ForeignKey("data_validations.id"), nullable=False)
    
    # Column identification
    column_name = Column(String(255), nullable=False)
    column_position = Column(Integer, nullable=False)
    
    # Detected properties
    data_type = Column(String(50), nullable=False)
    inferred_type = Column(String(50))
    type_confidence = Column(Float, default=0.0)
    
    # Statistical analysis
    total_values = Column(Integer, default=0)
    unique_values = Column(Integer, default=0)
    null_values = Column(Integer, default=0)
    empty_values = Column(Integer, default=0)
    
    # Data quality metrics
    completeness = Column(Float, default=0.0)  # percentage of non-null values
    uniqueness = Column(Float, default=0.0)    # percentage of unique values
    consistency = Column(Float, default=0.0)   # format consistency
    
    # Value analysis
    sample_values = Column(JSON, default=[])
    min_value = Column(Text)
    max_value = Column(Text)
    most_frequent_values = Column(JSON, default=[])
    
    # Pattern detection
    detected_patterns = Column(JSON, default=[])  # regex patterns, formats
    pattern_confidence = Column(Float, default=0.0)
    
    # Data type specifics
    numeric_stats = Column(JSON, default={})  # min, max, mean, std for numeric
    text_stats = Column(JSON, default={})    # length stats for text
    date_stats = Column(JSON, default={})    # date range, format analysis
    
    # Issues and recommendations
    quality_issues = Column(JSON, default=[])
    recommendations = Column(JSON, default=[])
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    validation = relationship("DataValidation", back_populates="column_analyses")
    
    __table_args__ = (
        Index('idx_column_validation', 'validation_id'),
        Index('idx_column_name', 'column_name'),
        Index('idx_column_type', 'data_type'),
        Index('idx_column_completeness', 'completeness'),
    )

class ProcessingResult(Base):
    __tablename__ = "processing_results"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String(36), ForeignKey("file_processing_jobs.id"), nullable=False)
    
    # Result identification
    result_type = Column(String(50), nullable=False)
    result_name = Column(String(255), nullable=False)
    
    # Result data
    raw_result = Column(JSON, nullable=False)
    processed_data = Column(JSON, default={})
    
    # Visualization data (for chart generation)
    chart_data = Column(JSON, default={})
    visualization_config = Column(JSON, default={})
    
    # Export formats
    exported_formats = Column(JSON, default=[])  # csv, json, excel, etc.
    export_paths = Column(JSON, default={})      # paths to exported files
    
    # Processing metadata
    processing_time_ms = Column(Integer)
    memory_usage_mb = Column(Float)
    cpu_usage_percent = Column(Float)
    
    # Quality metrics
    data_quality_score = Column(Float, default=0.0)
    processing_success_rate = Column(Float, default=0.0)
    
    # Usage tracking
    download_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    last_accessed = Column(DateTime(timezone=True))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))
    
    # Relationships
    job = relationship("FileProcessingJob", back_populates="results")
    
    __table_args__ = (
        Index('idx_result_job', 'job_id'),
        Index('idx_result_type', 'result_type'),
        Index('idx_result_quality', 'data_quality_score'),
        Index('idx_result_expires', 'expires_at'),
    )

# File processing configuration and templates
file_processing_templates = Table(
    'file_processing_templates',
    Base.metadata,
    Column('id', String(36), primary_key=True, default=lambda: str(uuid.uuid4())),
    Column('name', String(255), nullable=False),
    Column('description', Text),
    Column('file_type', Enum(FileType), nullable=False),
    Column('template_config', JSON, nullable=False),  # processing configuration
    Column('schema_template', JSON, default={}),     # default schema mapping
    Column('validation_rules', JSON, default=[]),    # default validation rules
    Column('is_public', Boolean, default=False),
    Column('usage_count', Integer, default=0),
    Column('created_by', String(36), ForeignKey('users.id')),
    Column('created_at', DateTime(timezone=True), server_default=func.now()),
    Index('idx_template_type', 'file_type'),
    Index('idx_template_public', 'is_public')
)

# OCR processing results for PDF files
ocr_results = Table(
    'ocr_results',
    Base.metadata,
    Column('id', String(36), primary_key=True, default=lambda: str(uuid.uuid4())),
    Column('file_upload_id', String(36), ForeignKey('file_uploads.id'), nullable=False),
    Column('page_number', Integer, nullable=False),
    Column('extracted_text', Text, nullable=False),
    Column('confidence_score', Float, default=0.0),
    Column('bounding_boxes', JSON, default=[]),  # text position data
    Column('language_detected', String(10)),
    Column('processing_time_ms', Integer),
    Column('created_at', DateTime(timezone=True), server_default=func.now()),
    Index('idx_ocr_file', 'file_upload_id'),
    Index('idx_ocr_page', 'file_upload_id', 'page_number')
)