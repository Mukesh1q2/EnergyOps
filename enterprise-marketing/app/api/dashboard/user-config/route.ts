import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '../../../../../lib/auth'

// Mock user dashboard configurations
const USER_CONFIGS = {
  'user-1': {
    id: 'dashboard-1',
    name: 'Main Dashboard',
    description: 'Primary energy trading dashboard',
    widgets: [
      {
        id: 'energy-generation-chart-1',
        type: 'energy-generation-chart',
        title: 'Energy Generation',
        position: { x: 0, y: 0, w: 6, h: 4 },
        config: {
          dataSource: 'solar',
          timeRange: '24h',
          aggregation: 'sum'
        },
        permissions: ['data.view-energy'],
        createdBy: 'user-1',
        isShared: false
      },
      {
        id: 'market-prices-widget-1',
        type: 'market-prices-widget',
        title: 'Market Prices',
        position: { x: 6, y: 0, w: 6, h: 4 },
        config: {
          marketZone: 'PJM',
          priceType: 'LMP',
          showTrend: true
        },
        permissions: ['data.view-market'],
        createdBy: 'user-1',
        isShared: false
      },
      {
        id: 'asset-status-grid-1',
        type: 'asset-status-grid',
        title: 'Asset Status',
        position: { x: 0, y: 4, w: 4, h: 4 },
        config: {
          assetTypes: ['solar', 'wind'],
          showMetrics: true,
          refreshInterval: '1m'
        },
        permissions: ['data.view-asset'],
        createdBy: 'user-1',
        isShared: false
      },
      {
        id: 'performance-kpis-1',
        type: 'performance-kpis',
        title: 'Performance KPIs',
        position: { x: 4, y: 4, w: 4, h: 4 },
        config: {
          kpiType: 'generation',
          comparisonPeriod: 'previous-period'
        },
        permissions: ['data.view-energy'],
        createdBy: 'user-1',
        isShared: false
      },
      {
        id: 'trading-dashboard-1',
        type: 'trading-dashboard',
        title: 'Trading Overview',
        position: { x: 8, y: 4, w: 4, h: 4 },
        config: {
          marketZone: 'PJM',
          showOrders: true,
          timeHorizon: 'day-ahead'
        },
        permissions: ['data.view-market'],
        createdBy: 'user-1',
        isShared: false
      }
    ],
    layout: 'grid',
    theme: 'light',
    permissions: ['dashboard.view', 'dashboard.edit', 'widget.view', 'widget.create', 'widget.edit'],
    sharedWith: [],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T11:30:00Z'
  },
  'user-2': {
    id: 'dashboard-2',
    name: 'Analytics Dashboard',
    description: 'Detailed analytics and reporting',
    widgets: [
      {
        id: 'compliance-report-1',
        type: 'compliance-report',
        title: 'Compliance Report',
        position: { x: 0, y: 0, w: 12, h: 3 },
        config: {
          reportType: 'monthly',
          includeCharts: true,
          format: 'pdf'
        },
        permissions: ['admin.audit'],
        createdBy: 'user-2',
        isShared: false
      },
      {
        id: 'performance-kpis-2',
        type: 'performance-kpis',
        title: 'Key Metrics',
        position: { x: 0, y: 3, w: 6, h: 3 },
        config: {
          kpiType: 'all',
          comparisonPeriod: 'target'
        },
        permissions: ['data.view-energy', 'data.view-market'],
        createdBy: 'user-2',
        isShared: false
      },
      {
        id: 'team-activity-feed-1',
        type: 'team-activity-feed',
        title: 'Team Activity',
        position: { x: 6, y: 3, w: 6, h: 3 },
        config: {
          teamMembers: [],
          activityTypes: ['comments', 'edits', 'shares']
        },
        permissions: ['team.collaborate'],
        createdBy: 'user-2',
        isShared: false
      }
    ],
    layout: 'grid',
    theme: 'dark',
    permissions: ['dashboard.view', 'dashboard.edit', 'widget.view', 'widget.create', 'widget.edit'],
    sharedWith: [],
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-20T10:15:00Z'
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const user = await verifyAuthToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Get user ID from token (in real implementation)
    const userId = user.id || 'user-1'
    
    // Get user's dashboard configuration
    const userConfig = USER_CONFIGS[userId] || {
      id: `dashboard-${userId}`,
      name: 'My Dashboard',
      description: 'Personal dashboard',
      widgets: [],
      layout: 'grid',
      theme: 'light',
      permissions: ['dashboard.view', 'widget.view'],
      sharedWith: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add user permissions to response
    const configWithPermissions = {
      ...userConfig,
      userPermissions: [
        'dashboard.view',
        'dashboard.create',
        'dashboard.edit',
        'dashboard.delete',
        'dashboard.share',
        'widget.view',
        'widget.create',
        'widget.edit',
        'widget.delete',
        'widget.configure',
        'data.view-energy',
        'data.view-market',
        'data.view-asset',
        'data.export',
        'team.view',
        'team.invite',
        'team.manage',
        'team.collaborate'
      ]
    }

    return NextResponse.json(configWithPermissions)
  } catch (error) {
    console.error('Error fetching user dashboard config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const user = await verifyAuthToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, theme = 'light' } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Dashboard name is required' },
        { status: 400 }
      )
    }

    const userId = user.id || 'user-1'
    
    // Create new dashboard configuration
    const newDashboard = {
      id: `dashboard-${Date.now()}`,
      name,
      description: description || '',
      widgets: [],
      layout: 'grid',
      theme,
      permissions: ['dashboard.view', 'dashboard.edit', 'widget.view', 'widget.create', 'widget.edit'],
      sharedWith: [],
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Store in mock database (in real implementation, this would be saved to database)
    USER_CONFIGS[userId] = newDashboard

    return NextResponse.json(newDashboard, { status: 201 })
  } catch (error) {
    console.error('Error creating dashboard config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const user = await verifyAuthToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, theme } = body

    const userId = user.id || 'user-1'
    const existingConfig = USER_CONFIGS[userId]

    if (!existingConfig) {
      return NextResponse.json(
        { error: 'Dashboard configuration not found' },
        { status: 404 }
      )
    }

    // Update configuration
    const updatedConfig = {
      ...existingConfig,
      name: name || existingConfig.name,
      description: description || existingConfig.description,
      theme: theme || existingConfig.theme,
      updatedAt: new Date().toISOString()
    }

    // Save updated configuration
    USER_CONFIGS[userId] = updatedConfig

    return NextResponse.json(updatedConfig)
  } catch (error) {
    console.error('Error updating dashboard config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const user = await verifyAuthToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const userId = user.id || 'user-1'
    
    // Delete dashboard configuration
    if (USER_CONFIGS[userId]) {
      delete USER_CONFIGS[userId]
      return NextResponse.json({ message: 'Dashboard deleted successfully' })
    } else {
      return NextResponse.json(
        { error: 'Dashboard configuration not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error deleting dashboard config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}