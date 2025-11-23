/**
 * Feature Flags API Route
 * 
 * Handles CRUD operations for organization feature settings,
 * feature validation, and template management.
 */

import { NextRequest, NextResponse } from 'next/server'
import { featureFlagService } from '@/lib/feature-flags/FeatureFlagService'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/features - List all features with organization settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' }, 
        { status: 400 }
      )
    }

    // Get all active features
    const allFeatures = await featureFlagService.getAllFeatures()
    
    // Get organization-specific settings
    const featuresWithSettings = await Promise.all(
      allFeatures.map(async (feature) => {
        const isEnabled = await featureFlagService.isFeatureEnabled(organizationId, feature.id)
        const config = await featureFlagService.getFeatureConfiguration(organizationId, feature.id)
        
        return {
          ...feature,
          organization_setting: {
            is_enabled: isEnabled,
            configuration: config
          }
        }
      })
    )

    return NextResponse.json({
      features: featuresWithSettings,
      total: featuresWithSettings.length
    })

  } catch (error) {
    console.error('Error fetching features:', error)
    return NextResponse.json(
      { error: 'Failed to fetch features' },
      { status: 500 }
    )
  }
}

// POST /api/features - Update feature settings (bulk or single)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, userId, featureUpdates, templateId } = body

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    // Validate user authentication (simplified - implement proper auth)
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      )
    }

    let result

    // Handle template application
    if (templateId) {
      await featureFlagService.applyTemplate(organizationId, templateId, userId)
      result = { message: 'Template applied successfully', templateId }
    } 
    // Handle bulk feature updates
    else if (featureUpdates) {
      await featureFlagService.setBulkFeatures(organizationId, featureUpdates, userId)
      result = { 
        message: 'Features updated successfully',
        updated_count: Object.keys(featureUpdates).length
      }
    }
    else {
      return NextResponse.json(
        { error: 'Either featureUpdates or templateId is required' },
        { status: 400 }
      )
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error updating features:', error)
    return NextResponse.json(
      { error: 'Failed to update features' },
      { status: 500 }
    )
  }
}

// GET /api/features/templates - Get available feature templates
export async function OPTIONS() {
  try {
    const templates = await featureFlagService.getAvailableTemplates()
    
    return NextResponse.json({
      templates: templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        target_audience: template.target_audience,
        use_cases: template.use_cases,
        feature_count: Object.keys(template.features).length
      }))
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}
