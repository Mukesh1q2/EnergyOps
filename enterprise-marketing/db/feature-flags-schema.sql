-- =============================================================================
-- FEATURE FLAGS DATABASE SCHEMA
-- =============================================================================
-- Complete database schema for enterprise feature flag system
-- Supports organization-level customization, user preferences, and templates

-- Create feature_definitions table (master feature registry)
CREATE TABLE feature_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- dashboard_core, visualization, ai_ml, etc.
    is_active BOOLEAN DEFAULT true,
    default_enabled BOOLEAN DEFAULT false,
    dependencies TEXT[], -- Array of feature IDs this feature depends on
    conflicts TEXT[], -- Array of feature IDs this feature conflicts with
    tiers TEXT[] DEFAULT ARRAY['starter', 'professional', 'enterprise'], -- Available subscription tiers
    
    -- Metadata for feature capabilities
    metadata JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(name),
    CONSTRAINT valid_category CHECK (category IN (
        'dashboard_core', 'visualization', 'analytics', 'ai_ml', 'collaboration', 
        'energy_specific', 'financial', 'geographic', 'compliance', 'mobile', 
        'api_integration', 'security', 'admin'
    )),
    CONSTRAINT valid_tiers CHECK (array_length(tiers, 1) > 0)
);

-- Create organization_feature_settings table (per-organization feature config)
CREATE TABLE organization_feature_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES feature_definitions(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT false,
    configuration JSONB DEFAULT '{}', -- Feature-specific configuration
    
    -- Advanced restrictions (optional)
    tier_restrictions TEXT[], -- Restrict feature to specific tiers
    user_restrictions TEXT[], -- Restrict feature to specific user roles
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    -- Constraints
    UNIQUE(organization_id, feature_id)
);

-- Create user_dashboard_preferences table (per-user widget preferences)
CREATE TABLE user_dashboard_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    widget_id VARCHAR(255) NOT NULL, -- Specific widget identifier
    
    -- Widget positioning and visibility
    is_visible BOOLEAN DEFAULT true,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    size_w INTEGER DEFAULT 4, -- Grid width
    size_h INTEGER DEFAULT 4, -- Grid height
    
    -- Custom settings per widget
    custom_settings JSONB DEFAULT '{}',
    
    -- User preferences
    is_favorite BOOLEAN DEFAULT false,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usage_count INTEGER DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, organization_id, widget_id),
    CONSTRAINT valid_dimensions CHECK (
        position_x >= 0 AND position_y >= 0 AND 
        size_w > 0 AND size_h > 0 AND 
        position_x + size_w <= 12 AND -- Max dashboard width
        size_h <= 20 -- Max widget height
    )
);

-- Create feature_templates table (pre-configured feature combinations)
CREATE TABLE feature_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- trading, operations, renewable, analysis, mobile
    
    -- Template definition (JSON of feature settings)
    template_data JSONB NOT NULL, -- { feature_id: { enabled: boolean, config: {...} } }
    
    -- Template metadata
    target_audience TEXT[], -- energy_traders, grid_operators, etc.
    use_cases TEXT[], -- day_ahead_trading, grid_monitoring, etc.
    popularity_score INTEGER DEFAULT 0,
    
    -- Template lifecycle
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true, -- Available to all organizations
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    -- Constraints
    UNIQUE(name),
    CONSTRAINT valid_audience CHECK (array_length(target_audience, 1) > 0),
    CONSTRAINT valid_usecases CHECK (array_length(use_cases, 1) > 0)
);

-- Create feature_change_logs table (audit trail for all feature changes)
CREATE TABLE feature_change_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES feature_definitions(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- enabled, disabled, configured, template_applied
    
    -- Change details
    old_value JSONB,
    new_value JSONB,
    change_reason TEXT,
    
    -- Audit fields
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changed_by UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    
    -- Constraints
    CONSTRAINT valid_action CHECK (action IN (
        'enabled', 'disabled', 'configured', 'template_applied', 'bulk_updated'
    ))
);

-- Create template_application_logs table (audit trail for template applications)
CREATE TABLE template_application_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES feature_templates(id) ON DELETE CASCADE,
    
    -- Application details
    features_changed INTEGER DEFAULT 0,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    
    -- Audit fields
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied_by UUID REFERENCES users(id),
    
    -- Constraints
    CONSTRAINT valid_features_changed CHECK (features_changed >= 0)
);

