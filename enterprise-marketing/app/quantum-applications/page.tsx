import React from 'react';
import { QuantumApplicationsDashboard } from '@/components/quantum/QuantumApplicationsDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Quantum, 
  Zap, 
  Brain, 
  Atom, 
  Network, 
  Target, 
  Layers,
  TrendingUp,
  Shield,
  Rocket,
  Cpu,
  Activity,
  Globe
} from 'lucide-react';

const QuantumApplicationsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white bg-opacity-20 rounded-full">
                <Quantum className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Quantum Applications Platform
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Harness the power of quantum computing for advanced optimization, simulation, and analysis. 
              Solve complex problems with unprecedented speed and accuracy.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Zap className="w-4 h-4 mr-2" />
                5-100x Quantum Speedup
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Brain className="w-4 h-4 mr-2" />
                AI-Enhanced Algorithms
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Shield className="w-4 h-4 mr-2" />
                Post-Quantum Security
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Activity className="w-4 h-4 mr-2" />
                Real-time Processing
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <Atom className="w-16 h-16 text-white animate-pulse" />
        </div>
        <div className="absolute top-32 right-20 opacity-20">
          <Network className="w-20 h-20 text-white animate-bounce" />
        </div>
        <div className="absolute bottom-20 left-1/4 opacity-20">
          <Brain className="w-14 h-14 text-white animate-pulse" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Applications</p>
                  <p className="text-3xl font-bold text-blue-600">247</p>
                  <p className="text-sm text-gray-500">+12% from last month</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Rocket className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quantum Speedup</p>
                  <p className="text-3xl font-bold text-purple-600">4.7x</p>
                  <p className="text-sm text-gray-500">Average advantage</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-3xl font-bold text-green-600">96.4%</p>
                  <p className="text-sm text-gray-500">Production-ready apps</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cost Savings</p>
                  <p className="text-3xl font-bold text-orange-600">$2.1M</p>
                  <p className="text-sm text-gray-500">Total optimization gains</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Key Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Quantum-Powered Applications
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our comprehensive suite of quantum computing applications designed to transform 
            your business operations across multiple industries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="p-3 bg-blue-100 rounded-full w-fit group-hover:bg-blue-200 transition-colors">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Energy Optimization</CardTitle>
              <CardDescription>
                Quantum-enhanced grid optimization, demand response, and renewable energy integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Grid Efficiency</span>
                  <span className="font-semibold text-green-600">+18.5%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Cost Reduction</span>
                  <span className="font-semibold text-green-600">23.7%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Peak Shaving</span>
                  <span className="font-semibold text-blue-600">31.2%</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Badge variant="outline" className="mr-2">QAOA</Badge>
                <Badge variant="outline">VQE</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="p-3 bg-purple-100 rounded-full w-fit group-hover:bg-purple-200 transition-colors">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Financial Models</CardTitle>
              <CardDescription>
                Quantum-enhanced risk analysis, portfolio optimization, and derivatives pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Risk Reduction</span>
                  <span className="font-semibold text-green-600">23.7%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Return Improvement</span>
                  <span className="font-semibold text-green-600">18.9%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Speedup Factor</span>
                  <span className="font-semibold text-blue-600">5.2x</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Badge variant="outline" className="mr-2">Quantum Monte Carlo</Badge>
                <Badge variant="outline">QML</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="p-3 bg-green-100 rounded-full w-fit group-hover:bg-green-200 transition-colors">
                <Network className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Supply Chain</CardTitle>
              <CardDescription>
                Quantum optimization for logistics, inventory management, and network design
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Cost Savings</span>
                  <span className="font-semibold text-green-600">21.4%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Delivery Improvement</span>
                  <span className="font-semibold text-green-600">16.8%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Risk Reduction</span>
                  <span className="font-semibold text-green-600">22.3%</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Badge variant="outline" className="mr-2">QAOA</Badge>
                <Badge variant="outline">Annealing</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="p-3 bg-orange-100 rounded-full w-fit group-hover:bg-orange-200 transition-colors">
                <Layers className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Simulation Engine</CardTitle>
              <CardDescription>
                Quantum-enhanced molecular dynamics, material science, and climate modeling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Accuracy</span>
                  <span className="font-semibold text-green-600">96.4%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Compute Savings</span>
                  <span className="font-semibold text-green-600">45.6%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Discovery Rate</span>
                  <span className="font-semibold text-blue-600">+31.5%</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Badge variant="outline" className="mr-2">QMC</Badge>
                <Badge variant="outline">VQE</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="p-3 bg-indigo-100 rounded-full w-fit group-hover:bg-indigo-200 transition-colors">
                <Globe className="w-8 h-8 text-indigo-600" />
              </div>
              <CardTitle className="text-xl">Demand Forecasting</CardTitle>
              <CardDescription>
                Quantum machine learning for accurate demand prediction and market analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Accuracy</span>
                  <span className="font-semibold text-green-600">91.5%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Forecast Horizon</span>
                  <span className="font-semibold text-blue-600">12 months</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Processing Speed</span>
                  <span className="font-semibold text-purple-600">2.9x faster</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Badge variant="outline" className="mr-2">Quantum ML</Badge>
                <Badge variant="outline">Hybrid</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="p-3 bg-red-100 rounded-full w-fit group-hover:bg-red-200 transition-colors">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">Quantum Security</CardTitle>
              <CardDescription>
                Post-quantum cryptography and quantum-safe security protocols
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Security Level</span>
                  <span className="font-semibold text-green-600">NIST Level 3</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Migration Progress</span>
                  <span className="font-semibold text-blue-600">67%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Compliance</span>
                  <span className="font-semibold text-green-600">96.3%</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Badge variant="outline" className="mr-2">Kyber</Badge>
                <Badge variant="outline">Dilithium</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technology Stack */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Powered by Leading Quantum Technologies
          </h3>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Cpu className="w-5 h-5 mr-2 text-blue-600" />
              IBM Quantum Network
            </div>
            <div className="flex items-center">
              <Atom className="w-5 h-5 mr-2 text-purple-600" />
              Google Quantum AI
            </div>
            <div className="flex items-center">
              <Network className="w-5 h-5 mr-2 text-green-600" />
              Amazon Braket
            </div>
            <div className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-orange-600" />
              Rigetti Quantum Cloud
            </div>
            <div className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-red-600" />
              Microsoft Azure Quantum
            </div>
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-indigo-600" />
              IonQ Quantum Systems
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <QuantumApplicationsDashboard />
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Business with Quantum Computing?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join the quantum revolution and unlock unprecedented computational advantages for your most challenging problems.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Free Trial
            </button>
            <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumApplicationsPage;