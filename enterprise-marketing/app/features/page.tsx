import { Metadata } from 'next';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import FeaturesPageContent from '@/components/sections/FeaturesPageContent';

export const metadata: Metadata = {
  title: 'Features | OptiBid Energy - Advanced Energy Trading Platform',
  description: 'Explore OptiBid Energy features including AI-powered forecasting, real-time analytics, quantum computing, blockchain integration, and enterprise-grade security.',
  keywords: 'energy trading features, AI forecasting, real-time analytics, quantum computing, blockchain energy',
};

export default function FeaturesPage() {
  return (
    <main className="relative min-h-screen">
      <Navigation />
      <FeaturesPageContent />
      <Footer />
    </main>
  );
}
