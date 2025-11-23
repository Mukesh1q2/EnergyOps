/**
 * WebSocket Service for Real-time Communication
 * Handles WebSocket connections for live market data and price updates
 */

import React, { useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

interface WebSocketMessage {
  type: string;
  market_zone?: string;
  data?: any;
  timestamp: string;
}

interface PriceUpdateData {
  market_zone: string;
  price: number;
  volume: number;
  timestamp: string;
}

interface MarketAlertData {
  market_zone: string;
  alert_type: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

interface ConnectionStats {
  total_connections: number;
  connections_by_zone: Record<string, number>;
  active_zones: string[];
  timestamp: string;
}

export class WebSocketService {
  private socket: WebSocket | null = null;
  private connectionId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private marketZone: string | null = null;
  private token: string | null = null;
  private isManualDisconnect = false;

  constructor(private baseUrl: string = 'http://localhost:8000') {}

  /**
   * Connect to WebSocket for specific market zone
   */
  connect(marketZone: string, token?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.marketZone = marketZone;
        this.token = token || null;
        this.isManualDisconnect = false;

        // Build WebSocket URL
        const wsUrl = `${this.baseUrl.replace('http', 'ws')}/api/ws/ws/market/${marketZone}${token ? `?token=${token}` : ''}`;
        
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          toast.success(`Connected to ${marketZone} market data`);
          
          // Start heartbeat
          this.startHeartbeat();
          
          // Clear any pending reconnect timeout
          if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
          }
        };

        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
            
            // Resolve promise on connection_established
            if (message.type === 'connection_established') {
              this.connectionId = message.connection_id;
              console.log('Connection established:', message);
              resolve(message.connection_id);
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.socket.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          this.stopHeartbeat();
          
          // Attempt reconnection if not manually disconnected
          if (!this.isManualDisconnect) {
            this.handleReconnect();
          }
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'connection_established':
        // Handled in onmessage
        break;
      case 'price_update':
        this.handlePriceUpdate(message.data);
        break;
      case 'market_alert':
        this.handleMarketAlert(message.data);
        break;
      case 'price_change':
        this.handlePriceChange(message.data);
        break;
      case 'bid_update':
        this.handleBidUpdate(message.data);
        break;
      case 'market_status':
        this.handleMarketStatus(message.data);
        break;
      case 'pong':
      case 'heartbeat_ack':
        console.log('Heartbeat acknowledged');
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  /**
   * Start heartbeat mechanism
   */
  private startHeartbeat() {
    this.stopHeartbeat();
    
    // Send heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.sendMessage({ type: 'heartbeat' });
      }
    }, 30000);
  }

  /**
   * Stop heartbeat mechanism
   */
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Send a message through WebSocket
   */
  private sendMessage(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  /**
   * Connect to multiple market zones
   */
  connectMultiZone(zones: string[], token?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.marketZone = zones.join(',');
        this.token = token || null;
        this.isManualDisconnect = false;

        // Build WebSocket URL
        const wsUrl = `${this.baseUrl.replace('http', 'ws')}/api/ws/ws/prices?zones=${zones.join(',')}${token ? `&token=${token}` : ''}`;
        
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log('Multi-zone WebSocket connected');
          this.reconnectAttempts = 0;
          toast.success(`Connected to ${zones.join(', ')} market data`);
          
          // Start heartbeat
          this.startHeartbeat();
          
          // Clear any pending reconnect timeout
          if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
          }
        };

        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
            
            // Resolve promise on multi_zone_connection_established
            if (message.type === 'multi_zone_connection_established') {
              this.connectionId = message.connection_id;
              console.log('Multi-zone connection established:', message);
              resolve(message.connection_id);
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.socket.onerror = (error) => {
          console.error('Multi-zone WebSocket error:', error);
          reject(error);
        };

        this.socket.onclose = (event) => {
          console.log('Multi-zone WebSocket closed:', event.code, event.reason);
          this.stopHeartbeat();
          
          // Attempt reconnection if not manually disconnected
          if (!this.isManualDisconnect) {
            this.handleReconnect();
          }
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send ping to server
   */
  ping() {
    this.sendMessage({ type: 'ping' });
  }

  /**
   * Subscribe to specific alert types
   */
  subscribeToAlerts(alertTypes: string[]) {
    this.sendMessage({ type: 'subscribe_alerts', alert_types: alertTypes });
  }

  /**
   * Request price history
   */
  requestPriceHistory(hours: number = 24) {
    this.sendMessage({ type: 'request_price_history', hours });
  }

  /**
   * Manually reconnect
   */
  manualReconnect() {
    if (this.marketZone) {
      toast('Reconnecting to market data...');
      this.reconnectAttempts = 0;
      this.connect(this.marketZone, this.token || undefined);
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    this.isManualDisconnect = true;
    this.stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.connectionId = null;
    }
  }

  /**
   * Get connection statistics
   */
  async getConnectionStats(): Promise<ConnectionStats | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ws/ws/stats`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get connection stats:', error);
    }
    return null;
  }

  /**
   * Handle price updates
   */
  private handlePriceUpdate(data: PriceUpdateData) {
    console.log('Price update received:', data);
    
    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('price-update', {
      detail: data
    }));

    // Show toast notification for significant price changes
    if (Math.abs(data.price - 50) > 10) { // Example threshold
      toast.success(`${data.market_zone}: $${data.price.toFixed(2)}/MW`, {
        duration: 3000,
      });
    }
  }

  /**
   * Handle market alerts
   */
  private handleMarketAlert(data: MarketAlertData) {
    console.log('Market alert received:', data);
    
    window.dispatchEvent(new CustomEvent('market-alert', {
      detail: data
    }));

    const alertMessages = {
      info: 'Market information',
      warning: 'Market warning',
      critical: 'Critical market alert'
    };

    toast(`${data.market_zone}: ${alertMessages[data.severity]} - ${data.message}`, {
      icon: data.severity === 'critical' ? '🚨' : data.severity === 'warning' ? '⚠️' : 'ℹ️',
      duration: 5000,
    });
  }

  /**
   * Handle price changes
   */
  private handlePriceChange(data: any) {
    console.log('Price change received:', data);
    
    window.dispatchEvent(new CustomEvent('price-change', {
      detail: data
    }));
  }

  /**
   * Handle bid updates
   */
  private handleBidUpdate(data: any) {
    console.log('Bid update received:', data);
    
    window.dispatchEvent(new CustomEvent('bid-update', {
      detail: data
    }));

    toast.success(`Bid ${data.bid_id} updated: ${data.status}`);
  }

  /**
   * Handle market status changes
   */
  private handleMarketStatus(data: any) {
    console.log('Market status received:', data);
    
    window.dispatchEvent(new CustomEvent('market-status', {
      detail: data
    }));

    const message = data.status === 'open' ? 'Market opened' : 'Market closed';
    toast.success(`${data.market_zone}: ${message}`, {
      duration: 4000,
    });
  }

  /**
   * Handle reconnection logic with exponential backoff and jitter
   */
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const baseDelay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      // Add jitter (random value between 0 and 1000ms)
      const jitter = Math.random() * 1000;
      const delay = baseDelay + jitter;
      
      console.log(`Reconnecting in ${(delay / 1000).toFixed(1)}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      // Show user-friendly message
      toast(`Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`, {
        duration: delay,
      });
      
      this.reconnectTimeout = setTimeout(() => {
        if (this.marketZone && !this.isManualDisconnect) {
          this.connect(this.marketZone, this.token || undefined).catch((error) => {
            console.error('Reconnection failed:', error);
          });
        }
      }, delay);
    } else {
      toast.error(
        'Failed to reconnect to market data.',
        {
          duration: 5000
        }
      );
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN || false;
  }

  /**
   * Get connection ID
   */
  getConnectionId(): string | null {
    return this.connectionId;
  }
}

