-- ===============================================
-- OptiBid Energy Platform - Database Schema
-- ===============================================
-- PostgreSQL with PostGIS and TimescaleDB Extensions
-- Version: 1.0.0
-- Author: MiniMax Agent
-- Created: 2025-11-17

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "timescaledb";
-- CREATE EXTENSION IF NOT EXISTS "pg_cron"; -- Not available in timescaledb-ha image
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "hstore";

-- Create custom types
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
CREATE TYPE organization_status AS ENUM ('active', 'inactive', 'suspended', 'trial');
CREATE TYPE role_type AS ENUM ('admin', 'analyst', 'trader', 'viewer', 'customer_success');
CREATE TYPE bid_status AS ENUM ('draft', 'pending', 'submitted', 'accepted', 'rejected', 'expired', 'cancelled');
CREATE TYPE offer_type AS ENUM ('buy', 'sell');
CREATE TYPE asset_status AS ENUM ('online', 'offline', 'maintenance', 'fault');
CREATE TYPE market_type AS ENUM ('day_ahead', 'real_time', 'ancillary_services', 'capacity', 'renewable_energy');
CREATE TYPE dashboard_type AS ENUM ('trading', 'analytics', 'portfolio', 'compliance', 'custom');
CREATE TYPE widget_type AS ENUM ('chart', 'table', 'gauge', 'map', 'kpi', 'alert');
CREATE TYPE ml_model_status AS ENUM ('training', 'ready', 'deployed', 'failed', 'deprecated');
CREATE TYPE audit_action AS ENUM ('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import');

-- ===============================================
-- CORE TABLES
-- ===============================================

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    status organization_status NOT NULL DEFAULT 'trial',
    subscription_tier VARCHAR(50) DEFAULT 'trial',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    
    CONSTRAINT valid_subscription_expires CHECK (subscription_tier != 'trial' OR subscription_expires_at IS NULL)
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role role_type NOT NULL DEFAULT 'viewer',
    status user_status NOT NULL DEFAULT 'pending_verification',
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- User sessions for JWT refresh tokens
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Market operators and PX
CREATE TABLE market_operators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    region VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    contact_email VARCHAR(255),
    api_endpoint TEXT,
    sla_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sites/Locations
CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location GEOGRAPHY(POINT, 4326),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets (generators, loads, storage)
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) NOT NULL, -- solar, wind, thermal, load, storage
    capacity_mw DECIMAL(10,3) NOT NULL,
    status asset_status NOT NULL DEFAULT 'offline',
    commissioning_date DATE,
    decommissioning_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Market integration and bid zones
CREATE TABLE bid_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    market_operator_id UUID NOT NULL REFERENCES market_operators(id) ON DELETE CASCADE,
    zone_code VARCHAR(20) NOT NULL,
    zone_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset to bid zone mapping
CREATE TABLE asset_bid_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    bid_zone_id UUID NOT NULL REFERENCES bid_zones(id) ON DELETE CASCADE,
    capacity_share DECIMAL(5,4) DEFAULT 1.0000, -- percentage of asset capacity in this zone
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(asset_id, bid_zone_id)
);

-- ===============================================
-- BIDDING AND MARKET DATA
-- ===============================================

-- Bids and Offers
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    market_operator_id UUID NOT NULL REFERENCES market_operators(id) ON DELETE CASCADE,
    bid_zone_id UUID NOT NULL REFERENCES bid_zones(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    bid_number VARCHAR(100),
    status bid_status NOT NULL DEFAULT 'draft',
    offer_type offer_type NOT NULL,
    market_type market_type NOT NULL,
    delivery_start TIMESTAMP WITH TIME ZONE NOT NULL,
    delivery_end TIMESTAMP WITH TIME ZONE NOT NULL,
    quantity_mw DECIMAL(10,3) NOT NULL,
    price_rupees DECIMAL(10,4), -- INR per MW for Indian market
    currency VARCHAR(3) DEFAULT 'INR',
    submitted_at TIMESTAMP WITH TIME ZONE,
    response_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    
    CONSTRAINT valid_time_range CHECK (delivery_start < delivery_end),
    CONSTRAINT positive_quantity CHECK (quantity_mw > 0),
    CONSTRAINT non_negative_price CHECK (price_rupees >= 0)
);

