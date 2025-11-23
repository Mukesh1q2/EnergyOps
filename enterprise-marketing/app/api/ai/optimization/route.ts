import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface OptimizationRequest {
  problemType: 'trading' | 'portfolio' | 'dispatch' | 'scheduling' | 'resource_allocation';
  objective: 'maximize_profit' | 'minimize_cost' | 'maximize_efficiency' | 'minimize_risk' | 'optimize_reliability';
  constraints: Record<string, any>;
  timeHorizon: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  assets: Array<{
    id: string;
    type: 'generator' | 'storage' | 'load' | 'transmission' | 'trading';
    capacity: number;
    current_output: number;
    cost_per_unit: number;
    efficiency?: number;
    min_output?: number;
    max_output?: number;
  }>;
  parameters?: {
    risk_tolerance: 'low' | 'medium' | 'high';
    sustainability_weight: number; // 0-1
    carbon_limit?: number;
    budget_limit?: number;
    target_availability?: number;
  };
}

interface OptimizationResult {
  id: string;
  problemType: string;
  objective: string;
  timestamp: string;
  solution: {
    decisions: Array<{
      asset_id: string;
      asset_type: string;
      recommended_action: string;
      new_output: number;
      change_from_current: number;
      confidence: number;
      impact: {
        cost: number;
        profit: number;
        efficiency: number;
        risk: number;
      };
    }>;
    total_metrics: {
      total_cost: number;
      total_profit: number;
      total_efficiency: number;
      risk_score: number;
      carbon_emissions: number;
      reliability_index: number;
    };
  };
  algorithm: {
    name: string;
    version: string;
    convergence_iterations: number;
    processing_time: number;
    optimality_gap: number;
  };
  sensitivity_analysis: {
    parameter: string;
    baseline: number;
    variation: string;
    impact_on_objective: number;
  }[];
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    rationale: string;
    expected_benefit: string;
    implementation_effort: 'low' | 'medium' | 'high';
    timeline: string;
  }>;
  alternative_scenarios: Array<{
    scenario_name: string;
    objective_value: number;
    key_changes: string[];
    trade_offs: string[];
  }>;
  monitoring: {
    kpis: Array<{
      metric: string;
      current_value: number;
      target_value: number;
      status: 'on_track' | 'needs_attention' | 'critical';
    }>;
    alerts: Array<{
      type: 'opportunity' | 'risk' | 'constraint';
      message: string;
      severity: 'info' | 'warning' | 'critical';
    }>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: OptimizationRequest = await request.json();
    const { problemType, objective, constraints, timeHorizon, assets, parameters } = body;

    if (!problemType || !objective || !timeHorizon || !assets) {
      return NextResponse.json(
        { error: 'Missing required fields: problemType, objective, timeHorizon, assets' },
        { status: 400 }
      );
    }

    if (!assets.length) {
      return NextResponse.json(
        { error: 'Assets array cannot be empty' },
        { status: 400 }
      );
    }

    // Perform optimization based on problem type
    const optimization = await performOptimization({
      problemType,
      objective,
      constraints,
      timeHorizon,
      assets,
      parameters: parameters || {
        risk_tolerance: 'medium',
        sustainability_weight: 0.5
      }
    });

    return NextResponse.json({
      optimization,
      metadata: {
        requestId: `opt_${Date.now()}`,
        problemType,
        objective,
        timeHorizon,
        assets_count: assets.length
      }
    });
  } catch (error) {
    console.error('Optimization API Error:', error);
    return NextResponse.json(
      { error: 'Optimization service unavailable' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const problemType = searchParams.get('problemType');
    const objective = searchParams.get('objective');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Generate historical optimization results
    const optimizations: OptimizationResult[] = [];
    
    const problemTypes = ['trading', 'portfolio', 'dispatch', 'scheduling', 'resource_allocation'];
    const objectives = ['maximize_profit', 'minimize_cost', 'maximize_efficiency', 'minimize_risk', 'optimize_reliability'];
    
    // Generate sample optimizations for the last 7 days
    for (let day = 0; day < 7; day++) {
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() - day);
      
      // Generate 3-8 optimizations per day
      const dailyOptimizations = Math.floor(Math.random() * 6) + 3;
      
      for (let i = 0; i < dailyOptimizations; i++) {
        const timestamp = new Date(baseDate.getTime() + Math.random() * 24 * 60 * 60 * 1000);
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        const obj = objectives[Math.floor(Math.random() * objectives.length)];
        
        optimizations.push(generateOptimization({
          timestamp: timestamp.toISOString(),
          problemType: type,
          objective: obj
        }));
      }
    }

    // Filter optimizations based on query parameters
    let filteredOptimizations = optimizations;
    
    if (problemType) {
      filteredOptimizations = filteredOptimizations.filter(opt => opt.problemType === problemType);
    }
    
    if (objective) {
      filteredOptimizations = filteredOptimizations.filter(opt => opt.objective === objective);
    }
    
    if (startDate) {
      filteredOptimizations = filteredOptimizations.filter(opt => new Date(opt.timestamp) >= new Date(startDate));
    }
    
    if (endDate) {
      filteredOptimizations = filteredOptimizations.filter(opt => new Date(opt.timestamp) <= new Date(endDate));
    }

    // Apply pagination
    const totalOptimizations = filteredOptimizations.length;
    const paginatedOptimizations = filteredOptimizations.slice(offset, offset + limit);

    // Calculate summary statistics
    const summary = {
      totalOptimizations,
      averageObjectiveValue: filteredOptimizations.reduce((sum, opt) => {
        const value = getObjectiveValue(opt);
        return sum + value;
      }, 0) / filteredOptimizations.length,
      averageProcessingTime: filteredOptimizations.reduce((sum, opt) => sum + opt.algorithm.processing_time, 0) / filteredOptimizations.length,
      convergenceRate: filteredOptimizations.filter(opt => opt.algorithm.optimality_gap < 0.01).length / filteredOptimizations.length,
      problemTypes: getProblemTypeDistribution(filteredOptimizations),
      objectives: getObjectiveDistribution(filteredOptimizations)
    };

    return NextResponse.json({
      optimizations: paginatedOptimizations,
      summary,
      pagination: {
        total: totalOptimizations,
        limit,
        offset,
        hasMore: offset + limit < totalOptimizations
      }
    });
  } catch (error) {
    console.error('Get Optimizations Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve optimizations' },
      { status: 500 }
    );
  }
}

