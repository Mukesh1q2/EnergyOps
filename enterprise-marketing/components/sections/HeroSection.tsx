'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PlayIcon, ArrowRightIcon, ChartBarIcon, LightBulbIcon, MapIcon } from '@heroicons/react/24/outline'
import { useI18n } from '@/components/providers/I18nProvider'
import { trackEvent, trackInteraction } from '@/components/providers/Analytics'

const features = [
  {
    icon: ChartBarIcon,
    title: 'Real-time Analytics',
    description: 'Live market data and performance metrics',
  },
  {
    icon: LightBulbIcon,
    title: 'AI Optimization',
    description: 'Intelligent bidding and portfolio optimization',
  },
  {
    icon: MapIcon,
    title: 'Visual Knowledge Graphs',
    description: 'Interactive energy network visualization',
  },
]

export function HeroSection() {
  const { t } = useI18n()
  const [currentFeature, setCurrentFeature] = useState(0)

  // Auto-rotate feature highlights
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleCTAClick = (href: string, type: string) => {
    trackInteraction('hero_cta', type)
    trackEvent('conversion', {
      type,
      source: 'hero_section',
      timestamp: new Date().toISOString(),
    })
  }

  return (
    <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Content Column */}
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 mb-8"
            >
              <span className="mr-2">🚀</span>
              Enterprise Energy Trading Platform
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl"
            >
              <span className="block">{t('hero.title')}</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-3xl"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* Feature highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8"
            >
              <div className="space-y-3">
                {t('hero.features').map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    className={`flex items-center space-x-3 transition-all duration-300 ${
                      currentFeature === index
                        ? 'text-blue-600 dark:text-blue-400 scale-105'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      currentFeature === index
                        ? 'bg-blue-600 dark:bg-blue-400'
                        : 'bg-gray-400 dark:bg-gray-500'
                    }`} />
                    <span className="text-sm font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-10 space-y-4"
            >
              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/enterprise"
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-700 hover:from-purple-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  onClick={() => handleCTAClick('/enterprise', 'enterprise_cta')}
                >
                  🏢 Enterprise Demo
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                
                <Link
                  href="/signup"
                  className="inline-flex items-center px-8 py-4 border-2 border-blue-600 text-lg font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  onClick={() => handleCTAClick('/signup', 'primary_cta')}
                >
                  Start Free Trial
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </div>
              
              {/* Secondary CTA */}
              <div className="flex justify-center sm:justify-start">
                <button
                  className="inline-flex items-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  onClick={() => handleCTAClick('/demo', 'watch_demo')}
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  {t('hero.ctaSecondary')}
                </button>
              </div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Trusted by leading energy companies worldwide
              </p>
              <div className="flex items-center space-x-8 opacity-60">
                {/* Placeholder for company logos */}
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Company Logo
                </div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Company Logo
                </div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Company Logo
                </div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Company Logo
                </div>
              </div>
            </motion.div>
          </div>

          {/* Visual Column */}
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            {/* Main dashboard preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="relative mx-auto w-full rounded-lg shadow-2xl lg:max-w-md"
            >
              <div className="relative block w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    OptiBid Dashboard
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 space-y-4">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">98.5%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Grid Efficiency</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">$2.4M</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Revenue Today</div>
                    </div>
                  </div>

                  {/* Chart placeholder */}
                  <div className="bg-gray-100 dark:bg-gray-700 h-32 rounded-lg flex items-end justify-around p-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.random() * 80 + 20}%` }}
                        transition={{ duration: 0.8, delay: 1 + i * 0.1 }}
                        className="bg-gradient-to-t from-blue-500 to-blue-400 w-6 rounded-t"
                      />
                    ))}
                  </div>

                  {/* Knowledge graph preview */}
                  <div className="bg-gray-100 dark:bg-gray-700 h-24 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full absolute" style={{ top: '20%', left: '30%' }} />
                      <div className="w-2 h-2 bg-green-500 rounded-full absolute" style={{ top: '60%', left: '20%' }} />
                      <div className="w-4 h-4 bg-orange-500 rounded-full absolute" style={{ top: '40%', left: '70%' }} />
                      <div className="w-2 h-2 bg-purple-500 rounded-full absolute" style={{ top: '70%', left: '60%' }} />
                      {/* Connection lines */}
                      <svg className="absolute inset-0 w-full h-full">
                        <line x1="30%" y1="20%" x2="20%" y2="60%" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" />
                        <line x1="70%" y1="40%" x2="60%" y2="70%" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold text-xs">+15%</span>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <ChartBarIcon className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>

            {/* Background decorative elements */}
            <div className="absolute inset-y-0 right-0 w-20 h-full bg-gradient-to-l from-blue-500/10 to-transparent rounded-l-full"></div>
            <div className="absolute top-1/2 -right-16 w-32 h-32 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  )
}