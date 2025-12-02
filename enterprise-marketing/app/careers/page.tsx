'use client'

import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { motion } from 'framer-motion'
import { 
  BriefcaseIcon,
  GlobeAltIcon,
  UsersIcon,
  HeartIcon,
  CodeBracketIcon,
  ChartBarIcon,
  LightBulbIcon,
  CpuChipIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function CareersPage() {
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
              <BriefcaseIcon className="h-4 w-4 mr-2" />
              Join Our Team
            </motion.div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Careers</span> at OptiBid Energy
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join a team of passionate experts shaping the future of energy trading. We work at the intersection of 
              cutting-edge technology, financial markets, and environmental impact.
            </p>
          </div>

          {/* Company Culture */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Build the Future of Energy</h2>
                  <p className="text-xl mb-6 opacity-90">
                    At OptiBid, we're not just building software—we're revolutionizing how the world trades energy. 
                    Join us in creating technology that makes a real impact on the environment and economy.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold">200+</div>
                      <div className="text-sm opacity-75">Team Members</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold">25+</div>
                      <div className="text-sm opacity-75">Countries</div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <div className="text-center">
                      <UsersIcon className="h-32 w-32 mx-auto mb-4 text-white/80" />
                      <p className="text-lg font-medium">Global Team</p>
                      <p className="text-sm opacity-75">Remote-first culture</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Why OptiBid */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Join OptiBid?</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <LightBulbIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Innovation & Impact</h3>
                <p className="text-gray-600 mb-4">
                  Work on cutting-edge AI and machine learning technologies that are transforming energy markets globally.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• AI-powered trading algorithms</li>
                  <li>• Real-time market analysis</li>
                  <li>• Environmental impact focus</li>
                  <li>• Patent research opportunities</li>
                </ul>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <GlobeAltIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Global Team</h3>
                <p className="text-gray-600 mb-4">
                  Collaborate with talented professionals from around the world in a truly remote-first environment.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Remote-first culture</li>
                  <li>• Flexible working hours</li>
                  <li>• Diverse team globally</li>
                  <li>• Professional development</li>
                </ul>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <HeartIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Work-Life Balance</h3>
                <p className="text-gray-600 mb-4">
                  We believe in sustainable productivity and offer comprehensive benefits to support your wellbeing.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Competitive compensation</li>
                  <li>• Comprehensive health benefits</li>
                  <li>• Stock option programs</li>
                  <li>• Unlimited PTO policy</li>
                </ul>
              </motion.div>
            </div>
          </section>

          {/* Open Positions */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Open Positions</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Job 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Senior AI/ML Engineer</h3>
                    <p className="text-gray-600">Technology</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Remote
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  Lead development of AI models for energy market prediction and automated trading optimization. 
                  Experience with Python, TensorFlow, and energy markets required.
                </p>
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span>Remote (Global)</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>Full-time</span>
                  </div>
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    <span>$150K - $220K + Equity</span>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">AI/ML</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Python</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Energy Markets</span>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Apply Now
                </button>
              </motion.div>

              {/* Job 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Energy Trading Analyst</h3>
                    <p className="text-gray-600">Trading</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    Hybrid
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  Analyze energy market trends, develop trading strategies, and collaborate with AI team to optimize 
                  automated trading systems. Strong background in energy markets required.
                </p>
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span>New Delhi, India</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>Full-time</span>
                  </div>
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    <span>$80K - $120K + Bonus</span>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Energy Markets</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">Trading</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Analysis</span>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Apply Now
                </button>
              </motion.div>

              {/* Job 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Full Stack Developer</h3>
                    <p className="text-gray-600">Engineering</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Remote
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  Build and maintain our trading platform using React, Node.js, and Python. 
                  Experience with real-time systems and financial applications preferred.
                </p>
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span>Remote (Europe/Asia)</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>Full-time</span>
                  </div>
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    <span>$90K - $140K + Equity</span>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">React</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Node.js</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Python</span>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Apply Now
                </button>
              </motion.div>

              {/* Job 4 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Product Manager</h3>
                    <p className="text-gray-600">Product</p>
                  </div>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                    Hybrid
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  Drive product strategy and roadmap for our energy trading platform. 
                  Work closely with engineering, trading, and business teams to deliver exceptional user experiences.
                </p>
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span>New York, USA</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>Full-time</span>
                  </div>
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    <span>$130K - $180K + Equity</span>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Product Strategy</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">B2B SaaS</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Energy</span>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Apply Now
                </button>
              </motion.div>
            </div>
          </section>

          {/* Departments */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Join Our Teams</h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CpuChipIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Engineering</h3>
                <p className="text-gray-600 text-sm">
                  Build scalable platforms and AI systems powering the future of energy trading
                </p>
                <div className="text-sm text-emerald-600 font-medium mt-2">12 open roles</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Trading</h3>
                <p className="text-gray-600 text-sm">
                  Analyze markets, develop strategies, and optimize energy trading operations
                </p>
                <div className="text-sm text-emerald-600 font-medium mt-2">8 open roles</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LightBulbIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Product</h3>
                <p className="text-gray-600 text-sm">
                  Drive product strategy and create exceptional user experiences
                </p>
                <div className="text-sm text-emerald-600 font-medium mt-2">5 open roles</div>
              </div>

              <div class className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BuildingOfficeIcon className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Business</h3>
                <p className="text-gray-600 text-sm">
                  Grow partnerships, customer success, and business operations globally
                </p>
                <div className="text-sm text-emerald-600 font-medium mt-2">6 open roles</div>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Benefits & Perks</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Compensation & Equity</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Competitive salary based on location and experience</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Equity participation in company growth</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Performance bonuses and profit sharing</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Annual salary review and growth opportunities</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Health & Wellness</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Comprehensive health insurance coverage</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Mental health and wellness programs</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Annual wellness allowance and gym membership</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Flexible working hours and time off</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Growth & Development</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Professional development budget and training</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Conference attendance and industry events</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Internal mentorship and knowledge sharing</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Career advancement opportunities</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Application Process */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Application Process</h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Application Review</h3>
                  <p className="text-gray-600">
                    We review your application and portfolio within 3-5 business days
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">2</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Initial Interview</h3>
                  <p className="text-gray-600">
                    Phone or video call to discuss your experience and role expectations
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">3</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Technical Assessment</h3>
                  <p className="text-gray-600">
                    Role-specific technical evaluation or practical assignment
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-orange-600">4</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Final Interview</h3>
                  <p className="text-gray-600">
                    Meeting with team leads and offer discussion
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Join Our Mission?</h2>
              <p className="text-xl mb-6 opacity-90">
                Help us revolutionize energy trading and make a positive impact on the world. 
                Apply today and become part of something bigger.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:careers@optibid-energy.com" 
                  className="inline-flex items-center px-6 py-3 bg-white text-emerald-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  <BriefcaseIcon className="h-4 w-4 mr-2" />
                  Send Your Resume
                </a>
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  Learn About OptiBid
                </a>
              </div>
            </div>
          </section>
        </div>
      </SectionWrapper>
    </div>
  )
}
