import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { UserDB, OrganizationDB, MembershipDB, SSODB, AuditDB, SessionDB } from '@/lib/database'

const ssoCallbackSchema = z.object({
  code: z.string(),
  state: z.string(),
  provider: z.enum(['azure', 'okta', 'google', 'auth0'])
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, state, provider } = ssoCallbackSchema.parse(body)

    // Verify state parameter
    const storedState = await SSODB.getState(state)
    if (!storedState || storedState.provider !== provider) {
      return NextResponse.json(
        { error: 'Invalid state parameter' },
        { status: 400 }
      )
    }

    // Exchange authorization code for access token
    const tokenResponse = await exchangeCodeForToken(code, provider, storedState.redirect_uri)
    
    // Get user info from SSO provider
    const userInfo = await getUserInfoFromProvider(tokenResponse.access_token, provider)
    
    // Find or create user
    const user = await findOrCreateSSOUser(userInfo, provider)
    
    // Update last login
    await UserDB.updateLastLogin(user.id, storedState.ip_address)

    // Log SSO authentication
    await AuditDB.log({
      user_id: user.id,
      action: 'sso_auth_success',
      resource_type: 'sso',
      new_values: { provider, method: 'oauth2' },
      ip_address: storedState.ip_address,
      user_agent: storedState.user_agent
    })

    // Generate session token
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    const sessionToken = generateSessionToken(user.id, user.organizationId)
    
    await SessionDB.create({
      user_id: user.id,
      session_token: sessionToken,
      expires_at: expiresAt,
      ip_address: storedState.ip_address,
      user_agent: storedState.user_agent
    })

    // Clear used state
    await SSODB.deleteState(state)

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          company: user.company,
          role: user.role
        },
        organization: user.organization ? {
          id: user.organization.id,
          name: user.organization.name,
          plan: user.organization.plan
        } : null,
        sessionToken,
        requiresSetup: !user.email_verified
      }
    })

  } catch (error) {
    console.error('SSO callback error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'SSO authentication failed' },
      { status: 400 }
    )
  }
}

async function exchangeCodeForToken(code: string, provider: string, redirectUri?: string) {
  const tokenUrl = getTokenUrl(provider)
  const clientId = getClientId(provider)
  const clientSecret = getClientSecret(provider)
  
  const tokenData = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri || `${process.env.NEXT_PUBLIC_BASE_URL}/auth/sso/callback`,
    client_id: clientId,
    client_secret: clientSecret
  }

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(tokenData)
  })

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`)
  }

  return await response.json()
}

async function getUserInfoFromProvider(accessToken: string, provider: string) {
  const userInfoUrl = getUserInfoUrl(provider)
  
  const response = await fetch(userInfoUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.statusText}`)
  }

  const userData = await response.json()
  
  // Normalize user data across providers
  return normalizeUserData(userData, provider)
}

function normalizeUserData(userData: any, provider: string) {
  switch (provider) {
    case 'google':
      return {
        email: userData.email,
        firstName: userData.given_name,
        lastName: userData.family_name,
        picture: userData.picture,
        domain: userData.hd,
        verified: userData.verified_email
      }
    
    case 'azure':
      return {
        email: userData.email || userData.preferred_username,
        firstName: userData.given_name,
        lastName: userData.family_name,
        picture: userData.picture,
        domain: userData.tid,
        verified: true
      }
    
    case 'okta':
      return {
        email: userData.email,
        firstName: userData.given_name,
        lastName: userData.family_name,
        picture: userData.picture,
        domain: userData.domain,
        verified: userData.email_verified
      }
    
    case 'auth0':
      return {
        email: userData.email,
        firstName: userData.given_name || userData.name?.split(' ')[0],
        lastName: userData.family_name || userData.name?.split(' ').slice(1).join(' '),
        picture: userData.picture,
        domain: userData.identities?.[0]?.provider,
        verified: userData.email_verified
      }
    
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}

async function findOrCreateSSOUser(userInfo: any, provider: string) {
  // Check if user exists
  let user = await UserDB.findByEmail(userInfo.email)
  
  if (user) {
    // Update existing user with SSO info
    user = await UserDB.update(user.id, {
      sso_provider: provider,
      sso_id: userInfo.sub || userInfo.id,
      sso_data: userInfo,
      email_verified: userInfo.verified || true,
      last_login_at: new Date()
    })
  } else {
    // Create new user
    user = await UserDB.create({
      email: userInfo.email,
      first_name: userInfo.firstName,
      last_name: userInfo.lastName,
      password_hash: null, // No password for SSO users
      email_verified: userInfo.verified || true,
      sso_provider: provider,
      sso_id: userInfo.sub || userInfo.id,
      sso_data: userInfo,
      status: 'active',
      role: 'member'
    })
  }

  // Find or create organization based on domain
  let organization = null
  if (userInfo.domain) {
    organization = await OrganizationDB.findByDomain(userInfo.domain)
    if (!organization) {
      organization = await OrganizationDB.create({
        name: userInfo.domain.split('.')[0],
        domain: userInfo.domain,
        plan: 'enterprise'
      })
    }
    
    // Check if user is already member of organization
    const existingMembership = await MembershipDB.findByUserId(user.id)
    const isMember = existingMembership.some(m => m.organization_id === organization.id)
    
    if (!isMember) {
      // Add user to organization
      await MembershipDB.create({
        user_id: user.id,
        organization_id: organization.id,
        role: 'member'
      })
    }
  }

  // Get user with organization data
  const userData = await UserDB.getUserWithOrganization(userInfo.email)
  
  return {
    ...user,
    organization
  }
}

function getTokenUrl(provider: string): string {
  const tokenUrls = {
    azure: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    okta: `${getOktaDomain()}/oauth2/default/v1/token`,
    google: 'https://oauth2.googleapis.com/token',
    auth0: `https://${getAuth0Domain()}/oauth/token`
  }
  return tokenUrls[provider]
}

function getUserInfoUrl(provider: string): string {
  const userInfoUrls = {
    azure: 'https://graph.microsoft.com/v1.0/me',
    okta: `${getOktaDomain()}/oauth2/default/v1/userinfo`,
    google: 'https://www.googleapis.com/oauth2/v2/userinfo',
    auth0: `https://${getAuth0Domain()}/userinfo`
  }
  return userInfoUrls[provider]
}

function getClientId(provider: string): string {
  // Replace with environment variables
  const clientIds = {
    azure: process.env.AZURE_CLIENT_ID || 'azure-client-id',
    okta: process.env.OKTA_CLIENT_ID || 'okta-client-id',
    google: process.env.GOOGLE_CLIENT_ID || 'google-client-id',
    auth0: process.env.AUTH0_CLIENT_ID || 'auth0-client-id'
  }
  return clientIds[provider]
}

function getClientSecret(provider: string): string {
  // Replace with environment variables
  const clientSecrets = {
    azure: process.env.AZURE_CLIENT_SECRET || 'azure-client-secret',
    okta: process.env.OKTA_CLIENT_SECRET || 'okta-client-secret',
    google: process.env.GOOGLE_CLIENT_SECRET || 'google-client-secret',
    auth0: process.env.AUTH0_CLIENT_SECRET || 'auth0-client-secret'
  }
  return clientSecrets[provider]
}

function getOktaDomain(): string {
  return process.env.OKTA_DOMAIN || 'https://dev-123456.okta.com'
}

function getAuth0Domain(): string {
  return process.env.AUTH0_DOMAIN || 'your-tenant.auth0.com'
}

function generateSessionToken(userId: string, organizationId?: string): string {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}

function generateUserId(): string {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}



function generateOrgId(): string {
  return 'org_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}