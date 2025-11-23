-- =============================================================================
-- USERS AND ORGANIZATIONS DATABASE SCHEMA
-- =============================================================================
-- Production-ready schema for authentication and user management
-- Compatible with feature flags system migration

-- Create organizations table
CREATE TABLE organizations (
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
CREATE TABLE users (
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
CREATE TABLE user_organization_membership (
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
CREATE TABLE mfa_backup_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, code_hash)
);

-- Create user_sessions table for session management
CREATE TABLE user_sessions (
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
CREATE TABLE audit_log (
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
CREATE TABLE sso_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_token VARCHAR(255) UNIQUE NOT NULL,
    nonce VARCHAR(255),
    provider VARCHAR(50) NOT NULL,
    redirect_uri TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_email_verified ON users(email_verified);
CREATE INDEX idx_users_mfa_enabled ON users(mfa_enabled);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_last_activity ON users(last_activity_at);
CREATE INDEX idx_user_org_membership_user_id ON user_organization_membership(user_id);
CREATE INDEX idx_user_org_membership_org_id ON user_organization_membership(organization_id);
CREATE INDEX idx_user_org_membership_role ON user_organization_membership(role);
CREATE INDEX idx_mfa_backup_codes_user_id ON mfa_backup_codes(user_id);
CREATE INDEX idx_mfa_backup_codes_used ON mfa_backup_codes(used_at) WHERE used_at IS NULL;
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_sso_state_token ON sso_state(state_token);
CREATE INDEX idx_sso_state_expires ON sso_state(expires_at);

-- Create updated_at trigger function (reuse from feature flags)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_org_membership_updated_at BEFORE UPDATE ON user_organization_membership
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean expired sessions
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

-- Create function to clean expired SSO states
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

-- Create function to get user with organization data
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

-- Grant necessary permissions
-- Note: Adjust these based on your database setup
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO optibid_user;
-- GRANT USAGE ON SCHEMA public TO optibid_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO optibid_user;

-- Set up cleanup cron job (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-sessions', '0 */6 * * *', 'SELECT clean_expired_sessions();');
-- SELECT cron.schedule('cleanup-expired-sso', '0 */1 * * *', 'SELECT clean_expired_sso_states();');
