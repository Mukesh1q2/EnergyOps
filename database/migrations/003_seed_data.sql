-- ===============================================
-- OptiBid Energy Platform - Migration 003
-- ===============================================
-- Seed data and initial setup
-- Author: MiniMax Agent

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
)
ON CONFLICT (tier) DO NOTHING;

-- Insert sample market operators
INSERT INTO market_operators (name, code, region, country, timezone, contact_email) VALUES
('Power System Operation Corporation Limited', 'POSOCO', 'All India', 'India', 'Asia/Kolkata', 'contact@posoco.in'),
('Northern Regional Load Despatch Centre', 'NRLDC', 'Northern Region', 'India', 'Asia/Kolkata', 'nldc@posoco.in'),
('Western Regional Load Despatch Centre', 'WRLDC', 'Western Region', 'India', 'Asia/Kolkata', 'wldc@posoco.in'),
('Southern Regional Load Despatch Centre', 'SRLDC', 'Southern Region', 'India', 'Asia/Kolkata', 'sldc@posoco.in'),
('Eastern Regional Load Despatch Centre', 'ERLDC', 'Eastern Region', 'India', 'Asia/Kolkata', 'eldc@posoco.in'),
('North Eastern Regional Load Despatch Centre', 'NERLDC', 'North Eastern Region', 'India', 'Asia/Kolkata', 'neldc@posoco.in'),
('Central Electricity Authority', 'CEA', 'Central Government', 'India', 'Asia/Kolkata', 'cea@nic.in'),
('State Load Despatch Centre Delhi', 'SLDC-Delhi', 'Delhi', 'India', 'Asia/Kolkata', 'sldc-delhi@gov.in'),
('State Load Despatch Centre Maharashtra', 'SLDC-Maharashtra', 'Maharashtra', 'India', 'Asia/Kolkata', 'sldc-maharashtra@gov.in'),
('State Load Despatch Centre Karnataka', 'SLDC-Karnataka', 'Karnataka', 'India', 'Asia/Kolkata', 'sldc-karnataka@karunadu.gov.in')
ON CONFLICT (code) DO NOTHING;

-- Insert sample bid zones
INSERT INTO bid_zones (market_operator_id, zone_code, zone_name)
SELECT id, 'NR', 'Northern Region' FROM market_operators WHERE code = 'NRLDC'
UNION ALL
SELECT id, 'WR', 'Western Region' FROM market_operators WHERE code = 'WRLDC'
UNION ALL
SELECT id, 'SR', 'Southern Region' FROM market_operators WHERE code = 'SRLDC'
UNION ALL
SELECT id, 'ER', 'Eastern Region' FROM market_operators WHERE code = 'ERLDC'
UNION ALL
SELECT id, 'NER', 'North Eastern Region' FROM market_operators WHERE code = 'NERLDC'
UNION ALL
SELECT id, 'DEL', 'Delhi' FROM market_operators WHERE code = 'SLDC-Delhi'
UNION ALL
SELECT id, 'MH', 'Maharashtra' FROM market_operators WHERE code = 'SLDC-Maharashtra'
UNION ALL
SELECT id, 'KA', 'Karnataka' FROM market_operators WHERE code = 'SLDC-Karnataka'
ON CONFLICT DO NOTHING;

-- Create demo organization and admin user
SELECT create_organization_with_admin(
    'OptiBid Demo Organization',
    'admin@optibid.io',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewXOLjLl9L5u6uO6', -- password: admin123
    'Admin',
    'User'
) AS demo_org_id;

-- Get the demo organization ID for further seeding
WITH demo_org AS (
    SELECT id FROM organizations WHERE slug = 'optibid-demo-organization'
)
INSERT INTO sites (organization_id, name, description, address, city, state, country, timezone) 
SELECT 
    demo_org.id,
    'Mumbai Solar Plant',
    '500 MW solar installation in Mumbai',
    'Plot 123, Solar Park, Panvel',
    'Mumbai',
    'Maharashtra',
    'India',
    'Asia/Kolkata'
FROM demo_org
ON CONFLICT DO NOTHING;

-- Add sample assets
WITH demo_org AS (
    SELECT id FROM organizations WHERE slug = 'optibid-demo-organization'
),
mumbai_site AS (
    SELECT id FROM sites WHERE name = 'Mumbai Solar Plant'
)
INSERT INTO assets (organization_id, site_id, name, asset_type, capacity_mw, status, commissioning_date)
SELECT 
    demo_org.id,
    mumbai_site.id,
    'Solar Farm Block A',
    'solar',
    250.0,
    'online',
    '2023-01-15'
FROM demo_org, mumbai_site
UNION ALL
SELECT 
    demo_org.id,
    mumbai_site.id,
    'Solar Farm Block B',
    'solar',
    250.0,
    'online',
    '2023-02-20'
