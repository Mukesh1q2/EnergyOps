'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cog6ToothIcon,
  XMarkIcon,
  CheckIcon,
  XMarkIcon as DisabledIcon,
  InformationCircleIcon,
  TagIcon,
  UserGroupIcon,
  ChartBarIcon,
  CubeIcon,
  BoltIcon,
  CurrencyDollarIcon,
  MapIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  CodeBracketIcon,
  LockClosedIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import { Dialog, Transition, Tab, Switch } from '@headlessui/react'
import { Fragment } from 'react'
import { clsx } from 'clsx'
import { featureFlagService } from '@/lib/feature-flags/FeatureFlagService'
import { COMPLETE_FEATURE_CATALOG, FEATURE_CATEGORIES } from '@/lib/feature-flags/FeatureCatalog'
import type { FeatureDefinition } from '@/lib/feature-flags/FeatureFlagService'

/**
 * Hook to isolate scroll events within a container, preventing propagation
 * to parent components. This prevents modal scroll from triggering
 * unintended state mutations in the dashboard.
 * Validates: Requirements 2.3, 2.4
 */
function useScrollIsolation(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const container = ref.current
    if (!container) return

    const handleScroll = (e: Event) => {
      e.stopPropagation()
    }

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation()
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.stopPropagation()
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    container.addEventListener('wheel', handleWheel, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('touchmove', handleTouchMove)
    }
  }, [ref])
}

interface FeatureSettingsProps {
  isOpen: boolean
  onClose: () => void
  organizationId: string
  userId: string
  onFeaturesUpdated?: () => void
}

const CATEGORY_ICONS: Record<string, any> = {
  dashboard_core: Cog6ToothIcon,
  visualization: ChartBarIcon,
  analytics: ChartBarIcon,
  ai_ml: CubeIcon,
  collaboration: UserGroupIcon,
  energy_specific: BoltIcon,
  financial: CurrencyDollarIcon,
  geographic: MapIcon,
  compliance: ShieldCheckIcon,
  mobile: DevicePhoneMobileIcon,
  api_integration: CodeBracketIcon,
  security: LockClosedIcon,
  admin: WrenchScrewdriverIcon
}

const TIER_COLORS = {
  starter: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  professional: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  enterprise: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
}

