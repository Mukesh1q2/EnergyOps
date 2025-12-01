import { NextRequest, NextResponse } from 'next/server'

// Default widgets for new users
const DEFAULT_WIDGETS = {
  widgets: [
    {
      id: 'demo-energy-chart',
      type: 'energy-generation-chart',
      title: 'Real-time Energy Generation',
      position: { x: 0, y: 0, w: 8, h: 4 },
      config: { 
        dataSource: 'all', 
        timeRange: '24h',
        aggregation: 'sum'
      },
      permissions: ['data.view-energy']
    },
    {
      id: 'demo-market-prices',
      type: 'market-prices-widget',
      title: 'Market Prices - PJM Zone',
      position: { x: 8, y: 0, w: 4, h: 4 },
      config: { 
        marketZone: 'PJM', 
        priceType: 'LMP',
        showTrend: true
      },
      permissions: ['data.view-market']
    },
    {
      id: 'demo-asset-grid',
      type: 'asset-status-grid',
      title: 'Asset Status Overview',
      position: { x: 0, y: 4, w: 12, h: 3 },
      config: { 
        assetTypes: ['solar', 'wind', 'battery'],
        showMetrics: true,
        refreshInterval: '1m'
      },
      permissions: ['data.view-asset']
    }
  ],
  layout: 'grid',
  theme: 'light',
  name: 'Default Dashboard',
  description: 'Default dashboard with essential widgets'
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: DEFAULT_WIDGETS
    })
  } catch (error) {
    console.error('Error fetching default widgets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
