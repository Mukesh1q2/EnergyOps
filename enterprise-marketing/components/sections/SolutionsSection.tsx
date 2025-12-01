'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  BoltIcon,
  CpuChipIcon,
  PowerIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { useI18n } from '@/components/providers/I18nProvider'
import { trackInteraction } from '@/components/providers/Analytics'

const solutions = [
  {
    id: 'analyst',
    translationKey: 'analyst',
    icon: ChartBarIcon,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    hoverGradient: 'hover:from-blue-600 hover:to-cyan-600',
  },
  {
    id: 'trader',
    translationKey: 'trader',
    icon: CurrencyDollarIcon,
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    hoverGradient: 'hover:from-green-600 hover:to-emerald-600',
  },
  {
    id: 'producer',
    translationKey: 'producer',
    icon: BoltIcon,
    gradient: 'from-yellow-500 to-orange-500',
    bgGradient: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    hoverGradient: 'hover:from-yellow-600 hover:to-orange-600',
  },
  {
    id: 'grid-ops',
    translationKey: 'gridOps',
    icon: CpuChipIcon,
    gradient: 'from-purple-500 to-indigo-500',
    bgGradient: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    hoverGradient: 'hover:from-purple-600 hover:to-indigo-600',
  },
  {
    id: 'storage',
    translationKey: 'storage',
    icon: PowerIcon,
    gradient: 'from-pink-500 to-rose-500',
    bgGradient: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
    borderColor: 'border-pink-200 dark:border-pink-800',
    hoverGradient: 'hover:from-pink-600 hover:to-rose-600',
  },
]

export function SolutionsSection() {
  const { t } = useI18n()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const handleCardInteraction = (solutionId: string, action: string) => {
    trackInteraction('solution_card', `${action}_${solutionId}`)
  }

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
          >
            {t('solutions.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Tailored solutions designed specifically for different roles in the energy ecosystem
          </motion.p>
        </div>

        {/* Solutions Grid */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {solutions.map((solution, index) => {
              const solutionData = t(`solutions.${solution.translationKey}`) as any
              const Icon = solution.icon

              return (
                <motion.div
                  key={solution.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative"
                  onMouseEnter={() => setHoveredCard(solution.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div
                    className={`
                      relative h-full p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer
                      ${solution.borderColor}
                      ${solution.bgGradient}
                      ${hoveredCard === solution.id ? 'scale-105 shadow-2xl' : 'shadow-lg hover:shadow-xl'}
                      dark:bg-opacity-50
                    `}
                    onClick={() => handleCardInteraction(solution.id, 'click')}
                  >
                    {/* Icon */}
                    <div
                      className={`
                        inline-flex p-3 rounded-lg bg-gradient-to-r ${solution.gradient} text-white mb-6
                        transition-all duration-300
                        ${hoveredCard === solution.id ? 'scale-110' : ''}
                      `}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {solutionData?.title || 'Solution'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      {solutionData?.description || 'Advanced solution for energy professionals'}
                    </p>

                    {/* Features List */}
                    <ul className="space-y-2 mb-8">
                      {solutionData?.features?.map((feature: string, featureIndex: number) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: (index * 0.1) + (featureIndex * 0.05) }}
                          viewport={{ once: true }}
                          className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                        >
                          <div
                            className={`
                              w-1.5 h-1.5 rounded-full mr-3 bg-gradient-to-r ${solution.gradient}
                              transition-transform duration-300
                              ${hoveredCard === solution.id ? 'scale-125' : ''}
                            `}
                          />
                          {feature}
                        </motion.li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link
                      href={`/solutions/${solution.id}`}
                      className={`
                        inline-flex items-center text-sm font-medium
                        bg-gradient-to-r ${solution.gradient} bg-clip-text text-transparent
                        hover:scale-105 transition-all duration-200
                        group-hover:translate-x-1
                      `}
                      onClick={() => handleCardInteraction(solution.id, 'learn_more')}
                    >
                      Learn more
                      <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>

                    {/* Hover Effect Background */}
                    <div
                      className={`
                        absolute inset-0 rounded-2xl bg-gradient-to-r ${solution.gradient} opacity-0
                        transition-opacity duration-300 -z-10
                        ${hoveredCard === solution.id ? 'opacity-5' : ''}
                      `}
                    />

                    {/* Animated Border */}
                    <motion.div
                      className={`
                        absolute inset-0 rounded-2xl border-2 border-transparent
                        bg-gradient-to-r ${solution.gradient} opacity-0
                        transition-opacity duration-300 -z-10
                      `}
                      animate={{
                        opacity: hoveredCard === solution.id ? 0.3 : 0,
                      }}
                      style={{
                        background: 'linear-gradient(white, white) padding-box, linear-gradient(45deg, transparent, transparent) border-box',
                        border: '2px solid transparent',
                      }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-300 mr-4">
              Need a custom solution?
            </span>
            <Link
              href="/contact"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
              onClick={() => handleCardInteraction('custom', 'contact')}
            >
              Contact Sales
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute left-0 right-0 -z-10">
        <div className="absolute left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      </div>
    </section>
  )
}