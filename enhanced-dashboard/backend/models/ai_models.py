"""
Advanced ML/AI Models
Phase 9: Advanced ML/AI Features with Multi-Architecture Support

This module implements comprehensive AI/ML capabilities including:
- Time Series Forecasting for Usage Prediction
- Churn Prediction Algorithms  
- Dynamic Pricing Optimization
- Customer Segmentation Analytics
- LLM Integration with Multiple Providers
- Model Routing and Auto-Failover
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, JSON, Enum, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from typing import Optional, Dict, Any, List
from datetime import datetime
import json

Base = declarative_base()

# Enums for AI Models
class ModelType(PyEnum):
    TIME_SERIES_FORECASTING = "time_series_forecasting"
    CHURN_PREDICTION = "churn_prediction"
    DYNAMIC_PRICING = "dynamic_pricing"
    CUSTOMER_SEGMENTATION = "customer_segmentation"
    LLM_INFERENCE = "llm_inference"

class ModelStatus(PyEnum):
    TRAINING = "training"
    READY = "ready"
    DEPLOYED = "deployed"
    ERROR = "error"
    DEPRECATED = "deprecated"

class ModelProvider(PyEnum):
    LOCAL_VLLM = "local_vllm"
    LOCAL_SGLANG = "local_sglang"
    LOCAL_TGI = "local_tgi"
    OPENROUTER = "openrouter"
    TOGETHER_AI = "together_ai"
    FIREWORKS_AI = "fireworks_ai"
    GROQ = "groq"
    CEREBRAS = "cerebras"
    HUGGINGFACE = "huggingface"
    CHRONOS = "chronos"
    PROPHET = "prophet"
    ARIMA = "arima"
    XGBOOST = "xgboost"
    LIGHTGBM = "lightgbm"
    CATBOOST = "catboost"
    SKLEARN = "sklearn"

class ModelArchitecture(PyEnum):
    TRANSFORMER = "transformer"
    ENSEMBLE = "ensemble"
    REINFORCEMENT_LEARNING = "reinforcement_learning"
    TIME_SERIES = "time_series"
    CLUSTERING = "clustering"
    GRADIENT_BOOSTING = "gradient_boosting"
    NEURAL_NETWORK = "neural_network"

class TaskType(PyEnum):
    FORECASTING = "forecasting"
    CLASSIFICATION = "classification"
    REGRESSION = "regression"
    CLUSTERING = "clustering"
    REINFORCEMENT = "reinforcement"
    REASONING = "reasoning"
    CODE_GENERATION = "code_generation"
    TEXT_ANALYSIS = "text_analysis"

class PredictionStatus(PyEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class UsageForecastType(PyEnum):
    API_USAGE = "api_usage"
    STORAGE_USAGE = "storage_usage"
    COMPUTE_USAGE = "compute_usage"
    BANDWIDTH_USAGE = "bandwidth_usage"
    USER_ACTIVITY = "user_activity"

class ChurnRiskLevel(PyEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class PricingStrategy(PyEnum):
    COMPETITIVE = "competitive"
    VALUE_BASED = "value_based"
    COST_PLUS = "cost_plus"
    DYNAMIC = "dynamic"
    PENETRATION = "penetration"
    SKIMMING = "skimming"

class SegmentType(PyEnum):
    BEHAVIORAL = "behavioral"
    DEMOGRAPHIC = "demographic"
    PSYCHOGRAPHIC = "psychographic"
    GEOGRAPHIC = "geographic"
    TEMPORAL = "temporal"

class LLMProvider(PyEnum):
    OPENROUTER = "openrouter"
    TOGETHER = "together"
    FIREWORKS = "fireworks"
    GROQ = "groq"
    CEREBRAS = "cerebras"
    LOCAL = "local"

# Core AI Model Registry
class AIModel(Base):
    """Registry of all AI models with multi-provider support"""
    __tablename__ = "ai_models"

    id = Column(Integer, primary_key=True, index=True)
    
    # Model Identification
    name = Column(String(255), nullable=False, index=True)
    display_name = Column(String(255), nullable=False)
    description = Column(Text)
    version = Column(String(50), nullable=False, default="1.0.0")
    
    # Model Classification
    model_type = Column(Enum(ModelType), nullable=False, index=True)
    task_type = Column(Enum(TaskType), nullable=False, index=True)
    architecture = Column(Enum(ModelArchitecture), nullable=False)
    
    # Provider & Infrastructure
    primary_provider = Column(Enum(ModelProvider), nullable=False, index=True)
    backup_providers = Column(JSON)  # List of backup provider enums
    
    # Model Configuration
    parameters = Column(JSON)  # Model-specific parameters
    hyperparameters = Column(JSON)  # Hyperparameter configurations
    input_schema = Column(JSON)  # Expected input format
    output_schema = Column(JSON)  # Output format specification
    
    # Performance & Status
    status = Column(Enum(ModelStatus), default=ModelStatus.TRAINING, index=True)
    accuracy_score = Column(Float)
    precision_score = Column(Float)
    recall_score = Column(Float)
    f1_score = Column(Float)
    
    # Deployment Information
    deployment_date = Column(DateTime, default=func.now())
    last_trained = Column(DateTime)
    last_used = Column(DateTime)
    usage_count = Column(Integer, default=0)
    
    # Cost & Performance Metrics
    avg_inference_time_ms = Column(Float)
    cost_per_1k_tokens = Column(Float)
    cost_per_prediction = Column(Float)
    
    # Metadata
    tags = Column(JSON)  # Searchable tags
    features = Column(JSON)  # Supported features
    limitations = Column(Text)
    
    # Relationships
    predictions = relationship("AIPrediction", back_populates="model")
    model_runs = relationship("ModelRun", back_populates="model")
    model_configurations = relationship("ModelConfiguration", back_populates="model")

    def __repr__(self):
        return f"<AIModel(name='{self.name}', type='{self.model_type.value}', provider='{self.primary_provider.value}')>"

# Time Series Forecasting Models
class UsageForecast(Base):
    """Time series forecasting for various usage metrics"""
    __tablename__ = "usage_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ai_models.id"), nullable=False)
    
    # Forecast Identification
    forecast_type = Column(Enum(UsageForecastType), nullable=False, index=True)
    organization_id = Column(String(255), index=True)  # UUID as string
    metric_name = Column(String(255), nullable=False, index=True)
    
    # Time Series Information
    historical_period_days = Column(Integer, default=90)
    forecast_horizon_days = Column(Integer, default=30)
    forecast_interval = Column(String(50), default="daily")  # hourly, daily, weekly, monthly
    
    # Historical Data Reference
    historical_data = Column(JSON)  # Time series data points
    baseline_usage = Column(Float)  # Current baseline usage
    
    # Forecast Results
    forecast_data = Column(JSON)  # Predicted values with confidence intervals
    confidence_level = Column(Float, default=0.95)
    upper_bound = Column(JSON)  # Confidence upper bounds
    lower_bound = Column(JSON)  # Confidence lower bounds
    
    # Forecast Metrics
    accuracy_score = Column(Float)
    mape_error = Column(Float)  # Mean Absolute Percentage Error
    rmse_error = Column(Float)  # Root Mean Square Error
    
    # Business Impact
    projected_cost_impact = Column(Float)
    projected_revenue_impact = Column(Float)
    risk_level = Column(Enum(ChurnRiskLevel))
    
    # Metadata
    generated_at = Column(DateTime, default=func.now())
    valid_until = Column(DateTime)
    
    # Relationships
    model = relationship("AIModel", foreign_keys=[model_id])
    forecast_alerts = relationship("ForecastAlert", back_populates="forecast")

    def __repr__(self):
        return f"<UsageForecast(type='{self.forecast_type.value}', horizon={self.forecast_horizon_days}d)>"

# Churn Prediction Models
class ChurnPrediction(Base):
    """Customer churn prediction and risk analysis"""
    __tablename__ = "churn_predictions"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ai_models.id"), nullable=False)
    
    # Customer Information
    customer_id = Column(String(255), index=True)
    organization_id = Column(String(255), index=True)
    
    # Risk Assessment
    churn_probability = Column(Float, nullable=False)  # 0.0 to 1.0
    risk_level = Column(Enum(ChurnRiskLevel), nullable=False, index=True)
    confidence_score = Column(Float)
    
    # Feature Contributions
    feature_importance = Column(JSON)  # Top contributing features
    risk_factors = Column(JSON)  # Identified risk factors
    protective_factors = Column(JSON)  # Positive indicators
    
    # Prediction Timeline
    prediction_date = Column(DateTime, default=func.now())
    prediction_horizon_days = Column(Integer, default=90)
    next_review_date = Column(DateTime)
    
    # Action Recommendations
    recommended_actions = Column(JSON)  # Suggested interventions
    retention_strategy = Column(String(255))
    contact_priority = Column(Integer, default=1)  # 1-5 scale
    
    # Business Impact
    estimated_ltv_loss = Column(Float)
    estimated_revenue_loss = Column(Float)
    recommended_investment = Column(Float)  # Retention investment amount
    
    # Validation
    actual_churned = Column(Boolean, nullable=True)  # True/False/None for unknown
    prediction_accuracy = Column(Float, nullable=True)
    
    # Metadata
    features_used = Column(JSON)
    model_version = Column(String(50))
    generation_metadata = Column(JSON)
    
    # Relationships
    model = relationship("AIModel", foreign_keys=[model_id])
    retention_actions = relationship("RetentionAction", back_populates="churn_prediction")

    def __repr__(self):
        return f"<ChurnPrediction(customer='{self.customer_id}', risk='{self.risk_level.value}', probability={self.churn_probability:.3f})>"

# Dynamic Pricing Models
class PricingRecommendation(Base):
    """Dynamic pricing optimization recommendations"""
    __tablename__ = "pricing_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ai_models.id"), nullable=False)
    
    # Product/Pricing Information
    product_id = Column(String(255), index=True)
    plan_id = Column(String(255), index=True)  # Subscription plan
    organization_id = Column(String(255), index=True)
    
    # Pricing Strategy
    strategy = Column(Enum(PricingStrategy), nullable=False)
    recommended_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    price_change_percent = Column(Float)
    
    # Market Analysis
    market_position = Column(String(100))
    competitive_analysis = Column(JSON)
    elasticity_coefficient = Column(Float)
    price_sensitivity = Column(Float)
    
    # Revenue Impact
    projected_revenue_change = Column(Float)
    projected_volume_change = Column(Float)
    projected_margin_impact = Column(Float)
    
    # Risk Assessment
    price_elasticity_risk = Column(Enum(ChurnRiskLevel))
    market_reaction_risk = Column(Enum(ChurnRiskLevel))
    competitive_response_risk = Column(Enum(ChurnRiskLevel))
    
    # Implementation Details
    recommended_start_date = Column(DateTime)
    recommended_duration_days = Column(Integer, default=30)
    rollback_plan = Column(JSON)
    
    # Performance Tracking
    implementation_status = Column(String(50), default="pending")
    actual_revenue_impact = Column(Float, nullable=True)
    actual_volume_impact = Column(Float, nullable=True)
    
    # Metadata
    generated_at = Column(DateTime, default=func.now())
    generated_by = Column(String(255))
    reasoning = Column(Text)
    
    # Relationships
    model = relationship("AIModel", foreign_keys=[model_id])
    pricing_experiments = relationship("PricingExperiment", back_populates="recommendation")

    def __repr__(self):
        return f"<PricingRecommendation(product='{self.product_id}', strategy='{self.strategy.value}', new_price={self.recommended_price})>"

# Customer Segmentation Models
class CustomerSegment(Base):
    """Customer segmentation analysis and groups"""
    __tablename__ = "customer_segments"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ai_models.id"), nullable=False)
    
    # Segment Information
    segment_name = Column(String(255), nullable=False)
    segment_description = Column(Text)
    segment_type = Column(Enum(SegmentType), nullable=False, index=True)
    
    # Segment Characteristics
    customer_count = Column(Integer, default=0)
    segment_size_percent = Column(Float)
    
    # Behavioral Profiles
    usage_patterns = Column(JSON)
    feature_preferences = Column(JSON)
    engagement_metrics = Column(JSON)
    
    # Value Metrics
    avg_ltv = Column(Float)
    avg_monthly_revenue = Column(Float)
    churn_rate = Column(Float)
    acquisition_cost = Column(Float)
    
    # Segmentation Features
    key_characteristics = Column(JSON)
    differentiating_factors = Column(JSON)
    segment_tendencies = Column(JSON)
    
    # Business Insights
    growth_potential = Column(Float)
    cross_sell_opportunities = Column(JSON)
    retention_strategies = Column(JSON)
    marketing_messages = Column(JSON)
    
    # Generation Metadata
    created_at = Column(DateTime, default=func.now())
    last_updated = Column(DateTime, default=func.now())
    generation_algorithm = Column(String(100))
    features_used = Column(JSON)
    
    # Relationships
    model = relationship("AIModel", foreign_keys=[model_id])
    segment_assignments = relationship("CustomerSegmentAssignment", back_populates="segment")

    def __repr__(self):
        return f"<CustomerSegment(name='{self.segment_name}', type='{self.segment_type.value}', size={self.customer_count})>"

class CustomerSegmentAssignment(Base):
    """Individual customer assignments to segments"""
    __tablename__ = "customer_segment_assignments"

    id = Column(Integer, primary_key=True, index=True)
    
    # Assignment Information
    customer_id = Column(String(255), index=True)
    segment_id = Column(Integer, ForeignKey("customer_segments.id"), index=True)
    confidence_score = Column(Float)
    
    # Assignment Metadata
    assigned_at = Column(DateTime, default=func.now())
    previous_segments = Column(JSON)  # Historical segment assignments
    assignment_rationale = Column(Text)
    
    # Relationships
    segment = relationship("CustomerSegment", back_populates="segment_assignments")

    def __repr__(self):
        return f"<CustomerSegmentAssignment(customer='{self.customer_id}', segment_id={self.segment_id}, confidence={self.confidence_score:.3f})>"

# LLM Integration Models
class LLMProviderConfig(Base):
    """Configuration for multiple LLM providers with auto-failover"""
    __tablename__ = "llm_provider_configs"

    id = Column(Integer, primary_key=True, index=True)
    
    # Provider Information
    provider_name = Column(Enum(LLMProvider), nullable=False, unique=True, index=True)
    display_name = Column(String(255), nullable=False)
    
    # API Configuration
    api_base_url = Column(String(500))
    api_key = Column(String(500))  # Encrypted
    api_version = Column(String(50), default="v1")
    
    # Model Configuration
    supported_models = Column(JSON)  # List of available models
    default_model = Column(String(255))
    
    # Performance & Cost
    base_cost_per_1k_tokens = Column(Float)
    latency_ms = Column(Float)
    throughput_tokens_per_second = Column(Float)
    
    # Capabilities
    supports_streaming = Column(Boolean, default=True)
    supports_function_calling = Column(Boolean, default=True)
    supports_vision = Column(Boolean, default=False)
    max_context_length = Column(Integer)
    
    # Reliability
    uptime_percentage = Column(Float, default=99.9)
    rate_limits = Column(JSON)  # Rate limiting configuration
    retry_policy = Column(JSON)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    priority = Column(Integer, default=1)  # 1=highest priority
    last_health_check = Column(DateTime)
    health_status = Column(String(50), default="unknown")
    
    # Relationships
    model_runs = relationship("ModelRun", back_populates="llm_provider")

    def __repr__(self):
        return f"<LLMProviderConfig(provider='{self.provider_name.value}', model='{self.default_model}')>"

class ModelRun(Base):
    """Individual model execution and inference runs"""
    __tablename__ = "model_runs"

    id = Column(Integer, primary_key=True, index=True)
    
    # Model Information
    model_id = Column(Integer, ForeignKey("ai_models.id"), nullable=False, index=True)
    llm_provider_id = Column(Integer, ForeignKey("llm_provider_configs.id"), nullable=True)
    
    # Run Identification
    run_id = Column(String(255), unique=True, nullable=False, index=True)
    task_type = Column(Enum(TaskType), nullable=False, index=True)
    
    # Input/Output
    input_data = Column(JSON)
    output_data = Column(JSON)
    parameters_used = Column(JSON)
    
    # Performance Metrics
    start_time = Column(DateTime, default=func.now())
    end_time = Column(DateTime)
    execution_time_ms = Column(Float)
    tokens_consumed = Column(Integer, nullable=True)
    cost_incurred = Column(Float, nullable=True)
    
    # Quality Metrics
    confidence_score = Column(Float, nullable=True)
    quality_rating = Column(Integer, nullable=True)  # 1-5 scale
    
    # Status & Error Handling
    status = Column(String(50), default="running", index=True)
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    fallback_used = Column(Boolean, default=False)
    
    # Metadata
    user_id = Column(String(255), index=True)
    organization_id = Column(String(255), index=True)
    source_ip = Column(String(50))
    user_agent = Column(String(500))
    
    # Relationships
    model = relationship("AIModel", back_populates="model_runs")
    llm_provider = relationship("LLMProviderConfig", back_populates="model_runs")

    def __repr__(self):
        return f"<ModelRun(run_id='{self.run_id}', model_id={self.model_id}, status='{self.status}')>"

class ModelConfiguration(Base):
    """Model configuration and parameter management"""
    __tablename__ = "model_configurations"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ai_models.id"), nullable=False, index=True)
    
    # Configuration Information
    config_name = Column(String(255), nullable=False)
    config_type = Column(String(100), nullable=False)
    
    # Parameters
    parameters = Column(JSON)  # Model parameters
    environment_config = Column(JSON)  # Environment-specific settings
    
    # Version Management
    version = Column(String(50), default="1.0")
    is_active = Column(Boolean, default=False)
    
    # Performance Tracking
    performance_metrics = Column(JSON)
    last_performance_check = Column(DateTime)
    
    # Relationships
    model = relationship("AIModel", back_populates="model_configurations")

    def __repr__(self):
        return f"<ModelConfiguration(model_id={self.model_id}, name='{self.config_name}', version='{self.version}')>"

# Support Tables
class AIPrediction(Base):
    """Base class for all AI predictions"""
    __tablename__ = "ai_predictions"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ai_models.id"), nullable=False, index=True)
    
    # Prediction Information
    prediction_id = Column(String(255), unique=True, nullable=False, index=True)
    prediction_type = Column(String(100), nullable=False, index=True)
    
    # Input/Output
    input_data = Column(JSON)
    prediction_result = Column(JSON)
    confidence_score = Column(Float)
    
    # Status & Metadata
    status = Column(Enum(PredictionStatus), default=PredictionStatus.PENDING, index=True)
    created_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime, nullable=True)
    
    # Performance
    processing_time_ms = Column(Float)
    
    # Relationships
    model = relationship("AIModel", back_populates="predictions")

class ForecastAlert(Base):
    """Alerts for usage forecasting anomalies"""
    __tablename__ = "forecast_alerts"

    id = Column(Integer, primary_key=True, index=True)
    forecast_id = Column(Integer, ForeignKey("usage_forecasts.id"), index=True)
    
    # Alert Information
    alert_type = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    
    # Alert Details
    metric_name = Column(String(255))
    current_value = Column(Float)
    predicted_value = Column(Float)
    deviation_percent = Column(Float)
    
    # Status
    is_active = Column(Boolean, default=True)
    acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    forecast = relationship("UsageForecast", back_populates="forecast_alerts")

class RetentionAction(Base):
    """Customer retention action tracking"""
    __tablename__ = "retention_actions"

    id = Column(Integer, primary_key=True, index=True)
    churn_prediction_id = Column(Integer, ForeignKey("churn_predictions.id"), index=True)
    
    # Action Information
    action_type = Column(String(100), nullable=False)
    description = Column(Text)
    priority = Column(Integer, default=1)
    
    # Execution
    assigned_to = Column(String(255))
    status = Column(String(50), default="pending")
    due_date = Column(DateTime, nullable=True)
    
    # Results
    outcome = Column(String(100), nullable=True)
    effectiveness_score = Column(Float, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    churn_prediction = relationship("ChurnPrediction", back_populates="retention_actions")

class PricingExperiment(Base):
    """A/B testing for pricing recommendations"""
    __tablename__ = "pricing_experiments"

    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(Integer, ForeignKey("pricing_recommendations.id"), index=True)
    
    # Experiment Design
    experiment_name = Column(String(255), nullable=False)
    control_group_size = Column(Integer)
    test_group_size = Column(Integer)
    
    # Results
    control_revenue = Column(Float, nullable=True)
    test_revenue = Column(Float, nullable=True)
    revenue_lift = Column(Float, nullable=True)
    statistical_significance = Column(Float, nullable=True)
    
    # Status
    status = Column(String(50), default="running")
    start_date = Column(DateTime, default=func.now())
    end_date = Column(DateTime, nullable=True)
    
    # Relationships
    recommendation = relationship("PricingRecommendation", back_populates="pricing_experiments")

# Indexes for performance optimization
Index('idx_ai_models_type_provider', AIModel.model_type, AIModel.primary_provider)
Index('idx_ai_models_status', AIModel.status)
Index('idx_usage_forecasts_org_type', UsageForecast.organization_id, UsageForecast.forecast_type)
Index('idx_churn_predictions_org_risk', ChurnPrediction.organization_id, ChurnPrediction.risk_level)
Index('idx_pricing_recommendations_org', PricingRecommendation.organization_id)
Index('idx_customer_segments_type', CustomerSegment.segment_type)
Index('idx_model_runs_model_status', ModelRun.model_id, ModelRun.status)
Index('idx_model_runs_created', ModelRun.created_at.desc())
Index('idx_ai_predictions_type_status', AIPrediction.prediction_type, AIPrediction.status)

# Utility Functions
def get_default_ai_models() -> List[Dict[str, Any]]:
    """Get default AI model configurations for initialization"""
    return [
        {
            "name": "chronos_usage_forecast",
            "display_name": "Chronos Usage Forecasting",
            "model_type": ModelType.TIME_SERIES_FORECASTING,
            "task_type": TaskType.FORECASTING,
            "architecture": ModelArchitecture.TRANSFORMER,
            "primary_provider": ModelProvider.CHRONOS,
            "backup_providers": [ModelProvider.PROPHET, ModelProvider.ARIMA],
            "description": "Zero-shot time series forecasting for usage prediction",
            "parameters": {
                "forecast_horizon_days": 30,
                "confidence_level": 0.95,
                "seasonality": True,
                "trend_analysis": True
            },
            "features": ["zero_shot", "multivariate", "covariates", "seasonality"],
            "tags": ["forecasting", "usage", "timeseries", "zero_shot"]
        },
        {
            "name": "lightgbm_churn_prediction",
            "display_name": "LightGBM Churn Prediction",
            "model_type": ModelType.CHURN_PREDICTION,
            "task_type": TaskType.CLASSIFICATION,
            "architecture": ModelArchitecture.GRADIENT_BOOSTING,
            "primary_provider": ModelProvider.LIGHTGBM,
            "backup_providers": [ModelProvider.XGBOOST, ModelProvider.CATBOOST],
            "description": "Customer churn prediction using gradient boosting",
            "parameters": {
                "prediction_horizon_days": 90,
                "threshold": 0.5,
                "feature_engineering": True,
                "ensemble": True
            },
            "features": ["fast_training", "categorical_features", "interpretable"],
            "tags": ["churn", "classification", "retention", "customer_success"]
        },
        {
            "name": "ensemble_pricing_optimization",
            "display_name": "Ensemble Pricing Optimization",
            "model_type": ModelType.DYNAMIC_PRICING,
            "task_type": TaskType.REGRESSION,
            "architecture": ModelArchitecture.ENSEMBLE,
            "primary_provider": ModelProvider.SKLEARN,
            "backup_providers": [ModelProvider.XGBOOST, ModelProvider.LIGHTGBM],
            "description": "Dynamic pricing optimization using ensemble methods",
            "parameters": {
                "price_elasticity": True,
                "competitive_analysis": True,
                "market_simulation": True,
                "risk_assessment": True
            },
            "features": ["elasticity", "competitive", "revenue_optimization"],
            "tags": ["pricing", "revenue", "optimization", "economics"]
        },
        {
            "name": "kmeans_customer_segmentation",
            "display_name": "K-Means Customer Segmentation",
            "model_type": ModelType.CUSTOMER_SEGMENTATION,
            "task_type": TaskType.CLUSTERING,
            "architecture": ModelArchitecture.CLUSTERING,
            "primary_provider": ModelProvider.SKLEARN,
            "backup_providers": [ModelProvider.SKLEARN],
            "description": "Customer segmentation using K-Means clustering",
            "parameters": {
                "n_clusters": 5,
                "segment_types": ["behavioral", "demographic", "geographic"],
                "feature_selection": True,
                "validation": True
            },
            "features": ["interpretable", "behavioral_analysis", "actionable_insights"],
            "tags": ["segmentation", "customer", "analytics", "clustering"]
        },
        {
            "name": "deepseek_llm_reasoning",
            "display_name": "DeepSeek LLM for Reasoning",
            "model_type": ModelType.LLM_INFERENCE,
            "task_type": TaskType.REASONING,
            "architecture": ModelArchitecture.TRANSFORMER,
            "primary_provider": ModelProvider.OPENROUTER,
            "backup_providers": [ModelProvider.TOGETHER_AI, ModelProvider.LOCAL_VLLM],
            "description": "Advanced reasoning LLM for complex analysis",
            "parameters": {
                "max_tokens": 4096,
                "temperature": 0.1,
                "stream": True,
                "function_calling": True
            },
            "features": ["reasoning", "analysis", "code_generation", "streaming"],
            "tags": ["llm", "reasoning", "analysis", "advanced"]
        }
    ]

def get_default_llm_providers() -> List[Dict[str, Any]]:
    """Get default LLM provider configurations"""
    return [
        {
            "provider_name": LLMProvider.OPENROUTER,
            "display_name": "OpenRouter",
            "api_base_url": "https://openrouter.ai/api/v1",
            "default_model": "deepseek/deepseek-chat",
            "supported_models": ["deepseek/deepseek-chat", "anthropic/claude-3-sonnet", "meta-llama/llama-3.1-70b"],
            "base_cost_per_1k_tokens": 0.5,
            "latency_ms": 150.0,
            "supports_streaming": True,
            "supports_function_calling": True,
            "max_context_length": 128000,
            "priority": 1,
            "is_active": True
        },
        {
            "provider_name": LLMProvider.TOGETHER,
            "display_name": "Together AI",
            "api_base_url": "https://api.together.xyz/v1",
            "default_model": "deepseek-ai/DeepSeek-V3",
            "supported_models": ["deepseek-ai/DeepSeek-V3", "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo"],
            "base_cost_per_1k_tokens": 0.8,
            "latency_ms": 120.0,
            "supports_streaming": True,
            "supports_function_calling": True,
            "max_context_length": 128000,
            "priority": 2,
            "is_active": True
        },
        {
            "provider_name": LLMProvider.LOCAL,
            "display_name": "Local vLLM",
            "api_base_url": "http://localhost:8000/v1",
            "default_model": "deepseek-chat",
            "supported_models": ["deepseek-chat", "llama-3.1-8b", "qwen-3"],
            "base_cost_per_1k_tokens": 0.0,
            "latency_ms": 50.0,
            "supports_streaming": True,
            "supports_function_calling": True,
            "max_context_length": 32768,
            "priority": 3,
            "is_active": True
        },
        {
            "provider_name": LLMProvider.GROQ,
            "display_name": "Groq",
            "api_base_url": "https://api.groq.com/openai/v1",
            "default_model": "mixtral-8x7b-32768",
            "supported_models": ["mixtral-8x7b-32768", "llama-70b-8192"],
            "base_cost_per_1k_tokens": 0.27,
            "latency_ms": 80.0,
            "supports_streaming": True,
            "supports_function_calling": True,
            "max_context_length": 32768,
            "priority": 2,
            "is_active": True
        }
    ]