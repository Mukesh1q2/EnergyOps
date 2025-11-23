import { Pool, PoolClient } from 'pg';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'optibid',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.DATABASE_POOL_MAX || '20'),
  min: parseInt(process.env.DATABASE_POOL_MIN || '5'),
  idleTimeoutMillis: parseInt(process.env.DATABASE_POOL_TIMEOUT || '30000'),
  connectionTimeoutMillis: 10000,
};

// Create connection pool
let pool: Pool | null = null;

export function getDatabase(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig);
    
    pool.on('error', (err) => {
      console.error('Database pool error:', err);
    });
  }
  
  return pool;
}

// Get database client for transactions
export async function getClient(): Promise<PoolClient> {
  const db = getDatabase();
  const client = await db.connect();
  
  try {
    return client;
  } catch (error) {
    client.release();
    throw error;
  }
}

// Execute query with error handling
export async function query(text: string, params?: any[]): Promise<any> {
  const db = getDatabase();
  const start = Date.now();
  
  try {
    const result = await db.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Query executed in ${duration}ms:`, { text, duration });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', { text, params, error });
    throw error;
  }
}

// Execute transaction
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// User operations
export const UserDB = {
  async findByEmail(email: string): Promise<any | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND status != $2',
      [email, 'deleted']
    );
    return result.rows[0] || null;
  },

  async findById(id: string): Promise<any | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1 AND status != $2',
      [id, 'deleted']
    );
    return result.rows[0] || null;
  },

  async create(userData: any): Promise<any> {
    const {
      email, password_hash, first_name, last_name, company, role, phone,
      email_verification_token, email_verification_expires_at
    } = userData;

    const result = await query(
      `INSERT INTO users (
        email, password_hash, first_name, last_name, company, role, phone,
        email_verification_token, email_verification_expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [email, password_hash, first_name, last_name, company, role, phone,
       email_verification_token, email_verification_expires_at]
    );
    
    return result.rows[0];
  },

  async update(id: string, updates: any): Promise<any> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const result = await query(
      `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    
    return result.rows[0];
  },

  async updateLastLogin(id: string, ipAddress?: string): Promise<void> {
    await query(
      'UPDATE users SET last_login_at = NOW(), last_login_ip = $1, last_activity_at = NOW() WHERE id = $2',
      [ipAddress, id]
    );
  },

  async incrementFailedAttempts(id: string): Promise<void> {
    await query(
      `UPDATE users SET 
        failed_login_attempts = failed_login_attempts + 1,
        locked_until = CASE 
          WHEN failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '30 minutes'
          ELSE locked_until
        END
       WHERE id = $1`,
      [id]
    );
  },

  async resetFailedAttempts(id: string): Promise<void> {
    await query(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1',
      [id]
    );
  },

  async isLocked(id: string): Promise<boolean> {
    const result = await query(
      'SELECT locked_until FROM users WHERE id = $1 AND locked_until > NOW()',
      [id]
    );
    return result.rows.length > 0;
  },

  async getUserWithOrganization(email: string): Promise<any | null> {
    const result = await query('SELECT get_user_with_organization($1) as user_data', [email]);
    return result.rows[0]?.user_data || null;
  }
};

// Organization operations
export const OrganizationDB = {
  async findById(id: string): Promise<any | null> {
    const result = await query('SELECT * FROM organizations WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findByDomain(domain: string): Promise<any | null> {
    const result = await query('SELECT * FROM organizations WHERE domain = $1', [domain]);
    return result.rows[0] || null;
  },

  async create(orgData: any): Promise<any> {
    const { name, domain, plan, settings } = orgData;

    const result = await query(
      'INSERT INTO organizations (name, domain, plan, settings) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, domain, plan || 'free', settings || {}]
    );
    
    return result.rows[0];
  },

  async update(id: string, updates: any): Promise<any> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const result = await query(
      `UPDATE organizations SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    
    return result.rows[0];
  }
};

