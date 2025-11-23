// API Client for OptiBid Energy Platform
// Connects to the FastAPI backend with 100+ endpoints

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Types
export interface User {
  id: string
  name: string
  email: string
  role: string
  organization: string
  permissions: string[]
  created_at?: string
  updated_at?: string
}

export interface Asset {
  id: string
  name: string
  type: 'solar' | 'wind' | 'hydro' | 'thermal' | 'battery'
  capacity: number
  location: string
  region: string
  status: 'online' | 'offline' | 'maintenance'
  generation: number
  efficiency: number
  last_maintenance: string
  created_at: string
  updated_at: string
}

export interface Bid {
  id: string
  asset_id: string
  market_type: 'day_ahead' | 'real_time' | 'ancillary'
  price: number
  volume: number
  status: 'pending' | 'accepted' | 'rejected' | 'partial'
  region: string
  bid_time: string
  acceptance_time?: string
  revenue: number
}

export interface MarketData {
  region: string
  market_type: string
  price: number
  demand: number
  supply: number
  frequency: number
  timestamp: string
  weather_impact?: number
}

export interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: string
  read: boolean
}

export interface KPI {
  name: string
  value: number
  change: number
  unit: string
  category: string
}

// Auth API
export const authAPI = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Login failed')
    }
    
    return response.json()
  },

  async register(userData: {
    name: string
    email: string
    password: string
    organization: string
    role: string
  }) {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Registration failed')
    }
    
    return response.json()
  },

  async getCurrentUser() {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user')
    }

    return response.json()
  },

  async logout() {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Logout failed')
    }

    localStorage.removeItem('optibid_access_token')
    localStorage.removeItem('optibid_refresh_token')
    return response.json()
  }
}

// Assets API
export const assetsAPI = {
  async getAll() {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(`${API_BASE_URL}/api/v1/assets`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch assets')
    }

    return response.json()
  },

  async getById(id: string) {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(`${API_BASE_URL}/api/v1/assets/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch asset')
    }

    return response.json()
  },

  async create(assetData: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(`${API_BASE_URL}/api/v1/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(assetData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to create asset')
    }

    return response.json()
  },

  async update(id: string, assetData: Partial<Asset>) {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(`${API_BASE_URL}/api/v1/assets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(assetData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to update asset')
    }

    return response.json()
  },

  async getPerformance(id: string, timeframe: string = '24h') {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(
      `${API_BASE_URL}/api/v1/assets/${id}/performance?timeframe=${timeframe}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch asset performance')
    }

    return response.json()
  }
}

// Bids API
export const bidsAPI = {
  async getAll() {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(`${API_BASE_URL}/api/v1/bidding`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch bids')
    }

    return response.json()
  },

  async create(bidData: Omit<Bid, 'id' | 'bid_time' | 'revenue'>) {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(`${API_BASE_URL}/api/v1/bidding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(bidData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to create bid')
    }

    return response.json()
  },

  async update(id: string, bidData: Partial<Bid>) {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(`${API_BASE_URL}/api/v1/bidding/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(bidData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to update bid')
    }

    return response.json()
  },

  async getById(id: string) {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(`${API_BASE_URL}/api/v1/bidding/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch bid')
    }

    return response.json()
  },

  async getPerformance(timeframe: string = '30d') {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(
      `${API_BASE_URL}/api/v1/bidding/performance?timeframe=${timeframe}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch bidding performance')
    }

    return response.json()
  }
}

// Market Data API
export const marketAPI = {
  async getCurrent() {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(`${API_BASE_URL}/api/v1/market/current`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch current market data')
    }

    return response.json()
  },

  async getHistorical(symbol: string, timeframe: string = '24h') {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(
      `${API_BASE_URL}/api/v1/market/historical?symbol=${symbol}&timeframe=${timeframe}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch historical market data')
    }

    return response.json()
  },

  async getRegions() {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(`${API_BASE_URL}/api/v1/market/regions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch market regions')
    }

    return response.json()
  },

  async getForecasts(region: string) {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(
      `${API_BASE_URL}/api/v1/market/forecasts?region=${region}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch market forecasts')
    }

    return response.json()
  }
}

// Analytics API
export const analyticsAPI = {
  async getKPIs(timeframe: string = '30d') {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(
      `${API_BASE_URL}/api/v1/analytics/kpis?timeframe=${timeframe}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch KPIs')
    }

    return response.json()
  },

  async getBenchmarks() {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(`${API_BASE_URL}/api/v1/analytics/benchmarks`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch benchmarks')
    }

    return response.json()
  },

  async getInsights(category?: string) {
    const token = localStorage.getItem('optibid_access_token')
    const url = category 
      ? `${API_BASE_URL}/api/v1/analytics/insights?category=${category}`
      : `${API_BASE_URL}/api/v1/analytics/insights`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch insights')
    }

    return response.json()
  },

  async getPerformanceTrends(timeframe: string = '90d') {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(
      `${API_BASE_URL}/api/v1/analytics/trends?timeframe=${timeframe}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch performance trends')
    }

    return response.json()
  }
}

// Notifications API
export const notificationsAPI = {
  async getAll() {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(`${API_BASE_URL}/api/v1/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch notifications')
    }

    return response.json()
  },

  async markAsRead(id: string) {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(`${API_BASE_URL}/api/v1/notifications/${id}/read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to mark notification as read')
    }

    return response.json()
  },

  async delete(id: string) {
    const token = localStorage.getItem('optibid_access_token')
    const response = await fetch(`${API_BASE_URL}/api/v1/notifications/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete notification')
    }

    return response.json()
  }
}

// Utility function to handle API errors
export const handleAPIError = (error: any) => {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    localStorage.removeItem('optibid_access_token')
    localStorage.removeItem('optibid_refresh_token')
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
    return 'Session expired. Please login again.'
  } else if (error.response?.status === 403) {
    return 'You do not have permission to perform this action.'
  } else if (error.response?.status === 404) {
    return 'The requested resource was not found.'
  } else if (error.message) {
    return error.message
  } else {
    return 'An unexpected error occurred. Please try again.'
  }
}

// WebSocket URL for real-time updates
export const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws'

// WebSocket event types
export const WS_EVENTS = {
  MARKET_DATA: 'market_data',
  ASSET_UPDATE: 'asset_update',
  BID_UPDATE: 'bid_update',
  SYSTEM_ALERT: 'system_alert',
  NOTIFICATION: 'notification'
}