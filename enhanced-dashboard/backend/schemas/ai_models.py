"""
AI/ML Schemas
Phase 9: Comprehensive schemas for AI/ML data validation

Provides Pydantic models for:
- AI Model configurations
- Time Series Forecasting
- Churn Prediction
- Dynamic Pricing
- Customer Segmentation  
- LLM Integration
- Model runs and analytics
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum
from uuid import UUID

# =============================================================================
# ENUMS FOR SCHEMAS
# =============================================================================

class ModelType(str, Enum):
    TIME_SERIES_FORECASTING = "time_series_forecasting"
    CHURN_PREDICTION = "churn_prediction"
    DYNAMIC_PRICING = "dynamic_pricing"
    CUSTOMER_SEGMENTATION = "customer_segmentation"
    LLM_INFERENCE = "llm_inference"

class ModelStatus(str, Enum):
    TRAINING = "training"
    READY = "ready"
    DEPLOYED = "deployed"
    ERROR = "error"
    DEPRECATED = "deprecated"

class ModelProvider(str, Enum):
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

class ModelArchitecture(str, Enum):
    TRANSFORMER = "transformer"
    ENSEMBLE = "ensemble"
    REINFORCEMENT_LEARNING = "reinforcement_learning"
    TIME_SERIES = "time_series"
    CLUSTERING = "clustering"
    GRADIENT_BOOSTING = "gradient_boosting"
    NEURAL_NETWORK = "neural_network"

class TaskType(str, Enum):
    FORECASTING = "forecasting"
    CLASSIFICATION = "classification"
    REGRESSION = "regression"
    CLUSTERING = "clustering"
    REINFORCEMENT = "reinforcement"
    REASONING = "reasoning"
    CODE_GENERATION = "code_generation"
    TEXT_ANALYSIS = "text_analysis"

class PredictionStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class UsageForecastType(str, Enum):
    API_USAGE = "api_usage"
    STORAGE_USAGE = "storage_usage"
    COMPUTE_USAGE = "compute_usage"
    BANDWIDTH_USAGE = "bandwidth_usage"
    USER_ACTIVITY = "user_activity"

class ChurnRiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class PricingStrategy(str, Enum):
    COMPETITIVE = "competitive"
    VALUE_BASED = "value_based"
    COST_PLUS = "cost_plus"
    DYNAMIC = "dynamic"
    PENETRATION = "penetration"
    SKIMMING = "skimming"

class SegmentType(str, Enum):
    BEHAVIORAL = "behavioral"
    DEMOGRAPHIC = "demographic"
    PSYCHOGRAPHIC = "psychographic"
    GEOGRAPHIC = "geographic"
    TEMPORAL = "temporal"

class LLMProvider(str, Enum):
    OPENROUTER = "openrouter"
    TOGETHER = "together"
    FIREWORKS = "fireworks"
    GROQ = "groq"
    CEREBRAS = "cerebras"
    LOCAL = "local"

# =============================================================================
# BASE SCHEMAS
# =============================================================================

class BaseAIModel(BaseModel):
    """Base schema with common AI model fields"""
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# =============================================================================
# AI MODEL SCHEMAS
# =============================================================================

class AIModelBase(BaseAIModel):
    """Base AI model configuration schema"""
    name: str = Field(..., min_length=1, max_length=255)
    display_name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    version: str = Field(default="1.0.0", min_length=1, max_length=50)
    
    model_type: ModelType
    task_type: TaskType
    architecture: ModelArchitecture
    
    primary_provider: ModelProvider
    backup_providers: Optional[List[ModelProvider]] = []
    
    parameters: Optional[Dict[str, Any]] = {}
    hyperparameters: Optional[Dict[str, Any]] = {}
    input_schema: Optional[Dict[str, Any]] = {}
    output_schema: Optional[Dict[str, Any]] = {}
    
    features: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    limitations: Optional[str] = None

class AIModelCreate(AIModelBase):
    """Schema for creating AI models"""
    pass

class AIModelUpdate(BaseModel):
    """Schema for updating AI models"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    display_name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    version: Optional[str] = Field(None, min_length=1, max_length=50)
    
    status: Optional[ModelStatus] = None
    accuracy_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    precision_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    recall_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    f1_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    
    parameters: Optional[Dict[str, Any]] = None
    hyperparameters: Optional[Dict[str, Any]] = None
    features: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    limitations: Optional[str] = None

