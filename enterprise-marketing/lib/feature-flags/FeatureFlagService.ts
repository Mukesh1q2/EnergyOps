/**
 * Feature Flag Service - Enterprise Customization Engine
 * 
 * Provides comprehensive feature management for organization-specific
 * dashboard customization and widget control.
 */

import { createClient } from '@supabase/supabase-js'

// Feature definitions with comprehensive categorization
export interface FeatureDefinition {
  id: string
  name: string
  description: string
  category: FeatureCategory
  is_active: boolean
  default_enabled: boolean
  dependencies: string[] // Features this feature depends on
  conflicts: string[]    // Features this feature conflicts with
  tiers: string[]        // Available subscription tiers
  metadata: {
    widget_types?: string[]     // Widget types this feature enables
    api_endpoints?: string[]    // API endpoints this feature controls
    page_components?: string[]  // Page components this feature affects
    permissions?: string[]      // Required permissions
    cost_impact?: 'low' | 'medium' | 'high'
    performance_impact?: 'none' | 'low' | 'medium' | 'high'
    complexity: 'simple' | 'moderate' | 'complex'
  }
  created_at: Date
  updated_at: Date
}

export interface OrganizationFeatureSetting {
  id: string
  organization_id: string
  feature_id: string
  is_enabled: boolean
  configuration: Record<string, any>
  tier_restrictions?: string[]
  user_restrictions?: string[]
  created_at: Date
  updated_at: Date
  created_by: string
  updated_by: string
}

export interface UserDashboardPreferences {
  id: string
  user_id: string
  widget_id: string
  organization_id: string
  is_visible: boolean
  position_x: number
  position_y: number
  size_w: number
  size_h: number
  custom_settings: Record<string, any>
  is_favorite: boolean
  last_used: Date
}

export type FeatureCategory = 
  | 'dashboard_core'
  | 'visualization'
  | 'analytics'
  | 'ai_ml'
  | 'collaboration'
  | 'energy_specific'
  | 'financial'
  | 'geographic'
  | 'compliance'
  | 'mobile'
  | 'api_integration'
  | 'security'
  | 'admin'

export interface FeatureTemplate {
  id: string
  name: string
  description: string
  category: string
  features: Record<string, {
    enabled: boolean
    configuration?: Record<string, any>
  }>
  target_audience: string[]
  use_cases: string[]
}

export class FeatureFlagService {
  private supabase: any
  private cache: Map<string, any> = new Map()
  private cacheTTL: number = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // Core Feature Management Methods
  async getAllFeatures(): Promise<FeatureDefinition[]> {
    const cacheKey = 'all_features'
    const cached = this.getFromCache(cacheKey)
    
    if (cached) return cached

    try {
      const { data, error } = await this.supabase
        .from('feature_definitions')
        .select('*')
        .order('category, name')
      
      if (error) throw error
      
      this.setCache(cacheKey, data)
      return data
    } catch (error) {
      console.error('Error fetching features:', error)
      return this.getDefaultFeatures()
    }
  }

  async getFeatureDefinitionsByCategory(category: FeatureCategory): Promise<FeatureDefinition[]> {
    const allFeatures = await this.getAllFeatures()
    return allFeatures.filter(feature => feature.category === category)
  }

  async isFeatureEnabled(organizationId: string, featureId: string): Promise<boolean> {
    const cacheKey = `feature_${organizationId}_${featureId}`
    const cached = this.getFromCache(cacheKey)
    
    if (cached !== null) return cached

    try {
      // First check organization-specific setting
      const { data: orgSetting } = await this.supabase
        .from('organization_feature_settings')
        .select('is_enabled')
        .eq('organization_id', organizationId)
        .eq('feature_id', featureId)
        .single()

      if (orgSetting) {
        this.setCache(cacheKey, orgSetting.is_enabled)
        return orgSetting.is_enabled
      }

      // Fallback to default setting
      const { data: featureDef } = await this.supabase
        .from('feature_definitions')
        .select('default_enabled')
        .eq('id', featureId)
        .single()

      const enabled = featureDef?.default_enabled || false
      this.setCache(cacheKey, enabled)
      return enabled
    } catch (error) {
      console.error('Error checking feature status:', error)
      return false
    }
  }

