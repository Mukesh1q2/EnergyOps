// React Query Hooks for OptiBid Energy Platform
// Provides data fetching, caching, and real-time updates

import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  assetsAPI, 
  bidsAPI, 
  marketAPI, 
  analyticsAPI, 
  notificationsAPI,
  handleAPIError 
} from '@/lib/api'
import { useWebSocket } from '@/contexts/WebSocketContext'
import { useGlobalState } from '@/app/providers'

// Assets Hooks
export function useAssets() {
  return useQuery(
    'assets',
    assetsAPI.getAll,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    }
  )
}

export function useAsset(assetId: string) {
  return useQuery(
    ['asset', assetId],
    () => assetsAPI.getById(assetId),
    {
      enabled: !!assetId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  )
}

export function useCreateAsset() {
  const queryClient = useQueryClient()
  const { addNotification } = useGlobalState()
  
  return useMutation(assetsAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('assets')
      addNotification({
        type: 'success',
        title: 'Asset Created',
        message: 'New asset has been successfully created.',
        read: false
      })
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Error Creating Asset',
        message: handleAPIError(error),
        read: false
      })
    }
  })
}

export function useUpdateAsset() {
  const queryClient = useQueryClient()
  const { addNotification } = useGlobalState()
  
  return useMutation(
    ({ id, data }: { id: string; data: any }) => assetsAPI.update(id, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('assets')
        queryClient.invalidateQueries(['asset', variables.id])
        addNotification({
          type: 'success',
          title: 'Asset Updated',
          message: 'Asset has been successfully updated.',
          read: false
        })
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Error Updating Asset',
          message: handleAPIError(error),
          read: false
        })
      }
    }
  )
}

export function useAssetPerformance(assetId: string, timeframe: string = '24h') {
  return useQuery(
    ['asset-performance', assetId, timeframe],
    () => assetsAPI.getPerformance(assetId, timeframe),
    {
      enabled: !!assetId,
      refetchInterval: 30 * 1000, // 30 seconds
      staleTime: 15 * 1000, // 15 seconds
    }
  )
}

// Bids Hooks
export function useBids() {
  return useQuery(
    'bids',
    bidsAPI.getAll,
    {
      staleTime: 1 * 60 * 1000, // 1 minute
      retry: 2,
    }
  )
}

export function useBid(bidId: string) {
  return useQuery(
    ['bid', bidId],
    () => bidsAPI.getById(bidId),
    {
      enabled: !!bidId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  )
}

export function useCreateBid() {
  const queryClient = useQueryClient()
  const { addNotification } = useGlobalState()
  
  return useMutation(bidsAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('bids')
      queryClient.invalidateQueries('bidding-performance')
      addNotification({
        type: 'success',
        title: 'Bid Created',
        message: 'Your bid has been successfully submitted.',
        read: false
      })
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Error Creating Bid',
        message: handleAPIError(error),
        read: false
      })
    }
  })
}

export function useUpdateBid() {
  const queryClient = useQueryClient()
  const { addNotification } = useGlobalState()
  
  return useMutation(
    ({ id, data }: { id: string; data: any }) => bidsAPI.update(id, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('bids')
        queryClient.invalidateQueries(['bid', variables.id])
        queryClient.invalidateQueries('bidding-performance')
        addNotification({
          type: 'success',
          title: 'Bid Updated',
          message: 'Bid has been successfully updated.',
        read: false
      })
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Error Updating Bid',
          message: handleAPIError(error),
        read: false
      })
      }
    }
  )
}

export function useBiddingPerformance(timeframe: string = '30d') {
  return useQuery(
    ['bidding-performance', timeframe],
    () => bidsAPI.getPerformance(timeframe),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 60 * 1000, // 1 minute
    }
  )
}

// Market Data Hooks
export function useCurrentMarketData() {
  const { subscribe, unsubscribe } = useWebSocket()
  const queryClient = useQueryClient()
  
  return useQuery(
    'current-market-data',
    marketAPI.getCurrent,
    {
      staleTime: 10 * 1000, // 10 seconds
      refetchInterval: 30 * 1000, // 30 seconds
      onSuccess: (data) => {
        // Update cache with latest data
        queryClient.setQueryData('current-market-data', data)
      }
    }
  )
}

export function useHistoricalMarketData(symbol: string, timeframe: string = '24h') {
  return useQuery(
    ['historical-market-data', symbol, timeframe],
    () => marketAPI.getHistorical(symbol, timeframe),
    {
      enabled: !!symbol,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )
}

export function useMarketRegions() {
  return useQuery(
    'market-regions',
    marketAPI.getRegions,
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
    }
  )
}

