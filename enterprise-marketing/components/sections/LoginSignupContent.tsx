'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  EyeIcon, 
  EyeSlashIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  KeyIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline'

interface AuthForm {
  email: string
  password: string
  confirmPassword?: string
  company: string
  firstName: string
  lastName: string
  role: string
  phone: string
}

const authMethods = [
  {
    id: 'email',
    name: 'Email & Password',
    description: 'Secure email-based authentication',
    icon: KeyIcon,
    color: 'blue'
  },
  {
    id: 'sso',
    name: 'Enterprise SSO',
    description: 'Single Sign-On with your organization',
    icon: ShieldCheckIcon,
    color: 'green'
  },
  {
    id: 'social',
    name: 'Social Login',
    description: 'Sign in with Google or Microsoft',
    icon: UserPlusIcon,
    color: 'purple'
  },
  {
    id: 'mfa',
    name: 'Multi-Factor Auth',
    description: 'Enhanced security with 2FA',
    icon: DevicePhoneMobileIcon,
    color: 'yellow'
  }
]

const roles = [
  'Energy Analyst',
  'Energy Trader',
  'Operations Manager',
  'Data Scientist',
  'Portfolio Manager',
  'Grid Operator',
  'CTO/Technical Leader',
  'Director/VP',
  'Other'
]

const colorClasses = {
  blue: 'from-blue-500 to-blue-600 border-blue-200',
  green: 'from-green-500 to-green-600 border-green-200',
  purple: 'from-purple-500 to-purple-600 border-purple-200',
  yellow: 'from-yellow-500 to-yellow-600 border-yellow-200'
}

export function LoginSignupContent() {
  const [isLogin, setIsLogin] = useState(true)
  const [selectedMethod, setSelectedMethod] = useState('email')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<AuthForm>({
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    firstName: '',
    lastName: '',
    role: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (isLogin) {
        // Login with Next.js API route
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          alert(data.detail || 'Login failed. Please check your credentials.')
          setLoading(false)
          return
        }
        
        // Store the tokens
        localStorage.setItem('optibid_access_token', data.access_token)
        if (data.refresh_token) {
          localStorage.setItem('optibid_refresh_token', data.refresh_token)
        }
        if (data.user) {
          localStorage.setItem('optibid_user', JSON.stringify(data.user))
        }
        
        // Redirect to dashboard
        window.location.href = '/dashboard'
      } else {
        // Signup - for now just show message
        alert('Signup functionality coming soon! Please use the test credentials to login.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Authentication error:', error)
      alert('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  const currentMethod = authMethods.find(m => m.id === selectedMethod)

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding & Info */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center lg:justify-start mb-6">
                <svg
                  className="h-12 w-12 text-blue-600 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                  OptiBid Energy
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                {isLogin ? 'Welcome Back' : 'Join OptiBid Energy'}
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                {isLogin 
                  ? 'Access your energy trading platform with enterprise-grade security and AI-powered insights.'
                  : 'Start your journey with advanced energy trading tools, real-time analytics, and collaborative features.'
                }
              </p>

              {/* Benefits List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center text-gray-700">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-3" />
                  <span>AI-powered energy forecasting and optimization</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-3" />
                  <span>Real-time collaboration with team members</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="h-2 w-2 rounded-full bg-purple-500 mr-3" />
                  <span>Visual knowledge graphs and advanced analytics</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="h-2 w-2 rounded-full bg-yellow-500 mr-3" />
                  <span>Enterprise security with SSO and MFA support</span>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-4 w-4 mr-1" />
                  SOC2 Compliant
                </div>
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-4 w-4 mr-1" />
                  99.9% Uptime
                </div>
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-4 w-4 mr-1" />
                  Enterprise Ready
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="lg:pl-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8"
            >
              {/* Tab Toggle */}
              <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    isLogin 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    !isLogin 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Authentication Method Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Authentication Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  {authMethods.map((method) => {
                    const Icon = method.icon
                    const isSelected = selectedMethod === method.id
                    
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? `border-blue-500 bg-blue-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                          {method.name}
                        </div>
                        <div className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                          {method.description}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* SSO Methods */}
                {selectedMethod === 'sso' && (
                  <div className="space-y-3">
                    <button
                      type="button"
                      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                      </svg>
                      Continue with Microsoft
                    </button>
                  </div>
                )}

                {/* Email/Password Form */}
                {selectedMethod === 'email' && (
                  <>
                    {/* Name fields for signup */}
                    {!isLogin && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="John"
                            required={!isLogin}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Doe"
                            required={!isLogin}
                          />
                        </div>
                      </div>
                    )}

                    {/* Company for signup */}
                    {!isLogin && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Energy Corp"
                          required={!isLogin}
                        />
                      </div>
                    )}

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="john@company.com"
                        required
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password for signup */}
                    {!isLogin && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                            placeholder="Confirm your password"
                            required={!isLogin}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showConfirmPassword ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Role for signup */}
                    {!isLogin && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Your Role
                        </label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required={!isLogin}
                        >
                          <option value="">Select your role</option>
                          {roles.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Additional signup fields */}
                    {!isLogin && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    )}

                    {/* Forgot Password Link */}
                    {isLogin && (
                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-600">Remember me</span>
                        </label>
                        <button
                          type="button"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        loading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Processing...
                        </div>
                      ) : (
                        `${isLogin ? 'Sign In' : 'Create Account'}`
                      )}
                    </button>
                  </>
                )}

                {/* Terms and Privacy for signup */}
                {!isLogin && (
                  <div className="text-xs text-gray-500">
                    By creating an account, you agree to our{' '}
                    <a href="/terms" className="text-blue-600 hover:text-blue-700">Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
                  </div>
                )}
              </form>

              {/* Social Login for Email Method */}
              {selectedMethod === 'email' && isLogin && (
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="ml-2">Google</span>
                    </button>
                    <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                      </svg>
                      <span className="ml-2">Microsoft</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MFA Setup for new accounts */}
              {!isLogin && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <ShieldCheckIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                    <div className="text-sm">
                      <h4 className="font-medium text-yellow-800 mb-1">Enhanced Security</h4>
                      <p className="text-yellow-700">
                        New accounts will be set up with Multi-Factor Authentication for enhanced security.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Additional Links */}
            <div className="mt-6 text-center text-sm text-gray-600">
              {isLogin ? (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign up for free
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>

            {/* Enterprise Login Link */}
            <div className="mt-4 text-center">
              <button className="text-sm text-gray-500 hover:text-gray-700">
                Enterprise SSO Setup
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}