  async getFeatureConfiguration(
    organizationId: string, 
    featureId: string
  ): Promise<Record<string, any>> {
    try {
      const { data: orgSetting } = await this.supabase
        .from('organization_feature_settings')
        .select('configuration')
        .eq('organization_id', organizationId)
        .eq('feature_id', featureId)
        .single()

      return orgSetting?.configuration || {}
    } catch (error) {
      console.error('Error fetching feature configuration:', error)
      return {}
    }
  }

  async setFeatureEnabled(
    organizationId: string,
    featureId: string,
    enabled: boolean,
    configuration?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    try {
      // Validate dependencies and conflicts
      const validation = await this.validateFeatureChange(organizationId, featureId, enabled)
      if (!validation.valid) {
        throw new Error(`Feature change validation failed: ${validation.errors.join(', ')}`)
      }

      // Upsert organization feature setting
      const { error } = await this.supabase
        .from('organization_feature_settings')
        .upsert({
          organization_id: organizationId,
          feature_id: featureId,
          is_enabled: enabled,
          configuration: configuration || {},
          updated_by: userId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'organization_id,feature_id'
        })

      if (error) throw error

      // Clear related cache
      this.clearCache(`feature_${organizationId}_${featureId}`)
      
      // Log the change
      await this.logFeatureChange(organizationId, featureId, enabled, userId)
    } catch (error) {
      console.error('Error setting feature enabled:', error)
      throw error
    }
  }

  async setBulkFeatures(
    organizationId: string,
    features: Record<string, { enabled: boolean; configuration?: Record<string, any> }>,
    userId?: string
  ): Promise<void> {
    try {
      // Validate all changes first
      for (const [featureId, { enabled }] of Object.entries(features)) {
        const validation = await this.validateFeatureChange(organizationId, featureId, enabled)
        if (!validation.valid) {
          throw new Error(`Validation failed for ${featureId}: ${validation.errors.join(', ')}`)
        }
      }

      // Batch update
      const updates = Object.entries(features).map(([featureId, { enabled, configuration }]) => ({
        organization_id: organizationId,
        feature_id: featureId,
        is_enabled: enabled,
        configuration: configuration || {},
        updated_by: userId,
        updated_at: new Date().toISOString()
      }))

      const { error } = await this.supabase
        .from('organization_feature_settings')
        .upsert(updates, {
          onConflict: 'organization_id,feature_id'
        })

      if (error) throw error

      // Clear cache
      this.clearCachePattern(`feature_${organizationId}_`)
      
      // Log all changes
      for (const [featureId, { enabled }] of Object.entries(features)) {
        await this.logFeatureChange(organizationId, featureId, enabled, userId)
      }
    } catch (error) {
      console.error('Error setting bulk features:', error)
      throw error
    }
  }

  // Feature Validation Methods
  async validateFeatureChange(
    organizationId: string, 
    featureId: string, 
    enabled: boolean
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []
    
    try {
      // Get feature definition
      const { data: featureDef } = await this.supabase
        .from('feature_definitions')
        .select('dependencies, conflicts, tiers')
        .eq('id', featureId)
        .single()

      if (!featureDef) {
        errors.push('Feature definition not found')
        return { valid: false, errors }
      }

      // Check dependencies
      if (enabled && featureDef.dependencies.length > 0) {
        for (const depId of featureDef.dependencies) {
          const depEnabled = await this.isFeatureEnabled(organizationId, depId)
          if (!depEnabled) {
            errors.push(`Dependency ${depId} is not enabled`)
          }
        }
      }

      // Check conflicts
      if (enabled && featureDef.conflicts.length > 0) {
        for (const conflictId of featureDef.conflicts) {
          const conflictEnabled = await this.isFeatureEnabled(organizationId, conflictId)
          if (conflictEnabled) {
            errors.push(`Conflicts with enabled feature ${conflictId}`)
          }
        }
      }

      // Check tier restrictions
      // Note: This would require organization subscription tier data
      // Implementation depends on your billing system

    } catch (error) {
      errors.push(`Validation error: ${error}`)
    }

    return { valid: errors.length === 0, errors }
  }

