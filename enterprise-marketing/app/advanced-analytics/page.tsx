import { Metadata } from 'next'
import { AdvancedAnalyticsPageContent } from '@/components/sections/AdvancedAnalyticsPageContent'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/ui/CookieBanner'
import { AdvancedAnalyticsSchema } from '@/components/sections/AdvancedAnalyticsSchema'

export const metadata: Metadata = {
  title: 'Advanced Enterprise Analytics | OptiBid Energy - Real-time Market Intelligence',
  description: 'Enterprise-grade analytics platform with real-time market data, advanced KPIs, custom reporting, and AI-powered insights for energy trading professionals.',
  keywords: 'energy analytics, market intelligence, real-time reporting, enterprise KPIs, energy trading analytics, market data visualization',
}

export default function AdvancedAnalyticsPage() {
  return (
    <>
      {/* Structured Data for SEO */}
      <AdvancedAnalyticsSchema />
      
      <main id="main-content" className="relative min-h-screen">
        {/* Dynamic Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-blue-900/20 to-purple-900/20" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        </div>
        
        {/* Navigation */}
        <Navigation />
        
        {/* Advanced Analytics Content */}
        <AdvancedAnalyticsPageContent />
        
        {/* Footer */}
        <Footer />
        
        {/* Cookie Banner */}
        <CookieBanner />
      </main>
    </>
  )
}