class AIModelResponse(AIModelBase):
    """Schema for AI model response"""
    id: int
    status: ModelStatus
    accuracy_score: Optional[float] = None
    precision_score: Optional[float] = None
    recall_score: Optional[float] = None
    f1_score: Optional[float] = None
    
    deployment_date: datetime
    last_trained: Optional[datetime] = None
    last_used: Optional[datetime] = None
    usage_count: int = 0
    
    avg_inference_time_ms: Optional[float] = None
    cost_per_1k_tokens: Optional[float] = None
    cost_per_prediction: Optional[float] = None
    
    @classmethod
    def from_orm(cls, model):
        """Create response from ORM model"""
        return cls(
            id=model.id,
            name=model.name,
            display_name=model.display_name,
            description=model.description,
            version=model.version,
            model_type=model.model_type,
            task_type=model.task_type,
            architecture=model.architecture,
            primary_provider=model.primary_provider,
            backup_providers=model.backup_providers or [],
            parameters=model.parameters or {},
            hyperparameters=model.hyperparameters or {},
            input_schema=model.input_schema or {},
            output_schema=model.output_schema or {},
            status=model.status,
            accuracy_score=model.accuracy_score,
            precision_score=model.precision_score,
            recall_score=model.recall_score,
            f1_score=model.f1_score,
            features=model.features or [],
            tags=model.tags or [],
            limitations=model.limitations,
            deployment_date=model.deployment_date,
            last_trained=model.last_trained,
            last_used=model.last_used,
            usage_count=model.usage_count,
            avg_inference_time_ms=model.avg_inference_time_ms,
            cost_per_1k_tokens=model.cost_per_1k_tokens,
            cost_per_prediction=model.cost_per_prediction,
            created_at=model.deployment_date,
            updated_at=model.last_used
        )

# =============================================================================
# USAGE FORECASTING SCHEMAS
# =============================================================================

class UsageForecastBase(BaseAIModel):
    """Base schema for usage forecasting"""
    forecast_type: UsageForecastType
    metric_name: str = Field(..., min_length=1, max_length=255)
    
    historical_period_days: int = Field(default=90, ge=1, le=365)
    forecast_horizon_days: int = Field(default=30, ge=1, le=365)
    forecast_interval: str = Field(default="daily", regex="^(hourly|daily|weekly|monthly)$")
    
    baseline_usage: Optional[float] = Field(None, ge=0.0)
    confidence_level: float = Field(default=0.95, ge=0.5, le=0.99)

class UsageForecastCreate(UsageForecastBase):
    """Schema for creating usage forecasts"""
    historical_data: Optional[Dict[str, Any]] = None
    
    @validator('historical_data')
    def validate_historical_data(cls, v):
        if v is not None and not isinstance(v, (dict, list)):
            raise ValueError('Historical data must be a dictionary or list')
        return v

class UsageForecastResponse(UsageForecastBase):
    """Schema for usage forecast response"""
    id: int
    model_id: int
    organization_id: str
    
    forecast_data: Optional[List[Dict[str, Any]]] = None
    upper_bound: Optional[List[Dict[str, Any]]] = None
    lower_bound: Optional[List[Dict[str, Any]]] = None
    
    accuracy_score: Optional[float] = None
    mape_error: Optional[float] = None
    rmse_error: Optional[float] = None
    
    projected_cost_impact: Optional[float] = None
    projected_revenue_impact: Optional[float] = None
    risk_level: Optional[ChurnRiskLevel] = None
    
    generated_at: datetime
    valid_until: Optional[datetime] = None
    
    @classmethod
    def from_orm(cls, forecast):
        """Create response from ORM model"""
        return cls(
            id=forecast.id,
            forecast_type=forecast.forecast_type,
            metric_name=forecast.metric_name,
            historical_period_days=forecast.historical_period_days,
            forecast_horizon_days=forecast.forecast_horizon_days,
            forecast_interval=forecast.forecast_interval,
            baseline_usage=forecast.baseline_usage,
            confidence_level=forecast.confidence_level,
            forecast_data=forecast.forecast_data,
            upper_bound=forecast.upper_bound,
            lower_bound=forecast.lower_bound,
            accuracy_score=forecast.accuracy_score,
            mape_error=forecast.mape_error,
            rmse_error=forecast.rmse_error,
            projected_cost_impact=forecast.projected_cost_impact,
            projected_revenue_impact=forecast.projected_revenue_impact,
            risk_level=forecast.risk_level,
            generated_at=forecast.generated_at,
            valid_until=forecast.valid_until,
            created_at=forecast.generated_at,
            updated_at=forecast.generated_at
        )