  // Feature Template Methods
  async applyTemplate(
    organizationId: string,
    templateId: string,
    userId?: string
  ): Promise<void> {
    try {
      const template = await this.getTemplate(templateId)
      if (!template) {
        throw new Error('Template not found')
      }

      // Apply all features in the template
      await this.setBulkFeatures(organizationId, template.features, userId)
      
      // Log template application
      await this.logTemplateApplication(organizationId, templateId, userId)
    } catch (error) {
      console.error('Error applying template:', error)
      throw error
    }
  }

  async getAvailableTemplates(): Promise<FeatureTemplate[]> {
    const templates: FeatureTemplate[] = [
      {
        id: 'energy_trader',
        name: 'Energy Trader',
        description: 'Complete trading and analytics suite for energy traders',
        category: 'trading',
        features: {
          'real-time-trading': { enabled: true },
          'price-forecasting': { enabled: true },
          'risk-management': { enabled: true },
          'knowledge-graphs': { enabled: true },
          'ai-insights': { enabled: true },
          'market-analysis': { enabled: true },
          'trading-dashboard': { enabled: true, configuration: { show_orders: true } },
          'collaboration': { enabled: true },
          'data-export': { enabled: true }
        },
        target_audience: ['energy_traders', 'market_analysts'],
        use_cases: ['day_ahead_trading', 'real_time_trading', 'market_analysis']
      },
      {
        id: 'grid_operator',
        name: 'Grid Operator',
        description: 'Grid operations and monitoring focused suite',
        category: 'operations',
        features: {
          'real-time-monitoring': { enabled: true },
          'load-forecasting': { enabled: true },
          'anomaly-detection': { enabled: true },
          'grid-visualization': { enabled: true },
          'emergency-alerts': { enabled: true },
          'capacity-planning': { enabled: true },
          'asset-status-grid': { enabled: true, configuration: { refresh_interval: '30s' } },
          'compliance-monitoring': { enabled: true },
          'performance-kpis': { enabled: true }
        },
        target_audience: ['grid_operators', 'system_operators'],
        use_cases: ['grid_monitoring', 'load_management', 'emergency_response']
      },
      {
        id: 'renewable_producer',
        name: 'Renewable Producer',
        description: 'Renewable energy focused with REC tracking and sustainability',
        category: 'renewable',
        features: {
          'renewable-tracking': { enabled: true },
          'rec-trading': { enabled: true },
          'weather-integration': { enabled: true },
          'output-forecasting': { enabled: true },
          'carbon-analytics': { enabled: true },
          'sustainability-reports': { enabled: true },
          'energy-generation-chart': { enabled: true, configuration: { dataSource: 'renewable' } },
          'compliance-report': { enabled: true, configuration: { format: 'both' } },
          'performance-kpis': { enabled: true, configuration: { kpiType: 'efficiency' } }
        },
        target_audience: ['renewable_producers', 'environmental_managers'],
        use_cases: ['renewable_monitoring', 'rec_tracking', 'sustainability_reporting']
      },
      {
        id: 'energy_analyst',
        name: 'Energy Analyst',
        description: 'Deep analytics and research tools for energy analysts',
        category: 'analysis',
        features: {
          'advanced-analytics': { enabled: true },
          'data-export': { enabled: true },
          'custom-reports': { enabled: true },
          'market-research': { enabled: true },
          'knowledge-graphs': { enabled: true },
          'ai-insights': { enabled: true },
          'collaboration': { enabled: true },
          'market-prices-widget': { enabled: true, configuration: { showTrend: true } },
          'compliance-report': { enabled: true, configuration: { includeCharts: true } }
        },
        target_audience: ['energy_analysts', 'researchers', 'consultants'],
        use_cases: ['market_analysis', 'research', 'consulting']
      },
      {
        id: 'mobile_first',
        name: 'Mobile First',
        description: 'Optimized for mobile and field operations',
        category: 'mobile',
        features: {
          'mobile-optimization': { enabled: true },
          'offline-capability': { enabled: true },
          'field-reporting': { enabled: true },
          'geographic-map': { enabled: true, configuration: { mapType: 'satellite' } },
          'real-time-notifications': { enabled: true },
          'quick-actions': { enabled: true },
          'simplified-dashboard': { enabled: true }
        },
        target_audience: ['field_operators', 'maintenance_teams'],
        use_cases: ['field_operations', 'maintenance', 'site_inspections']
      }
    ]

    return templates
  }

