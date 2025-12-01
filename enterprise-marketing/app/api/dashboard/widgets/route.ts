import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth'

// Mock widgets database
const WIDGETS_DB: { [key: string]: any } = {}

// Initialize with some example widgets
const initializeWidgets = () => {
  WIDGETS_DB['energy-generation-chart-1'] = {
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
    isShared: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T11:30:00Z'
  }
  
  WIDGETS_DB['market-prices-widget-1'] = {
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
    isShared: false,
    createdAt: '2024-01-15T10:05:00Z',
    updatedAt: '2024-01-20T11:30:00Z'
  }
}

// Initialize on module load
initializeWidgets()

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

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || user.id || 'user-1'

    // Get widgets for the user (filter by createdBy)
    const userWidgets = Object.values(WIDGETS_DB).filter(widget => 
      widget.createdBy === userId
    )

    return NextResponse.json({
      success: true,
      data: {
        widgets: userWidgets,
        total: userWidgets.length
      }
    })
  } catch (error) {
    console.error('Error fetching widgets:', error)
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
    const {
      type,
      title,
      position,
      config = {},
      permissions = []
    } = body

    // Validate required fields
    if (!type || !title || !position) {
      return NextResponse.json(
        { error: 'Type, title, and position are required' },
        { status: 400 }
      )
    }

    // Validate position structure
    if (typeof position.x !== 'number' || typeof position.y !== 'number' || 
        typeof position.w !== 'number' || typeof position.h !== 'number') {
      return NextResponse.json(
        { error: 'Position must contain x, y, w, h as numbers' },
        { status: 400 }
      )
    }

    const userId = user.id || 'user-1'
    
    // Create new widget
    const widgetId = `${type}-${Date.now()}`
    const newWidget = {
      id: widgetId,
      type,
      title,
      position,
      config,
      permissions: permissions.length > 0 ? permissions : getDefaultPermissions(type),
      createdBy: userId,
      isShared: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Store widget
    WIDGETS_DB[widgetId] = newWidget

    return NextResponse.json({
      success: true,
      data: newWidget
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating widget:', error)
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
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Widget ID is required' },
        { status: 400 }
      )
    }

    // Check if widget exists
    const existingWidget = WIDGETS_DB[id]
    if (!existingWidget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      )
    }

    // Check permissions (user can only update their own widgets unless admin)
    const userId = user.id || 'user-1'
    if (existingWidget.createdBy !== userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions to update this widget' },
        { status: 403 }
      )
    }

    // Update widget
    const updatedWidget = {
      ...existingWidget,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    // Validate position if provided
    if (updates.position) {
      const { x, y, w, h } = updates.position
      if (typeof x !== 'number' || typeof y !== 'number' || 
          typeof w !== 'number' || typeof h !== 'number') {
        return NextResponse.json(
          { error: 'Position must contain x, y, w, h as numbers' },
          { status: 400 }
        )
      }
    }

    // Save updated widget
    WIDGETS_DB[id] = updatedWidget

    return NextResponse.json({
      success: true,
      data: updatedWidget
    })
  } catch (error) {
    console.error('Error updating widget:', error)
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

    const { searchParams } = new URL(request.url)
    const widgetId = searchParams.get('id')

    if (!widgetId) {
      return NextResponse.json(
        { error: 'Widget ID is required' },
        { status: 400 }
      )
    }

    // Check if widget exists
    const existingWidget = WIDGETS_DB[widgetId]
    if (!existingWidget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      )
    }

    // Check permissions (user can only delete their own widgets unless admin)
    const userId = user.id || 'user-1'
    if (existingWidget.createdBy !== userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete this widget' },
        { status: 403 }
      )
    }

    // Delete widget
    delete WIDGETS_DB[widgetId]

    return NextResponse.json({
      success: true,
      message: 'Widget deleted successfully',
      deletedWidgetId: widgetId 
    })
  } catch (error) {
    console.error('Error deleting widget:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to get default permissions for widget type
function getDefaultPermissions(widgetType: string): string[] {
  const permissionMap: { [key: string]: string[] } = {
    'energy-generation-chart': ['data.view-energy'],
    'market-prices-widget': ['data.view-market'],
    'asset-status-grid': ['data.view-asset'],
    'performance-kpis': ['data.view-energy'],
    'trading-dashboard': ['data.view-market'],
    'team-activity-feed': ['team.collaborate'],
    'compliance-report': ['admin.audit'],
    'geographic-map': ['data.view-asset']
  }

  return permissionMap[widgetType] || ['widget.view']
}

// Bulk operations
export async function PATCH(request: NextRequest) {
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
    const { operation, widgets } = body

    if (operation !== 'bulk-update') {
      return NextResponse.json(
        { error: 'Unsupported operation' },
        { status: 400 }
      )
    }

    if (!Array.isArray(widgets)) {
      return NextResponse.json(
        { error: 'Widgets must be an array' },
        { status: 400 }
      )
    }

    const userId = user.id || 'user-1'
    const updatedWidgets = []

    for (const widgetUpdate of widgets) {
      const { id, ...updates } = widgetUpdate
      
      if (!id) {
        continue
      }

      const existingWidget = WIDGETS_DB[id]
      if (!existingWidget) {
        continue
      }

      // Check permissions
      if (existingWidget.createdBy !== userId && user.role !== 'admin') {
        continue
      }

      const updatedWidget = {
        ...existingWidget,
        ...updates,
        updatedAt: new Date().toISOString()
      }

      WIDGETS_DB[id] = updatedWidget
      updatedWidgets.push(updatedWidget)
    }

    return NextResponse.json({
      success: true,
      message: 'Bulk update completed',
      data: {
        updatedWidgets,
        totalUpdated: updatedWidgets.length
      }
    })
  } catch (error) {
    console.error('Error in bulk widget operation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}