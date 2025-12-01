import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth'

// Mock layout storage
const LAYOUTS_DB: { [key: string]: any } = {}

// Default layout templates
const LAYOUT_TEMPLATES = {
  'energy-analytics': {
    name: 'Energy Analytics',
    description: 'Comprehensive energy trading and analytics dashboard',
    layout: {
      lg: [
        { i: 'energy-chart', x: 0, y: 0, w: 6, h: 4 },
        { i: 'market-prices', x: 6, y: 0, w: 6, h: 4 },
        { i: 'asset-grid', x: 0, y: 4, w: 4, h: 4 },
        { i: 'kpi-cards', x: 4, y: 4, w: 4, h: 4 },
        { i: 'trading-dashboard', x: 8, y: 4, w: 4, h: 4 }
      ],
      md: [
        { i: 'energy-chart', x: 0, y: 0, w: 8, h: 4 },
        { i: 'market-prices', x: 0, y: 4, w: 8, h: 4 },
        { i: 'asset-grid', x: 0, y: 8, w: 4, h: 4 },
        { i: 'kpi-cards', x: 4, y: 8, w: 4, h: 4 },
        { i: 'trading-dashboard', x: 0, y: 12, w: 8, h: 4 }
      ],
      sm: [
        { i: 'energy-chart', x: 0, y: 0, w: 6, h: 3 },
        { i: 'market-prices', x: 0, y: 3, w: 6, h: 3 },
        { i: 'asset-grid', x: 0, y: 6, w: 6, h: 3 },
        { i: 'kpi-cards', x: 0, y: 9, w: 6, h: 3 },
        { i: 'trading-dashboard', x: 0, y: 12, w: 6, h: 3 }
      ],
      xs: [
        { i: 'energy-chart', x: 0, y: 0, w: 4, h: 3 },
        { i: 'market-prices', x: 0, y: 3, w: 4, h: 3 },
        { i: 'asset-grid', x: 0, y: 6, w: 4, h: 3 },
        { i: 'kpi-cards', x: 0, y: 9, w: 4, h: 3 },
        { i: 'trading-dashboard', x: 0, y: 12, w: 4, h: 3 }
      ],
      xxs: [
        { i: 'energy-chart', x: 0, y: 0, w: 2, h: 3 },
        { i: 'market-prices', x: 0, y: 3, w: 2, h: 3 },
        { i: 'asset-grid', x: 0, y: 6, w: 2, h: 3 },
        { i: 'kpi-cards', x: 0, y: 9, w: 2, h: 3 },
        { i: 'trading-dashboard', x: 0, y: 12, w: 2, h: 3 }
      ]
    }
  },
  'executive-summary': {
    name: 'Executive Summary',
    description: 'High-level KPI and metrics overview for executives',
    layout: {
      lg: [
        { i: 'kpi-summary', x: 0, y: 0, w: 12, h: 2 },
        { i: 'revenue-chart', x: 0, y: 2, w: 6, h: 4 },
        { i: 'generation-trend', x: 6, y: 2, w: 6, h: 4 },
        { i: 'compliance-status', x: 0, y: 6, w: 4, h: 3 },
        { i: 'market-summary', x: 4, y: 6, w: 4, h: 3 },
        { i: 'team-activity', x: 8, y: 6, w: 4, h: 3 }
      ],
      md: [
        { i: 'kpi-summary', x: 0, y: 0, w: 10, h: 2 },
        { i: 'revenue-chart', x: 0, y: 2, w: 10, h: 4 },
        { i: 'generation-trend', x: 0, y: 6, w: 10, h: 4 },
        { i: 'compliance-status', x: 0, y: 10, w: 3, h: 3 },
        { i: 'market-summary', x: 3, y: 10, w: 3, h: 3 },
        { i: 'team-activity', x: 6, y: 10, w: 4, h: 3 }
      ],
      sm: [
        { i: 'kpi-summary', x: 0, y: 0, w: 6, h: 2 },
        { i: 'revenue-chart', x: 0, y: 2, w: 6, h: 4 },
        { i: 'generation-trend', x: 0, y: 6, w: 6, h: 4 },
        { i: 'compliance-status', x: 0, y: 10, w: 6, h: 3 },
        { i: 'market-summary', x: 0, y: 13, w: 6, h: 3 },
        { i: 'team-activity', x: 0, y: 16, w: 6, h: 3 }
      ],
      xs: [
        { i: 'kpi-summary', x: 0, y: 0, w: 4, h: 2 },
        { i: 'revenue-chart', x: 0, y: 2, w: 4, h: 4 },
        { i: 'generation-trend', x: 0, y: 6, w: 4, h: 4 },
        { i: 'compliance-status', x: 0, y: 10, w: 4, h: 3 },
        { i: 'market-summary', x: 0, y: 13, w: 4, h: 3 },
        { i: 'team-activity', x: 0, y: 16, w: 4, h: 3 }
      ],
      xxs: [
        { i: 'kpi-summary', x: 0, y: 0, w: 2, h: 2 },
        { i: 'revenue-chart', x: 0, y: 2, w: 2, h: 4 },
        { i: 'generation-trend', x: 0, y: 6, w: 2, h: 4 },
        { i: 'compliance-status', x: 0, y: 10, w: 2, h: 3 },
        { i: 'market-summary', x: 0, y: 13, w: 2, h: 3 },
        { i: 'team-activity', x: 0, y: 16, w: 2, h: 3 }
      ]
    }
  },
  'real-time-monitoring': {
    name: 'Real-time Monitoring',
    description: 'Live monitoring dashboard for operations teams',
    layout: {
      lg: [
        { i: 'live-status', x: 0, y: 0, w: 12, h: 2 },
        { i: 'real-time-prices', x: 0, y: 2, w: 8, h: 4 },
        { i: 'asset-map', x: 8, y: 2, w: 4, h: 4 },
        { i: 'alert-feed', x: 0, y: 6, w: 4, h: 4 },
        { i: 'system-health', x: 4, y: 6, w: 4, h: 4 },
        { i: 'team-presence', x: 8, y: 6, w: 4, h: 4 }
      ],
      md: [
        { i: 'live-status', x: 0, y: 0, w: 10, h: 2 },
        { i: 'real-time-prices', x: 0, y: 2, w: 10, h: 4 },
        { i: 'asset-map', x: 0, y: 6, w: 10, h: 4 },
        { i: 'alert-feed', x: 0, y: 10, w: 3, h: 4 },
        { i: 'system-health', x: 3, y: 10, w: 3, h: 4 },
        { i: 'team-presence', x: 6, y: 10, w: 4, h: 4 }
      ],
      sm: [
        { i: 'live-status', x: 0, y: 0, w: 6, h: 2 },
        { i: 'real-time-prices', x: 0, y: 2, w: 6, h: 4 },
        { i: 'asset-map', x: 0, y: 6, w: 6, h: 4 },
        { i: 'alert-feed', x: 0, y: 10, w: 6, h: 3 },
        { i: 'system-health', x: 0, y: 13, w: 6, h: 3 },
        { i: 'team-presence', x: 0, y: 16, w: 6, h: 3 }
      ],
      xs: [
        { i: 'live-status', x: 0, y: 0, w: 4, h: 2 },
        { i: 'real-time-prices', x: 0, y: 2, w: 4, h: 4 },
        { i: 'asset-map', x: 0, y: 6, w: 4, h: 4 },
        { i: 'alert-feed', x: 0, y: 10, w: 4, h: 3 },
        { i: 'system-health', x: 0, y: 13, w: 4, h: 3 },
        { i: 'team-presence', x: 0, y: 16, w: 4, h: 3 }
      ],
      xxs: [
        { i: 'live-status', x: 0, y: 0, w: 2, h: 2 },
        { i: 'real-time-prices', x: 0, y: 2, w: 2, h: 4 },
        { i: 'asset-map', x: 0, y: 6, w: 2, h: 4 },
        { i: 'alert-feed', x: 0, y: 10, w: 2, h: 3 },
        { i: 'system-health', x: 0, y: 13, w: 2, h: 3 },
        { i: 'team-presence', x: 0, y: 16, w: 2, h: 3 }
      ]
    }
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

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || user.id || 'user-1'
    const template = searchParams.get('template')

    if (template && LAYOUT_TEMPLATES[template]) {
      // Return template layout
      return NextResponse.json(LAYOUT_TEMPLATES[template])
    }

    // Get user's saved layout
    const userLayoutKey = `layout-${userId}`
    const userLayout = LAYOUTS_DB[userLayoutKey] || {
      layout: LAYOUT_TEMPLATES['energy-analytics'].layout,
      savedAt: new Date().toISOString(),
      version: 1
    }

    return NextResponse.json(userLayout)
  } catch (error) {
    console.error('Error fetching layout:', error)
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
    const { layout, template, name, description } = body

    const userId = user.id || 'user-1'

    if (template) {
      // Create layout from template
      if (!LAYOUT_TEMPLATES[template]) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        )
      }

      const templateLayout = LAYOUT_TEMPLATES[template]
      const newLayout = {
        id: `layout-${Date.now()}`,
        name: name || templateLayout.name,
        description: description || templateLayout.description,
        layout: templateLayout.layout,
        template,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      }

      // Save layout
      const layoutKey = `layout-${userId}`
      LAYOUTS_DB[layoutKey] = newLayout

      return NextResponse.json(newLayout, { status: 201 })
    }

    // Save custom layout
    if (!layout) {
      return NextResponse.json(
        { error: 'Layout is required' },
        { status: 400 }
      )
    }

    // Validate layout structure
    if (!layout.lg || !Array.isArray(layout.lg)) {
      return NextResponse.json(
        { error: 'Layout must contain lg array' },
        { status: 400 }
      )
    }

    const layoutKey = `layout-${userId}`
    const existingLayout = LAYOUTS_DB[layoutKey]
    
    const newLayout = {
      ...existingLayout,
      layout,
      name: name || existingLayout?.name || 'My Dashboard',
      description: description || existingLayout?.description || '',
      updatedAt: new Date().toISOString(),
      version: (existingLayout?.version || 0) + 1
    }

    LAYOUTS_DB[layoutKey] = newLayout

    return NextResponse.json(newLayout)
  } catch (error) {
    console.error('Error saving layout:', error)
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
    const { layout, name, description } = body

    if (!layout) {
      return NextResponse.json(
        { error: 'Layout is required' },
        { status: 400 }
      )
    }

    const userId = user.id || 'user-1'
    const layoutKey = `layout-${userId}`
    const existingLayout = LAYOUTS_DB[layoutKey]

    if (!existingLayout) {
      return NextResponse.json(
        { error: 'Layout not found' },
        { status: 404 }
      )
    }

    // Check permissions (user can only update their own layouts)
    if (existingLayout.createdBy && existingLayout.createdBy !== userId) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update this layout' },
        { status: 403 }
      )
    }

    const updatedLayout = {
      ...existingLayout,
      layout,
      name: name || existingLayout.name,
      description: description || existingLayout.description,
      updatedAt: new Date().toISOString(),
      version: existingLayout.version + 1
    }

    LAYOUTS_DB[layoutKey] = updatedLayout

    return NextResponse.json(updatedLayout)
  } catch (error) {
    console.error('Error updating layout:', error)
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
    const layoutKey = `layout-${userId}`

    if (LAYOUTS_DB[layoutKey]) {
      delete LAYOUTS_DB[layoutKey]
      return NextResponse.json({ message: 'Layout deleted successfully' })
    } else {
      return NextResponse.json(
        { error: 'Layout not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error deleting layout:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get available templates
export async function OPTIONS(request: NextRequest) {
  try {
    const templates = Object.entries(LAYOUT_TEMPLATES).map(([key, template]) => ({
      id: key,
      name: template.name,
      description: template.description,
      widgets: template.layout.lg.length
    }))

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}