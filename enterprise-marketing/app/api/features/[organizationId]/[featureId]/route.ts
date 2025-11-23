/**
 * Individual Feature API Route
 * 
 * Handles CRUD operations for individual features
 * including validation, configuration, and dependency checking.
 */

import { NextRequest, NextResponse } from 'next/server'
import { featureFlagService } from '@/lib/feature-flags/FeatureFlagService'
import { COMPLETE_FEATURE_CATALOG } from '@/lib/feature-flags/FeatureCatalog'

// GET /api/features/[organizationId]/[featureId] - Get specific feature
export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string; featureId: string } }
) {
  try {
    const { organizationId, featureId } = params

    if (!organizationId || !featureId) {
      return NextResponse.json(
        { error: 'Organization ID and Feature ID are required' },
        { status: 400 }
      )
    }

    // Find the feature in the catalog
    const feature = COMPLETE_FEATURE_CATALOG.find(f => f.id === featureId)
    if (!feature) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      )
    }

    // Get organization-specific settings
    const isEnabled = await featureFlagService.isFeatureEnabled(organizationId, featureId)
    const config = await featureFlagService.getFeatureConfiguration(organizationId, featureId)

    // Validate feature dependencies and conflicts
    const validation = await featureFlagService['validateFeatureChange'](
      organizationId,
      featureId,
      isEnabled
    )

    // Get dependent features status
    const dependencyStatus = {}
    for (const depId of feature.dependencies) {
      dependencyStatus[depId] = await featureFlagService.isFeatureEnabled(organizationId, depId)
    }

    // Get conflicting features status
    const conflictStatus = {}
    for (const conflictId of feature.conflicts) {
      conflictStatus[conflictId] = await featureFlagService.isFeatureEnabled(organizationId, conflictId)
    }

    return NextResponse.json({
      feature: {
        id: feature.id,
        name: feature.name,
        description: feature.description,
        category: feature.category,
        is_active: feature.is_active,
        default_enabled: feature.default_enabled,
        dependencies: feature.dependencies,
        conflicts: feature.conflicts,
        tiers: feature.tiers,
        metadata: feature.metadata
      },
      organization_setting: {
        is_enabled: isEnabled,
        configuration: config
      },
      validation: {
        valid: validation.valid,
        errors: validation.errors
      },
      dependency_status: dependencyStatus,
      conflict_status: conflictStatus
    })

  } catch (error) {
    console.error('Error fetching feature:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feature' },
      { status: 500 }
    )
  }
}

// POST /api/features/[organizationId]/[featureId] - Update specific feature
export async function POST(
  request: NextRequest,
  { params }: { params: { organizationId: string; featureId: string } }
) {
  try {
    const { organizationId, featureId } = params
    const body = await request.json()
    const { enabled, configuration, userId } = body

    if (!organizationId || !featureId) {
      return NextResponse.json(
        { error: 'Organization ID and Feature ID are required' },
        { status: 400 }
      )
    }

    // Validate feature exists
    const feature = COMPLETE_FEATURE_CATALOG.find(f => f.id === featureId)
    if (!feature) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      )
    }

    // Validate the feature change
    const validation = await featureFlagService['validateFeatureChange'](
      organizationId,
      featureId,
      enabled
    )

    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Feature validation failed',
          validation_errors: validation.errors
        },
        { status: 400 }
      )
    }

    // Update the feature
    await featureFlagService.setFeatureEnabled(
      organizationId,
      featureId,
      enabled,
      configuration,
      userId
    )

    // Log the change (you might want to implement this in the service)
    // await featureFlagService.logFeatureChange(...)

    return NextResponse.json({
      message: 'Feature updated successfully',
      featureId,
      organizationId,
      enabled,
      configuration
    })

  } catch (error) {
    console.error('Error updating feature:', error)
    return NextResponse.json(
      { error: 'Failed to update feature' },
      { status: 500 }
    )
  }
}

// PUT /api/features/[organizationId]/[featureId] - Update feature configuration only
export async function PUT(
  request: NextRequest,
  { params }: { params: { organizationId: string; featureId: string } }
) {
  try {
    const { organizationId, featureId } = params
    const body = await request.json()
    const { configuration, userId } = body

    if (!organizationId || !featureId) {
      return NextResponse.json(
        { error: 'Organization ID and Feature ID are required' },
        { status: 400 }
      )
    }

    // Validate feature exists
    const feature = COMPLETE_FEATURE_CATALOG.find(f => f.id === featureId)
    if (!feature) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      )
    }

    // Get current setting
    const currentEnabled = await featureFlagService.isFeatureEnabled(organizationId, featureId)
    
    // Update with current enabled state but new configuration
    await featureFlagService.setFeatureEnabled(
      organizationId,
      featureId,
      currentEnabled,
      configuration,
      userId
    )

    return NextResponse.json({
      message: 'Feature configuration updated successfully',
      featureId,
      organizationId,
      configuration
    })

  } catch (error) {
    console.error('Error updating feature configuration:', error)
    return NextResponse.json(
      { error: 'Failed to update feature configuration' },
      { status: 500 }
    )
  }
}

// DELETE /api/features/[organizationId]/[featureId] - Reset feature to default
export async function DELETE(
  request: NextRequest,
  { params }: { params: { organizationId: string; featureId: string } }
) {
  try {
    const { organizationId, featureId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!organizationId || !featureId) {
      return NextResponse.json(
        { error: 'Organization ID and Feature ID are required' },
        { status: 400 }
      )
    }

    // Validate feature exists
    const feature = COMPLETE_FEATURE_CATALOG.find(f => f.id === featureId)
    if (!feature) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      )
    }

    // Reset to default enabled state
    await featureFlagService.setFeatureEnabled(
      organizationId,
      featureId,
      feature.default_enabled,
      {}, // Clear custom configuration
      userId
    )

    return NextResponse.json({
      message: 'Feature reset to default',
      featureId,
      organizationId,
      default_enabled: feature.default_enabled
    })

  } catch (error) {
    console.error('Error resetting feature:', error)
    return NextResponse.json(
      { error: 'Failed to reset feature' },
      { status: 500 }
    )
  }
}

// GET /api/features/[organizationId]/[featureId]/validate - Validate feature change
export async function OPTIONS(
  request: NextRequest,
  { params }: { params: { organizationId: string; featureId: string } }
) {
  try {
    const { organizationId, featureId } = params
    const { searchParams } = new URL(request.url)
    const enabled = searchParams.get('enabled') === 'true'

    if (!organizationId || !featureId) {
      return NextResponse.json(
        { error: 'Organization ID and Feature ID are required' },
        { status: 400 }
      )
    }

    const validation = await featureFlagService['validateFeatureChange'](
      organizationId,
      featureId,
      enabled
    )

    return NextResponse.json({
      featureId,
      organizationId,
      proposed_enabled: enabled,
      validation
    })

  } catch (error) {
    console.error('Error validating feature:', error)
    return NextResponse.json(
      { error: 'Failed to validate feature' },
      { status: 500 }
    )
  }
}
