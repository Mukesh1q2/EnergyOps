import { Metadata } from 'next'
import { EnterprisePageContent } from '@/components/sections/EnterprisePageContent'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/ui/CookieBanner'
import { EnterpriseSchema } from '@/components/sections/EnterpriseSchema'

export const metadata: Metadata = {
  title: 'Enterprise Energy Trading Solutions | OptiBid Energy',
  description: 'Scale your energy trading operations with our enterprise platform. Advanced analytics, AI optimization, and industry-leading security for Fortune 500 energy companies.',
  keywords: 'enterprise energy trading, energy trading software, enterprise energy analytics, energy market solutions, energy trading platform',
}

export default function EnterprisePage() {
  return (
    <main id="main-content" className="relative min-h-screen">
      <EnterpriseSchema />
      
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20" />
      </div>
      
      <Navigation />
      <EnterprisePageContent />
      <Footer />
      <CookieBanner />
    </main>
  )
}
