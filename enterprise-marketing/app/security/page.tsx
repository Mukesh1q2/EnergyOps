import { Metadata } from 'next';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import SecurityPageContent from '@/components/sections/SecurityPageContent';

export const metadata: Metadata = {
  title: 'Security | OptiBid Energy - Enterprise-Grade Protection',
  description: 'OptiBid Energy employs military-grade security with ISO 27001, SOC 2 Type II compliance, end-to-end encryption, and 99.99% uptime SLA.',
  keywords: 'energy trading security, ISO 27001, SOC 2, enterprise security, data protection',
};

export default function SecurityPage() {
  return (
    <main className="relative min-h-screen">
      <Navigation />
      <SecurityPageContent />
      <Footer />
    </main>
  );
}
