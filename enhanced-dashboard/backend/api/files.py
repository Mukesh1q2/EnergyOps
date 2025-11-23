"""
File Processing API Endpoints
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
import os
import tempfile
from datetime import datetime
import aiofiles

from ...database import get_db
from ...auth.security import get_current_user
from ...models.file_processing import (
    FileUpload, FileProcessingJob, SchemaMapping, DataValidation,
    ColumnAnalysis, ProcessingResult, FileType, ProcessingStatus, DataQuality
)
from ...schemas.file_processing import (
    FileUploadResponse, FileUploadCreate, ProcessingJobResponse,
    SchemaMappingResponse, DataValidationResponse, ProcessingResultResponse
)
from ...schemas.common import PaginationParams
from ...services.file_processing_service import FileProcessingService
from ...utils.file_validator import FileValidator
from ...utils.schema_detector import SchemaDetector
from ...utils.data_analyzer import DataAnalyzer
from ...utils.ml_schema_mapper import MLSchemaMapper

router = APIRouter(prefix="/api/v1/files", tags=["file-processing"])
security = HTTPBearer()
file_validator = FileValidator()
schema_detector = SchemaDetector()
data_analyzer = DataAnalyzer()
ml_schema_mapper = MLSchemaMapper()

# File Upload
@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    auto_process: bool = Form(True),
    detect_schema: bool = Form(True),
    validate_data: bool = Form(True),
    create_visualizations: bool = Form(True),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Upload and process file"""
    
    # Validate file
    validation_result = await file_validator.validate_file(file)
    
    if not validation_result.is_valid:
        raise HTTPException(
            status_code=400, 
            detail=f"File validation failed: {validation_result.error_message}"
        )
    
    # Save file temporarily
    file_processing_service = FileProcessingService(db)
    
    try:
        # Save uploaded file
        file_upload = await file_processing_service.save_uploaded_file(
            file=file,
            user_id=current_user.id,
            organization_id=current_user.organization_id,
            auto_process=auto_process,
            detect_schema=detect_schema,
            validate_data=validate_data,
            create_visualizations=create_visualizations
        )
        
        # Start processing in background if requested
        if auto_process:
            background_tasks.add_task(
                file_processing_service.process_file_async,
                file_upload_id=file_upload.id
            )
        
        return file_upload
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@router.get("/", response_model=List[FileUploadResponse])
async def list_files(
    organization_id: Optional[str] = Query(None),
    file_type: Optional[FileType] = Query(None),
    status: Optional[ProcessingStatus] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List uploaded files"""
    file_processing_service = FileProcessingService(db)
    
    files, total = await file_processing_service.list_files(
        user_id=current_user.id,
        organization_id=organization_id or current_user.organization_id,
        file_type=file_type,
        status=status,
        date_from=date_from,
        date_to=date_to,
        pagination=pagination
    )
    
    return {
        "files": files,
        "total": total,
        "page": pagination.page,
        "size": pagination.size,
        "pages": (total + pagination.size - 1) // pagination.size
    }

@router.get("/{file_id}", response_model=FileUploadResponse)
async def get_file(
    file_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get file upload details"""
    file_processing_service = FileProcessingService(db)
    file_upload = await file_processing_service.get_file(file_id)
    
    if not file_upload:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check permissions
    if (file_upload.user_id != current_user.id and 
        file_upload.organization_id != current_user.organization_id):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    return file_upload

@router.delete("/{file_id}")
async def delete_file(
    file_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete uploaded file"""
    file_processing_service = FileProcessingService(db)
    file_upload = await file_processing_service.get_file(file_id)
    
    if not file_upload:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check permissions
    if file_upload.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the file owner can delete it")
    
    success = await file_processing_service.delete_file(file_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete file")
    
    return {"message": "File deleted successfully"}

@router.get("/{file_id}/download")
async def download_file(
    file_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Download uploaded file"""
    file_processing_service = FileProcessingService(db)
    file_upload = await file_processing_service.get_file(file_id)
    
    if not file_upload:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check permissions
    if (file_upload.user_id != current_user.id and 
        file_upload.organization_id != current_user.organization_id):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Generate download URL
    download_info = await file_processing_service.generate_download_url(file_id)
    
    return download_info

# File Processing Jobs
@router.get("/{file_id}/jobs", response_model=List[ProcessingJobResponse])
async def get_file_processing_jobs(
    file_id: str = Path(...),
    job_type: Optional[str] = Query(None),
    status: Optional[ProcessingStatus] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get processing jobs for file"""
    file_processing_service = FileProcessingService(db)
    file_upload = await file_processing_service.get_file(file_id)
    
    if not file_upload:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check permissions
    if (file_upload.user_id != current_user.id and 
        file_upload.organization_id != current_user.organization_id):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    jobs = await file_processing_service.get_processing_jobs(
        file_id=file_id,
        job_type=job_type,
        status=status
    )
    
    return jobs

@router.post("/{file_id}/process")
async def start_file_processing(
    file_id: str,
    job_types: List[str] = Form(...),  # ['schema_detection', 'validation', 'visualization']
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Start file processing jobs"""
    file_processing_service = FileProcessingService(db)
    file_upload = await file_processing_service.get_file(file_id)
    
    if not file_upload:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check permissions
    if (file_upload.user_id != current_user.id and 
        file_upload.organization_id != current_user.organization_id):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Start processing jobs
    jobs = await file_processing_service.start_processing_jobs(
        file_id=file_id,
        job_types=job_types,
        user_id=current_user.id
    )
    
    # Add background tasks for async processing
    for job in jobs:
        background_tasks.add_task(
            file_processing_service.process_job_async,
            job_id=job.id
        )
    
    return {
        "message": "Processing jobs started",
        "jobs": jobs,
        "job_count": len(jobs)
    }

@router.get("/jobs/{job_id}", response_model=ProcessingJobResponse)
async def get_processing_job(
    job_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get processing job details"""
    file_processing_service = FileProcessingService(db)
    job = await file_processing_service.get_processing_job(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Processing job not found")
    
    # Check permissions
    file_upload = job.file_upload
    if (file_upload.user_id != current_user.id and 
        file_upload.organization_id != current_user.organization_id):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    return job

@router.post("/jobs/{job_id}/cancel")
async def cancel_processing_job(
    job_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Cancel processing job"""
    file_processing_service = FileProcessingService(db)
    job = await file_processing_service.get_processing_job(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Processing job not found")
    
    # Check permissions
    file_upload = job.file_upload
    if file_upload.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the file owner can cancel jobs")
    
    success = await file_processing_service.cancel_processing_job(job_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to cancel job")
    
    return {"message": "Processing job cancelled successfully"}

# Schema Detection and Mapping
@router.get("/{file_id}/schema", response_model=SchemaMappingResponse)
async def get_detected_schema(
    file_id: str,
    confidence_threshold: float = Query(0.7, ge=0.0, le=1.0),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get automatically detected schema"""
    file_processing_service = FileProcessingService(db)
    file_upload = await file_processing_service.get_file(file_id)
    
    if not file_upload:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check permissions
    if (file_upload.user_id != current_user.id and 
        file_upload.organization_id != current_user.organization_id):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Get or detect schema
    schema = await file_processing_service.get_or_detect_schema(
        file_id=file_id,
        confidence_threshold=confidence_threshold
    )
    
    return schema

@router.post("/{file_id}/schema/map")
async def map_schema(
    file_id: str,
    mapping_data: Dict[str, Any],
    mapping_name: Optional[str] = Form(None),
    confidence_threshold: float = Form(0.7),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create or update schema mapping"""
    file_processing_service = FileProcessingService(db)
    file_upload = await file_processing_service.get_file(file_id)
    
    if not file_upload:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check permissions
    if (file_upload.user_id != current_user.id and 
        file_upload.organization_id != current_user.organization_id):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Create schema mapping
    schema_mapping = await file_processing_service.create_schema_mapping(
        file_id=file_id,
        mapping_data=mapping_data,
        mapping_name=mapping_name or f"Mapping for {file_upload.original_filename}",
        confidence_threshold=confidence_threshold,
        applied_by=current_user.id
    )
    
    return {
        "message": "Schema mapping created successfully",
        "schema_mapping": schema_mapping
    }

@router.put("/schema/{schema_id}")
async def update_schema_mapping(
    schema_id: str,
    mapping_data: Dict[str, Any],
    mapping_name: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update existing schema mapping"""
    file_processing_service = FileProcessingService(db)
    schema_mapping = await file_processing_service.get_schema_mapping(schema_id)
    
    if not schema_mapping:
        raise HTTPException(status_code=404, detail="Schema mapping not found")
    
    # Check permissions
    file_upload = schema_mapping.file_upload
    if (file_upload.user_id != current_user.id and 
        file_upload.organization_id != current_user.organization_id):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    updated_mapping = await file_processing_service.update_schema_mapping(
        schema_id=schema_id,
        mapping_data=mapping_data,
        mapping_name=mapping_name
    )
    
    return {
        "message": "Schema mapping updated successfully",
        "schema_mapping": updated_mapping
    }

@router.delete("/schema/{schema_id}")
async def delete_schema_mapping(
    schema_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete schema mapping"""
    file_processing_service = FileProcessingService(db)
    schema_mapping = await file_processing_service.get_schema_mapping(schema_id)
    
    if not schema_mapping:
        raise HTTPException(status_code=404, detail="Schema mapping not found")
    
    # Check permissions
    file_upload = schema_mapping.file_upload
    if (file_upload.user_id != current_user.id and 
        file_upload.organization_id != current_user.organization_id):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    success = await file_processing_service.delete_schema_mapping(schema_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete schema mapping")
    
    return {"message": "Schema mapping deleted successfully"}

# Data Validation
@router.get("/{file_id}/validation", response_model=DataValidationResponse)
async def get_data_validation(
    file_id: str,
    validation_type: Optional[str] = Query("comprehensive"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get data validation results"""
    file_processing_service = FileProcessingService(db)
    file_upload = await file_processing_service.get_file(file_id)
    
    if not file_upload:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check permissions
    if (file_upload.user_id != current_user.id and 
        file_upload.organization_id != current_user.organization_id):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Get validation results
    validation = await file_processing_service.get_data_validation(
        file_id=file_id,
        validation_type=validation_type
    )
    
    return validation

@router.post("/{file_id}/validate")
async def start_data_validation(
    file_id: str,
    validation_types: List[str] = Form(["schema", "data_quality", "business_rules"]),
    threshold_config: Optional[Dict[str, Any]] = Form(None),
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Start data validation"""
    file_processing_service = FileProcessingService(db)
    file_upload = await file_processing_service.get_file(file_id)
    
    if not file_upload:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check permissions
    if (file_upload.user_id != current_user.id and 
        file_upload.organization_id != current_user.organization_id):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Start validation
    validation_job = await file_processing_service.start_data_validation(
        file_id=file_id,
        validation_types=validation_types,
        threshold_config=threshold_config or {}
    )
    
    # Add background task
    background_tasks.add_task(
        file_processing_service.run_data_validation_async,
        validation_id=validation_job.id
    )
    
    return {
        "message": "Data validation started",
        "validation": validation_job
    }

@router.get("/validations/{validation_id}/column/{column_name}")
async def get_column_analysis(
    validation_id: str,
    column_name: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get detailed column analysis"""
    file_processing_service = FileProcessingService(db)
    validation = await file_processing_service.get_data_validation_by_id(validation_id)
    
    if not validation:
        raise HTTPException(status_code=404, detail="Validation not found")
    
    # Check permissions
    file_upload = validation.file_upload
    if (file_upload.user_id != current_user.id and 
        file_upload.organization_id != current_user.organization_id):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Get column analysis
    column_analysis = await file_processing_service.get_column_analysis(
        validation_id=validation_id,
        column_name=column_name
    )
    
    if not column_analysis:
        raise HTTPException(status_code=404, detail="Column analysis not found")
    
    return column_analysis

# File Preview and Sample Data
@router.get("/{file_id}/preview")
async def preview_file_data(
    file_id: str,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    include_metadata: bool = Query(True),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Preview file data"""
    file_processing_service = FileProcessingService(db)
    file_upload = await file_processing_service.get_file(file_id)
    
    if not file_upload:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check permissions
    if (file_upload.user_id != current_user.id and 
        file_upload.organization_id != current_user.organization_id):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Get preview data
    preview = await file_processing_service.get_file_preview(
        file_id=file_id,
        limit=limit,
        offset=offset,
        include_metadata=include_metadata
    )
    
    return preview

@router.get("/{file_id}/sample-data")
async def get_sample_data(
    file_id: str,
    sample_size: int = Query(1000, ge=1, le=10000),
    include_nulls: bool = Query(True),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get representative sample data"""
    file_processing_service = FileProcessingService(db)
    file_upload = await file_processing_service.get_file(file_id)
    
    if not file_upload:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check permissions
    if (file_upload.user_id != current_user.id and 
        file_upload.organization_id != current_user.organization_id):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Get sample data
    sample = await file_processing_service.get_sample_data(
        file_id=file_id,
        sample_size=sample_size,
        include_nulls=include_nulls
    )
    
    return sample

# Processing Results and Export
@router.get("/{file_id}/results", response_model=List[ProcessingResultResponse])
async def get_processing_results(
    file_id: str,
    result_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get processing results"""
    file_processing_service = FileProcessingService(db)
    file_upload = await file_processing_service.get_file(file_id)
    
    if not file_upload:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check permissions
    if (file_upload.user_id != current_user.id and 
        file_upload.organization_id != current_user.organization_id):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Get results
    results = await file_processing_service.get_processing_results(
        file_id=file_id,
        result_type=result_type
    )
    
    return results

@router.post("/{file_id}/export")
async def export_processed_data(
    file_id: str,
    format: str = Form("csv"),  # csv, json, excel, parquet
    include_processed: bool = Form(True),
    include_raw: bool = Form(False),
    compression: Optional[str] = Form(None),  # zip, gzip
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Export processed data"""
    file_processing_service = FileProcessingService(db)
    file_upload = await file_processing_service.get_file(file_id)
    
    if not file_upload:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check permissions
    if (file_upload.user_id != current_user.id and 
        file_upload.organization_id != current_user.organization_id):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Export data
    export_result = await file_processing_service.export_data(
        file_id=file_id,
        format=format,
        include_processed=include_processed,
        include_raw=include_raw,
        compression=compression
    )
    
    return {
        "message": "Data export completed",
        "export_info": export_result
    }

# ML-powered Features
@router.get("/{file_id}/ml/suggestions")
async def get_ml_suggestions(
    file_id: str,
    suggestion_types: List[str] = Query(["schema", "cleaning", "visualization"]),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get ML-powered suggestions for file processing"""
    file_processing_service = FileProcessingService(db)
    file_upload = await file_processing_service.get_file(file_id)
    
    if not file_upload:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check permissions
    if (file_upload.user_id != current_user.id and 
        file_upload.organization_id != current_user.organization_id):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Get ML suggestions
    suggestions = await file_processing_service.get_ml_suggestions(
        file_id=file_id,
        suggestion_types=suggestion_types
    )
    
    return suggestions

@router.post("/{file_id}/ml/apply-suggestion")
async def apply_ml_suggestion(
    file_id: str,
    suggestion_id: str,
    apply_to: str = Form("current"),  # current, all_similar
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Apply ML suggestion to data"""
    file_processing_service = FileProcessingService(db)
    file_upload = await file_processing_service.get_file(file_id)
    
    if not file_upload:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check permissions
    if (file_upload.user_id != current_user.id and 
        file_upload.organization_id != current_user.organization_id):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Apply suggestion
    result = await file_processing_service.apply_ml_suggestion(
        file_id=file_id,
        suggestion_id=suggestion_id,
        apply_to=apply_to
    )
    
    return {
        "message": "ML suggestion applied successfully",
        "result": result
    }

# File Templates and Batch Processing
@router.get("/templates", response_model=List[Dict])
async def list_file_processing_templates(
    file_type: Optional[FileType] = Query(None),
    is_public: bool = Query(True),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List available file processing templates"""
    file_processing_service = FileProcessingService(db)
    templates = await file_processing_service.list_templates(
        file_type=file_type,
        is_public=is_public
    )
    
    return templates

@router.post("/batch-process")
async def batch_process_files(
    file_ids: List[str],
    job_types: List[str],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Process multiple files in batch"""
    file_processing_service = FileProcessingService(db)
    
    # Check permissions for all files
    files = await file_processing_service.get_files_by_ids(file_ids)
    
    for file_upload in files:
        if (file_upload.user_id != current_user.id and 
            file_upload.organization_id != current_user.organization_id):
            raise HTTPException(
                status_code=403, 
                detail=f"Insufficient permissions for file {file_upload.id}"
            )
    
    # Start batch processing
    jobs = await file_processing_service.start_batch_processing(
        file_ids=file_ids,
        job_types=job_types,
        user_id=current_user.id
    )
    
    # Add background tasks
    for job in jobs:
        background_tasks.add_task(
            file_processing_service.process_job_async,
            job_id=job.id
        )
    
    return {
        "message": "Batch processing started",
        "total_jobs": len(jobs),
        "jobs": jobs
    }