async function performOptimization(params: any): Promise<OptimizationResult> {
  const { problemType, objective, constraints, timeHorizon, assets, parameters } = params;
  const startTime = Date.now();

  // Simulate different optimization algorithms based on problem type
  let solution: any;
  let algorithm: any;

  switch (problemType) {
    case 'trading':
      ({ solution, algorithm } = optimizeTrading(assets, objective, parameters));
      break;
    case 'portfolio':
      ({ solution, algorithm } = optimizePortfolio(assets, objective, parameters));
      break;
    case 'dispatch':
      ({ solution, algorithm } = optimizeDispatch(assets, objective, parameters));
      break;
    case 'scheduling':
      ({ solution, algorithm } = optimizeScheduling(assets, objective, parameters));
      break;
    case 'resource_allocation':
      ({ solution, algorithm } = optimizeResourceAllocation(assets, objective, parameters));
      break;
    default:
      throw new Error(`Unsupported problem type: ${problemType}`);
  }

  const processingTime = Date.now() - startTime;

  return generateOptimization({
    timestamp: new Date().toISOString(),
    problemType,
    objective,
    solution,
    algorithm: {
      ...algorithm,
      processing_time: processingTime
    }
  });
}

function optimizeTrading(assets: any[], objective: string, parameters: any) {
  const tradingAssets = assets.filter(a => a.type === 'trading');
  
  const decisions = tradingAssets.map(asset => {
    const currentOutput = asset.current_output || 0;
    const recommendedAction = currentOutput > asset.capacity * 0.8 ? 'reduce_position' : 
                            currentOutput < asset.capacity * 0.2 ? 'increase_position' : 'maintain';
    
    const newOutput = recommendedAction === 'increase_position' ? currentOutput * 1.2 :
                     recommendedAction === 'reduce_position' ? currentOutput * 0.8 : currentOutput;
    
    return {
      asset_id: asset.id,
      asset_type: asset.type,
      recommended_action: recommendedAction,
      new_output: Math.min(newOutput, asset.capacity),
      change_from_current: newOutput - currentOutput,
      confidence: Math.random() * 0.3 + 0.7,
      impact: {
        cost: (asset.cost_per_unit || 0) * Math.abs(newOutput - currentOutput),
        profit: (Math.random() - 0.3) * 10000, // Random profit change
        efficiency: Math.random() * 20,
        risk: Math.random() * 30
      }
    };
  });

  const algorithm = {
    name: 'Genetic Algorithm Optimization',
    version: '3.2.1',
    convergence_iterations: Math.floor(Math.random() * 500) + 100,
    optimality_gap: Math.random() * 0.05 + 0.005
  };

  return { solution: { decisions }, algorithm };
}

