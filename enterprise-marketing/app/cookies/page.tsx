'use client'

import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { motion } from 'framer-motion'
import { 
  CircleStackIcon,
  ShieldCheckIcon,
  CogIcon,
  EyeIcon,
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SectionWrapper>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-medium mb-6"
            >
              <CircleStackIcon className="h-4 w-4 mr-2" />
              Cookie Information
            </motion.div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Cookie <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              This Cookie Policy explains how OptiBid Energy uses cookies and similar technologies to enhance your experience, 
              analyze usage, and improve our energy trading platform.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              <strong>Last updated:</strong> December 2, 2025
            </p>
          </div>

          {/* Quick Summary */}
          <section className="mb-16">
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-orange-900 mb-3 flex items-center">
                <CogIcon className="h-5 w-5 mr-2" />
                Cookie Policy Summary
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-orange-800">
                <div>
                  <h3 className="font-semibold mb-2">What We Use Cookies For:</h3>
                  <ul className="space-y-1">
                    <li>• Essential website functionality</li>
                    <li>• User authentication and security</li>
                    <li>• Performance monitoring and analytics</li>
                    <li>• Personalized content and preferences</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Your Cookie Controls:</h3>
                  <ul className="space-y-1">
                    <li>• Accept all cookies (recommended)</li>
                    <li>• Reject non-essential cookies</li>
                    <li>• Customize your cookie preferences</li>
                    <li>• Withdraw consent at any time</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* What are Cookies */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <EyeIcon className="h-8 w-8 text-orange-600 mr-3" />
                What Are Cookies?
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 mb-4">
                  Cookies are small text files that are stored on your device (computer, mobile phone, or tablet) when you visit a website. 
                  They are widely used to make websites work more efficiently and provide information to website owners.
                </p>
                <p className="text-gray-600 mb-4">
                  Cookies enhance your browsing experience by remembering your preferences, enabling certain functionality, 
                  and helping us understand how you use our platform. They do not contain personal information that can identify you directly.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Session Cookies</h3>
                    <p className="text-blue-800 text-sm">
                      Temporary cookies that are deleted when you close your browser. Essential for maintaining 
                      your session and keeping you logged in during your visit.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">Persistent Cookies</h3>
                    <p className="text-green-800 text-sm">
                      Long-term cookies that remain on your device for a set period. Used to remember 
                      your preferences and improve your experience across visits.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Types of Cookies */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Types of Cookies We Use</h2>
            
            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <h3 className="text-2xl font-bold text-gray-900">Essential Cookies (Always Active)</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  These cookies are necessary for the website to function properly and cannot be switched off. 
                  They are usually set in response to actions made by you which amount to a request for services.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Examples of Essential Cookies:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• <strong>Authentication:</strong> Keep you logged in during your session</li>
                    <li>• <strong>Security:</strong> Protect against CSRF attacks and fraud</li>
                    <li>• <strong>Functionality:</strong> Remember your dashboard preferences</li>
                    <li>• <strong>Navigation:</strong> Enable core website navigation and features</li>
                  </ul>
                </div>
              </div>

              {/* Performance Cookies */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <h3 className="text-2xl font-bold text-gray-900">Performance Cookies</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  These cookies allow us to recognize and count the number of visitors and see how visitors move around our website. 
                  This helps us improve the way our website works.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">What They Help With:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• <strong>Website Analytics:</strong> Monitor page views, user flows, and bounce rates</li>
                    <li>• <strong>Performance Monitoring:</strong> Identify slow-loading pages and fix issues</li>
                    <li>• <strong>A/B Testing:</strong> Test different website versions to improve user experience</li>
                    <li>• <strong>Error Tracking:</strong> Collect information about errors to improve reliability</li>
                  </ul>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <h3 className="text-2xl font-bold text-gray-900">Functional Cookies</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  These cookies enable the website to provide enhanced functionality and personalization. 
                  They may be set by us or by third-party providers whose services we have added to our pages.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Features They Enable:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• <strong>User Preferences:</strong> Remember your language, theme, and display settings</li>
                    <li>• <strong>Dashboard Layout:</strong> Save your widget preferences and layout</li>
                    <li>• <strong>Recent Activity:</strong> Track your recent energy trading history</li>
                    <li>• <strong>Form Data:</strong> Auto-fill forms with previously entered information</li>
                  </ul>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <h3 className="text-2xl font-bold text-gray-900">Marketing Cookies</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  These cookies are used to deliver advertisements more relevant to you and your interests. 
                  They also help measure the effectiveness of advertising campaigns.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Marketing Activities:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• <strong>Interest-Based Advertising:</strong> Show relevant content and ads</li>
                    <li>• <strong>Social Media Integration:</strong> Enable sharing on social platforms</li>
                    <li>• <strong>Campaign Measurement:</strong> Track the effectiveness of marketing campaigns</li>
                    <li>• <strong>Retargeting:</strong> Show you relevant content based on your interests</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
                Third-Party Cookies
              </h2>
              <p className="text-gray-600 mb-6">
                Some cookies are placed by third-party services that appear on our pages. We use several external services 
                to enhance your experience and provide additional functionality.
              </p>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Google Analytics</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Helps us understand how visitors interact with our website by collecting information anonymously.
                  </p>
                  <div className="text-xs text-gray-500">
                    <strong>Purpose:</strong> Website Analytics | <strong>Duration:</strong> 2 years
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Stripe Payment Processing</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Enables secure payment processing for our subscription plans.
                  </p>
                  <div className="text-xs text-gray-500">
                    <strong>Purpose:</strong> Payment Processing | <strong>Duration:</strong> Session
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Intercom Chat Support</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Provides live chat support and customer service features.
                  </p>
                  <div className="text-xs text-gray-500">
                    <strong>Purpose:</strong> Customer Support | <strong>Duration:</strong> 9 months
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Cookie Management */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Managing Your Cookie Preferences</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Browser Settings</h3>
                <p className="text-gray-600 mb-4">
                  You can control and manage cookies through your browser settings. Most browsers allow you to:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• View which cookies are stored on your device</li>
                  <li>• Delete existing cookies</li>
                  <li>• Block cookies from specific websites</li>
                  <li>• Block all cookies from being set</li>
                  <li>• Receive notifications when cookies are set</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    <strong>Note:</strong> Disabling essential cookies may affect website functionality.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Our Cookie Controls</h3>
                <p className="text-gray-600 mb-4">
                  We provide you with direct control over your cookie preferences through our cookie banner:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• <strong>Accept All:</strong> Enable all cookies for optimal experience</li>
                  <li>• <strong>Essential Only:</strong> Use only necessary cookies</li>
                  <li>• <strong>Customize:</strong> Choose which types of cookies to enable</li>
                  <li>• <strong>Withdraw Consent:</strong> Change your preferences anytime</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="text-blue-600 hover:underline text-sm font-medium">
                    Manage Cookie Preferences
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Impact of Disabling Cookies */}
          <section className="mb-16">
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-2" />
                <h2 className="text-2xl font-bold text-yellow-900">What Happens If You Disable Cookies?</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">You May Lose:</h3>
                  <ul className="space-y-1 text-yellow-800">
                    <li>• Ability to stay logged in</li>
                    <li>• Personalized dashboard settings</li>
                    <li>• Remembered preferences</li>
                    <li>• Smooth navigation experience</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">We May Not Be Able To:</h3>
                  <ul className="space-y-1 text-yellow-800">
                    <li>• Improve website performance</li>
                    <li>• Provide personalized content</li>
                    <li>• Understand user behavior</li>
                    <li>• Measure campaign effectiveness</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Updates to Policy */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Cookie Policy</h2>
              <p className="text-gray-600 mb-4">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, 
                legal, or regulatory reasons. When we make changes, we will:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4">
                <li>Update the "last updated" date at the top of this policy</li>
                <li>Notify users of significant changes via email or website notification</li>
                <li>Provide a summary of key changes made</li>
                <li>Allow you to review and accept the updated policy</li>
              </ul>
              <p className="text-gray-600">
                Your continued use of our website after any changes constitutes your acceptance of the updated Cookie Policy.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="text-center">
            <div className="bg-gray-100 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Cookies?</h2>
              <p className="text-gray-600 mb-6">
                If you have any questions about our use of cookies or this Cookie Policy, please contact our privacy team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  <ShieldCheckIcon className="h-4 w-4 mr-2" />
                  Contact Privacy Team
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

