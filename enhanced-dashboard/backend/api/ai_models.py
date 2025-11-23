"""
Advanced ML/AI API Endpoints
Phase 9: Multi-Architecture AI/ML API

Provides comprehensive endpoints for:
- Time Series Forecasting
- Churn Prediction
- Dynamic Pricing Optimization  
- Customer Segmentation Analytics
- LLM Integration with Multiple Providers
- Model Management and Auto-Failover
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import asyncio
import json
import uuid
from enum import Enum

from ..models.ai_models import (
    AIModel, UsageForecast, ChurnPrediction, PricingRecommendation,
    CustomerSegment, CustomerSegmentAssignment, LLMProviderConfig,
    ModelRun, ModelConfiguration, AIPrediction,
    ModelType, ModelStatus, ModelProvider, TaskType,
    PredictionStatus, UsageForecastType, ChurnRiskLevel,
    PricingStrategy, SegmentType, LLMProvider,
    get_default_ai_models, get_default_llm_providers
)
from ..schemas.ai_models import (
    AIModelCreate, AIModelResponse, AIModelUpdate,
    UsageForecastCreate, UsageForecastResponse,
    ChurnPredictionCreate, ChurnPredictionResponse,
    PricingRecommendationCreate, PricingRecommendationResponse,
    CustomerSegmentCreate, CustomerSegmentResponse,
    LLMProviderConfigCreate, LLMProviderConfigResponse,
    ModelRunCreate, ModelRunResponse, LLMInferenceRequest,
    UsageForecastType as ForecastType, ChurnRiskLevel as RiskLevel,
    PricingStrategy as PriceStrategy, SegmentType as SegType
)
from ..core.database import get_db
from ..core.dependencies import get_current_user, get_organization_id
from ..core.config import settings

router = APIRouter()

# =============================================================================
# AI MODEL MANAGEMENT ENDPOINTS
# =============================================================================

@router.get("/models", response_model=List[AIModelResponse])
async def list_ai_models(
    model_type: Optional[ModelType] = None,
    task_type: Optional[TaskType] = None,
    provider: Optional[ModelProvider] = None,
    status: Optional[ModelStatus] = None,
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """List available AI models with filtering"""
    query = db.query(AIModel)
    
    if model_type:
        query = query.filter(AIModel.model_type == model_type)
    if task_type:
        query = query.filter(AIModel.task_type == task_type)
    if provider:
        query = query.filter(AIModel.primary_provider == provider)
    if status:
        query = query.filter(AIModel.status == status)
    
    models = query.limit(limit).all()
    return [AIModelResponse.from_orm(model) for model in models]

@router.get("/models/{model_id}", response_model=AIModelResponse)
async def get_ai_model(
    model_id: int,
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Get detailed information about a specific AI model"""
    model = db.query(AIModel).filter(AIModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="AI model not found")
    return AIModelResponse.from_orm(model)

