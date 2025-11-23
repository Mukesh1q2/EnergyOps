import { Metadata } from 'next'
import { HeroSection } from '@/components/sections/HeroSection'
import { SolutionsSection } from '@/components/sections/SolutionsSection'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { EnterpriseCaseStudies } from '@/components/sections/EnterpriseCaseStudies'
import { EnterpriseFAQ } from '@/components/sections/EnterpriseFAQ'
import { EnergyFlowBackground } from '@/components/effects/EnergyFlowBackground'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/ui/CookieBanner'
import { FeatureGate, FeatureEnabled } from '@/lib/feature-flags/components'

export const metadata: Metadata = {
  title: 'Enterprise Energy Trading Platform | OptiBid Energy',
  description: 'Transform your energy trading with AI-powered optimization, real-time analytics, and visual knowledge graphs. Enterprise-grade platform for energy professionals.',
}

export default function HomePage() {
  return (
    <main id="main-content" className="relative min-h-screen">
      {/* Dynamic Energy Flow Background */}
      <EnergyFlowBackground />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Solutions Section */}
      <SolutionsSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* AI-Powered Insights - Only show if feature is enabled */}
      <FeatureGate feature="ai_powered_insights" fallback={null}>
        <div className="py-24 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                AI-Powered Market Insights
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Get real-time price forecasts with 94.2% accuracy using advanced machine learning models
              </p>
              <div className="mt-8 bg-white p-8 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">94.2%</div>
                    <div className="text-sm text-gray-600">Price Forecast Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">97.8%</div>
                    <div className="text-sm text-gray-600">Risk Assessment Precision</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">&lt;5ms</div>
                    <div className="text-sm text-gray-600">Market Data Latency</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FeatureGate>

      {/* Enterprise Case Studies */}
      <EnterpriseCaseStudies />
      
      {/* Enterprise FAQ */}
      <EnterpriseFAQ />
      
      {/* Additional sections will be added here */}
      
      {/* Footer */}
      <Footer />
      
      {/* Cookie Banner for GDPR compliance */}
      <CookieBanner />
    </main>
  )
}