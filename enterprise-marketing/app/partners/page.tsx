'use client'

import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { motion } from 'framer-motion'
import { 
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CogIcon,
  GlobeAltIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SectionWrapper>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6"
              >
              <UserGroupIcon className="h-4 w-4 mr-2" />
              Partner Ecosystem
            </motion.div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Partners</span> & Integrations
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join our growing ecosystem of partners and integrate OptiBid Energy into your platform. 
              Together, we're building the future of energy trading and technology solutions.
            </p>
          </div>

          {/* Partner Value Proposition */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Partner with Energy Innovation</h2>
                  <p className="text-xl mb-6 opacity-90">
                    Access cutting-edge AI technology, comprehensive energy market data, and a growing customer base 
                    while expanding your platform's capabilities.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold">50+</div>
                      <div className="text-sm opacity-75">Technology Partners</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold">25+</div>
                      <div className="text-sm opacity-75">Market Integrations</div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <div className="text-center">
                      <UserGroupIcon className="h-32 w-32 mx-auto mb-4 text-white/80" />
                      <p className="text-lg font-medium">Partnership Ecosystem</p>
                      <p className="text-sm opacity-75">Growing network of integrations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Partnership Types */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Partnership Opportunities</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <CogIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Technology Partners</h3>
                <p className="text-gray-600 mb-4">
                  Integrate OptiBid's API and data feeds into your platform to offer enhanced energy trading capabilities.
                </p>
                <ul className="text-sm text-gray-500 space-y-1 mb-4">
                  <li>• API integration and technical support</li>
                  <li>• Co-marketing opportunities</li>
                  <li>• Revenue sharing programs</li>
                  <li>• Priority technical assistance</li>
                </ul>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Learn More
                </button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Solution Partners</h3>
                <p className="text-gray-600 mb-4">
                  Offer OptiBid solutions as part of your consulting, implementation, or managed services offerings.
                </p>
                <ul className="text-sm text-gray-500 space-y-1 mb-4">
                  <li>• Reseller and referral programs</li>
                  <li>• Implementation training</li>
                  <li>• Co-selling opportunities</li>
                  <li>• Customer success support</li>
                </ul>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Learn More
                </button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <GlobeAltIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Market Partners</h3>
                <p className="text-gray-600 mb-4">
                  Connect energy markets, exchanges, and trading platforms to our comprehensive trading ecosystem.
                </p>
                <ul className="text-sm text-gray-500 space-y-1 mb-4">
                  <li>• Market data partnerships</li>
                  <li>• Trading interface integration</li>
                  <li>• Regulatory compliance support</li>
                  <li>• Performance optimization</li>
                </ul>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Learn More
                </button>
              </motion.div>
            </div>
          </section>

          {/* Current Partners */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Partner Ecosystem</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4"></div>
                <h3 className="font-bold text-gray-900 mb-2">Energy Data Providers</h3>
                <p className="text-sm text-gray-600">Real-time market data and analytics</p>
                <div className="text-xs text-blue-600 mt-2">12 partners</div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4"></div>
                <h3 className="font-bold text-gray-900 mb-2">Trading Platforms</h3>
                <p className="text-sm text-gray-600">Integrated trading interfaces</p>
                <div className="text-xs text-blue-600 mt-2">8 partners</div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4"></div>
                <h3 className="font-bold text-gray-900 mb-2">Cloud Providers</h3>
                <p className="text-sm text-gray-600">Scalable infrastructure solutions</p>
                <div className="text-xs text-blue-600 mt-2">5 partners</div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4"></div>
                <h3 className="font-bold text-gray-900 mb-2">Consulting Firms</h3>
                <p className="text-sm text-gray-600">Implementation and strategy</p>
                <div className="text-xs text-blue-600 mt-2">15 partners</div>
              </div>
            </div>
          </section>

          {/* Integration Benefits */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Integration Benefits</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Technical Advantages</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <span><strong>Comprehensive API:</strong> REST and WebSocket APIs for real-time data and trading</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <span><strong>Scalable Infrastructure:</strong> Handle millions of API calls per day with 99.9% uptime</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <span><strong>Security & Compliance:</strong> Enterprise-grade security with industry certifications</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <span><strong>Developer Resources:</strong> Comprehensive documentation, SDKs, and support</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Business Benefits</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                      <span><strong>Revenue Growth:</strong> Increase customer lifetime value with enhanced capabilities</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                      <span><strong>Market Expansion:</strong> Access new markets and customer segments</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                      <span><strong>Competitive Advantage:</strong> Differentiate your platform with advanced AI features</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                      <span><strong>Partnership Support:</strong> Dedicated partner success team and co-marketing</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Partnership Process */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Partnership Journey</h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Initial Discussion</h3>
                  <p className="text-gray-600">
                    Explore partnership opportunities and define mutual objectives
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">2</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Technical Integration</h3>
                  <p className="text-gray-600">
                    Collaborate on API integration and technical implementation
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">3</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Testing & Certification</h3>
                  <p className="text-gray-600">
                    Validate integration and complete certification process
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-orange-600">4</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Go Live & Support</h3>
                  <p className="text-gray-600">
                    Launch integration with ongoing support and optimization
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Partner Success Stories */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Partner Success Stories</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                    <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">DataTech Solutions</h3>
                    <p className="text-sm text-gray-500">Technology Partner</p>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  40% Increase in Customer Engagement
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  By integrating OptiBid's AI insights, DataTech Solutions increased customer engagement 
                  by 40% and expanded into new energy trading markets.
                </p>
                <div className="text-sm text-gray-500">
                  Partnership duration: 2 years
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                    <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">EnergyConsult Pro</h3>
                    <p className="text-sm text-gray-500">Solution Partner</p>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  $2.5M Additional Revenue
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  By adding OptiBid to their portfolio, EnergyConsult Pro generated $2.5M in additional 
                  revenue through new service offerings.
                </p>
                <div className="text-sm text-gray-500">
                  Partnership duration: 18 months
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                    <GlobeAltIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">GridExchange</h3>
                    <p className="text-sm text-gray-500">Market Partner</p>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  3x Trading Volume Growth
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Through market integration, GridExchange achieved 3x growth in trading volume 
                  and expanded to 5 new regional markets.
                </p>
                <div className="text-sm text-gray-500">
                  Partnership duration: 1 year
                </div>
              </div>
            </div>
          </section>

          {/* API & Integration Resources */}
          <section className="mb-16">
            <div className="bg-gray-100 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Technical Integration Resources</h2>
              
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CogIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">API Documentation</h3>
                  <p className="text-gray-600 text-sm">
                    Comprehensive guides and reference materials
                  </p>
                  <a href="/api" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                    View Documentation →
                  </a>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LightBulbIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">SDK & Libraries</h3>
                  <p className="text-gray-600 text-sm">
                    Pre-built SDKs for popular programming languages
                  </p>
                  <a href="/docs/tutorials" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                    Download SDKs →
                  </a>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UsersIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Partner Portal</h3>
                  <p className="text-gray-600 text-sm">
                    Technical resources and partner support
                  </p>
                  <a href="#" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                    Access Portal →
                  </a>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheckIcon className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Sandbox Environment</h3>
                  <p className="text-gray-600 text-sm">
                    Test and develop integrations safely
                  </p>
                  <a href="#" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                    Get Access →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Partner with OptiBid?</h2>
              <p className="text-xl mb-6 opacity-90">
                Join our ecosystem of innovative partners and unlock new opportunities in energy trading. 
                Let's build something amazing together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  Start Partnership Discussion
                </a>
                <a 
                  href="/api" 
                  className="inline-flex items-center px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  <CogIcon className="h-4 w-4 mr-2" />
                  Explore API Integration
                </a>
              </div>
            </div>
          </section>
        </div>
      </SectionWrapper>
    </div>
  )
}


