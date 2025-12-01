"""
OptiBid Energy Platform - Configuration Settings
Centralized configuration management using Pydantic Settings
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    PROJECT_NAME: str = "OptiBid Energy Platform"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    ALLOWED_HOSTS: str = "http://localhost:3000,http://localhost:5173,https://app.optibid.io,https://dashboard.optibid.io"
    
    @property
    def allowed_hosts_list(self) -> List[str]:
        """Parse ALLOWED_HOSTS string into list"""
        if isinstance(self.ALLOWED_HOSTS, str):
            return [host.strip() for host in self.ALLOWED_HOSTS.split(",")]
        return self.ALLOWED_HOSTS
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://optibid:optibid123@localhost:5432/optibid_db"
    )
    
    # Redis (for caching and session management)
    REDIS_URL: str = os.getenv(
        "REDIS_URL",
        "redis://localhost:6379/0"
    )
    
    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Email (for notifications)
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST")
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = os.getenv("SMTP_USERNAME")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD")
    EMAIL_FROM: Optional[str] = os.getenv("EMAIL_FROM", "noreply@optibid.io")
    
    # File Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    
    # API Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # External API Keys
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    WEATHER_API_KEY: Optional[str] = os.getenv("WEATHER_API_KEY")
    MAPBOX_ACCESS_TOKEN: Optional[str] = os.getenv("MAPBOX_ACCESS_TOKEN")
    
    # Google Maps API
    GOOGLE_MAPS_API_KEY: Optional[str] = os.getenv("GOOGLE_MAPS_API_KEY")
    
    # MLflow Configuration
    MLFLOW_TRACKING_URI: str = os.getenv(
        "MLFLOW_TRACKING_URI",
        "http://localhost:5000"
    )
    MLFLOW_EXPERIMENT_NAME: str = os.getenv("MLFLOW_EXPERIMENT_NAME", "optibid_forecasting")
    
    # Advanced ML Models Configuration
    MODELS_DIR: str = os.getenv("MODELS_DIR", "./models")
    CLICKHOUSE_HOST: str = os.getenv("CLICKHOUSE_HOST", "localhost")
    CLICKHOUSE_PORT: int = int(os.getenv("CLICKHOUSE_PORT", "8123"))
    CLICKHOUSE_USER: str = os.getenv("CLICKHOUSE_USER", "default")
    CLICKHOUSE_PASSWORD: str = os.getenv("CLICKHOUSE_PASSWORD", "")
    CLICKHOUSE_DATABASE: str = os.getenv("CLICKHOUSE_DATABASE", "optibid_analytics")
    
    # ClickHouse URL (keep for backward compatibility)
    CLICKHOUSE_URL: str = os.getenv(
        "CLICKHOUSE_URL",
        f"http://{CLICKHOUSE_HOST}:{CLICKHOUSE_PORT}"
    )
    
    # Market Data Integration
    POSOCO_API_URL: str = os.getenv("POSOCO_API_URL", "https://prl.iposoco.in/api")
    SLDC_API_KEY: Optional[str] = os.getenv("SLDC_API_KEY")
    
    # ML/AI Configuration
    MODEL_STORAGE_PATH: str = os.getenv("MODEL_STORAGE_PATH", "./models")
    PREDICTION_CACHE_TTL: int = 300  # 5 minutes
    
    # Monitoring and Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    SENTRY_DSN: Optional[str] = os.getenv("SENTRY_DSN")
    
    # Kafka Configuration (for streaming)
    KAFKA_BOOTSTRAP_SERVERS: str = os.getenv(
        "KAFKA_BOOTSTRAP_SERVERS",
        "localhost:9092"
    )
    KAFKA_TOPIC_PREFIX: str = "optibid"
    
    # ClickHouse (for OLAP analytics)
    CLICKHOUSE_URL: str = os.getenv(
        "CLICKHOUSE_URL",
        "http://localhost:8123"
    )
    CLICKHOUSE_USER: str = os.getenv("CLICKHOUSE_USER", "default")
    CLICKHOUSE_PASSWORD: str = os.getenv("CLICKHOUSE_PASSWORD", "")
    CLICKHOUSE_DATABASE: str = os.getenv("CLICKHOUSE_DATABASE", "optibid_analytics")
    
    # Feature Store
    FEATURE_STORE_URL: str = os.getenv(
        "FEATURE_STORE_URL",
        "redis://localhost:6379/1"
    )
    
    # Monitoring
    PROMETHEUS_ENABLED: bool = os.getenv("PROMETHEUS_ENABLED", "false").lower() == "true"
    GRAFANA_ENABLED: bool = os.getenv("GRAFANA_ENABLED", "false").lower() == "true"
    
    # Compliance and Audit
    AUDIT_LOG_RETENTION_DAYS: int = 2555  # 7 years for compliance
    DATA_RETENTION_DAYS: int = 2555  # 7 years
    
    # Billing
    STRIPE_PUBLIC_KEY: Optional[str] = os.getenv("STRIPE_PUBLIC_KEY")
    STRIPE_SECRET_KEY: Optional[str] = os.getenv("STRIPE_SECRET_KEY")
    
    # Notification Services
    WEBHOOK_SECRET: str = os.getenv("WEBHOOK_SECRET", "your-webhook-secret")
    
    # Edge/OT Integration
    SCADA_ENDPOINT: Optional[str] = os.getenv("SCADA_ENDPOINT")
    RTU_ENDPOINT: Optional[str] = os.getenv("RTU_ENDPOINT")
    PMU_ENDPOINT: Optional[str] = os.getenv("PMU_ENDPOINT")
    
    # Phase 4: Enterprise Security & Compliance Configuration
    
    # Base URL for SSO callbacks
    BASE_URL: str = os.getenv("BASE_URL", "http://localhost:8000")
    
    # Azure Active Directory SSO
    AZURE_AD_CLIENT_ID: Optional[str] = os.getenv("AZURE_AD_CLIENT_ID")
    AZURE_AD_CLIENT_SECRET: Optional[str] = os.getenv("AZURE_AD_CLIENT_SECRET")
    AZURE_AD_TENANT_ID: Optional[str] = os.getenv("AZURE_AD_TENANT_ID")
    
    # Okta SSO
    OKTA_CLIENT_ID: Optional[str] = os.getenv("OKTA_CLIENT_ID")
    OKTA_CLIENT_SECRET: Optional[str] = os.getenv("OKTA_CLIENT_SECRET")
    OKTA_ISSUER: Optional[str] = os.getenv("OKTA_ISSUER")
    
    # Google Workspace SSO
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: Optional[str] = os.getenv("GOOGLE_CLIENT_SECRET")
    
    # SAML Enterprise SSO
    SAML_CERTIFICATE: Optional[str] = os.getenv("SAML_CERTIFICATE")
    SAML_PRIVATE_KEY: Optional[str] = os.getenv("SAML_PRIVATE_KEY")
    SAML_ENTITY_ID: Optional[str] = os.getenv("SAML_ENTITY_ID")
    
    # SMS Configuration (for MFA)
    TWILIO_ACCOUNT_SID: Optional[str] = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN: Optional[str] = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_PHONE_NUMBER: Optional[str] = os.getenv("TWILIO_PHONE_NUMBER")
    
    # AWS Backup Configuration
    AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_REGION: Optional[str] = os.getenv("AWS_REGION", "us-east-1")
    S3_BACKUP_BUCKET: Optional[str] = os.getenv("S3_BACKUP_BUCKET")
    S3_BACKUP_REPLICATION_BUCKET: Optional[str] = os.getenv("S3_BACKUP_REPLICATION_BUCKET")
    AWS_BACKUP_ROLE_ARN: Optional[str] = os.getenv("AWS_BACKUP_ROLE_ARN")
    
    # Multi-Factor Authentication Settings
    MFA_ISSUER_NAME: str = os.getenv("MFA_ISSUER_NAME", "OptiBid Energy")
    MFA_BACKUP_CODES_COUNT: int = int(os.getenv("MFA_BACKUP_CODES_COUNT", "10"))
    MFA_RATE_LIMIT_ATTEMPTS: int = int(os.getenv("MFA_RATE_LIMIT_ATTEMPTS", "5"))
    MFA_RATE_LIMIT_WINDOW_MINUTES: int = int(os.getenv("MFA_RATE_LIMIT_WINDOW_MINUTES", "15"))
    
    # Session Security
    SESSION_TIMEOUT_MINUTES: int = int(os.getenv("SESSION_TIMEOUT_MINUTES", "30"))
    MAX_CONCURRENT_SESSIONS: int = int(os.getenv("MAX_CONCURRENT_SESSIONS", "5"))
    TRUSTED_DEVICE_DAYS: int = int(os.getenv("TRUSTED_DEVICE_DAYS", "30"))
    
    # Disaster Recovery Settings
    DR_RTO_MINUTES: int = int(os.getenv("DR_RTO_MINUTES", "120"))  # Recovery Time Objective
    DR_RPO_MINUTES: int = int(os.getenv("DR_RPO_MINUTES", "60"))  # Recovery Point Objective
    BACKUP_RETENTION_DAYS: int = int(os.getenv("BACKUP_RETENTION_DAYS", "30"))
    CROSS_REGION_REPLICATION: bool = os.getenv("CROSS_REGION_REPLICATION", "true").lower() == "true"
    
    # Compliance and Audit Settings
    SOC2_COMPLIANCE: bool = os.getenv("SOC2_COMPLIANCE", "false").lower() == "true"
    GDPR_COMPLIANCE: bool = os.getenv("GDPR_COMPLIANCE", "false").lower() == "true"
    AUDIT_LOG_ENCRYPTED: bool = os.getenv("AUDIT_LOG_ENCRYPTED", "true").lower() == "true"
    
    # Security Headers
    SECURITY_HEADERS_ENABLED: bool = os.getenv("SECURITY_HEADERS_ENABLED", "true").lower() == "true"
    HSTS_MAX_AGE: int = int(os.getenv("HSTS_MAX_AGE", "31536000"))  # 1 year
    CSP_ENABLED: bool = os.getenv("CSP_ENABLED", "true").lower() == "true"
    
    # Phase 5: Admin Controls & Billing Configuration
    
    # Admin Panel Settings
    ADMIN_API_RATE_LIMIT_PER_HOUR: int = int(os.getenv("ADMIN_API_RATE_LIMIT_PER_HOUR", "10000"))
    ADMIN_SESSION_TIMEOUT_HOURS: int = int(os.getenv("ADMIN_SESSION_TIMEOUT_HOURS", "24"))
    ADMIN_MAX_USERS_PER_ORG: int = int(os.getenv("ADMIN_MAX_USERS_PER_ORG", "100"))
    ADMIN_REQUIRE_EMAIL_VERIFICATION: bool = os.getenv("ADMIN_REQUIRE_EMAIL_VERIFICATION", "true").lower() == "true"
    ADMIN_ALLOW_SELF_REGISTRATION: bool = os.getenv("ADMIN_ALLOW_SELF_REGISTRATION", "false").lower() == "true"
    ADMIN_ALLOWED_EMAIL_DOMAINS: List[str] = os.getenv("ADMIN_ALLOWED_EMAIL_DOMAINS", "").split(",") if os.getenv("ADMIN_ALLOWED_EMAIL_DOMAINS") else []
    
    # Feature Flags Configuration
    FEATURE_FLAGS_ENVIRONMENT: str = os.getenv("FEATURE_FLAGS_ENVIRONMENT", "production")
    FEATURE_FLAGS_ROLLOUT_PERCENTAGE: int = int(os.getenv("FEATURE_FLAGS_ROLLOUT_PERCENTAGE", "0"))
    FEATURE_FLAGS_CACHE_TTL: int = int(os.getenv("FEATURE_FLAGS_CACHE_TTL", "300"))  # 5 minutes
    
    # Billing Configuration
    STRIPE_WEBHOOK_SECRET: Optional[str] = os.getenv("STRIPE_WEBHOOK_SECRET")
    STRIPE_API_VERSION: str = os.getenv("STRIPE_API_VERSION", "2023-10-16")
    STRIPE_CONNECT_MODE: bool = os.getenv("STRIPE_CONNECT_MODE", "false").lower() == "true"
    
    # Razorpay Configuration (Alternative payment processor)
    RAZORPAY_KEY_ID: Optional[str] = os.getenv("RAZORPAY_KEY_ID")
    RAZORPAY_KEY_SECRET: Optional[str] = os.getenv("RAZORPAY_KEY_SECRET")
    RAZORPAY_WEBHOOK_SECRET: Optional[str] = os.getenv("RAZORPAY_WEBHOOK_SECRET")
    
    # Usage Tracking Configuration
    USAGE_TRACKING_ENABLED: bool = os.getenv("USAGE_TRACKING_ENABLED", "true").lower() == "true"
    USAGE_DATA_RETENTION_DAYS: int = int(os.getenv("USAGE_DATA_RETENTION_DAYS", "90"))
    USAGE_CACHE_TTL_SECONDS: int = int(os.getenv("USAGE_CACHE_TTL_SECONDS", "3600"))  # 1 hour
    USAGE_CLEANUP_INTERVAL_HOURS: int = int(os.getenv("USAGE_CLEANUP_INTERVAL_HOURS", "24"))
    
    # Rate Limiting Configuration
    RATE_LIMIT_ENABLED: bool = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
    RATE_LIMIT_STORAGE: str = os.getenv("RATE_LIMIT_STORAGE", "redis")  # redis or memory
    RATE_LIMIT_DEFAULT_LIMIT_PER_HOUR: int = int(os.getenv("RATE_LIMIT_DEFAULT_LIMIT_PER_HOUR", "1000"))
    RATE_LIMIT_DEFAULT_LIMIT_PER_DAY: int = int(os.getenv("RATE_LIMIT_DEFAULT_LIMIT_PER_DAY", "10000"))
    RATE_LIMIT_BURST_LIMIT: int = int(os.getenv("RATE_LIMIT_BURST_LIMIT", "100"))
    
    # Quota Management Configuration
    QUOTA_CHECK_ENABLED: bool = os.getenv("QUOTA_CHECK_ENABLED", "true").lower() == "true"
    QUOTA_WARNING_THRESHOLD: float = float(os.getenv("QUOTA_WARNING_THRESHOLD", "0.8"))  # 80%
    QUOTA_ENFORCEMENT_MODE: str = os.getenv("QUOTA_ENFORCEMENT_MODE", "soft")  # soft or hard
    
    # System Health Monitoring
    HEALTH_CHECK_INTERVAL_SECONDS: int = int(os.getenv("HEALTH_CHECK_INTERVAL_SECONDS", "60"))
    HEALTH_CHECK_TIMEOUT_SECONDS: int = int(os.getenv("HEALTH_CHECK_TIMEOUT_SECONDS", "30"))
    HEALTH_CHECK_RETENTION_DAYS: int = int(os.getenv("HEALTH_CHECK_RETENTION_DAYS", "30"))
    HEALTH_CHECK_ALERT_THRESHOLD: int = int(os.getenv("HEALTH_CHECK_ALERT_THRESHOLD", "3"))  # consecutive failures
    
    # Audit Logging Configuration
    AUDIT_LOG_ENABLED: bool = os.getenv("AUDIT_LOG_ENABLED", "true").lower() == "true"
    AUDIT_LOG_BATCH_SIZE: int = int(os.getenv("AUDIT_LOG_BATCH_SIZE", "100"))
    AUDIT_LOG_FLUSH_INTERVAL_SECONDS: int = int(os.getenv("AUDIT_LOG_FLUSH_INTERVAL_SECONDS", "60"))
    AUDIT_LOG_ENCRYPTION_KEY: Optional[str] = os.getenv("AUDIT_LOG_ENCRYPTION_KEY")
    
    # Background Task Processing
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/2")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/3")
    CELERY_TASK_SERIALIZER: str = os.getenv("CELERY_TASK_SERIALIZER", "json")
    CELERY_RESULT_SERIALIZER: str = os.getenv("CELERY_RESULT_SERIALIZER", "json")
    CELERY_ACCEPT_CONTENT: List[str] = ["json"]
    CELERY_TIMEZONE: str = os.getenv("CELERY_TIMEZONE", "UTC")
    CELERY_ENABLE_UTC: bool = True
    
    # Analytics and Reporting
    ANALYTICS_ENABLED: bool = os.getenv("ANALYTICS_ENABLED", "true").lower() == "true"
    ANALYTICS_DATA_RETENTION_DAYS: int = int(os.getenv("ANALYTICS_DATA_RETENTION_DAYS", "365"))
    ANALYTICS_CACHE_TTL_HOURS: int = int(os.getenv("ANALYTICS_CACHE_TTL_HOURS", "24"))
    
    # API Documentation Configuration
    API_DOCS_ENABLED: bool = os.getenv("API_DOCS_ENABLED", "true").lower() == "true"
    API_DOCS_URL: str = os.getenv("API_DOCS_URL", "/api/docs")
    REDOC_URL: str = os.getenv("REDOC_URL", "/api/redoc")
    OPENAPI_URL: str = os.getenv("OPENAPI_URL", "/api/openapi.json")
    
    # Organization Management
    ORG_NAME_MAX_LENGTH: int = int(os.getenv("ORG_NAME_MAX_LENGTH", "255"))
    ORG_DESCRIPTION_MAX_LENGTH: int = int(os.getenv("ORG_DESCRIPTION_MAX_LENGTH", "1000"))
    ORG_SETTINGS_CACHE_TTL: int = int(os.getenv("ORG_SETTINGS_CACHE_TTL", "1800"))  # 30 minutes
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

# Create settings instance
settings = Settings()

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return settings