import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const completionSchema = z.object({
  userId: z.string(),
  organizationId: z.string().optional(),
  data: z.object({
    companyInfo: z.object({
      name: z.string(),
      industry: z.string(),
      size: z.string(),
      website: z.string().optional()
    }),
    teamInfo: z.object({
      members: z.number(),
      roles: z.array(z.string()),
      requirements: z.array(z.string())
    }),
    integrations: z.object({
      emailProvider: z.string(),
      calendarProvider: z.string(),
      notificationChannels: z.array(z.string())
    }),
    preferences: z.object({
      timezone: z.string(),
      language: z.string(),
      currency: z.string(),
      dateFormat: z.string()
    })
  })
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, organizationId, data } = completionSchema.parse(body)

    // Complete onboarding process
    const result = await completeOnboarding({
      userId,
      organizationId,
      onboardingData: data
    })

    // Log onboarding completion
    await logOnboardingEvent({
      userId,
      organizationId,
      type: 'onboarding_completed',
      timestamp: new Date(),
      metadata: {
        completedSteps: Object.keys(data),
        companyName: data.companyInfo.name,
        industry: data.companyInfo.industry,
        teamSize: data.teamInfo.members
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: result
    })

  } catch (error) {
    console.error('Onboarding completion error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}

async function completeOnboarding(data: any) {
  // Update user profile with onboarding data
  await updateUserProfile(data.userId, {
    onboardingCompleted: true,
    onboardingData: data.onboardingData,
    completedAt: new Date()
  })

  // Update organization settings if applicable
  if (data.organizationId) {
    await updateOrganizationProfile(data.organizationId, {
      onboardingCompleted: true,
      companyInfo: data.onboardingData.companyInfo,
      teamInfo: data.onboardingData.teamInfo,
      integrationSettings: data.onboardingData.integrations,
      preferences: data.onboardingData.preferences
    })
  }

  // Set up integrations
  await setupIntegrations(data.userId, data.onboardingData.integrations)

  // Initialize user dashboard with preferences
  await initializeUserDashboard(data.userId, data.onboardingData.preferences)

  // Send welcome email
  await sendWelcomeEmail(data.userId, data.onboardingData.companyInfo)

  return {
    onboardingId: `onboard_${Date.now()}`,
    completedAt: new Date(),
    nextSteps: [
      'Explore the dashboard',
      'Set up your first trading strategy',
      'Connect real market data sources',
      'Invite team members'
    ]
  }
}

async function updateUserProfile(userId: string, profileData: any) {
  // Mock implementation - replace with database update
  console.log('Updating user profile:', userId, profileData)
}

async function updateOrganizationProfile(organizationId: string, orgData: any) {
  // Mock implementation - replace with database update
  console.log('Updating organization profile:', organizationId, orgData)
}

async function setupIntegrations(userId: string, integrations: any) {
  // Mock implementation - replace with integration setup
  console.log('Setting up integrations for user:', userId, integrations)
}

async function initializeUserDashboard(userId: string, preferences: any) {
  // Mock implementation - replace with dashboard initialization
  console.log('Initializing dashboard for user:', userId, preferences)
}

async function sendWelcomeEmail(userId: string, companyInfo: any) {
  // Mock implementation - replace with email service
  console.log('Sending welcome email to user:', userId, companyInfo)
}

async function logOnboardingEvent(eventData: any) {
  // Mock implementation - replace with event logging
  console.log('Onboarding event logged:', eventData)
}