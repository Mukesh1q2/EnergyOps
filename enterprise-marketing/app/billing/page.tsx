'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CreditCardIcon,
  DocumentArrowDownIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ClockIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const BillingPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  const currentPlan = {
    name: 'Enterprise',
    price: billingPeriod === 'monthly' ? 299 : 2990,
    period: billingPeriod === 'monthly' ? 'month' : 'year',
    currency: 'USD',
    billing: billingPeriod,
    features: [
      'Unlimited API calls',
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
      'White-label options',
      'Dedicated account manager'
    ],
    limits: {
      apiCalls: 'Unlimited',
      storage: '1TB',
      users: '50 users',
      support: '24/7 Priority'
    }
  };

  const upcomingInvoice = {
    amount: 2990,
    dueDate: '2025-01-02',
    status: 'Upcoming',
    period: 'Jan 2025 - Dec 2025',
    description: 'Enterprise Plan - Annual'
  };

  const paymentMethod = {
    type: 'Visa',
    last4: '4242',
    expiry: '12/26',
    name: user?.firstName + ' ' + user?.lastName,
    isPrimary: true
  };

  const invoices = [
    { id: 'INV-001', date: '2024-12-02', amount: 2990, status: 'Paid', period: 'Dec 2024' },
    { id: 'INV-002', date: '2024-11-02', amount: 2990, status: 'Paid', period: 'Nov 2024' },
    { id: 'INV-003', date: '2024-10-02', amount: 2990, status: 'Paid', period: 'Oct 2024' },
    { id: 'INV-004', date: '2024-09-02', amount: 2990, status: 'Paid', period: 'Sep 2024' },
    { id: 'INV-005', date: '2024-08-02', amount: 2990, status: 'Paid', period: 'Aug 2024' },
  ];

  const usage = {
    apiCalls: { used: 45672, limit: 100000, percentage: 45.7 },
    storage: { used: 234, limit: 1000, percentage: 23.4 },
    users: { used: 28, limit: 50, percentage: 56.0 },
    support: { used: 12, limit: 'Unlimited', percentage: 0 }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'plan', name: 'Current Plan', icon: CreditCardIcon },
    { id: 'usage', name: 'Usage', icon: ArrowUpIcon },
    { id: 'payment', name: 'Payment Methods', icon: ShieldCheckIcon },
    { id: 'invoices', name: 'Invoices', icon: DocumentArrowDownIcon }
  ];

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUsageBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
                ← Back to Dashboard
              </Link>
              <span className="ml-4 text-gray-400">|</span>
              <h1 className="ml-4 text-lg font-semibold text-gray-900">Billing & Subscriptions</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <BellIcon className="h-4 w-4 mr-2" />
                Billing Alerts
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <PlusIcon className="h-4 w-4 mr-2" />
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Billing Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing Overview</h1>
              <p className="text-lg text-gray-600">
                Manage your subscription, payment methods, and billing history
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">$2,990</div>
                <div className="text-sm text-gray-600">Annual Spend</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{upcomingInvoice.amount}</div>
                <div className="text-sm text-gray-600">Next Invoice</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{invoices.length}</div>
                <div className="text-sm text-gray-600">Total Invoices</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Current Plan */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">Current Plan</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        ${currentPlan.price}
                        <span className="text-lg font-normal text-gray-600">/{currentPlan.period}</span>
                      </div>
                      <p className="text-gray-600">{currentPlan.name} Plan</p>
                    </div>
                    <div className="space-y-2">
                      {currentPlan.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700">
                          <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Manage Plan
                    </button>
                  </div>

                  {/* Upcoming Invoice */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">Next Invoice</h3>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        {upcomingInvoice.status}
                      </span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        ${upcomingInvoice.amount.toLocaleString()}
                      </div>
                      <p className="text-gray-600">{upcomingInvoice.description}</p>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <CalendarDaysIcon className="h-4 w-4 mr-2" />
                      Due: {upcomingInvoice.dueDate}
                    </div>
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                      Pay Now
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">99.9%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">24/7</div>
                    <div className="text-sm text-gray-600">Support</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">1TB</div>
                    <div className="text-sm text-gray-600">Storage</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">Unlimited</div>
                    <div className="text-sm text-gray-600">API Calls</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Plan Tab */}
            {activeTab === 'plan' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Billing Period</h3>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setBillingPeriod('monthly')}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        billingPeriod === 'monthly'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingPeriod('yearly')}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors relative ${
                        billingPeriod === 'yearly'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Yearly
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Save 17%
                      </span>
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Current Plan</h3>
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      ${currentPlan.price}
                      <span className="text-xl font-normal text-gray-600">/{currentPlan.period}</span>
                    </div>
                    <p className="text-gray-600">Billed {billingPeriod === 'monthly' ? 'monthly' : 'annually'}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Plan Features</h4>
                      <ul className="space-y-3">
                        {currentPlan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-gray-700">
                            <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Usage Limits</h4>
                      <ul className="space-y-3">
                        <li className="flex justify-between">
                          <span className="text-gray-600">API Calls</span>
                          <span className="font-medium">{currentPlan.limits.apiCalls}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Storage</span>
                          <span className="font-medium">{currentPlan.limits.storage}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Users</span>
                          <span className="font-medium">{currentPlan.limits.users}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Support</span>
                          <span className="font-medium">{currentPlan.limits.support}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Upgrade Plan
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                      Downgrade Plan
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Usage Tab */}
            {activeTab === 'usage' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Current Usage</h3>
                  <div className="space-y-6">
                    {Object.entries(usage).map(([key, data]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-gray-900 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">
                              {data.used.toLocaleString()}{typeof data.limit === 'number' ? '' : ''} / {data.limit}
                            </div>
                            <div className={`text-sm ${getUsageColor(data.percentage)}`}>
                              {data.percentage}% used
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${getUsageBarColor(data.percentage)}`}
                            style={{ width: `${Math.min(data.percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Usage Alert</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        You're approaching your user limit. Consider upgrading your plan if you need more team members.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Methods</h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">VISA</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">•••• •••• •••• {paymentMethod.last4}</div>
                          <div className="text-sm text-gray-600">
                            Expires {paymentMethod.expiry} • {paymentMethod.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                          Primary
                        </span>
                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-700 font-medium">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <button className="mt-4 flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Billing Address</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <p className="text-gray-900">Energy Corp India</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                        <p className="text-gray-900">29ABCDE1234F1Z5</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <p className="text-gray-900">123 Business District<br />New Delhi, India 110001</p>
                      </div>
                    </div>
                    <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium">
                      Update Billing Address
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Invoice History</h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invoice
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {invoices.map((invoice) => (
                          <tr key={invoice.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {invoice.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {invoice.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ${invoice.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                {invoice.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-700 mr-4">
                                Download
                              </button>
                              <button className="text-gray-600 hover:text-gray-700">
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Showing 5 of {invoices.length} invoices
                  </p>
                  <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Download All
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;