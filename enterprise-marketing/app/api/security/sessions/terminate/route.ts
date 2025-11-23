import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const terminateSchema = z.object({
  userId: z.string(),
  sessionId: z.string()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, sessionId } = terminateSchema.parse(body)

    // Validate session exists and belongs to user
    const session = await getSession(sessionId, userId)
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if trying to terminate current session
    if (session.isCurrent) {
      return NextResponse.json(
        { error: 'Cannot terminate current session' },
        { status: 400 }
      )
    }

    // Terminate session
    await terminateUserSession(sessionId, userId)

    // Log security event
    await logSecurityEvent({
      userId,
      type: 'session_terminated',
      description: 'User session terminated',
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date(),
      metadata: { sessionId, device: session.device }
    })

    return NextResponse.json({
      success: true,
      message: 'Session terminated successfully'
    })

  } catch (error) {
    console.error('Terminate session error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to terminate session' },
      { status: 500 }
    )
  }
}

async function getSession(sessionId: string, userId: string) {
  // Mock implementation - replace with database query
  return {
    id: sessionId,
    userId,
    device: 'Unknown Device',
    isCurrent: false
  }
}

async function terminateUserSession(sessionId: string, userId: string) {
  // Mock implementation - replace with database update
  console.log('Terminating session:', sessionId, 'for user:', userId)
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