// User-Organization membership operations
export const MembershipDB = {
  async create(membershipData: any): Promise<any> {
    const { user_id, organization_id, role, invited_by } = membershipData;

    const result = await query(
      `INSERT INTO user_organization_membership (
        user_id, organization_id, role, invited_by, joined_at
      ) VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [user_id, organization_id, role || 'member', invited_by]
    );
    
    return result.rows[0];
  },

  async findByUserId(userId: string): Promise<any[]> {
    const result = await query(
      `SELECT uom.*, o.name as organization_name, o.domain as organization_domain 
       FROM user_organization_membership uom 
       JOIN organizations o ON uom.organization_id = o.id 
       WHERE uom.user_id = $1 AND uom.is_active = true`,
      [userId]
    );
    return result.rows;
  },

  async findByOrganizationId(orgId: string): Promise<any[]> {
    const result = await query(
      `SELECT uom.*, u.email, u.first_name, u.last_name 
       FROM user_organization_membership uom 
       JOIN users u ON uom.user_id = u.id 
       WHERE uom.organization_id = $1 AND uom.is_active = true`,
      [orgId]
    );
    return result.rows;
  },

  async updateRole(userId: string, orgId: string, role: string): Promise<any> {
    const result = await query(
      `UPDATE user_organization_membership 
       SET role = $1, updated_at = NOW() 
       WHERE user_id = $2 AND organization_id = $3 AND is_active = true 
       RETURNING *`,
      [role, userId, orgId]
    );
    return result.rows[0];
  },

  async remove(userId: string, orgId: string): Promise<void> {
    await query(
      'UPDATE user_organization_membership SET is_active = false, updated_at = NOW() WHERE user_id = $1 AND organization_id = $2',
      [userId, orgId]
    );
  }
};

// MFA operations
export const MFADB = {
  async saveMFASecret(userId: string, secret: string, method: string, backupCodes: string[]): Promise<void> {
    await query(
      `UPDATE users SET 
        mfa_enabled = true, 
        mfa_secret = $1, 
        mfa_method = $2, 
        mfa_backup_codes = $3,
        mfa_enabled_at = NOW()
       WHERE id = $4`,
      [secret, method, backupCodes, userId]
    );

    // Store backup codes securely
    for (const code of backupCodes) {
      await this.saveBackupCode(userId, code);
    }
  },

  async saveBackupCode(userId: string, code: string): Promise<void> {
    const crypto = require('crypto');
    const codeHash = crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
    
    await query(
      'INSERT INTO mfa_backup_codes (user_id, code_hash) VALUES ($1, $2)',
      [userId, codeHash]
    );
  },

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const crypto = require('crypto');
    const codeHash = crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
    
    const result = await query(
      'UPDATE mfa_backup_codes SET used_at = NOW() WHERE user_id = $1 AND code_hash = $2 AND used_at IS NULL RETURNING id',
      [userId, codeHash]
    );
    
    return result.rows.length > 0;
  },

  async getBackupCodes(userId: string): Promise<string[]> {
    const result = await query(
      'SELECT COUNT(*) as remaining FROM mfa_backup_codes WHERE user_id = $1 AND used_at IS NULL',
      [userId]
    );
    return []; // Return count only for security
  },

  async disableMFA(userId: string): Promise<void> {
    await query(
      `UPDATE users SET 
        mfa_enabled = false, 
        mfa_secret = NULL, 
        mfa_method = NULL, 
        mfa_backup_codes = NULL 
       WHERE id = $1`,
      [userId]
    );
    
    await query('DELETE FROM mfa_backup_codes WHERE user_id = $1', [userId]);
  }
};

// Session operations
export const SessionDB = {
  async create(sessionData: any): Promise<any> {
    const { user_id, session_token, refresh_token, expires_at, ip_address, user_agent } = sessionData;

    const result = await query(
      `INSERT INTO user_sessions (
        user_id, session_token, refresh_token, expires_at, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, session_token, refresh_token, expires_at, ip_address, user_agent]
    );
    
    return result.rows[0];
  },

  async findByToken(sessionToken: string): Promise<any | null> {
    const result = await query(
      'SELECT * FROM user_sessions WHERE session_token = $1 AND is_active = true AND expires_at > NOW()',
      [sessionToken]
    );
    return result.rows[0] || null;
  },

  async updateLastUsed(sessionId: string): Promise<void> {
    await query(
      'UPDATE user_sessions SET last_used_at = NOW() WHERE id = $1',
      [sessionId]
    );
  },

  async invalidate(sessionToken: string): Promise<void> {
    await query(
      'UPDATE user_sessions SET is_active = false WHERE session_token = $1',
      [sessionToken]
    );
  },

  async invalidateUserSessions(userId: string): Promise<void> {
    await query(
      'UPDATE user_sessions SET is_active = false WHERE user_id = $1',
      [userId]
    );
  },

  async cleanupExpired(): Promise<number> {
    const result = await query('SELECT clean_expired_sessions() as cleaned');
    return parseInt(result.rows[0].cleaned);
  }
};

