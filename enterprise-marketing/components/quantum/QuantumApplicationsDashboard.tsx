'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Zap, 
  TrendingUp, 
  BarChart3, 
  Cpu, 
  Activity, 
  Brain, 
  Database, 
  Network,
  Settings,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Target,
  Lightbulb,
  ChevronRight,
  Download,
  Upload,
  Filter,
  Search,
  RefreshCw,
  Quantum,
  Atom,
  Layers,
  Box,
  Globe,
  Puzzle,
  Rocket,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

interface QuantumApplication {
  id: string;
  name: string;
  type: string;
  category: 'optimization' | 'simulation' | 'analysis' | 'prediction';
  status: 'running' | 'completed' | 'failed' | 'pending';
  progress?: number;
  quantum_algorithm: string;
  quantum_speedup: number;
  accuracy: number;
  created_at: string;
  estimated_completion?: string;
  description: string;
  use_case: string;
  performance_metrics: {
    speedup: number;
    accuracy: number;
    cost_savings: number;
    accuracy_improvement: number;
  };
  results?: any;
}

interface QuantumApplicationDashboardProps {
  className?: string;
}

const QuantumApplicationsDashboard: React.FC<QuantumApplicationDashboardProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState<QuantumApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<QuantumApplication | null>(null);
  const [isRunningNewSimulation, setIsRunningNewSimulation] = useState(false);
  const [newSimulationConfig, setNewSimulationConfig] = useState({
    type: '',
    algorithm: '',
    parameters: '',
    objective: '',
    constraints: ''
  });

  // Mock quantum applications data
  const quantumApplications: QuantumApplication[] = [
    {
      id: 'app_001',
      name: 'Energy Grid Optimization',
      type: 'energy_optimization',
      category: 'optimization',
      status: 'completed',
      quantum_algorithm: 'QAOA',
      quantum_speedup: 4.2,
      accuracy: 96.8,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      description: 'Quantum-enhanced optimization of electrical grid operations',
      use_case: 'Smart grid management and load balancing',
      performance_metrics: {
        speedup: 4.2,
        accuracy: 96.8,
        cost_savings: 23.7,
        accuracy_improvement: 18.5
      },
      results: {
        grid_efficiency: 94.2,
        cost_reduction: 12500,
        renewable_integration: 89.3,
        peak_demand_reduction: 23.1
      }
    },
    {
      id: 'app_002',
      name: 'Portfolio Risk Analysis',
      type: 'financial_models',
      category: 'analysis',
      status: 'running',
      progress: 73,
      quantum_algorithm: 'VQE',
      quantum_speedup: 3.1,
      accuracy: 94.1,
      created_at: new Date(Date.now() - 43200000).toISOString(),
      estimated_completion: new Date(Date.now() + 18000000).toISOString(),
      description: 'Quantum-enhanced financial risk modeling and portfolio optimization',
      use_case: 'High-frequency trading and risk management',
      performance_metrics: {
        speedup: 3.1,
        accuracy: 94.1,
        cost_savings: 19.3,
        accuracy_improvement: 15.7
      }
    },
    {
      id: 'app_003',
      name: 'Supply Chain Route Optimization',
      type: 'supply_chain',
      category: 'optimization',
      status: 'running',
      progress: 45,
      quantum_algorithm: 'QAOA',
      quantum_speedup: 4.8,
      accuracy: 98.1,
      created_at: new Date(Date.now() - 21600000).toISOString(),
      estimated_completion: new Date(Date.now() + 32400000).toISOString(),
      description: 'Quantum optimization of logistics and supply chain operations',
      use_case: 'Last-mile delivery and warehouse management',
      performance_metrics: {
        speedup: 4.8,
        accuracy: 98.1,
        cost_savings: 27.2,
        accuracy_improvement: 22.8
      }
    },
    {
      id: 'app_004',
      name: 'Molecular Dynamics Simulation',
      type: 'simulation_engine',
      category: 'simulation',
      status: 'completed',
      quantum_algorithm: 'Quantum Monte Carlo',
      quantum_speedup: 8.7,
      accuracy: 99.2,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      description: 'Quantum-enhanced molecular dynamics for drug discovery',
      use_case: 'Pharmaceutical research and materials science',
      performance_metrics: {
        speedup: 8.7,
        accuracy: 99.2,
        cost_savings: 45.3,
        accuracy_improvement: 31.5
      },
      results: {
        molecule: 'caffeine_derivative',
        binding_energy: -12.4,
        simulation_time: '2.5 ps',
        convergence: 'excellent'
      }
    },
    {
      id: 'app_005',
      name: 'Demand Forecasting',
      type: 'demand_forecasting',
      category: 'prediction',
      status: 'pending',
      quantum_algorithm: 'Quantum Machine Learning',
      quantum_speedup: 2.9,
      accuracy: 91.5,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      description: 'Quantum-enhanced demand prediction for energy markets',
      use_case: 'Energy trading and grid planning',
      performance_metrics: {
        speedup: 2.9,
        accuracy: 91.5,
        cost_savings: 12.8,
        accuracy_improvement: 8.3
      }
    },
    {
      id: 'app_006',
      name: 'Climate Modeling',
      type: 'climate_simulation',
      category: 'simulation',
      status: 'failed',
      quantum_algorithm: 'Quantum Lattice Boltzmann',
      quantum_speedup: 6.1,
      accuracy: 89.7,
      created_at: new Date(Date.now() - 604800000).toISOString(),
      description: 'Quantum-enhanced climate and weather prediction',
      use_case: 'Environmental monitoring and risk assessment',
      performance_metrics: {
        speedup: 6.1,
        accuracy: 89.7,
        cost_savings: 34.6,
        accuracy_improvement: 19.2
      }
    }
  ];

  useEffect(() => {
    setApplications(quantumApplications);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'running': return <Activity className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Pause className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'optimization': return <Target className="w-5 h-5" />;
      case 'simulation': return <Layers className="w-5 h-5" />;
      case 'analysis': return <BarChart3 className="w-5 h-5" />;
      case 'prediction': return <TrendingUp className="w-5 h-5" />;
      default: return <Cpu className="w-5 h-5" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleStartSimulation = async () => {
    setIsRunningNewSimulation(true);
    // Simulate API call
    setTimeout(() => {
      setIsRunningNewSimulation(false);
      setNewSimulationConfig({
        type: '',
        algorithm: '',
        parameters: '',
        objective: '',
        constraints: ''
      });
    }, 2000);
  };

  const totalApplications = applications.length;
  const completedApplications = applications.filter(app => app.status === 'completed').length;
  const runningApplications = applications.filter(app => app.status === 'running').length;
  const failedApplications = applications.filter(app => app.status === 'failed').length;
  const averageSpeedup = applications.reduce((sum, app) => sum + app.quantum_speedup, 0) / totalApplications;
  const averageAccuracy = applications.reduce((sum, app) => sum + app.accuracy, 0) / totalApplications;
  const totalCostSavings = applications.reduce((sum, app) => sum + app.performance_metrics.cost_savings, 0);

  const ApplicationCard: React.FC<{ application: QuantumApplication }> = ({ application }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedApplication(application)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getCategoryIcon(application.category)}
            <CardTitle className="text-lg">{application.name}</CardTitle>
          </div>
          <Badge className={getStatusColor(application.status)}>
            {getStatusIcon(application.status)}
            <span className="ml-1">{application.status}</span>
          </Badge>
        </div>
        <CardDescription>{application.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {application.status === 'running' && application.progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{application.progress}%</span>
            </div>
            <Progress value={application.progress} className="w-full" />
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Algorithm</span>
            <div className="font-medium">{application.quantum_algorithm}</div>
          </div>
          <div>
            <span className="text-gray-500">Quantum Speedup</span>
            <div className="font-medium">{application.quantum_speedup}x</div>
          </div>
          <div>
            <span className="text-gray-500">Accuracy</span>
            <div className="font-medium">{application.accuracy}%</div>
          </div>
          <div>
            <span className="text-gray-500">Cost Savings</span>
            <div className="font-medium">{application.performance_metrics.cost_savings}%</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created {formatTimeAgo(application.created_at)}</span>
          {application.estimated_completion && (
            <span>ETA {formatTimeAgo(application.estimated_completion)}</span>
          )}
        </div>

        {application.results && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Key Results</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(application.results).slice(0, 4).map(([key, value]) => (
                <div key={key}>
                  <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                  <div className="font-medium">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quantum Applications Dashboard</h1>
          <p className="text-gray-600 mt-1">Advanced quantum computing applications and optimization</p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Play className="w-4 h-4 mr-2" />
                New Simulation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Start New Quantum Simulation</DialogTitle>
                <DialogDescription>
                  Configure and launch a new quantum computing application
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Application Type</Label>
                    <Select value={newSimulationConfig.type} onValueChange={(value) => 
                      setNewSimulationConfig({...newSimulationConfig, type: value})
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="energy_optimization">Energy Grid Optimization</SelectItem>
                        <SelectItem value="financial_models">Financial Models</SelectItem>
                        <SelectItem value="supply_chain">Supply Chain</SelectItem>
                        <SelectItem value="simulation_engine">Simulation Engine</SelectItem>
                        <SelectItem value="demand_forecasting">Demand Forecasting</SelectItem>
                        <SelectItem value="climate_simulation">Climate Modeling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="algorithm">Quantum Algorithm</Label>
                    <Select value={newSimulationConfig.algorithm} onValueChange={(value) => 
                      setNewSimulationConfig({...newSimulationConfig, algorithm: value})
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select algorithm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="QAOA">QAOA (Quantum Approximate Optimization)</SelectItem>
                        <SelectItem value="VQE">VQE (Variational Quantum Eigensolver)</SelectItem>
                        <SelectItem value="Quantum Monte Carlo">Quantum Monte Carlo</SelectItem>
                        <SelectItem value="Quantum Annealing">Quantum Annealing</SelectItem>
                        <SelectItem value="Quantum Machine Learning">Quantum Machine Learning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="objective">Optimization Objective</Label>
                  <Input 
                    id="objective"
                    placeholder="e.g., Minimize cost, Maximize efficiency"
                    value={newSimulationConfig.objective}
                    onChange={(e) => setNewSimulationConfig({...newSimulationConfig, objective: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parameters">Simulation Parameters</Label>
                  <Textarea 
                    id="parameters"
                    placeholder="Enter simulation parameters..."
                    rows={3}
                    value={newSimulationConfig.parameters}
                    onChange={(e) => setNewSimulationConfig({...newSimulationConfig, parameters: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="constraints">Constraints</Label>
                  <Textarea 
                    id="constraints"
                    placeholder="Enter any constraints..."
                    rows={2}
                    value={newSimulationConfig.constraints}
                    onChange={(e) => setNewSimulationConfig({...newSimulationConfig, constraints: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setIsRunningNewSimulation(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleStartSimulation}
                    disabled={isRunningNewSimulation || !newSimulationConfig.type || !newSimulationConfig.algorithm}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isRunningNewSimulation ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Simulation
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{totalApplications}</div>
              <Quantum className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-gray-500 ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600">{completedApplications}</div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-gray-500">{((completedApplications / totalApplications) * 100).toFixed(0)}% success rate</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Avg Quantum Speedup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-blue-600">{averageSpeedup.toFixed(1)}x</div>
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+8.3%</span>
              <span className="text-gray-500 ml-1">vs classical</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Cost Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-purple-600">${(totalCostSavings / 1000).toFixed(1)}K</div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-gray-500">Total savings across all applications</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Overview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Application Status Overview</CardTitle>
                <CardDescription>Real-time status of all quantum applications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{completedApplications}</div>
                    <div className="text-sm text-green-600">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{runningApplications}</div>
                    <div className="text-sm text-blue-600">Running</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-600">
                      {applications.filter(app => app.status === 'pending').length}
                    </div>
                    <div className="text-sm text-yellow-600">Pending</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-600">{failedApplications}</div>
                    <div className="text-sm text-red-600">Failed</div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Accuracy</span>
                      <span className="font-medium">{averageAccuracy.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${averageAccuracy}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Quantum Advantage</span>
                      <span className="font-medium">{averageSpeedup.toFixed(1)}x faster</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(averageSpeedup / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest quantum application updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {getStatusIcon(app.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {app.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(app.created_at)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(app.status)}>
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Applications Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">All Applications</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Optimization Applications
                </CardTitle>
                <CardDescription>
                  Quantum-enhanced optimization problems across various domains
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.filter(app => app.category === 'optimization').map((app) => (
                    <div key={app.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{app.name}</h4>
                        <Badge className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{app.use_case}</p>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Speedup</span>
                          <div className="font-medium">{app.quantum_speedup}x</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Accuracy</span>
                          <div className="font-medium">{app.accuracy}%</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Savings</span>
                          <div className="font-medium">{app.performance_metrics.cost_savings}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                  Optimization Metrics
                </CardTitle>
                <CardDescription>
                  Performance analysis and benchmarking results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Grid Efficiency Improvement</span>
                    <span className="font-medium text-green-600">+18.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Route Optimization Accuracy</span>
                    <span className="font-medium text-green-600">98.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Portfolio Risk Reduction</span>
                    <span className="font-medium text-green-600">23.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Supply Chain Cost Savings</span>
                    <span className="font-medium text-green-600">27.2%</span>
                  </div>
                </div>

                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle>Optimization Insight</AlertTitle>
                  <AlertDescription>
                    Quantum optimization shows highest performance gains in combinatorial problems 
                    with complex constraints, particularly in logistics and financial modeling.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="simulation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-green-600" />
                  Simulation Applications
                </CardTitle>
                <CardDescription>
                  Quantum-enhanced simulations for research and development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.filter(app => app.category === 'simulation').map((app) => (
                    <div key={app.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{app.name}</h4>
                        <Badge className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{app.use_case}</p>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Speedup</span>
                          <div className="font-medium">{app.quantum_speedup}x</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Accuracy</span>
                          <div className="font-medium">{app.accuracy}%</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Status</span>
                          <div className="font-medium">
                            {app.status === 'completed' ? 'Ready' : 'Running'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Atom className="w-5 h-5 mr-2 text-orange-600" />
                  Simulation Capabilities
                </CardTitle>
                <CardDescription>
                  Advanced simulation domains and accuracy metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Molecular Dynamics</span>
                    <span className="font-medium text-green-600">99.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Climate Modeling</span>
                    <span className="font-medium text-red-600">89.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Quantum Field Theory</span>
                    <span className="font-medium text-green-600">97.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Fluid Dynamics</span>
                    <span className="font-medium text-blue-600">94.5%</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Recent Breakthrough</h4>
                  <p className="text-sm text-gray-600">
                    Quantum Monte Carlo simulation of caffeine derivative achieved 
                    unprecedented binding energy accuracy of -12.4 kcal/mol, 
                    accelerating drug discovery pipeline by 8.7x.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-600" />
                  Algorithm Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>QAOA</span>
                    <span className="font-medium">4.2x avg speedup</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>VQE</span>
                    <span className="font-medium">3.1x avg speedup</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Quantum Monte Carlo</span>
                    <span className="font-medium">8.7x avg speedup</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Quantum ML</span>
                    <span className="font-medium">2.9x avg speedup</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-600" />
                  Use Case Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Energy & Utilities</span>
                    <span className="font-medium">42% of apps</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Finance</span>
                    <span className="font-medium">25% of apps</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Healthcare</span>
                    <span className="font-medium">17% of apps</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Manufacturing</span>
                    <span className="font-medium">16% of apps</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  ROI Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Total Cost Savings</span>
                    <span className="font-medium">$163K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Time Savings</span>
                    <span className="font-medium">847 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Accuracy Improvement</span>
                    <span className="font-medium">+19.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Quantum Advantage</span>
                    <span className="font-medium">4.6x avg</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {getCategoryIcon(selectedApplication.category)}
                <span className="ml-2">{selectedApplication.name}</span>
              </DialogTitle>
              <DialogDescription>{selectedApplication.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-500">Type:</span> {selectedApplication.type}</div>
                      <div><span className="text-gray-500">Algorithm:</span> {selectedApplication.quantum_algorithm}</div>
                      <div><span className="text-gray-500">Use Case:</span> {selectedApplication.use_case}</div>
                      <div><span className="text-gray-500">Created:</span> {formatTimeAgo(selectedApplication.created_at)}</div>
                      {selectedApplication.estimated_completion && (
                        <div><span className="text-gray-500">ETA:</span> {formatTimeAgo(selectedApplication.estimated_completion)}</div>
                      )}
                    </div>
                  </div>

                  {selectedApplication.status === 'running' && selectedApplication.progress && (
                    <div>
                      <h4 className="font-semibold mb-2">Progress</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Completion</span>
                          <span>{selectedApplication.progress}%</span>
                        </div>
                        <Progress value={selectedApplication.progress} className="w-full" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Performance Metrics</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-blue-600 font-medium">Quantum Speedup</div>
                        <div className="text-2xl font-bold text-blue-600">{selectedApplication.quantum_speedup}x</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-green-600 font-medium">Accuracy</div>
                        <div className="text-2xl font-bold text-green-600">{selectedApplication.accuracy}%</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-purple-600 font-medium">Cost Savings</div>
                        <div className="text-2xl font-bold text-purple-600">{selectedApplication.performance_metrics.cost_savings}%</div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <div className="text-orange-600 font-medium">Improvement</div>
                        <div className="text-2xl font-bold text-orange-600">+{selectedApplication.performance_metrics.accuracy_improvement}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedApplication.results && (
                <div>
                  <h4 className="font-semibold mb-3">Results</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(selectedApplication.results).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500 capitalize">{key.replace(/_/g, ' ')}</div>
                        <div className="font-semibold">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Results
                </Button>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
                {selectedApplication.status === 'running' && (
                  <Button variant="outline">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
                {selectedApplication.status === 'completed' && (
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Rocket className="w-4 h-4 mr-2" />
                    Deploy to Production
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default QuantumApplicationsDashboard;