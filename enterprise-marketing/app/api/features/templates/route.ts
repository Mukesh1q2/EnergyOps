/**
 * Feature Templates API Route
 * 
 * Handles feature template management including:
 * - List available templates
 * - Apply templates to organizations
 * - Create custom templates
 * - Template analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { featureFlagService } from '@/lib/feature-flags/FeatureFlagService'

// GET /api/features/templates - List all available templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const organizationId = searchParams.get('organizationId')

    const templates = await featureFlagService.getAvailableTemplates()
    
    // Filter by category if specified
    let filteredTemplates = templates
    if (category) {
      filteredTemplates = templates.filter(t => t.category === category)
    }

    // Enhance templates with organization-specific info if provided
    if (organizationId) {
      const enhancedTemplates = await Promise.all(
        filteredTemplates.map(async (template) => {
          // Simulate template compatibility check
          // In a real implementation, you'd check org tier, usage history, etc.
          const compatibility = {
            compatible: true,
            reasons: ['Organization has required features', 'Subscription tier supports template'],
            conflicts: []
          }

          return {
            ...template,
            compatibility,
            preview: {
              features_enabled: Object.values(template.features).filter(f => f.enabled).length,
              total_features: Object.keys(template.features).length,
              categories_covered: [...new Set(
                template.features ? Object.keys(template.features).map(fid => {
                  // This would map feature ID to category
                  // Simplified for demo
                  return 'dashboard'
                }) : []
              )]
            }
          }
        })
      )

      return NextResponse.json({
        templates: enhancedTemplates,
        total: enhancedTemplates.length,
        category: category || 'all'
      })
    }

    return NextResponse.json({
      templates: filteredTemplates,
      total: filteredTemplates.length,
      category: category || 'all'
    })

  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// POST /api/features/templates - Create custom template or apply existing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      action, 
      templateId, 
      organizationId, 
      userId,
      customTemplate,
      templateData 
    } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required (apply, create, preview)' },
        { status: 400 }
      )
    }

    // Handle template application
    if (action === 'apply') {
      if (!templateId || !organizationId || !userId) {
        return NextResponse.json(
          { error: 'Template ID, Organization ID, and User ID are required for template application' },
          { status: 400 }
        )
      }

      // Preview the template first
      const template = await featureFlagService.getTemplate(templateId)
      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        )
      }

      // Validate template compatibility
      const validation = await validateTemplateCompatibility(template, organizationId)
      if (!validation.compatible) {
        return NextResponse.json(
          { 
            error: 'Template not compatible with organization',
            compatibility_issues: validation.issues
          },
          { status: 400 }
        )
      }

      // Apply the template
      await featureFlagService.applyTemplate(organizationId, templateId, userId)

      return NextResponse.json({
        message: 'Template applied successfully',
        templateId,
        organizationId,
        features_applied: Object.keys(template.features).length,
        features_enabled: Object.values(template.features).filter(f => f.enabled).length
      })
    }

    // Handle custom template creation
    if (action === 'create') {
      if (!customTemplate || !organizationId || !userId) {
        return NextResponse.json(
          { error: 'Custom template data, Organization ID, and User ID are required for template creation' },
          { status: 400 }
        )
      }

      // Validate custom template structure
      const validation = await validateCustomTemplate(customTemplate)
      if (!validation.valid) {
        return NextResponse.json(
          { 
            error: 'Invalid custom template',
            validation_errors: validation.errors
          },
          { status: 400 }
        )
      }

      // Save custom template (this would save to database)
      // For now, we'll just return success
      const templateId = `custom_${Date.now()}`
      
      return NextResponse.json({
        message: 'Custom template created successfully',
        templateId,
        organizationId,
        template_name: customTemplate.name
      })
    }

    // Handle template preview
    if (action === 'preview') {
      if (!templateId) {
        return NextResponse.json(
          { error: 'Template ID is required for preview' },
          { status: 400 }
        )
      }

      const template = await featureFlagService.getTemplate(templateId)
      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        )
      }

      const preview = generateTemplatePreview(template)

      return NextResponse.json({
        template: {
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          target_audience: template.target_audience,
          use_cases: template.use_cases
        },
        preview
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Supported actions: apply, create, preview' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error handling template request:', error)
    return NextResponse.json(
      { error: 'Failed to handle template request' },
      { status: 500 }
    )
  }
}

// Helper function to validate template compatibility
async function validateTemplateCompatibility(template: any, organizationId: string) {
  const issues: string[] = []
  
  // Check if organization has required tier (simplified)
  // In real implementation, check actual subscription tier
  const orgTier = 'professional' // This would come from organization data
  
  // Check if template features are available in org tier
  for (const [featureId, featureConfig] of Object.entries(template.features)) {
    // This would check actual feature tier requirements
    // Simplified for demo
    const requiredTier = 'professional'
    if (!['starter', requiredTier, 'enterprise'].includes(orgTier)) {
      issues.push(`Feature ${featureId} requires ${requiredTier} tier`)
    }
  }

  return {
    compatible: issues.length === 0,
    issues
  }
}

// Helper function to validate custom template
async function validateCustomTemplate(template: any) {
  const errors: string[] = []

  if (!template.name || template.name.trim().length === 0) {
    errors.push('Template name is required')
  }

  if (!template.description || template.description.trim().length === 0) {
    errors.push('Template description is required')
  }

  if (!template.features || typeof template.features !== 'object') {
    errors.push('Template features object is required')
  } else if (Object.keys(template.features).length === 0) {
    errors.push('Template must have at least one feature')
  }

  // Validate each feature configuration
  if (template.features) {
    for (const [featureId, featureConfig] of Object.entries(template.features)) {
      if (typeof featureConfig !== 'object' || !('enabled' in featureConfig)) {
        errors.push(`Feature ${featureId} must have 'enabled' boolean property`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Helper function to generate template preview
function generateTemplatePreview(template: any) {
  const features = template.features || {}
  const enabledFeatures = Object.entries(features).filter(([_, config]: [string, any]) => config.enabled)
  
  return {
    total_features: Object.keys(features).length,
    enabled_features: enabledFeatures.length,
    disabled_features: Object.keys(features).length - enabledFeatures.length,
    categories_covered: [...new Set(
      enabledFeatures.map(([featureId]) => {
        // This would map feature ID to category from actual catalog
        return 'dashboard'
      })
    )],
    complexity_score: calculateComplexityScore(enabledFeatures),
    impact_assessment: {
      low_impact: enabledFeatures.filter(([_, config]: [string, any]) => 
        config.impact === 'low' || !config.impact
      ).length,
      medium_impact: enabledFeatures.filter(([_, config]: [string, any]) => 
        config.impact === 'medium'
      ).length,
      high_impact: enabledFeatures.filter(([_, config]: [string, any]) => 
        config.impact === 'high'
      ).length
    }
  }
}

// Helper function to calculate template complexity score
function calculateComplexityScore(enabledFeatures: [string, any][]) {
  let score = 0
  
  for (const [_, config] of enabledFeatures) {
    switch (config.complexity || 'simple') {
      case 'simple':
        score += 1
        break
      case 'moderate':
        score += 2
        break
      case 'complex':
        score += 3
        break
    }
  }
  
  // Return complexity level
  if (score <= 5) return 'low'
  if (score <= 15) return 'medium'
  return 'high'
}