-- Market price data (time-series)
CREATE TABLE market_prices (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    market_operator_id UUID NOT NULL REFERENCES market_operators(id) ON DELETE CASCADE,
    bid_zone_id UUID NOT NULL REFERENCES bid_zones(id) ON DELETE CASCADE,
    market_type market_type NOT NULL,
    price_rupees DECIMAL(10,4),
    volume_mwh DECIMAL(10,3),
    currency VARCHAR(3) DEFAULT 'INR',
    PRIMARY KEY (time, market_operator_id, bid_zone_id, market_type)
);

-- Convert to hypertable for TimescaleDB
SELECT create_hypertable('market_prices', 'time', if_not_exists => TRUE);

-- Market clearing results
CREATE TABLE market_clearing (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    market_operator_id UUID NOT NULL REFERENCES market_operators(id) ON DELETE CASCADE,
    bid_zone_id UUID NOT NULL REFERENCES bid_zones(id) ON DELETE CASCADE,
    market_type market_type NOT NULL,
    clearing_price_rupees DECIMAL(10,4),
    clearing_volume_mwh DECIMAL(10,3),
    currency VARCHAR(3) DEFAULT 'INR',
    PRIMARY KEY (time, market_operator_id, bid_zone_id, market_type)
);

SELECT create_hypertable('market_clearing', 'time', if_not_exists => TRUE);

-- Asset meter data (real-time)
CREATE TABLE asset_meters (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    active_power_mw DECIMAL(10,3),
    reactive_power_mvar DECIMAL(10,3),
    voltage_kv DECIMAL(8,3),
    frequency_hz DECIMAL(6,3),
    status VARCHAR(20) DEFAULT 'valid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (time, asset_id)
);

SELECT create_hypertable('asset_meters', 'time', if_not_exists => TRUE);

-- ===============================================
-- DATA MANAGEMENT
-- ===============================================

-- Datasets
CREATE TABLE datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    dataset_type VARCHAR(50) NOT NULL, -- historical, real_time, market, weather, forecast
    source VARCHAR(100), -- api, file, manual, stream
    frequency VARCHAR(20), -- 5min, 15min, hourly, daily
    schema JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    is_public BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'
);

-- Data ingestions
CREATE TABLE data_ingestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    ingestion_type VARCHAR(50) NOT NULL, -- scheduled, on_demand, webhook
    status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    records_processed INTEGER DEFAULT 0,
    error_message TEXT,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- ML/AI MODELS
-- ===============================================

-- ML Models
CREATE TABLE ml_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    model_type VARCHAR(50) NOT NULL, -- forecasting, optimization, anomaly_detection
    algorithm VARCHAR(100) NOT NULL, -- prophet, tensorflow, sklearn, etc.
    version VARCHAR(50) NOT NULL,
    status ml_model_status NOT NULL DEFAULT 'training',
    accuracy_metrics JSONB,
    hyper_parameters JSONB,
    training_data_period_start TIMESTAMP WITH TIME ZONE,
    training_data_period_end TIMESTAMP WITH TIME ZONE,
    model_file_path TEXT,
    model_size_mb DECIMAL(8,2),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Model predictions
CREATE TABLE model_predictions (
    id UUID DEFAULT uuid_generate_v4(),
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    prediction_type VARCHAR(50) NOT NULL, -- load_forecast, price_forecast, bid_optimization
    target_time TIMESTAMP WITH TIME ZONE NOT NULL,
    predicted_value DECIMAL(15,4),
    confidence_interval JSONB, -- {"lower": 100, "upper": 200, "confidence": 0.95}
    actual_value DECIMAL(15,4), -- populated later for validation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (target_time, model_id, prediction_type)
);

SELECT create_hypertable('model_predictions', 'target_time', if_not_exists => TRUE);

-- Feature store (for ML features)
CREATE TABLE feature_store (
    id UUID DEFAULT uuid_generate_v4(),
    feature_name VARCHAR(255) NOT NULL,
    feature_type VARCHAR(50) NOT NULL, -- numeric, categorical, text, vector
    entity_id UUID, -- can reference assets, organizations, etc.
    entity_type VARCHAR(50), -- asset, organization, market
    feature_value JSONB NOT NULL,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (valid_from, id)
);

SELECT create_hypertable('feature_store', 'valid_from', if_not_exists => TRUE);

-- ===============================================
-- DASHBOARDS AND VISUALIZATIONS
-- ===============================================

