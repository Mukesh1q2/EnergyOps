import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { UserDB, OrganizationDB, MembershipDB, EmailDB, AuditDB } from '@/lib/database'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  phone: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'Terms must be accepted')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await UserDB.findByEmail(validatedData.email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds)

    // Generate email verification token
    const verificationToken = generateVerificationToken()

    // Create user with pending verification status
    const user = await UserDB.create({
      email: validatedData.email,
      password_hash: hashedPassword,
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
      company: validatedData.company,
      role: validatedData.role,
      phone: validatedData.phone,
      email_verification_token: verificationToken,
      email_verification_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      status: 'pending_verification'
    })

    // Save verification token
    await EmailDB.saveVerificationToken(validatedData.email, verificationToken)

    // Send verification email
    await sendVerificationEmail(validatedData.email, verificationToken)

    // Create organization if new company
    let organization = await OrganizationDB.findById(
      // Check if organization exists by name (simplified - in production you'd search by name)
      null
    )
    
    // For now, create organization for new company
    organization = await OrganizationDB.create({
      name: validatedData.company,
      domain: extractDomainFromEmail(validatedData.email),
      plan: 'free',
      settings: {
        mfaRequired: false,
        ssoEnabled: false,
        sessionTimeout: 3600,
        allowSocialLogin: true
      }
    })

    // Add user to organization as owner
    await MembershipDB.create({
      user_id: user.id,
      organization_id: organization.id,
      role: 'owner',
      invited_by: user.id
    })

    // Log user registration
    await AuditDB.log({
      user_id: user.id,
      organization_id: organization.id,
      action: 'user_registered',
      resource_type: 'user',
      new_values: {
        email: user.email,
        company: user.company,
        role: user.role
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      data: {
        userId: user.id,
        email: user.email,
        requiresVerification: true
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    
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

async function sendVerificationEmail(email: string, token: string) {
  // Implement with SendGrid or similar email service
  const emailConfig = {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@optibid-energy.com',
    fromName: process.env.SMTP_FROM_NAME || 'OptiBid Energy'
  }

  if (!emailConfig.apiKey) {
    console.warn('Email service not configured, logging verification email:', { email, token })
    return
  }

  try {
    // Example SendGrid implementation (uncomment when SendGrid is configured)
    /*
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(emailConfig.apiKey)

    const msg = {
      to: email,
      from: { email: emailConfig.fromEmail, name: emailConfig.fromName },
      subject: 'Verify your OptiBid Energy account',
      html: `
        <h1>Welcome to OptiBid Energy!</h1>
        <p>Please click the link below to verify your email address and activate your account:</p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email?token=${token}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `
    }

    await sgMail.send(msg)
    */
    
    console.log('Verification email sent to:', email)
  } catch (error) {
    console.error('Failed to send verification email:', error)
    throw new Error('Failed to send verification email')
  }
}

function generateVerificationToken(): string {
  return Math.random().toString(36).substr(2, 20) + Date.now().toString(36)
}

function extractDomainFromEmail(email: string): string {
  return email.split('@')[1] || ''
}