const COMPLEXITY_COLORS = {
  simple: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  complex: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

export function FeatureSettings({
  isOpen,
  onClose,
  organizationId,
  userId,
  onFeaturesUpdated
}: FeatureSettingsProps) {
  // Ref for scroll isolation - prevents scroll events from propagating to parent
  // Validates: Requirements 2.3, 2.4
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  useScrollIsolation(scrollContainerRef)
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [features, setFeatures] = useState<FeatureDefinition[]>([])
  const [orgSettings, setOrgSettings] = useState<Map<string, { enabled: boolean; config: any }>>(new Map())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Map<string, string[]>>(new Map())
  const [validationWarnings, setValidationWarnings] = useState<Map<string, string[]>>(new Map())

  useEffect(() => {
    if (isOpen) {
      loadFeatures()
    }
  }, [isOpen, organizationId])

  const loadFeatures = async () => {
    try {
      // Load all features from catalog
      const allFeatures = COMPLETE_FEATURE_CATALOG
      
      // Load current organization settings
      const settings = new Map<string, { enabled: boolean; config: any }>()
      
      for (const feature of allFeatures) {
        if (feature.is_active) {
          const isEnabled = await featureFlagService.isFeatureEnabled(organizationId, feature.id)
          const config = await featureFlagService.getFeatureConfiguration(organizationId, feature.id)
          settings.set(feature.id, { enabled: isEnabled, config })
        }
      }
      
      setFeatures(allFeatures.filter(f => f.is_active))
      setOrgSettings(settings)
    } catch (error) {
      console.error('Error loading features:', error)
    }
  }

  /**
   * Handle individual feature toggle with persistence
   * Validates: Requirements 5.1, 5.2, 5.5
   * - Ensures featureFlagService.setFeatureEnabled() is called and awaited
   * - Updates local state only after successful API response
   * - Checks dependencies before enabling features
   * - Displays warnings if dependencies not met
   */
  const handleFeatureToggle = async (featureId: string, enabled: boolean) => {
    try {
      // First, validate the feature change including dependencies
      // Validates: Requirements 5.5
      const validation = await featureFlagService.validateFeatureChange(
        organizationId, 
        featureId, 
        enabled
      )
      
      // Handle validation errors - block the toggle
      if (!validation.valid) {
        setValidationErrors(prev => {
          const errors = new Map(prev)
          errors.set(featureId, validation.errors)
          return errors
        })
        return
      }
      
      // Handle validation warnings - show but allow toggle
      // Validates: Requirements 5.5
      if (validation.warnings && validation.warnings.length > 0) {
        setValidationWarnings(prev => {
          const warnings = new Map(prev)
          warnings.set(featureId, validation.warnings)
          return warnings
        })
      } else {
        // Clear warnings if none
        setValidationWarnings(prev => {
          const warnings = new Map(prev)
          warnings.delete(featureId)
          return warnings
        })
      }
      
      // Clear any existing errors
      setValidationErrors(prev => {
        const errors = new Map(prev)
        errors.delete(featureId)
        return errors
      })
      
      const current = orgSettings.get(featureId) || { enabled: false, config: {} }
      
      // Persist to backend FIRST, then update local state
      // Validates: Requirements 5.1, 5.2
      await featureFlagService.setFeatureEnabled(
        organizationId,
        featureId,
        enabled,
        current.config,
        userId
      )
      
      // Only update local state after successful API response
      const newSettings = new Map(orgSettings)
      newSettings.set(featureId, { ...current, enabled })
      setOrgSettings(newSettings)
      
    } catch (error) {
      console.error('Error toggling feature:', error)
      // Show error to user
      setValidationErrors(prev => {
        const errors = new Map(prev)
        errors.set(featureId, ['Failed to save feature toggle. Please try again.'])
        return errors
      })
    }
  }

  const handleBulkToggle = async (enabled: boolean) => {
    try {
      setIsSaving(true)
      
      const bulkFeatures: Record<string, { enabled: boolean; configuration?: any }> = {}
      
      for (const featureId of selectedFeatures) {
        bulkFeatures[featureId] = { enabled }
      }
      
      await featureFlagService.setBulkFeatures(organizationId, bulkFeatures, userId)
      
      // Update local state
      const newSettings = new Map(orgSettings)
      for (const [featureId, settings] of newSettings.entries()) {
        if (selectedFeatures.has(featureId)) {
          newSettings.set(featureId, { ...settings, enabled })
        }
      }
      setOrgSettings(newSettings)
      setSelectedFeatures(new Set())
      
      onFeaturesUpdated?.()
    } catch (error) {
      console.error('Error bulk toggling features:', error)
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Handle bulk save of all feature changes
   * Validates: Requirements 5.4
   * - Ensures setBulkFeatures() is properly awaited
   * - Implements atomic save (all or nothing)
   */
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)
      
      // Clear any previous validation errors before attempting save
      setValidationErrors(new Map())
      
      const bulkFeatures: Record<string, { enabled: boolean; configuration?: any }> = {}
      
      // Validate all features before saving (atomic validation)
      // Validates: Requirements 5.4, 5.5
      const validationErrors: Map<string, string[]> = new Map()
      
      for (const [featureId, settings] of orgSettings.entries()) {
        // Check dependencies for enabled features
        if (settings.enabled) {
          const feature = features.find(f => f.id === featureId)
          if (feature && feature.dependencies.length > 0) {
            const unmetDependencies = feature.dependencies.filter(depId => {
              const depSettings = orgSettings.get(depId)
              return !depSettings?.enabled
            })
            
            if (unmetDependencies.length > 0) {
              const depNames = unmetDependencies.map(depId => {
                const dep = features.find(f => f.id === depId)
                return dep?.name || depId
              })
              validationErrors.set(featureId, [`Required dependencies not enabled: ${depNames.join(', ')}`])
            }
          }
        }
        
        bulkFeatures[featureId] = { 
          enabled: settings.enabled, 
          configuration: settings.config 
        }
      }
      
      // If any validation errors, abort the entire save (atomic - all or nothing)
      if (validationErrors.size > 0) {
        setValidationErrors(validationErrors)
        return
      }
      
      // Perform atomic bulk save - all features saved together
      // Validates: Requirements 5.4
      await featureFlagService.setBulkFeatures(organizationId, bulkFeatures, userId)
      
      // Only notify parent after successful save
      onFeaturesUpdated?.()
      
    } catch (error) {
      console.error('Error saving features:', error)
      // Show generic error for bulk save failure
      setValidationErrors(new Map([
        ['_bulk_save', ['Failed to save feature changes. Please try again.']]
      ]))
    } finally {
      setIsSaving(false)
    }
  }

  const handleTemplateApply = async (templateId: string) => {
    try {
      setIsSaving(true)
      await featureFlagService.applyTemplate(organizationId, templateId, userId)
      await loadFeatures() // Reload to get updated settings
      setShowTemplates(false)
      onFeaturesUpdated?.()
    } catch (error) {
      console.error('Error applying template:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const filteredFeatures = features.filter(feature => {
    const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const FeatureCard = ({ feature }: { feature: FeatureDefinition }) => {
    const settings = orgSettings.get(feature.id) || { enabled: false, config: {} }
    const errors = validationErrors.get(feature.id) || []
    const warnings = validationWarnings.get(feature.id) || []
    const isSelected = selectedFeatures.has(feature.id)
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={clsx(
          'bg-white dark:bg-gray-800 border rounded-lg p-6 transition-all',
          isSelected 
            ? 'border-blue-500 shadow-md' 
            : 'border-gray-200 dark:border-gray-700',
          errors.length > 0 && 'border-red-300 dark:border-red-700',
          warnings.length > 0 && errors.length === 0 && 'border-yellow-300 dark:border-yellow-700'
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedFeatures(prev => new Set([...prev, feature.id]))
                } else {
                  setSelectedFeatures(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(feature.id)
                    return newSet
                  })
                }
              }}
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {React.createElement(CATEGORY_ICONS[feature.category] || CubeIcon, {
                  className: "h-5 w-5 text-blue-500"
                })}
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {feature.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {feature.description}
              </p>
            </div>
          </div>
          
          <Switch
            checked={settings.enabled}
            onChange={(enabled) => handleFeatureToggle(feature.id, enabled)}
            className={clsx(
              settings.enabled
                ? 'bg-blue-600'
                : 'bg-gray-200 dark:bg-gray-700',
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            )}
          >
            <span
              className={clsx(
                settings.enabled ? 'translate-x-5' : 'translate-x-0',
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
              )}
            />
          </Switch>
        </div>

        {/* Feature metadata */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={clsx(
            'px-2 py-1 text-xs rounded-full font-medium',
            TIER_COLORS[feature.tiers[0] as keyof typeof TIER_COLORS]
          )}>
            {feature.tiers[0]}
          </span>
          <span className={clsx(
            'px-2 py-1 text-xs rounded-full font-medium',
            COMPLEXITY_COLORS[feature.metadata.complexity]
          )}>
            {feature.metadata.complexity}
          </span>
          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
            {FEATURE_CATEGORIES[feature.category]}
          </span>
        </div>

        {/* Validation errors */}
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <XMarkIcon className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Validation Error
                </h4>
                <ul className="text-sm text-red-600 dark:text-red-300 mt-1 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Validation warnings - Validates: Requirements 5.5 */}
        {warnings.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <InformationCircleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Warning
                </h4>
                <ul className="text-sm text-yellow-600 dark:text-yellow-300 mt-1 space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Feature details */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          {feature.dependencies.length > 0 && (
            <div>
              <strong>Dependencies:</strong> {feature.dependencies.join(', ')}
            </div>
          )}
          {feature.conflicts.length > 0 && (
            <div>
              <strong>Conflicts:</strong> {feature.conflicts.join(', ')}
            </div>
          )}
          <div>
            <strong>Cost Impact:</strong> {feature.metadata.cost_impact} | 
            <strong> Performance:</strong> {feature.metadata.performance_impact}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-7xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                      Feature Settings
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Customize your dashboard by enabling/disabling features
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Controls */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setShowTemplates(true)}
                        className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
                      >
                        Apply Template
                      </button>
                      {selectedFeatures.size > 0 && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedFeatures.size} selected
                          </span>
                          <button
                            onClick={() => handleBulkToggle(true)}
                            disabled={isSaving}
                            className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded hover:bg-green-200 disabled:opacity-50"
                          >
                            Enable All
                          </button>
                          <button
                            onClick={() => handleBulkToggle(false)}
                            disabled={isSaving}
                            className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 disabled:opacity-50"
                          >
                            Disable All
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>

                  {/* Bulk save error display */}
                  {validationErrors.has('_bulk_save') && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <XMarkIcon className="h-5 w-5 text-red-500" />
                        <span className="text-sm text-red-600 dark:text-red-300">
                          {validationErrors.get('_bulk_save')?.[0]}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Search and filters */}
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Search features..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Category tabs */}
                  <div className="flex space-x-1 overflow-x-auto">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={clsx(
                        'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                        selectedCategory === 'all'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                      )}
                    >
                      All Features
                    </button>
                    {Object.entries(FEATURE_CATEGORIES).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        className={clsx(
                          'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                          selectedCategory === key
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features grid - with scroll isolation to prevent state mutations */}
                {/* Validates: Requirements 2.3, 2.4 */}
                <div ref={scrollContainerRef} className="max-h-96 overflow-y-auto p-6">
                  {filteredFeatures.length === 0 ? (
                    <div className="text-center py-12">
                      <InformationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        No features found
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Try adjusting your search or filter criteria.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <AnimatePresence>
                        {filteredFeatures.map((feature) => (
                          <FeatureCard key={feature.id} feature={feature} />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        {/* Templates Modal */}
        <TemplateModal
          isOpen={showTemplates}
          onClose={() => setShowTemplates(false)}
          onApply={handleTemplateApply}
          organizationId={organizationId}
          isLoading={isSaving}
        />
      </Dialog>
    </Transition>
  )
}

// Template Modal Component
interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (templateId: string) => void
  organizationId: string
  isLoading: boolean
}

function TemplateModal({ 
  isOpen, 
  onClose, 
  onApply, 
  organizationId, 
  isLoading 
}: TemplateModalProps) {
  const [templates, setTemplates] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  const loadTemplates = async () => {
    try {
      const availableTemplates = await featureFlagService.getAvailableTemplates()
      setTemplates(availableTemplates)
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-60" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                    Apply Feature Template
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6"
                      >
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          {template.description}
                        </p>
                        
                        <div className="mb-4">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <strong>Target Audience:</strong> {template.target_audience.join(', ')}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <strong>Use Cases:</strong> {template.use_cases.join(', ')}
                          </div>
                        </div>

                        <button
                          onClick={() => onApply(template.id)}
                          disabled={isLoading}
                          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isLoading ? 'Applying...' : 'Apply Template'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
