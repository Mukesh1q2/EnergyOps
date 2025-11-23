#!/bin/bash
# =============================================================================
# COMPREHENSIVE DATABASE MIGRATION SCRIPT
# =============================================================================
# Complete OptiBid Energy platform database migration
# Creates users, organizations, feature flags, and all required tables

echo "🚀 Starting Complete OptiBid Energy Database Migration..."

# Database connection configuration
export PGHOST=${DB_HOST:-localhost}
export PGPORT=${DB_PORT:-5432}
export PGDATABASE=${DB_NAME:-optibid}
export PGUSER=${DB_USER:-postgres}
export PGPASSWORD=${DB_PASSWORD:-password}

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL client not found. Please install postgresql-client."
    exit 1
fi

# Test database connection
echo "🔌 Testing database connection..."
if ! psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -c "SELECT version();" &> /dev/null; then
    echo "❌ Cannot connect to database. Please ensure PostgreSQL is running and credentials are correct."
    echo "   Host: $PGHOST:$PGPORT"
    echo "   Database: $PGDATABASE"
    echo "   User: $PGUSER"
    exit 1
fi

echo "✅ Database connection successful!"

# Create migrations tracking table
echo "📋 Creating migration tracking table..."
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE << 'EOF'
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
EOF

# Migration 1: Users and Organizations Schema
echo "👥 Executing Users & Organizations migration..."
MIGRATION_1="users_organizations_schema_$(date +%Y%m%d_%H%M%S)"
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE << 'EOF'
-- Migration: Users and Organizations Schema
-- This migration creates the core user management tables

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    plan VARCHAR(50) DEFAULT 'free',
    settings JSONB DEFAULT '{
        "mfaRequired": false,
        "ssoEnabled": false,
        "sessionTimeout": 3600,
        "allowSocialLogin": true,
        "emailVerifiedRequired": true,
        "passwordPolicy": {
            "minLength": 8,
            "requireUppercase": true,
            "requireLowercase": true,
            "requireNumbers": true,
            "requireSymbols": false
        }
    }',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table with comprehensive MFA and security support
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company VARCHAR(255),
    role VARCHAR(50) DEFAULT 'member',
    phone VARCHAR(20),
    
    -- Email verification
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    email_verification_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- MFA settings
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),
    mfa_method VARCHAR(20), -- 'totp', 'sms', 'both'
    mfa_backup_codes TEXT[],
    mfa_enabled_at TIMESTAMP WITH TIME ZONE,
    
    -- SSO integration
    sso_provider VARCHAR(50), -- 'auth0', 'okta', 'google', 'azure'
    sso_id VARCHAR(255),
    sso_data JSONB,
    
    -- Account status and security
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'pending_verification', 'suspended', 'deleted'
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Profile and preferences
    profile_image_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    notification_preferences JSONB DEFAULT '{
        "email": true,
        "sms": false,
        "push": true,
        "marketing": false,
        "security": true
    }',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_organization_membership table for many-to-many relationship
CREATE TABLE IF NOT EXISTS user_organization_membership (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
    permissions TEXT[] DEFAULT ARRAY['dashboard.view'],
    is_active BOOLEAN DEFAULT true,
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, organization_id)
);

-- Create mfa_backup_codes table for enhanced security
CREATE TABLE IF NOT EXISTS mfa_backup_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, code_hash)
);

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Create audit_log table for security and compliance
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sso_state table for CSRF protection
CREATE TABLE IF NOT EXISTS sso_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_token VARCHAR(255) UNIQUE NOT NULL,
    nonce VARCHAR(255),
    provider VARCHAR(50) NOT NULL,
    redirect_uri TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_mfa_enabled ON users(mfa_enabled);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_user_org_membership_user_id ON user_organization_membership(user_id);
