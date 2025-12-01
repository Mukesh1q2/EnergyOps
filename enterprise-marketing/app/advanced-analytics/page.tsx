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
    <div>
      <AdvancedAnalyticsSchema />
      
      <main id="main-content" className="relative min-h-screen">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-blue-900/20 to-purple-900/20" />
        </div>
        
        <Navigation />
        
        <AdvancedAnalyticsPageContent />
        
        <Footer />
        
        <CookieBanner />
      </main>
    </div>
  )
}
