/**
 * Organization Features API Route
 * 
 * Handles organization-specific feature settings,
 * validation, and user preferences.
 */

import { NextRequest, NextResponse } from 'next/server'
import { featureFlagService } from '@/lib/feature-flags/FeatureFlagService'
import { COMPLETE_FEATURE_CATALOG } from '@/lib/feature-flags/FeatureCatalog'

// GET /api/features/[organizationId] - Get organization feature settings
export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { organizationId } = params

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    // Get all features and their organization settings
    const allFeatures = await featureFlagService.getAllFeatures()
    const organizationFeatures = []

    for (const feature of allFeatures) {
      const isEnabled = await featureFlagService.isFeatureEnabled(organizationId, feature.id)
      const config = await featureFlagService.getFeatureConfiguration(organizationId, feature.id)

      organizationFeatures.push({
        id: feature.id,
        name: feature.name,
        description: feature.description,
        category: feature.category,
        is_enabled: isEnabled,
        configuration: config,
        metadata: feature.metadata,
        dependencies: feature.dependencies,
        conflicts: feature.conflicts,
        tiers: feature.tiers
      })
    }

    // Get user dashboard preferences
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    let userPreferences = []
    if (userId) {
      userPreferences = await featureFlagService.getUserDashboardPreferences(
        userId, 
        organizationId
      )
    }

    return NextResponse.json({
      organizationId,
      features: organizationFeatures,
      userPreferences,
      summary: {
        total_features: organizationFeatures.length,
        enabled_features: organizationFeatures.filter(f => f.is_enabled).length,
        disabled_features: organizationFeatures.filter(f => !f.is_enabled).length
      }
    })

  } catch (error) {
    console.error('Error fetching organization features:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization features' },
      { status: 500 }
    )
  }
}

// POST /api/features/[organizationId] - Update organization feature settings
export async function POST(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { organizationId } = params
    const body = await request.json()
    const { 
      userId, 
      featureUpdates, 
      templateId, 
      bulkUpdate,
      validationOnly = false 
    } = body

    if (!organizationId || !userId) {
      return NextResponse.json(
        { error: 'Organization ID and User ID are required' },
        { status: 400 }
      )
    }

    // Handle template application
    if (templateId) {
      if (!validationOnly) {
        await featureFlagService.applyTemplate(organizationId, templateId, userId)
      }
      
      return NextResponse.json({
        message: 'Template validation successful',
        templateId,
        would_be_applied: !validationOnly
      })
    }

    // Handle feature updates
    if (featureUpdates) {
      // Validate all changes first
      const validationResults = {}
      
      for (const [featureId, update] of Object.entries(featureUpdates)) {
        const validation = await featureFlagService['validateFeatureChange'](
          organizationId,
          featureId,
          update.enabled
        )
        validationResults[featureId] = validation
      }

      // Check if all validations passed
      const allValid = Object.values(validationResults).every(
        (result: any) => result.valid
      )

      if (!allValid) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            validation_results: validationResults
          },
          { status: 400 }
        )
      }

      if (!validationOnly) {
        await featureFlagService.setBulkFeatures(organizationId, featureUpdates, userId)
      }

      return NextResponse.json({
        message: 'Features validation successful',
        validation_results: validationResults,
        would_be_applied: !validationOnly,
        updated_count: Object.keys(featureUpdates).length
      })
    }

    return NextResponse.json(
      { error: 'Either featureUpdates or templateId is required' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating organization features:', error)
    return NextResponse.json(
      { error: 'Failed to update organization features' },
      { status: 500 }
    )
  }
}

// PUT /api/features/[organizationId]/preferences - Update user preferences
export async function PUT(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { organizationId } = params
    const body = await request.json()
    const { userId, widgetId, preferences } = body

    if (!organizationId || !userId || !widgetId) {
      return NextResponse.json(
        { error: 'Organization ID, User ID, and Widget ID are required' },
        { status: 400 }
      )
    }

    await featureFlagService.updateUserWidgetPreference(
      userId,
      organizationId,
      widgetId,
      preferences
    )

    return NextResponse.json({
      message: 'User preferences updated successfully',
      organizationId,
      userId,
      widgetId
    })

  } catch (error) {
    console.error('Error updating user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update user preferences' },
      { status: 500 }
    )
  }
}
