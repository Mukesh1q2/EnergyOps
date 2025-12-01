# Database Issues Resolution Guide

## Overview

This document addresses the PostgreSQL container issues identified in the logs and provides comprehensive solutions.

## Issues Identified

### 1. ❌ Audit Action Enum Error (CRITICAL)

**Error Message:**
```
ERROR: invalid input value for enum audit_action: "INSERT"
CONTEXT: SQL statement "INSERT INTO audit_logs ..."
PL/pgSQL function log_audit_event() line 31 at SQL statement
```

**Root Cause:**
The `audit_action` enum type was defined with lowercase values:
```sql
CREATE TYPE audit_action AS ENUM ('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import');
```

However, the `log_audit_event()` trigger function was attempting to cast PostgreSQL's `TG_OP` variable (which returns 'INSERT', 'UPDATE', 'DELETE' in uppercase) directly to the enum type.

**Impact:**
- All INSERT, UPDATE, and DELETE operations on audited tables fail
- Audit logs are not being created
- User creation and data modifications are blocked

**Solution:**
Updated the `log_audit_event()` function to map trigger operations to the correct enum values:
```sql
action_value := CASE TG_OP
    WHEN 'INSERT' THEN 'create'::audit_action
    WHEN 'UPDATE' THEN 'update'::audit_action
    WHEN 'DELETE' THEN 'delete'::audit_action
END;
```

### 2. ⚠️ Authentication Failure

**Error Message:**
```
FATAL: password authentication failed for user "optibid"
```

**Root Cause:**
Application attempting to connect with incorrect credentials or credentials not matching docker-compose.yml configuration.

**Current Credentials (from docker-compose.yml):**
- Database: `optibid`
- User: `optibid`
- Password: `optibid_password_2025`
- Host: `localhost` (or `postgres` from within Docker network)
- Port: `5432`

**Solution:**
Verify and update application configuration files:
- `backend/.env`
- `backend/config.py`
- Any connection strings in the application

### 3. ℹ️ TimescaleDB Version Mismatch (INFO)

**Warning Message:**
```
LOG: the "timescaledb" extension is not up-to-date
HINT: The most up-to-date version is 2.23.1, the installed version is 2.10.2.
```

**Root Cause:**
The TimescaleDB extension in the database is version 2.10.2, but the container image includes version 2.23.1.

**Impact:**
- Non-critical, but newer features and bug fixes are unavailable
- May have performance improvements in newer version

**Solution (Optional):**
```sql
ALTER EXTENSION timescaledb UPDATE TO '2.23.1';
```

**Note:** Test in development first, as extension upgrades can have breaking changes.

### 4. ℹ️ Container Timestamp Anomaly (INFO)

**Observation:**
Container metadata shows `startedAt` timestamp after `finishedAt` timestamp.

**Root Cause:**
Docker metadata inconsistency, likely due to container restart or system clock synchronization issue.

**Impact:**
- Cosmetic issue only
- Container is running normally

**Solution:**
No action required. Monitor for repeated container restarts.

## Resolution Steps

### Quick Fix (Recommended)

Run the automated fix script:

**Windows (PowerShell):**
```powershell
.\scripts\fix_database_issues.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x scripts/fix_database_issues.sh
./scripts/fix_database_issues.sh
```

### Manual Fix

If you prefer to apply fixes manually:

#### Step 1: Apply Database Migration

```bash
# Copy migration file to container
docker cp database/migrations/001_fix_audit_action_enum.sql optibid-postgres:/tmp/

# Execute migration
docker exec -it optibid-postgres psql -U optibid -d optibid -f /tmp/001_fix_audit_action_enum.sql
```

#### Step 2: Verify Enum Values

```bash
docker exec -it optibid-postgres psql -U optibid -d optibid -c "
SELECT array_agg(enumlabel ORDER BY enumsortorder) 
FROM pg_enum 
WHERE enumtypid = 'audit_action'::regtype;
"
```

Expected output should include: `{create,read,update,delete,login,logout,export,import,INSERT,UPDATE,DELETE}`

#### Step 3: Test Audit Logging

```bash
docker exec -it optibid-postgres psql -U optibid -d optibid -c "
SET app.current_user_id = '00000000-0000-0000-0000-000000000011';
INSERT INTO organizations (name, slug, status) 
VALUES ('Test Org', 'test-org-$(date +%s)', 'trial');
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 1;
"
```

#### Step 4: Fix Authentication

Update your backend configuration file (e.g., `backend/.env`):

```env
DATABASE_URL=postgresql+asyncpg://optibid:optibid_password_2025@postgres:5432/optibid
```

Or if connecting from host machine:

```env
DATABASE_URL=postgresql+asyncpg://optibid:optibid_password_2025@localhost:5432/optibid
```

## Verification

After applying fixes, verify everything is working:

### 1. Check Container Health

```bash
docker ps --filter "name=optibid-postgres"
docker logs optibid-postgres --tail 50
```

### 2. Test Database Connection

```bash
docker exec -it optibid-postgres psql -U optibid -d optibid -c "SELECT version();"
```

### 3. Verify Audit Logs

```bash
docker exec -it optibid-postgres psql -U optibid -d optibid -c "
SELECT action, resource_type, COUNT(*) 
FROM audit_logs 
GROUP BY action, resource_type 
ORDER BY COUNT(*) DESC;
"
```

### 4. Check for Errors

```bash
docker logs optibid-postgres 2>&1 | grep -i "error\|fatal" | tail -20
```

## Prevention

To prevent these issues in the future:

### 1. Schema Design Best Practices

- When using enums with triggers, always map trigger operations explicitly
- Document enum values and their usage
- Consider using CHECK constraints instead of enums for values that might change

### 2. Testing

Add integration tests that verify:
- Audit logging works for all CRUD operations
- Database migrations apply cleanly
- Authentication works with configured credentials

### 3. Monitoring

Set up alerts for:
- Authentication failures
- Database errors in application logs
- Container restarts

### 4. Documentation

Keep updated:
- Database credentials in secure documentation
- Schema changes and migrations
- Known issues and workarounds

## Files Created

1. **database/migrations/001_fix_audit_action_enum.sql**
   - Migration to fix audit_action enum and log_audit_event function

2. **scripts/fix_database_issues.sh**
   - Bash script for Linux/Mac to apply all fixes

3. **scripts/fix_database_issues.ps1**
   - PowerShell script for Windows to apply all fixes

4. **DATABASE_ISSUES_RESOLUTION.md** (this file)
   - Comprehensive documentation of issues and solutions

## Additional Resources

- [PostgreSQL Enum Types](https://www.postgresql.org/docs/current/datatype-enum.html)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/plpgsql-trigger.html)
- [TimescaleDB Upgrade Guide](https://docs.timescale.com/self-hosted/latest/upgrades/)
- [Docker PostgreSQL Best Practices](https://docs.docker.com/samples/postgres/)

## Support

If issues persist after applying these fixes:

1. Check application logs: `docker logs optibid-backend`
2. Check database logs: `docker logs optibid-postgres`
3. Verify network connectivity: `docker network inspect optibid-network`
4. Review docker-compose.yml for configuration issues

## Changelog

- **2025-11-25**: Initial documentation and fix scripts created
- Identified and resolved audit_action enum issue
- Documented authentication failure resolution
- Added TimescaleDB version upgrade notes