# =============================================================================
# CHURN PREDICTION SCHEMAS
# =============================================================================

class ChurnPredictionBase(BaseAIModel):
    """Base schema for churn prediction"""
    customer_id: str = Field(..., min_length=1, max_length=255)
    
    # Risk Assessment (will be calculated by model)
    churn_probability: Optional[float] = Field(None, ge=0.0, le=1.0)
    risk_level: Optional[ChurnRiskLevel] = None
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    
    # Prediction Timeline
    prediction_horizon_days: int = Field(default=90, ge=1, le=365)
    next_review_date: Optional[datetime] = None
    
    # Action Recommendations
    recommended_actions: Optional[List[str]] = []
    retention_strategy: Optional[str] = None
    contact_priority: int = Field(default=1, ge=1, le=5)
    
    # Business Impact
    estimated_ltv_loss: Optional[float] = Field(None, ge=0.0)
    estimated_revenue_loss: Optional[float] = Field(None, ge=0.0)
    recommended_investment: Optional[float] = Field(None, ge=0.0)

class ChurnPredictionCreate(ChurnPredictionBase):
    """Schema for creating churn predictions"""
    # Customer features for prediction
    customer_features: Dict[str, Any] = Field(..., description="Features for churn prediction model")
    
    @validator('customer_features')
    def validate_features(cls, v):
        if not isinstance(v, dict):
            raise ValueError('Customer features must be a dictionary')
        return v

class ChurnPredictionResponse(ChurnPredictionBase):
    """Schema for churn prediction response"""
    id: int
    model_id: int
    organization_id: str
    user_id: Optional[str] = None
    
    # Model outputs
    feature_importance: Optional[Dict[str, float]] = None
    risk_factors: Optional[List[str]] = None
    protective_factors: Optional[List[str]] = None
    
    prediction_date: datetime
    actual_churned: Optional[bool] = None
    prediction_accuracy: Optional[float] = None
    
    features_used: Optional[Dict[str, Any]] = None
    model_version: Optional[str] = None
    generation_metadata: Optional[Dict[str, Any]] = None
    
    @classmethod
    def from_orm(cls, prediction):
        """Create response from ORM model"""
        return cls(
            id=prediction.id,
            customer_id=prediction.customer_id,
            churn_probability=prediction.churn_probability,
            risk_level=prediction.risk_level,
            confidence_score=prediction.confidence_score,
            prediction_horizon_days=prediction.prediction_horizon_days,
            next_review_date=prediction.next_review_date,
            recommended_actions=prediction.recommended_actions or [],
            retention_strategy=prediction.retention_strategy,
            contact_priority=prediction.contact_priority,
            estimated_ltv_loss=prediction.estimated_ltv_loss,
            estimated_revenue_loss=prediction.estimated_revenue_loss,
            recommended_investment=prediction.recommended_investment,
            model_id=prediction.model_id,
            organization_id=prediction.organization_id,
            user_id=prediction.user_id,
            feature_importance=prediction.feature_importance,
            risk_factors=prediction.risk_factors,
            protective_factors=prediction.protective_factors,
            prediction_date=prediction.prediction_date,
            actual_churned=prediction.actual_churned,
            prediction_accuracy=prediction.prediction_accuracy,
            features_used=prediction.features_used,
            model_version=prediction.model_version,
            generation_metadata=prediction.generation_metadata,
            created_at=prediction.prediction_date,
            updated_at=prediction.prediction_date
        )