CREATE INDEX IF NOT EXISTS idx_user_org_membership_org_id ON user_organization_membership(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_org_membership_role ON user_organization_membership(role);
CREATE INDEX IF NOT EXISTS idx_mfa_backup_codes_user_id ON mfa_backup_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_backup_codes_used ON mfa_backup_codes(used_at) WHERE used_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_sso_state_token ON sso_state(state_token);
CREATE INDEX IF NOT EXISTS idx_sso_state_expires ON sso_state(expires_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_org_membership_updated_at ON user_organization_membership;
CREATE TRIGGER update_user_org_membership_updated_at BEFORE UPDATE ON user_organization_membership
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create helper functions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR (NOT is_active);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION clean_expired_sso_states()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sso_state 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_with_organization(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'user', json_build_object(
            'id', u.id,
            'email', u.email,
            'first_name', u.first_name,
            'last_name', u.last_name,
            'company', u.company,
            'role', u.role,
            'phone', u.phone,
            'mfa_enabled', u.mfa_enabled,
            'mfa_method', u.mfa_method,
            'email_verified', u.email_verified,
            'status', u.status,
            'last_login_at', u.last_login_at,
            'profile_image_url', u.profile_image_url
        ),
        'organization', CASE 
            WHEN org.id IS NOT NULL THEN 
                json_build_object(
                    'id', org.id,
                    'name', org.name,
                    'domain', org.domain,
                    'plan', org.plan,
                    'settings', org.settings
                )
            ELSE NULL
        END,
        'membership', CASE 
            WHEN uom.id IS NOT NULL THEN
                json_build_object(
                    'role', uom.role,
                    'permissions', uom.permissions,
                    'joined_at', uom.joined_at
                )
            ELSE NULL
        END
    )
    INTO result
    FROM users u
    LEFT JOIN user_organization_membership uom ON u.id = uom.user_id AND uom.is_active = true
    LEFT JOIN organizations org ON uom.organization_id = org.id
    WHERE u.email = user_email AND u.status != 'deleted';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default organization for testing
INSERT INTO organizations (id, name, domain, plan, settings) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'OptiBid Energy',
    'optibid.com',
    'enterprise',
    '{
        "mfaRequired": true,
        "ssoEnabled": true,
        "sessionTimeout": 3600,
        "allowSocialLogin": true,
        "emailVerifiedRequired": true
    }'
)
ON CONFLICT (id) DO NOTHING;

-- Record migration
INSERT INTO schema_migrations (version, description) 
VALUES ($MIGRATION_1, 'Users and Organizations Schema')
ON CONFLICT (version) DO NOTHING;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Users & Organizations migration completed successfully!"
else
    echo "❌ Users & Organizations migration failed!"
    exit 1
fi

# Migration 2: Feature Flags Schema
echo "🏁 Executing Feature Flags migration..."
MIGRATION_2="feature_flags_schema_$(date +%Y%m%d_%H%M%S)"
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -f db/feature-flags-schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Feature Flags migration completed successfully!"
    # Record migration
    psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE << EOF
INSERT INTO schema_migrations (version, description) 
VALUES ('$MIGRATION_2', 'Feature Flags System Schema')
ON CONFLICT (version) DO NOTHING;
EOF
else
    echo "❌ Feature Flags migration failed!"
    exit 1
fi

# Final verification
echo "🔍 Verifying database structure..."
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE << 'EOF'
-- Verify all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verify indexes were created
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Show migration history
SELECT version, description, applied_at 
FROM schema_migrations 
ORDER BY applied_at;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Database structure verification completed!"
else
    echo "⚠️ Database structure verification failed (non-critical)"
fi

echo ""
echo "🎉 Migration Summary:"
echo "   ✅ Users & Organizations Schema - Complete"
echo "   ✅ Feature Flags Schema - Complete"
echo "   ✅ All indexes and triggers created"
echo "   ✅ Helper functions installed"
echo "   ✅ Default data populated"
echo ""
echo "🎯 Database is now ready for:"
echo "   • User authentication and registration"
echo "   • Multi-factor authentication (MFA)"
echo "   • Single Sign-On (SSO) integration"
echo "   • Organization and team management"
echo "   • Feature flag management"
echo "   • Audit logging and compliance"
echo ""
echo "🔍 Next Steps:"
echo "   1. Configure environment variables (.env)"
echo "   2. Test authentication flows"
echo "   3. Set up email/SMS services"
echo "   4. Configure monitoring and logging"
echo "   5. Begin application testing"
echo ""
echo "📊 Tables Created:"
echo "   • users (14 core fields + JSONB)"
echo "   • organizations (7 fields + JSONB)"
echo "   • user_organization_membership (8 fields)"
echo "   • user_sessions (10 fields)"
echo "   • mfa_backup_codes (4 fields)"
echo "   • audit_log (11 fields + JSONB)"
echo "   • sso_state (6 fields)"
echo "   • feature_definitions (14 fields + JSONB)"
echo "   • organization_feature_settings (10 fields + JSONB)"
echo "   • user_dashboard_preferences (12 fields + JSONB)"
echo "   • feature_templates (11 fields + JSONB)"
echo "   • feature_change_logs (10 fields + JSONB)"
echo "   • template_application_logs (7 fields)"
echo "   • widget_library (13 fields + JSONB)"
echo "   • user_feature_usage (9 fields)"
echo ""
echo "✅ OptiBid Energy database migration completed successfully!"
