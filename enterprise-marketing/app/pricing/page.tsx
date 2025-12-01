import { Metadata } from 'next';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PricingSection } from '@/components/sections/PricingSection';
import { CookieBanner } from '@/components/ui/CookieBanner';

export const metadata: Metadata = {
  title: 'Pricing | OptiBid Energy - Flexible Plans for Every Organization',
  description: 'Choose the right OptiBid Energy plan for your organization. From free development tier to enterprise solutions with advanced AI, SSO, and compliance features.',
  keywords: 'energy trading pricing, OptiBid plans, enterprise pricing, energy platform costs, AI forecasting pricing',
};

export default function PricingPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      <PricingSection />
      <Footer />
      <CookieBanner />
    </main>
  );
}