function optimizePortfolio(assets: any[], objective: string, parameters: any) {
  const portfolioAssets = assets.filter(a => a.type === 'generator' || a.type === 'storage');
  
  const decisions = portfolioAssets.map(asset => {
    const currentOutput = asset.current_output || asset.capacity * 0.5;
    const riskTolerance = parameters?.risk_tolerance || 'medium';
    
    let recommendedAction = 'maintain';
    let confidence = 0.8;
    
    if (riskTolerance === 'high') {
      if (Math.random() > 0.5) recommendedAction = 'increase_allocation';
      confidence = 0.75;
    } else if (riskTolerance === 'low') {
      recommendedAction = 'reduce_exposure';
      confidence = 0.85;
    }
    
    const change = recommendedAction === 'increase_allocation' ? asset.capacity * 0.1 :
                  recommendedAction === 'reduce_exposure' ? -asset.capacity * 0.15 : 0;
    
    const newOutput = Math.max(0, Math.min(asset.capacity, currentOutput + change));
    
    return {
      asset_id: asset.id,
      asset_type: asset.type,
      recommended_action: recommendedAction,
      new_output: newOutput,
      change_from_current: newOutput - currentOutput,
      confidence,
      impact: {
        cost: change * (asset.cost_per_unit || 0),
        profit: Math.random() * 50000 - 10000,
        efficiency: Math.random() * 15 + 85,
        risk: recommendedAction === 'increase_allocation' ? Math.random() * 20 + 10 : 
              recommendedAction === 'reduce_exposure' ? Math.random() * 10 + 5 : Math.random() * 15
      }
    };
  });

  const algorithm = {
    name: 'Modern Portfolio Theory with ML',
    version: '2.4.0',
    convergence_iterations: Math.floor(Math.random() * 800) + 200,
    optimality_gap: Math.random() * 0.02 + 0.001
  };

  return { solution: { decisions }, algorithm };
}

function optimizeDispatch(assets: any[], objective: string, parameters: any) {
  const dispatchAssets = assets.filter(a => a.type === 'generator' || a.type === 'load');
  
  const decisions = dispatchAssets.map(asset => {
    const currentOutput = asset.current_output || 0;
    const efficiency = asset.efficiency || 0.85;
    
    // Optimize based on efficiency and cost
    let recommendedAction = 'maintain';
    let newOutput = currentOutput;
    
    if (efficiency > 0.9 && (asset.cost_per_unit || 0) < 50) {
      recommendedAction = 'increase_generation';
      newOutput = Math.min(asset.capacity || 1000, currentOutput * 1.3);
    } else if (efficiency < 0.7 || (asset.cost_per_unit || 0) > 100) {
      recommendedAction = 'reduce_generation';
      newOutput = Math.max(asset.min_output || 0, currentOutput * 0.7);
    }
    
    const change = newOutput - currentOutput;
    
    return {
      asset_id: asset.id,
      asset_type: asset.type,
      recommended_action: recommendedAction,
      new_output: newOutput,
      change_from_current: change,
      confidence: Math.random() * 0.25 + 0.75,
      impact: {
        cost: change * (asset.cost_per_unit || 0),
        profit: Math.random() * 30000 - 5000,
        efficiency: efficiency * 100 + Math.random() * 10,
        risk: Math.random() * 20
      }
    };
  });

  const algorithm = {
    name: 'Economic Dispatch with Lambda Iteration',
    version: '4.1.2',
    convergence_iterations: Math.floor(Math.random() * 300) + 50,
    optimality_gap: Math.random() * 0.03 + 0.002
  };

  return { solution: { decisions }, algorithm };
}

