// =============================================================================
// FEATURE FLAGS API - INDIVIDUAL ORGANIZATION FEATURE UPDATE
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';

// Mock database for development (same as parent route)
let mockOrganizationSettings: any[] = [
  {
    id: 'org-setting-1',
    organization_id: 'org-123',
    feature_id: 'feature-1',
    is_enabled: true,
    configuration: { refresh_interval: 30 },
    tier_restrictions: ['professional'],
    user_restrictions: ['admin'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// PATCH /api/feature-flags/organizations/[orgId]/features/[featureId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orgId: string; featureId: string } }
) {
  try {
    const { orgId, featureId } = params;
    const body = await request.json();
    
    // Find existing setting
    const settingIndex = mockOrganizationSettings.findIndex(
      setting => 
        setting.organization_id === orgId && 
        setting.feature_id === featureId
    );
    
    if (settingIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Feature setting not found for this organization',
        },
        { status: 404 }
      );
    }
    
    // Update setting
    const updatedSetting = {
      ...mockOrganizationSettings[settingIndex],
      is_enabled: body.enabled !== undefined ? body.enabled : mockOrganizationSettings[settingIndex].is_enabled,
      configuration: body.configuration || mockOrganizationSettings[settingIndex].configuration,
      tier_restrictions: body.tier_restrictions || mockOrganizationSettings[settingIndex].tier_restrictions,
      user_restrictions: body.user_restrictions || mockOrganizationSettings[settingIndex].user_restrictions,
      updated_at: new Date().toISOString(),
    };
    
    mockOrganizationSettings[settingIndex] = updatedSetting;
    
    return NextResponse.json({
      success: true,
      data: {
        setting: updatedSetting,
      },
      message: 'Organization feature setting updated successfully',
    });
    
  } catch (error) {
    console.error('Error updating organization feature setting:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update organization feature setting',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/feature-flags/organizations/[orgId]/features/[featureId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orgId: string; featureId: string } }
) {
  try {
    const { orgId, featureId } = params;
    
    // Find and remove setting
    const settingIndex = mockOrganizationSettings.findIndex(
      setting => 
        setting.organization_id === orgId && 
        setting.feature_id === featureId
    );
    
    if (settingIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Feature setting not found for this organization',
        },
        { status: 404 }
      );
    }
    
    mockOrganizationSettings.splice(settingIndex, 1);
    
    return NextResponse.json({
      success: true,
      message: 'Organization feature setting deleted successfully',
    });
    
  } catch (error) {
    console.error('Error deleting organization feature setting:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete organization feature setting',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}