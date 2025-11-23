import { Metadata } from 'next'
import { ResourcesPageContent } from '@/components/sections/ResourcesPageContent'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/ui/CookieBanner'

export const metadata: Metadata = {
  title: 'Resources | OptiBid Energy - Documentation, API, Blog & Support',
  description: 'Access comprehensive documentation, API references, case studies, whitepapers, and support resources for OptiBid Energy platform.',
  keywords: 'energy trading documentation, API reference, case studies, whitepapers, support resources',
}

export default function ResourcesPage() {
  return (
    <main id="main-content" className="relative min-h-screen">
      {/* Navigation */}
      <Navigation />
      
      {/* Resources Page Content */}
      <ResourcesPageContent />
      
      {/* Footer */}
      <Footer />
      
      {/* Cookie Banner */}
      <CookieBanner />
    </main>
  )
}