function optimizeScheduling(assets: any[], objective: string, parameters: any) {
  const allAssets = assets;
  
  const decisions = allAssets.map(asset => {
    const currentOutput = asset.current_output || 0;
    
    // Time-based optimization (simplified)
    const hour = new Date().getHours();
    let recommendedAction = 'maintain';
    
    if (hour >= 18 && hour <= 22) { // Peak hours
      if (asset.type === 'generator' && Math.random() > 0.3) {
        recommendedAction = 'increase_generation';
      } else if (asset.type === 'storage' && Math.random() > 0.5) {
        recommendedAction = 'discharge';
      }
    } else if (hour >= 2 && hour <= 6) { // Off-peak hours
      if (asset.type === 'storage' && Math.random() > 0.4) {
        recommendedAction = 'charge';
      }
    }
    
    const change = recommendedAction.includes('increase') ? asset.capacity * 0.2 :
                  recommendedAction === 'reduce' ? -asset.capacity * 0.15 : 0;
    
    const newOutput = Math.max(0, Math.min(asset.capacity || 1000, currentOutput + change));
    
    return {
      asset_id: asset.id,
      asset_type: asset.type,
      recommended_action: recommendedAction,
      new_output: newOutput,
      change_from_current: newOutput - currentOutput,
      confidence: Math.random() * 0.3 + 0.7,
      impact: {
        cost: change * (asset.cost_per_unit || 0),
        profit: Math.random() * 40000 - 15000,
        efficiency: Math.random() * 20 + 80,
        risk: Math.random() * 25
      }
    };
  });

  const algorithm = {
    name: 'Unit Commitment with Mixed Integer Programming',
    version: '3.8.5',
    convergence_iterations: Math.floor(Math.random() * 1200) + 500,
    optimality_gap: Math.random() * 0.01 + 0.001
  };

  return { solution: { decisions }, algorithm };
}

function optimizeResourceAllocation(assets: any[], objective: string, parameters: any) {
  const allAssets = assets;
  
  const decisions = allAssets.map(asset => {
    const currentOutput = asset.current_output || 0;
    const allocationEfficiency = Math.random() * 0.3 + 0.7;
    
    let recommendedAction = 'reallocate_optimally';
    let newOutput = currentOutput * allocationEfficiency;
    
    if (Math.random() > 0.6) {
      recommendedAction = 'increase_allocation';
      newOutput = Math.min(asset.capacity || 1000, currentOutput * 1.15);
    } else if (Math.random() > 0.8) {
      recommendedAction = 'decrease_allocation';
      newOutput = Math.max(asset.min_output || 0, currentOutput * 0.9);
    }
    
    const change = newOutput - currentOutput;
    
    return {
      asset_id: asset.id,
      asset_type: asset.type,
      recommended_action: recommendedAction,
      new_output: newOutput,
      change_from_current: change,
      confidence: Math.random() * 0.25 + 0.75,
      impact: {
        cost: change * (asset.cost_per_unit || 0),
        profit: Math.random() * 35000 - 8000,
        efficiency: Math.random() * 25 + 75,
        risk: Math.random() * 20
      }
    };
  });

  const algorithm = {
    name: 'Linear Programming with Simplex Method',
    version: '2.9.3',
    convergence_iterations: Math.floor(Math.random() * 400) + 100,
    optimality_gap: Math.random() * 0.04 + 0.003
  };

  return { solution: { decisions }, algorithm };
}

function generateOptimization(params: any): OptimizationResult {
  const { timestamp, problemType, objective, solution, algorithm } = params;

  const decisions = solution?.decisions || generateMockDecisions(problemType);
  const totalMetrics = calculateTotalMetrics(decisions);
  const sensitivityAnalysis = generateSensitivityAnalysis(objective);
  const recommendations = generateOptimizationRecommendations(problemType, objective);
  const alternativeScenarios = generateAlternativeScenarios(objective);
  const monitoring = generateMonitoring(decisions);

  return {
    id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    problemType: problemType || 'trading',
    objective: objective || 'maximize_profit',
    timestamp,
    solution: {
      decisions,
      total_metrics: totalMetrics
    },
    algorithm: algorithm || {
      name: 'Mixed Integer Programming',
      version: '1.0.0',
      convergence_iterations: 250,
      processing_time: Math.random() * 5000 + 1000,
      optimality_gap: 0.01
    },
    sensitivity_analysis: sensitivityAnalysis,
    recommendations,
    alternative_scenarios: alternativeScenarios,
    monitoring
  };
}

