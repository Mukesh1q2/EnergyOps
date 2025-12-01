'use client'

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

// Types
interface WebSocketContextType {
  socket: Socket | null
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  connect: () => void
  disconnect: () => void
  emit: (event: string, data?: any) => void
  subscribe: (event: string, callback: (data: any) => void) => () => void
  unsubscribe: (event: string) => void
  lastMessage: any
  error: Error | null
}

interface MarketDataUpdate {
  type: 'market_data'
  symbol: string
  price: number
  volume: number
  timestamp: string
  region: string
}

interface AssetUpdate {
  type: 'asset_update'
  assetId: string
  status: 'online' | 'offline' | 'maintenance'
  generation: number
  capacity: number
  efficiency: number
  timestamp: string
}

interface BidUpdate {
  type: 'bid_update'
  bidId: string
  status: 'pending' | 'accepted' | 'rejected'
  price: number
  volume: number
  timestamp: string
}

interface SystemAlert {
  type: 'system_alert'
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  timestamp: string
  category: 'system' | 'market' | 'asset' | 'bidding'
}

type SocketMessage = MarketDataUpdate | AssetUpdate | BidUpdate | SystemAlert | any

// Create context
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

// WebSocket configuration
const WS_CONFIG = {
  url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
  options: {
    transports: ['websocket'],
    timeout: 10000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    maxReconnectionAttempts: 5,
  },
}

// Event names
const WS_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  
  // Market data
  MARKET_DATA: 'market_data',
  PRICE_UPDATE: 'price_update',
  VOLUME_UPDATE: 'volume_update',
  
  // Assets
  ASSET_UPDATE: 'asset_update',
  ASSET_STATUS: 'asset_status',
  GENERATION_UPDATE: 'generation_update',
  
  // Bidding
  BID_UPDATE: 'bid_update',
  BID_STATUS: 'bid_status',
  BID_ACCEPTED: 'bid_accepted',
  BID_REJECTED: 'bid_rejected',
  
  // System
  SYSTEM_ALERT: 'system_alert',
  NOTIFICATION: 'notification',
  HEARTBEAT: 'heartbeat',
  
  // Client events
  SUBSCRIBE_MARKET: 'subscribe_market',
  SUBSCRIBE_ASSETS: 'subscribe_assets',
  SUBSCRIBE_BIDS: 'subscribe_bids',
  UNSUBSCRIBE: 'unsubscribe',
} as const

