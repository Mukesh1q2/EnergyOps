'use client'

import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { motion } from 'framer-motion'
import { 
  DocumentTextIcon,
  ArrowDownTrayIcon,
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function WhitepapersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SectionWrapper>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 text-violet-800 text-sm font-medium mb-6"
            >
              <AcademicCapIcon className="h-4 w-4 mr-2" />
              Research & Analysis
            </motion.div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Whitepapers</span> & Research
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access in-depth research, comprehensive analysis, and expert insights on energy trading, 
              AI applications, market trends, and technological innovations shaping the industry.
            </p>
          </div>

          {/* Featured Whitepaper */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-8 lg:p-12">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-sm font-medium mb-4">
                    Featured Research
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    AI-Powered Energy Trading: The Future of Market Intelligence
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Comprehensive analysis of how artificial intelligence is transforming energy trading, 
                    from predictive analytics to automated optimization strategies. Based on 3 years of research and real-world implementations.
                  </p>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-violet-600">89 pages</div>
                      <div className="text-sm text-gray-500">Comprehensive Analysis</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-violet-600">47 charts</div>
                      <div className="text-sm text-gray-500">Data Visualizations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-violet-600">12</div>
                      <div className="text-sm text-gray-500">Case Studies</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex items-center px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors">
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Download PDF
                    </button>
                    <button className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      Preview Sample
                    </button>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-8 lg:p-12 flex items-center justify-center">
                  <div className="text-center text-white">
                    <DocumentTextIcon className="h-24 w-24 mx-auto mb-4 opacity-80" />
                    <h3 className="text-xl font-bold">AI in Energy Trading</h3>
                    <p className="text-violet-100">2025 Industry Report</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Whitepapers Grid */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Research Library</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Whitepaper 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                    <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Market Dynamics Report</h3>
                    <p className="text-sm text-gray-500">Quarterly Analysis</p>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Energy Market Volatility: Patterns & Predictive Models
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Advanced analysis of energy market volatility patterns, incorporating weather data, 
                  demand cycles, and geopolitical factors into predictive models.
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>67 pages</span>
                  <span>December 2025</span>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Market Analysis</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Predictive Models</span>
                </div>
                <button className="flex items-center text-violet-600 hover:text-violet-700 font-medium text-sm">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download PDF
                </button>
              </motion.div>

              {/* Whitepaper 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                    <CpuChipIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Technology Innovation</h3>
                    <p className="text-sm text-gray-500">Tech Report</p>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Blockchain in Energy Trading: Implementation Guide
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Practical guide to implementing blockchain technology in energy trading, 
                  covering smart contracts, decentralized markets, and regulatory considerations.
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>45 pages</span>
                  <span>November 2025</span>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Blockchain</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Technology</span>
                </div>
                <button className="flex items-center text-violet-600 hover:text-violet-700 font-medium text-sm">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download PDF
                </button>
              </motion.div>

              {/* Whitepaper 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                    <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Financial Analysis</h3>
                    <p className="text-sm text-gray-500">Investment Research</p>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Renewable Energy Investment: Risk Assessment Framework
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Comprehensive framework for assessing investment risks in renewable energy projects, 
                  including policy changes, technological risks, and market dynamics.
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>72 pages</span>
                  <span>October 2025</span>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Investment</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">Risk Analysis</span>
                </div>
                <button className="flex items-center text-violet-600 hover:text-violet-700 font-medium text-sm">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download PDF
                </button>
              </motion.div>

              {/* Whitepaper 4 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                    <LightBulbIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Industry Trends</h3>
                    <p className="text-sm text-gray-500">Future Outlook</p>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  The Future of Energy Storage: Market Opportunities
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  In-depth analysis of energy storage market opportunities, technological developments, 
                  and regulatory frameworks shaping the future of grid-scale storage.
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>56 pages</span>
                  <span>September 2025</span>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">Storage</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Market Analysis</span>
                </div>
                <button className="flex items-center text-violet-600 hover:text-violet-700 font-medium text-sm">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download PDF
                </button>
              </motion.div>

              {/* Whitepaper 5 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                    <ShieldCheckIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Risk Management</h3>
                    <p className="text-sm text-gray-500">Compliance Guide</p>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Energy Trading Compliance: Regulatory Landscape 2025
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Complete guide to energy trading compliance, covering FERC regulations, 
                  international standards, and emerging regulatory requirements.
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>91 pages</span>
                  <span>August 2025</span>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Compliance</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Regulation</span>
                </div>
                <button className="flex items-center text-violet-600 hover:text-violet-700 font-medium text-sm">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download PDF
                </button>
              </motion.div>

              {/* Whitepaper 6 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mr-4">
                    <UserGroupIcon className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Best Practices</h3>
                    <p className="text-sm text-gray-500">Implementation Guide</p>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Collaborative Energy Trading: Team Performance Optimization
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Research-based guide to optimizing team performance in energy trading, 
                  covering collaboration tools, communication strategies, and decision-making processes.
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>38 pages</span>
                  <span>July 2025</span>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs">Collaboration</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Performance</span>
                </div>
                <button className="flex items-center text-violet-600 hover:text-violet-700 font-medium text-sm">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download PDF
                </button>
              </motion.div>
            </div>
          </section>

          {/* Research Categories */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Research Categories</h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Market Analysis</h3>
                <p className="text-gray-600 text-sm">
                  In-depth analysis of energy markets, trends, and trading opportunities
                </p>
                <div className="text-sm text-violet-600 font-medium mt-2">12 papers</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CpuChipIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Technology</h3>
                <p className="text-gray-600 text-sm">
                  AI, blockchain, and emerging technologies in energy trading
                </p>
                <div className="text-sm text-violet-600 font-medium mt-2">8 papers</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Risk & Compliance</h3>
                <p className="text-gray-600 text-sm">
                  Risk management strategies and regulatory compliance guides
                </p>
                <div className="text-sm text-violet-600 font-medium mt-2">6 papers</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LightBulbIcon className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-600 text-sm">
                  Future trends, innovations, and strategic insights
                </p>
                <div className="text-sm text-violet-600 font-medium mt-2">9 papers</div>
              </div>
            </div>
          </section>

          {/* Research Process */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Research Methodology</h2>
              
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Data Collection</h3>
                  <p className="text-gray-600">
                    Gather comprehensive data from multiple market sources, academic research, and industry insights
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">2</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Analysis</h3>
                  <p className="text-gray-600">
                    Apply advanced analytics, machine learning, and statistical methods to identify patterns and insights
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">3</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Validation</h3>
                  <p className="text-gray-600">
                    Validate findings through peer review, industry expert consultation, and real-world testing
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-orange-600">4</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Publication</h3>
                  <p className="text-gray-600">
                    Publish comprehensive reports with actionable insights and practical recommendations
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Research Updates */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Stay Updated with Latest Research</h2>
                  <p className="text-xl mb-6 opacity-90">
                    Get notified when we publish new whitepapers, research reports, and industry insights. 
                    Be the first to access cutting-edge analysis and recommendations.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 mr-3 opacity-75" />
                      <span>Monthly research updates</span>
                    </div>
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-3 opacity-75" />
                      <span>Exclusive early access</span>
                    </div>
                    <div className="flex items-center">
                      <UserGroupIcon className="h-5 w-5 mr-3 opacity-75" />
                      <span>Expert commentary and analysis</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-4">Subscribe to Research Updates</h3>
                    <div className="space-y-4">
                      <input 
                        type="email" 
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
                      />
                      <button className="w-full px-4 py-3 bg-white text-violet-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                        Subscribe to Updates
                      </button>
                    </div>
                    <p className="text-sm opacity-75 mt-3">
                      Research newsletter • Unsubscribe anytime
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-gray-100 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Custom Research?</h2>
              <p className="text-gray-600 mb-6">
                We offer custom research services for organizations seeking specific market analysis, 
                technology assessments, or strategic insights tailored to their needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
                >
                  <AcademicCapIcon className="h-4 w-4 mr-2" />
                  Request Custom Research
                </a>
                <a 
                  href="/resources" 
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  View All Resources
                </a>
              </div>
            </div>
          </section>
        </div>
      </SectionWrapper>
    </div>
  )
}
