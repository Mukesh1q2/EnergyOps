import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ssoInitiateSchema = z.object({
  provider: z.enum(['azure', 'okta', 'google', 'auth0']),
  redirectUri: z.string().url().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, redirectUri } = ssoInitiateSchema.parse(body)

    // Generate state parameter for CSRF protection
    const state = generateState()
    const nonce = generateNonce()

    // Store state in session/database for verification
    await storeSSOState(state, { provider, nonce, redirectUri })

    // Generate SSO authorization URL
    const authUrl = generateSSOAuthUrl(provider, state, nonce, redirectUri)

    return NextResponse.json({
      success: true,
      data: {
        authUrl,
        state,
        provider
      }
    })

  } catch (error) {
    console.error('SSO initiate error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateSSOAuthUrl(provider: string, state: string, nonce: string, redirectUri?: string): string {
  const clientId = getClientId(provider)
  const redirect = redirectUri || `${process.env.NEXT_PUBLIC_BASE_URL}/auth/sso/callback`
  
  switch (provider) {
    case 'azure':
      return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirect)}&` +
        `scope=openid profile email&` +
        `state=${state}&` +
        `nonce=${nonce}`
    
    case 'okta':
      return `${getOktaDomain()}/oauth2/default/v1/authorize?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirect)}&` +
        `scope=openid profile email&` +
        `state=${state}&` +
        `nonce=${nonce}`
    
    case 'google':
      return `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirect)}&` +
        `scope=openid profile email&` +
        `state=${state}&` +
        `nonce=${nonce}`
    
    case 'auth0':
      return `https://${getAuth0Domain()}/authorize?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirect)}&` +
        `scope=openid profile email&` +
        `state=${state}&` +
        `nonce=${nonce}`
    
    default:
      throw new Error(`Unsupported SSO provider: ${provider}`)
  }
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

function getOktaDomain(): string {
  return process.env.OKTA_DOMAIN || 'https://dev-123456.okta.com'
}

function getAuth0Domain(): string {
  return process.env.AUTH0_DOMAIN || 'your-tenant.auth0.com'
}

function generateState(): string {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}

function generateNonce(): string {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}

async function storeSSOState(state: string, data: any) {
  // Store in session or database with expiration
  console.log('Storing SSO state:', state, data)
}

// GET endpoint for direct redirects (when users click SSO buttons)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')
    const redirectUri = searchParams.get('redirect_uri') || undefined

    if (!provider || !['azure', 'okta', 'google', 'auth0'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid or missing SSO provider' },
        { status: 400 }
      )
    }

    // Generate state and initiate SSO flow
    const state = generateState()
    const nonce = generateNonce()
    
    await storeSSOState(state, { provider, nonce, redirectUri })
    const authUrl = generateSSOAuthUrl(provider, state, nonce, redirectUri)

    // Redirect to SSO provider
    return NextResponse.redirect(authUrl)

  } catch (error) {
    console.error('SSO GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}