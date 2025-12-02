'use client'

import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { motion } from 'framer-motion'
import { 
  PresentationChartLineIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SectionWrapper>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium mb-6"
            >
              <PresentationChartLineIcon className="h-4 w-4 mr-2" />
              Success Stories
            </motion.div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Case Studies</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how leading organizations across different sectors have achieved remarkable results with OptiBid Energy. 
              From utilities to trading firms, see real outcomes and measurable impact.
            </p>
          </div>

          {/* Featured Case Study */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-8 lg:p-12">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium mb-4">
                    Featured Case Study
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    GridCorp Reduces Trading Costs by 32% with AI-Powered Optimization
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Learn how GridCorp, a major utility company, leveraged OptiBid's AI insights and automated trading 
                    to significantly reduce trading costs while improving portfolio performance.
                  </p>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">32%</div>
                      <div className="text-sm text-gray-500">Cost Reduction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">$4.2M</div>
                      <div className="text-sm text-gray-500">Annual Savings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">6 Months</div>
                      <div className="text-sm text-gray-500">Payback Period</div>
                    </div>
                  </div>
                  <button className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                    Read Full Case Study
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </button>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 lg:p-12 flex items-center justify-center">
                  <div className="text-center text-white">
                    <BuildingOfficeIcon className="h-24 w-24 mx-auto mb-4 opacity-80" />
                    <h3 className="text-xl font-bold">GridCorp</h3>
                    <p className="text-emerald-100">Major Utility Company</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Case Studies Grid */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">More Success Stories</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Case Study 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                      <PresentationChartLineIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">EnergyMax Trading</h3>
                      <p className="text-sm text-gray-500">Energy Trading Firm</p>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    25% Portfolio Performance Increase with Knowledge Graphs
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    How EnergyMax Trading used OptiBid's visual knowledge graphs to discover hidden market relationships 
                    and improve trading decisions.
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>25% performance increase</span>
                    <span>3 months implementation</span>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Trading</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">AI Insights</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Read Case Study →
                  </button>
                </div>
              </motion.div>

              {/* Case Study 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                      <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">RegionalPower Co.</h3>
                      <p className="text-sm text-gray-500">Regional Utility</p>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Collaborative Trading Cuts Decision Time by 67%
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Discover how RegionalPower Co. improved team coordination and reduced decision-making time 
                    through real-time collaboration features.
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>67% faster decisions</span>
                    <span>15% cost savings</span>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Collaboration</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Operations</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Read Case Study →
                  </button>
                </div>
              </motion.div>

              {/* Case Study 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                      <UsersIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">IndustrialEnergy Ltd</h3>
                      <p className="text-sm text-gray-500">Manufacturing Company</p>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Smart Portfolio Optimization Saves $2.1M Annually
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Learn how IndustrialEnergy reduced energy procurement costs and improved risk management 
                    with automated portfolio optimization.
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>$2.1M annual savings</span>
                    <span>40% risk reduction</span>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Portfolio</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Risk Management</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Read Case Study →
                  </button>
                </div>
              </motion.div>

              {/* Case Study 4 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                      <ArrowTrendingUpIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">TechStartup Energy</h3>
                      <p className="text-sm text-gray-500">Technology Company</p>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Cloud Infrastructure Reduces Trading Latency by 89%
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    How a fast-growing tech company leveraged OptiBid's cloud infrastructure to achieve 
                    ultra-low latency trading and competitive advantage.
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>89% latency reduction</span>
                    <span>10x faster execution</span>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">Infrastructure</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Performance</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Read Case Study →
                  </button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Industry Sectors */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Success Across Industries</h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Utilities</h3>
                <p className="text-gray-600 text-sm">
                  Grid operators and power companies optimizing energy trading and portfolio management
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Trading Firms</h3>
                <p className="text-gray-600 text-sm">
                  Energy trading companies improving strategies and reducing operational costs
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Industrial</h3>
                <p className="text-gray-600 text-sm">
                  Large energy consumers optimizing procurement and managing trading risks
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Technology</h3>
                <p className="text-gray-600 text-sm">
                  Tech companies requiring high-performance trading infrastructure and low latency
                </p>
              </div>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Client Success Metrics</h2>
              
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">$127M</div>
                  <div className="text-gray-900 font-medium mb-1">Total Client Savings</div>
                  <div className="text-gray-500 text-sm">Across all implementations</div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">89%</div>
                  <div className="text-gray-900 font-medium mb-1">Avg. Performance Increase</div>
                  <div className="text-gray-500 text-sm">In trading portfolio returns</div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">4.2</div>
                  <div className="text-gray-900 font-medium mb-1">Average ROI (Multiple)</div>
                  <div className="text-gray-500 text-sm">Within first 12 months</div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-2">67%</div>
                  <div className="text-gray-900 font-medium mb-1">Faster Decision Making</div>
                  <div className="text-gray-500 text-sm">With real-time collaboration</div>
                </div>
              </div>
            </div>
          </section>

          {/* Implementation Timeline */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Typical Implementation Timeline</h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">1</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Week 1-2</h3>
                  <p className="text-gray-600">
                    Initial setup, data integration, and platform configuration
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">2</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Week 3-4</h3>
                  <p className="text-gray-600">
                    User training, workflow optimization, and team onboarding
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">3</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Week 5-8</h3>
                  <p className="text-gray-600">
                    Gradual rollout, performance monitoring, and adjustments
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Week 9+</h3>
                  <p className="text-gray-600">
                    Full production, optimization, and measurable results
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What Our Clients Say</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-bold text-gray-900">Michael Chen</h4>
                    <p className="text-sm text-gray-500">CFO, GridCorp</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "OptiBid transformed our energy trading operations. The AI insights alone saved us millions in the first quarter. 
                  The ROI exceeded our most optimistic projections."
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-bold text-gray-900">Sarah Rodriguez</h4>
                    <p className="text-sm text-gray-500">Head of Trading, EnergyMax</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "The knowledge graphs feature revealed patterns we never knew existed. It's like having X-ray vision into market relationships. 
                  Our trading performance has never been better."
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-bold text-gray-900">David Park</h4>
                    <p className="text-sm text-gray-500">CTO, TechStartup Energy</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "The collaboration features brought our distributed team together. Decision-making time dropped dramatically, 
                  and our traders are more effective than ever."
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Write Your Success Story?</h2>
              <p className="text-xl mb-6 opacity-90">
                Join the growing list of organizations achieving exceptional results with OptiBid Energy. 
                Let's discuss how we can help you reach your goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 bg-white text-emerald-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Schedule Consultation
                </a>
                <a 
                  href="/resources" 
                  className="inline-flex items-center px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  <PresentationChartLineIcon className="h-4 w-4 mr-2" />
                  Download Case Studies
                </a>
              </div>
            </div>
          </section>
        </div>
      </SectionWrapper>
    </div>
  )
}

