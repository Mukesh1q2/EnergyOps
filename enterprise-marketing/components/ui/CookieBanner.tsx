'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, CogIcon } from '@heroicons/react/24/outline'
import { trackEvent, trackInteraction } from '@/components/providers/Analytics'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('optibid-cookie-consent')
    if (!cookieConsent) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    const consent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
    
    localStorage.setItem('optibid-cookie-consent', JSON.stringify(consent))
    setIsVisible(false)
    
    trackEvent('cookie_consent', {
      action: 'accept_all',
      timestamp: new Date().toISOString(),
    })
    trackInteraction('cookie_banner', 'accept_all')
  }

  const handleAcceptSelected = (consent: any) => {
    localStorage.setItem('optibid-cookie-consent', JSON.stringify(consent))
    setIsVisible(false)
    
    trackEvent('cookie_consent', {
      action: 'accept_selected',
      consent,
      timestamp: new Date().toISOString(),
    })
    trackInteraction('cookie_banner', 'accept_selected')
  }

  const handleRejectAll = () => {
    const consent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
    
    localStorage.setItem('optibid-cookie-consent', JSON.stringify(consent))
    setIsVisible(false)
    
    trackEvent('cookie_consent', {
      action: 'reject_all',
      timestamp: new Date().toISOString(),
    })
    trackInteraction('cookie_banner', 'reject_all')
  }

  const handleManageCookies = () => {
    setShowDetails(!showDetails)
    trackInteraction('cookie_banner', 'manage_cookies')
  }

  if (!isVisible) return null

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg"
          role="dialog"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-description"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {!showDetails ? (
              // Simple banner view
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <h3 id="cookie-banner-title" className="text-sm font-medium text-gray-900 dark:text-white">
                    We use cookies
                  </h3>
                  <p id="cookie-banner-description" className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
                    <button
                      onClick={handleManageCookies}
                      className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
                    >
                      Learn more
                    </button>
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleRejectAll}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={handleManageCookies}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <CogIcon className="h-4 w-4 mr-1" />
                    Manage
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            ) : (
              // Detailed view
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Cookie Preferences
                  </h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="Close cookie preferences"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Necessary Cookies */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Necessary</h4>
                      <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 text-xs rounded">
                        Always On
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      These cookies are essential for the website to function and cannot be disabled.
                    </p>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Analytics</h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={true}
                          className="sr-only peer"
                          id="analytics-cookies"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Help us understand how visitors interact with our website.
                    </p>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Marketing</h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={true}
                          className="sr-only peer"
                          id="marketing-cookies"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Used to track visitors across websites for advertising purposes.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={handleRejectAll}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    Reject All
                  </button>
                  
                  <button
                    onClick={() => {
                      const analytics = document.getElementById('analytics-cookies') as HTMLInputElement
                      const marketing = document.getElementById('marketing-cookies') as HTMLInputElement
                      
                      const consent = {
                        necessary: true,
                        analytics: analytics?.checked || false,
                        marketing: marketing?.checked || false,
                        timestamp: new Date().toISOString(),
                        version: '1.0'
                      }
                      
                      handleAcceptSelected(consent)
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                  >
                    Save Preferences
                  </button>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
                  <p>
                    For more information about how we use cookies, please read our{' '}
                    <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a href="/cookies" className="text-blue-600 dark:text-blue-400 hover:underline">
                      Cookie Policy
                    </a>
                    .
                  </p>
                  <p>
                    You can change your cookie preferences at any time by clicking the "Manage Cookies" button 
                    at the bottom of this page.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Privacy Link in Footer */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={handleManageCookies}
          className="p-2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 rounded-full shadow-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors duration-200"
          aria-label="Manage cookie preferences"
          title="Manage Cookie Preferences"
        >
          <CogIcon className="h-5 w-5" />
        </button>
      </div>
    </>
  )
}