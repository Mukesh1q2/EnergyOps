import { NextRequest, NextResponse } from 'next/server'
import speakeasy from 'speakeasy'
import { z } from 'zod'
import { UserDB, MFADB, AuditDB, SessionDB } from '@/lib/database'
import { createAuthToken } from '@/lib/auth'

const verifySchema = z.object({
  userId: z.string(),
  code: z.string(),
  method: z.enum(['totp', 'sms', 'backup_code']),
  backupCode: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, code, method, backupCode } = verifySchema.parse(body)

    // Get user from database
    const user = await UserDB.findById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (method === 'totp') {
      return await verifyTOTP(user, code)
    } else if (method === 'sms') {
      return await verifySMS(user, code)
    } else if (method === 'backup_code') {
      return await verifyBackupCode(user, backupCode!)
    }

    return NextResponse.json(
      { error: 'Invalid verification method' },
      { status: 400 }
    )

  } catch (error) {
    console.error('MFA verification error:', error)
    
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

async function verifyTOTP(user: any, code: string) {
  // Verify TOTP code with user's secret
  const isValid = speakeasy.totp.verify({
    secret: user.mfa_secret,
    encoding: 'base32',
    token: code,
    window: 2 // Allow 2 time steps (30 seconds) of clock drift
  })

  if (!isValid) {
    // Log failed attempt
    await AuditDB.log({
      user_id: user.id,
      action: 'mfa_verify_failed',
      resource_type: 'mfa',
      new_values: { method: 'totp', reason: 'invalid_code' }
    })
    
    return NextResponse.json(
      { error: 'Invalid verification code' },
      { status: 400 }
    )
  }

  // Enable MFA for user (already enabled during setup, this confirms verification)
  await MFADB.saveMFASecret(user.id, user.mfa_secret, 'totp', user.mfa_backup_codes)

  // Log successful verification
  await AuditDB.log({
    user_id: user.id,
    action: 'mfa_enabled',
    resource_type: 'mfa',
    new_values: { method: 'totp' }
  })

  // Generate session token
  const sessionToken = generateSessionToken(user.id)

  return NextResponse.json({
    success: true,
    message: 'MFA enabled successfully',
    data: {
      sessionToken,
      mfaEnabled: true
    }
  })
}

async function verifySMS(user: any, code: string) {
  // Check if SMS verification is in progress
  if (!user.phone_verification_code || !user.phone_verification_expires) {
    return NextResponse.json(
      { error: 'No SMS verification in progress' },
      { status: 400 }
    )
  }

  // Check if code is valid and not expired
  const now = new Date()
  const expiresAt = new Date(user.phone_verification_expires)
  
  if (user.phone_verification_code !== code || now > expiresAt) {
    // Clear expired/invalid code
    await UserDB.update(user.id, {
      phone_verification_code: null,
      phone_verification_expires: null
    })
    
    // Log failed attempt
    await AuditDB.log({
      user_id: user.id,
      action: 'mfa_verify_failed',
      resource_type: 'mfa',
      new_values: { method: 'sms', reason: 'invalid_or_expired_code' }
    })
    
    return NextResponse.json(
      { error: 'Invalid or expired verification code' },
      { status: 400 }
    )
  }

  // Generate backup codes for SMS MFA
  const backupCodes = generateBackupCodes()

  // Enable SMS MFA for user
  await MFADB.saveMFASecret(user.id, null, 'sms', backupCodes)
  
  // Clear temporary SMS code
  await UserDB.update(user.id, {
    phone_verification_code: null,
    phone_verification_expires: null
  })

  // Log successful verification
  await AuditDB.log({
    user_id: user.id,
    action: 'mfa_enabled',
    resource_type: 'mfa',
    new_values: { method: 'sms' }
  })

  // Generate session token
  const sessionToken = generateSessionToken(user.id)

  return NextResponse.json({
    success: true,
    message: 'SMS MFA enabled successfully',
    data: {
      sessionToken,
      mfaEnabled: true,
      backupCodes
    }
  })
}

async function verifyBackupCode(user: any, backupCode: string) {
  // Verify backup code
  const isValid = await MFADB.verifyBackupCode(user.id, backupCode)
  
  if (!isValid) {
    // Log failed attempt
    await AuditDB.log({
      user_id: user.id,
      action: 'mfa_verify_failed',
      resource_type: 'mfa',
      new_values: { method: 'backup_code', reason: 'invalid_code' }
    })
    
    return NextResponse.json(
      { error: 'Invalid backup code' },
      { status: 400 }
    )
  }

  // Log successful backup code usage
  await AuditDB.log({
    user_id: user.id,
    action: 'mfa_verified',
    resource_type: 'mfa',
    new_values: { method: 'backup_code' }
  })

  // Generate session token
  const sessionToken = generateSessionToken(user.id)

  // Get remaining backup codes count
  const remainingCodes = await MFADB.getBackupCodes(user.id)

  return NextResponse.json({
    success: true,
    message: 'Backup code verified successfully',
    data: {
      sessionToken,
      remainingCodes: remainingCodes.length
    }
  })
}

function generateBackupCodes(): string[] {
  const codes: string[] = []
  for (let i = 0; i < 10; i++) {
    codes.push(require('crypto').randomBytes(4).toString('hex').toUpperCase())
  }
  return codes
}

function generateSessionToken(userId: string): string {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}