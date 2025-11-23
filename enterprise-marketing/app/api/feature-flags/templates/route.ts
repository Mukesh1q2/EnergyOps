// =============================================================================
// FEATURE FLAGS API - FEATURE TEMPLATES ENDPOINT
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { FeatureTemplate } from '@/lib/feature-flags/types';

// Mock templates database
const mockTemplates: FeatureTemplate[] = [
  {
    id: 'template-1',
    name: 'Energy Trading Professional',
    description: 'Template for professional energy trading teams',
    industry: 'energy',
    company_size: 'large',
    features: [
      {
        feature_id: 'feature-1', // advanced_analytics
        enabled: true,
        configuration: { refresh_interval: 30, max_widgets: 15 },
        priority: 1,
      },
      {
        feature_id: 'feature-2', // real_time_data
        enabled: true,
        configuration: { update_frequency: 'realtime' },
        priority: 2,
      },
      {
        feature_id: 'feature-3', // ai_powered_insights
        enabled: false,
        configuration: { model_accuracy: 'high' },
        priority: 3,
      },
      {
        feature_id: 'feature-5', // collaboration_tools
        enabled: true,
        configuration: { max_team_size: 25 },
        priority: 4,
      },
    ],
    metadata: {
      recommended_for: ['energy_traders', 'market_analysts'],
      implementation_time: '2-3_days',
      support_tier: 'professional',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'template-2',
    name: 'Fortune 500 Enterprise',
    description: 'Comprehensive template for Fortune 500 companies',
    industry: 'energy',
    company_size: 'enterprise',
    features: [
      {
        feature_id: 'feature-1', // advanced_analytics
        enabled: true,
        configuration: { refresh_interval: 15, max_widgets: 25 },
        priority: 1,
      },
      {
        feature_id: 'feature-3', // ai_powered_insights
        enabled: true,
        configuration: { model_accuracy: 'highest', custom_models: true },
        priority: 2,
      },
      {
        feature_id: 'feature-4', // enterprise_security
        enabled: true,
        configuration: { sso_enabled: true, compliance_mode: 'full' },
        priority: 3,
      },
      {
        feature_id: 'feature-7', // blockchain_integration
        enabled: true,
        configuration: { supported_chains: ['ethereum', 'polygon'] },
        priority: 4,
      },
      {
        feature_id: 'feature-9', // compliance_reporting
        enabled: true,
        configuration: { auto_generate: true, formats: ['PDF', 'Excel'] },
        priority: 5,
      },
    ],
    metadata: {
      recommended_for: ['fortune_500', 'utilities', 'energy_corporations'],
      implementation_time: '1-2_weeks',
      support_tier: 'enterprise',
      compliance_requirements: ['SOC2', 'ISO27001', 'GDPR'],
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'template-3',
    name: 'Startup Energy Platform',
    description: 'Lightweight template for startup energy companies',
    industry: 'energy',
    company_size: 'startup',
    features: [
      {
        feature_id: 'feature-2', // real_time_data
        enabled: true,
        configuration: { update_frequency: '5min' },
        priority: 1,
      },
      {
        feature_id: 'feature-6', // mobile_app
        enabled: true,
        configuration: { offline_mode: true },
        priority: 2,
      },
      {
        feature_id: 'feature-8', // api_integration
        enabled: true,
        configuration: { rate_limit: 1000 },
        priority: 3,
      },
    ],
    metadata: {
      recommended_for: ['startups', 'small_energy_companies'],
      implementation_time: '1_day',
      support_tier: 'starter',
      cost_optimized: true,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// GET /api/feature-flags/templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get('industry');
    const companySize = searchParams.get('company_size');
    
    let templates = mockTemplates;
    
    // Filter by industry
    if (industry) {
      templates = templates.filter(t => t.industry === industry);
    }
    
    // Filter by company size
    if (companySize) {
      templates = templates.filter(t => t.company_size === companySize);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        templates,
        total: templates.length,
      },
      message: 'Templates retrieved successfully',
    });
    
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch templates',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/feature-flags/templates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'industry', 'company_size', 'features'];
    const missingFields = requiredFields.filter(field => !(field in body));
    
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
    
    // Create new template
    const newTemplate: FeatureTemplate = {
      id: `template-${Date.now()}`,
      name: body.name,
      description: body.description,
      industry: body.industry,
      company_size: body.company_size,
      features: body.features || [],
      metadata: body.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    mockTemplates.push(newTemplate);
    
    return NextResponse.json({
      success: true,
      data: {
        template: newTemplate,
      },
      message: 'Template created successfully',
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create template',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}