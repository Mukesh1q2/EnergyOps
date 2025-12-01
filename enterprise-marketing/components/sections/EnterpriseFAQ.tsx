'use client';

import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function EnterpriseFAQ() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <SectionWrapper>
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="border-blue-200 bg-blue-50/50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300 mb-4">
            <QuestionMarkCircleIcon className="w-4 h-4 mr-2" />
            Enterprise FAQ
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Common Enterprise Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to know about deploying and scaling OptiBid Enterprise 
            for your energy trading operations.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {enterpriseFaqs.map((faq, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleItem(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <faq.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                      <CardDescription className="text-sm">
                        {faq.category}
                      </CardDescription>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: openItems.includes(index) ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-gray-400"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </div>
              </CardHeader>
              
              <AnimatePresence>
                {openItems.includes(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="pt-0">
                      <div className="pl-14 pr-2">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {faq.answer}
                        </p>
                        
                        {faq.details && (
                          <ul className="space-y-2 mb-4">
                            {faq.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {faq.cta && (
                          <Button variant="outline" size="sm" className="mt-4">
                            {faq.cta}
                            <ArrowRightIcon className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>

        {/* Enterprise Contact CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Have More Questions?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Our enterprise sales team is ready to discuss your specific requirements 
              and provide a customized solution for your organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Schedule Enterprise Demo
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Talk to Sales Team
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}

// FAQ data
const enterpriseFaqs = [
  {
    icon: ClockIcon,
    category: "Implementation & Deployment",
    question: "How long does enterprise deployment take?",
    answer: "Typically 2-4 weeks for full enterprise deployment, including data migration, custom integrations, and team training. We provide dedicated project management and a dedicated implementation specialist.",
    details: [
      "Week 1: Infrastructure setup and data migration",
      "Week 2: Custom integrations and configuration",
      "Week 3: Team training and testing",
      "Week 4: Go-live support and optimization"
    ],
    cta: "View Implementation Timeline"
  },
  {
    icon: ShieldCheckIcon,
    category: "Security & Compliance",
    question: "What security certifications do you have?",
    answer: "We maintain SOC 2 Type II certification, ISO 27001 compliance, and are GDPR/CCPA compliant. Our platform undergoes regular security audits and penetration testing.",
    details: [
      "SOC 2 Type II certified infrastructure",
      "ISO 27001 information security management",
      "GDPR and CCPA data protection compliance",
      "Annual third-party security audits",
      "24/7 security monitoring and incident response"
    ],
    cta: "Download Security Documentation"
  },
  {
    icon: CpuChipIcon,
    category: "Technology & Integration",
    question: "How does the AI optimization work?",
    answer: "Our AI engine uses machine learning models trained on historical market data, real-time conditions, and your specific trading patterns to optimize bidding strategies and portfolio allocation.",
    details: [
      "Real-time market data processing",
      "Predictive analytics for price forecasting",
      "Automated strategy optimization",
      "Portfolio risk assessment",
      "Continuous learning from performance data"
    ],
    cta: "See AI Optimization in Action"
  },
  {
    icon: UserGroupIcon,
    category: "Support & Training",
    question: "What level of support do enterprise clients receive?",
    answer: "Enterprise clients receive 24/7 dedicated support, a dedicated account manager, priority feature requests, and custom training programs tailored to your team's needs.",
    details: [
      "24/7 technical support with <4 hour response time",
      "Dedicated enterprise account manager",
      "Quarterly business reviews and optimization sessions",
      "Custom training programs and certification",
      "Priority access to new features and beta programs"
    ],
    cta: "Learn About Enterprise Support"
  },
  {
    icon: CpuChipIcon,
    category: "Scalability & Performance",
    question: "Can the platform scale to handle our trading volume?",
    answer: "Yes, our enterprise platform is designed to handle massive scale with multi-region deployment, auto-scaling infrastructure, and 99.8% uptime guarantee.",
    details: [
      "Auto-scaling infrastructure for peak trading periods",
      "Multi-region deployment for global operations",
      "High-frequency data processing capabilities",
      "Load balancing and failover protection",
      "SLA guarantees up to 99.9% uptime"
    ],
    cta: "View Performance Benchmarks"
  },
  {
    icon: ShieldCheckIcon,
    category: "Data & Privacy",
    question: "Where is our data stored and who has access?",
    answer: "Your data is stored in secure, enterprise-grade infrastructure with regional data residency options. We implement strict access controls and never share your data with third parties.",
    details: [
      "Regional data residency (US, EU, Asia-Pacific options)",
      "End-to-end encryption for data at rest and in transit",
      "Role-based access controls and audit logging",
      "No third-party data sharing or monetization",
      "Full data portability and deletion rights"
    ],
    cta: "Review Data Privacy Policy"
  }
]