import { NextRequest, NextResponse } from 'next/server'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { z } from 'zod'
import crypto from 'crypto'
import { UserDB, MFADB, AuditDB } from '@/lib/database'

const setupSchema = z.object({
  userId: z.string(),
  method: z.enum(['totp', 'sms'])
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, method } = setupSchema.parse(body)

    // Get user from database
    const user = await UserDB.findById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user already has MFA enabled
    if (user.mfa_enabled) {
      return NextResponse.json(
        { error: 'MFA is already enabled for this user' },
        { status: 400 }
      )
    }

    if (method === 'totp') {
      return await setupTOTP(user)
    } else if (method === 'sms') {
      return await setupSMS(user)
    }

    return NextResponse.json(
      { error: 'Invalid MFA method' },
      { status: 400 }
    )

  } catch (error) {
    console.error('MFA setup error:', error)
    
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

async function setupTOTP(user: any) {
  // Generate TOTP secret
  const secret = speakeasy.generateSecret({
    name: `OptiBid Energy (${user.email})`,
    issuer: 'OptiBid Energy',
    length: 32
  })

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url)

  // Generate backup codes
  const backupCodes = generateBackupCodes()

  // Store temporary secret in user record (not yet enabled)
  await UserDB.update(user.id, {
    mfa_secret: secret.base32,
    mfa_method: 'totp',
    mfa_backup_codes: backupCodes
  })

  // Log MFA setup attempt
  await AuditDB.log({
    user_id: user.id,
    action: 'mfa_setup_initiated',
    resource_type: 'mfa',
    new_values: { method: 'totp' }
  })

  return NextResponse.json({
    success: true,
    data: {
      method: 'totp',
      secret: secret.base32,
      qrCodeUrl,
      backupCodes,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    }
  })
}

async function setupSMS(user: any) {
  if (!user.phone) {
    return NextResponse.json(
      { error: 'Phone number is required for SMS MFA' },
      { status: 400 }
    )
  }

  // Generate SMS verification code
  const smsCode = generateSMSCode()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  // Store SMS verification code temporarily (in production, use Redis or similar)
  // For now, we'll encode it in the user's record temporarily
  await UserDB.update(user.id, {
    phone_verification_code: smsCode,
    phone_verification_expires: expiresAt
  })

  // Send SMS (implement with Twilio or similar service)
  await sendSMSCode(user.phone, smsCode)

  // Log MFA setup attempt
  await AuditDB.log({
    user_id: user.id,
    action: 'mfa_setup_initiated',
    resource_type: 'mfa',
    new_values: { method: 'sms', phone: maskPhoneNumber(user.phone) }
  })

  return NextResponse.json({
    success: true,
    data: {
      method: 'sms',
      phoneMasked: maskPhoneNumber(user.phone),
      expiresAt
    }
  })
}

function generateBackupCodes(): string[] {
  const codes: string[] = []
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase())
  }
  return codes
}

function generateSMSCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function maskPhoneNumber(phone: string): string {
  if (phone.length <= 4) return phone
  return phone.replace(/.(?=.{4})/g, '*')
}

async function sendSMSCode(phone: string, code: string) {
  // Implement with Twilio or similar SMS service
  // This is a placeholder - implement with your SMS provider
  
  const smsConfig = {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_PHONE_NUMBER
  }

  if (!smsConfig.accountSid || !smsConfig.authToken || !smsConfig.fromNumber) {
    console.warn('SMS service not configured, logging to console:', { phone, code })
    return
  }

  try {
    // Example Twilio implementation (uncomment when Twilio is configured)
    /*
    const twilio = require('twilio')(smsConfig.accountSid, smsConfig.authToken)
    await twilio.messages.create({
      body: `Your OptiBid Energy verification code is: ${code}`,
      from: smsConfig.fromNumber,
      to: phone
    })
    */
    
    console.log('SMS code sent to', phone, 'with code:', code)
  } catch (error) {
    console.error('Failed to send SMS:', error)
    throw new Error('Failed to send SMS verification code')
  }
}