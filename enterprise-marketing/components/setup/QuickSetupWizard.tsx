'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RocketLaunchIcon,
  ChartBarIcon,
  DocumentArrowUpIcon,
  PlayIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon,
  UserGroupIcon,
  CogIcon,
  BookOpenIcon,
  VideoCameraIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface QuickSetupWizardProps {
  userId: string
  onComplete: (data: any) => void
  onSkip?: () => void
}

interface SetupStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  completed: boolean
  optional: boolean
}

export function QuickSetupWizard({ userId, onComplete, onSkip }: QuickSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [productTour, setProductTour] = useState({
    step: 0,
    visible: false,
    currentFeature: null as string | null
  })
  const [sampleData, setSampleData] = useState({
    uploaded: false,
    type: null as string | null,
    status: 'pending' as 'pending' | 'processing' | 'completed' | 'error'
  })
  const [dashboard, setDashboard] = useState({
    pinnedWidgets: [] as string[],
    layout: 'default',
    preferences: {}
  })

  const steps: SetupStep[] = [
    {
      id: 'tour',
      title: 'Product Tour',
      description: 'Learn the key features and navigation',
      icon: PlayIcon,
      completed: false,
      optional: false
    },
    {
      id: 'sample-data',
      title: 'Import Sample Data',
      description: 'Upload sample trading data to explore features',
      icon: DocumentArrowUpIcon,
      completed: false,
      optional: true
    },
    {
      id: 'dashboard',
      title: 'Customize Dashboard',
      description: 'Pin your favorite widgets and set up preferences',
      icon: ChartBarIcon,
      completed: false,
      optional: true
    },
    {
      id: 'team-setup',
      title: 'Invite Team Members',
      description: 'Add colleagues to collaborate on energy trading',
      icon: UserGroupIcon,
      completed: false,
      optional: true
    },
    {
      id: 'settings',
      title: 'Configure Settings',
      description: 'Set up notifications, themes, and integrations',
      icon: CogIcon,
      completed: false,
      optional: true
    }
  ]

  const [stepsState, setStepsState] = useState(steps)

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]))
    setStepsState(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      )
    )
    
    // Move to next step
    if (currentStep < stepsState.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 500)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/quick-setup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          completedSteps: Array.from(completedSteps),
          sampleData,
          dashboard
        })
      })

      const data = await response.json()
      if (data.success) {
        onComplete(data.data)
      }
    } catch (error) {
      console.error('Quick setup completion failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const isCompleted = completedSteps.size === stepsState.filter(s => !s.optional).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to OptiBid Energy! 
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let's get you set up quickly so you can start optimizing your energy trading with confidence.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Setup Progress</h2>
            <div className="text-sm text-gray-500">
              {completedSteps.size} of {stepsState.filter(s => !s.optional).length} required steps completed
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(completedSteps.size / stepsState.filter(s => !s.optional).length) * 100}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stepsState.map((step, index) => {
              const Icon = step.icon
              const isCompleted = completedSteps.has(step.id)
              const isCurrent = currentStep === index
              
              return (
                <motion.div
                  key={step.id}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isCompleted 
                      ? 'border-green-300 bg-green-50' 
                      : isCurrent
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => setCurrentStep(index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isCompleted ? 'bg-green-100' : isCurrent ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                      {step.optional && (
                        <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Optional
                        </span>
                      )}
                    </div>
                    {isCompleted && (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && (
                <ProductTourStep
                  productTour={productTour}
                  onUpdate={setProductTour}
                  onComplete={() => handleStepComplete('tour')}
                />
              )}
              {currentStep === 1 && (
                <SampleDataStep
                  sampleData={sampleData}
                  onUpdate={setSampleData}
                  onComplete={() => handleStepComplete('sample-data')}
                />
              )}
              {currentStep === 2 && (
                <DashboardCustomizationStep
                  dashboard={dashboard}
                  onUpdate={setDashboard}
                  onComplete={() => handleStepComplete('dashboard')}
                />
              )}
              {currentStep === 3 && (
                <TeamSetupStep onComplete={() => handleStepComplete('team-setup')} />
              )}
              {currentStep === 4 && (
                <SettingsStep onComplete={() => handleStepComplete('settings')} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <div>
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              {onSkip && currentStep === 0 && (
                <button
                  onClick={onSkip}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Skip Setup
                </button>
              )}
              
              {currentStep < stepsState.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={loading || !isCompleted}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Completing Setup...
                    </>
                  ) : (
                    <>
                      <RocketLaunchIcon className="w-4 h-4 mr-2" />
                      Start Trading
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step Components
function ProductTourStep({ 
  productTour, 
  onUpdate, 
  onComplete 
}: { 
  productTour: any, 
  onUpdate: (tour: any) => void,
  onComplete: () => void 
}) {
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    {
      title: 'Real-Time Dashboard',
      description: 'Monitor live energy prices, portfolio performance, and market trends',
      screenshot: '/api/placeholder/400/300'
    },
    {
      title: 'AI-Powered Analytics',
      description: 'Get intelligent insights and predictions for optimal trading decisions',
      screenshot: '/api/placeholder/400/300'
    },
    {
      title: 'Collaborative Tools',
      description: 'Work together with your team on strategies and risk management',
      screenshot: '/api/placeholder/400/300'
    },
    {
      title: 'Risk Management',
      description: 'Set up alerts, limits, and automated risk controls',
      screenshot: '/api/placeholder/400/300'
    }
  ]

  const startTour = () => {
    onUpdate({ ...productTour, visible: true, step: 1, currentFeature: features[0].title })
    setCurrentFeature(0)
  }

  const nextFeature = () => {
    if (currentFeature < features.length - 1) {
      setCurrentFeature(currentFeature + 1)
      onUpdate({ ...productTour, currentFeature: features[currentFeature + 1].title })
    } else {
      onComplete()
    }
  }

  return (
    <div className="text-center">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <PlayIcon className="w-8 h-8 text-blue-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Product Tour
      </h2>
      
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        Take a quick tour of OptiBid Energy's key features. We'll walk you through 
        the most important tools for energy trading success.
      </p>

      {!productTour.visible ? (
        <button
          onClick={startTour}
          className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"
        >
          <VideoCameraIcon className="w-5 h-5 mr-2" />
          Start Product Tour
        </button>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-100 rounded-lg p-8 mb-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {features[currentFeature].title}
              </h3>
              <p className="text-gray-600">
                {features[currentFeature].description}
              </p>
            </div>
            
            {/* Placeholder for feature screenshot */}
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <ChartBarIcon className="w-12 h-12 mx-auto mb-2" />
                <div className="text-sm">Feature Screenshot</div>
                <div className="text-xs text-gray-400">{features[currentFeature].title}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Feature {currentFeature + 1} of {features.length}
            </div>
            <button
              onClick={nextFeature}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {currentFeature === features.length - 1 ? 'Complete Tour' : 'Next Feature'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function SampleDataStep({ 
  sampleData, 
  onUpdate, 
  onComplete 
}: { 
  sampleData: any, 
  onUpdate: (data: any) => void,
  onComplete: () => void 
}) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    onUpdate({ ...sampleData, status: 'processing' })

    // Simulate file processing
    setTimeout(() => {
      onUpdate({ 
        ...sampleData, 
        uploaded: true, 
        type: 'CSV Portfolio Data', 
        status: 'completed' 
      })
      onComplete()
    }, 2000)
  }

  return (
    <div className="text-center">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <DocumentArrowUpIcon className="w-8 h-8 text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Import Sample Data
      </h2>
      
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        Upload sample trading data to explore OptiBid Energy's features. 
        We'll help you get started with realistic portfolio data.
      </p>

      <div className="max-w-md mx-auto">
        {!sampleData.uploaded ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-600 mb-4">
              {uploadedFile ? uploadedFile.name : 'Choose a file to upload'}
            </div>
            <input
              type="file"
              accept=".csv,.xlsx,.json"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-block"
            >
              {uploadedFile ? 'Processing...' : 'Choose File'}
            </label>
            
            <div className="mt-6 text-sm text-gray-500">
              Or try our sample datasets:
            </div>
            <div className="mt-3 space-y-2">
              <button
                onClick={() => {
                  onUpdate({ 
                    ...sampleData, 
                    uploaded: true, 
                    type: 'Sample Portfolio', 
                    status: 'completed' 
                  })
                  onComplete()
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              >
                Sample Energy Portfolio
              </button>
              <button
                onClick={() => {
                  onUpdate({ 
                    ...sampleData, 
                    uploaded: true, 
                    type: 'Market Data', 
                    status: 'completed' 
                  })
                  onComplete()
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              >
                Real-time Market Data
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-green-900 mb-2">Data Imported Successfully!</h3>
            <p className="text-sm text-green-700">
              Your {sampleData.type} is now available in the dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function DashboardCustomizationStep({ 
  dashboard, 
  onUpdate, 
  onComplete 
}: { 
  dashboard: any, 
  onUpdate: (data: any) => void,
  onComplete: () => void 
}) {
  const availableWidgets = [
    'Price Charts',
    'Portfolio Performance',
    'Risk Metrics',
    'Market News',
    'Trading Alerts',
    'Weather Forecast',
    'Grid Status',
    'Carbon Footprint'
  ]

  const toggleWidget = (widget: string) => {
    const newPinnedWidgets = dashboard.pinnedWidgets.includes(widget)
      ? dashboard.pinnedWidgets.filter((w: string) => w !== widget)
      : [...dashboard.pinnedWidgets, widget]
    
    onUpdate({ ...dashboard, pinnedWidgets: newPinnedWidgets })
  }

  return (
    <div className="text-center">
      <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
        <ChartBarIcon className="w-8 h-8 text-purple-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Customize Your Dashboard
      </h2>
      
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        Choose which widgets and features you want to see on your main dashboard. 
        You can always change these later in settings.
      </p>

      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {availableWidgets.map((widget) => (
            <button
              key={widget}
              onClick={() => toggleWidget(widget)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                dashboard.pinnedWidgets.includes(widget)
                  ? 'border-purple-500 bg-purple-50 text-purple-900'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{widget}</div>
              {dashboard.pinnedWidgets.includes(widget) && (
                <CheckCircleIcon className="w-4 h-4 text-purple-600 mt-1" />
              )}
            </button>
          ))}
        </div>

        {dashboard.pinnedWidgets.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="font-semibold text-purple-900 mb-2">
              {dashboard.pinnedWidgets.length} widget{dashboard.pinnedWidgets.length !== 1 ? 's' : ''} selected
            </h3>
            <p className="text-sm text-purple-700">
              These widgets will appear on your main dashboard for quick access.
            </p>
            <button
              onClick={onComplete}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Save Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function TeamSetupStep({ onComplete }: { onComplete: () => void }) {
  const [invites, setInvites] = useState([{ email: '', role: 'trader' }])
  const [sending, setSending] = useState(false)

  const addInvite = () => {
    setInvites([...invites, { email: '', role: 'trader' }])
  }

  const updateInvite = (index: number, field: string, value: string) => {
    const newInvites = invites.map((invite, i) => 
      i === index ? { ...invite, [field]: value } : invite
    )
    setInvites(newInvites)
  }

  const removeInvite = (index: number) => {
    setInvites(invites.filter((_, i) => i !== index))
  }

  const sendInvites = async () => {
    setSending(true)
    // Simulate sending invites
    setTimeout(() => {
      setSending(false)
      onComplete()
    }, 2000)
  }

  return (
    <div className="text-center">
      <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
        <UserGroupIcon className="w-8 h-8 text-indigo-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Invite Your Team
      </h2>
      
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        Collaborate with your colleagues by inviting them to join your organization. 
        They'll receive an email invitation to get started.
      </p>

      <div className="max-w-md mx-auto text-left">
        <div className="space-y-4 mb-6">
          {invites.map((invite, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="email"
                placeholder="colleague@company.com"
                value={invite.email}
                onChange={(e) => updateInvite(index, 'email', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <select
                value={invite.role}
                onChange={(e) => updateInvite(index, 'role', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="trader">Trader</option>
                <option value="analyst">Analyst</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              {invites.length > 1 && (
                <button
                  onClick={() => removeInvite(index)}
                  className="p-2 text-gray-500 hover:text-red-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={addInvite}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Add Another
          </button>
          <button
            onClick={sendInvites}
            disabled={sending || invites.every(invite => !invite.email)}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Invitations'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SettingsStep({ onComplete }: { onComplete: () => void }) {
  const [settings, setSettings] = useState({
    notifications: true,
    theme: 'light',
    language: 'en',
    timezone: 'UTC'
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const completeSettings = () => {
    onComplete()
  }

  return (
    <div className="text-center">
      <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
        <CogIcon className="w-8 h-8 text-yellow-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Configure Your Settings
      </h2>
      
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        Customize your OptiBid Energy experience with your preferred settings. 
        You can change these anytime in the application.
      </p>

      <div className="max-w-md mx-auto space-y-6">
        <div className="text-left">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <select
            value={settings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div className="text-left">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        <div className="text-left">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => handleSettingChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>

        <div className="text-left">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
            />
            <span className="ml-2 text-sm text-gray-700">Enable notifications</span>
          </label>
        </div>

        <button
          onClick={completeSettings}
          className="w-full px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}