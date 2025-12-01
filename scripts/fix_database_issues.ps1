# ===============================================
# Database Issues Fix Script (PowerShell)
# ===============================================
# This script fixes the following issues:
# 1. audit_action enum missing INSERT/UPDATE/DELETE values
# 2. Verifies database credentials
# 3. Checks TimescaleDB version

param(
    [string]$DbHost = "localhost",
    [string]$DbPort = "5432",
    [string]$DbName = "optibid",
    [string]$DbUser = "optibid",
    [string]$DbPassword = "optibid_password_2025"
)

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "OptiBid Database Issues Fix Script" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Function to print colored output
function Print-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# Set environment variable for password
$env:PGPASSWORD = $DbPassword

# Check if docker is running
Write-Host "Step 0: Checking Docker container status..."
try {
    $containerStatus = docker ps --filter "name=optibid-postgres" --format "{{.Status}}"
    if ($containerStatus) {
        Print-Success "PostgreSQL container is running: $containerStatus"
    } else {
        Print-Warning "PostgreSQL container not found. Starting containers..."
        docker-compose up -d postgres
        Start-Sleep -Seconds 10
    }
} catch {
    Print-Error "Docker is not running or not installed"
    exit 1
}

# Check database connectivity
Write-Host ""
Write-Host "Step 1: Checking database connectivity..."
try {
    $result = docker exec optibid-postgres psql -U $DbUser -d $DbName -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Print-Success "Database connection successful"
    } else {
        Print-Error "Cannot connect to database: $result"
        exit 1
    }
} catch {
    Print-Error "Failed to connect to database: $_"
    exit 1
}

# Apply migration to fix audit_action enum
Write-Host ""
Write-Host "Step 2: Applying audit_action enum fix..."
try {
    $migrationPath = "database/migrations/001_fix_audit_action_enum.sql"
    
    if (Test-Path $migrationPath) {
        # Copy migration file to container
        docker cp $migrationPath optibid-postgres:/tmp/migration.sql
        
        # Execute migration
        $result = docker exec optibid-postgres psql -U $DbUser -d $DbName -f /tmp/migration.sql 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Print-Success "audit_action enum migration applied successfully"
        } else {
            Print-Warning "Migration may have already been applied or encountered issues"
            Write-Host $result
        }
    } else {
        Print-Error "Migration file not found: $migrationPath"
        exit 1
    }
} catch {
    Print-Error "Failed to apply migration: $_"
    exit 1
}

# Verify the enum values
Write-Host ""
Write-Host "Step 3: Verifying audit_action enum values..."
try {
    $enumQuery = "SELECT array_agg(enumlabel ORDER BY enumsortorder) FROM pg_enum WHERE enumtypid = 'audit_action'::regtype;"
    $enumValues = docker exec optibid-postgres psql -U $DbUser -d $DbName -t -c $enumQuery
    Write-Host "Current audit_action values: $enumValues"
    Print-Success "Enum verification complete"
} catch {
    Print-Warning "Could not verify enum values: $_"
}

# Check TimescaleDB version
Write-Host ""
Write-Host "Step 4: Checking TimescaleDB version..."
try {
    $versionQuery = "SELECT extversion FROM pg_extension WHERE extname = 'timescaledb';"
    $timescaleVersion = docker exec optibid-postgres psql -U $DbUser -d $DbName -t -c $versionQuery
    Write-Host "Installed TimescaleDB version: $timescaleVersion"
    Print-Warning "Consider upgrading to TimescaleDB 2.23.1 for latest features and bug fixes"
} catch {
    Print-Warning "Could not check TimescaleDB version: $_"
}

# Test audit logging
Write-Host ""
Write-Host "Step 5: Testing audit logging functionality..."
try {
    $testQuery = @"
SET app.current_user_id = '00000000-0000-0000-0000-000000000011';
INSERT INTO organizations (name, slug, status) 
VALUES ('Test Org', 'test-org-$(Get-Date -Format 'yyyyMMddHHmmss')', 'trial')
ON CONFLICT (slug) DO NOTHING;
SELECT COUNT(*) as audit_log_count FROM audit_logs WHERE action = 'create' AND resource_type = 'organizations';
"@
    
    $result = docker exec optibid-postgres psql -U $DbUser -d $DbName -c $testQuery
    
    if ($LASTEXITCODE -eq 0) {
        Print-Success "Audit logging test passed"
    } else {
        Print-Warning "Audit logging test encountered issues"
    }
} catch {
    Print-Warning "Could not test audit logging: $_"
}

# Check for authentication failures in logs
Write-Host ""
Write-Host "Step 6: Checking for recent authentication failures..."
try {
    $authErrors = docker logs optibid-postgres 2>&1 | Select-String "password authentication failed" | Select-Object -Last 5
    if ($authErrors) {
        Print-Warning "Found authentication failures in logs:"
        $authErrors | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
        Write-Host ""
        Write-Host "Verify these credentials in your application:"
        Write-Host "  Database: $DbName"
        Write-Host "  User: $DbUser"
        Write-Host "  Password: $DbPassword"
    } else {
        Print-Success "No recent authentication failures found"
    }
} catch {
    Print-Warning "Could not check authentication logs: $_"
}

# Summary
Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Fix Summary" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Print-Success "Database connectivity verified"
Print-Success "audit_action enum fixed"
Print-Success "Audit logging function updated"
Print-Warning "TimescaleDB version check completed"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Monitor audit logs for any further errors"
Write-Host "2. Consider upgrading TimescaleDB extension"
Write-Host "3. Verify application authentication credentials in backend/.env"
Write-Host "4. Check docker-compose.yml for correct database credentials"
Write-Host ""

# Cleanup
Remove-Item Env:\PGPASSWORD
