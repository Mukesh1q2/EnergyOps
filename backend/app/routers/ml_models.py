"""
Advanced ML Models Router for sophisticated forecasting and optimization.
Provides APIs for TFT, N-BEATS, and DeepAR model training and prediction.
"""

from fastapi import APIRouter, HTTPException, Query, Body
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np

from ..services.advanced_ml_service import advanced_ml_service

router = APIRouter(prefix="/api/ml", tags=["advanced-ml"])


class TrainingDataRequest(BaseModel):
    """Request model for ML training data."""
    data: List[Dict[str, Any]] = Field(..., description="Training data as list of records")
    target_column: str = Field(..., description="Target column for forecasting")


class TFTTrainingRequest(BaseModel):
    """Request model for TFT training."""
    target_column: str = Field(..., description="Target column for forecasting")
    feature_columns: List[str] = Field(..., description="Feature columns for training")
    horizon: int = Field(24, ge=1, le=168, description="Forecast horizon in periods")
    epochs: int = Field(100, ge=1, le=1000, description="Training epochs")
    batch_size: int = Field(32, ge=1, le=512, description="Training batch size")


class NBeatsTrainingRequest(BaseModel):
    """Request model for N-BEATS training."""
    target_column: str = Field(..., description="Target column for forecasting")
    horizon: int = Field(24, ge=1, le=168, description="Forecast horizon in periods")
    epochs: int = Field(200, ge=1, le=1000, description="Training epochs")
    batch_size: int = Field(32, ge=1, le=512, description="Training batch size")


class DeepARTrainingRequest(BaseModel):
    """Request model for DeepAR training."""
    target_column: str = Field(..., description="Target column for forecasting")
    feature_columns: Optional[List[str]] = Field(None, description="Feature columns for training")
    horizon: int = Field(24, ge=1, le=168, description="Forecast horizon in periods")
    epochs: int = Field(150, ge=1, le=1000, description="Training epochs")
    batch_size: int = Field(32, ge=1, le=512, description="Training batch size")


class PredictionRequest(BaseModel):
    """Request model for making predictions."""
    input_data: List[List[float]] = Field(..., description="Input data for prediction")
    horizon: int = Field(24, ge=1, le=168, description="Forecast horizon")


class ModelComparisonRequest(BaseModel):
    """Request model for model comparison."""
    model_results: List[Dict[str, Any]] = Field(..., description="Model prediction results")
    ground_truth: List[float] = Field(..., description="Actual values for comparison")


@router.post("/train/tft")
async def train_tft_model(
    request: TFTTrainingRequest,
    data: List[Dict[str, Any]] = Body(..., description="Training data")
):
    """
    Train Temporal Fusion Transformer (TFT) model.
    
    TFT is designed for multi-horizon forecasting and can handle:
    - Multiple input features
    - Time-varying features
    - Static categorical variables
    - Probabilistic forecasts with quantile regression
    """
    try:
        if not data:
            raise HTTPException(status_code=400, detail="Training data cannot be empty")
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        
        # Validate columns
        if request.target_column not in df.columns:
            raise HTTPException(status_code=400, detail=f"Target column '{request.target_column}' not found in data")
        
        for col in request.feature_columns:
            if col not in df.columns:
                raise HTTPException(status_code=400, detail=f"Feature column '{col}' not found in data")
        
        # Ensure no overlap between target and features
        overlap = set([request.target_column]) & set(request.feature_columns)
        if overlap:
            raise HTTPException(status_code=400, detail=f"Target and feature columns overlap: {overlap}")
        
        # Validate data size
        if len(df) < 100:
            raise HTTPException(status_code=400, detail="Insufficient data: minimum 100 records required")
        
        # Train model
        result = await advanced_ml_service.train_tft_model(
            data=df,
            target_column=request.target_column,
            feature_columns=request.feature_columns,
            horizon=request.horizon,
            epochs=request.epochs,
            batch_size=request.batch_size
        )
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TFT training failed: {str(e)}")