  async getTemplate(templateId: string): Promise<FeatureTemplate | null> {
    const templates = await this.getAvailableTemplates()
    return templates.find(t => t.id === templateId) || null
  }

  // User Dashboard Preferences
  async getUserDashboardPreferences(
    userId: string, 
    organizationId: string
  ): Promise<UserDashboardPreferences[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_dashboard_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      return []
    }
  }

  async updateUserWidgetPreference(
    userId: string,
    organizationId: string,
    widgetId: string,
    preferences: Partial<UserDashboardPreferences>
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_dashboard_preferences')
        .upsert({
          user_id: userId,
          organization_id: organizationId,
          widget_id: widgetId,
          ...preferences,
          last_used: new Date().toISOString()
        }, {
          onConflict: 'user_id,organization_id,widget_id'
        })

      if (error) throw error
    } catch (error) {
      console.error('Error updating widget preference:', error)
      throw error
    }
  }

  // Utility Methods
  private async validateDependencies(featureId: string, organizationId: string): Promise<boolean> {
    // Implementation for dependency validation
    return true
  }

  private async logFeatureChange(
    organizationId: string, 
    featureId: string, 
    enabled: boolean, 
    userId?: string
  ): Promise<void> {
    try {
      await this.supabase.from('feature_change_logs').insert({
        organization_id: organizationId,
        feature_id: featureId,
        action: enabled ? 'enabled' : 'disabled',
        changed_by: userId,
        changed_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error logging feature change:', error)
    }
  }

  private async logTemplateApplication(
    organizationId: string, 
    templateId: string, 
    userId?: string
  ): Promise<void> {
    try {
      await this.supabase.from('template_application_logs').insert({
        organization_id: organizationId,
        template_id: templateId,
        applied_by: userId,
        applied_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error logging template application:', error)
    }
  }

  // Cache Management
  private getFromCache(key: string): any {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data
    }
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  private clearCache(key: string): void {
    this.cache.delete(key)
  }

  private clearCachePattern(pattern: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.startsWith(pattern)
    )
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  // Default Features (fallback)
  private getDefaultFeatures(): FeatureDefinition[] {
    return [
      // Dashboard Core Features
      {
        id: 'dashboard-core',
        name: 'Dashboard Core',
        description: 'Basic dashboard functionality',
        category: 'dashboard_core',
        is_active: true,
        default_enabled: true,
        dependencies: [],
        conflicts: [],
        tiers: ['starter', 'professional', 'enterprise'],
        metadata: { complexity: 'simple' },
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // Add other default features as needed
      // This is a simplified version - in production, all features would be in database
    ]
  }
}

// Export singleton instance
export const featureFlagService = new FeatureFlagService()
