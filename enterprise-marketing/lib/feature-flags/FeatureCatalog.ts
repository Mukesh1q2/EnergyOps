/**
 * Complete Feature Catalog - All Dashboard Components and Features
 * 
 * This file contains comprehensive feature definitions covering:
 * - All existing dashboard widgets and components
 * - All existing page sections and modules  
 * - Future planned features for easy addition
 * - Complete categorization for enterprise customization
 */

import { FeatureDefinition } from './FeatureFlagService'

export const COMPLETE_FEATURE_CATALOG: FeatureDefinition[] = [
  // =============================================================================
  // DASHBOARD CORE FEATURES
  // =============================================================================
  
  {
    id: 'dashboard-core',
    name: 'Dashboard Core',
    description: 'Basic dashboard functionality with drag & drop, grid layouts, and widget management',
    category: 'dashboard_core',
    is_active: true,
    default_enabled: true,
    dependencies: [],
    conflicts: [],
    tiers: ['starter', 'professional', 'enterprise'],
    metadata: {
      widget_types: ['*'], // All widget types
      page_components: ['DashboardLayout', 'WidgetRenderer', 'WidgetLibrary'],
      permissions: ['view-dashboard'],
      cost_impact: 'low',
      performance_impact: 'low',
      complexity: 'simple'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'real-time-updates',
    name: 'Real-time Updates',
    description: 'Live data streaming and automatic dashboard refresh',
    category: 'dashboard_core',
    is_active: true,
    default_enabled: true,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['professional', 'enterprise'],
    metadata: {
      api_endpoints: ['/api/dashboard/stream', '/api/ws'],
      permissions: ['view-realtime-data'],
      cost_impact: 'medium',
      performance_impact: 'medium',
      complexity: 'moderate'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'custom-layouts',
    name: 'Custom Layouts',
    description: 'Advanced drag & drop with save/load layout templates',
    category: 'dashboard_core',
    is_active: true,
    default_enabled: true,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['professional', 'enterprise'],
    metadata: {
      widget_types: ['*'],
      permissions: ['customize-layout'],
      cost_impact: 'low',
      performance_impact: 'low',
      complexity: 'moderate'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'dashboard-templates',
    name: 'Dashboard Templates',
    description: 'Pre-built dashboard templates for different use cases',
    category: 'dashboard_core',
    is_active: true,
    default_enabled: true,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['professional', 'enterprise'],
    metadata: {
      permissions: ['use-templates'],
      cost_impact: 'low',
      performance_impact: 'none',
      complexity: 'simple'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  // =============================================================================
  // VISUALIZATION & WIDGET FEATURES
  // =============================================================================

  {
    id: 'energy-generation-chart',
    name: 'Energy Generation Charts',
    description: 'Time-series charts for energy generation tracking',
    category: 'visualization',
    is_active: true,
    default_enabled: true,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['starter', 'professional', 'enterprise'],
    metadata: {
      widget_types: ['energy-generation-chart'],
      page_components: ['EnergyGenerationChart'],
      permissions: ['view-energy-data'],
      cost_impact: 'low',
      performance_impact: 'low',
      complexity: 'simple'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'market-prices-widget',
    name: 'Market Prices Widget',
    description: 'Real-time electricity market prices and trend analysis',
    category: 'visualization',
    is_active: true,
    default_enabled: true,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['starter', 'professional', 'enterprise'],
    metadata: {
      widget_types: ['market-prices-widget'],
      page_components: ['MarketPricesWidget'],
      permissions: ['view-market-data'],
      cost_impact: 'low',
      performance_impact: 'low',
      complexity: 'simple'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'asset-status-grid',
    name: 'Asset Status Grid',
    description: 'Visual grid showing real-time status of all energy assets',
    category: 'visualization',
    is_active: true,
    default_enabled: true,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['starter', 'professional', 'enterprise'],
    metadata: {
      widget_types: ['asset-status-grid'],
      page_components: ['AssetStatusGrid'],
      permissions: ['view-asset-data'],
      cost_impact: 'low',
      performance_impact: 'low',
      complexity: 'simple'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'performance-kpis',
    name: 'Performance KPIs',
    description: 'Key performance indicators with targets and trend analysis',
    category: 'visualization',
    is_active: true,
    default_enabled: true,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['starter', 'professional', 'enterprise'],
    metadata: {
      widget_types: ['performance-kpis'],
      page_components: ['PerformanceKPIs'],
      permissions: ['view-kpis'],
      cost_impact: 'low',
      performance_impact: 'low',
      complexity: 'simple'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'trading-dashboard',
    name: 'Trading Dashboard',
    description: 'Comprehensive trading interface with bid tracking',
    category: 'visualization',
    is_active: true,
    default_enabled: true,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['professional', 'enterprise'],
    metadata: {
      widget_types: ['trading-dashboard'],
      page_components: ['TradingDashboard'],
      permissions: ['view-trading-data'],
      cost_impact: 'medium',
      performance_impact: 'medium',
      complexity: 'moderate'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'geographic-map',
    name: 'Geographic Asset Map',
    description: 'Interactive map showing asset locations with real-time status',
    category: 'geographic',
    is_active: true,
    default_enabled: true,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['professional', 'enterprise'],
    metadata: {
      widget_types: ['geographic-map'],
      page_components: ['GeographicMap'],
      permissions: ['view-geographic-data'],
      cost_impact: 'medium',
      performance_impact: 'medium',
      complexity: 'moderate'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  // =============================================================================
  // TEAM COLLABORATION FEATURES
  // =============================================================================

  {
    id: 'team-activity-feed',
    name: 'Team Activity Feed',
    description: 'Real-time feed of team member activities and collaborations',
    category: 'collaboration',
    is_active: true,
    default_enabled: true,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['professional', 'enterprise'],
    metadata: {
      widget_types: ['team-activity-feed'],
      page_components: ['TeamActivityFeed'],
      permissions: ['view-team-data'],
      cost_impact: 'low',
      performance_impact: 'low',
      complexity: 'simple'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'real-time-collaboration',
    name: 'Real-time Collaboration',
    description: 'Live cursors, collaborative editing, and presence indicators',
    category: 'collaboration',
    is_active: true,
    default_enabled: false,
    dependencies: ['dashboard-core', 'real-time-updates'],
    conflicts: [],
    tiers: ['enterprise'],
    metadata: {
      page_components: ['TeamCollaboration', 'ShareDashboard'],
      permissions: ['collaborate'],
      cost_impact: 'high',
      performance_impact: 'high',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'comments-system',
    name: 'Comments & Annotations',
    description: 'Widget-level comments and annotation system',
    category: 'collaboration',
    is_active: true,
    default_enabled: true,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['professional', 'enterprise'],
    metadata: {
      permissions: ['comment'],
      cost_impact: 'low',
      performance_impact: 'low',
      complexity: 'moderate'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  // =============================================================================
  // COMPLIANCE & REPORTS
  // =============================================================================

  {
    id: 'compliance-report',
    name: 'Compliance Reports',
    description: 'Generate compliance reports for regulatory requirements',
    category: 'compliance',
    is_active: true,
    default_enabled: true,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['professional', 'enterprise'],
    metadata: {
      widget_types: ['compliance-report'],
      page_components: ['ComplianceReport'],
      permissions: ['view-reports'],
      cost_impact: 'low',
      performance_impact: 'low',
      complexity: 'simple'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'advanced-reporting',
    name: 'Advanced Reporting',
    description: 'Custom report builder with scheduling and automation',
    category: 'compliance',
    is_active: true,
    default_enabled: false,
    dependencies: ['compliance-report'],
    conflicts: [],
    tiers: ['enterprise'],
    metadata: {
      permissions: ['create-reports'],
      cost_impact: 'medium',
      performance_impact: 'medium',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  // =============================================================================
  // AI & ANALYTICS FEATURES
  // =============================================================================

  {
    id: 'ai-insights',
    name: 'AI-Powered Insights',
    description: 'Machine learning insights and pattern detection',
    category: 'analytics',
    is_active: true,
    default_enabled: true,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['professional', 'enterprise'],
    metadata: {
      permissions: ['view-ai-insights'],
      cost_impact: 'medium',
      performance_impact: 'medium',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'llm-assistant',
    name: 'LLM Assistant',
    description: 'Natural language query interface for data exploration',
    category: 'ai_ml',
    is_active: true,
    default_enabled: false,
    dependencies: ['dashboard-core', 'ai-insights'],
    conflicts: [],
    tiers: ['enterprise'],
    metadata: {
      page_components: ['LLMAssistant'],
      permissions: ['use-ai-assistant'],
      cost_impact: 'high',
      performance_impact: 'high',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'knowledge-graphs',
    name: 'Visual Knowledge Graphs',
    description: 'Interactive node/edge graphs with force-directed layout',
    category: 'ai_ml',
    is_active: true,
    default_enabled: true,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['professional', 'enterprise'],
    metadata: {
      permissions: ['view-knowledge-graphs'],
      cost_impact: 'medium',
      performance_impact: 'medium',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  // =============================================================================
  // ENERGY SPECIFIC FEATURES
  // =============================================================================

  {
    id: 'india-energy',
    name: 'India Energy Market',
    description: 'Comprehensive India energy market data and analytics',
    category: 'energy_specific',
    is_active: true,
    default_enabled: true,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['starter', 'professional', 'enterprise'],
    metadata: {
      widget_types: ['india-energy-market'],
      page_components: ['IndiaEnergyMarketDashboard'],
      permissions: ['view-india-energy'],
      cost_impact: 'low',
      performance_impact: 'medium',
      complexity: 'moderate'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'renewable-tracking',
    name: 'Renewable Energy Tracking',
    description: 'Solar, wind, and hydro energy generation tracking',
    category: 'energy_specific',
    is_active: true,
    default_enabled: true,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['professional', 'enterprise'],
    metadata: {
      widget_types: ['renewable-tracking'],
      permissions: ['view-renewable-data'],
      cost_impact: 'low',
      performance_impact: 'low',
      complexity: 'simple'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'grid-operations',
    name: 'Grid Operations Monitoring',
    description: 'Real-time grid stability and operations monitoring',
    category: 'energy_specific',
    is_active: true,
    default_enabled: false,
    dependencies: ['dashboard-core', 'real-time-updates'],
    conflicts: [],
    tiers: ['enterprise'],
    metadata: {
      permissions: ['view-grid-operations'],
      cost_impact: 'medium',
      performance_impact: 'high',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'rec-trading',
    name: 'REC Trading',
    description: 'Renewable Energy Certificate trading and tracking',
    category: 'energy_specific',
    is_active: true,
    default_enabled: false,
    dependencies: ['dashboard-core', 'trading-dashboard'],
    conflicts: [],
    tiers: ['enterprise'],
    metadata: {
      permissions: ['trade-rec'],
      cost_impact: 'medium',
      performance_impact: 'medium',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  // =============================================================================
  // FINANCIAL FEATURES
  // =============================================================================

  {
    id: 'financial-analytics',
    name: 'Financial Analytics',
    description: 'Revenue tracking, cost analysis, and financial KPIs',
    category: 'financial',
    is_active: true,
    default_enabled: true,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['professional', 'enterprise'],
    metadata: {
      permissions: ['view-financial-data'],
      cost_impact: 'low',
      performance_impact: 'low',
      complexity: 'moderate'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'revenue-optimization',
    name: 'Revenue Optimization',
    description: 'AI-powered revenue optimization recommendations',
    category: 'financial',
    is_active: true,
    default_enabled: false,
    dependencies: ['dashboard-core', 'ai-insights'],
    conflicts: [],
    tiers: ['enterprise'],
    metadata: {
      permissions: ['optimize-revenue'],
      cost_impact: 'high',
      performance_impact: 'high',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  // =============================================================================
  // API & INTEGRATION FEATURES
  // =============================================================================

  {
    id: 'api-management',
    name: 'API Management',
    description: 'API key management, rate limiting, and developer portal',
    category: 'api_integration',
    is_active: true,
    default_enabled: false,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['enterprise'],
    metadata: {
      page_components: ['ApiManagementDashboard'],
      permissions: ['manage-api'],
      cost_impact: 'medium',
      performance_impact: 'low',
      complexity: 'moderate'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'webhook-management',
    name: 'Webhook Management',
    description: 'Real-time webhook notifications and event management',
    category: 'api_integration',
    is_active: true,
    default_enabled: false,
    dependencies: ['dashboard-core', 'real-time-updates'],
    conflicts: [],
    tiers: ['enterprise'],
    metadata: {
      permissions: ['manage-webhooks'],
      cost_impact: 'medium',
      performance_impact: 'medium',
      complexity: 'moderate'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'third-party-integrations',
    name: 'Third-party Integrations',
    description: 'Connect with external systems and data sources',
    category: 'api_integration',
    is_active: true,
    default_enabled: false,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['enterprise'],
    metadata: {
      page_components: ['IntegrationConnectors'],
      permissions: ['manage-integrations'],
      cost_impact: 'high',
      performance_impact: 'medium',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  // =============================================================================
  // BLOCKCHAIN & DeFi FEATURES
  // =============================================================================

  {
    id: 'blockchain-dashboard',
    name: 'Blockchain Dashboard',
    description: 'Blockchain integration and energy tokenization features',
    category: 'api_integration',
    is_active: true,
    default_enabled: false,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['enterprise'],
    metadata: {
      widget_types: ['blockchain-dashboard'],
      page_components: ['BlockchainDashboard', 'EnergyTokenWallet'],
      permissions: ['view-blockchain'],
      cost_impact: 'high',
      performance_impact: 'medium',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'defi-features',
    name: 'DeFi Features',
    description: 'Decentralized finance features and cross-chain bridges',
    category: 'api_integration',
    is_active: true,
    default_enabled: false,
    dependencies: ['blockchain-dashboard'],
    conflicts: [],
    tiers: ['enterprise'],
    metadata: {
      page_components: ['DeFiDashboard', 'CrossChainBridge'],
      permissions: ['use-defi'],
      cost_impact: 'high',
      performance_impact: 'high',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  // =============================================================================
  // IoT & EDGE FEATURES
  // =============================================================================

  {
    id: 'iot-management',
    name: 'IoT Device Management',
    description: 'Manage IoT devices and edge computing infrastructure',
    category: 'api_integration',
    is_active: true,
    default_enabled: false,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['professional', 'enterprise'],
    metadata: {
      page_components: ['IoTDeviceManagement', 'IoTAnalyticsMonitoring'],
      permissions: ['manage-iot'],
      cost_impact: 'medium',
      performance_impact: 'medium',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'edge-computing',
    name: 'Edge Computing',
    description: 'Edge computing management and distributed processing',
    category: 'api_integration',
    is_active: true,
    default_enabled: false,
    dependencies: ['iot-management'],
    conflicts: [],
    tiers: ['enterprise'],
    metadata: {
      page_components: ['EdgeComputingManagement'],
      permissions: ['manage-edge'],
      cost_impact: 'high',
      performance_impact: 'high',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  // =============================================================================
  // MOBILE & OFFLINE FEATURES
  // =============================================================================

  {
    id: 'mobile-app',
    name: 'Mobile Application',
    description: 'Native mobile app with offline capabilities',
    category: 'mobile',
    is_active: true,
    default_enabled: true,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['professional', 'enterprise'],
    metadata: {
      page_components: ['MobileDashboard', 'MobileTrading', 'MobileAIInsights'],
      permissions: ['use-mobile'],
      cost_impact: 'medium',
      performance_impact: 'medium',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'offline-capability',
    name: 'Offline Capability',
    description: 'Offline dashboard access and data synchronization',
    category: 'mobile',
    is_active: true,
    default_enabled: false,
    dependencies: ['mobile-app'],
    conflicts: [],
    tiers: ['enterprise'],
    metadata: {
      permissions: ['offline-access'],
      cost_impact: 'high',
      performance_impact: 'high',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  // =============================================================================
  // SECURITY & ADMIN FEATURES
  // =============================================================================

  {
    id: 'security-controls',
    name: 'Security Controls',
    description: 'Advanced security settings and monitoring',
    category: 'security',
    is_active: true,
    default_enabled: true,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['professional', 'enterprise'],
    metadata: {
      page_components: ['SecurityControls'],
      permissions: ['manage-security'],
      cost_impact: 'medium',
      performance_impact: 'low',
      complexity: 'moderate'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'enterprise-admin',
    name: 'Enterprise Admin Panel',
    description: 'Comprehensive admin controls and organization management',
    category: 'admin',
    is_active: true,
    default_enabled: false,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['enterprise'],
    metadata: {
      permissions: ['admin-access'],
      cost_impact: 'low',
      performance_impact: 'low',
      complexity: 'moderate'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  // =============================================================================
  // SETUP & ONBOARDING FEATURES
  // =============================================================================

  {
    id: 'quick-setup-wizard',
    name: 'Quick Setup Wizard',
    description: 'Guided setup process for new organizations',
    category: 'admin',
    is_active: true,
    default_enabled: true,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['starter', 'professional', 'enterprise'],
    metadata: {
      page_components: ['QuickSetupWizard', 'EnterpriseOnboardingWizard'],
      permissions: ['setup-organization'],
      cost_impact: 'low',
      performance_impact: 'none',
      complexity: 'simple'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  // =============================================================================
  // FUTURE PLANNED FEATURES
  // =============================================================================

  {
    id: 'quantum-computing',
    name: 'Quantum Computing Integration',
    description: 'Quantum computing for complex optimization problems',
    category: 'ai_ml',
    is_active: false,
    default_enabled: false,
    dependencies: ['dashboard-core', 'ai-insights'],
    conflicts: [],
    tiers: ['enterprise'],
    metadata: {
      page_components: ['QuantumComputingDashboard'],
      permissions: ['use-quantum'],
      cost_impact: 'high',
      performance_impact: 'high',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'predictive-maintenance',
    name: 'Predictive Maintenance',
    description: 'AI-powered predictive maintenance for energy assets',
    category: 'ai_ml',
    is_active: false,
    default_enabled: false,
    dependencies: ['ai-insights', 'iot-management'],
    conflicts: [],
    tiers: ['enterprise'],
    metadata: {
      permissions: ['view-maintenance'],
      cost_impact: 'high',
      performance_impact: 'high',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'carbon-trading',
    name: 'Carbon Credit Trading',
    description: 'Carbon credit marketplace and trading interface',
    category: 'energy_specific',
    is_active: false,
    default_enabled: false,
    dependencies: ['trading-dashboard'],
    conflicts: [],
    tiers: ['enterprise'],
    metadata: {
      permissions: ['trade-carbon'],
      cost_impact: 'high',
      performance_impact: 'medium',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'weather-integration',
    name: 'Weather Integration',
    description: 'Weather data integration for renewable energy forecasting',
    category: 'energy_specific',
    is_active: false,
    default_enabled: false,
    dependencies: ['renewable-tracking'],
    conflicts: [],
    tiers: ['professional', 'enterprise'],
    metadata: {
      permissions: ['view-weather'],
      cost_impact: 'medium',
      performance_impact: 'low',
      complexity: 'moderate'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'sustainability-reports',
    name: 'Sustainability Reports',
    description: 'ESG and sustainability reporting with automation',
    category: 'compliance',
    is_active: false,
    default_enabled: false,
    dependencies: ['compliance-report', 'carbon-trading'],
    conflicts: [],
    tiers: ['enterprise'],
    metadata: {
      permissions: ['generate-sustainability-reports'],
      cost_impact: 'medium',
      performance_impact: 'medium',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'advanced-visualizations',
    name: 'Advanced Visualizations',
    description: 'Sankey diagrams, Gantt charts, and 3D visualizations',
    category: 'visualization',
    is_active: false,
    default_enabled: false,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['enterprise'],
    metadata: {
      permissions: ['advanced-visualizations'],
      cost_impact: 'medium',
      performance_impact: 'high',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'data-export',
    name: 'Advanced Data Export',
    description: 'Multiple format exports with scheduled automation',
    category: 'admin',
    is_active: false,
    default_enabled: false,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['professional', 'enterprise'],
    metadata: {
      permissions: ['export-data'],
      cost_impact: 'low',
      performance_impact: 'low',
      complexity: 'moderate'
    },
    created_at: new Date(),
    updated_at: new Date()
  },

  {
    id: 'white-label',
    name: 'White Label Solutions',
    description: 'Custom branding and white-label deployment options',
    category: 'admin',
    is_active: false,
    default_enabled: false,
    dependencies: ['dashboard-core'],
    conflicts: [],
    tiers: ['enterprise'],
    metadata: {
      permissions: ['white-label'],
      cost_impact: 'medium',
      performance_impact: 'low',
      complexity: 'complex'
    },
    created_at: new Date(),
    updated_at: new Date()
  }
]

// Export feature categories for easy reference
export const FEATURE_CATEGORIES = {
  dashboard_core: 'Dashboard Core',
  visualization: 'Visualization & Charts',
  analytics: 'Analytics & Insights',
  ai_ml: 'AI & Machine Learning',
  collaboration: 'Team & Collaboration',
  energy_specific: 'Energy Specific',
  financial: 'Financial & Revenue',
  geographic: 'Geographic & Maps',
  compliance: 'Compliance & Reports',
  mobile: 'Mobile & Offline',
  api_integration: 'API & Integrations',
  security: 'Security & Compliance',
  admin: 'Admin & Setup'
} as const

// Export subscription tiers
export const SUBSCRIPTION_TIERS = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise'
} as const

// Helper function to get features by category
export function getFeaturesByCategory(category: keyof typeof FEATURE_CATEGORIES): FeatureDefinition[] {
  return COMPLETE_FEATURE_CATALOG.filter(feature => feature.category === category)
}

// Helper function to get features by tier
export function getFeaturesByTier(tier: keyof typeof SUBSCRIPTION_TIERS): FeatureDefinition[] {
  return COMPLETE_FEATURE_CATALOG.filter(feature => feature.tiers.includes(tier))
}

// Helper function to get active features
export function getActiveFeatures(): FeatureDefinition[] {
  return COMPLETE_FEATURE_CATALOG.filter(feature => feature.is_active)
}
