'use client'

import { useEffect } from 'react'
import ServiceWorkerRegistration from '@/components/common/ServiceWorkerRegistration'
import { monitorStylesheets } from '@/lib/styleMonitor'

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Monitor stylesheet loading
    monitorStylesheets({
      onStyleLoadError: (href) => {
        console.error('[App] Style loading error:', href)
      },
      onStyleLoadSuccess: (href) => {
        console.log('[App] Style loaded successfully:', href)
      },
      retryAttempts: 3,
      retryDelay: 1000,
    })
  }, [])

  return (
    <div className="min-h-screen">
      <ServiceWorkerRegistration />
      {children}
    </div>
  )
}
