// =============================================================================
// FEATURE FLAGS API - MAIN FEATURES ENDPOINT
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { FeatureDefinition } from '@/lib/feature-flags/types';

// Mock database for development (replace with actual database calls)
const mockFeatures: FeatureDefinition[] = [
  {
    id: 'feature-1',
    name: 'advanced_analytics',
    description: 'Advanced analytics with real-time market data and AI insights',
    category: 'analytics',
    is_active: true,
    default_enabled: false,
    dependencies: ['dashboard_core'],
    conflicts: [],
    tiers: ['professional', 'enterprise', 'fortune_500'],
    metadata: {
      ui_component: 'AnalyticsDashboard',
      api_endpoint: '/api/analytics',
      performance_impact: 'medium',
      min_users: 10,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'feature-2',
    name: 'real_time_data',
    description: 'Real-time market data streaming from PJM, ERCOT, CAISO',
    category: 'analytics',
    is_active: true,
    default_enabled: true,
    dependencies: [],
    conflicts: [],
    tiers: ['starter', 'professional', 'enterprise', 'fortune_500'],
    metadata: {
      ui_component: 'MarketDataStream',
      api_endpoint: '/api/market-data/stream',
      performance_impact: 'low',
      data_requirements: ['market_data_subscription'],
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'feature-3',
    name: 'ai_powered_insights',
    description: 'AI-powered market insights and price forecasting',
    category: 'ai_ml',
    is_active: true,
    default_enabled: false,
    dependencies: ['real_time_data', 'advanced_analytics'],
    conflicts: [],
    tiers: ['professional', 'enterprise', 'fortune_500'],
    metadata: {
      ui_component: 'AIInsights',
      api_endpoint: '/api/ai/insights',
      performance_impact: 'high',
      cost_implications: { model_inference_cost: 'per_request' },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'feature-4',
    name: 'enterprise_security',
    description: 'Enterprise-grade security with SSO and compliance',
    category: 'security',
    is_active: true,
    default_enabled: false,
    dependencies: [],
    conflicts: [],
    tiers: ['enterprise', 'fortune_500'],
    metadata: {
      ui_component: 'SecurityDashboard',
      compliance_flags: ['SOC2', 'ISO27001', 'GDPR'],
      min_users: 100,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'feature-5',
    name: 'collaboration_tools',
    description: 'Team collaboration and sharing features',
    category: 'collaboration',
    is_active: true,
    default_enabled: false,
    dependencies: ['dashboard_core'],
    conflicts: [],
    tiers: ['professional', 'enterprise', 'fortune_500'],
    metadata: {
      ui_component: 'CollaborationPanel',
      min_users: 5,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'feature-6',
    name: 'mobile_app',
    description: 'Mobile application with offline capabilities',
    category: 'mobile',
    is_active: true,
    default_enabled: true,
    dependencies: [],
    conflicts: [],
    tiers: ['starter', 'professional', 'enterprise', 'fortune_500'],
    metadata: {
      ui_component: 'MobileInterface',
      platform_support: ['iOS', 'Android'],
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'feature-7',
    name: 'blockchain_integration',
    description: 'Blockchain integration for energy trading',
    category: 'energy_specific',
    is_active: true,
    default_enabled: false,
    dependencies: ['dashboard_core'],
    conflicts: [],
    tiers: ['enterprise', 'fortune_500'],
    metadata: {
      ui_component: 'BlockchainDashboard',
      cost_implications: { blockchain_fees: 'per_transaction' },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'feature-8',
    name: 'api_integration',
    description: 'Full API access and custom integrations',
    category: 'api_integration',
    is_active: true,
    default_enabled: false,
    dependencies: [],
    conflicts: [],
    tiers: ['professional', 'enterprise', 'fortune_500'],
    metadata: {
      ui_component: 'APIIntegration',
      rate_limits: { requests_per_hour: 10000 },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'feature-9',
    name: 'compliance_reporting',
    description: 'Automated compliance reporting and audit trails',
    category: 'compliance',
    is_active: true,
    default_enabled: false,
    dependencies: ['enterprise_security'],
    conflicts: [],
    tiers: ['enterprise', 'fortune_500'],
    metadata: {
      ui_component: 'ComplianceDashboard',
      compliance_flags: ['SOC2', 'ISO27001', 'GDPR', 'NERC_CIP'],
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'feature-10',
    name: 'geographic_visualization',
    description: 'Geographic visualization of energy data',
    category: 'geographic',
    is_active: true,
    default_enabled: false,
    dependencies: ['dashboard_core'],
    conflicts: [],
    tiers: ['professional', 'enterprise', 'fortune_500'],
    metadata: {
      ui_component: 'GeographicMap',
      api_endpoint: '/api/geographic',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// GET /api/feature-flags/features
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const active = searchParams.get('active');
    
    let features = mockFeatures;
    
    // Filter by category
    if (category) {
      features = features.filter(f => f.category === category);
    }
    
    // Filter by active status
    if (active !== null) {
      const isActive = active === 'true';
      features = features.filter(f => f.is_active === isActive);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        features,
        total: features.length,
      },
      message: 'Features retrieved successfully',
    });
    
  } catch (error) {
    console.error('Error fetching features:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch features',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/feature-flags/features
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'category'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          missingFields,
        },
        { status: 400 }
      );
    }
    
    // Check if feature name already exists
    const existingFeature = mockFeatures.find(f => f.name === body.name);
    if (existingFeature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Feature name already exists',
        },
        { status: 409 }
      );
    }
    
    // Create new feature
    const newFeature: FeatureDefinition = {
      id: `feature-${Date.now()}`,
      name: body.name,
      description: body.description,
      category: body.category,
      is_active: body.is_active !== undefined ? body.is_active : true,
      default_enabled: body.default_enabled !== undefined ? body.default_enabled : false,
      dependencies: body.dependencies || [],
      conflicts: body.conflicts || [],
      tiers: body.tiers || ['starter'],
      metadata: body.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // In a real implementation, save to database
    mockFeatures.push(newFeature);
    
    return NextResponse.json({
      success: true,
      data: {
        feature: newFeature,
      },
      message: 'Feature created successfully',
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating feature:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create feature',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}