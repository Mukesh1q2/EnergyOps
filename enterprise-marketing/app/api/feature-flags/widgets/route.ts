// =============================================================================
// FEATURE FLAGS API - WIDGET LIBRARY ENDPOINT
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { WidgetLibrary } from '@/lib/feature-flags/types';

// Mock widgets database
const mockWidgets: WidgetLibrary[] = [
  {
    id: 'widget-1',
    name: 'Real-time Market Price Chart',
    description: 'Live market price visualization with customizable timeframes',
    category: 'market_data',
    component_type: 'chart',
    default_config: {
      title: 'Market Prices',
      refresh_interval: 30,
      max_data_points: 100,
      chart_type: 'line',
      color_scheme: 'blue',
      show_legend: true,
      enable_tooltips: true,
      exportable: true,
    },
    feature_dependencies: ['feature-2'], // real_time_data
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'widget-2',
    name: 'Portfolio Performance Dashboard',
    description: 'Comprehensive portfolio analysis with P&L tracking',
    category: 'portfolio',
    component_type: 'dashboard',
    default_config: {
      title: 'Portfolio Performance',
      refresh_interval: 300,
      max_data_points: 50,
      show_legend: true,
      enable_tooltips: true,
      exportable: true,
    },
    feature_dependencies: ['feature-1'], // advanced_analytics
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'widget-3',
    name: 'AI Price Forecast',
    description: 'AI-powered price predictions with confidence intervals',
    category: 'analytics',
    component_type: 'chart',
    default_config: {
      title: 'Price Forecast',
      refresh_interval: 900, // 15 minutes
      max_data_points: 24,
      chart_type: 'area',
      color_scheme: 'purple',
      show_legend: true,
      enable_tooltips: true,
      exportable: true,
    },
    feature_dependencies: ['feature-3'], // ai_powered_insights
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'widget-4',
    name: 'Risk Assessment Panel',
    description: 'Real-time risk metrics and alerts',
    category: 'risk_management',
    component_type: 'panel',
    default_config: {
      title: 'Risk Assessment',
      refresh_interval: 60,
      show_legend: false,
      enable_tooltips: true,
      exportable: false,
    },
    feature_dependencies: ['feature-3', 'feature-4'], // ai_powered_insights, enterprise_security
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'widget-5',
    name: 'Team Collaboration Board',
    description: 'Team workspace with shared insights and annotations',
    category: 'collaboration',
    component_type: 'board',
    default_config: {
      title: 'Team Collaboration',
      refresh_interval: 30,
      enable_tooltips: true,
      exportable: false,
    },
    feature_dependencies: ['feature-5'], // collaboration_tools
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'widget-6',
    name: 'Geographic Energy Map',
    description: 'Interactive map showing energy generation and consumption',
    category: 'geographic',
    component_type: 'map',
    default_config: {
      title: 'Energy Map',
      refresh_interval: 300,
      show_legend: true,
      enable_tooltips: true,
      exportable: true,
    },
    feature_dependencies: ['feature-10'], // geographic_visualization
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'widget-7',
    name: 'Compliance Status Monitor',
    description: 'Real-time compliance status and audit trail',
    category: 'compliance',
    component_type: 'monitor',
    default_config: {
      title: 'Compliance Status',
      refresh_interval: 600, // 10 minutes
      show_legend: false,
      enable_tooltips: true,
      exportable: true,
    },
    feature_dependencies: ['feature-9'], // compliance_reporting
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'widget-8',
    name: 'Mobile Trading Interface',
    description: 'Optimized trading interface for mobile devices',
    category: 'trading',
    component_type: 'interface',
    default_config: {
      title: 'Mobile Trading',
      refresh_interval: 15,
      max_data_points: 20,
      show_legend: false,
      enable_tooltips: false,
      exportable: false,
    },
    feature_dependencies: ['feature-6'], // mobile_app
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'widget-9',
    name: 'Blockchain Transaction Monitor',
    description: 'Real-time blockchain transaction tracking',
    category: 'blockchain',
    component_type: 'monitor',
    default_config: {
      title: 'Blockchain Monitor',
      refresh_interval: 60,
      show_legend: false,
      enable_tooltips: true,
      exportable: true,
    },
    feature_dependencies: ['feature-7'], // blockchain_integration
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'widget-10',
    name: 'API Integration Status',
    description: 'API connection status and performance metrics',
    category: 'integration',
    component_type: 'status',
    default_config: {
      title: 'API Status',
      refresh_interval: 30,
      show_legend: false,
      enable_tooltips: false,
      exportable: true,
    },
    feature_dependencies: ['feature-8'], // api_integration
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// GET /api/feature-flags/widgets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const componentType = searchParams.get('component_type');
    const active = searchParams.get('active');
    
    let widgets = mockWidgets;
    
    // Filter by category
    if (category) {
      widgets = widgets.filter(w => w.category === category);
    }
    
    // Filter by component type
    if (componentType) {
      widgets = widgets.filter(w => w.component_type === componentType);
    }
    
    // Filter by active status
    if (active !== null) {
      const isActive = active === 'true';
      widgets = widgets.filter(w => w.is_active === isActive);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        widgets,
        total: widgets.length,
        categories: [...new Set(widgets.map(w => w.category))],
        component_types: [...new Set(widgets.map(w => w.component_type))],
      },
      message: 'Widgets retrieved successfully',
    });
    
  } catch (error) {
    console.error('Error fetching widgets:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch widgets',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/feature-flags/widgets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'component_type'];
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
    
    // Create new widget
    const newWidget: WidgetLibrary = {
      id: `widget-${Date.now()}`,
      name: body.name,
      description: body.description,
      category: body.category,
      component_type: body.component_type,
      default_config: body.default_config || {},
      feature_dependencies: body.feature_dependencies || [],
      is_active: body.is_active !== undefined ? body.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    mockWidgets.push(newWidget);
    
    return NextResponse.json({
      success: true,
      data: {
        widget: newWidget,
      },
      message: 'Widget created successfully',
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating widget:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create widget',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}