@router.post("/train/nbeats")
async def train_nbeats_model(
    request: NBeatsTrainingRequest,
    data: List[Dict[str, Any]] = Body(..., description="Training data")
):
    """
    Train N-BEATS model.
    
    N-BEATS is a deep neural network for time series forecasting:
    - Uses interpretable basis functions
    - Handles trend and seasonality
    - No exogenous variables required
    - Excellent for univariate forecasting
    """
    try:
        if not data:
            raise HTTPException(status_code=400, detail="Training data cannot be empty")
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        
        # Validate target column
        if request.target_column not in df.columns:
            raise HTTPException(status_code=400, detail=f"Target column '{request.target_column}' not found in data")
        
        # Validate data size
        if len(df) < 200:
            raise HTTPException(status_code=400, detail="Insufficient data: minimum 200 records required")
        
        # Train model
        result = await advanced_ml_service.train_nbeats_model(
            data=df,
            target_column=request.target_column,
            horizon=request.horizon,
            epochs=request.epochs,
            batch_size=request.batch_size
        )
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"N-BEATS training failed: {str(e)}")


@router.post("/train/deepar")
async def train_deepar_model(
    request: DeepARTrainingRequest,
    data: List[Dict[str, Any]] = Body(..., description="Training data")
):
    """
    Train DeepAR model for probabilistic forecasting.
    
    DeepAR is designed for probabilistic time series forecasting:
    - Handles multiple related time series
    - Provides uncertainty quantification
    - Uses LSTM encoder-decoder architecture
    - Supports different likelihood models (Gaussian, Poisson, etc.)
    """
    try:
        if not data:
            raise HTTPException(status_code=400, detail="Training data cannot be empty")
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        
        # Validate target column
        if request.target_column not in df.columns:
            raise HTTPException(status_code=400, detail=f"Target column '{request.target_column}' not found in data")
        
        # Use target column as default feature if none specified
        if request.feature_columns is None:
            request.feature_columns = [request.target_column]
        
        # Validate feature columns
        for col in request.feature_columns:
            if col not in df.columns:
                raise HTTPException(status_code=400, detail=f"Feature column '{col}' not found in data")
        
        # Validate data size
        if len(df) < 150:
            raise HTTPException(status_code=400, detail="Insufficient data: minimum 150 records required")
        
        # Train model
        result = await advanced_ml_service.train_deepar_model(
            data=df,
            target_column=request.target_column,
            feature_columns=request.feature_columns,
            horizon=request.horizon,
            epochs=request.epochs,
            batch_size=request.batch_size
        )
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DeepAR training failed: {str(e)}")


@router.post("/predict/tft/{model_id}")
async def predict_tft(
    model_id: str,
    request: PredictionRequest
):
    """
    Make predictions using trained TFT model.
    
    Returns quantile forecasts for uncertainty quantification.
    """
    try:
        if not request.input_data:
            raise HTTPException(status_code=400, detail="Input data cannot be empty")
        
        # Convert to numpy array
        input_array = np.array(request.input_data)
        
        if input_array.ndim == 1:
            input_array = input_array.reshape(1, -1)
        
        # Make prediction
        result = await advanced_ml_service.predict_tft(
            model_id=model_id,
            input_data=input_array,
            horizon=request.horizon
        )
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TFT prediction failed: {str(e)}")


@router.post("/predict/nbeats/{model_id}")
async def predict_nbeats(
    model_id: str,
    request: PredictionRequest
):
    """
    Make predictions using trained N-BEATS model.
    
    Returns point forecasts with trend and seasonality decomposition.
    """
    try:
        if not request.input_data:
            raise HTTPException(status_code=400, detail="Input data cannot be empty")
        
        # Convert to numpy array
        input_array = np.array(request.input_data)
        
        if input_array.ndim == 1:
            input_array = input_array.reshape(1, -1)
        
        # Make prediction
        result = await advanced_ml_service.predict_nbeats(
            model_id=model_id,
            input_sequence=input_array.flatten(),
            horizon=request.horizon
        )
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"N-BEATS prediction failed: {str(e)}")


@router.post("/predict/deepar/{model_id}")
async def predict_deepar(
    model_id: str,
    request: PredictionRequest
):
    """
    Make predictions using trained DeepAR model.
    
    Returns probabilistic forecasts with confidence intervals.
    """
    try:
        if not request.input_data:
            raise HTTPException(status_code=400, detail="Input data cannot be empty")
        
        # Convert to numpy array
        input_array = np.array(request.input_data)
        
        if input_array.ndim == 1:
            input_array = input_array.reshape(1, -1)
        
        # Make prediction
        result = await advanced_ml_service.predict_deepar(
            model_id=model_id,
            input_data=input_array,
            horizon=request.horizon
        )
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DeepAR prediction failed: {str(e)}")


