'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ShieldCheckIcon, 
  DocumentTextIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

export function PrivacyPolicyContent() {
  const [lastUpdated] = useState('2025-11-19')

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center mb-4"
          >
            <ShieldCheckIcon className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </motion.div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how OptiBid Energy collects, uses, and protects your personal information.
          </p>
          <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
            <ClockIcon className="h-4 w-4 mr-2" />
            Last Updated: {lastUpdated}
          </div>
        </div>

        {/* Quick Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <ShieldCheckIcon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-900 mb-2">Data Protection</h3>
            <p className="text-blue-700 text-sm">Enterprise-grade security with encryption and secure data handling</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg text-center">
            <UserGroupIcon className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-900 mb-2">Your Rights</h3>
            <p className="text-green-700 text-sm">Full control over your data with easy access, modification, and deletion</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg text-center">
            <GlobeAltIcon className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-purple-900 mb-2">Global Compliance</h3>
            <p className="text-purple-700 text-sm">GDPR, CCPA, and India-specific data protection compliance</p>
          </div>
        </div>

        {/* Privacy Policy Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
            
            {/* Section 1 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We collect information you provide directly to us, such as when you create an account, 
                  use our services, or contact us for support.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 mt-6">Personal Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name, email address, and contact information</li>
                  <li>Company name, role, and industry information</li>
                  <li>Payment and billing information</li>
                  <li>Communication preferences and feedback</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Usage Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Dashboard usage and feature interactions</li>
                  <li>API usage and integration patterns</li>
                  <li>Device information and browser details</li>
                  <li>Log files and system performance data</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Energy Trading Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Energy market data and trading positions</li>
                  <li>Forecasting models and optimization parameters</li>
                  <li>Collaboration activities and shared dashboards</li>
                  <li>Data uploads and analytical results</li>
                </ul>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>We use the information we collect to provide, maintain, and improve our services:</p>
                
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and personalize our energy trading platform</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices, updates, and support messages</li>
                  <li>Respond to your comments, questions, and customer service requests</li>
                  <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
                  <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                  <li>Improve our services and develop new features</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing and Disclosure</h2>
              <div className="space-y-4 text-gray-700">
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy:</p>
                
                <h3 className="text-lg font-semibold text-gray-900 mt-6">Service Providers</h3>
                <p>We may share your information with trusted third-party service providers who assist us in operating our platform, conducting business, or serving users.</p>
                
                <h3 className="text-lg font-semibold text-gray-900 mt-6">Legal Requirements</h3>
                <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities.</p>
                
                <h3 className="text-lg font-semibold text-gray-900 mt-6">Business Transfers</h3>
                <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.</p>
              </div>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <div className="space-y-4 text-gray-700">
                <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
                
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption in transit and at rest using industry-standard protocols</li>
                  <li>Regular security assessments and penetration testing</li>
                  <li>Access controls and authentication requirements</li>
                  <li>Employee training on data protection and privacy</li>
                  <li>Incident response procedures and breach notification</li>
                </ul>
              </div>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights and Choices</h2>
              <div className="space-y-4 text-gray-700">
                <p>Depending on your location, you may have certain rights regarding your personal information:</p>
                
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access: Request access to your personal information</li>
                  <li>Correction: Request correction of inaccurate information</li>
                  <li>Deletion: Request deletion of your personal information</li>
                  <li>Portability: Request transfer of your data to another service</li>
                  <li>Objection: Object to certain processing of your information</li>
                  <li>Restriction: Request restriction of processing in certain circumstances</li>
                </ul>
              </div>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
              <div className="space-y-4 text-gray-700">
                <p>We retain your personal information for as long as necessary to provide our services and comply with legal obligations:</p>
                
                <ul className="list-disc pl-6 space-y-2">
                  <li>Account information: Retained while your account is active</li>
                  <li>Energy trading data: Retained according to industry regulations</li>
                  <li>Log files: Typically retained for 90 days to 2 years</li>
                  <li>Financial records: Retained for 7 years for compliance purposes</li>
                </ul>
              </div>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. International Data Transfers</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Your information may be transferred to and processed in countries other than your own. 
                  We ensure appropriate safeguards are in place for international transfers.
                </p>
                <p>
                  For customers in India, we offer data residency options to keep your data within Indian jurisdiction.
                </p>
              </div>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Our services are not intended for children under 16 years of age. We do not knowingly collect 
                  personal information from children under 16.
                </p>
              </div>
            </div>

            {/* Section 9 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Policy</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We may update this privacy policy from time to time. We will notify you of any material changes 
                  by posting the new privacy policy on this page and updating the "Last Updated" date.
                </p>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Contact Us</h2>
              <p className="text-blue-800 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-blue-700">
                <p><strong>Email:</strong> privacy@optibid-energy.com</p>
                <p><strong>Address:</strong> OptiBid Energy Privacy Office, Cyber City, Gurugram, Haryana 122002, India</p>
                <p><strong>Data Protection Officer:</strong> dpo@optibid-energy.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}