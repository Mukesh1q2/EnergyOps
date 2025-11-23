'use client'

import { createContext, useContext, ReactNode } from 'react'

interface WebSocketContextType {
  connected: boolean
  subscribe: (channel: string) => void
  unsubscribe: (channel: string) => void
}

const WebSocketContext = createContext<WebSocketContextType>({
  connected: false,
  subscribe: () => {},
  unsubscribe: () => {},
})

export function useWebSocket() {
  return useContext(WebSocketContext)
}

export function WebSocketProvider({ children }: { children: ReactNode }) {
  return (
    <WebSocketContext.Provider value={{ connected: false, subscribe: () => {}, unsubscribe: () => {} }}>
      {children}
    </WebSocketContext.Provider>
  )
}