@router.post("/compare")
async def compare_models(request: ModelComparisonRequest):
    """
    Compare multiple model predictions against ground truth.
    
    Calculates evaluation metrics (MAE, MSE, RMSE, MAPE) and ranks models.
    """
    try:
        if not request.model_results:
            raise HTTPException(status_code=400, detail="Model results cannot be empty")
        
        if not request.ground_truth:
            raise HTTPException(status_code=400, detail="Ground truth cannot be empty")
        
        # Convert ground truth to numpy array
        ground_truth_array = np.array(request.ground_truth)
        
        # Compare models
        result = await advanced_ml_service.compare_models(
            model_results=request.model_results,
            ground_truth=ground_truth_array
        )
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model comparison failed: {str(e)}")


@router.get("/models")
async def list_models():
    """
    List all trained models and their metadata.
    """
    try:
        models_dir = advanced_ml_service.models_dir
        
        if not models_dir.exists():
            return JSONResponse(content={"models": [], "message": "No models directory found"})
        
        models = []
        
        # Scan for model files
        for model_file in models_dir.glob("*.pt"):
            model_id = model_file.stem
            
            try:
                # Load metadata without full model
                checkpoint = torch.load(model_file, map_location="cpu")
                config = checkpoint.get("model_config", {})
                
                models.append({
                    "model_id": model_id,
                    "model_type": config.get("type", "Unknown"),
                    "target_column": config.get("target_column", "Unknown"),
                    "horizon": config.get("horizon", "Unknown"),
                    "features": config.get("feature_columns", []) if config.get("feature_columns") else None,
                    "created_at": checkpoint.get("created_at", "Unknown"),
                    "file_size_mb": round(model_file.stat().st_size / (1024 * 1024), 2),
                    "file_path": str(model_file.relative_to(models_dir))
                })
                
            except Exception as e:
                # Skip corrupted model files
                continue
        
        # Sort by creation time (newest first)
        models.sort(key=lambda x: x.get("created_at", "1970-01-01"), reverse=True)
        
        return JSONResponse(content={
            "models": models,
            "total_count": len(models),
            "models_directory": str(models_dir)
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list models: {str(e)}")


@router.delete("/models/{model_id}")
async def delete_model(model_id: str):
    """
    Delete a trained model and its associated files.
    """
    try:
        models_dir = advanced_ml_service.models_dir
        
        # Find all files related to this model
        model_files = list(models_dir.glob(f"{model_id}*"))
        
        if not model_files:
            raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found")
        
        deleted_files = []
        
        for file_path in model_files:
            try:
                file_path.unlink()
                deleted_files.append(file_path.name)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to delete {file_path.name}: {str(e)}")
        
        return JSONResponse(content={
            "success": True,
            "model_id": model_id,
            "deleted_files": deleted_files,
            "message": f"Model {model_id} deleted successfully"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete model: {str(e)}")


@router.get("/models/{model_id}/info")
async def get_model_info(model_id: str):
    """
    Get detailed information about a specific model.
    """
    try:
        models_dir = advanced_ml_service.models_dir
        model_file = models_dir / f"{model_id}.pt"
        
        if not model_file.exists():
            raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found")
        
        # Load model metadata
        checkpoint = torch.load(model_file, map_location="cpu")
        config = checkpoint.get("model_config", {})
        
        # Find associated scaler files
        scaler_files = {
            "feature_scaler": None,
            "target_scaler": None
        }
        
        for pattern in ["*scaler*.pkl", "*Scaler*.pkl"]:
            for scaler_file in models_dir.glob(f"{model_id}_{pattern.split('*')[1]}"):
                if "feature" in scaler_file.name or "X" in scaler_file.name:
                    scaler_files["feature_scaler"] = scaler_file.name
                elif "target" in scaler_file.name or "y" in scaler_file.name:
                    scaler_files["target_scaler"] = scaler_file.name
        
        model_info = {
            "model_id": model_id,
            "model_type": config.get("type", "Unknown"),
            "target_column": config.get("target_column", "Unknown"),
            "feature_columns": config.get("feature_columns", []),
            "horizon": config.get("horizon", "Unknown"),
            "model_parameters": {
                "input_size": config.get("input_size"),
                "output_size": config.get("output_size"),
                "hidden_size": config.get("hidden_size"),
                "lstm_layers": config.get("lstm_layers"),
                "dropout": config.get("dropout")
            },
            "training_info": {
                "epochs": config.get("epochs"),
                "final_loss": checkpoint.get("final_loss"),
                "training_history": checkpoint.get("training_history", [])
            },
            "files": {
                "model_file": model_file.name,
                "feature_scaler": scaler_files["feature_scaler"],
                "target_scaler": scaler_files["target_scaler"],
                "total_files": len(list(models_dir.glob(f"{model_id}*")))
            },
            "file_info": {
                "size_mb": round(model_file.stat().st_size / (1024 * 1024), 2),
                "created_at": datetime.fromtimestamp(model_file.stat().st_ctime).isoformat(),
                "modified_at": datetime.fromtimestamp(model_file.stat().st_mtime).isoformat()
            }
        }
        
        return JSONResponse(content=model_info)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get model info: {str(e)}")


@router.get("/health")
async def get_ml_health():
    """
    Check Advanced ML service health.
    """
    try:
        await advanced_ml_service.initialize()
        
        # Check models directory
        models_dir = advanced_ml_service.models_dir
        models_exist = models_dir.exists() and any(models_dir.glob("*.pt"))
        
        return JSONResponse(content={
            "status": "healthy",
            "service": "Advanced ML Models",
            "models_directory_exists": models_dir.exists(),
            "has_trained_models": models_exist,
            "supported_models": [
                "Temporal Fusion Transformer (TFT)",
                "N-BEATS",
                "DeepAR"
            ],
            "features": [
                "probabilistic_forecasting",
                "multi_horizon_forecasting", 
                "uncertainty_quantification",
                "model_comparison",
                "automl_pipeline"
            ],
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "service": "Advanced ML Models",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )


@router.get("/capabilities")
async def get_ml_capabilities():
    """
    Get detailed information about ML service capabilities and model specifications.
    """
    return JSONResponse(content={
        "service": "Advanced ML Models",
        "version": "1.0.0",
        "description": "State-of-the-art deep learning models for energy market forecasting",
        "models": {
            "temporal_fusion_transformer": {
                "name": "Temporal Fusion Transformer (TFT)",
                "type": "Transformer-based",
                "best_for": [
                    "Multi-horizon forecasting",
                    "Multiple input features",
                    "Time-varying regressors",
                    "Categorical variables"
                ],
                "capabilities": [
                    "Probabilistic forecasts",
                    "Quantile regression",
                    "Feature importance",
                    "Interpretable attention"
                ],
                "limitations": [
                    "Requires more data",
                    "Computationally intensive"
                ],
                "horizon_range": "1-168 periods",
                "feature_limit": "Unlimited"
            },
            "nbeats": {
                "name": "N-BEATS",
                "type": "Deep Neural Network",
                "best_for": [
                    "Univariate forecasting",
                    "Trend and seasonality",
                    "Interpretable forecasts",
                    "Fast inference"
                ],
                "capabilities": [
                    "Trend decomposition",
                    "Seasonality extraction",
                    "Basis function expansion",
                    "Residual learning"
                ],
                "limitations": [
                    "Univariate only",
                    "No exogenous variables"
                ],
                "horizon_range": "1-168 periods",
                "feature_limit": "1 (target only)"
            },
            "deepar": {
                "name": "DeepAR",
                "type": "LSTM Encoder-Decoder",
                "best_for": [
                    "Probabilistic forecasting",
                    "Multiple related series",
                    "Uncertainty quantification",
                    "Cold start problems"
                ],
                "capabilities": [
                    "Distribution parameters",
                    "Confidence intervals",
                    "Multi-series modeling",
                    "Likelihood modeling"
                ],
                "limitations": [
                    "Requires sequence data",
                    "Less interpretable"
                ],
                "horizon_range": "1-168 periods",
                "feature_limit": "Multiple features supported"
            }
        },
        "evaluation_metrics": [
            "Mean Absolute Error (MAE)",
            "Mean Squared Error (MSE)",
            "Root Mean Squared Error (RMSE)",
            "Mean Absolute Percentage Error (MAPE)"
        ],
        "data_requirements": {
            "minimum_records": {
                "tft": 100,
                "nbeats": 200,
                "deepar": 150
            },
            "recommended_records": {
                "tft": 500,
                "nbeats": 1000,
                "deepar": 500
            },
            "feature_types": [
                "Numerical",
                "Categorical",
                "Time-based",
                "External regressors"
            ]
        },
        "deployment_features": [
            "Model versioning",
            "MLflow integration",
            "Auto-scaling",
            "Model monitoring",
            "A/B testing"
        ],
        "timestamp": datetime.now().isoformat()
    })

# AI Admin Endpoints
@router.get("/ai/models")
async def get_ai_models():
    """
    Get all AI models with their stats for admin interface.
    """
    try:
        # Mock data for AI models - in production, fetch from database
        models = [
            {
                "id": "lstm-price-forecaster-v2.1.4",
                "name": "LSTM Price Forecaster",
                "type": "lstm",
                "category": "Price Forecasting",
                "accuracy": 94.2,
                "latency": 45.3,
                "status": "active",
                "version": "2.1.4"
            },
            {
                "id": "transformer-market-analyzer-v1.8.3",
                "name": "Transformer Market Analyzer",
                "type": "transformer",
                "category": "Market Analysis",
                "accuracy": 91.7,
                "latency": 67.8,
                "status": "active",
                "version": "1.8.3"
            },
            {
                "id": "random-forest-risk-assessor-v3.0.2",
                "name": "Random Forest Risk Assessor",
                "type": "random_forest",
                "category": "Risk Assessment",
                "accuracy": 88.5,
                "latency": 23.1,
                "status": "active",
                "version": "3.0.2"
            },
            {
                "id": "gradient-boost-demand-predictor-v1.5.1",
                "name": "Gradient Boost Demand Predictor",
                "type": "gradient_boost",
                "category": "Demand Forecasting",
                "accuracy": 92.3,
                "latency": 34.6,
                "status": "active",
                "version": "1.5.1"
            },
            {
                "id": "neural-net-anomaly-detector-v2.0.0",
                "name": "Neural Net Anomaly Detector",
                "type": "neural_network",
                "category": "Anomaly Detection",
                "accuracy": 96.1,
                "latency": 28.9,
                "status": "training",
                "version": "2.0.0"
            }
        ]
        
        stats = {
            "total_models": len(models),
            "active_models": len([m for m in models if m["status"] == "active"]),
            "average_accuracy": sum(m["accuracy"] for m in models) / len(models),
            "average_latency": sum(m["latency"] for m in models) / len(models)
        }
        
        return {
            "success": True,
            "data": {
                "models": models,
                "stats": stats
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch AI models: {str(e)}")


@router.get("/ai/predictions")
async def get_ai_predictions():
    """
    Get recent AI predictions for admin interface.
    """
    try:
        # Mock data for predictions - in production, fetch from database
        predictions = [
            {
                "id": "pred-001",
                "model_name": "LSTM Price Forecaster",
                "type": "price_forecast",
                "confidence": 94.2,
                "timestamp": datetime.now().isoformat(),
                "status": "completed",
                "processing_time": 45.3
            },
            {
                "id": "pred-002",
                "model_name": "Transformer Market Analyzer",
                "type": "market_analysis",
                "confidence": 91.7,
                "timestamp": datetime.now().isoformat(),
                "status": "completed",
                "processing_time": 67.8
            },
            {
                "id": "pred-003",
                "model_name": "Random Forest Risk Assessor",
                "type": "risk_assessment",
                "confidence": 88.5,
                "timestamp": datetime.now().isoformat(),
                "status": "completed",
                "processing_time": 23.1
            },
            {
                "id": "pred-004",
                "model_name": "Gradient Boost Demand Predictor",
                "type": "demand_forecast",
                "confidence": 92.3,
                "timestamp": datetime.now().isoformat(),
                "status": "completed",
                "processing_time": 34.6
            },
            {
                "id": "pred-005",
                "model_name": "Neural Net Anomaly Detector",
                "type": "anomaly_detection",
                "confidence": 96.1,
                "timestamp": datetime.now().isoformat(),
                "status": "pending",
                "processing_time": 28.9
            }
        ]
        
        stats = {
            "total_predictions": 847234,
            "predictions_today": len(predictions)
        }
        
        return {
            "success": True,
            "data": {
                "predictions": predictions,
                "stats": stats
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch predictions: {str(e)}")
