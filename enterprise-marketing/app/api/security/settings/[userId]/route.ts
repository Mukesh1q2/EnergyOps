import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId

    // Get security settings from database
    const settings = await getSecuritySettings(userId)

    // Mock default settings if none exist
    const defaultSettings = {
      twoFactorEnabled: false,
      sessionTimeout: 3600, // 1 hour in seconds
      loginNotifications: true,
      deviceVerification: true,
      geoBlocking: false,
      allowedCountries: []
    }

    return NextResponse.json({
      success: true,
      data: settings || defaultSettings
    })

  } catch (error) {
    console.error('Get security settings error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve security settings' },
      { status: 500 }
    )
  }
}

// Mock database function
async function getSecuritySettings(userId: string) {
  // Replace with actual database query
  return null
}