# =============================================================================
# DYNAMIC PRICING SCHEMAS
# =============================================================================

class PricingRecommendationBase(BaseAIModel):
    """Base schema for pricing recommendations"""
    product_id: str = Field(..., min_length=1, max_length=255)
    plan_id: Optional[str] = Field(None, min_length=1, max_length=255)
    
    strategy: PricingStrategy
    recommended_price: float = Field(..., gt=0.0)
    current_price: float = Field(..., gt=0.0)
    
    market_position: Optional[str] = None
    elasticity_coefficient: Optional[float] = None
    price_sensitivity: Optional[float] = Field(None, ge=0.0, le=1.0)
    
    projected_revenue_change: Optional[float] = None
    projected_volume_change: Optional[float] = None
    projected_margin_impact: Optional[float] = None
    
    price_elasticity_risk: Optional[ChurnRiskLevel] = None
    market_reaction_risk: Optional[ChurnRiskLevel] = None
    competitive_response_risk: Optional[ChurnRiskLevel] = None
    
    recommended_start_date: Optional[datetime] = None
    recommended_duration_days: int = Field(default=30, ge=1, le=365)
    rollback_plan: Optional[Dict[str, Any]] = None

class PricingRecommendationCreate(PricingRecommendationBase):
    """Schema for creating pricing recommendations"""
    # Market data for analysis
    market_data: Dict[str, Any] = Field(..., description="Market data for pricing analysis")
    
    @validator('market_data')
    def validate_market_data(cls, v):
        if not isinstance(v, dict):
            raise ValueError('Market data must be a dictionary')
        return v

class PricingRecommendationResponse(PricingRecommendationBase):
    """Schema for pricing recommendation response"""
    id: int
    model_id: int
    organization_id: str
    generated_by: Optional[str] = None
    
    # Computed fields
    price_change_percent: Optional[float] = None
    
    # Market Analysis
    competitive_analysis: Optional[Dict[str, Any]] = None
    
    # Implementation tracking
    implementation_status: str = "pending"
    actual_revenue_impact: Optional[float] = None
    actual_volume_impact: Optional[float] = None
    
    generated_at: datetime
    reasoning: Optional[str] = None
    
    @classmethod
    def from_orm(cls, recommendation):
        """Create response from ORM model"""
        # Calculate price change percent
        price_change = None
        if recommendation.recommended_price and recommendation.current_price:
            price_change = ((recommendation.recommended_price - recommendation.current_price) / recommendation.current_price) * 100
        
        return cls(
            id=recommendation.id,
            product_id=recommendation.product_id,
            plan_id=recommendation.plan_id,
            strategy=recommendation.strategy,
            recommended_price=recommendation.recommended_price,
            current_price=recommendation.current_price,
            price_change_percent=price_change,
            market_position=recommendation.market_position,
            elasticity_coefficient=recommendation.elasticity_coefficient,
            price_sensitivity=recommendation.price_sensitivity,
            projected_revenue_change=recommendation.projected_revenue_change,
            projected_volume_change=recommendation.projected_volume_change,
            projected_margin_impact=recommendation.projected_margin_impact,
            price_elasticity_risk=recommendation.price_elasticity_risk,
            market_reaction_risk=recommendation.market_reaction_risk,
            competitive_response_risk=recommendation.competitive_response_risk,
            recommended_start_date=recommendation.recommended_start_date,
            recommended_duration_days=recommendation.recommended_duration_days,
            rollback_plan=recommendation.rollback_plan,
            model_id=recommendation.model_id,
            organization_id=recommendation.organization_id,
            generated_by=recommendation.generated_by,
            competitive_analysis=recommendation.competitive_analysis,
            implementation_status=recommendation.implementation_status,
            actual_revenue_impact=recommendation.actual_revenue_impact,
            actual_volume_impact=recommendation.actual_volume_impact,
            generated_at=recommendation.generated_at,
            reasoning=recommendation.reasoning,
            created_at=recommendation.generated_at,
            updated_at=recommendation.generated_at
        )

