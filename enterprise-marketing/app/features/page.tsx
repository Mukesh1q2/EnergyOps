import { Metadata } from 'next'
import { FeaturesPageContent } from '@/components/sections/FeaturesPageContent'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/ui/CookieBanner'

export const metadata: Metadata = {
  title: 'Features | OptiBid Energy - Advanced Energy Trading Platform Features',
  description: 'Discover powerful features including Visual Knowledge Graphs, AI-powered insights, real-time collaboration, and advanced analytics for energy trading professionals.',
  keywords: 'energy trading features, AI energy analytics, visual knowledge graphs, real-time collaboration, energy data visualization',
}

export default function FeaturesPage() {
  return (
    <main id="main-content" className="relative min-h-screen">
      {/* Navigation */}
      <Navigation />
      
      {/* Features Page Content */}
      <FeaturesPageContent />
      
      {/* Footer */}
      <Footer />
      
      {/* Cookie Banner */}
      <CookieBanner />
    </main>
  )
}