"""
Enhanced Dashboard Models
Phase 3: Enterprise Dashboard & Widget System
"""

from .dashboard import (
    Dashboard,
    DashboardTemplate,
    DashboardWidget,
    WidgetLayout,
    WidgetConfiguration,
    DashboardPermission,
    DashboardShare
)

from .widget import (
    WidgetType,
    WidgetDataSource,
    WidgetDataCache,
    WidgetVisualization,
    WidgetAlert,
    WidgetCollaboration
)

from .file_processing import (
    FileUpload,
    FileProcessingJob,
    SchemaMapping,
    DataValidation,
    ColumnAnalysis,
    ProcessingResult
)

from .collaboration import (
    CollaborationSession,
    LiveCursor,
    Comment,
    Mention,
    DashboardChange,
    UserPresence
)

from .knowledge_graph import (
    KnowledgeNode,
    KnowledgeEdge,
    KnowledgeGraph,
    NodeConnectedness,
    AIInsight,
    LLMSession,
    LLMQuery,
    RAGDocument,
    NodeType,
    EdgeType,
    calculate_graph_metrics,
    update_graph_statistics
)

from .theme import (
    Theme,
    ThemeCustomization,
    ThemeAnalytics,
    ThemeMode,
    ThemeType,
    get_default_light_theme,
    get_default_dark_theme,
    get_default_auto_theme,
    get_default_light_blue_theme
)

from .admin import (
    Organization,
    User,
    FeatureFlag,
    AuditLog,
    RateLimit,
    SystemHealthMetric,
    NotificationTemplate,
    UserRole,
    SubscriptionTier,
    FeatureFlagType,
    SystemHealth,
    create_default_feature_flags,
    calculate_organization_usage,
    is_feature_enabled
)

from .security import (
    Permission,
    RolePermission,
    ComplianceControl,
    EncryptionKey,
    Vulnerability,
    PenetrationTest,
    SecurityIncident,
    DataResidencyPolicy,
    SecurityEvent,
    ComplianceAssessment,
    SecurityRole,
    ComplianceFramework,
    DataClassification,
    EncryptionAlgorithm,
    VulnerabilitySeverity,
    VulnerabilityStatus,
    IncidentSeverity,
    IncidentStatus,
    DataResidency,
    SecurityEventType,
    create_default_permissions,
    create_default_compliance_controls,
    get_security_metrics,
    evaluate_compliance_status,
    
    # Monitoring & Observability models
    'MetricCollector',
    'CollectedMetric',
    'ServiceMetric',
    'AggregatedMetric',
    'DistributedTrace',
    'TraceSpan',
    'TraceSpanLog',
    'StructuredLog',
    'SLOTarget',
    'SLOMeasurement',
    'AlertRule',
    'AlertEvent',
    'NotificationLog',
    'Incident',
    'IncidentAlert',
    'SystemHealth',
    'CapacityMetric',
    'AuditLog',
    'MetricType',
    'AlertSeverity',
    'AlertStatus',
    'ServiceStatus',
    'SLOService',
    'create_default_monitoring_setup',
    'calculate_slo_compliance',
    'generate_alert_severity_score',
    'get_service_health_summary'
)

from .monitoring import (
    MetricCollector,
    CollectedMetric,
    ServiceMetric,
    AggregatedMetric,
    DistributedTrace,
    TraceSpan,
    TraceSpanLog,
    StructuredLog,
    SLOTarget,
    SLOMeasurement,
    AlertRule,
    AlertEvent,
    NotificationLog,
    Incident,
    IncidentAlert,
    SystemHealth,
    CapacityMetric,
    AuditLog,
    MetricType,
    AlertSeverity,
    AlertStatus,
    ServiceStatus,
    SLOService,
    create_default_monitoring_setup,
    calculate_slo_compliance,
    generate_alert_severity_score,
    get_service_health_summary
)

from .billing import (
    # Billing system models
    SubscriptionPlan,
    Subscription,
    UsageRecord,
    Invoice,
    Payment,
    CustomerPortal,
    RevenueEvent,
    QuotaConfiguration,
    ChurnAnalysis,
    
    # Enumerations
    BillingInterval,
    BillingStatus,
    InvoiceStatus,
    PaymentStatus,
    UsageType,
    EventType,
    RevenueEventType,
    
    # Utility functions
    create_default_subscription_plans,
    calculate_mrr,
    calculate_arr,
    calculate_customer_ltv,
    process_usage_event,
    check_quota_limits
)

from .ai_models import (
    # Core AI Models
    AIModel,
    UsageForecast,
    ChurnPrediction,
    PricingRecommendation,
    CustomerSegment,
    CustomerSegmentAssignment,
    LLMProviderConfig,
    ModelRun,
    ModelConfiguration,
    AIPrediction,
    
    # Supporting Models
    ForecastAlert,
    RetentionAction,
    PricingExperiment,
    
    # Enumerations
    ModelType,
    ModelStatus,
    ModelProvider,
    ModelArchitecture,
    TaskType,
    PredictionStatus,
    UsageForecastType,
    ChurnRiskLevel,
    PricingStrategy,
    SegmentType,
    LLMProvider,
    
    # Utility Functions
    get_default_ai_models,
    get_default_llm_providers
)

