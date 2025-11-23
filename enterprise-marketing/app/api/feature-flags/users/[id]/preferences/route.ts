// =============================================================================
// FEATURE FLAGS API - USER PREFERENCES ENDPOINT
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { UserFeaturePreference } from '@/lib/feature-flags/types';

// Mock database for development
const mockUserPreferences: UserFeaturePreference[] = [
  {
    id: 'user-pref-1',
    user_id: 'user-456',
    feature_id: 'feature-1', // advanced_analytics
    preference_value: { theme: 'dark', layout: 'compact' },
    is_favorite: true,
    widget_settings: {
      position: { x: 0, y: 0, width: 6, height: 4 },
      visible: true,
      refresh_interval: 30,
      chart_type: 'line',
      color_scheme: 'blue',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-pref-2',
    user_id: 'user-456',
    feature_id: 'feature-5', // collaboration_tools
    preference_value: { notifications: true, sound_enabled: false },
    is_favorite: false,
    widget_settings: {
      position: { x: 6, y: 0, width: 6, height: 4 },
      visible: true,
      refresh_interval: 60,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// GET /api/feature-flags/users/[id]/preferences
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    // Get user preferences
    const preferences = mockUserPreferences.filter(
      pref => pref.user_id === userId
    );
    
    return NextResponse.json({
      success: true,
      data: {
        preferences,
        total: preferences.length,
        user_id: userId,
      },
      message: 'User preferences retrieved successfully',
    });
    
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user preferences',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/feature-flags/users/[id]/preferences
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['feature_id'];
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
    
    // Check if preference already exists
    const existingPreference = mockUserPreferences.find(
      pref => 
        pref.user_id === userId && 
        pref.feature_id === body.feature_id
    );
    
    if (existingPreference) {
      return NextResponse.json(
        {
          success: false,
          error: 'User preference already exists for this feature',
        },
        { status: 409 }
      );
    }
    
    // Create new user preference
    const newPreference: UserFeaturePreference = {
      id: `user-pref-${Date.now()}`,
      user_id: userId,
      feature_id: body.feature_id,
      preference_value: body.preference_value || {},
      is_favorite: body.is_favorite || false,
      widget_settings: body.widget_settings || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    mockUserPreferences.push(newPreference);
    
    return NextResponse.json({
      success: true,
      data: {
        preference: newPreference,
      },
      message: 'User preference created successfully',
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating user preference:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user preference',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}