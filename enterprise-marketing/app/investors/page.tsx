'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ClockIcon, 
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const InvestorsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [email, setEmail] = useState('');

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  const keyMetrics = [
    { label: 'Revenue Growth', value: '156%', period: 'YoY', icon: ArrowTrendingUpIcon },
    { label: 'Active Customers', value: '2,847', period: 'Enterprise', icon: UserGroupIcon },
    { label: 'Market Valuation', value: '$1.2B', period: 'Series C', icon: CurrencyDollarIcon },
    { label: 'Operational Efficiency', value: '23%', period: 'Margin Improvement', icon: ChartBarIcon }
  ];

  const financialHighlights = [
    {
      quarter: 'Q3 2024',
      revenue: '$47.2M',
      growth: '+42%',
      customers: '2,847',
      churn: '2.1%'
    },
    {
      quarter: 'Q2 2024', 
      revenue: '$38.5M',
      growth: '+38%',
      customers: '2,341',
      churn: '2.4%'
    },
    {
      quarter: 'Q1 2024',
      revenue: '$32.1M', 
      growth: '+35%',
      customers: '1,956',
      churn: '2.8%'
    }
  ];

  const leadershipTeam = [
    {
      name: 'Sarah Chen',
      role: 'Chief Executive Officer',
      experience: 'Former VP at Tesla Energy, 15+ years in renewable energy',
      education: 'Stanford MBA, MIT Engineering'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Chief Financial Officer',
      experience: 'Former CFO at NextEra Energy, Goldman Sachs alumni',
      education: 'Wharton MBA, CPA'
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Chief Technology Officer',
      experience: 'AI/ML expert, former Google Energy, PhD Computer Science',
      education: 'PhD MIT, Berkeley Engineering'
    },
    {
      name: 'James Thompson',
      role: 'Chief Operating Officer',
      experience: 'Operations leader, former AWS Energy Solutions',
      education: 'Harvard MBA, Industrial Engineering'
    }
  ];

  const investorDocuments = [
    { name: 'Q3 2024 Earnings Report', size: '2.4 MB', type: 'PDF' },
    { name: 'Annual Report 2024', size: '8.7 MB', type: 'PDF' },
    { name: 'Investor Presentation Q3', size: '5.2 MB', type: 'PDF' },
    { name: 'ESG Impact Report', size: '3.1 MB', type: 'PDF' }
  ];

  const milestones = [
    { year: '2024', event: 'Series C Funding - $150M', description: 'Led by Khosla Ventures with participation from existing investors' },
    { year: '2024', event: 'Europe Expansion', description: 'Opened offices in London and Berlin, serving 200+ European customers' },
    { year: '2023', event: 'Series B Funding - $75M', description: 'Accelerated AI capabilities and international expansion' },
    { year: '2023', event: '10,000 MW Under Management', description: 'Milestone reached in energy optimization platform' },
    { year: '2022', event: 'Series A Funding - $25M', description: 'Breakthrough in predictive analytics for energy trading' },
    { year: '2022', event: 'Platform Launch', description: 'First enterprise customers onboarded in North America' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Investor Relations
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Transforming the energy sector through intelligent optimization and predictive analytics
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Download Investor Kit
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Schedule Meeting
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100"
              >
                <div className="flex items-center mb-3">
                  <metric.icon className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-600">{metric.period}</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-sm text-gray-700">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: GlobeAltIcon },
              { id: 'financials', label: 'Financials', icon: ChartBarIcon },
              { id: 'governance', label: 'Governance', icon: ShieldCheckIcon },
              { id: 'documents', label: 'Documents', icon: DocumentArrowDownIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-blue-50'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-12"
            >
              <div className="text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Company Overview</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  OptiBid is revolutionizing energy markets through AI-powered optimization, 
                  enabling utilities, traders, and renewable energy providers to maximize efficiency 
                  and profitability while accelerating the transition to clean energy.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LightBulbIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                  <p className="text-gray-600">
                    Cutting-edge AI and machine learning algorithms that optimize energy trading 
                    and grid management in real-time.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Growth</h3>
                  <p className="text-gray-600">
                    Consistent triple-digit growth with expanding market presence across 
                    North America and Europe.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GlobeAltIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Impact</h3>
                  <p className="text-gray-600">
                    Reducing carbon emissions and enabling the global transition to 
                    sustainable energy systems.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Milestones</h3>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <motion.div
                      key={milestone.year}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {milestone.year}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{milestone.event}</h4>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Financials Tab */}
          {activeTab === 'financials' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Financial Highlights</h2>
                <p className="text-xl text-gray-600">
                  Strong financial performance with consistent growth and improving unit economics
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">Quarter</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">Revenue</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">Growth</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">Customers</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">Churn Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialHighlights.map((quarter, index) => (
                        <tr key={quarter.quarter} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 font-medium text-gray-900">{quarter.quarter}</td>
                          <td className="px-6 py-4 text-gray-900">{quarter.revenue}</td>
                          <td className="px-6 py-4 text-green-600 font-semibold">{quarter.growth}</td>
                          <td className="px-6 py-4 text-gray-900">{quarter.customers}</td>
                          <td className="px-6 py-4 text-gray-900">{quarter.churn}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Revenue Model</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• SaaS Platform Subscriptions (65%)</li>
                    <li>• Transaction-based Fees (25%)</li>
                    <li>• Professional Services (10%)</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Metrics</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Net Revenue Retention: 135%</li>
                    <li>• Customer Acquisition Cost: $12,400</li>
                    <li>• Lifetime Value: $186,000</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Governance Tab */}
          {activeTab === 'governance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Leadership Team</h2>
                <p className="text-xl text-gray-600">
                  Experienced executives with deep expertise in energy, technology, and finance
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {leadershipTeam.map((leader, index) => (
                  <motion.div
                    key={leader.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-6 rounded-xl border border-gray-200"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{leader.name}</h3>
                    <p className="text-blue-600 font-medium mb-3">{leader.role}</p>
                    <p className="text-gray-600 mb-2">{leader.experience}</p>
                    <p className="text-sm text-gray-500">{leader.education}</p>
                  </motion.div>
                ))}
              </div>

              <div className="bg-gray-50 p-8 rounded-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Board of Directors</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <UserGroupIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h4 className="font-semibold">Investor Directors</h4>
                    <p className="text-sm text-gray-600">Khosla Ventures, Andreessen Horowitz</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BuildingOfficeIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="font-semibold">Independent Directors</h4>
                    <p className="text-sm text-gray-600">Former executives from Tesla, NextEra</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <UserGroupIcon className="h-8 w-8 text-purple-600" />
                    </div>
                    <h4 className="font-semibold">Founder Director</h4>
                    <p className="text-sm text-gray-600">CEO representing company interests</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Investor Documents</h2>
                <p className="text-xl text-gray-600">
                  Access key financial reports, presentations, and corporate governance documents
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {investorDocuments.map((doc, index) => (
                  <motion.div
                    key={doc.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{doc.name}</h3>
                        <p className="text-sm text-gray-600">{doc.size} • {doc.type}</p>
                      </div>
                      <DocumentArrowDownIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-blue-50 p-8 rounded-xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Investor Relations Contact</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Media & Press</h4>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-5 w-5 mr-2" />
                        <span>press@optibid.com</span>
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="h-5 w-5 mr-2" />
                        <span>+1 (555) 123-4567</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Investor Relations</h4>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-5 w-5 mr-2" />
                        <span>investors@optibid.com</span>
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="h-5 w-5 mr-2" />
                        <span>+1 (555) 987-6543</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl text-blue-100 mb-8">
              Get the latest investor updates and company news delivered to your inbox
            </p>
            <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <button
                type="submit"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Investor Relations</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/financials" className="hover:text-white">Financial Information</a></li>
                <li><a href="/governance" className="hover:text-white">Corporate Governance</a></li>
                <li><a href="/documents" className="hover:text-white">SEC Filings</a></li>
                <li><a href="/events" className="hover:text-white">Investor Events</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/about" className="hover:text-white">About Us</a></li>
                <li><a href="/careers" className="hover:text-white">Careers</a></li>
                <li><a href="/news" className="hover:text-white">News</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/blog" className="hover:text-white">Blog</a></li>
                <li><a href="/case-studies" className="hover:text-white">Case Studies</a></li>
                <li><a href="/whitepapers" className="hover:text-white">Whitepapers</a></li>
                <li><a href="/webinars" className="hover:text-white">Webinars</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="/compliance" className="hover:text-white">Compliance</a></li>
                <li><a href="/cookies" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 OptiBid Energy Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InvestorsPage;