-- Dashboards
CREATE TABLE dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    dashboard_type dashboard_type NOT NULL DEFAULT 'custom',
    layout_config JSONB NOT NULL DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    is_template BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Dashboard widgets
CREATE TABLE dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    widget_type widget_type NOT NULL,
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    width INTEGER NOT NULL DEFAULT 6,
    height INTEGER NOT NULL DEFAULT 4,
    configuration JSONB NOT NULL DEFAULT '{}',
    data_source_id UUID REFERENCES datasets(id),
    refresh_interval INTEGER DEFAULT 300, -- seconds
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Widget data cache
CREATE TABLE widget_data_cache (
    id UUID DEFAULT uuid_generate_v4(),
    widget_id UUID NOT NULL REFERENCES dashboard_widgets(id) ON DELETE CASCADE,
    cache_key VARCHAR(500) NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (expires_at, widget_id, cache_key)
);

SELECT create_hypertable('widget_data_cache', 'expires_at', if_not_exists => TRUE);

-- ===============================================
-- COMPLIANCE AND AUDIT
-- ===============================================

-- Audit logs
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    action audit_action NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (created_at, id)
);

SELECT create_hypertable('audit_logs', 'created_at', if_not_exists => TRUE);

-- Legal audit trail (for compliance)
CREATE TABLE legal_audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(100) NOT NULL, -- bid, contract, user_agreement
    entity_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- created, modified, submitted, approved
    legal_status VARCHAR(50) NOT NULL, -- draft, under_review, approved, rejected
    legal_officer_id UUID REFERENCES users(id),
    legal_comments TEXT,
    supporting_documents JSONB DEFAULT '[]',
    effective_from TIMESTAMP WITH TIME ZONE,
    effective_to TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Compliance rules
CREATE TABLE compliance_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    rule_name VARCHAR(255) NOT NULL,
    rule_description TEXT,
    rule_type VARCHAR(50) NOT NULL, -- bidding_limit, market_timing, capacity_validation
    rule_config JSONB NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance violations
CREATE TABLE compliance_violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID NOT NULL REFERENCES compliance_rules(id) ON DELETE CASCADE,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    violation_message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- BILLING AND USAGE
-- ===============================================

-- Subscription plans
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    tier VARCHAR(50) NOT NULL UNIQUE,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    features JSONB NOT NULL DEFAULT '{}',
    limits JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE usage_metrics (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL, -- api_calls, storage_gb, dashboard_views, ml_predictions
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(20), -- count, bytes, seconds
    PRIMARY KEY (time, organization_id, metric_name)
);

SELECT create_hypertable('usage_metrics', 'time', if_not_exists => TRUE);

-- ===============================================
-- INDEXES FOR PERFORMANCE
-- ===============================================

-- User indexes
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);

-- Bid indexes
CREATE INDEX idx_bids_organization ON bids(organization_id);
CREATE INDEX idx_bids_market_operator ON bids(market_operator_id);
CREATE INDEX idx_bids_asset ON bids(asset_id);
CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_bids_delivery_time ON bids(delivery_start, delivery_end);
CREATE INDEX idx_bids_created_at ON bids(created_at);

-- Market data indexes
CREATE INDEX idx_market_prices_operator_zone ON market_prices(market_operator_id, bid_zone_id);
CREATE INDEX idx_market_clearing_operator_zone ON market_clearing(market_operator_id, bid_zone_id);
CREATE INDEX idx_asset_meters_asset_time ON asset_meters(asset_id, time);

-- Dashboard indexes
CREATE INDEX idx_dashboards_organization ON dashboards(organization_id);
CREATE INDEX idx_dashboards_type ON dashboards(dashboard_type);
CREATE INDEX idx_dashboard_widgets_dashboard ON dashboard_widgets(dashboard_id);

-- ML indexes
CREATE INDEX idx_ml_models_organization ON ml_models(organization_id);
CREATE INDEX idx_ml_models_status ON ml_models(status);
CREATE INDEX idx_model_predictions_model_time ON model_predictions(model_id, target_time);

-- Audit indexes
CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Compliance indexes
CREATE INDEX idx_compliance_violations_rule ON compliance_violations(rule_id);
CREATE INDEX idx_compliance_violations_entity ON compliance_violations(entity_type, entity_id);
CREATE INDEX idx_compliance_violations_resolved ON compliance_violations(is_resolved);

