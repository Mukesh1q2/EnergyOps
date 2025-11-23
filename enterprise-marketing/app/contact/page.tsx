import { Metadata } from 'next'
import { ContactSection } from '@/components/sections/ContactSection'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/ui/CookieBanner'

export const metadata: Metadata = {
  title: 'Contact Us | OptiBid Energy - Get In Touch',
  description: 'Contact OptiBid Energy for enterprise demos, pricing, technical support, and partnership opportunities. Transform your energy trading today.',
  keywords: 'energy trading contact, enterprise demo request, OptiBid support, energy software sales',
}

export default function ContactPage() {
  return (
    <main id="main-content" className="relative min-h-screen">
      {/* Navigation */}
      <Navigation />
      
      {/* Contact Section */}
      <ContactSection />
      
      {/* Footer */}
      <Footer />
      
      {/* Cookie Banner */}
      <CookieBanner />
    </main>
  )
}