// SSO operations
export const SSODB = {
  async saveState(stateData: any): Promise<any> {
    const { state_token, nonce, provider, redirect_uri, expires_at } = stateData;

    const result = await query(
      `INSERT INTO sso_state (
        state_token, nonce, provider, redirect_uri, expires_at
      ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [state_token, nonce, provider, redirect_uri, expires_at]
    );
    
    return result.rows[0];
  },

  async getState(stateToken: string): Promise<any | null> {
    const result = await query(
      'SELECT * FROM sso_state WHERE state_token = $1 AND expires_at > NOW()',
      [stateToken]
    );
    return result.rows[0] || null;
  },

  async deleteState(stateToken: string): Promise<void> {
    await query('DELETE FROM sso_state WHERE state_token = $1', [stateToken]);
  },

  async cleanupExpired(): Promise<number> {
    const result = await query('SELECT clean_expired_sso_states() as cleaned');
    return parseInt(result.rows[0].cleaned);
  }
};

// Email verification operations
export const EmailDB = {
  async saveVerificationToken(email: string, token: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await query(
      'UPDATE users SET email_verification_token = $1, email_verification_expires_at = $2 WHERE email = $3',
      [token, expiresAt, email]
    );
  },

  async verifyEmail(token: string): Promise<any | null> {
    const result = await query(
      `UPDATE users SET 
        email_verified = true, 
        email_verification_token = NULL, 
        email_verification_expires_at = NULL,
        status = CASE WHEN status = 'pending_verification' THEN 'active' ELSE status END
       WHERE email_verification_token = $1 AND email_verification_expires_at > NOW()
       RETURNING *`,
      [token]
    );
    
    return result.rows[0] || null;
  },

  async isVerified(email: string): Promise<boolean> {
    const result = await query(
      'SELECT email_verified FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0]?.email_verified || false;
  }
};

// Password reset operations
export const PasswordDB = {
  async saveResetToken(email: string, token: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    await query(
      'UPDATE users SET password_reset_token = $1, password_reset_expires_at = $2 WHERE email = $3',
      [token, expiresAt, email]
    );
  },

  async verifyResetToken(token: string): Promise<any | null> {
    const result = await query(
      'SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires_at > NOW()',
      [token]
    );
    return result.rows[0] || null;
  },

  async resetPassword(userId: string, newPasswordHash: string): Promise<void> {
    await query(
      'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires_at = NULL WHERE id = $2',
      [newPasswordHash, userId]
    );
  }
};

// Audit log operations
export const AuditDB = {
  async log(data: any): Promise<void> {
    const { user_id, organization_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent, session_id } = data;

    await query(
      `INSERT INTO audit_log (
        user_id, organization_id, action, resource_type, resource_id,
        old_values, new_values, ip_address, user_agent, session_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [user_id, organization_id, action, resource_type, resource_id,
       old_values, new_values, ip_address, user_agent, session_id]
    );
  },

  async getUserAuditLog(userId: string, limit: number = 100): Promise<any[]> {
    const result = await query(
      `SELECT * FROM audit_log 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },

  async getOrganizationAuditLog(orgId: string, limit: number = 100): Promise<any[]> {
    const result = await query(
      `SELECT al.*, u.email, u.first_name, u.last_name
       FROM audit_log al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.organization_id = $1 
       ORDER BY al.created_at DESC 
       LIMIT $2`,
      [orgId, limit]
    );
    return result.rows;
  }
};

// Health check function
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as health');
    return result.rows[0].health === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Close database connection
export async function close(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