FROM demo_org, mumbai_site
ON CONFLICT DO NOTHING;

-- Map assets to bid zones
WITH demo_org AS (
    SELECT id FROM organizations WHERE slug = 'optibid-demo-organization'
),
solar_assets AS (
    SELECT a.id FROM assets a
    JOIN sites s ON a.site_id = s.id
    JOIN organizations o ON a.organization_id = o.id
    WHERE o.slug = 'optibid-demo-organization' AND s.name = 'Mumbai Solar Plant'
),
maharashtra_zone AS (
    SELECT id FROM bid_zones WHERE zone_code = 'MH'
)
INSERT INTO asset_bid_zones (asset_id, bid_zone_id, capacity_share)
SELECT sa.id, mz.id, 1.0
FROM solar_assets sa, maharashtra_zone mz
ON CONFLICT DO NOTHING;

-- Create sample datasets
WITH demo_org AS (
    SELECT id FROM organizations WHERE slug = 'optibid-demo-organization'
),
admin_user AS (
    SELECT id FROM users WHERE email = 'admin@optibid.io'
)
INSERT INTO datasets (organization_id, name, description, dataset_type, source, frequency, schema, created_by)
SELECT 
    demo_org.id,
    'Market Prices - Maharashtra',
    'Historical and real-time market price data for Maharashtra bid zone',
    'market',
    'api',
    '15min',
    '{
        "fields": [
            {"name": "time", "type": "timestamp"},
            {"name": "price_rupees", "type": "decimal"},
            {"name": "volume_mwh", "type": "decimal"}
        ]
    }',
    admin_user.id
FROM demo_org, admin_user
ON CONFLICT DO NOTHING;

-- Create sample compliance rules
WITH demo_org AS (
    SELECT id FROM organizations WHERE slug = 'optibid-demo-organization'
),
admin_user AS (
    SELECT id FROM users WHERE email = 'admin@optibid.io'
)
INSERT INTO compliance_rules (organization_id, rule_name, rule_description, rule_type, rule_config, severity, is_active, created_by)
SELECT 
    demo_org.id,
    'Bid Quantity Limit',
    'Maximum bid quantity cannot exceed 90% of asset capacity',
    'bidding_limit',
    '{
        "max_capacity_percentage": 0.9,
        "asset_types": ["solar", "wind", "thermal"]
    }',
    'high',
    true,
    admin_user.id
FROM demo_org, admin_user
ON CONFLICT DO NOTHING;

-- Create sample market price data for the last 30 days
WITH market_data AS (
    SELECT 
        generate_series(
            NOW() - INTERVAL '30 days',
            NOW(),
            '1 hour'
        ) as time,
        mo.id as market_operator_id,
        bz.id as bid_zone_id,
        'day_ahead' as market_type
    FROM market_operators mo
    JOIN bid_zones bz ON bz.market_operator_id = mo.id
    WHERE bz.zone_code IN ('MH', 'KA', 'DEL')
),
price_values AS (
    SELECT 
        time,
        market_operator_id,
        bid_zone_id,
        market_type,
        -- Generate realistic price variations (base price ~4000 INR/MWh with variations)
        4000 + (random() * 2000 - 1000) + 
        -- Add time-based patterns (peak hours have higher prices)
        CASE 
            WHEN EXTRACT(hour FROM time) BETWEEN 17 AND 22 THEN 1000  -- Peak evening hours
            WHEN EXTRACT(hour FROM time) BETWEEN 9 AND 17 THEN 500    -- Day time
            WHEN EXTRACT(hour FROM time) BETWEEN 23 OR EXTRACT(hour FROM time) BETWEEN 0 AND 6 THEN -800  -- Night
            ELSE 200
        END +
        -- Add weekend/weekday variation
        CASE WHEN EXTRACT(dow FROM time) IN (0, 6) THEN -200 ELSE 0 END as price_rupees,
        -- Volume varies with time
        1000 + random() * 500 as volume_mwh
    FROM market_data
)
INSERT INTO market_prices (time, market_operator_id, bid_zone_id, market_type, price_rupees, volume_mwh)
SELECT time, market_operator_id, bid_zone_id, market_type, price_rupees, volume_mwh
FROM price_values
ON CONFLICT (time, market_operator_id, bid_zone_id, market_type) DO NOTHING;