-- Usage indexes
CREATE INDEX idx_usage_metrics_organization_time ON usage_metrics(organization_id, time);
CREATE INDEX idx_usage_metrics_metric ON usage_metrics(metric_name);

-- ===============================================
-- ROW LEVEL SECURITY (RLS)
-- ===============================================

-- Enable RLS on multi-tenant tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for organization isolation
CREATE POLICY users_org_isolation ON users
    USING (organization_id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY sites_org_isolation ON sites
    USING (organization_id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY assets_org_isolation ON assets
    USING (organization_id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY bids_org_isolation ON bids
    USING (organization_id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY datasets_org_isolation ON datasets
    USING (organization_id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY ml_models_org_isolation ON ml_models
    USING (organization_id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY dashboards_org_isolation ON dashboards
    USING (organization_id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY audit_logs_org_isolation ON audit_logs
    USING (organization_id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY legal_audit_trail_org_isolation ON legal_audit_trail
    USING (organization_id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY compliance_rules_org_isolation ON compliance_rules
    USING (organization_id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY usage_metrics_org_isolation ON usage_metrics
    USING (organization_id = current_setting('app.current_organization_id')::UUID);

-- ===============================================
-- FUNCTIONS AND TRIGGERS
-- ===============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_market_operators_updated_at BEFORE UPDATE ON market_operators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_datasets_updated_at BEFORE UPDATE ON datasets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ml_models_updated_at BEFORE UPDATE ON ml_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboards_updated_at BEFORE UPDATE ON dashboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_widgets_updated_at BEFORE UPDATE ON dashboard_widgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_legal_audit_trail_updated_at BEFORE UPDATE ON legal_audit_trail FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_rules_updated_at BEFORE UPDATE ON compliance_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (
            organization_id, user_id, action, resource_type, resource_id, old_values
        )
        VALUES (
            COALESCE(OLD.organization_id, (SELECT organization_id FROM users WHERE id = current_setting('app.current_user_id', true)::UUID)),
            current_setting('app.current_user_id', true)::UUID,
            TG_OP::audit_action,
            TG_TABLE_NAME,
            OLD.id,
            row_to_json(OLD)
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (
            organization_id, user_id, action, resource_type, resource_id, old_values, new_values
        )
        VALUES (
            COALESCE(NEW.organization_id, OLD.organization_id),
            current_setting('app.current_user_id', true)::UUID,
            TG_OP::audit_action,
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(OLD),
            row_to_json(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (
            organization_id, user_id, action, resource_type, resource_id, new_values
        )
        VALUES (
            NEW.organization_id,
            current_setting('app.current_user_id', true)::UUID,
            TG_OP::audit_action,
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(NEW)
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Audit triggers for critical tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_assets AFTER INSERT OR UPDATE OR DELETE ON assets FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_bids AFTER INSERT OR UPDATE OR DELETE ON bids FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_dashboards AFTER INSERT OR UPDATE OR DELETE ON dashboards FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Function to create organization with default admin user
CREATE OR REPLACE FUNCTION create_organization_with_admin(
    org_name VARCHAR,
    admin_email VARCHAR,
    admin_password_hash VARCHAR,
    admin_first_name VARCHAR,
    admin_last_name VARCHAR
)
RETURNS UUID AS $$
DECLARE
    org_id UUID;
    admin_id UUID;
BEGIN
    -- Create organization
    INSERT INTO organizations (name, slug) 
    VALUES (org_name, lower(regexp_replace(org_name, '[^a-zA-Z0-9]', '-', 'g')))
    RETURNING id INTO org_id;
    
    -- Create admin user
    INSERT INTO users (
        organization_id, email, password_hash, first_name, last_name, 
        role, status, email_verified
    )
    VALUES (
        org_id, admin_email, admin_password_hash, admin_first_name, 
        admin_last_name, 'admin', 'active', true
    )
    RETURNING id INTO admin_id;
    
    -- Grant admin all permissions
    -- (In real implementation, you'd create a permissions system)
    
    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================
-- VIEWS FOR COMMON QUERIES
-- ===============================================

-- Active organizations
CREATE VIEW active_organizations AS
SELECT * FROM organizations 
WHERE status = 'active' OR status = 'trial';

-- User summary
CREATE VIEW user_summary AS
SELECT 
    u.*,
    o.name as organization_name,
    o.subscription_tier,
    o.status as organization_status
FROM users u
JOIN organizations o ON u.organization_id = o.id
WHERE u.deleted_at IS NULL;

-- Asset summary with site info
CREATE VIEW asset_summary AS
SELECT 
    a.*,
    s.name as site_name,
    s.city,
    s.state,
    s.country,
    s.timezone,
    o.name as organization_name
FROM assets a
JOIN sites s ON a.site_id = s.id
JOIN organizations o ON a.organization_id = o.id;

-- Bid performance summary
CREATE VIEW bid_performance_summary AS
SELECT 
    b.*,
    a.name as asset_name,
    s.name as site_name,
    mo.name as market_operator_name,
    bz.zone_name,
    CASE 
        WHEN b.status = 'accepted' THEN b.quantity_mw
        ELSE 0
    END as accepted_quantity_mw,
    CASE 
        WHEN b.status = 'accepted' AND b.price_rupees IS NOT NULL 
        THEN b.quantity_mw * b.price_rupees
        ELSE 0
    END as revenue_rupees
FROM bids b
LEFT JOIN assets a ON b.asset_id = a.id
LEFT JOIN sites s ON a.site_id = s.id
LEFT JOIN market_operators mo ON b.market_operator_id = mo.id
LEFT JOIN bid_zones bz ON b.bid_zone_id = bz.id;

-- ===============================================
-- SAMPLE DATA AND INITIALIZATION
-- ===============================================

-- Insert default subscription plans
INSERT INTO subscription_plans (name, tier, price_monthly, price_yearly, features, limits) VALUES
('Trial', 'trial', 0, 0, 
 '{"api_calls": "unlimited", "dashboards": 3, "storage_gb": 5, "support": "community"}',
 '{"max_users": 5, "max_assets": 10, "data_retention_days": 30}'
),
('Basic', 'basic', 999, 9999,
 '{"api_calls": "unlimited", "dashboards": 10, "storage_gb": 100, "support": "email"}',
 '{"max_users": 25, "max_assets": 100, "data_retention_days": 365}'
),
('Professional', 'professional', 2999, 29999,
 '{"api_calls": "unlimited", "dashboards": 50, "storage_gb": 500, "support": "priority"}',
 '{"max_users": 100, "max_assets": 500, "data_retention_days": 1825}'
),
('Enterprise', 'enterprise', 9999, 99999,
 '{"api_calls": "unlimited", "dashboards": "unlimited", "storage_gb": "unlimited", "support": "dedicated"}',
 '{"max_users": "unlimited", "max_assets": "unlimited", "data_retention_days": "unlimited"}'
);

-- Insert sample market operators
INSERT INTO market_operators (name, code, region, country, timezone, contact_email) VALUES
-- US Markets (Phase 7 - Real-time integration)
('PJM Interconnection', 'PJM', 'Northeast/Midwest US', 'United States', 'America/New_York', 'support@pjm.com'),
('California Independent System Operator', 'CAISO', 'California', 'United States', 'America/Los_Angeles', 'help@caiso.com'),
('Electric Reliability Council of Texas', 'ERCOT', 'Texas', 'United States', 'America/Chicago', 'info@ercot.com'),
-- Indian Markets (Original)
('Power System Operation Corporation Limited', 'POSOCO', 'All India', 'India', 'Asia/Kolkata', 'contact@posoco.in'),
('Northern Regional Load Despatch Centre', 'NRLDC', 'Northern Region', 'India', 'Asia/Kolkata', 'nldc@posoco.in'),
('Western Regional Load Despatch Centre', 'WRLDC', 'Western Region', 'India', 'Asia/Kolkata', 'wldc@posoco.in'),
('Southern Regional Load Despatch Centre', 'SRLDC', 'Southern Region', 'India', 'Asia/Kolkata', 'sldc@posoco.in'),
('Eastern Regional Load Despatch Centre', 'ERLDC', 'Eastern Region', 'India', 'Asia/Kolkata', 'eldc@posoco.in'),
('North Eastern Regional Load Despatch Centre', 'NERLDC', 'North Eastern Region', 'India', 'Asia/Kolkata', 'neldc@posoco.in');

-- Insert sample bid zones for US markets (Phase 7)
INSERT INTO bid_zones (market_operator_id, zone_code, zone_name)
-- PJM zones
SELECT id, 'COMED', 'ComEd (Chicago)' FROM market_operators WHERE code = 'PJM'
UNION ALL
SELECT id, 'ATLANTIC', 'Atlantic' FROM market_operators WHERE code = 'PJM'
UNION ALL
SELECT id, 'BGE', 'Baltimore Gas & Electric' FROM market_operators WHERE code = 'PJM'
UNION ALL
SELECT id, 'DOMINION', 'Dominion Virginia Power' FROM market_operators WHERE code = 'PJM'
UNION ALL
SELECT id, 'PECO', 'PECO Energy' FROM market_operators WHERE code = 'PJM'
UNION ALL
SELECT id, 'PPL', 'PPL Electric Utilities' FROM market_operators WHERE code = 'PJM'
UNION ALL
SELECT id, 'PSE_G', 'Public Service Electric & Gas' FROM market_operators WHERE code = 'PJM'

-- CAISO zones  
UNION ALL
SELECT id, 'HUB', 'CAISO Hub' FROM market_operators WHERE code = 'CAISO'
UNION ALL
SELECT id, 'NP15', 'Northern California 115kV' FROM market_operators WHERE code = 'CAISO'
UNION ALL
SELECT id, 'SP15', 'Southern California 115kV' FROM market_operators WHERE code = 'CAISO'
UNION ALL
SELECT id, 'ZP26', 'San Diego 230kV' FROM market_operators WHERE code = 'CAISO'

-- ERCOT zones
UNION ALL
SELECT id, 'HOUSTON', 'Houston' FROM market_operators WHERE code = 'ERCOT'
UNION ALL
SELECT id, 'NORTH', 'North' FROM market_operators WHERE code = 'ERCOT'
UNION ALL
SELECT id, 'SOUTH', 'South' FROM market_operators WHERE code = 'ERCOT'
UNION ALL
SELECT id, 'WEST', 'West' FROM market_operators WHERE code = 'ERCOT'
UNION ALL
SELECT id, 'COAST', 'Coastal' FROM market_operators WHERE code = 'ERCOT'

-- Indian zones
UNION ALL
SELECT id, 'NR', 'Northern Region' FROM market_operators WHERE code = 'NRLDC'
UNION ALL
SELECT id, 'WR', 'Western Region' FROM market_operators WHERE code = 'WRLDC'
UNION ALL
SELECT id, 'SR', 'Southern Region' FROM market_operators WHERE code = 'SRLDC'
UNION ALL
SELECT id, 'ER', 'Eastern Region' FROM market_operators WHERE code = 'ERLDC'
UNION ALL
SELECT id, 'NER', 'North Eastern Region' FROM market_operators WHERE code = 'NERLDC';

-- ===============================================
-- CLEANUP AND MAINTENANCE
-- ===============================================

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired cache
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM widget_data_cache 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup jobs (every hour for sessions, daily for cache)
-- Note: pg_cron not available in timescaledb-ha image. Use external cron or application scheduler instead.
-- SELECT cron.schedule('cleanup-sessions', '0 * * * *', 'SELECT cleanup_expired_sessions();');
-- SELECT cron.schedule('cleanup-cache', '0 2 * * *', 'SELECT cleanup_expired_cache();');

-- ===============================================
-- REAL-TIME MARKET DATA TABLES (Phase 7)
-- ===============================================

-- Real-time market price data for PJM, CAISO, ERCOT
CREATE TABLE market_data (
    id UUID DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    market_zone VARCHAR(10) NOT NULL, -- 'PJM', 'CAISO', 'ERCOT'
    price_type VARCHAR(20) NOT NULL, -- 'RT_LMP', 'DA_LMP', 'MCP'
    location VARCHAR(100) NOT NULL, -- specific location/node
    price DECIMAL(10,4) NOT NULL,
    volume DECIMAL(10,3) NOT NULL DEFAULT 0.0,
    congestion_cost DECIMAL(10,4),
    loss_cost DECIMAL(10,4),
    renewable_percentage DECIMAL(5,2),
    load_forecast DECIMAL(10,3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    PRIMARY KEY (timestamp, id)
);

-- Convert to hypertable for TimescaleDB
SELECT create_hypertable('market_data', 'timestamp', if_not_exists => TRUE);

-- Market metrics table for aggregated data
CREATE TABLE market_metrics (
    id UUID DEFAULT uuid_generate_v4(),
    market_zone VARCHAR(10) NOT NULL,
    calculation_time TIMESTAMP WITH TIME ZONE NOT NULL,
    avg_price DECIMAL(10,4) NOT NULL,
    max_price DECIMAL(10,4) NOT NULL,
    min_price DECIMAL(10,4) NOT NULL,
    price_volatility DECIMAL(10,4) NOT NULL,
    total_volume DECIMAL(12,3) NOT NULL,
    renewable_percentage DECIMAL(5,2),
    data_points INTEGER NOT NULL,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (calculation_time, id)
);

SELECT create_hypertable('market_metrics', 'calculation_time', if_not_exists => TRUE);

-- Data quality monitoring
CREATE TABLE market_data_quality (
    id UUID DEFAULT uuid_generate_v4(),
    market_zone VARCHAR(10) NOT NULL,
    check_time TIMESTAMP WITH TIME ZONE NOT NULL,
    completeness_percent DECIMAL(5,2),
    anomaly_count INTEGER,
    data_freshness_minutes INTEGER,
    status VARCHAR(20) DEFAULT 'healthy', -- 'healthy', 'warning', 'error'
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (check_time, id)
);

SELECT create_hypertable('market_data_quality', 'check_time', if_not_exists => TRUE);

-- Market data ingestion logs
CREATE TABLE market_data_ingestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    market_zone VARCHAR(10) NOT NULL,
    ingestion_type VARCHAR(50) NOT NULL, -- 'realtime', 'historical', 'backfill'
    status VARCHAR(20) DEFAULT 'running', -- 'running', 'completed', 'failed'
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    records_processed INTEGER DEFAULT 0,
    error_message TEXT,
    source_details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for real-time market data performance
CREATE INDEX idx_market_data_timestamp ON market_data(timestamp);
CREATE INDEX idx_market_data_zone ON market_data(market_zone);
CREATE INDEX idx_market_data_zone_time ON market_data(market_zone, timestamp);
CREATE INDEX idx_market_data_location ON market_data(location);
CREATE INDEX idx_market_data_price_type ON market_data(price_type);

CREATE INDEX idx_market_metrics_zone ON market_metrics(market_zone);
CREATE INDEX idx_market_metrics_time ON market_metrics(calculation_time);

CREATE INDEX idx_market_data_quality_zone ON market_data_quality(market_zone);
CREATE INDEX idx_market_data_quality_time ON market_data_quality(check_time);

CREATE INDEX idx_market_data_ingestions_zone ON market_data_ingestions(market_zone);
CREATE INDEX idx_market_data_ingestions_status ON market_data_ingestions(status);

-- ===============================================
-- PERFORMANCE OPTIMIZATION
-- ===============================================

-- Create materialized views for common analytics
CREATE MATERIALIZED VIEW daily_market_prices AS
SELECT 
    date_trunc('day', time) as date,
    market_operator_id,
    bid_zone_id,
    market_type,
    AVG(price_rupees) as avg_price,
    MIN(price_rupees) as min_price,
    MAX(price_rupees) as max_price,
    AVG(volume_mwh) as avg_volume
FROM market_prices
GROUP BY date_trunc('day', time), market_operator_id, bid_zone_id, market_type;

CREATE UNIQUE INDEX ON daily_market_prices (date, market_operator_id, bid_zone_id, market_type);

-- Refresh materialized view daily
-- Note: pg_cron not available. Use external cron or application scheduler instead.
-- SELECT cron.schedule('refresh-market-prices', '0 3 * * *', 'REFRESH MATERIALIZED VIEW daily_market_prices;');

-- Real-time market data materialized view
CREATE MATERIALIZED VIEW hourly_market_data_stats AS
SELECT 
    date_trunc('hour', timestamp) as hour,
    market_zone,
    COUNT(*) as record_count,
    AVG(price) as avg_price,
    MIN(price) as min_price,
    MAX(price) as max_price,
    AVG(volume) as avg_volume,
    AVG(renewable_percentage) as avg_renewable_pct
FROM market_data
GROUP BY date_trunc('hour', timestamp), market_zone;

CREATE INDEX ON hourly_market_data_stats (hour, market_zone);

-- Refresh hourly market data stats
-- Note: pg_cron not available. Use external cron or application scheduler instead.
-- SELECT cron.schedule('refresh-market-data-stats', '5 * * * *', 'REFRESH MATERIALIZED VIEW hourly_market_data_stats;');

COMMENT ON SCHEMA public IS 'OptiBid Energy Platform Database Schema v1.0.0';