# =============================================================================
# CUSTOMER SEGMENTATION SCHEMAS
# =============================================================================

class CustomerSegmentBase(BaseAIModel):
    """Base schema for customer segments"""
    segment_name: str = Field(..., min_length=1, max_length=255)
    segment_description: Optional[str] = None
    segment_type: SegmentType
    
    # Segment characteristics
    customer_count: int = Field(default=0, ge=0)
    segment_size_percent: Optional[float] = Field(None, ge=0.0, le=100.0)
    
    # Behavioral profiles
    usage_patterns: Optional[Dict[str, Any]] = None
    feature_preferences: Optional[Dict[str, Any]] = None
    engagement_metrics: Optional[Dict[str, Any]] = None
    
    # Value metrics
    avg_ltv: Optional[float] = Field(None, ge=0.0)
    avg_monthly_revenue: Optional[float] = Field(None, ge=0.0)
    churn_rate: Optional[float] = Field(None, ge=0.0, le=1.0)
    acquisition_cost: Optional[float] = Field(None, ge=0.0)
    
    # Business insights
    growth_potential: Optional[float] = Field(None, ge=0.0, le=1.0)
    cross_sell_opportunities: Optional[List[str]] = []
    retention_strategies: Optional[List[str]] = []
    marketing_messages: Optional[List[str]] = []

class CustomerSegmentCreate(CustomerSegmentBase):
    """Schema for creating customer segments"""
    # Segmentation parameters
    n_clusters: int = Field(default=5, ge=2, le=20)
    features_used: List[str] = Field(..., min_items=1, description="Features used for segmentation")
    
    @validator('features_used')
    def validate_features_used(cls, v):
        if not isinstance(v, list) or len(v) == 0:
            raise ValueError('Features used must be a non-empty list')
        return v

class CustomerSegmentResponse(CustomerSegmentBase):
    """Schema for customer segment response"""
    id: int
    model_id: int
    
    # Segmentation details
    key_characteristics: Optional[Dict[str, Any]] = None
    differentiating_factors: Optional[List[str]] = None
    segment_tendencies: Optional[Dict[str, Any]] = None
    
    created_at: datetime
    last_updated: datetime
    generation_algorithm: str
    features_used: Optional[List[str]] = None
    
    @classmethod
    def from_orm(cls, segment):
        """Create response from ORM model"""
        return cls(
            id=segment.id,
            segment_name=segment.segment_name,
            segment_description=segment.segment_description,
            segment_type=segment.segment_type,
            customer_count=segment.customer_count,
            segment_size_percent=segment.segment_size_percent,
            usage_patterns=segment.usage_patterns,
            feature_preferences=segment.feature_preferences,
            engagement_metrics=segment.engagement_metrics,
            avg_ltv=segment.avg_ltv,
            avg_monthly_revenue=segment.avg_monthly_revenue,
            churn_rate=segment.churn_rate,
            acquisition_cost=segment.acquisition_cost,
            growth_potential=segment.growth_potential,
            cross_sell_opportunities=segment.cross_sell_opportunities or [],
            retention_strategies=segment.retention_strategies or [],
            marketing_messages=segment.marketing_messages or [],
            model_id=segment.model_id,
            key_characteristics=segment.key_characteristics,
            differentiating_factors=segment.differentiating_factors,
            segment_tendencies=segment.segment_tendencies,
            created_at=segment.created_at,
            last_updated=segment.last_updated,
            generation_algorithm=segment.generation_algorithm,
            features_used=segment.features_used,
            created_at=segment.created_at,
            updated_at=segment.last_updated
        )

# =============================================================================
# LLM INTEGRATION SCHEMAS
# =============================================================================