function generateMockDecisions(problemType: string) {
  const mockAssets = [
    { id: 'gen_001', type: 'generator' },
    { id: 'gen_002', type: 'generator' },
    { id: 'storage_001', type: 'storage' },
    { id: 'load_001', type: 'load' }
  ];

  return mockAssets.map(asset => ({
    asset_id: asset.id,
    asset_type: asset.type,
    recommended_action: ['increase', 'maintain', 'reduce'][Math.floor(Math.random() * 3)],
    new_output: Math.random() * 1000,
    change_from_current: (Math.random() - 0.5) * 200,
    confidence: Math.random() * 0.3 + 0.7,
    impact: {
      cost: Math.random() * 50000 - 25000,
      profit: Math.random() * 100000 - 50000,
      efficiency: Math.random() * 30 + 70,
      risk: Math.random() * 40
    }
  }));
}

function calculateTotalMetrics(decisions: any[]) {
  const totalCost = decisions.reduce((sum, d) => sum + d.impact.cost, 0);
  const totalProfit = decisions.reduce((sum, d) => sum + d.impact.profit, 0);
  const avgEfficiency = decisions.reduce((sum, d) => sum + d.impact.efficiency, 0) / decisions.length;
  const avgRisk = decisions.reduce((sum, d) => sum + d.impact.risk, 0) / decisions.length;

  return {
    total_cost: totalCost,
    total_profit: totalProfit,
    total_efficiency: avgEfficiency,
    risk_score: avgRisk,
    carbon_emissions: Math.random() * 1000 + 500,
    reliability_index: Math.random() * 20 + 80
  };
}

function generateSensitivityAnalysis(objective: string) {
  const parameters = ['risk_tolerance', 'cost_coefficient', 'efficiency_factor', 'carbon_limit'];
  
  return parameters.map(param => ({
    parameter: param,
    baseline: Math.random() * 100 + 50,
    variation: '±10%',
    impact_on_objective: Math.random() * 40 + 10
  }));
}

function generateOptimizationRecommendations(problemType: string, objective: string) {
  const recommendations = [
    {
      priority: 'high' as const,
      action: 'Implement recommended changes',
      rationale: 'Optimization shows significant improvement potential',
      expected_benefit: '15-25% performance improvement',
      implementation_effort: 'medium' as const,
      timeline: '2-3 weeks'
    }
  ];

  if (problemType === 'trading') {
    recommendations.push({
      priority: 'medium' as const,
      action: 'Review market conditions',
      rationale: 'Market volatility may affect trading strategy',
      expected_benefit: 'Reduced market risk',
      implementation_effort: 'low' as const,
      timeline: '1 week'
    });
  }

  return recommendations;
}

function generateAlternativeScenarios(objective: string) {
  return [
    {
      scenario_name: 'Conservative Approach',
      objective_value: Math.random() * 50000 + 20000,
      key_changes: ['Lower risk tolerance', 'More conservative allocations'],
      trade_offs: ['Lower potential returns', 'Higher stability']
    },
    {
      scenario_name: 'Aggressive Strategy',
      objective_value: Math.random() * 150000 + 80000,
      key_changes: ['Higher risk tolerance', 'Optimized for maximum returns'],
      trade_offs: ['Increased volatility', 'Higher potential losses']
    }
  ];
}

function generateMonitoring(decisions: any[]) {
  return {
    kpis: [
      {
        metric: 'System Efficiency',
        current_value: Math.random() * 20 + 80,
        target_value: 95,
        status: 'on_track' as const
      },
      {
        metric: 'Cost Optimization',
        current_value: Math.random() * 30 + 70,
        target_value: 90,
        status: 'needs_attention' as const
      }
    ],
    alerts: [
      {
        type: 'opportunity' as const,
        message: 'Optimization opportunity detected in portfolio allocation',
        severity: 'info' as const
      }
    ]
  };
}

function getObjectiveValue(optimization: OptimizationResult): number {
  return optimization.solution.total_metrics.total_profit || 
         Math.random() * 100000 + 10000;
}

function getProblemTypeDistribution(optimizations: OptimizationResult[]) {
  const distribution = optimizations.reduce((acc, opt) => {
    acc[opt.problemType] = (acc[opt.problemType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(distribution).map(([type, count]) => ({
    type,
    count
  }));
}

function getObjectiveDistribution(optimizations: OptimizationResult[]) {
  const distribution = optimizations.reduce((acc, opt) => {
    acc[opt.objective] = (acc[opt.objective] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(distribution).map(([objective, count]) => ({
    objective,
    count
  }));
}