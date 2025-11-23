// =============================================================================
// FEATURE FLAGS API - ORGANIZATION SETTINGS ENDPOINT
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { OrganizationFeatureSetting } from '@/lib/feature-flags/types';

// Mock database for development
const mockOrganizationSettings: OrganizationFeatureSetting[] = [
  // Sample organization settings
  {
    id: 'org-setting-1',
    organization_id: 'org-123',
    feature_id: 'feature-1', // advanced_analytics
    is_enabled: true,
    configuration: {
      refresh_interval: 30,
      max_widgets: 10,
      enable_notifications: true,
    },
    tier_restrictions: ['professional', 'enterprise'],
    user_restrictions: ['admin', 'manager'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'org-setting-2',
    organization_id: 'org-123',
    feature_id: 'feature-3', // ai_powered_insights
    is_enabled: false,
    configuration: {
      model_accuracy: 'high',
      update_frequency: 'hourly',
    },
    tier_restrictions: ['enterprise'],
    user_restrictions: ['admin'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// GET /api/feature-flags/organizations/[id]/features
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = params.id;
    
    // Get organization settings
    const settings = mockOrganizationSettings.filter(
      setting => setting.organization_id === organizationId
    );
    
    return NextResponse.json({
      success: true,
      data: {
        settings,
        total: settings.length,
        organization_id: organizationId,
      },
      message: 'Organization features retrieved successfully',
    });
    
  } catch (error) {
    console.error('Error fetching organization features:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch organization features',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/feature-flags/organizations/[id]/features
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = params.id;
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['feature_id', 'is_enabled'];
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
    
    // Check if setting already exists
    const existingSetting = mockOrganizationSettings.find(
      setting => 
        setting.organization_id === organizationId && 
        setting.feature_id === body.feature_id
    );
    
    if (existingSetting) {
      return NextResponse.json(
        {
          success: false,
          error: 'Feature setting already exists for this organization',
        },
        { status: 409 }
      );
    }
    
    // Create new organization setting
    const newSetting: OrganizationFeatureSetting = {
      id: `org-setting-${Date.now()}`,
      organization_id: organizationId,
      feature_id: body.feature_id,
      is_enabled: body.is_enabled,
      configuration: body.configuration || {},
      tier_restrictions: body.tier_restrictions || [],
      user_restrictions: body.user_restrictions || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    mockOrganizationSettings.push(newSetting);
    
    return NextResponse.json({
      success: true,
      data: {
        setting: newSetting,
      },
      message: 'Organization feature setting created successfully',
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating organization feature setting:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create organization feature setting',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}