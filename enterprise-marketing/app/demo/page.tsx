'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ChartBarIcon,
  BoltIcon,
  MapPinIcon,
  CpuChipIcon,
  EyeIcon,
  CogIcon,
  SparklesIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const DemoPage = () => {
  const [activeDemo, setActiveDemo] = useState('energy-flow');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [demoData, setDemoData] = useState({
    energyFlow: {
      solar: 245.7,
      wind: 189.3,
      hydro: 156.2,
      grid: 89.4,
      consumption: 534.2
    },
    trading: {
      btcPrice: 43250.67,
      ethPrice: 2687.45,
      btcChange: '+2.4%',
      ethChange: '-1.2%',
      volume: '1.2B'
    },
    performance: {
      efficiency: 94.7,
      uptime: 99.9,
      carbon: 23.4,
      savings: 156.7
    }
  });

  const demoSteps = [
    'Real-time Energy Monitoring',
    'AI-Powered Optimization',
    'Smart Trading Analytics',
    'Carbon Impact Tracking'
  ];

  const demoTypes = [
    { id: 'energy-flow', name: 'Energy Flow', icon: BoltIcon, color: 'blue' },
    { id: 'ai-trading', name: 'AI Trading', icon: ChartBarIcon, color: 'green' },
    { id: 'smart-grid', name: 'Smart Grid', icon: CpuChipIcon, color: 'purple' },
    { id: 'carbon', name: 'Carbon Tracking', icon: GlobeAltIcon, color: 'emerald' }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        // Simulate real-time data updates
        setDemoData(prev => ({
          energyFlow: {
            solar: Math.round((prev.energyFlow.solar + (Math.random() - 0.5) * 10) * 10) / 10,
            wind: Math.round((prev.energyFlow.wind + (Math.random() - 0.5) * 15) * 10) / 10,
            hydro: Math.round((prev.energyFlow.hydro + (Math.random() - 0.5) * 5) * 10) / 10,
            grid: Math.round((prev.energyFlow.grid + (Math.random() - 0.5) * 8) * 10) / 10,
            consumption: Math.round((prev.energyFlow.consumption + (Math.random() - 0.5) * 20) * 10) / 10
          },
          trading: {
            btcPrice: Math.round((prev.trading.btcPrice + (Math.random() - 0.5) * 1000) * 100) / 100,
            ethPrice: Math.round((prev.trading.ethPrice + (Math.random() - 0.5) * 100) * 100) / 100,
            btcChange: (Math.random() > 0.5 ? '+' : '') + (Math.random() * 10).toFixed(1) + '%',
            ethChange: (Math.random() > 0.5 ? '+' : '') + (Math.random() * 10).toFixed(1) + '%',
            volume: (Math.random() * 2 + 0.5).toFixed(1) + 'B'
          },
          performance: {
            efficiency: Math.round((prev.performance.efficiency + (Math.random() - 0.5) * 2) * 10) / 10,
            uptime: 99.9,
            carbon: Math.round((prev.performance.carbon + (Math.random() - 0.5) * 5) * 10) / 10,
            savings: Math.round((prev.performance.savings + (Math.random() - 0.5) * 10) * 10) / 10
          }
        }));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % demoSteps.length);
      }, 4000);
      return () => clearInterval(stepInterval);
    }
  }, [isPlaying, demoSteps.length]);

  const toggleDemo = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setCurrentStep(0);
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 border-blue-200 text-blue-600',
      green: 'bg-green-500 border-green-200 text-green-600',
      purple: 'bg-purple-500 border-purple-200 text-purple-600',
      emerald: 'bg-emerald-500 border-emerald-200 text-emerald-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
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
              Interactive Demo
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Experience the power of OptiBid's AI-driven energy optimization platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={toggleDemo}
                className="flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                {isPlaying ? <PauseIcon className="h-6 w-6 mr-2" /> : <PlayIcon className="h-6 w-6 mr-2" />}
                {isPlaying ? 'Pause Demo' : 'Start Demo'}
              </button>
              <Link 
                href="/signup"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors flex items-center justify-center"
              >
                Try Full Platform
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo Controls */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            {/* Demo Type Selector */}
            <div className="flex flex-wrap gap-2">
              {demoTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveDemo(type.id)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeDemo === type.id
                      ? getColorClasses(type.color)
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <type.icon className="h-5 w-5 mr-2" />
                  {type.name}
                </button>
              ))}
            </div>

            {/* Current Step Indicator */}
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">Step {currentStep + 1} of {demoSteps.length}</span>
              <div className="flex space-x-1">
                {demoSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Demo Area */}
            <div className="lg:col-span-2">
              <motion.div
                key={activeDemo}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
              >
                {/* Demo Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        {demoTypes.find(t => t.id === activeDemo)?.name} Demo
                      </h2>
                      <p className="text-blue-100">
                        {demoSteps[currentStep]}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isPlaying && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-white/20 rounded-full p-2"
                        >
                          <SparklesIcon className="h-5 w-5" />
                        </motion.div>
                      )}
                      <button
                        onClick={toggleDemo}
                        className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                      >
                        {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Demo Visualization */}
                <div className="p-8">
                  <AnimatePresence mode="wait">
                    {activeDemo === 'energy-flow' && (
                      <motion.div
                        key="energy-flow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                        {/* Energy Flow Visualization */}
                        <div className="relative h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg viewBox="0 0 400 200" className="w-full h-full">
                              {/* Energy Sources */}
                              <circle cx="80" cy="50" r="20" fill="#3B82F6" opacity="0.8" />
                              <text x="80" y="55" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Solar</text>
                              <text x="80" y="85" textAnchor="middle" fill="#3B82F6" fontSize="14" fontWeight="bold">{demoData.energyFlow.solar}MW</text>
                              
                              <circle cx="80" cy="150" r="20" fill="#10B981" opacity="0.8" />
                              <text x="80" y="155" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Wind</text>
                              <text x="80" y="185" textAnchor="middle" fill="#10B981" fontSize="14" fontWeight="bold">{demoData.energyFlow.wind}MW</text>
                              
                              <circle cx="200" cy="50" r="20" fill="#8B5CF6" opacity="0.8" />
                              <text x="200" y="55" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Hydro</text>
                              <text x="200" y="85" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">{demoData.energyFlow.hydro}MW</text>
                              
                              <circle cx="200" cy="150" r="20" fill="#F59E0B" opacity="0.8" />
                              <text x="200" y="155" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Grid</text>
                              <text x="200" y="185" textAnchor="middle" fill="#F59E0B" fontSize="14" fontWeight="bold">{demoData.energyFlow.grid}MW</text>
                              
                              {/* Central Hub */}
                              <circle cx="320" cy="100" r="25" fill="#EF4444" opacity="0.9" />
                              <text x="320" y="105" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Hub</text>
                              
                              {/* Flow Lines */}
                              <line x1="100" y1="50" x2="295" y2="100" stroke="#3B82F6" strokeWidth="3" opacity="0.6">
                                <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                              </line>
                              <line x1="100" y1="150" x2="295" y2="100" stroke="#10B981" strokeWidth="3" opacity="0.6">
                                <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
                              </line>
                              <line x1="220" y1="50" x2="295" y2="100" stroke="#8B5CF6" strokeWidth="3" opacity="0.6">
                                <animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite" />
                              </line>
                              <line x1="220" y1="150" x2="295" y2="100" stroke="#F59E0B" strokeWidth="3" opacity="0.6">
                                <animate attributeName="opacity" values="0.6;1;0.6" dur="2.2s" repeatCount="indefinite" />
                              </line>
                            </svg>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{demoData.energyFlow.solar + demoData.energyFlow.wind + demoData.energyFlow.hydro + demoData.energyFlow.grid}</div>
                            <div className="text-sm text-gray-600">Total Input (MW)</div>
                          </div>
                          <div className="bg-red-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{demoData.energyFlow.consumption}</div>
                            <div className="text-sm text-gray-600">Total Demand (MW)</div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeDemo === 'ai-trading' && (
                      <motion.div
                        key="ai-trading"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                        {/* Trading Dashboard */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-gray-900">Energy Token Price</h3>
                              <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">$0.042</div>
                            <div className="flex items-center mt-2">
                              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                              <span className="text-green-600 text-sm font-medium">+2.4%</span>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-gray-900">24h Volume</h3>
                              <ChartBarIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{demoData.trading.volume}</div>
                            <div className="text-sm text-gray-600 mt-2">Trading Volume</div>
                          </div>
                        </div>

                        {/* Chart Placeholder */}
                        <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
                          <div className="text-center">
                            <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Real-time trading chart would be displayed here</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeDemo === 'smart-grid' && (
                      <motion.div
                        key="smart-grid"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                        {/* Grid Status */}
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="bg-green-50 rounded-lg p-6 text-center">
                            <div className="text-3xl font-bold text-green-600">{demoData.performance.uptime}%</div>
                            <div className="text-sm text-gray-600">Grid Uptime</div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-6 text-center">
                            <div className="text-3xl font-bold text-blue-600">{demoData.performance.efficiency}%</div>
                            <div className="text-sm text-gray-600">Efficiency</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-6 text-center">
                            <div className="text-3xl font-bold text-purple-600">{demoData.performance.carbon}</div>
                            <div className="text-sm text-gray-600">CO2 (tons/day)</div>
                          </div>
                        </div>

                        {/* Grid Map Placeholder */}
                        <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
                          <div className="text-center">
                            <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Interactive grid map would be displayed here</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeDemo === 'carbon' && (
                      <motion.div
                        key="carbon"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                        {/* Carbon Impact */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="bg-green-50 rounded-lg p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Carbon Reduction</h3>
                            <div className="text-3xl font-bold text-green-600">-{demoData.performance.carbon}%</div>
                            <p className="text-sm text-gray-600 mt-2">vs traditional energy</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Cost Savings</h3>
                            <div className="text-3xl font-bold text-blue-600">${demoData.performance.savings}K</div>
                            <p className="text-sm text-gray-600 mt-2">Monthly savings</p>
                          </div>
                        </div>

                        {/* Impact Metrics */}
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h3 className="font-semibold text-gray-900 mb-4">Environmental Impact</h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">CO2 Emissions Reduced</span>
                              <span className="font-medium">2,847 tons/year</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Trees Equivalent</span>
                              <span className="font-medium">47,850 trees</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Cars Off Road</span>
                              <span className="font-medium">1,247 cars</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Current Step Info */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Demo Step</h3>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {demoSteps[currentStep]}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {currentStep === 0 && "Monitor real-time energy production and consumption across multiple sources"}
                  {currentStep === 1 && "AI algorithms automatically optimize energy distribution for maximum efficiency"}
                  {currentStep === 2 && "Advanced analytics provide trading insights and market predictions"}
                  {currentStep === 3 && "Track environmental impact and carbon reduction metrics in real-time"}
                </p>
                
                <div className="space-y-2">
                  {demoSteps.map((step, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                      }`}></div>
                      <span className={`text-sm ${
                        index <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
                      }`}>
                        {step}
                      </span>
                      {index <= currentStep && (
                        <CheckCircleIcon className="h-4 w-4 text-green-500 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Key Metrics */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Live Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="font-medium text-green-600">12ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Data Points/min</span>
                    <span className="font-medium">15,000+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Users</span>
                    <span className="font-medium">2,847</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="font-medium text-green-600">99.9%</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Ready to get started?</h3>
                <div className="space-y-3">
                  <Link
                    href="/signup"
                    className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                  >
                    Start Free Trial
                  </Link>
                  <Link
                    href="/contact"
                    className="block w-full bg-white text-blue-600 py-3 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors text-center border border-blue-200"
                  >
                    Schedule Demo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What You'll Experience</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how OptiBid transforms energy management with AI-powered optimization
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: BoltIcon,
                title: 'Real-time Monitoring',
                description: 'Track energy flows across your entire network in real-time'
              },
              {
                icon: SparklesIcon,
                title: 'AI Optimization',
                description: 'Machine learning algorithms optimize energy distribution automatically'
              },
              {
                icon: ChartBarIcon,
                title: 'Advanced Analytics',
                description: 'Deep insights into energy patterns, trading opportunities, and efficiency metrics'
              },
              {
                icon: GlobeAltIcon,
                title: 'Carbon Tracking',
                description: 'Monitor environmental impact and sustainability metrics'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DemoPage;