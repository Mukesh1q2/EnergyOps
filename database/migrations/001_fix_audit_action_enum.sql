-- ===============================================
-- Migration: Fix audit_action enum to support trigger operations
-- ===============================================
-- Issue: The audit_action enum doesn't include 'INSERT', 'UPDATE', 'DELETE'
-- which are the values returned by TG_OP in PostgreSQL triggers.
-- 
-- Solution: Add the uppercase trigger operation values to the enum
-- and update the log_audit_event function to handle the mapping.

-- Step 1: Add new values to the audit_action enum
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'INSERT';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'UPDATE';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'DELETE';

-- Step 2: Update the log_audit_event function to use lowercase mapping
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    action_value audit_action;
BEGIN
    -- Map TG_OP to audit_action enum values
    action_value := CASE TG_OP
        WHEN 'INSERT' THEN 'create'::audit_action
        WHEN 'UPDATE' THEN 'update'::audit_action
        WHEN 'DELETE' THEN 'delete'::audit_action
        ELSE 'create'::audit_action  -- fallback
    END;

    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (
            organization_id, user_id, action, resource_type, resource_id, old_values
        )
        VALUES (
            COALESCE(OLD.organization_id, (SELECT organization_id FROM users WHERE id = current_setting('app.current_user_id', true)::UUID)),
            current_setting('app.current_user_id', true)::UUID,
            action_value,
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
            action_value,
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
            action_value,
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(NEW)
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Verify the fix by checking enum values
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully. audit_action enum now includes: %', 
        (SELECT array_agg(enumlabel ORDER BY enumsortorder) 
         FROM pg_enum 
         WHERE enumtypid = 'audit_action'::regtype);
END $$;
