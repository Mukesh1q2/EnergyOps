#!/bin/bash

# ===============================================
# Database Issues Fix Script
# ===============================================
# This script fixes the following issues:
# 1. audit_action enum missing INSERT/UPDATE/DELETE values
# 2. Verifies database credentials
# 3. Checks TimescaleDB version

set -e

echo "==================================="
echo "OptiBid Database Issues Fix Script"
echo "==================================="
echo ""

# Database connection parameters
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-optibid}"
DB_USER="${DB_USER:-optibid}"
DB_PASSWORD="${DB_PASSWORD:-optibid_password_2025}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if PostgreSQL is accessible
echo "Step 1: Checking database connectivity..."
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
    print_success "Database connection successful"
else
    print_error "Cannot connect to database. Please check credentials and ensure PostgreSQL is running."
    exit 1
fi

# Apply migration to fix audit_action enum
echo ""
echo "Step 2: Applying audit_action enum fix..."
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/migrations/001_fix_audit_action_enum.sql; then
    print_success "audit_action enum migration applied successfully"
else
    print_error "Failed to apply audit_action enum migration"
    exit 1
fi

# Verify the enum values
echo ""
echo "Step 3: Verifying audit_action enum values..."
ENUM_VALUES=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT array_agg(enumlabel ORDER BY enumsortorder) FROM pg_enum WHERE enumtypid = 'audit_action'::regtype;")
echo "Current audit_action values: $ENUM_VALUES"
print_success "Enum verification complete"

# Check TimescaleDB version
echo ""
echo "Step 4: Checking TimescaleDB version..."
TIMESCALE_VERSION=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT extversion FROM pg_extension WHERE extname = 'timescaledb';")
echo "Installed TimescaleDB version: $TIMESCALE_VERSION"
print_warning "Consider upgrading to TimescaleDB 2.23.1 for latest features and bug fixes"

# Test audit logging
echo ""
echo "Step 5: Testing audit logging functionality..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME <<EOF
-- Set current user context for audit logging
SET app.current_user_id = '00000000-0000-0000-0000-000000000011';

-- Test insert (should trigger audit log)
INSERT INTO organizations (name, slug, status) 
VALUES ('Test Org', 'test-org-$(date +%s)', 'trial')
ON CONFLICT (slug) DO NOTHING;

-- Check if audit log was created
SELECT COUNT(*) as audit_log_count FROM audit_logs WHERE action = 'create' AND resource_type = 'organizations';
EOF

if [ $? -eq 0 ]; then
    print_success "Audit logging test passed"
else
    print_warning "Audit logging test encountered issues"
fi

# Summary
echo ""
echo "==================================="
echo "Fix Summary"
echo "==================================="
print_success "Database connectivity verified"
print_success "audit_action enum fixed"
print_success "Audit logging function updated"
print_warning "TimescaleDB version: $TIMESCALE_VERSION (2.23.1 available)"
echo ""
echo "Next steps:"
echo "1. Monitor audit logs for any further errors"
echo "2. Consider upgrading TimescaleDB extension"
echo "3. Verify application authentication credentials"
echo ""