from .analytics import (
    # Analytics Models
    Dashboard,
    DashboardWidget,
    WidgetDataCache,
    AnalyticsReport,
    ReportExecution,
    KPIMetric,
    MetricValue,
    PredictiveAlert,
    DataSource,
    VisualizationConfig,
    UserDashboardPreference,
    
    # Analytics Enumerations
    DashboardType,
    WidgetType as AnalyticsWidgetType,
    ReportType,
    AlertPriority,
    VisualizationType
)

__all__ = [
    # Dashboard models
    'Dashboard',
    'DashboardTemplate', 
    'DashboardWidget',
    'WidgetLayout',
    'WidgetConfiguration',
    'DashboardPermission',
    'DashboardShare',
    
    # Widget models
    'WidgetType',
    'WidgetDataSource',
    'WidgetDataCache',
    'WidgetVisualization',
    'WidgetAlert',
    'WidgetCollaboration',
    
    # File processing models
    'FileUpload',
    'FileProcessingJob',
    'SchemaMapping',
    'DataValidation',
    'ColumnAnalysis',
    'ProcessingResult',
    
    # Collaboration models
    'CollaborationSession',
    'LiveCursor',
    'Comment',
    'Mention',
    'DashboardChange',
    'UserPresence',
    
    # Knowledge Graph models
    'KnowledgeNode',
    'KnowledgeEdge',
    'KnowledgeGraph',
    'NodeConnectedness',
    'AIInsight',
    'LLMSession',
    'LLMQuery',
    'RAGDocument',
    'NodeType',
    'EdgeType',
    'calculate_graph_metrics',
    'update_graph_statistics',
    
    # Theme system models
    'Theme',
    'ThemeCustomization',
    'ThemeAnalytics',
    'ThemeMode',
    'ThemeType',
    'get_default_light_theme',
    'get_default_dark_theme',
    'get_default_auto_theme',
    'get_default_light_blue_theme',
    
    # Admin control models
    'Organization',
    'User',
    'FeatureFlag',
    'AuditLog',
    'RateLimit',
    'SystemHealthMetric',
    'NotificationTemplate',
    'UserRole',
    'SubscriptionTier',
    'FeatureFlagType',
    'SystemHealth',
    'create_default_feature_flags',
    'calculate_organization_usage',
    'is_feature_enabled',
    
    # Security & Compliance models
    'Permission',
    'RolePermission',
    'ComplianceControl',
    'EncryptionKey',
    'Vulnerability',
    'PenetrationTest',
    'SecurityIncident',
    'DataResidencyPolicy',
    'SecurityEvent',
    'ComplianceAssessment',
    'SecurityRole',
    'ComplianceFramework',
    'DataClassification',
    'EncryptionAlgorithm',
    'VulnerabilitySeverity',
    'VulnerabilityStatus',
    'IncidentSeverity',
    'IncidentStatus',
    'DataResidency',
    'SecurityEventType',
    'create_default_permissions',
    'create_default_compliance_controls',
    'get_security_metrics',
    'evaluate_compliance_status',
    
    # Billing & SaaS Operations models
    'SubscriptionPlan',
    'Subscription',
    'UsageRecord',
    'Invoice',
    'Payment',
    'CustomerPortal',
    'RevenueEvent',
    'QuotaConfiguration',
    'ChurnAnalysis',
    'BillingInterval',
    'BillingStatus',
    'InvoiceStatus',
    'PaymentStatus',
    'UsageType',
    'EventType',
    'RevenueEventType',
    'create_default_subscription_plans',
    'calculate_mrr',
    'calculate_arr',
    'calculate_customer_ltv',
    'process_usage_event',
    'check_quota_limits',
    
    # AI/ML Models - Phase 9
    'AIModel',
    'UsageForecast',
    'ChurnPrediction',
    'PricingRecommendation',
    'CustomerSegment',
    'CustomerSegmentAssignment',
    'LLMProviderConfig',
    'ModelRun',
    'ModelConfiguration',
    'AIPrediction',
    'ForecastAlert',
    'RetentionAction',
    'PricingExperiment',
    
    # AI/ML Enumerations
    'ModelType',
    'ModelStatus',
    'ModelProvider',
    'ModelArchitecture',
    'TaskType',
    'PredictionStatus',
    'UsageForecastType',
    'ChurnRiskLevel',
    'PricingStrategy',
    'SegmentType',
    'LLMProvider',
    
    # AI/ML Utility Functions
    'get_default_ai_models',
    'get_default_llm_providers',
    
    # Analytics Models - Phase 10
    'Dashboard',
    'DashboardWidget',
    'WidgetDataCache',
    'AnalyticsReport',
    'ReportExecution',
    'KPIMetric',
    'MetricValue',
    'PredictiveAlert',
    'DataSource',
    'VisualizationConfig',
    'UserDashboardPreference',
    
    # Analytics Enumerations
    'DashboardType',
    'AnalyticsWidgetType',
    'ReportType',
    'AlertPriority',
    'VisualizationType'
]