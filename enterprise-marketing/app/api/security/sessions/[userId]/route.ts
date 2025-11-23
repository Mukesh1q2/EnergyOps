import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId

    // Get active sessions from database
    const sessions = await getActiveSessions(userId)

    // Add mock sessions for demonstration
    const mockSessions = [
      {
        id: 'session_1',
        device: 'MacBook Pro (Chrome)',
        location: 'New York, US',
        ipAddress: '192.168.1.100',
        lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        isCurrent: true
      },
      {
        id: 'session_2',
        device: 'iPhone 15 Pro (Safari)',
        location: 'San Francisco, US',
        ipAddress: '192.168.1.105',
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        isCurrent: false
      },
      {
        id: 'session_3',
        device: 'Windows Desktop (Edge)',
        location: 'London, UK',
        ipAddress: '10.0.0.50',
        lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        isCurrent: false
      }
    ]

    return NextResponse.json({
      success: true,
      data: [...sessions, ...mockSessions].sort((a, b) => 
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      )
    })

  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve sessions' },
      { status: 500 }
    )
  }
}

// Mock database function
async function getActiveSessions(userId: string) {
  // Replace with actual database query
  return []
}