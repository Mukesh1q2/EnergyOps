import { Metadata } from 'next'
import { FAQSection } from '@/components/sections/FAQSection'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/ui/CookieBanner'

export const metadata: Metadata = {
  title: 'FAQ | OptiBid Energy - Frequently Asked Questions',
  description: 'Get answers to common questions about OptiBid Energy\'s platform, pricing, security, and implementation. Enterprise-grade energy trading solutions.',
  keywords: 'energy trading FAQ, OptiBid questions, enterprise energy software, energy analytics support',
}

export default function FAQPage() {
  return (
    <main id="main-content" className="relative min-h-screen">
      {/* Navigation */}
      <Navigation />
      
      {/* FAQ Section */}
      <FAQSection />
      
      {/* Footer */}
      <Footer />
      
      {/* Cookie Banner */}
      <CookieBanner />
    </main>
  )
}