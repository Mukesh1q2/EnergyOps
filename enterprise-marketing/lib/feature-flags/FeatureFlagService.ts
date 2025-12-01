/**
 * Feature Flag Service - Enterprise Customization Engine
 * 
 * Provides comprehensive feature management for organization-specific
 * dashboard customization and widget control.
 */

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
  private cache: Map<string, any> = new Map()
  private cacheTTL: number = 5 * 60 * 1000 // 5 minutes
  private mockData: Map<string, any> = new Map()

  constructor() {
    // Initialize with mock data for development
    this.initializeMockData()
  }

  private initializeMockData() {
    // Mock feature definitions
    this.mockData.set('feature_definitions', this.getDefaultFeatures())
  }

  // Core Feature Management Methods
  async getAllFeatures(): Promise<FeatureDefinition[]> {
    const cacheKey = 'all_features'
    const cached = this.getFromCache(cacheKey)
    
    if (cached) return cached

    // Use mock data for now
    const data = this.mockData.get('feature_definitions') || this.getDefaultFeatures()
    this.setCache(cacheKey, data)
    return data
  }

  async getFeatureDefinitionsByCategory(category: FeatureCategory): Promise<FeatureDefinition[]> {
    const allFeatures = await this.getAllFeatures()
    return allFeatures.filter(feature => feature.category === category)
  }

  async isFeatureEnabled(organizationId: string, featureId: string): Promise<boolean> {
    const cacheKey = `feature_${organizationId}_${featureId}`
    const cached = this.getFromCache(cacheKey)
    
    if (cached !== null) return cached

    // Use mock data - enable all features by default for development
    const features = this.mockData.get('feature_definitions') || []
    const feature = features.find((f: FeatureDefinition) => f.id === featureId)
    const enabled = feature?.default_enabled ?? true
    
    this.setCache(cacheKey, enabled)
    return enabled
  }

  async getFeatureConfiguration(
    organizationId: string, 
    featureId: string
  ): Promise<Record<string, any>> {
    // Return empty configuration for mock data
    return {}
  }

  async setFeatureEnabled(
    organizationId: string,
    featureId: string,
    enabled: boolean,
    configuration?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    // Mock implementation - just update cache
    this.setCache(`feature_${organizationId}_${featureId}`, enabled)
    console.log(`Feature ${featureId} ${enabled ? 'enabled' : 'disabled'} for org ${organizationId}`)
  }

  async setBulkFeatures(
    organizationId: string,
    features: Record<string, { enabled: boolean; configuration?: Record<string, any> }>,
    userId?: string
  ): Promise<void> {
    // Mock implementation - update cache for all features
    for (const [featureId, { enabled }] of Object.entries(features)) {
      this.setCache(`feature_${organizationId}_${featureId}`, enabled)
    }
    console.log(`Bulk features updated for org ${organizationId}`)
  }

  /**
   * Validate feature change including dependency checks
   * Validates: Requirements 5.5
   * - Check dependencies before enabling features
   * - Return validation errors if dependencies not met
   */
  async validateFeatureChange(
    organizationId: string, 
    featureId: string, 
    enabled: boolean
  ): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      const allFeatures = await this.getAllFeatures()
      const feature = allFeatures.find(f => f.id === featureId)
      
      if (!feature) {
        errors.push(`Feature '${featureId}' not found`)
        return { valid: false, errors, warnings }
      }
      
      // Check if feature is active
      if (!feature.is_active) {
        errors.push(`Feature '${feature.name}' is not currently active`)
        return { valid: false, errors, warnings }
      }
      
      // When enabling, check dependencies
      if (enabled && feature.dependencies.length > 0) {
        for (const depId of feature.dependencies) {
          const isDepEnabled = await this.isFeatureEnabled(organizationId, depId)
          if (!isDepEnabled) {
            const depFeature = allFeatures.find(f => f.id === depId)
            const depName = depFeature?.name || depId
            errors.push(`Required dependency '${depName}' must be enabled first`)
          }
        }
      }
      
      // Check for conflicts when enabling
      if (enabled && feature.conflicts.length > 0) {
        for (const conflictId of feature.conflicts) {
          const isConflictEnabled = await this.isFeatureEnabled(organizationId, conflictId)
          if (isConflictEnabled) {
            const conflictFeature = allFeatures.find(f => f.id === conflictId)
            const conflictName = conflictFeature?.name || conflictId
            errors.push(`Conflicts with enabled feature '${conflictName}'`)
          }
        }
      }
      
      // When disabling, warn about dependent features
      if (!enabled) {
        const dependentFeatures = allFeatures.filter(f => 
          f.dependencies.includes(featureId)
        )
        
        for (const depFeature of dependentFeatures) {
          const isDepEnabled = await this.isFeatureEnabled(organizationId, depFeature.id)
          if (isDepEnabled) {
            warnings.push(`Disabling this will affect '${depFeature.name}' which depends on it`)
          }
        }
      }
      
      return { 
        valid: errors.length === 0, 
        errors, 
        warnings 
      }
    } catch (error) {
      console.error('Error validating feature change:', error)
      errors.push('Failed to validate feature change')
      return { valid: false, errors, warnings }
    }
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
    // Mock implementation - return empty preferences
    return []
  }

  async updateUserWidgetPreference(
    userId: string,
    organizationId: string,
    widgetId: string,
    preferences: Partial<UserDashboardPreferences>
  ): Promise<void> {
    // Mock implementation - just log
    console.log(`Widget preference updated for user ${userId}`)
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
    // Mock implementation - just log to console
    console.log(`Feature change logged: ${featureId} ${enabled ? 'enabled' : 'disabled'}`)
  }

  private async logTemplateApplication(
    organizationId: string, 
    templateId: string, 
    userId?: string
  ): Promise<void> {
    // Mock implementation - just log to console
    console.log(`Template applied: ${templateId} for org ${organizationId}`)
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
