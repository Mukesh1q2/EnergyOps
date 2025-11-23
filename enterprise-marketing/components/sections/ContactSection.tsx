'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  ClockIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

interface ContactForm {
  name: string
  email: string
  company: string
  role: string
  phone: string
  inquiryType: 'demo' | 'sales' | 'support' | 'partnership' | 'general'
  message: string
  useCase: string
  timeline: string
  employees: string
}

const inquiryTypes = {
  demo: { name: 'Request Demo', icon: UserGroupIcon, color: 'blue' },
  sales: { name: 'Sales Inquiry', icon: BuildingOfficeIcon, color: 'green' },
  support: { name: 'Technical Support', icon: ChatBubbleLeftRightIcon, color: 'purple' },
  partnership: { name: 'Partnership', icon: UserGroupIcon, color: 'yellow' },
  general: { name: 'General Inquiry', icon: EnvelopeIcon, color: 'gray' }
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  yellow: 'from-yellow-500 to-yellow-600',
  gray: 'from-gray-500 to-gray-600'
}

export function ContactSection() {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    company: '',
    role: '',
    phone: '',
    inquiryType: 'demo',
    message: '',
    useCase: '',
    timeline: '',
    employees: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setSubmitted(true)
  }

  const currentInquiryType = inquiryTypes[formData.inquiryType]

  if (submitted) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">Thank you for your inquiry!</h2>
            <p className="text-green-700 mb-6">
              We've received your {currentInquiryType.name.toLowerCase()} request and will get back to you within 24 hours.
            </p>
            <button 
              onClick={() => setSubmitted(false)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to transform your energy trading? Contact our team for personalized demos, 
            enterprise solutions, or technical support.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <EnvelopeIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600">hello@optibid-energy.com</p>
                    <p className="text-gray-600">support@optibid-energy.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <PhoneIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Phone</h3>
                    <p className="text-gray-600">+91 (0) 11 4567 8900</p>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <MapPinIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Headquarters</h3>
                    <p className="text-gray-600">
                      Cyber City, Gurugram<br />
                      Haryana, India 122002
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Business Hours</h3>
                    <p className="text-gray-600">
                      Mon - Fri: 9:00 AM - 6:00 PM IST<br />
                      Enterprise Support: 24/7
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Contact Cards */}
              <div className="mt-8 space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Need a Demo?</h3>
                  <p className="text-blue-700 text-sm mb-3">
                    Schedule a personalized demo tailored to your energy trading needs.
                  </p>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Schedule Demo →
                  </button>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Enterprise Sales</h3>
                  <p className="text-green-700 text-sm mb-3">
                    Custom solutions for large organizations and government agencies.
                  </p>
                  <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                    Contact Sales →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[currentInquiryType.color as keyof typeof colorClasses]} mr-4`}>
                  <currentInquiryType.icon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{currentInquiryType.name}</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Inquiry Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What can we help you with?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(inquiryTypes).map(([key, type]) => {
                      const Icon = type.icon
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, inquiryType: key as ContactForm['inquiryType'] }))}
                          className={`p-3 rounded-lg border-2 text-left transition-colors ${
                            formData.inquiryType === key
                              ? `border-blue-500 bg-blue-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`h-5 w-5 mb-2 ${formData.inquiryType === key ? 'text-blue-600' : 'text-gray-400'}`} />
                          <div className={`text-sm font-medium ${formData.inquiryType === key ? 'text-blue-900' : 'text-gray-900'}`}>
                            {type.name}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="john@company.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Company *
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      required
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Energy Corp"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select your role</option>
                      <option value="analyst">Energy Analyst</option>
                      <option value="trader">Energy Trader</option>
                      <option value="manager">Operations Manager</option>
                      <option value="director">Director/VP</option>
                      <option value="cto">CTO/Technical Leader</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label htmlFor="employees" className="block text-sm font-medium text-gray-700 mb-2">
                      Company Size
                    </label>
                    <select
                      id="employees"
                      name="employees"
                      value={formData.employees}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select company size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-1000">201-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  </div>
                </div>

                {/* Use Case */}
                <div>
                  <label htmlFor="useCase" className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Use Case
                  </label>
                  <select
                    id="useCase"
                    name="useCase"
                    value={formData.useCase}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select your primary use case</option>
                    <option value="market-analysis">Market Analysis & Forecasting</option>
                    <option value="trading-optimization">Trading & Bidding Optimization</option>
                    <option value="grid-operations">Grid Operations & Monitoring</option>
                    <option value="storage-optimization">Energy Storage Optimization</option>
                    <option value="compliance-reporting">Compliance & Reporting</option>
                    <option value="research-development">Research & Development</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Timeline */}
                <div>
                  <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                    Timeline
                  </label>
                  <select
                    id="timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">When do you need this?</option>
                    <option value="immediately">Immediately</option>
                    <option value="this-month">This month</option>
                    <option value="next-quarter">Next quarter</option>
                    <option value="next-year">Next year</option>
                    <option value="exploring">Just exploring options</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell us more about your specific needs, current challenges, or questions..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-lg font-medium transition-colors ${
                    isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Sending...
                    </div>
                  ) : (
                    `Send ${currentInquiryType.name}`
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Additional Contact Options */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-blue-900 mb-2">Live Chat</h3>
            <p className="text-blue-700 text-sm mb-4">Get instant help from our support team</p>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Start Chat →
            </button>
          </div>
          
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <PhoneIcon className="h-8 w-8 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-green-900 mb-2">Phone Support</h3>
            <p className="text-green-700 text-sm mb-4">Call us for immediate assistance</p>
            <button className="text-green-600 hover:text-green-700 font-medium text-sm">
              Call Now →
            </button>
          </div>
          
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <UserGroupIcon className="h-8 w-8 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-purple-900 mb-2">Schedule Call</h3>
            <p className="text-purple-700 text-sm mb-4">Book a time that works for you</p>
            <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
              Book Meeting →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}