-- Create widget_library table (manages available widgets and their feature requirements)
CREATE TABLE widget_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    widget_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Widget categorization
    category VARCHAR(100) NOT NULL,
    icon VARCHAR(100), -- Icon identifier
    preview_type VARCHAR(50), -- chart-line, grid, map, etc.
    
    -- Feature requirements
    required_features TEXT[], -- Features that must be enabled for this widget
    optional_features TEXT[], -- Features that enhance this widget
    
    -- Widget configuration schema
    config_schema JSONB DEFAULT '{}', -- Configuration options and validations
    
    -- Widget metadata
    permissions TEXT[], -- Required user permissions
    tags TEXT[],
    popularity_score INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(widget_id),
    CONSTRAINT valid_category CHECK (category IN (
        'analytics', 'metrics', 'real-time', 'geographic', 'financial', 
        'team', 'reports', 'energy', 'trading', 'collaboration'
    ))
);

-- Create user_feature_usage table (tracks feature usage for analytics)
CREATE TABLE user_feature_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES feature_definitions(id) ON DELETE CASCADE,
    
    -- Usage tracking
    first_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usage_count INTEGER DEFAULT 1,
    
    -- Optional session context
    session_id VARCHAR(255),
    page_context VARCHAR(255), -- Which page/section was used
    
    -- Constraints
    UNIQUE(user_id, organization_id, feature_id, session_id)
);

