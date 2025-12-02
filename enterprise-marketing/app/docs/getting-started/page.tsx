'use client'

import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { motion } from 'framer-motion'
import { 
  PlayIcon, 
  DocumentTextIcon, 
  CogIcon, 
  ChartBarIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SectionWrapper>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Complete Setup Guide
            </motion.div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Getting Started with <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">OptiBid Energy</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow this comprehensive guide to set up your energy trading dashboard, connect your data sources, 
              and start optimizing your energy portfolio in just 30 minutes.
            </p>
          </div>

          {/* Prerequisites */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                Before You Begin
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">System Requirements</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                    <li>• Stable internet connection</li>
                    <li>• Energy trading data sources (optional)</li>
                    <li>• Admin access to your energy systems</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Access You'll Need</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• OptiBid Energy account credentials</li>
                    <li>• Energy market data provider accounts</li>
                    <li>• Grid operator system access (if applicable)</li>
                    <li>• Organizational admin permissions</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Step-by-step guide */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Step-by-Step Setup Guide</h2>
            
            <div className="space-y-8">
              {/* Step 1 */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mr-6">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Create Your Account</h3>
                    <p className="text-gray-600 mb-4">
                      Start by setting up your OptiBid Energy account with your organization details.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Actions:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-gray-700 text-sm">
                        <li>Navigate to the sign-up page</li>
                        <li>Enter your organization information</li>
                        <li>Verify your email address</li>
                        <li>Complete your profile setup</li>
                      </ol>
                    </div>
                    <div className="flex items-center text-blue-600">
                      <PlayIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Est. Time: 5 minutes</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mr-6">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Access Your Dashboard</h3>
                    <p className="text-gray-600 mb-4">
                      Log in to your dashboard and familiarize yourself with the interface and key features.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Dashboard Overview:</h4>
                      <ul className="space-y-1 text-gray-700 text-sm">
                        <li>• <strong>Energy Portfolio:</strong> Overview of your energy assets</li>
                        <li>• <strong>Market Data:</strong> Real-time energy prices and trends</li>
                        <li>• <strong>Analytics:</strong> Performance metrics and insights</li>
                        <li>• <strong>Settings:</strong> Configure your preferences</li>
                      </ul>
                    </div>
                    <div className="flex items-center text-blue-600">
                      <CogIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Est. Time: 5 minutes</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mr-6">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Connect Data Sources</h3>
                    <p className="text-gray-600 mb-4">
                      Integrate your energy trading platforms, market data providers, and IoT devices.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Supported Integrations:</h4>
                        <ul className="space-y-1 text-gray-700 text-sm">
                          <li>• Electricity markets (EPEX, PJM, ERCOT)</li>
                          <li>• Energy management systems</li>
                          <li>• IoT sensors and meters</li>
                          <li>• Weather and demand data</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">API Integration:</h4>
                        <p className="text-blue-800 text-sm">
                          Use our REST APIs to connect your existing systems. Full documentation available in the API reference section.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-blue-600">
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Est. Time: 10 minutes</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 4 */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mr-6">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Configure Your Portfolio</h3>
                    <p className="text-gray-600 mb-4">
                      Set up your energy assets, trading preferences, and optimization parameters.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Portfolio Configuration:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-gray-700 text-sm">
                        <li>Add your energy assets and capacity</li>
                        <li>Set trading constraints and limits</li>
                        <li>Configure risk management parameters</li>
                        <li>Define optimization objectives</li>
                        <li>Set up alert preferences</li>
                      </ol>
                    </div>
                    <div className="flex items-center text-blue-600">
                      <ChartBarIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Est. Time: 8 minutes</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 5 */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mr-6">
                    ✓
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Trading & Monitor</h3>
                    <p className="text-gray-600 mb-4">
                      Launch your first automated trading strategy and monitor performance in real-time.
                    </p>
                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-green-900 mb-2">Success Criteria:</h4>
                      <ul className="space-y-1 text-green-800 text-sm">
                        <li>• Real-time data flowing from all sources</li>
                        <li>• Portfolio metrics updating correctly</li>
                        <li>• Automated trades executing as configured</li>
                        <li>• Alerts and notifications working</li>
                      </ul>
                    </div>
                    <div className="flex items-center text-green-600">
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Est. Time: 2 minutes</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Next Steps */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Congratulations! You're Ready to Trade</h2>
              <p className="text-xl mb-6 opacity-90">
                You've successfully set up your OptiBid Energy platform. Now explore advanced features to maximize your trading performance.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/10 rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Advanced Analytics</h3>
                  <p className="text-sm opacity-90">Learn to use predictive models and AI insights</p>
                  <a href="/advanced-analytics" className="inline-flex items-center text-sm font-medium mt-2 hover:underline">
                    Explore Analytics <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </a>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <h3 className="font-semibold mb-2">API Integration</h3>
                  <p className="text-sm opacity-90">Connect your custom systems and automations</p>
                  <a href="/api" className="inline-flex items-center text-sm font-medium mt-2 hover:underline">
                    View API Docs <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </a>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Support & Training</h3>
                  <p className="text-sm opacity-90">Get help from our expert team when you need it</p>
                  <a href="/contact" className="inline-flex items-center text-sm font-medium mt-2 hover:underline">
                    Contact Support <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Support */}
          <section className="text-center">
            <div className="bg-gray-100 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help Getting Started?</h2>
              <p className="text-gray-600 mb-6">
                Our team is here to help you every step of the way. Get personalized guidance and support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Contact Support
                </a>
                <a 
                  href="/webinars" 
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Join a Webinar
                </a>
              </div>
            </div>
          </section>
        </div>
      </SectionWrapper>
    </div>
  )
}
