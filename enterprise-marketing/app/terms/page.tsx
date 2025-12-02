'use client'

import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { motion } from 'framer-motion'
import { 
  DocumentTextIcon,
  ScaleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SectionWrapper>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-800 text-sm font-medium mb-6"
            >
              <ScaleIcon className="h-4 w-4 mr-2" />
              Legal Document
            </motion.div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Terms of <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Service</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These Terms of Service govern your use of the OptiBid Energy platform and services. 
              Please read them carefully before using our services.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              <strong>Last updated:</strong> December 2, 2025
            </p>
          </div>

          {/* Quick Summary */}
          <section className="mb-16">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Quick Summary
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <h3 className="font-semibold mb-2">Key Points:</h3>
                  <ul className="space-y-1">
                    <li>• OptiBid provides energy trading and optimization services</li>
                    <li>• Users are responsible for compliance with energy regulations</li>
                    <li>• Platform liability is limited to service fees paid</li>
                    <li>• We reserve the right to modify services with notice</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Your Responsibilities:</h3>
                  <ul className="space-y-1">
                    <li>• Provide accurate and truthful information</li>
                    <li>• Use services in compliance with applicable laws</li>
                    <li>• Maintain confidentiality of account credentials</li>
                    <li>• Report any unauthorized use immediately</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Main Terms Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="prose prose-lg max-w-none">
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 mb-4">
                  By accessing and using the OptiBid Energy platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
                <p className="text-gray-600">
                  These Terms of Service ("Terms") govern your use of our website located at optibid-energy.com operated by OptiBid Energy LLC ("us", "we", or "our").
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-600 mb-4">
                  OptiBid Energy provides an enterprise-grade energy trading platform that includes:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Real-time energy market data and analytics</li>
                  <li>Automated trading and optimization algorithms</li>
                  <li>Portfolio management and risk assessment tools</li>
                  <li>API integrations with energy markets and trading platforms</li>
                  <li>AI-powered forecasting and recommendation systems</li>
                  <li>Collaboration tools for energy trading teams</li>
                </ul>
                <p className="text-gray-600">
                  We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts and Registration</h2>
                <p className="text-gray-600 mb-4">
                  To access certain features of our Service, you may be required to register for an account. You agree to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept all risks of unauthorized access to your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
                <p className="text-gray-600">
                  We reserve the right to suspend or terminate accounts that violate these terms or appear to be used for illegal activities.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
                <p className="text-gray-600 mb-4">
                  You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Use the Service in any way that violates applicable laws or regulations</li>
                  <li>Transmit or procure the sending of any advertising or promotional material without our prior written consent</li>
                  <li>Impersonate or attempt to impersonate the company, its employees, or other users</li>
                  <li>Use any automated system to access the Service in a way that could damage, disable, or impair our servers</li>
                  <li>Attempt to gain unauthorized access to any part of the Service</li>
                  <li>Use the Service to infringe upon the intellectual property rights of others</li>
                  <li>Upload, post, or transmit any content that is defamatory, obscene, or harmful</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Energy Trading Compliance</h2>
                <p className="text-gray-600 mb-4">
                  Users conducting energy trading through our platform are solely responsible for compliance with all applicable regulations, including:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Federal and state energy market regulations</li>
                  <li>Financial services and securities laws where applicable</li>
                  <li>Environmental and grid operation requirements</li>
                  <li>Market operator rules and procedures</li>
                  <li>Registration and licensing requirements</li>
                </ul>
                <p className="text-gray-600">
                  We provide tools and data for educational and analysis purposes. Users should consult with legal and regulatory professionals before conducting actual trades.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data and Privacy</h2>
                <p className="text-gray-600 mb-4">
                  Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated by reference into these Terms.
                </p>
                <p className="text-gray-600">
                  By using our Service, you consent to the collection and use of your information as outlined in our Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property Rights</h2>
                <p className="text-gray-600 mb-4">
                  The Service and its original content, features, and functionality are owned by OptiBid Energy LLC and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
                <p className="text-gray-600">
                  You retain any rights you may have to content you submit through the Service, but you grant us a worldwide, royalty-free license to use, reproduce, and distribute such content as part of our Service operations.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimer of Warranties</h2>
                <p className="text-gray-600 mb-4">
                  THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT</li>
                  <li>WARRANTIES REGARDING THE ACCURACY, RELIABILITY, OR COMPLETENESS OF MARKET DATA</li>
                  <li>WARRANTIES THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE</li>
                  <li>WARRANTIES REGARDING THE PERFORMANCE OR RESULTS OF TRADING ACTIVITIES</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
                <p className="text-gray-600 mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL OPTIBID ENERGY LLC OR ITS AFFILIATES, DIRECTORS, OFFICERS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
                </p>
                <p className="text-gray-600">
                  OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO US FOR THE SERVICE IN THE 12 MONTHS PRECEDING THE CLAIM.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Trading Risk Disclaimer</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="font-semibold text-yellow-800">Important Risk Disclosure</span>
                  </div>
                  <p className="text-yellow-800 text-sm">
                    Energy trading involves substantial risk and may result in losses. Past performance does not guarantee future results. 
                    You should carefully consider whether trading is suitable for you in light of your circumstances, knowledge, and financial resources.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
                <p className="text-gray-600 mb-4">
                  You agree to defend, indemnify, and hold harmless OptiBid Energy LLC and its affiliates, directors, officers, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of your use of the Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Termination</h2>
                <p className="text-gray-600 mb-4">
                  We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
                <p className="text-gray-600">
                  Upon termination, your right to use the Service will cease immediately. All provisions of the Terms which by their nature should survive termination shall survive.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to Terms</h2>
                <p className="text-gray-600 mb-4">
                  We reserve the right to modify or replace these Terms at any time. We will notify users of any material changes by posting the new Terms on this page with an updated "last modified" date.
                </p>
                <p className="text-gray-600">
                  Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Governing Law</h2>
                <p className="text-gray-600 mb-4">
                  These Terms shall be interpreted and governed by the laws of the State of New York, United States, without regard to its conflict of law provisions.
                </p>
                <p className="text-gray-600">
                  Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the state and federal courts located in New York.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-4 text-gray-600">
                    <div>
                      <h3 className="font-semibold text-gray-900">Email:</h3>
                      <p>legal@optibid-energy.com</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Address:</h3>
                      <p>OptiBid Energy LLC<br />123 Energy Plaza<br />New Delhi, Delhi 110001<br />India</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Severability</h2>
                <p className="text-gray-600 mb-4">
                  If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Entire Agreement</h2>
                <p className="text-gray-600">
                  These Terms constitute the entire agreement between you and OptiBid Energy LLC regarding the use of the Service and supersede all prior or contemporaneous understandings regarding such use.
                </p>
              </section>

            </div>
          </div>

          {/* Footer CTA */}
          <section className="mt-16 text-center">
            <div className="bg-gray-100 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About These Terms?</h2>
              <p className="text-gray-600 mb-6">
                If you have any questions about our Terms of Service, please don't hesitate to contact our legal team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <ShieldCheckIcon className="h-4 w-4 mr-2" />
                  Contact Legal Team
                </a>
                <a 
                  href="/privacy" 
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Privacy Policy
                </a>
              </div>
            </div>
          </section>
        </div>
      </SectionWrapper>
    </div>
  )
}
