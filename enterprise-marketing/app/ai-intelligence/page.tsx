// =============================================================================
// AI-POWERED INTELLIGENCE & AUTOMATION - MAIN PAGE
// =============================================================================
import { Metadata } from 'next'
import { AIIntelligenceContent } from '@/components/sections/AIIntelligenceContent'
import { AutomationWorkflowContent } from '@/components/sections/AutomationWorkflowContent'
import { MLPipelineContent } from '@/components/sections/MLPipelineContent'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { AIWorkflowBackground } from '@/components/effects/AIWorkflowBackground'

export const metadata: Metadata = {
  title: 'AI-Powered Intelligence & Automation | OptiBid Energy',
  description: 'Advanced machine learning pipeline, automated trading strategies, predictive maintenance, and enterprise workflow automation with 94%+ accuracy.',
}

export default function AIPage() {
  return (
    <main id="main-content" className="relative min-h-screen">
      {/* AI Workflow Background */}
      <AIWorkflowBackground />
      
      {/* Navigation */}
      <Navigation />
      
      {/* AI Intelligence Content */}
      <AIIntelligenceContent />
      
      {/* ML Pipeline Content */}
      <MLPipelineContent />
      
      {/* Automation Workflow Content */}
      <AutomationWorkflowContent />
      
      {/* Footer */}
      <Footer />
    </main>
  )
}