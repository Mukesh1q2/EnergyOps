'use client'

import { useState } from 'react'
import { CheckIcon, XMarkIcon, StarIcon } from '@heroicons/react/24/outline'
import { CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid'

interface PricingFeature {
  name: string
  free: boolean | string
  starter: boolean | string
  professional: boolean | string
  enterprise: boolean | string
  description?: string
}

const pricingFeatures: PricingFeature[] = [
  {
    name: 'Energy Dashboard',
    free: true,
    starter: true,
    professional: true,
    enterprise: true,
    description: 'Core dashboard with real-time energy data visualization'
  },
  {
    name: 'Historical Data Access',
    free: '7 days',
    starter: '1 year',
    professional: '5 years',
    enterprise: 'Unlimited',
    description: 'Access to historical energy market data'
  },
  {
    name: 'AI Forecasting',
    free: 'Basic',
    starter: 'Standard',
    professional: 'Advanced',
    enterprise: 'Custom Models',
    description: 'AI-powered energy demand and price forecasting'
  },
  {
    name: 'Visual Knowledge Graphs',
    free: false,
    starter: 'Limited',
    professional: 'Full',
    enterprise: 'Advanced',
    description: 'Interactive node/edge graphs with clustering'
  },
  {
    name: 'Real-time Collaboration',
    free: false,
    starter: '2 users',
    professional: '10 users',
    enterprise: 'Unlimited',
    description: 'Live team collaboration with presence indicators'
  },
  {
    name: 'Advanced Analytics',
    free: 'Basic',
    starter: 'Standard',
    professional: 'Advanced',
    enterprise: 'Custom',
    description: 'Custom KPI calculations and benchmarking'
  },
  {
    name: 'API Access',
    free: 'Limited',
    starter: 'Standard',
    professional: 'Advanced',
    enterprise: 'Enterprise',
    description: 'RESTful API endpoints for integration'
  },
  {
    name: 'SSO Integration',
    free: false,
    starter: false,
    professional: true,
    enterprise: true,
    description: 'Single Sign-On with SAML 2.0 & OIDC'
  },
  {
    name: 'Multi-factor Authentication',
    free: false,
    starter: true,
    professional: true,
    enterprise: true,
    description: 'Enhanced security with TOTP & SMS MFA'
  },
  {
    name: 'Data Export',
    free: 'CSV only',
    starter: 'CSV, Excel',
    professional: 'All formats',
    enterprise: 'All + Custom',
    description: 'Export data in multiple formats'
  },
  {
    name: 'Support Level',
    free: 'Community',
    starter: 'Email',
    professional: '24x5',
    enterprise: '24x7 + Dedicated',
    description: 'Technical support and assistance'
  },
  {
    name: 'SLA Guarantee',
    free: false,
    starter: '99%',
    professional: '99.5%',
    enterprise: '99.9%',
    description: 'Service Level Agreement uptime guarantee'
  },
  {
    name: 'On-premise Deployment',
    free: false,
    starter: false,
    professional: false,
    enterprise: true,
    description: 'Private cloud and on-premise deployment options'
  },
  {
    name: 'Custom Integrations',
    free: false,
    starter: false,
    professional: false,
    enterprise: true,
    description: 'Custom integrations and workflow automation'
  },
  {
    name: 'Compliance Features',
    free: false,
    starter: false,
    professional: 'Basic',
    enterprise: 'Full',
    description: 'SOC2, ISO27001, GDPR compliance tools'
  }
]

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set(['Energy Dashboard', 'AI Forecasting']))

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for development and evaluation',
      price: { monthly: 0, annual: 0 },
      popular: false,
      features: pricingFeatures.map(f => f.free),
      cta: 'Start Free',
      ctaDisabled: false
    },
    {
      name: 'Starter',
      description: 'Ideal for small teams and startups',
      price: { monthly: 299, annual: 239 },
      popular: false,
      features: pricingFeatures.map(f => f.starter),
      cta: 'Get Started',
      ctaDisabled: false
    },
    {
      name: 'Professional',
      description: 'Advanced features for growing businesses',
      price: { monthly: 899, annual: 719 },
      popular: true,
      features: pricingFeatures.map(f => f.professional),
      cta: 'Start Trial',
      ctaDisabled: false
    },
    {
      name: 'Enterprise',
      description: 'Custom solutions for large organizations',
      price: { monthly: 'Custom', annual: 'Custom' },
      popular: false,
      features: pricingFeatures.map(f => f.enterprise),
      cta: 'Contact Sales',
      ctaDisabled: false
    }
  ]

  const formatPrice = (price: number | string) => {
    if (typeof price === 'string') return price
    return `$${price.toLocaleString()}`
  }

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckIconSolid className="h-5 w-5 text-green-500" />
      ) : (
        <XMarkIcon className="h-5 w-5 text-gray-300" />
      )
    }
    return <span className="text-sm text-gray-600">{value}</span>
  }

  const toggleFeature = (featureName: string) => {
    const newFeatures = new Set(selectedFeatures)
    if (newFeatures.has(featureName)) {
      newFeatures.delete(featureName)
    } else {
      newFeatures.add(featureName)
    }
    setSelectedFeatures(newFeatures)
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Energy Trading Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            From free development tier to enterprise solutions with advanced AI, SSO, and compliance features.
            All plans include real-time data and core trading capabilities.
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex bg-gray-100 rounded-lg p-1 mb-12">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all duration-200 hover:shadow-lg ${
                plan.popular
                  ? 'border-blue-500 scale-105'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <StarIcon className="h-4 w-4 mr-1" />
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(plan.price[billingCycle])}
                  </span>
                  {typeof plan.price[billingCycle] === 'number' && (
                    <span className="text-gray-500 ml-1">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  )}
                </div>
                
                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } ${plan.ctaDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={plan.ctaDisabled}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Feature Comparison</h2>
            <p className="text-gray-600 mt-1">Toggle features to see plan compatibility</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                    Feature
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.name} className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pricingFeatures.map((feature, index) => (
                  <tr key={feature.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <button
                          onClick={() => toggleFeature(feature.name)}
                          className={`w-4 h-4 rounded border-2 mr-3 mt-0.5 flex items-center justify-center ${
                            selectedFeatures.has(feature.name)
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300 hover:border-blue-300'
                          }`}
                        >
                          {selectedFeatures.has(feature.name) && (
                            <CheckIconSolid className="h-3 w-3 text-white" />
                          )}
                        </button>
                        <div>
                          <div className="font-medium text-gray-900">{feature.name}</div>
                          {feature.description && (
                            <div className="text-sm text-gray-500">{feature.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan.name} className="px-6 py-4 text-center">
                        {renderFeatureValue(feature[plan.name.toLowerCase() as keyof PricingFeature])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Need a Custom Solution?</h2>
            <p className="text-xl mb-6 opacity-90">
              Enterprise customers get dedicated support, custom integrations, and on-premise deployment options.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Contact Enterprise Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}