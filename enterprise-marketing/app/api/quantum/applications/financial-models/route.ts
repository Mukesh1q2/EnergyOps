import { NextRequest, NextResponse } from 'next/server';
import { quantumFinancialModels } from '@/lib/quantum-applications/financial-models';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      model_type,
      portfolio_data,
      market_scenarios,
      risk_tolerance,
      time_horizon,
      optimization_objective,
      quantum_algorithm,
      constraints
    } = body;

    // Validate input
    if (!model_type || !portfolio_data) {
      return NextResponse.json(
        { error: 'Missing required parameters: model_type, portfolio_data' },
        { status: 400 }
      );
    }

    const result = await quantumFinancialModels({
      model_type,
      portfolio_data,
      market_scenarios,
      risk_tolerance,
      time_horizon,
      optimization_objective,
      quantum_algorithm,
      constraints
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Quantum Financial Models API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const model_id = url.searchParams.get('model_id');
    const model_type = url.searchParams.get('model_type');
    const status = url.searchParams.get('status');

    // Mock data for demonstration
    const financial_models = {
      models: [
        {
          id: 'model_001',
          type: 'portfolio_optimization',
          status: 'completed',
          created_at: new Date().toISOString(),
          quantum_algorithm: 'QAOA',
          computation_time: '4.7s',
          expected_return: 12.8,
          volatility: 18.2,
          sharpe_ratio: 0.85,
          var_99: -15.7,
          cvar_99: -22.3,
          results: {
            optimal_allocation: {
              stocks: 0.45,
              bonds: 0.30,
              commodities: 0.15,
              crypto: 0.05,
              real_estate: 0.05
            },
            risk_metrics: {
              portfolio_beta: 0.92,
              maximum_drawdown: -12.4,
              win_rate: 0.68,
              profit_factor: 1.85,
              information_ratio: 0.78
            },
            backtesting_results: {
              total_return: 18.7,
              annualized_return: 12.8,
              max_drawdown: -8.9,
              calmar_ratio: 1.44,
              sharpe_ratio: 0.85,
              sortino_ratio: 1.12
            },
            stress_testing: {
              market_crash_2008: -18.3,
              covid_crash_2020: -12.1,
              rate_hike_shock: -6.7,
              credit_crunch: -9.2
            }
          },
          quantum_metrics: {
            quantum_advantage: 4.2,
            circuit_depth: 35,
            gate_count: 218,
            fidelity: 0.983,
            error_rate: 0.0017,
            quantum_volume_used: 128
          }
        },
        {
          id: 'model_002',
          type: 'risk_analysis',
          status: 'running',
          created_at: new Date(Date.now() - 480000).toISOString(),
          quantum_algorithm: 'VQE',
          progress: 85,
          estimated_completion: new Date(Date.now() + 60000).toISOString(),
          results: {
            risk_decomposition: {
              market_risk: 0.65,
              credit_risk: 0.20,
              operational_risk: 0.10,
              liquidity_risk: 0.05
            },
            tail_risk_analysis: {
              extreme_value_index: 0.23,
              tail_dependence: 0.78,
              copula_type: 't-copula'
            }
          },
          quantum_metrics: {
            quantum_advantage: 3.1,
            circuit_depth: 28,
            gate_count: 165,
            fidelity: 0.976,
            error_rate: 0.0024
          }
        },
        {
          id: 'model_003',
          type: 'derivatives_pricing',
          status: 'completed',
          created_at: new Date(Date.now() - 720000).toISOString(),
          quantum_algorithm: 'Quantum Monte Carlo',
          computation_time: '8.3s',
          options_priced: 150,
          average_price: 45.67,
          pricing_accuracy: 0.98,
          results: {
            option_prices: [
              { strike: 40, call_price: 8.23, put_price: 2.56, greeks: { delta: 0.65, gamma: 0.042, theta: -0.08, vega: 0.32 } },
              { strike: 45, call_price: 5.12, put_price: 4.18, greeks: { delta: 0.52, gamma: 0.038, theta: -0.06, vega: 0.28 } },
              { strike: 50, call_price: 2.87, put_price: 6.45, greeks: { delta: 0.38, gamma: 0.034, theta: -0.04, vega: 0.24 } }
            ],
            volatility_smile: {
              implied_volatilities: [0.22, 0.24, 0.26, 0.28, 0.30],
              strike_range: [35, 40, 45, 50, 55]
            },
            monte_carlo_convergence: {
              paths_used: 100000,
              convergence_achieved: true,
              confidence_interval: [0.025, 0.975]
            }
          },
          quantum_metrics: {
            quantum_advantage: 6.8,
            circuit_depth: 45,
            gate_count: 324,
            fidelity: 0.991,
            error_rate: 0.0009,
            quantum_volume_used: 256
          }
        }
      ],
      algorithms: [
        {
          name: 'QAOA',
          description: 'Quantum Approximate Optimization for Portfolio Selection',
          best_for: 'Combinatorial optimization, asset allocation',
          qubits_required: '30-100',
          quantum_advantage_factor: '3-8x',
          accuracy: '95-98%'
        },
        {
          name: 'VQE',
          description: 'Variational Quantum Eigensolver for Risk Analysis',
          best_for: 'Continuous optimization, risk metrics',
          qubits_required: '20-60',
          quantum_advantage_factor: '2-5x',
          accuracy: '90-95%'
        },
        {
          name: 'Quantum Monte Carlo',
          description: 'Quantum-enhanced Monte Carlo for derivatives pricing',
          best_for: 'Path-dependent derivatives, exotic options',
          qubits_required: '50-200',
          quantum_advantage_factor: '5-15x',
          accuracy: '97-99%'
        },
        {
          name: 'Quantum Machine Learning',
          description: 'Quantum ML for pattern recognition and prediction',
          best_for: 'Market prediction, anomaly detection',
          qubits_required: '25-80',
          quantum_advantage_factor: '2-10x',
          accuracy: '85-95%'
        }
      ],
      model_metrics: {
        total_models: 89,
        completed_models: 67,
        running_models: 8,
        pending_models: 14,
        average_accuracy: 94.2,
        total_cost_savings: 1250000,
        average_quantum_advantage: 4.8,
        risk_reduction: 23.7,
        return_improvement: 18.9,
        computational_speedup: 5.2
      }
    };

    // Filter by parameters if provided
    let filtered_models = financial_models.models;
    
    if (model_id) {
      filtered_models = filtered_models.filter(model => model.id === model_id);
    }
    
    if (model_type) {
      filtered_models = filtered_models.filter(model => model.type === model_type);
    }
    
    if (status) {
      filtered_models = filtered_models.filter(model => model.status === status);
    }

    return NextResponse.json({
      models: filtered_models,
      algorithms: financial_models.algorithms,
      metrics: financial_models.model_metrics
    });
  } catch (error) {
    console.error('Quantum Financial Models GET API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}