// WebSocket Provider Component
export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null)
  const [error, setError] = useState<Error | null>(null)
  
  // Refs for cleanup and event management
  const reconnectAttempts = useRef(0)
  const eventSubscriptions = useRef<Map<string, Set<Function>>>(new Map())
  const maxReconnectAttempts = 5
  const reconnectDelay = 1000

  // Initialize socket connection
  const connect = useCallback(() => {
    if (socket?.connected) return

    setConnectionStatus('connecting')
    setError(null)

    try {
      const newSocket = io(WS_CONFIG.url, WS_CONFIG.options)
      
      // Connection event handlers
      newSocket.on(WS_EVENTS.CONNECT, () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setConnectionStatus('connected')
        setError(null)
        reconnectAttempts.current = 0
      })

      newSocket.on(WS_EVENTS.DISCONNECT, (reason) => {
        console.log('WebSocket disconnected:', reason)
        setIsConnected(false)
        setConnectionStatus('disconnected')
      })

      newSocket.on(WS_EVENTS.ERROR, (err) => {
        console.error('WebSocket error:', err)
        setError(err)
        setConnectionStatus('error')
      })

      // Auto-reconnect logic
      newSocket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`Reconnection attempt ${attemptNumber}`)
        setConnectionStatus('connecting')
      })

      newSocket.on('reconnect_failed', () => {
        console.error('Failed to reconnect after maximum attempts')
        setConnectionStatus('error')
        setError(new Error('Failed to reconnect to WebSocket'))
      })

      // Message handler
      newSocket.onAny((eventName, data) => {
        console.log('WebSocket message received:', eventName, data)
        setLastMessage({ type: eventName, ...data, timestamp: new Date().toISOString() })
        
        // Notify subscribers
        const subscribers = eventSubscriptions.current.get(eventName)
        if (subscribers) {
          subscribers.forEach(callback => {
            try {
              callback(data)
            } catch (err) {
              console.error('Error in WebSocket event callback:', err)
            }
          })
        }
      })

      setSocket(newSocket)
      
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err)
      setError(err as Error)
      setConnectionStatus('error')
    }
  }, [socket])

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
      setIsConnected(false)
      setConnectionStatus('disconnected')
      eventSubscriptions.current.clear()
    }
  }, [socket])

  // Emit event to server
  const emit = useCallback((event: string, data?: any) => {
    if (socket?.connected) {
      socket.emit(event, data)
    } else {
      console.warn('Cannot emit event: WebSocket not connected')
    }
  }, [socket])

  // Subscribe to events
  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    // Add callback to subscriptions
    if (!eventSubscriptions.current.has(event)) {
      eventSubscriptions.current.set(event, new Set())
    }
    eventSubscriptions.current.get(event)!.add(callback)

    // Return unsubscribe function
    return () => {
      const subscribers = eventSubscriptions.current.get(event)
      if (subscribers) {
        subscribers.delete(callback)
        if (subscribers.size === 0) {
          eventSubscriptions.current.delete(event)
        }
      }
    }
  }, [])

  // Unsubscribe from events
  const unsubscribe = useCallback((event: string) => {
    eventSubscriptions.current.delete(event)
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    connect()

    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // Heartbeat to keep connection alive
  useEffect(() => {
    if (!isConnected) return

    const heartbeatInterval = setInterval(() => {
      if (socket?.connected) {
        socket.emit(WS_EVENTS.HEARTBEAT, { timestamp: Date.now() })
      }
    }, 30000) // Every 30 seconds

    return () => clearInterval(heartbeatInterval)
  }, [isConnected, socket])

  // Subscribe to specific event types on connect
  useEffect(() => {
    if (!isConnected || !socket) return

    // Subscribe to common events
    const subscriptions = [
      WS_EVENTS.MARKET_DATA,
      WS_EVENTS.ASSET_UPDATE,
      WS_EVENTS.BID_UPDATE,
      WS_EVENTS.SYSTEM_ALERT,
    ]

    subscriptions.forEach(event => {
      subscribe(event, (data) => {
        console.log(`Received ${event}:`, data)
      })
    })

    return () => {
      subscriptions.forEach(event => unsubscribe(event))
    }
  }, [isConnected, socket, subscribe, unsubscribe])

  const value: WebSocketContextType = {
    socket,
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    emit,
    subscribe,
    unsubscribe,
    lastMessage,
    error,
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

// Hook to use WebSocket context
export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

// Specialized hooks for different data types
export function useMarketData() {
  const { subscribe, unsubscribe } = useWebSocket()
  const [marketData, setMarketData] = useState<Record<string, any>>({})

  useEffect(() => {
    const unsubscribeMarket = subscribe(WS_EVENTS.MARKET_DATA, (data) => {
      setMarketData(prev => ({
        ...prev,
        [data.symbol]: data
      }))
    })

    const unsubscribePrice = subscribe(WS_EVENTS.PRICE_UPDATE, (data) => {
      setMarketData(prev => ({
        ...prev,
        [data.symbol]: {
          ...prev[data.symbol],
          price: data.price,
          priceChange: data.change,
          timestamp: data.timestamp
        }
      }))
    })

    return () => {
      unsubscribeMarket()
      unsubscribePrice()
      unsubscribe(WS_EVENTS.MARKET_DATA)
      unsubscribe(WS_EVENTS.PRICE_UPDATE)
    }
  }, [subscribe, unsubscribe])

  return marketData
}

export function useAssetUpdates() {
  const { subscribe, unsubscribe } = useWebSocket()
  const [assets, setAssets] = useState<Record<string, any>>({})

  useEffect(() => {
    const unsubscribeAsset = subscribe(WS_EVENTS.ASSET_UPDATE, (data) => {
      setAssets(prev => ({
        ...prev,
        [data.assetId]: data
      }))
    })

    return () => {
      unsubscribeAsset()
      unsubscribe(WS_EVENTS.ASSET_UPDATE)
    }
  }, [subscribe, unsubscribe])

  return assets
}

export function useBidUpdates() {
  const { subscribe, unsubscribe } = useWebSocket()
  const [bids, setBids] = useState<Record<string, any>>({})

  useEffect(() => {
    const unsubscribeBid = subscribe(WS_EVENTS.BID_UPDATE, (data) => {
      setBids(prev => ({
        ...prev,
        [data.bidId]: data
      }))
    })

    return () => {
      unsubscribeBid()
      unsubscribe(WS_EVENTS.BID_UPDATE)
    }
  }, [subscribe, unsubscribe])

  return bids
}

export function useSystemAlerts() {
  const { subscribe, unsubscribe } = useWebSocket()
  const [alerts, setAlerts] = useState<SystemAlert[]>([])

  useEffect(() => {
    const unsubscribeAlert = subscribe(WS_EVENTS.SYSTEM_ALERT, (data) => {
      setAlerts(prev => [data, ...prev].slice(0, 100)) // Keep last 100 alerts
    })

    return () => {
      unsubscribeAlert()
      unsubscribe(WS_EVENTS.SYSTEM_ALERT)
    }
  }, [subscribe, unsubscribe])

  return alerts
}

// Connection status component
export function ConnectionStatus() {
  const { connectionStatus, isConnected } = useWebSocket()
  
  const statusConfig = {
    connected: { 
      color: 'text-green-600 dark:text-green-400', 
      bg: 'bg-green-100 dark:bg-green-900/20',
      text: 'Connected' 
    },
    connecting: { 
      color: 'text-yellow-600 dark:text-yellow-400', 
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      text: 'Connecting...' 
    },
    disconnected: { 
      color: 'text-gray-600 dark:text-gray-400', 
      bg: 'bg-gray-100 dark:bg-gray-900/20',
      text: 'Disconnected' 
    },
    error: { 
      color: 'text-red-600 dark:text-red-400', 
      bg: 'bg-red-100 dark:bg-red-900/20',
      text: 'Connection Error' 
    }
  }

  const config = statusConfig[connectionStatus]

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
      <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`} />
      {config.text}
    </div>
  )
}