-- Create sample asset meter data
WITH asset_data AS (
    SELECT 
        generate_series(
            NOW() - INTERVAL '7 days',
            NOW(),
            '5 minutes'
        ) as time,
        a.id as asset_id
    FROM assets a
    JOIN sites s ON a.site_id = s.id
    JOIN organizations o ON a.organization_id = o.id
    WHERE o.slug = 'optibid-demo-organization' AND s.name = 'Mumbai Solar Plant'
),
meter_values AS (
    SELECT 
        time,
        asset_id,
        -- Solar generation follows day/night cycle
        CASE 
            WHEN EXTRACT(hour FROM time) BETWEEN 6 AND 18 THEN 
                GREATEST(0, SIN((EXTRACT(hour FROM time) - 6) * 3.14159 / 12) * 250 * (0.8 + random() * 0.4))
            ELSE 0
        END as active_power_mw,
        -- Reactive power (typically small for solar)
        random() * 10 - 5 as reactive_power_mvar,
        -- Voltage (around 400kV with small variations)
        400 + random() * 10 - 5 as voltage_kv,
        -- Frequency (around 50Hz with small variations)
        50 + random() * 0.2 - 0.1 as frequency_hz,
        'valid' as status
    FROM asset_data
)
INSERT INTO asset_meters (time, asset_id, active_power_mw, reactive_power_mvar, voltage_kv, frequency_hz, status)
SELECT time, asset_id, active_power_mw, reactive_power_mvar, voltage_kv, frequency_hz, status
FROM meter_values
ON CONFLICT (time, asset_id) DO NOTHING;

-- Create sample dashboard template
WITH demo_org AS (
    SELECT id FROM organizations WHERE slug = 'optibid-demo-organization'
),
admin_user AS (
    SELECT id FROM users WHERE email = 'admin@optibid.io'
),
demo_dataset AS (
    SELECT id FROM datasets WHERE name = 'Market Prices - Maharashtra'
)
INSERT INTO dashboards (organization_id, name, description, dashboard_type, is_template, created_by)
SELECT 
    demo_org.id,
    'Energy Trading Overview',
    'Comprehensive dashboard for energy trading operations',
    'trading',
    true,
    admin_user.id
FROM demo_org, admin_user
ON CONFLICT DO NOTHING;

-- Add widgets to the dashboard
WITH demo_dashboard AS (
    SELECT d.id FROM dashboards d
    JOIN organizations o ON d.organization_id = o.id
    WHERE o.slug = 'optibid-demo-organization' AND d.name = 'Energy Trading Overview'
),
demo_dataset AS (
    SELECT id FROM datasets WHERE name = 'Market Prices - Maharashtra'
)
INSERT INTO dashboard_widgets (dashboard_id, name, widget_type, position_x, position_y, width, height, configuration, data_source_id)
SELECT 
    demo_dashboard.id,
    'Market Price Chart',
    'chart',
    0,
    0,
    12,
    6,
    '{
        "chart_type": "line",
        "x_axis": "time",
        "y_axis": "price_rupees",
        "time_range": "24h",
        "show_grid": true,
        "theme": "dark"
    }',
    demo_dataset.id
FROM demo_dashboard, demo_dataset
UNION ALL
SELECT 
    demo_dashboard.id,
    'Current Market KPIs',
    'kpi',
    12,
    0,
    12,
    3,
    '{
        "kpis": [
            {"label": "Current Price", "field": "price_rupees", "format": "currency"},
            {"label": "Volume", "field": "volume_mwh", "format": "number"},
            {"label": "24h Change", "field": "price_change", "format": "percentage"}
        ]
    }',
    demo_dataset.id
FROM demo_dashboard, demo_dataset;

-- Refresh materialized views
REFRESH MATERIALIZED VIEW daily_market_prices;

-- Grant necessary permissions
-- (Note: In production, you'd set up proper role-based access)

-- Set up some basic database statistics
ANALYZE;

-- Print summary
DO $$
DECLARE
    org_count INTEGER;
    user_count INTEGER;
    asset_count INTEGER;
    bid_zone_count INTEGER;
    dataset_count INTEGER;
    dashboard_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO org_count FROM organizations;
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO asset_count FROM assets;
    SELECT COUNT(*) INTO bid_zone_count FROM bid_zones;
    SELECT COUNT(*) INTO dataset_count FROM datasets;
    SELECT COUNT(*) INTO dashboard_count FROM dashboards;
    
    RAISE NOTICE 'OptiBid Database Seed Data Complete';
    RAISE NOTICE 'Organizations: %', org_count;
    RAISE NOTICE 'Users: %', user_count;
    RAISE NOTICE 'Assets: %', asset_count;
    RAISE NOTICE 'Bid Zones: %', bid_zone_count;
    RAISE NOTICE 'Datasets: %', dataset_count;
    RAISE NOTICE 'Dashboards: %', dashboard_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Demo credentials:';
    RAISE NOTICE 'Email: admin@optibid.io';
    RAISE NOTICE 'Password: admin123';
END $$;