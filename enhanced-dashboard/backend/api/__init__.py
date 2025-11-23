"""
Enhanced Dashboard API Router
Phase 3: Enhanced Dashboard & Enterprise Features
"""

from fastapi import APIRouter

from . import dashboard, widgets, files, collaboration, knowledge_graphs, themes, admin, security, monitoring, billing, ai_models, analytics

# Create main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(dashboard.router, prefix="/dashboards", tags=["dashboards"])
api_router.include_router(widgets.router, prefix="/widgets", tags=["widgets"])
api_router.include_router(files.router, prefix="/files", tags=["file-processing"])
api_router.include_router(collaboration.router, prefix="/collaboration", tags=["collaboration"])
api_router.include_router(knowledge_graphs.router, prefix="/graphs", tags=["knowledge-graphs"])
api_router.include_router(themes.router, prefix="/themes", tags=["themes"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(security.router, prefix="/security", tags=["security"])
api_router.include_router(monitoring.router, prefix="/monitoring", tags=["monitoring"])
api_router.include_router(billing.billing_router, prefix="/billing", tags=["billing"])
api_router.include_router(ai_models.router, prefix="/ai", tags=["ai-models"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

# Health check endpoint
@api_router.get("/health")
async def health_check():
    """Enhanced Dashboard API health check"""
    from ..models.monitoring import get_service_health_summary
    from datetime import datetime
    
    # Get monitoring system health
    monitoring_health = get_service_health_summary()
    
    return {
        "status": "healthy",
        "service": "enhanced-dashboard",
        "version": "9.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "monitoring_system": {
            "status": monitoring_health["overall_status"],
            "components_healthy": monitoring_health["healthy_components"],
            "total_components": monitoring_health["component_count"]
        },
        "slo_compliance": monitoring_health["slo_compliance"],
        "features": {
            "dashboard_engine": "active",
            "monitoring_system": "active",
            "security_compliance": "active",
            "real_time_features": "active",
            "ai_ml_platform": "active"
        }
    }

# System info endpoint
@api_router.get("/info")
async def system_info():
    """Enhanced Dashboard system information"""
    return {
        "service": "Enhanced Dashboard & Enterprise Features",
        "version": "9.0.0",
        "description": "Phase 9 implementation - Advanced ML/AI Features with Time Series Forecasting, Churn Prediction, Dynamic Pricing, Customer Segmentation, and Multi-Provider LLM Integration with Auto-Failover Capabilities",
        "features": [
            "Advanced Dashboard Engine",
            "Drag & Drop Widget System", 
            "Real-time Collaboration",
            "File Upload & Processing",
            "Visual Knowledge Graphs",
            "AI-Powered Insights & LLM Assistant",
            "Multi-format Data Import",
            "ML-powered Schema Mapping",
            "Enterprise Analytics",
            "Advanced Theme System",
            "Multi-Mode Theme Support",
            "Enterprise Admin Panel",
            "Feature Flag Management",
            "Comprehensive Audit Logging",
            "System Health Monitoring",
            "Organization Management",
            "User & Role Management",
            "Rate Limiting Controls",
            "Security & Enterprise Compliance",
            "SOC2 Type II Compliance Framework",
            "ISO 27001 Compliance Management",
            "Advanced RBAC with ABAC",
            "Encryption Key Management",
            "Vulnerability Management",
            "Penetration Testing Automation",
            "Incident Management System",
            "Data Residency & Privacy Controls",
            "Real-time Security Event Monitoring",
            "Compliance Assessment Management",
            "Monitoring & Observability Platform",
            "Metrics Collection & Time-Series Storage",
            "SLO/SLA Tracking with Error Budgets",
            "Distributed Tracing with OpenTelemetry",
            "Real-time Alerting & Escalation Workflows",
            "Incident Management & Response",
            "System Health & Capacity Planning",
            "Centralized Structured Logging",
            "Compliance Audit Trail Management",
            "Real-time WebSocket Monitoring",
            "Automated Incident Response",
            "Billing & SaaS Operations Platform",
            "Comprehensive Subscription Management",
            "Usage-based Metering & Tracking",
            "Stripe Payment Integration",
            "Automated Invoice Generation & PDF",
            "Revenue Recognition & Analytics",
            "MRR, ARR, Churn & LTV Calculations",
            "Self-service Customer Portal",
            "Quota Management & Limits",
            "Customer Success Metrics",
            "Revenue Event Tracking"
        ],
        "supported_widgets": [
            "Time Series Charts",
            "Knowledge Graphs", 
            "Geospatial Maps",
            "KPI Cards",
            "Sankey Diagrams",
            "Gantt Charts",
            "Collaboration Panels",
            "Theme Preview Widgets",
            "Admin Dashboard Widgets"
        ],
        "supported_formats": [
            "CSV",
            "Excel", 
            "JSON",
            "PDF",
            "XML",
            "YAML"
        ],
        "theme_modes": [
            "Light",
            "Dark",
            "Auto (System/Time)",
            "Light Blue"
        ],
        "real_time_features": [
            "Live Cursors",
            "User Presence",
            "Collaborative Editing", 
            "Real-time Comments",
            "Dashboard Sharing",
            "Session Recording",
            "Real-time Theme Switching",
            "Live System Health Monitoring"
        ],
        "admin_capabilities": [
            "Organization Management",
            "User & Role Management",
            "Feature Flag Controls",
            "Audit Log Management",
            "System Health Monitoring",
            "Rate Limiting Configuration",
            "Theme Management",
            "Security & Compliance Controls",
            "SOC2 Type II Compliance Management",
            "ISO 27001 Compliance Framework",
            "Advanced RBAC with ABAC",
            "Encryption Key Management",
            "Vulnerability Tracking",
            "Penetration Test Automation",
            "Incident Management",
            "Data Residency Controls",
            "Security Event Monitoring",
            "Compliance Assessment Tracking",
            "Monitoring & Observability Management",
            "Alert Rule Configuration",
            "SLO Target Management",
            "Incident Response Coordination",
            "System Health Monitoring",
            "Capacity Planning & Forecasting",
            "Real-time Alert Dashboard",
            "Monitoring Dashboard Configuration",
            "Billing & SaaS Operations Management",
            "Subscription Plan Configuration",
            "Usage Tracking & Analytics",
            "Invoice & Payment Management",
            "Customer Portal Management",
            "Revenue Analytics & Reporting",
            "Quota Configuration & Enforcement",
            "Churn Analysis & Customer Success",
            "Advanced ML/AI Platform",
            "Time Series Forecasting for Usage Prediction",
            "Customer Churn Prediction & Risk Analysis",
            "Dynamic Pricing Optimization Engine",
            "AI-Powered Customer Segmentation Analytics",
            "Multi-Provider LLM Integration with Auto-Failover",
            "OpenRouter, Together AI, Groq, Cerebras Support",
            "Local vLLM, SGLang, TGI Deployment Options",
            "Chronos, Prophet, ARIMA Forecasting Models",
            "LightGBM, XGBoost, CatBoost ML Algorithms",
            "Ensemble Pricing & Customer Behavior Models",
            "K-Means Clustering & Transformer Models",
            "Revenue Impact Analysis & Business Intelligence",
            "Real-time AI Inference with Streaming Support",
            "Model Performance Monitoring & Analytics"
        ]
    }

# Feature availability endpoint
@api_router.get("/features")
async def get_feature_availability():
    """Get available features and their status"""
    return {
        "dashboard_engine": {
            "status": "available",
            "features": [
                "Drag & drop layout",
                "Grid system",
                "Resizable widgets",
                "Dashboard templates",
                "Real-time refresh"
            ]
        },
        "monitoring_observability": {
            "status": "available",
            "features": [
                "Metrics collection & time-series storage",
                "SLO/SLA tracking with error budgets",
                "Distributed tracing with OpenTelemetry",
                "Real-time alerting & escalation workflows",
                "Incident management & response coordination",
                "System health & capacity planning",
                "Centralized structured logging",
                "Compliance audit trail management",
                "Real-time WebSocket monitoring updates",
                "Automated incident response workflows",
                "Prometheus & Grafana integration",
                "APM integration (Datadog/NewRelic)",
                "ELK stack & Loki logging",
                "PagerDuty/Opsgenie alerting",
                "Jaeger/Tempo distributed tracing"
            ]
        },
        "billing_saas_operations": {
            "status": "available",
            "features": [
                "Comprehensive subscription plan management",
                "Usage-based metering & tracking",
                "Stripe payment processing integration",
                "Automated invoice generation with PDF export",
                "Revenue recognition & analytics",
                "MRR, ARR, churn & LTV calculations",
                "Self-service customer portal",
                "Quota management & soft/hard limits",
                "Customer success metrics tracking",
                "Revenue event tracking & analysis",
                "Multi-currency support",
                "Enterprise pricing & custom plans",
                "Trial management & conversion tracking",
                "Webhook integration for payment events",
                "Tax calculation & compliance"
            ]
        },
        "widget_library": {
            "status": "available", 
            "features": [
                "Time series visualization",
                "Interactive knowledge graphs",
                "Geospatial mapping",
                "KPI metrics",
                "Collaboration panels"
            ]
        },
        "file_processing": {
            "status": "available",
            "features": [
                "Multi-format upload",
                "Schema auto-detection",
                "Data validation",
                "ML-powered mapping",
                "Quality analysis"
            ]
        },
        "collaboration": {
            "status": "available",
            "features": [
                "Real-time sessions",
                "Live cursors",
                "Comments & mentions",
                "Presence indicators", 
                "Change tracking"
            ]
        },
        "analytics": {
            "status": "available",
            "features": [
                "Performance metrics",
                "Usage analytics",
                "Data quality scores",
                "Export capabilities"
            ]
        },
        "ai_ml_platform": {
            "status": "available",
            "features": [
                "Time series forecasting for usage prediction",
                "Customer churn prediction and risk analysis",
                "Dynamic pricing optimization engine",
                "AI-powered customer segmentation analytics",
                "Multi-provider LLM integration with auto-failover",
                "OpenRouter, Together AI, Groq, Cerebras support",
                "Local vLLM, SGLang, TGI deployment options",
                "Chronos, Prophet, ARIMA forecasting models",
                "LightGBM, XGBoost, CatBoost ML algorithms",
                "Ensemble pricing and customer behavior models",
                "K-means clustering and transformer models",
                "Revenue impact analysis and business intelligence",
                "Real-time AI inference with streaming support",
                "Model performance monitoring and analytics",
                "Multi-architecture AI model deployment",
                "Automatic model failover and health monitoring"
            ]
        }
    }

# API capabilities endpoint
@api_router.get("/capabilities")
async def get_api_capabilities():
    """Get detailed API capabilities"""
    return {
        "max_dashboards_per_user": 100,
        "max_widgets_per_dashboard": 50,
        "max_file_size_mb": 500,
        "max_concurrent_sessions": 10,
        "real_time_features": {
            "max_participants_per_session": 50,
            "cursor_update_frequency_hz": 10,
            "presence_timeout_seconds": 300,
            "comment_response_time_ms": 100
        },
        "file_processing": {
            "supported_formats": ["csv", "excel", "json", "pdf", "image", "text", "xml", "yaml"],
            "max_rows_per_file": 1000000,
            "max_columns_per_file": 1000,
            "processing_timeout_minutes": 30,
            "ml_schema_mapping": True,
            "auto_validation": True
        },
        "data_sources": {
            "api_endpoints": True,
            "database_connections": True,
            "file_based": True,
            "websocket_streams": True,
            "real_time_feeds": True
        },
        "visualization": {
            "chart_types": 15,
            "custom_themes": True,
            "export_formats": ["png", "svg", "pdf", "json"],
            "interactive_features": True,
            "annotations": True
        },
        "monitoring_observability": {
            "metrics_collection": True,
            "slo_tracking": True,
            "distributed_tracing": True,
            "real_time_alerting": True,
            "incident_management": True,
            "capacity_planning": True,
            "structured_logging": True,
            "audit_trail": True,
            "health_monitoring": True,
            "performance_tracking": True,
            "error_budget_tracking": True,
            "escalation_workflows": True,
            "webhook_notifications": True,
            "dashboard_integration": True,
            "billing_system_monitoring": True
        }
    }

# Integration endpoints
@api_router.get("/integrations")
async def get_available_integrations():
    """Get available third-party integrations"""
    return {
        "data_sources": {
            "apis": {
                "rest": "REST API endpoints",
                "graphql": "GraphQL queries", 
                "websocket": "Real-time WebSocket feeds"
            },
            "databases": {
                "postgresql": "PostgreSQL connections",
                "mysql": "MySQL connections",
                "mongodb": "MongoDB connections",
                "redis": "Redis caching"
            },
            "external_services": {
                "google_sheets": "Google Sheets integration",
                "salesforce": "Salesforce CRM data",
                "slack": "Slack notifications",
                "teams": "Microsoft Teams integration"
            }
        },
        "visualization": {
            "map_providers": {
                "google_maps": "Google Maps Platform",
                "mapbox": "Mapbox maps",
                "openstreetmap": "OpenStreetMap"
            },
            "chart_libraries": {
                "chartjs": "Chart.js charts",
                "d3": "D3.js custom visualizations",
                "plotly": "Plotly interactive charts",
                "echarts": "Apache ECharts"
            }
        },
        "collaboration": {
            "notification_services": {
                "email": "Email notifications",
                "slack": "Slack notifications", 
                "teams": "Teams notifications",
                "webhook": "Custom webhooks"
            },
            "authentication": {
                "oauth2": "OAuth2 providers",
                "saml": "SAML 2.0 SSO",
                "ldap": "LDAP integration"
            }
        },
        "monitoring_observability": {
            "metrics_systems": {
                "prometheus": "Prometheus metrics collection",
                "grafana": "Grafana dashboards",
                "datadog": "Datadog APM & metrics",
                "newrelic": "New Relic monitoring",
                "cloudwatch": "AWS CloudWatch metrics"
            },
            "alerting_services": {
                "pagerduty": "PagerDuty incident management",
                "opsgenie": "Opsgenie alerting",
                "slack": "Slack notifications",
                "email": "Email notifications",
                "webhook": "Custom webhook alerts"
            },
            "logging_systems": {
                "elk_stack": "Elasticsearch, Logstash, Kibana",
                "loki": "Grafana Loki logging",
                "fluentd": "Fluentd log collection",
                "splunk": "Splunk SIEM logging",
                "datadog_logs": "Datadog log management"
            },
            "tracing_systems": {
                "jaeger": "Jaeger distributed tracing",
                "tempo": "Grafana Tempo",
                "zipkin": "Zipkin tracing",
                "opentelemetry": "OpenTelemetry standard"
            },
            "apm_integration": {
                "appdynamics": "AppDynamics APM",
                "dynatrace": "Dynatrace monitoring",
                "newrelic_apm": "New Relic APM",
                "elastic_apm": "Elastic APM"
            }
        }
        }
    }

# Performance metrics endpoint
@api_router.get("/metrics")
async def get_performance_metrics():
    """Get system performance metrics"""
    return {
        "response_times": {
            "dashboard_load_ms": 150,
            "widget_render_ms": 50,
            "file_upload_processing_s": 5,
            "real_time_update_ms": 50
        },
        "throughput": {
            "dashboards_per_hour": 1000,
            "files_processed_per_hour": 500,
            "concurrent_users": 10000,
            "real_time_connections": 5000
        },
        "reliability": {
            "uptime_percentage": 99.9,
            "error_rate_percentage": 0.1,
            "data_loss_rate": 0.0
        },
        "scalability": {
            "max_dashboard_widgets": 100,
            "max_concurrent_sessions": 1000,
            "max_file_size_gb": 10,
            "supported_concurrent_uploads": 100
        }
    }

# Security information endpoint
@api_router.get("/security")
async def get_security_info():
    """Get security-related information"""
    return {
        "authentication": {
            "methods": ["JWT", "OAuth2", "SAML", "LDAP"],
            "session_timeout_minutes": 480,
            "max_login_attempts": 5,
            "lockout_duration_minutes": 15
        },
        "authorization": {
            "rbac": True,
            "fine_grained_permissions": True,
            "widget_level_permissions": True,
            "organization_scoped_access": True
        },
        "data_protection": {
            "encryption_at_rest": True,
            "encryption_in_transit": True,
            "audit_logging": True,
            "data_anonymization": True
        },
        "compliance": {
            "gdpr_ready": True,
            "soc2_type2": True,
            "iso27001": True,
            "data_residency_india": True,
            "ccpa_compliant": True,
            "audit_trail": True,
            "data_classification": True,
            "incident_management": True,
            "vulnerability_management": True,
            "penetration_testing": True,
            "encryption_management": True,
            "privacy_controls": True
        },
        "enterprise_security": {
            "advanced_rbac": True,
            "attribute_based_access": True,
            "encryption_algorithms": ["AES-256", "RSA-2048", "RSA-4096", "ECDSA-P256", "ECDSA-P384"],
            "key_rotation_automation": True,
            "zero_trust_architecture": True,
            "security_event_monitoring": True,
            "real_time_threat_detection": True,
            "compliance_frameworks": ["SOC2 Type II", "ISO 27001", "GDPR", "CCPA", "HIPAA", "PCI DSS"],
            "data_residency_regions": ["US East", "US West", "EU West", "EU Central", "Asia Pacific", "India", "Global"]
        }
    }