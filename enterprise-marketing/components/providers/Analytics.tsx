'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Track page views
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'G-XXXXXXXXXX', {
        page_path: url,
      })
    }

    // Hotjar tracking
    if (typeof window !== 'undefined' && (window as any).hj) {
      (window as any).hj('trigger', 'pageview')
    }

    // Custom analytics events
    trackEvent('page_view', {
      page: pathname,
      search: searchParams?.toString() || '',
      timestamp: new Date().toISOString(),
    })

  }, [pathname, searchParams])

  return null
}

// Event tracking utility
export function trackEvent(eventName: string, parameters: Record<string, any> = {}) {
  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters)
  }

  // Hotjar
  if (typeof window !== 'undefined' && (window as any).hj) {
    (window as any).hj('event', eventName)
  }

  // Custom analytics endpoint
  if (typeof window !== 'undefined') {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventName,
        parameters,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    }).catch(() => {
      // Silently fail analytics tracking
    })
  }
}

// Conversion tracking
export function trackConversion(conversionType: string, value?: number) {
  trackEvent('conversion', {
    type: conversionType,
    value,
    timestamp: new Date().toISOString(),
  })

  // Google Ads conversion
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      send_to: 'AW-XXXXXXXXX/XXXXXXXXX', // Replace with actual conversion ID
      value: value || 1,
    })
  }
}

// User interaction tracking
export function trackInteraction(element: string, action: string) {
  trackEvent('user_interaction', {
    element,
    action,
    timestamp: new Date().toISOString(),
  })
}

// Performance tracking
export function trackPerformance(metric: string, value: number) {
  trackEvent('performance', {
    metric,
    value,
    timestamp: new Date().toISOString(),
  })
}