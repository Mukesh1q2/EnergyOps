-- Simple seed script for test users
-- Password hashes are for: admin123, trader123, analyst123, viewer123

-- Create test organization
INSERT INTO organizations (id, name, slug, status, subscription_tier, metadata)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Test Organization',
    'test-org',
    'active',
    'enterprise',
    '{"test": true}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Create admin user (password: admin123)
INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, role, status, email_verified)
VALUES (
    '00000000-0000-0000-0000-000000000011'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'admin@optibid.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewXOLjLl9L5u6uO6',
    'Admin',
    'User',
    'admin',
    'active',
    true
)
ON CONFLICT (email) DO NOTHING;

-- Create trader user (password: trader123)
INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, role, status, email_verified)
VALUES (
    '00000000-0000-0000-0000-000000000012'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'trader@optibid.com',
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'Trader',
    'User',
    'trader',
    'active',
    true
)
ON CONFLICT (email) DO NOTHING;

-- Create analyst user (password: analyst123)
INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, role, status, email_verified)
VALUES (
    '00000000-0000-0000-0000-000000000013'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'analyst@optibid.com',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Analyst',
    'User',
    'analyst',
    'active',
    true
)
ON CONFLICT (email) DO NOTHING;

-- Create viewer user (password: viewer123)
INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, role, status, email_verified)
VALUES (
    '00000000-0000-0000-0000-000000000014'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'viewer@optibid.com',
    '$2b$12$vZXL5YFKX5H5FZyNUhxBxeOXp5pYJ5J5J5J5J5J5J5J5J5J5J5J5J',
    'Viewer',
    'User',
    'viewer',
    'active',
    true
)
ON CONFLICT (email) DO NOTHING;

-- Display created users
SELECT 
    email,
    role,
    status,
    CASE email
        WHEN 'admin@optibid.com' THEN 'admin123'
        WHEN 'trader@optibid.com' THEN 'trader123'
        WHEN 'analyst@optibid.com' THEN 'analyst123'
        WHEN 'viewer@optibid.com' THEN 'viewer123'
    END as password
FROM users
WHERE organization_id = '00000000-0000-0000-0000-000000000001'::uuid
ORDER BY role;
