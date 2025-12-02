'use client'

import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { motion } from 'framer-motion'
import { 
  ServerIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  UserGroupIcon,
  EyeIcon,
  LockClosedIcon,
  ClockIcon,
  ScaleIcon
} from '@heroicons/react/24/outline'

export default function DataProcessingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SectionWrapper>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-6"
            >
              <ServerIcon className="h-4 w-4 mr-2" />
              Data Protection Compliance
            </motion.div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Data <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Processing</span> Information
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              This page explains how OptiBid Energy collects, processes, and protects your personal data in compliance 
              with privacy regulations including GDPR, CCPA, and other applicable data protection laws.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              <strong>Last updated:</strong> December 2, 2025
            </p>
          </div>

          {/* Compliance Overview */}
          <section className="mb-16">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-green-900 mb-3 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Our Privacy Commitments
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-green-800">
                <div>
                  <h3 className="font-semibold mb-2">Regulatory Compliance:</h3>
                  <ul className="space-y-1">
                    <li>• GDPR (European Union)</li>
                    <li>• CCPA/CPRA (California)</li>
                    <li>• PIPEDA (Canada)</li>
                    <li>• LGPD (Brazil)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Data Protection Principles:</h3>
                  <ul className="space-y-1">
                    <li>• Lawfulness, fairness, and transparency</li>
                    <li>• Purpose limitation</li>
                    <li>• Data minimization</li>
                    <li>• Security and accountability</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Data Controller */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <UserGroupIcon className="h-8 w-8 text-green-600 mr-3" />
                Data Controller Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Controller Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600"><strong>Company:</strong> OptiBid Energy LLC</p>
                    <p className="text-gray-600"><strong>Address:</strong> 123 Energy Plaza, New Delhi, Delhi 110001, India</p>
                    <p className="text-gray-600"><strong>Email:</strong> privacy@optibid-energy.com</p>
                    <p className="text-gray-600"><strong>Phone:</strong> +91 (0) 11 1234 5678</p>
                    <p className="text-gray-600"><strong>Registration:</strong> Pvt Ltd Company</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Protection Officer</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600"><strong>Contact:</strong> dpo@optibid-energy.com</p>
                    <p className="text-gray-600"><strong>Responsibilities:</strong></p>
                    <ul className="text-gray-600 text-sm mt-2">
                      <li>• Supervising compliance with privacy laws</li>
                      <li>• Handling data subject requests</li>
                      <li>• Conducting privacy impact assessments</li>
                      <li>• Training employees on data protection</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Categories of Data */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Categories of Personal Data We Process</h2>
            
            <div className="space-y-6">
              {/* Identity Data */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <h3 className="text-2xl font-bold text-gray-900">Identity & Contact Data</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Information we collect to identify you and maintain your account.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Data Types:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Name and surname</li>
                      <li>• Email address</li>
                      <li>• Phone number</li>
                      <li>• Job title and role</li>
                      <li>• Company information</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Purpose & Legal Basis:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Account management (Contract)</li>
                      <li>• Customer support (Legitimate interest)</li>
                      <li>• Marketing communications (Consent)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Financial Data */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <h3 className="text-2xl font-bold text-gray-900">Financial & Payment Data</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Information needed for billing, payment processing, and financial reporting.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Data Types:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Billing address</li>
                      <li>• Payment method details (tokenized)</li>
                      <li>• Subscription plan information</li>
                      <li>• Invoice history</li>
                      <li>• Tax identification numbers</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Purpose & Legal Basis:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Payment processing (Contract)</li>
                      <li>• Financial compliance (Legal obligation)</li>
                      <li>• Fraud prevention (Legitimate interest)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Usage Data */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <h3 className="text-2xl font-bold text-gray-900">Usage & Technical Data</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Information about how you interact with our platform and services.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Data Types:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• IP address and device information</li>
                      <li>• Browser type and version</li>
                      <li>• Pages visited and actions taken</li>
                      <li>• Time spent on features</li>
                      <li>• Dashboard configuration preferences</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Purpose & Legal Basis:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Platform security (Legitimate interest)</li>
                      <li>• Service improvement (Legitimate interest)</li>
                      <li>• Analytics and performance monitoring (Consent)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Trading Data */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  <h3 className="text-2xl font-bold text-gray-900">Energy Trading Data</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Information related to your energy trading activities and portfolio management.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Data Types:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Energy asset information</li>
                      <li>• Trading positions and history</li>
                      <li>• Market data preferences</li>
                      <li>• Risk tolerance settings</li>
                      <li>• Performance metrics</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Purpose & Legal Basis:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Service delivery (Contract)</li>
                      <li>• Compliance with energy regulations (Legal obligation)</li>
                      <li>• Financial reporting (Legal obligation)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Legal Bases */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <ScaleIcon className="h-8 w-8 text-blue-600 mr-3" />
                Legal Bases for Data Processing
              </h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Contract Performance (Article 6(1)(b) GDPR)</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Processing necessary for the performance of a contract to which the data subject is party or in order to take steps at the request of the data subject prior to entering into a contract.
                  </p>
                  <div className="text-xs text-gray-500">
                    <strong>Examples:</strong> Account creation, service delivery, payment processing
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Legitimate Interest (Article 6(1)(f) GDPR)</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Processing necessary for the purposes of the legitimate interests pursued by the controller or by a third party, except where such interests are overridden by the interests or fundamental rights of the data subject.
                  </p>
                  <div className="text-xs text-gray-500">
                    <strong>Examples:</strong> Security monitoring, fraud prevention, service improvement, customer support
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Legal Obligation (Article 6(1)(c) GDPR)</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Processing necessary for compliance with a legal obligation to which the controller is subject.
                  </p>
                  <div className="text-xs text-gray-500">
                    <strong>Examples:</strong> Financial record keeping, energy market reporting, tax compliance
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Consent (Article 6(1)(a) GDPR)</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    The data subject has given consent to the processing of his or her personal data for one or more specific purposes.
                  </p>
                  <div className="text-xs text-gray-500">
                    <strong>Examples:</strong> Marketing communications, analytics cookies, optional features
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <ClockIcon className="h-8 w-8 text-orange-600 mr-3" />
                Data Retention Periods
              </h2>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Data</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• <strong>Active accounts:</strong> Duration of service relationship</li>
                      <li>• <strong>Inactive accounts:</strong> 3 years after last activity</li>
                      <li>• <strong>Closed accounts:</strong> 5 years for legal compliance</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Trading Data</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• <strong>Transaction records:</strong> 7 years (financial regulations)</li>
                      <li>• <strong>Market data:</strong> 2 years for performance analysis</li>
                      <li>• <strong>Risk assessments:</strong> 5 years (industry standard)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 mb-2">Data Deletion Policy</h3>
                  <p className="text-orange-800 text-sm">
                    We automatically delete or anonymize personal data when retention periods expire, unless 
                    longer retention is required by law or for legitimate business purposes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <LockClosedIcon className="h-8 w-8 text-green-600 mr-3" />
                Your Data Protection Rights
              </h2>
              
              <p className="text-gray-600 mb-6">
                Under applicable privacy laws, you have the following rights regarding your personal data:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Right of Access</h3>
                    <p className="text-gray-600 text-sm">
                      Request information about what personal data we hold about you and how it's processed.
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Right to Rectification</h3>
                    <p className="text-gray-600 text-sm">
                      Request correction of inaccurate or incomplete personal data.
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Right to Erasure</h3>
                    <p className="text-gray-600 text-sm">
                      Request deletion of your personal data under certain circumstances.
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Right to Restrict Processing</h3>
                    <p className="text-gray-600 text-sm">
                      Request limitation of processing in certain situations.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Right to Data Portability</h3>
                    <p className="text-gray-600 text-sm">
                      Receive your personal data in a structured, machine-readable format.
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Right to Object</h3>
                    <p className="text-gray-600 text-sm">
                      Object to processing of your personal data for direct marketing purposes.
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Right to Withdraw Consent</h3>
                    <p className="text-gray-600 text-sm">
                      Withdraw consent for processing based on consent at any time.
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Right to Lodge Complaints</h3>
                    <p className="text-gray-600 text-sm">
                      File complaints with supervisory authorities about our data processing activities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Data Transfers */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">International Data Transfers</h2>
              <p className="text-gray-600 mb-4">
                Your personal data may be transferred to and processed in countries other than your own. 
                We ensure adequate protection for such transfers through:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4">
                <li>European Commission adequacy decisions</li>
                <li>Standard Contractual Clauses (SCCs)</li>
                <li>Binding Corporate Rules (BCRs)</li>
                <li>Certification mechanisms and codes of conduct</li>
              </ul>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Data Transfer Notices:</strong> We provide specific information about international 
                  transfers in our detailed privacy notices when collecting your data.
                </p>
              </div>
            </div>
          </section>

          {/* Contact for Rights Exercise */}
          <section className="text-center">
            <div className="bg-gray-100 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Exercise Your Data Rights</h2>
              <p className="text-gray-600 mb-6">
                To exercise any of your data protection rights or to ask questions about data processing, 
                please contact our Data Protection Officer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Contact Data Protection Team
                </a>
                <a 
                  href="mailto:dpo@optibid-energy.com" 
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Email DPO Directly
                </a>
              </div>
            </div>
          </section>
        </div>
      </SectionWrapper>
    </div>
  )
}