-- Create indexes for performance
CREATE INDEX idx_org_feature_settings_org_id ON organization_feature_settings(organization_id);
CREATE INDEX idx_org_feature_settings_feature_id ON organization_feature_settings(feature_id);
CREATE INDEX idx_user_dashboard_preferences_user_org ON user_dashboard_preferences(user_id, organization_id);
CREATE INDEX idx_feature_change_logs_org_feature ON feature_change_logs(organization_id, feature_id);
CREATE INDEX idx_feature_change_logs_changed_at ON feature_change_logs(changed_at);
CREATE INDEX idx_user_feature_usage_user_org ON user_feature_usage(user_id, organization_id);
CREATE INDEX idx_widget_library_category ON widget_library(category);
CREATE INDEX idx_widget_library_active ON widget_library(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_feature_definitions_updated_at BEFORE UPDATE ON feature_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_feature_settings_updated_at BEFORE UPDATE ON organization_feature_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_dashboard_preferences_updated_at BEFORE UPDATE ON user_dashboard_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_templates_updated_at BEFORE UPDATE ON feature_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_widget_library_updated_at BEFORE UPDATE ON widget_library
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to validate feature dependencies
CREATE OR REPLACE FUNCTION validate_feature_dependencies(
    org_id UUID,
    feature_id UUID,
    enabled BOOLEAN
) RETURNS BOOLEAN AS $$
DECLARE
    deps TEXT[];
    dep_feature RECORD;
    dep_enabled BOOLEAN;
BEGIN
    -- Get feature dependencies
    SELECT dependencies INTO deps
    FROM feature_definitions
    WHERE id = feature_id;
    
    -- If no dependencies or disabling, always valid
    IF deps IS NULL OR array_length(deps, 1) = 0 OR NOT enabled THEN
        RETURN TRUE;
    END IF;
    
    -- Check each dependency
    FOREACH dep_id IN ARRAY deps LOOP
        SELECT is_enabled INTO dep_enabled
        FROM organization_feature_settings
        WHERE organization_id = org_id AND feature_id = dep_id::UUID;
        
        -- If any dependency is not enabled, validation fails
        IF dep_enabled IS NULL OR NOT dep_enabled THEN
            RETURN FALSE;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate feature conflicts
CREATE OR REPLACE FUNCTION validate_feature_conflicts(
    org_id UUID,
    feature_id UUID,
    enabled BOOLEAN
) RETURNS BOOLEAN AS $$
DECLARE
    conflicts TEXT[];
    conflict_enabled BOOLEAN;
BEGIN
    -- Get feature conflicts
    SELECT conflicts INTO conflicts
    FROM feature_definitions
    WHERE id = feature_id;
    
    -- If no conflicts or disabling, always valid
    IF conflicts IS NULL OR array_length(conflicts, 1) = 0 OR NOT enabled THEN
        RETURN TRUE;
    END IF;
    
    -- Check each conflict
    FOREACH conflict_id IN ARRAY conflicts LOOP
        SELECT is_enabled INTO conflict_enabled
        FROM organization_feature_settings
        WHERE organization_id = org_id AND feature_id = conflict_id::UUID;
        
        -- If any conflicting feature is enabled, validation fails
        IF conflict_enabled IS NOT NULL AND conflict_enabled THEN
            RETURN FALSE;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create comprehensive feature validation function
CREATE OR REPLACE FUNCTION validate_feature_change(
    org_id UUID,
    feature_id UUID,
    enabled BOOLEAN
) RETURNS JSON AS $$
DECLARE
    validation_result JSON;
    deps_valid BOOLEAN;
    conflicts_valid BOOLEAN;
    errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Validate dependencies
    SELECT validate_feature_dependencies(org_id, feature_id, enabled) INTO deps_valid;
    IF NOT deps_valid THEN
        errors := array_append(errors, 'Required dependencies are not enabled');
    END IF;
    
    -- Validate conflicts
    SELECT validate_feature_conflicts(org_id, feature_id, enabled) INTO conflicts_valid;
    IF NOT conflicts_valid THEN
        errors := array_append(errors, 'Conflicts with enabled features');
    END IF;
    
    -- Build result
    SELECT json_build_object(
        'valid', array_length(errors, 1) = 0,
        'errors', errors,
        'dependencies_valid', deps_valid,
        'conflicts_valid', conflicts_valid
    ) INTO validation_result;
    
    RETURN validation_result;
END;
$$ LANGUAGE plpgsql;

-- Insert default feature definitions from the catalog
-- (This would normally be done programmatically, but we'll include a sample)
INSERT INTO feature_definitions (
    id, name, description, category, is_active, default_enabled, 
    dependencies, conflicts, tiers, metadata
) VALUES 
(
    gen_random_uuid(),
    'dashboard-core',
    'Basic dashboard functionality with drag & drop, grid layouts, and widget management',
    'dashboard_core',
    true,
    true,
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    ARRAY['starter', 'professional', 'enterprise'],
    '{"complexity": "simple", "cost_impact": "low", "performance_impact": "low"}'
),
(
    gen_random_uuid(),
    'real-time-updates',
    'Live data streaming and automatic dashboard refresh',
    'dashboard_core',
    true,
    true,
    ARRAY['dashboard-core'],
    ARRAY[]::TEXT[],
    ARRAY['professional', 'enterprise'],
    '{"complexity": "moderate", "cost_impact": "medium", "performance_impact": "medium"}'
),
(
    gen_random_uuid(),
    'india-energy',
    'Comprehensive India energy market data and analytics',
    'energy_specific',
    true,
    true,
    ARRAY['dashboard-core'],
    ARRAY[]::TEXT[],
    ARRAY['starter', 'professional', 'enterprise'],
    '{"complexity": "moderate", "cost_impact": "low", "performance_impact": "medium"}'
),
(
    gen_random_uuid(),
    'knowledge-graphs',
    'Interactive node/edge graphs with force-directed layout',
    'ai_ml',
    true,
    true,
    ARRAY['dashboard-core'],
    ARRAY[]::TEXT[],
    ARRAY['professional', 'enterprise'],
    '{"complexity": "complex", "cost_impact": "medium", "performance_impact": "medium"}'
),
(
    gen_random_uuid(),
    'llm-assistant',
    'Natural language query interface for data exploration',
    'ai_ml',
    true,
    false,
    ARRAY['dashboard-core', 'ai-insights'],
    ARRAY[]::TEXT[],
    ARRAY['enterprise'],
    '{"complexity": "complex", "cost_impact": "high", "performance_impact": "high"}'
)
ON CONFLICT (name) DO NOTHING;

-- Insert default widget library entries
INSERT INTO widget_library (
    widget_id, name, description, category, icon, preview_type,
    required_features, config_schema, permissions, tags
) VALUES
(
    'energy-generation-chart',
    'Energy Generation Chart',
    'Time-series charts for energy generation tracking',
    'energy',
    'BoltIcon',
    'chart-line',
    ARRAY['dashboard-core'],
    '{"dataSource": {"type": "select", "options": ["solar", "wind", "hydro", "all"]}}',
    ARRAY['view-energy-data'],
    ARRAY['energy', 'generation', 'renewable']
),
(
    'market-prices-widget',
    'Market Prices Tracker',
    'Real-time electricity market prices with trend analysis',
    'financial',
    'CurrencyDollarIcon',
    'chart-area',
    ARRAY['dashboard-core'],
    '{"marketZone": {"type": "select", "options": ["PJM", "CAISO", "ERCOT"]}}',
    ARRAY['view-market-data'],
    ARRAY['market', 'prices', 'trading']
),
(
    'trading-dashboard',
    'Trading Dashboard',
    'Comprehensive trading interface with bid tracking',
    'financial',
    'ArrowTrendingUpIcon',
    'trading',
    ARRAY['dashboard-core'],
    '{"showOrders": {"type": "boolean"}}',
    ARRAY['view-trading-data'],
    ARRAY['trading', 'bids', 'market']
),
(
    'india-energy-market',
    'India Energy Market',
    'India energy market analytics and data visualization',
    'energy',
    'MapIcon',
    'map',
    ARRAY['dashboard-core', 'india-energy'],
    '{"viewType": {"type": "select", "options": ["overview", "detailed"]}}',
    ARRAY['view-india-energy'],
    ARRAY['india', 'energy', 'market', 'analytics']
)
ON CONFLICT (widget_id) DO NOTHING;

-- Grant necessary permissions
-- Note: Adjust these based on your database setup
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO optibid_user;
-- GRANT USAGE ON SCHEMA public TO optibid_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO optibid_user;
