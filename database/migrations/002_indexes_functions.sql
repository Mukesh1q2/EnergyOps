-- ===============================================
-- OptiBid Energy Platform - Migration 002
-- ===============================================
-- Indexes, functions, triggers, and views
-- Author: MiniMax Agent

-- Create indexes for performance
-- ===============================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Bid indexes
CREATE INDEX IF NOT EXISTS idx_bids_organization ON bids(organization_id);
CREATE INDEX IF NOT EXISTS idx_bids_market_operator ON bids(market_operator_id);
CREATE INDEX IF NOT EXISTS idx_bids_asset ON bids(asset_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_delivery_time ON bids(delivery_start, delivery_end);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at);

-- Market data indexes
CREATE INDEX IF NOT EXISTS idx_market_prices_operator_zone ON market_prices(market_operator_id, bid_zone_id);
CREATE INDEX IF NOT EXISTS idx_market_clearing_operator_zone ON market_clearing(market_operator_id, bid_zone_id);
CREATE INDEX IF NOT EXISTS idx_asset_meters_asset_time ON asset_meters(asset_id, time);

-- Dashboard indexes
CREATE INDEX IF NOT EXISTS idx_dashboards_organization ON dashboards(organization_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_type ON dashboards(dashboard_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_dashboard ON dashboard_widgets(dashboard_id);

-- ML indexes
CREATE INDEX IF NOT EXISTS idx_ml_models_organization ON ml_models(organization_id);
CREATE INDEX IF NOT EXISTS idx_ml_models_status ON ml_models(status);
CREATE INDEX IF NOT EXISTS idx_model_predictions_model_time ON model_predictions(model_id, target_time);

-- Audit indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Compliance indexes
CREATE INDEX IF NOT EXISTS idx_compliance_violations_rule ON compliance_violations(rule_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_entity ON compliance_violations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_resolved ON compliance_violations(is_resolved);

-- Usage indexes
CREATE INDEX IF NOT EXISTS idx_usage_metrics_organization_time ON usage_metrics(organization_id, time);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_metric ON usage_metrics(metric_name);

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
    USING (organization_id = current_setting('app.current_organization_id', true)::UUID);

CREATE POLICY sites_org_isolation ON sites
    USING (organization_id = current_setting('app.current_organization_id', true)::UUID);

CREATE POLICY assets_org_isolation ON assets
    USING (organization_id = current_setting('app.current_organization_id', true)::UUID);

CREATE POLICY bids_org_isolation ON bids
    USING (organization_id = current_setting('app.current_organization_id', true)::UUID);

CREATE POLICY datasets_org_isolation ON datasets
    USING (organization_id = current_setting('app.current_organization_id', true)::UUID);

CREATE POLICY ml_models_org_isolation ON ml_models
    USING (organization_id = current_setting('app.current_organization_id', true)::UUID);

CREATE POLICY dashboards_org_isolation ON dashboards
    USING (organization_id = current_setting('app.current_organization_id', true)::UUID);

CREATE POLICY audit_logs_org_isolation ON audit_logs
    USING (organization_id = current_setting('app.current_organization_id', true)::UUID);

CREATE POLICY legal_audit_trail_org_isolation ON legal_audit_trail
    USING (organization_id = current_setting('app.current_organization_id', true)::UUID);

CREATE POLICY compliance_rules_org_isolation ON compliance_rules
    USING (organization_id = current_setting('app.current_organization_id', true)::UUID);

CREATE POLICY usage_metrics_org_isolation ON usage_metrics
    USING (organization_id = current_setting('app.current_organization_id', true)::UUID);

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
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sites_updated_at ON sites;
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_market_operators_updated_at ON market_operators;
CREATE TRIGGER update_market_operators_updated_at BEFORE UPDATE ON market_operators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bids_updated_at ON bids;
CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_datasets_updated_at ON datasets;
CREATE TRIGGER update_datasets_updated_at BEFORE UPDATE ON datasets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ml_models_updated_at ON ml_models;
CREATE TRIGGER update_ml_models_updated_at BEFORE UPDATE ON ml_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dashboards_updated_at ON dashboards;
CREATE TRIGGER update_dashboards_updated_at BEFORE UPDATE ON dashboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dashboard_widgets_updated_at ON dashboard_widgets;
CREATE TRIGGER update_dashboard_widgets_updated_at BEFORE UPDATE ON dashboard_widgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_legal_audit_trail_updated_at ON legal_audit_trail;
CREATE TRIGGER update_legal_audit_trail_updated_at BEFORE UPDATE ON legal_audit_trail FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_compliance_rules_updated_at ON compliance_rules;
CREATE TRIGGER update_compliance_rules_updated_at BEFORE UPDATE ON compliance_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
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
DROP TRIGGER IF EXISTS audit_users ON users;
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_assets ON assets;
CREATE TRIGGER audit_assets AFTER INSERT OR UPDATE OR DELETE ON assets FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_bids ON bids;
CREATE TRIGGER audit_bids AFTER INSERT OR UPDATE OR DELETE ON bids FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_dashboards ON dashboards;
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
CREATE OR REPLACE VIEW active_organizations AS
SELECT * FROM organizations 
WHERE status = 'active' OR status = 'trial';

-- User summary
CREATE OR REPLACE VIEW user_summary AS
SELECT 
    u.*,
    o.name as organization_name,
    o.subscription_tier,
    o.status as organization_status
FROM users u
JOIN organizations o ON u.organization_id = o.id
WHERE u.deleted_at IS NULL;

-- Asset summary with site info
CREATE OR REPLACE VIEW asset_summary AS
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
CREATE OR REPLACE VIEW bid_performance_summary AS
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

-- ===============================================
-- HYPERTABLE CONVERSIONS
-- ===============================================

-- Convert time-series tables to hypertables
SELECT create_hypertable('market_prices', 'time', if_not_exists => TRUE);
SELECT create_hypertable('market_clearing', 'time', if_not_exists => TRUE);
SELECT create_hypertable('asset_meters', 'time', if_not_exists => TRUE);
SELECT create_hypertable('model_predictions', 'target_time', if_not_exists => TRUE);
SELECT create_hypertable('feature_store', 'valid_from', if_not_exists => TRUE);
SELECT create_hypertable('widget_data_cache', 'expires_at', if_not_exists => TRUE);
SELECT create_hypertable('audit_logs', 'created_at', if_not_exists => TRUE);
SELECT create_hypertable('usage_metrics', 'time', if_not_exists => TRUE);

-- ===============================================
-- SCHEDULED JOBS
-- ===============================================

-- Schedule cleanup jobs (every hour for sessions, daily for cache)
SELECT cron.schedule('cleanup-sessions', '0 * * * *', 'SELECT cleanup_expired_sessions();');
SELECT cron.schedule('cleanup-cache', '0 2 * * *', 'SELECT cleanup_expired_cache();');

-- ===============================================
-- PERFORMANCE OPTIMIZATION
-- ===============================================

-- Create materialized views for common analytics
DROP MATERIALIZED VIEW IF EXISTS daily_market_prices;
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_market_prices 
ON daily_market_prices (date, market_operator_id, bid_zone_id, market_type);

-- Refresh materialized view daily
SELECT cron.schedule('refresh-market-prices', '0 3 * * *', 'REFRESH MATERIALIZED VIEW daily_market_prices;');

-- ===============================================
-- COMMENTS
-- ===============================================

COMMENT ON SCHEMA public IS 'OptiBid Energy Platform Database Schema v1.0.0';
COMMENT ON TABLE organizations IS 'Organizations using the OptiBid platform';
COMMENT ON TABLE users IS 'Users within organizations';
COMMENT ON TABLE bids IS 'Energy bids submitted to market operators';
COMMENT ON TABLE market_prices IS 'Real-time and historical market price data';
COMMENT ON TABLE assets IS 'Energy assets (generators, loads, storage)';
COMMENT ON TABLE dashboards IS 'Customizable dashboard configurations';
COMMENT ON TABLE ml_models IS 'Machine learning models for forecasting and optimization';