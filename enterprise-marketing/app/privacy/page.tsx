import { Metadata } from 'next'
import { PrivacyPolicyContent } from '@/components/sections/PrivacyPolicyContent'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/ui/CookieBanner'

export const metadata: Metadata = {
  title: 'Privacy Policy | OptiBid Energy',
  description: 'OptiBid Energy Privacy Policy - Learn how we collect, use, and protect your personal data in compliance with GDPR and Indian regulations.',
}

export default function PrivacyPage() {
  return (
    <main id="main-content" className="relative min-h-screen">
      <Navigation />
      <PrivacyPolicyContent />
      <Footer />
      <CookieBanner />
    </main>
  )
}