class LLMProviderConfigBase(BaseAIModel):
    """Base schema for LLM provider configuration"""
    provider_name: LLMProvider
    display_name: str = Field(..., min_length=1, max_length=255)
    
    api_base_url: Optional[str] = None
    api_key: Optional[str] = None
    api_version: str = Field(default="v1", min_length=1, max_length=50)
    
    supported_models: List[str] = Field(..., min_items=1)
    default_model: str = Field(..., min_length=1, max_length=255)
    
    base_cost_per_1k_tokens: float = Field(..., ge=0.0)
    latency_ms: float = Field(..., gt=0.0)
    throughput_tokens_per_second: float = Field(..., gt=0.0)
    
    supports_streaming: bool = True
    supports_function_calling: bool = True
    supports_vision: bool = False
    max_context_length: Optional[int] = Field(None, gt=0)
    
    uptime_percentage: float = Field(default=99.9, ge=0.0, le=100.0)
    rate_limits: Optional[Dict[str, Any]] = None
    retry_policy: Optional[Dict[str, Any]] = None
    
    is_active: bool = True
    priority: int = Field(default=1, ge=1, le=10)

class LLMProviderConfigCreate(LLMProviderConfigBase):
    """Schema for creating LLM provider configurations"""
    pass

class LLMProviderConfigResponse(LLMProviderConfigBase):
    """Schema for LLM provider response"""
    id: int
    last_health_check: Optional[datetime] = None
    health_status: str = "unknown"
    
    @classmethod
    def from_orm(cls, provider):
        """Create response from ORM model"""
        return cls(
            id=provider.id,
            provider_name=provider.provider_name,
            display_name=provider.display_name,
            api_base_url=provider.api_base_url,
            api_version=provider.api_version,
            supported_models=provider.supported_models or [],
            default_model=provider.default_model,
            base_cost_per_1k_tokens=provider.base_cost_per_1k_tokens,
            latency_ms=provider.latency_ms,
            throughput_tokens_per_second=provider.throughput_tokens_per_second,
            supports_streaming=provider.supports_streaming,
            supports_function_calling=provider.supports_function_calling,
            supports_vision=provider.supports_vision,
            max_context_length=provider.max_context_length,
            uptime_percentage=provider.uptime_percentage,
            rate_limits=provider.rate_limits,
            retry_policy=provider.retry_policy,
            is_active=provider.is_active,
            priority=provider.priority,
            last_health_check=provider.last_health_check,
            health_status=provider.health_status,
            created_at=provider.last_health_check or datetime.utcnow(),
            updated_at=provider.last_health_check or datetime.utcnow()
        )

class LLMInferenceRequest(BaseModel):
    """Schema for LLM inference requests"""
    prompt: str = Field(..., min_length=1)
    model: Optional[str] = None
    provider: Optional[LLMProvider] = None
    
    # Generation parameters
    max_tokens: int = Field(default=4096, ge=1, le=32000)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    top_p: float = Field(default=1.0, ge=0.0, le=1.0)
    top_k: int = Field(default=50, ge=0, le=100)
    
    # Features
    stream: bool = False
    function_calling: bool = False
    vision: bool = False
    
    # System message
    system_message: Optional[str] = None
    
    # Conversation history
    conversation_history: Optional[List[Dict[str, str]]] = []
    
    class Config:
        schema_extra = {
            "example": {
                "prompt": "Analyze the usage patterns for the past month",
                "model": "deepseek-chat",
                "provider": "openrouter",
                "max_tokens": 2048,
                "temperature": 0.1,
                "stream": False
            }
        }

class ModelRunBase(BaseModel):
    """Base schema for model runs"""
    run_id: str
    task_type: TaskType
    
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    parameters_used: Optional[Dict[str, Any]] = None
    
    status: str = "running"
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    quality_rating: Optional[int] = Field(None, ge=1, le=5)
    
    user_id: Optional[str] = None
    source_ip: Optional[str] = None
    user_agent: Optional[str] = None

class ModelRunCreate(ModelRunBase):
    """Schema for creating model runs"""
    model_id: int
    organization_id: str
    
    @validator('model_id')
    def validate_model_id(cls, v):
        if v <= 0:
            raise ValueError('Model ID must be positive')
        return v

