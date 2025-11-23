import { Metadata } from 'next'
import { SolutionsPageContent } from '@/components/sections/SolutionsPageContent'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/ui/CookieBanner'

export const metadata: Metadata = {
  title: 'Solutions | OptiBid Energy - Industry-Specific Energy Trading Solutions',
  description: 'Specialized energy trading solutions for analysts, traders, producers, grid operators, and storage managers. Optimize your energy operations with AI-powered insights.',
  keywords: 'energy trading solutions, energy analyst tools, grid operations software, energy storage optimization',
}

export default function SolutionsPage() {
  return (
    <main id="main-content" className="relative min-h-screen">
      {/* Navigation */}
      <Navigation />
      
      {/* Solutions Page Content */}
      <SolutionsPageContent />
      
      {/* Footer */}
      <Footer />
      
      {/* Cookie Banner */}
      <CookieBanner />
    </main>
  )
}