export function useMarketForecasts(region: string) {
  return useQuery(
    ['market-forecasts', region],
    () => marketAPI.getForecasts(region),
    {
      enabled: !!region,
      staleTime: 15 * 60 * 1000, // 15 minutes
    }
  )
}

// Analytics Hooks
export function useKPIs(timeframe: string = '30d') {
  return useQuery(
    ['kpis', timeframe],
    () => analyticsAPI.getKPIs(timeframe),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 10 * 60 * 1000, // 10 minutes
    }
  )
}

export function useBenchmarks() {
  return useQuery(
    'benchmarks',
    analyticsAPI.getBenchmarks,
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
    }
  )
}

export function useInsights(category?: string) {
  return useQuery(
    ['insights', category],
    () => analyticsAPI.getInsights(category),
    {
      staleTime: 15 * 60 * 1000, // 15 minutes
    }
  )
}

export function usePerformanceTrends(timeframe: string = '90d') {
  return useQuery(
    ['performance-trends', timeframe],
    () => analyticsAPI.getPerformanceTrends(timeframe),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  )
}

// Notifications Hooks
export function useNotifications() {
  const { subscribe, unsubscribe } = useWebSocket()
  const queryClient = useQueryClient()
  const { addNotification } = useGlobalState()
  
  const query = useQuery(
    'notifications',
    notificationsAPI.getAll,
    {
      staleTime: 1 * 60 * 1000, // 1 minute
    }
  )
  
  // Subscribe to real-time notifications
  React.useEffect(() => {
    subscribe('notification')
    
    return () => {
      unsubscribe('notification')
    }
  }, [subscribe, unsubscribe])
  
  return query
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation(notificationsAPI.markAsRead, {
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData('notifications', (old: any) => {
        if (!old) return old
        return old.map((notif: any) => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      })
    }
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()
  
  return useMutation(notificationsAPI.delete, {
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData('notifications', (old: any) => {
        if (!old) return old
        return old.filter((notif: any) => notif.id !== notificationId)
      })
    }
  })
}

// Real-time Data Hooks with WebSocket Integration
export function useRealTimeMarketData() {
  const { subscribe, unsubscribe } = useWebSocket()
  const [marketData, setMarketData] = React.useState<any>({})
  
  React.useEffect(() => {
    subscribe('market_data')
    
    return () => {
      unsubscribe('market_data')
    }
  }, [subscribe, unsubscribe])
  
  return marketData
}

export function useRealTimeAssetUpdates() {
  const { subscribe, unsubscribe } = useWebSocket()
  const queryClient = useQueryClient()
  const [assetUpdates, setAssetUpdates] = React.useState<any>({})
  
  React.useEffect(() => {
    subscribe('asset_update')
    
    return () => {
      unsubscribe('asset_update')
    }
  }, [subscribe, unsubscribe])
  
  return assetUpdates
}

export function useRealTimeBidUpdates() {
  const { subscribe, unsubscribe } = useWebSocket()
  const queryClient = useQueryClient()
  const [bidUpdates, setBidUpdates] = React.useState<any>({})
  
  React.useEffect(() => {
    subscribe('bid_update')
    
    return () => {
      unsubscribe('bid_update')
    }
  }, [subscribe, unsubscribe])
  
  return bidUpdates
}

// Combined Dashboard Data Hook
export function useDashboardData() {
  const assetsQuery = useAssets()
  const bidsQuery = useBids()
  const marketDataQuery = useCurrentMarketData()
  const kpisQuery = useKPIs()
  const notificationsQuery = useNotifications()
  
  const isLoading = assetsQuery.isLoading || bidsQuery.isLoading || 
                   marketDataQuery.isLoading || kpisQuery.isLoading || 
                   notificationsQuery.isLoading
  
  const hasError = assetsQuery.error || bidsQuery.error || 
                  marketDataQuery.error || kpisQuery.error || 
                  notificationsQuery.error
  
  const data = {
    assets: assetsQuery.data,
    bids: bidsQuery.data,
    marketData: marketDataQuery.data,
    kpis: kpisQuery.data,
    notifications: notificationsQuery.data,
    realTimeMarketData: useRealTimeMarketData(),
    realTimeAssetUpdates: useRealTimeAssetUpdates(),
    realTimeBidUpdates: useRealTimeBidUpdates()
  }
  
  return {
    data,
    isLoading,
    hasError,
    error: assetsQuery.error || bidsQuery.error || 
          marketDataQuery.error || kpisQuery.error || 
          notificationsQuery.error,
    refetch: () => {
      assetsQuery.refetch()
      bidsQuery.refetch()
      marketDataQuery.refetch()
      kpisQuery.refetch()
      notificationsQuery.refetch()
    }
  }
}

// Import React for useState and useEffect
import React from 'react'