class ModelRunResponse(ModelRunBase):
    """Schema for model run response"""
    id: int
    model_id: int
    llm_provider_id: Optional[int] = None
    
    start_time: datetime
    end_time: Optional[datetime] = None
    execution_time_ms: Optional[float] = None
    tokens_consumed: Optional[int] = None
    cost_incurred: Optional[float] = None
    
    error_message: Optional[str] = None
    retry_count: int = 0
    fallback_used: bool = False
    
    organization_id: str
    
    @classmethod
    def from_orm(cls, run):
        """Create response from ORM model"""
        return cls(
            id=run.id,
            run_id=run.run_id,
            task_type=run.task_type,
            input_data=run.input_data,
            output_data=run.output_data,
            parameters_used=run.parameters_used,
            status=run.status,
            confidence_score=run.confidence_score,
            quality_rating=run.quality_rating,
            user_id=run.user_id,
            source_ip=run.source_ip,
            user_agent=run.user_agent,
            model_id=run.model_id,
            llm_provider_id=run.llm_provider_id,
            start_time=run.start_time,
            end_time=run.end_time,
            execution_time_ms=run.execution_time_ms,
            tokens_consumed=run.tokens_consumed,
            cost_incurred=run.cost_incurred,
            error_message=run.error_message,
            retry_count=run.retry_count,
            fallback_used=run.fallback_used,
            organization_id=run.organization_id,
            created_at=run.start_time,
            updated_at=run.end_time or run.start_time
        )

# =============================================================================
# ANALYTICS SCHEMAS
# =============================================================================

class ChurnAnalytics(BaseModel):
    """Schema for churn analytics response"""
    period_days: int
    total_predictions: int
    risk_distribution: Dict[str, int]
    avg_churn_probability: float
    high_risk_percentage: float
    estimated_total_ltv_risk: float
    estimated_total_revenue_risk: float
    recommendations: List[str]

class PricingAnalytics(BaseModel):
    """Schema for pricing analytics response"""
    period_days: int
    total_recommendations: int
    implemented_count: int
    implementation_rate: float
    avg_projected_revenue_impact: float
    strategy_distribution: Dict[str, int]
    total_projected_revenue_change: float

class SegmentationAnalytics(BaseModel):
    """Schema for segmentation analytics response"""
    period_days: int
    total_segments: int
    total_customers_segmented: int
    avg_customers_per_segment: float
    segment_type_distribution: Dict[str, int]
    avg_segment_ltv: float
    avg_segment_revenue: float
    segmentation_coverage: str

class LLMAnalytics(BaseModel):
    """Schema for LLM analytics response"""
    period_days: int
    total_requests: int
    successful_requests: int
    success_rate: float
    avg_execution_time_ms: float
    total_tokens_consumed: int
    avg_tokens_per_request: float
    total_cost: float
    avg_cost_per_request: float
    provider_distribution: Dict[str, int]

class ModelsStats(BaseModel):
    """Schema for overall models statistics"""
    total_models: int
    ready_models: int
    model_types: Dict[str, int]
    total_providers: int
    active_providers: int
    provider_distribution: Dict[str, int]
    recent_activity_7d: Dict[str, int]
    total_predictions_today: int

# =============================================================================
# INITIALIZATION SCHEMAS
# =============================================================================

class InitializeDefaultsResponse(BaseModel):
    """Schema for initialization response"""
    message: str
    created_models: int
    created_providers: int
    existing_models: int
    existing_providers: int

# =============================================================================
# ADDITIONAL RESPONSE SCHEMAS
# =============================================================================

class HealthCheckResponse(BaseModel):
    """Schema for AI system health check"""
    status: str
    timestamp: datetime
    active_models: int
    active_providers: int
    recent_predictions: int
    system_load: str

class ForecastDataResponse(BaseModel):
    """Schema for forecast data export"""
    forecast_id: int
    forecast_type: UsageForecastType
    data_format: str
    record_count: int
    date_range: Dict[str, str]
    accuracy_metrics: Optional[Dict[str, float]] = None

class LLMChatResponse(BaseModel):
    """Schema for LLM chat response"""
    run_id: str
    response: Dict[str, Any]
    execution_time_ms: float
    model_used: str
    provider_used: str
    tokens_used: Optional[int] = None

class ErrorResponse(BaseModel):
    """Schema for error responses"""
    error: str
    detail: str
    timestamp: datetime
    request_id: Optional[str] = None