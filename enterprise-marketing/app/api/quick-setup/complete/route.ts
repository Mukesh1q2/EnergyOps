import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const quickSetupSchema = z.object({
  userId: z.string(),
  completedSteps: z.array(z.string()),
  sampleData: z.object({
    uploaded: z.boolean(),
    type: z.string().nullable(),
    status: z.enum(['pending', 'processing', 'completed', 'error'])
  }),
  dashboard: z.object({
    pinnedWidgets: z.array(z.string()),
    layout: z.string(),
    preferences: z.record(z.any())
  })
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, completedSteps, sampleData, dashboard } = quickSetupSchema.parse(body)

    // Process quick setup completion
    const result = await processQuickSetup({
      userId,
      completedSteps,
      sampleData,
      dashboard
    })

    // Log quick setup completion
    await logQuickSetupEvent({
      userId,
      type: 'quick_setup_completed',
      timestamp: new Date(),
      metadata: {
        completedSteps,
        sampleDataType: sampleData.type,
        dashboardWidgets: dashboard.pinnedWidgets.length
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Quick setup completed successfully',
      data: result
    })

  } catch (error) {
    console.error('Quick setup completion error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to complete quick setup' },
      { status: 500 }
    )
  }
}

async function processQuickSetup(data: any) {
  const { userId, completedSteps, sampleData, dashboard } = data

  // Mark quick setup as completed
  await updateUserQuickSetupStatus(userId, {
    completed: true,
    completedSteps,
    completedAt: new Date()
  })

  // Process sample data if uploaded
  if (sampleData.uploaded && sampleData.type) {
    await importSampleData(userId, sampleData)
  }

  // Apply dashboard customization
  await applyDashboardCustomization(userId, dashboard)

  // Set up pinned widgets
  if (dashboard.pinnedWidgets.length > 0) {
    await setupPinnedWidgets(userId, dashboard.pinnedWidgets)
  }

  // Initialize default trading strategies if applicable
  if (completedSteps.includes('sample-data')) {
    await initializeDefaultStrategies(userId)
  }

  // Generate onboarding completion rewards/achievements
  await awardOnboardingAchievements(userId, completedSteps)

  return {
    quickSetupId: `quick_${Date.now()}`,
    completedAt: new Date(),
    achievements: completedSteps,
    nextRecommendations: [
      'Complete the full onboarding wizard for advanced features',
      'Connect your real trading accounts',
      'Set up automated trading strategies',
      'Invite your trading team'
    ]
  }
}

async function updateUserQuickSetupStatus(userId: string, statusData: any) {
  // Mock implementation - replace with database update
  console.log('Updating quick setup status:', userId, statusData)
}

async function importSampleData(userId: string, sampleData: any) {
  // Mock implementation - replace with data import service
  console.log('Importing sample data:', userId, sampleData)
}

async function applyDashboardCustomization(userId: string, dashboard: any) {
  // Mock implementation - replace with dashboard service
  console.log('Applying dashboard customization:', userId, dashboard)
}

async function setupPinnedWidgets(userId: string, widgets: string[]) {
  // Mock implementation - replace with widget service
  console.log('Setting up pinned widgets:', userId, widgets)
}

async function initializeDefaultStrategies(userId: string) {
  // Mock implementation - replace with strategy initialization
  console.log('Initializing default strategies:', userId)
}

async function awardOnboardingAchievements(userId: string, completedSteps: string[]) {
  // Mock implementation - replace with achievement system
  console.log('Awarding achievements:', userId, completedSteps)
}

async function logQuickSetupEvent(eventData: any) {
  // Mock implementation - replace with event logging
  console.log('Quick setup event logged:', eventData)
}