import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const settingsSchema = z.object({
  userId: z.string(),
  settings: z.object({
    twoFactorEnabled: z.boolean(),
    sessionTimeout: z.number(),
    loginNotifications: z.boolean(),
    deviceVerification: z.boolean(),
    geoBlocking: z.boolean(),
    allowedCountries: z.array(z.string())
  })
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, settings } = settingsSchema.parse(body)

    // Update security settings in database
    await updateSecuritySettings(userId, settings)

    // Log security settings change
    await logSecurityEvent({
      userId,
      type: 'security_settings_changed',
      description: 'Security settings updated',
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date(),
      metadata: {
        changes: Object.keys(settings).filter(key => 
          settings[key as keyof typeof settings] !== undefined
        )
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Security settings updated successfully'
    })

  } catch (error) {
    console.error('Update security settings error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update security settings' },
      { status: 500 }
    )
  }
}

async function updateSecuritySettings(userId: string, settings: any) {
  // Mock implementation - replace with database update
  console.log('Updating security settings for user:', userId, settings)
}

async function logSecurityEvent(eventData: any) {
  // Mock implementation - replace with audit logging
  console.log('Security event logged:', eventData)
}

function getClientIP(request: NextRequest): string {
  // Get client IP from request headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('remote-addr')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (remoteAddr) {
    return remoteAddr
  }
  return 'unknown'
}