import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId

    // Get security events from database
    const events = await getSecurityEvents(userId)

    // Add mock events for demonstration
    const mockEvents = [
      {
        id: 'event_1',
        type: 'login',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        device: 'MacBook Pro (Chrome)',
        location: 'New York, US',
        ipAddress: '192.168.1.100',
        status: 'success'
      },
      {
        id: 'event_2',
        type: 'password_change',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        device: 'MacBook Pro (Chrome)',
        location: 'New York, US',
        ipAddress: '192.168.1.100',
        status: 'success'
      },
      {
        id: 'event_3',
        type: 'mfa_setup',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        device: 'iPhone 15 Pro',
        location: 'New York, US',
        ipAddress: '192.168.1.100',
        status: 'success'
      },
      {
        id: 'event_4',
        type: 'failed_login',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        device: 'Unknown Device',
        location: 'Moscow, Russia',
        ipAddress: '185.220.101.42',
        status: 'failed'
      },
      {
        id: 'event_5',
        type: 'suspicious_activity',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        device: 'Android Phone',
        location: 'Shanghai, China',
        ipAddress: '123.45.67.89',
        status: 'warning'
      }
    ]

    // Sort events by timestamp (newest first)
    const allEvents = [...events, ...mockEvents].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    // Filter events to last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentEvents = allEvents.filter(event => 
      new Date(event.timestamp) >= thirtyDaysAgo
    )

    return NextResponse.json({
      success: true,
      data: recentEvents
    })

  } catch (error) {
    console.error('Get security events error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve security events' },
      { status: 500 }
    )
  }
}

// Mock database function
async function getSecurityEvents(userId: string) {
  // Replace with actual database query
  return []
}