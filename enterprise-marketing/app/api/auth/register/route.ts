import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
// Temporarily disable database imports for demo
// import { UserDB, OrganizationDB, MembershipDB, EmailDB, AuditDB } from '@/lib/database'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  company: z.string().min(1, 'Company is required').optional(),
  role: z.string().min(1, 'Role is required').optional(),
  phone: z.string().optional(),
  acceptTerms: z.boolean().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Registration attempt:', { email: body.email })
    
    const validatedData = registerSchema.parse(body)

    // DEMO MODE: For now, just show success message without database
    // In production, this would create a real user in the database
    
    console.log('Registration successful (demo mode):', validatedData.email)
    
    return NextResponse.json({
      success: true,
      message: 'Registration is currently in demo mode. Please use the test credentials to login:\n\nAdmin: admin@optibid.com / admin123\nDemo: demo@optibid.com / demo123',
      data: {
        email: validatedData.email,
        note: 'Database not configured. Use test accounts for login.'
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