@router.post("/models", response_model=AIModelResponse)
async def create_ai_model(
    model_data: AIModelCreate,
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Create a new AI model configuration"""
    # Check if model with same name exists
    existing = db.query(AIModel).filter(AIModel.name == model_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Model with this name already exists")
    
    # Create new model
    db_model = AIModel(**model_data.dict())
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    
    return AIModelResponse.from_orm(db_model)

@router.put("/models/{model_id}", response_model=AIModelResponse)
async def update_ai_model(
    model_id: int,
    model_update: AIModelUpdate,
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Update an existing AI model"""
    model = db.query(AIModel).filter(AIModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="AI model not found")
    
    # Update fields
    for field, value in model_update.dict(exclude_unset=True).items():
        setattr(model, field, value)
    
    model.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(model)
    
    return AIModelResponse.from_orm(model)

@router.delete("/models/{model_id}")
async def delete_ai_model(
    model_id: int,
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Delete an AI model"""
    model = db.query(AIModel).filter(AIModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="AI model not found")
    
    # Check if model is in use
    usage_count = model.usage_count or 0
    if usage_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete model with {usage_count} usage records"
        )
    
    db.delete(model)
    db.commit()
    return {"message": "AI model deleted successfully"}

@router.get("/models/{model_id}/performance")
async def get_model_performance(
    model_id: int,
    days: int = Query(30, le=365),
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Get model performance metrics over time"""
    model = db.query(AIModel).filter(AIModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="AI model not found")
    
    # Get model runs for the period
    since_date = datetime.utcnow() - timedelta(days=days)
    runs = db.query(ModelRun).filter(
        ModelRun.model_id == model_id,
        ModelRun.created_at >= since_date
    ).all()
    
    # Calculate performance metrics
    total_runs = len(runs)
    successful_runs = len([r for r in runs if r.status == "completed"])
    avg_execution_time = sum([r.execution_time_ms for r in runs if r.execution_time_ms]) / total_runs if total_runs > 0 else 0
    total_cost = sum([r.cost_incurred for r in runs if r.cost_incurred]) or 0
    
    return {
        "model_id": model_id,
        "period_days": days,
        "total_runs": total_runs,
        "successful_runs": successful_runs,
        "success_rate": successful_runs / total_runs if total_runs > 0 else 0,
        "avg_execution_time_ms": avg_execution_time,
        "total_cost": total_cost,
        "avg_cost_per_run": total_cost / total_runs if total_runs > 0 else 0
    }

# =============================================================================
# USAGE FORECASTING ENDPOINTS
# =============================================================================

@router.get("/forecasting/usage", response_model=List[UsageForecastResponse])
async def list_usage_forecasts(
    forecast_type: Optional[ForecastType] = None,
    organization_id: Optional[str] = None,
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    user_organization_id: str = Depends(get_organization_id)
):
    """List usage forecasts"""
    query = db.query(UsageForecast)
    
    if forecast_type:
        query = query.filter(UsageForecast.forecast_type == forecast_type)
    
    # Filter by organization (user can see their org's forecasts)
    if organization_id:
        query = query.filter(UsageForecast.organization_id == organization_id)
    else:
        query = query.filter(UsageForecast.organization_id == user_organization_id)
    
    forecasts = query.order_by(UsageForecast.generated_at.desc()).limit(limit).all()
    return [UsageForecastResponse.from_orm(forecast) for forecast in forecasts]

@router.post("/forecasting/usage", response_model=UsageForecastResponse)
async def create_usage_forecast(
    forecast_data: UsageForecastCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Create a new usage forecast"""
    # Get available forecasting model
    model = db.query(AIModel).filter(
        AIModel.model_type == ModelType.TIME_SERIES_FORECASTING,
        AIModel.status == ModelStatus.READY
    ).first()
    
    if not model:
        raise HTTPException(status_code=404, detail="No ready forecasting model found")
    
    # Create forecast record
    forecast = UsageForecast(
        **forecast_data.dict(),
        model_id=model.id,
        organization_id=organization_id
    )
    db.add(forecast)
    db.commit()
    db.refresh(forecast)
    
    # Start background forecasting task
    background_tasks.add_task(run_forecast_generation, forecast.id, organization_id)
    
    return UsageForecastResponse.from_orm(forecast)

@router.get("/forecasting/usage/{forecast_id}", response_model=UsageForecastResponse)
async def get_usage_forecast(
    forecast_id: int,
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Get detailed usage forecast information"""
    forecast = db.query(UsageForecast).filter(
        UsageForecast.id == forecast_id,
        UsageForecast.organization_id == organization_id
    ).first()
    
    if not forecast:
        raise HTTPException(status_code=404, detail="Usage forecast not found")
    
    return UsageForecastResponse.from_orm(forecast)

@router.get("/forecasting/usage/{forecast_id}/data")
async def get_forecast_data(
    forecast_id: int,
    format: str = Query("json", regex="^(json|csv)$"),
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Get forecast data in requested format"""
    forecast = db.query(UsageForecast).filter(
        UsageForecast.id == forecast_id,
        UsageForecast.organization_id == organization_id
    ).first()
    
    if not forecast:
        raise HTTPException(status_code=404, detail="Usage forecast not found")
    
    if not forecast.forecast_data:
        raise HTTPException(status_code=404, detail="Forecast data not available")
    
    if format == "json":
        return forecast.forecast_data
    else:
        # Convert to CSV format
        import pandas as pd
        
        # Convert forecast data to DataFrame
        forecast_df = pd.DataFrame(forecast.forecast_data)
        
        # Create CSV response
        csv_data = forecast_df.to_csv(index=False)
        
        return StreamingResponse(
            iter([csv_data]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=forecast_{forecast_id}.csv"}
        )

@router.post("/forecasting/usage/{forecast_id}/regenerate")
async def regenerate_usage_forecast(
    forecast_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Regenerate an existing usage forecast"""
    forecast = db.query(UsageForecast).filter(
        UsageForecast.id == forecast_id,
        UsageForecast.organization_id == organization_id
    ).first()
    
    if not forecast:
        raise HTTPException(status_code=404, detail="Usage forecast not found")
    
    # Reset forecast data
    forecast.forecast_data = None
    forecast.upper_bound = None
    forecast.lower_bound = None
    forecast.accuracy_score = None
    forecast.generated_at = datetime.utcnow()
    
    db.commit()
    
    # Start background regeneration
    background_tasks.add_task(run_forecast_generation, forecast_id, organization_id)
    
    return {"message": "Forecast regeneration started"}

# =============================================================================
# CHURN PREDICTION ENDPOINTS
# =============================================================================

@router.get("/churn-prediction", response_model=List[ChurnPredictionResponse])
async def list_churn_predictions(
    risk_level: Optional[RiskLevel] = None,
    organization_id: Optional[str] = None,
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    user_organization_id: str = Depends(get_organization_id)
):
    """List churn predictions"""
    query = db.query(ChurnPrediction)
    
    if risk_level:
        query = query.filter(ChurnPrediction.risk_level == risk_level)
    
    if organization_id:
        query = query.filter(ChurnPrediction.organization_id == organization_id)
    else:
        query = query.filter(ChurnPrediction.organization_id == user_organization_id)
    
    predictions = query.order_by(ChurnPrediction.churn_probability.desc()).limit(limit).all()
    return [ChurnPredictionResponse.from_orm(prediction) for prediction in predictions]

@router.post("/churn-prediction", response_model=ChurnPredictionResponse)
async def create_churn_prediction(
    prediction_data: ChurnPredictionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id),
    user: Dict = Depends(get_current_user)
):
    """Create a new churn prediction for a customer"""
    # Get available churn prediction model
    model = db.query(AIModel).filter(
        AIModel.model_type == ModelType.CHURN_PREDICTION,
        AIModel.status == ModelStatus.READY
    ).first()
    
    if not model:
        raise HTTPException(status_code=404, detail="No ready churn prediction model found")
    
    # Create prediction record
    prediction = ChurnPrediction(
        **prediction_data.dict(),
        model_id=model.id,
        organization_id=organization_id,
        user_id=user.get("user_id")
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    
    # Start background prediction task
    background_tasks.add_task(run_churn_prediction, prediction.id, organization_id)
    
    return ChurnPredictionResponse.from_orm(prediction)

@router.get("/churn-prediction/{prediction_id}", response_model=ChurnPredictionResponse)
async def get_churn_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Get detailed churn prediction"""
    prediction = db.query(ChurnPrediction).filter(
        ChurnPrediction.id == prediction_id,
        ChurnPrediction.organization_id == organization_id
    ).first()
    
    if not prediction:
        raise HTTPException(status_code=404, detail="Churn prediction not found")
    
    return ChurnPredictionResponse.from_orm(prediction)

@router.put("/churn-prediction/{prediction_id}/actual")
async def update_actual_churn_status(
    prediction_id: int,
    actually_churned: bool,
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Update actual churn status for accuracy tracking"""
    prediction = db.query(ChurnPrediction).filter(
        ChurnPrediction.id == prediction_id,
        ChurnPrediction.organization_id == organization_id
    ).first()
    
    if not prediction:
        raise HTTPException(status_code=404, detail="Churn prediction not found")
    
    # Update actual status
    prediction.actual_churned = actually_churned
    
    # Calculate accuracy if we have the actual result
    if prediction.actual_churned is not None:
        predicted_risk = prediction.churn_probability > 0.5
        actual_risk = prediction.actual_churned
        
        # Simple accuracy calculation
        accuracy = 1.0 if predicted_risk == actual_risk else 0.0
        prediction.prediction_accuracy = accuracy
    
    db.commit()
    
    return {"message": "Actual churn status updated", "accuracy": prediction.prediction_accuracy}

@router.get("/churn-prediction/analytics")
async def get_churn_analytics(
    organization_id: Optional[str] = None,
    days: int = Query(30, le=365),
    db: Session = Depends(get_db),
    user_organization_id: str = Depends(get_organization_id)
):
    """Get churn analytics and insights"""
    target_org = organization_id or user_organization_id
    
    # Get predictions for the period
    since_date = datetime.utcnow() - timedelta(days=days)
    predictions = db.query(ChurnPrediction).filter(
        ChurnPrediction.organization_id == target_org,
        ChurnPrediction.prediction_date >= since_date
    ).all()
    
    if not predictions:
        return {"message": "No predictions found for the specified period"}
    
    # Calculate analytics
    total_predictions = len(predictions)
    high_risk_count = len([p for p in predictions if p.risk_level == ChurnRiskLevel.HIGH])
    critical_risk_count = len([p for p in predictions if p.risk_level == ChurnRiskLevel.CRITICAL])
    avg_churn_probability = sum([p.churn_probability for p in predictions]) / total_predictions
    
    # Risk distribution
    risk_distribution = {
        "low": len([p for p in predictions if p.risk_level == ChurnRiskLevel.LOW]),
        "medium": len([p for p in predictions if p.risk_level == ChurnRiskLevel.MEDIUM]),
        "high": high_risk_count,
        "critical": critical_risk_count
    }
    
    # Estimated business impact
    total_ltv_loss = sum([p.estimated_ltv_loss or 0 for p in predictions])
    total_revenue_loss = sum([p.estimated_revenue_loss or 0 for p in predictions])
    
    return {
        "period_days": days,
        "total_predictions": total_predictions,
        "risk_distribution": risk_distribution,
        "avg_churn_probability": round(avg_churn_probability, 3),
        "high_risk_percentage": round(high_risk_count / total_predictions * 100, 2),
        "estimated_total_ltv_risk": total_ltv_loss,
        "estimated_total_revenue_risk": total_revenue_loss,
        "recommendations": generate_churn_recommendations(risk_distribution, avg_churn_probability)
    }

# =============================================================================
# DYNAMIC PRICING ENDPOINTS  
# =============================================================================

@router.get("/pricing/recommendations", response_model=List[PricingRecommendationResponse])
async def list_pricing_recommendations(
    strategy: Optional[PriceStrategy] = None,
    product_id: Optional[str] = None,
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """List pricing recommendations"""
    query = db.query(PricingRecommendation).filter(
        PricingRecommendation.organization_id == organization_id
    )
    
    if strategy:
        query = query.filter(PricingRecommendation.strategy == strategy)
    if product_id:
        query = query.filter(PricingRecommendation.product_id == product_id)
    
    recommendations = query.order_by(PricingRecommendation.generated_at.desc()).limit(limit).all()
    return [PricingRecommendationResponse.from_orm(rec) for rec in recommendations]

@router.post("/pricing/recommendations", response_model=PricingRecommendationResponse)
async def create_pricing_recommendation(
    recommendation_data: PricingRecommendationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id),
    user: Dict = Depends(get_current_user)
):
    """Create a new pricing recommendation"""
    # Get available pricing model
    model = db.query(AIModel).filter(
        AIModel.model_type == ModelType.DYNAMIC_PRICING,
        AIModel.status == ModelStatus.READY
    ).first()
    
    if not model:
        raise HTTPException(status_code=404, detail="No ready pricing model found")
    
    # Create recommendation record
    recommendation = PricingRecommendation(
        **recommendation_data.dict(),
        model_id=model.id,
        organization_id=organization_id,
        generated_by=user.get("user_id")
    )
    db.add(recommendation)
    db.commit()
    db.refresh(recommendation)
    
    # Start background pricing analysis
    background_tasks.add_task(run_pricing_recommendation, recommendation.id, organization_id)
    
    return PricingRecommendationResponse.from_orm(recommendation)

@router.get("/pricing/recommendations/{recommendation_id}", response_model=PricingRecommendationResponse)
async def get_pricing_recommendation(
    recommendation_id: int,
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Get detailed pricing recommendation"""
    recommendation = db.query(PricingRecommendation).filter(
        PricingRecommendation.id == recommendation_id,
        PricingRecommendation.organization_id == organization_id
    ).first()
    
    if not recommendation:
        raise HTTPException(status_code=404, detail="Pricing recommendation not found")
    
    return PricingRecommendationResponse.from_orm(recommendation)

@router.put("/pricing/recommendations/{recommendation_id}/implement")
async def implement_pricing_recommendation(
    recommendation_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Mark pricing recommendation as implemented"""
    recommendation = db.query(PricingRecommendation).filter(
        PricingRecommendation.id == recommendation_id,
        PricingRecommendation.organization_id == organization_id
    ).first()
    
    if not recommendation:
        raise HTTPException(status_code=404, detail="Pricing recommendation not found")
    
    if recommendation.implementation_status == "implemented":
        raise HTTPException(status_code=400, detail="Recommendation already implemented")
    
    recommendation.implementation_status = "implemented"
    db.commit()
    
    # Start background tracking
    background_tasks.add_task(track_pricing_impact, recommendation.id, organization_id)
    
    return {"message": "Pricing recommendation marked as implemented"}

@router.get("/pricing/analytics")
async def get_pricing_analytics(
    organization_id: Optional[str] = None,
    days: int = Query(30, le=365),
    db: Session = Depends(get_db),
    user_organization_id: str = Depends(get_organization_id)
):
    """Get pricing optimization analytics"""
    target_org = organization_id or user_organization_id
    
    # Get recommendations for the period
    since_date = datetime.utcnow() - timedelta(days=days)
    recommendations = db.query(PricingRecommendation).filter(
        PricingRecommendation.organization_id == target_org,
        PricingRecommendation.generated_at >= since_date
    ).all()
    
    if not recommendations:
        return {"message": "No recommendations found for the specified period"}
    
    # Calculate analytics
    total_recommendations = len(recommendations)
    implemented_count = len([r for r in recommendations if r.implementation_status == "implemented"])
    avg_revenue_impact = sum([r.projected_revenue_change or 0 for r in recommendations]) / total_recommendations
    
    # Strategy distribution
    strategy_distribution = {}
    for rec in recommendations:
        strategy = rec.strategy.value
        if strategy not in strategy_distribution:
            strategy_distribution[strategy] = 0
        strategy_distribution[strategy] += 1
    
    return {
        "period_days": days,
        "total_recommendations": total_recommendations,
        "implemented_count": implemented_count,
        "implementation_rate": round(implemented_count / total_recommendations * 100, 2),
        "avg_projected_revenue_impact": round(avg_revenue_impact, 2),
        "strategy_distribution": strategy_distribution,
        "total_projected_revenue_change": sum([r.projected_revenue_change or 0 for r in recommendations])
    }

# =============================================================================
# CUSTOMER SEGMENTATION ENDPOINTS
# =============================================================================

@router.get("/segmentation/segments", response_model=List[CustomerSegmentResponse])
async def list_customer_segments(
    segment_type: Optional[SegType] = None,
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """List customer segments"""
    query = db.query(CustomerSegment).join(AIModel).filter(
        AIModel.status == ModelStatus.READY
    )
    
    if segment_type:
        query = query.filter(CustomerSegment.segment_type == segment_type)
    
    segments = query.order_by(CustomerSegment.created_at.desc()).limit(limit).all()
    return [CustomerSegmentResponse.from_orm(segment) for segment in segments]

@router.post("/segmentation/segments", response_model=CustomerSegmentResponse)
async def create_customer_segmentation(
    segment_data: CustomerSegmentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Create new customer segmentation analysis"""
    # Get available segmentation model
    model = db.query(AIModel).filter(
        AIModel.model_type == ModelType.CUSTOMER_SEGMENTATION,
        AIModel.status == ModelStatus.READY
    ).first()
    
    if not model:
        raise HTTPException(status_code=404, detail="No ready segmentation model found")
    
    # Create segment record
    segment = CustomerSegment(
        **segment_data.dict(),
        model_id=model.id,
        generation_algorithm="kmeans"
    )
    db.add(segment)
    db.commit()
    db.refresh(segment)
    
    # Start background segmentation
    background_tasks.add_task(run_customer_segmentation, segment.id, organization_id)
    
    return CustomerSegmentResponse.from_orm(segment)

@router.get("/segmentation/segments/{segment_id}", response_model=CustomerSegmentResponse)
async def get_customer_segment(
    segment_id: int,
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Get detailed customer segment information"""
    segment = db.query(CustomerSegment).join(AIModel).filter(
        CustomerSegment.id == segment_id
    ).first()
    
    if not segment:
        raise HTTPException(status_code=404, detail="Customer segment not found")
    
    return CustomerSegmentResponse.from_orm(segment)

@router.get("/segmentation/segments/{segment_id}/customers")
async def get_segment_customers(
    segment_id: int,
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Get customers assigned to a specific segment"""
    segment = db.query(CustomerSegment).filter(CustomerSegment.id == segment_id).first()
    if not segment:
        raise HTTPException(status_code=404, detail="Customer segment not found")
    
    # Get segment assignments
    assignments = db.query(CustomerSegmentAssignment).filter(
        CustomerSegmentAssignment.segment_id == segment_id
    ).limit(limit).all()
    
    return {
        "segment_id": segment_id,
        "segment_name": segment.segment_name,
        "total_customers": len(assignments),
        "customers": [
            {
                "customer_id": assignment.customer_id,
                "confidence_score": assignment.confidence_score,
                "assigned_at": assignment.assigned_at.isoformat()
            }
            for assignment in assignments
        ]
    }

@router.get("/segmentation/analytics")
async def get_segmentation_analytics(
    days: int = Query(30, le=365),
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Get customer segmentation analytics"""
    # Get segments created in the period
    since_date = datetime.utcnow() - timedelta(days=days)
    segments = db.query(CustomerSegment).filter(
        CustomerSegment.created_at >= since_date
    ).all()
    
    if not segments:
        return {"message": "No segments found for the specified period"}
    
    # Calculate analytics
    total_segments = len(segments)
    total_customers = sum([s.customer_count for s in segments])
    
    # Segment type distribution
    type_distribution = {}
    for segment in segments:
        seg_type = segment.segment_type.value
        if seg_type not in type_distribution:
            type_distribution[seg_type] = 0
        type_distribution[seg_type] += 1
    
    # Average metrics
    avg_ltv = sum([s.avg_ltv or 0 for s in segments]) / total_segments
    avg_revenue = sum([s.avg_monthly_revenue or 0 for s in segments]) / total_segments
    
    return {
        "period_days": days,
        "total_segments": total_segments,
        "total_customers_segmented": total_customers,
        "avg_customers_per_segment": round(total_customers / total_segments, 1),
        "segment_type_distribution": type_distribution,
        "avg_segment_ltv": round(avg_ltv, 2),
        "avg_segment_revenue": round(avg_revenue, 2),
        "segmentation_coverage": "95%"  # Placeholder
    }

# =============================================================================
# LLM INTEGRATION ENDPOINTS
# =============================================================================

@router.get("/llm/providers", response_model=List[LLMProviderConfigResponse])
async def list_llm_providers(
    active_only: bool = True,
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """List available LLM providers"""
    query = db.query(LLMProviderConfig)
    
    if active_only:
        query = query.filter(LLMProviderConfig.is_active == True)
    
    providers = query.order_by(LLMProviderConfig.priority.asc()).limit(limit).all()
    return [LLMProviderConfigResponse.from_orm(provider) for provider in providers]

@router.post("/llm/providers", response_model=LLMProviderConfigResponse)
async def create_llm_provider(
    provider_data: LLMProviderConfigCreate,
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Add a new LLM provider configuration"""
    # Check if provider exists
    existing = db.query(LLMProviderConfig).filter(
        LLMProviderConfig.provider_name == provider_data.provider_name
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Provider already exists")
    
    # Create provider
    provider = LLMProviderConfig(**provider_data.dict())
    db.add(provider)
    db.commit()
    db.refresh(provider)
    
    return LLMProviderConfigResponse.from_orm(provider)

@router.post("/llm/chat")
async def chat_with_llm(
    request: LLMInferenceRequest,
    stream: bool = Query(False),
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id),
    user: Dict = Depends(get_current_user)
):
    """Chat with LLM with automatic provider selection"""
    # Create model run record
    run_id = str(uuid.uuid4())
    model_run = ModelRun(
        run_id=run_id,
        model_id=1,  # Default LLM model
        task_type=TaskType.REASONING,
        input_data=request.dict(),
        user_id=user.get("user_id"),
        organization_id=organization_id
    )
    db.add(model_run)
    db.commit()
    
    try:
        # Route to appropriate provider based on request
        response_data = await route_llm_request(request, run_id, organization_id)
        
        # Update model run with results
        model_run.output_data = response_data
        model_run.status = "completed"
        model_run.completed_at = datetime.utcnow()
        
        # Calculate execution time
        execution_time = (model_run.completed_at - model_run.start_time).total_seconds() * 1000
        model_run.execution_time_ms = execution_time
        
        db.commit()
        
        if stream:
            # Return streaming response
            return StreamingResponse(
                generate_stream_response(response_data),
                media_type="text/event-stream"
            )
        else:
            # Return standard response
            return {
                "run_id": run_id,
                "response": response_data,
                "execution_time_ms": execution_time
            }
            
    except Exception as e:
        # Update model run with error
        model_run.status = "failed"
        model_run.error_message = str(e)
        model_run.completed_at = datetime.utcnow()
        db.commit()
        
        raise HTTPException(status_code=500, detail=f"LLM request failed: {str(e)}")

@router.get("/llm/runs", response_model=List[ModelRunResponse])
async def list_model_runs(
    task_type: Optional[TaskType] = None,
    status: Optional[str] = None,
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """List model runs/inference requests"""
    query = db.query(ModelRun).filter(
        ModelRun.organization_id == organization_id
    )
    
    if task_type:
        query = query.filter(ModelRun.task_type == task_type)
    if status:
        query = query.filter(ModelRun.status == status)
    
    runs = query.order_by(ModelRun.start_time.desc()).limit(limit).all()
    return [ModelRunResponse.from_orm(run) for run in runs]

@router.get("/llm/runs/{run_id}", response_model=ModelRunResponse)
async def get_model_run(
    run_id: str,
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Get detailed model run information"""
    run = db.query(ModelRun).filter(
        ModelRun.run_id == run_id,
        ModelRun.organization_id == organization_id
    ).first()
    
    if not run:
        raise HTTPException(status_code=404, detail="Model run not found")
    
    return ModelRunResponse.from_orm(run)

@router.delete("/llm/runs/{run_id}")
async def delete_model_run(
    run_id: str,
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Delete a model run record"""
    run = db.query(ModelRun).filter(
        ModelRun.run_id == run_id,
        ModelRun.organization_id == organization_id
    ).first()
    
    if not run:
        raise HTTPException(status_code=404, detail="Model run not found")
    
    db.delete(run)
    db.commit()
    
    return {"message": "Model run deleted successfully"}

@router.get("/llm/analytics")
async def get_llm_analytics(
    days: int = Query(30, le=365),
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Get LLM usage analytics"""
    # Get runs for the period
    since_date = datetime.utcnow() - timedelta(days=days)
    runs = db.query(ModelRun).filter(
        ModelRun.organization_id == organization_id,
        ModelRun.start_time >= since_date
    ).all()
    
    if not runs:
        return {"message": "No LLM runs found for the specified period"}
    
    # Calculate analytics
    total_runs = len(runs)
    successful_runs = len([r for r in runs if r.status == "completed"])
    total_execution_time = sum([r.execution_time_ms or 0 for r in runs])
    total_tokens = sum([r.tokens_consumed or 0 for r in runs])
    total_cost = sum([r.cost_incurred or 0 for r in runs])
    
    # Provider distribution
    provider_distribution = {}
    for run in runs:
        if run.llm_provider:
            provider_name = run.llm_provider.provider_name.value
            if provider_name not in provider_distribution:
                provider_distribution[provider_name] = 0
            provider_distribution[provider_name] += 1
    
    return {
        "period_days": days,
        "total_requests": total_runs,
        "successful_requests": successful_runs,
        "success_rate": round(successful_runs / total_runs * 100, 2) if total_runs > 0 else 0,
        "avg_execution_time_ms": round(total_execution_time / total_runs, 2) if total_runs > 0 else 0,
        "total_tokens_consumed": total_tokens,
        "avg_tokens_per_request": round(total_tokens / total_runs, 2) if total_runs > 0 else 0,
        "total_cost": round(total_cost, 4),
        "avg_cost_per_request": round(total_cost / total_runs, 6) if total_runs > 0 else 0,
        "provider_distribution": provider_distribution
    }

# =============================================================================
# UTILITY ENDPOINTS
# =============================================================================

@router.post("/models/initialize-defaults")
async def initialize_default_models(
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Initialize default AI models and providers"""
    try:
        # Check if models already exist
        existing_models = db.query(AIModel).count()
        existing_providers = db.query(LLMProviderConfig).count()
        
        created_models = 0
        created_providers = 0
        
        # Create default models
        if existing_models == 0:
            for model_config in get_default_ai_models():
                model = AIModel(**model_config)
                db.add(model)
                created_models += 1
        
        # Create default LLM providers
        if existing_providers == 0:
            for provider_config in get_default_llm_providers():
                provider = LLMProviderConfig(**provider_config)
                db.add(provider)
                created_providers += 1
        
        db.commit()
        
        return {
            "message": "Default models and providers initialized",
            "created_models": created_models,
            "created_providers": created_providers,
            "existing_models": existing_models,
            "existing_providers": existing_providers
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to initialize defaults: {str(e)}")

@router.get("/models/stats")
async def get_models_stats(
    db: Session = Depends(get_db),
    organization_id: str = Depends(get_organization_id)
):
    """Get overall AI models statistics"""
    # Get model counts by type
    model_types = {}
    for model_type in ModelType:
        count = db.query(AIModel).filter(AIModel.model_type == model_type).count()
        if count > 0:
            model_types[model_type.value] = count
    
    # Get provider counts
    provider_counts = {}
    for provider in LLMProvider:
        count = db.query(LLMProviderConfig).filter(LLMProviderConfig.provider_name == provider).count()
        if count > 0:
            provider_counts[provider.value] = count
    
    # Get recent activity (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_runs = db.query(ModelRun).filter(ModelRun.start_time >= week_ago).count()
    recent_forecasts = db.query(UsageForecast).filter(UsageForecast.generated_at >= week_ago).count()
    recent_predictions = db.query(ChurnPrediction).filter(ChurnPrediction.prediction_date >= week_ago).count()
    
    return {
        "total_models": db.query(AIModel).count(),
        "ready_models": db.query(AIModel).filter(AIModel.status == ModelStatus.READY).count(),
        "model_types": model_types,
        "total_providers": db.query(LLMProviderConfig).count(),
        "active_providers": db.query(LLMProviderConfig).filter(LLMProviderConfig.is_active == True).count(),
        "provider_distribution": provider_counts,
        "recent_activity_7d": {
            "model_runs": recent_runs,
            "usage_forecasts": recent_forecasts,
            "churn_predictions": recent_predictions
        },
        "total_predictions_today": db.query(AIPrediction).filter(
            AIPrediction.created_at >= datetime.utcnow().date()
        ).count()
    }

# =============================================================================
# BACKGROUND TASKS (SIMPLE IMPLEMENTATIONS)
# =============================================================================

async def run_forecast_generation(forecast_id: int, organization_id: str):
    """Background task for generating usage forecasts"""
    # This is a simplified implementation
    # In production, this would call the actual ML model
    pass

async def run_churn_prediction(prediction_id: int, organization_id: str):
    """Background task for running churn predictions"""
    # This is a simplified implementation
    pass

async def run_pricing_recommendation(recommendation_id: int, organization_id: str):
    """Background task for generating pricing recommendations"""
    # This is a simplified implementation
    pass

async def run_customer_segmentation(segment_id: int, organization_id: str):
    """Background task for customer segmentation"""
    # This is a simplified implementation
    pass

async def track_pricing_impact(recommendation_id: int, organization_id: str):
    """Background task for tracking pricing recommendation impact"""
    # This is a simplified implementation
    pass

async def route_llm_request(request: LLMInferenceRequest, run_id: str, organization_id: str):
    """Route LLM request to appropriate provider with failover"""
    # This is a simplified implementation
    # In production, this would implement the full routing logic
    return {
        "content": "This is a placeholder response. In production, this would call the actual LLM.",
        "model": "deepseek-chat",
        "provider": "openrouter",
        "tokens_used": 100
    }

async def generate_stream_response(data: Dict[str, Any]):
    """Generate streaming response data"""
    content = data.get("content", "")
    for chunk in content.split():
        yield f"data: {json.dumps({'content': chunk + ' '})}\n\n"

def generate_churn_recommendations(risk_distribution: Dict[str, int], avg_probability: float) -> List[str]:
    """Generate churn prevention recommendations"""
    recommendations = []
    
    if risk_distribution.get("high", 0) + risk_distribution.get("critical", 0) > 10:
        recommendations.append("High volume of at-risk customers detected. Consider implementing proactive retention campaigns.")
    
    if avg_probability > 0.7:
        recommendations.append("Average churn probability is high. Review product-market fit and customer satisfaction.")
    
    recommendations.append("Monitor feature usage patterns to identify early warning signs.")
    recommendations.append("Implement personalized engagement strategies for high-risk segments.")
    
    return recommendations