// Create global instance
export const wsService = new WebSocketService();

// React hook for WebSocket connection
export function useWebSocket(marketZone: string, options?: {
  token?: string;
  autoConnect?: boolean;
  onPriceUpdate?: (data: PriceUpdateData) => void;
  onMarketAlert?: (data: MarketAlertData) => void;
  onPriceChange?: (data: any) => void;
  onBidUpdate?: (data: any) => void;
  onMarketStatus?: (data: any) => void;
}) {
  const {
    token,
    autoConnect = true,
    onPriceUpdate,
    onMarketAlert,
    onPriceChange,
    onBidUpdate,
    onMarketStatus
  } = options || {};

  const [isConnected, setIsConnected] = React.useState(false);
  const [connectionId, setConnectionId] = React.useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    wsService.connect(marketZone, token).then((id) => {
      setConnectionId(id);
      setIsConnected(true);
    }).catch((error) => {
      console.error('Failed to connect:', error);
      setIsConnected(false);
    });
  }, [marketZone, token]);

  const disconnect = useCallback(() => {
    wsService.disconnect();
    setIsConnected(false);
    setConnectionId(null);
  }, []);

  const ping = useCallback(() => {
    wsService.ping();
  }, []);

  const requestPriceHistory = useCallback((hours: number = 24) => {
    wsService.requestPriceHistory(hours);
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Set up event listeners
    const handlePriceUpdate = (event: CustomEvent) => {
      onPriceUpdate?.(event.detail);
    };

    const handleMarketAlert = (event: CustomEvent) => {
      onMarketAlert?.(event.detail);
    };

    const handlePriceChange = (event: CustomEvent) => {
      onPriceChange?.(event.detail);
    };

    const handleBidUpdate = (event: CustomEvent) => {
      onBidUpdate?.(event.detail);
    };

    const handleMarketStatus = (event: CustomEvent) => {
      onMarketStatus?.(event.detail);
    };

    // Add event listeners
    window.addEventListener('price-update', handlePriceUpdate as EventListener);
    window.addEventListener('market-alert', handleMarketAlert as EventListener);
    window.addEventListener('price-change', handlePriceChange as EventListener);
    window.addEventListener('bid-update', handleBidUpdate as EventListener);
    window.addEventListener('market-status', handleMarketStatus as EventListener);

    // Auto-reconnect logic
    const checkConnection = () => {
      if (!wsService.isConnected() && autoConnect) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000); // Reconnect after 5 seconds
      }
    };

    const connectionCheckInterval = setInterval(checkConnection, 10000); // Check every 10 seconds

    return () => {
      // Cleanup
      window.removeEventListener('price-update', handlePriceUpdate as EventListener);
      window.removeEventListener('market-alert', handleMarketAlert as EventListener);
      window.removeEventListener('price-change', handlePriceChange as EventListener);
      window.removeEventListener('bid-update', handleBidUpdate as EventListener);
      window.removeEventListener('market-status', handleMarketStatus as EventListener);
      
      clearInterval(connectionCheckInterval);
      clearTimeout(reconnectTimeoutRef.current);
      
      if (autoConnect) {
        disconnect();
      }
    };
  }, [connect, disconnect, autoConnect, onPriceUpdate, onMarketAlert, onPriceChange, onBidUpdate, onMarketStatus]);

  const manualReconnect = useCallback(() => {
    wsService.manualReconnect();
  }, []);

  return {
    isConnected,
    connectionId,
    connect,
    disconnect,
    ping,
    requestPriceHistory,
    manualReconnect,
    wsService
  };
}