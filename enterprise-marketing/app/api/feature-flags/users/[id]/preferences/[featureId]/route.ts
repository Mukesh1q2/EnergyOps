// =============================================================================
// FEATURE FLAGS API - INDIVIDUAL USER PREFERENCE UPDATE
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';

// Mock database (same as parent route)
let mockUserPreferences: any[] = [
  {
    id: 'user-pref-1',
    user_id: 'user-456',
    feature_id: 'feature-1',
    preference_value: { theme: 'dark' },
    is_favorite: true,
    widget_settings: { refresh_interval: 30 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// PATCH /api/feature-flags/users/[userId]/preferences/[featureId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string; featureId: string } }
) {
  try {
    const { userId, featureId } = params;
    const body = await request.json();
    
    // Find existing preference
    const preferenceIndex = mockUserPreferences.findIndex(
      pref => 
        pref.user_id === userId && 
        pref.feature_id === featureId
    );
    
    if (preferenceIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'User preference not found for this feature',
        },
        { status: 404 }
      );
    }
    
    // Update preference
    const updatedPreference = {
      ...mockUserPreferences[preferenceIndex],
      preference_value: body.preference_value || mockUserPreferences[preferenceIndex].preference_value,
      is_favorite: body.is_favorite !== undefined ? body.is_favorite : mockUserPreferences[preferenceIndex].is_favorite,
      widget_settings: body.widget_settings || mockUserPreferences[preferenceIndex].widget_settings,
      updated_at: new Date().toISOString(),
    };
    
    mockUserPreferences[preferenceIndex] = updatedPreference;
    
    return NextResponse.json({
      success: true,
      data: {
        preference: updatedPreference,
      },
      message: 'User preference updated successfully',
    });
    
  } catch (error) {
    console.error('Error updating user preference:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user preference',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/feature-flags/users/[userId]/preferences/[featureId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string; featureId: string } }
) {
  try {
    const { userId, featureId } = params;
    
    // Find and remove preference
    const preferenceIndex = mockUserPreferences.findIndex(
      pref => 
        pref.user_id === userId && 
        pref.feature_id === featureId
    );
    
    if (preferenceIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'User preference not found for this feature',
        },
        { status: 404 }
      );
    }
    
    mockUserPreferences.splice(preferenceIndex, 1);
    
    return NextResponse.json({
      success: true,
      message: 'User preference deleted successfully',
    });
    
  } catch (error) {
    console.error('Error deleting user preference:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete user preference',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}