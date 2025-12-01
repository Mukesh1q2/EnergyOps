import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { UserDB, SessionDB, MFADB, PasswordDB, AuditDB } from './database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Generate JWT token
export function generateToken(userId: string, email: string, role: string, expiresIn: string = '7d'): string {
  return jwt.sign(
    {
      user: {
        id: userId,
        email: email,
        role: role
      }
    },
    JWT_SECRET,
    { expiresIn }
  )
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  permissions: string[]
  organizationId?: string
  mfaEnabled?: boolean
  emailVerified?: boolean
}

// Role-based permissions mapping
const ROLE_PERMISSIONS = {
  analyst: [
    'dashboard.view', 'dashboard.create', 'dashboard.edit', 'dashboard.share',
    'widget.view', 'widget.create', 'widget.edit', 'widget.delete', 'widget.configure',
    'data.view-energy', 'data.view-market', 'data.view-asset', 'data.export',
    'team.view', 'team.invite', 'team.collaborate'
  ],
  editor: [
    'dashboard.view', 'dashboard.create', 'dashboard.edit',
    'widget.view', 'widget.create', 'widget.edit',
    'data.view-energy', 'data.view-market', 'data.export',
    'team.view', 'team.collaborate'
  ],
  admin: [
    'dashboard.view', 'dashboard.create', 'dashboard.edit', 'dashboard.delete', 'dashboard.share',
    'widget.view', 'widget.create', 'widget.edit', 'widget.delete', 'widget.configure',
    'data.view-energy', 'data.view-market', 'data.view-asset', 'data.export',
    'team.view', 'team.invite', 'team.manage', 'team.collaborate',
    'admin.users', 'admin.roles', 'admin.system', 'admin.audit',
    'security.view', 'security.manage'
  ],
  owner: [
    'dashboard.view', 'dashboard.create', 'dashboard.edit', 'dashboard.delete', 'dashboard.share',
    'widget.view', 'widget.create', 'widget.edit', 'widget.delete', 'widget.configure',
    'data.view-energy', 'data.view-market', 'data.view-asset', 'data.export',
    'team.view', 'team.invite', 'team.manage', 'team.collaborate',
    'admin.users', 'admin.roles', 'admin.system', 'admin.audit',
    'security.view', 'security.manage',
    'billing.view', 'billing.manage', 'organization.manage'
  ]
}

export async function verifyAuthToken(token: string): Promise<User | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // DEMO MODE: Skip database checks and use token data directly
    // In production, uncomment the database checks below
    
    /*
    // Check if session exists and is valid
    const session = await SessionDB.findByToken(token)
    if (!session) {
      return null
    }

    // Get fresh user data from database
    const user = await UserDB.findById(decoded.user.id)
    if (!user || user.status !== 'active') {
      return null
    }

    // Update last activity
    await UserDB.update(user.id, { last_activity_at: new Date() })
    await SessionDB.updateLastUsed(session.id)
    */

    // For demo mode, return user data from the JWT token
    const userFromToken = decoded.user
    if (!userFromToken) {
      console.error('No user data in token')
      return null
    }

    // Return user with permissions based on role
    return {
      id: userFromToken.id,
      email: userFromToken.email,
      firstName: userFromToken.firstName || 'User',
      lastName: userFromToken.lastName || '',
      role: userFromToken.role,
      permissions: ROLE_PERMISSIONS[userFromToken.role as keyof typeof ROLE_PERMISSIONS] || ROLE_PERMISSIONS.editor,
      organizationId: userFromToken.organizationId || 'org_1',
      mfaEnabled: false,
      emailVerified: true
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function authenticateUser(email: string, password: string, ipAddress?: string): Promise<{ user: User; token: string } | null> {
  try {
    // Get user with organization data
    const userData = await UserDB.getUserWithOrganization(email)
    if (!userData || !userData.user) {
      return null
    }

    const user = userData.user

    // Check if account is active
    if (user.status !== 'active') {
      return null
    }

    // Check if account is locked
    if (await UserDB.isLocked(user.id)) {
      return null
    }

    // Verify password
    if (!user.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
      // Increment failed attempts
      await UserDB.incrementFailedAttempts(user.id)
      
      // Log failed authentication
      await AuditDB.log({
        user_id: user.id,
        action: 'auth_failed',
        ip_address: ipAddress,
        new_values: { reason: 'invalid_password' }
      })
      
      return null
    }

    // Reset failed attempts on successful password verification
    await UserDB.resetFailedAttempts(user.id)

    // Update last login
    await UserDB.updateLastLogin(user.id, ipAddress)

    // Create session token
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    const sessionToken = generateSecureToken()
    
    await SessionDB.create({
      user_id: user.id,
      session_token: sessionToken,
      expires_at: expiresAt,
      ip_address: ipAddress,
      user_agent: 'Unknown' // Will be populated from request
    })

    // Create JWT token
    const token = jwt.sign(
      { 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          permissions: ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [],
          organizationId: userData.organization?.id || null,
          mfaEnabled: user.mfa_enabled,
          emailVerified: user.email_verified
        }
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Log successful authentication
    await AuditDB.log({
      user_id: user.id,
      action: 'auth_success',
      ip_address: ipAddress,
      new_values: { login_method: 'password' }
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        permissions: ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [],
        organizationId: userData.organization?.id || null,
        mfaEnabled: user.mfa_enabled,
        emailVerified: user.email_verified
      },
      token: sessionToken // Use session token for API calls
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const user = await UserDB.findById(userId)
    
    if (!user || user.status !== 'active') {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      permissions: ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [],
      organizationId: null, // Will need separate query for organization
      mfaEnabled: user.mfa_enabled,
      emailVerified: user.email_verified
    }
  } catch (error) {
    console.error('Error getting user by ID:', error)
    return null
  }
}

export async function createAuthToken(user: User): Promise<string> {
  return jwt.sign({ user }, JWT_SECRET, { expiresIn: '24h' })
}

// Utility functions
function generateSecureToken(): string {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}

export async function invalidateUserToken(token: string): Promise<void> {
  await SessionDB.invalidate(token)
  
  // Log token invalidation
  const session = await SessionDB.findByToken(token)
  if (session) {
    await AuditDB.log({
      user_id: session.user_id,
      action: 'logout',
      new_values: { token_invalidated: true }
    })
  }
}

export async function invalidateUserSessions(userId: string): Promise<void> {
  await SessionDB.invalidateUserSessions(userId)
  
  // Log session invalidation
  await AuditDB.log({
    user_id: userId,
    action: 'all_sessions_invalidated',
    new_values: { reason: 'user_action' }
  })
}

// Helper function to extract token from request headers
export function extractTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.substring(7)
}

/**
 * Format an Authorization header with Bearer token
 * @param token - The JWT token string
 * @returns Formatted Authorization header value "Bearer {token}"
 */
export function formatAuthHeader(token: string): string {
  return `Bearer ${token}`
}

// Middleware function for API routes
export async function requireAuth(request: Request): Promise<{ user: User; token: string } | Response> {
  const token = extractTokenFromRequest(request)
  
  if (!token) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  const user = await verifyAuthToken(token)
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid authentication token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  return { user, token }
}