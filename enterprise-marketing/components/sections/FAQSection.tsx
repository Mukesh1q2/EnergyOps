'use client'

import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: 'general' | 'pricing' | 'security' | 'technical' | 'integration'
}

const faqData: FAQItem[] = [
  {
    id: 'development-free',
    question: 'Is OptiBid Energy free during development?',
    answer: 'Yes — full-feature access for registered users while we develop. Usage limits may apply. This allows you to fully evaluate all capabilities without cost during our development phase.',
    category: 'general'
  },
  {
    id: 'deployment-options',
    question: 'Can we deploy OptiBid on-premise?',
    answer: 'Enterprise tier supports hybrid and on-prem deployment options. We provide LLM & data residency options to meet regulatory requirements and ensure data sovereignty.',
    category: 'integration'
  },
  {
    id: 'authentication-methods',
    question: 'What authentication methods are supported?',
    answer: 'We support email/password authentication, Multi-Factor Authentication (MFA), Single Sign-On (SSO) via SAML 2.0 & OIDC/OAuth2, and SCIM provisioning for enterprise customers.',
    category: 'security'
  },
  {
    id: 'dashboard-sharing',
    question: 'How do I share a dashboard with customers?',
    answer: 'Use the "Share" feature to create tokenized read-only links with optional expiry dates and password protection. You can also set permissions and customize access levels.',
    category: 'technical'
  },
  {
    id: 'export-formats',
    question: 'What export formats are available?',
    answer: 'You can export data in CSV, Excel, XML, PPTX, PDF, and JSON packages. Enterprise users also get custom export formats and automated scheduling options.',
    category: 'technical'
  },
  {
    id: 'data-security',
    question: 'How do you ensure data security?',
    answer: 'We implement TLS everywhere, RBAC access controls, comprehensive audit logging, KMS encryption, automated vulnerability scanning, and are pursuing SOC2/ISO programs.',
    category: 'security'
  },
  {
    id: 'local-llm',
    question: 'Can I use an LLM locally?',
    answer: 'Yes — Enterprise tier supports local LLM hosting for regulatory requirements. We offer both cloud-based and on-premise LLM deployment options.',
    category: 'integration'
  },
  {
    id: 'pricing-model',
    question: 'How does the pricing model work?',
    answer: 'We offer tiered pricing from free development access to enterprise custom solutions. Pricing is based on features, user count, API usage, and support level.',
    category: 'pricing'
  },
  {
    id: 'api-access',
    question: 'Do you provide API access?',
    answer: 'Yes, we offer RESTful APIs for all major features including data ingestion, forecasting, optimization, and dashboard management. API access varies by plan.',
    category: 'technical'
  },
  {
    id: 'data-residency',
    question: 'Do you support data residency requirements?',
    answer: 'Yes, we offer India-specific data storage options and can configure data residency to meet local regulatory requirements for enterprise customers.',
    category: 'security'
  },
  {
    id: 'sla-guarantee',
    question: 'What SLA guarantees do you provide?',
    answer: 'We provide different SLA guarantees based on your plan: 99% uptime for Starter, 99.5% for Professional, and 99.9% for Enterprise customers with financial credits for violations.',
    category: 'pricing'
  },
  {
    id: 'integration-timeframe',
    question: 'How long does implementation take?',
    answer: 'Implementation varies by complexity: Basic setup takes 1-2 weeks, professional integration 4-6 weeks, and enterprise deployments 8-12 weeks including training and customization.',
    category: 'integration'
  },
  {
    id: 'training-support',
    question: 'What training and support do you provide?',
    answer: 'We offer comprehensive onboarding, user training sessions, documentation, video tutorials, email support, and dedicated success managers for enterprise customers.',
    category: 'general'
  },
  {
    id: 'scalability',
    question: 'How scalable is the platform?',
    answer: 'Our cloud-native architecture scales automatically based on demand. We support unlimited users and data volumes with horizontal scaling and load balancing.',
    category: 'technical'
  },
  {
    id: 'compliance-standards',
    question: 'What compliance standards do you meet?',
    answer: 'We are pursuing SOC2 Type II and ISO27001 certification. We also support GDPR compliance, audit trails, and industry-specific regulatory requirements.',
    category: 'security'
  }
]

const categories = {
  general: { name: 'General', color: 'blue' },
  pricing: { name: 'Pricing & Plans', color: 'green' },
  security: { name: 'Security & Compliance', color: 'red' },
  technical: { name: 'Technical Features', color: 'purple' },
  integration: { name: 'Integration & Deployment', color: 'yellow' }
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  red: 'from-red-500 to-red-600',
  purple: 'from-purple-500 to-purple-600',
  yellow: 'from-yellow-500 to-yellow-600'
}

export function FAQSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const filteredFAQ = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory)

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about OptiBid Energy's platform, features, and implementation.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Questions
          </button>
          {Object.entries(categories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === key
                  ? `bg-gradient-to-r ${colorClasses[category.color as keyof typeof colorClasses]} text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQ.map((item) => {
            const isExpanded = expandedItems.has(item.id)
            const category = categories[item.category]
            
            return (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${colorClasses[category.color as keyof typeof colorClasses]} text-white mr-3`}>
                      {category.name}
                    </span>
                    <h3 className="text-lg font-medium text-gray-900">{item.question}</h3>
                  </div>
                  <div className="ml-4">
                    {isExpanded ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-6 pb-4">
                    <div className="text-gray-700 leading-relaxed pl-16">
                      {item.answer}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-lg mb-6 opacity-90">
              Our team is here to help. Get in touch for personalized assistance with your energy trading needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Contact Support
              </button>
              <button className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
            <p className="text-gray-600 text-sm mb-4">Comprehensive guides and API documentation</p>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View Docs →
            </button>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Video Tutorials</h3>
            <p className="text-gray-600 text-sm mb-4">Step-by-step video guides for common tasks</p>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Watch Videos →
            </button>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
            <p className="text-gray-600 text-sm mb-4">Join our community of energy professionals</p>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Join Community →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}