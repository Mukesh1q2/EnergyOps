import { NextRequest, NextResponse } from 'next/server';
import { quantumEnergyOptimization } from '@/lib/quantum-applications/energy-optimization';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      optimization_type,
      grid_data,
      energy_sources,
      demand_profile,
      constraints,
      optimization_horizon,
      quantum_algorithm
    } = body;

    // Validate input
    if (!optimization_type || !grid_data || !energy_sources) {
      return NextResponse.json(
        { error: 'Missing required parameters: optimization_type, grid_data, energy_sources' },
        { status: 400 }
      );
    }

    const result = await quantumEnergyOptimization({
      optimization_type,
      grid_data,
      energy_sources,
      demand_profile,
      constraints,
      optimization_horizon,
      quantum_algorithm
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Quantum Energy Optimization API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const optimization_id = url.searchParams.get('optimization_id');
    const status = url.searchParams.get('status');

    // Mock data for demonstration
    const optimization_results = {
      optimizations: [
        {
          id: 'opt_001',
          type: 'grid_optimization',
          status: 'completed',
          created_at: new Date().toISOString(),
          quantum_algorithm: 'QAOA',
          optimization_time: '2.3s',
          energy_savings: 18.5,
          cost_reduction: 12500,
          grid_efficiency: 94.2,
          peak_demand_reduction: 23.1,
          renewable_integration: 89.3,
          carbon_reduction: 156.8,
          results: {
            optimal_power_flow: {
              total_power_generated: 15420.5,
              total_power_consumed: 15387.2,
              transmission_losses: 2.1,
              grid_stability_index: 0.94
            },
            resource_allocation: {
              coal_plants: { capacity: 0, utilization: 0 },
              gas_plants: { capacity: 0, utilization: 0 },
              solar_farms: { capacity: 8750, utilization: 0.76 },
              wind_farms: { capacity: 4250, utilization: 0.68 },
              hydro_plants: { capacity: 1650, utilization: 0.82 },
              battery_storage: { capacity: 770, state_of_charge: 0.85 }
            },
            cost_breakdown: {
              generation_cost: 78950,
              transmission_cost: 2340,
              storage_cost: 1890,
              total_cost: 83180,
              cost_per_mwh: 42.8
            },
            emissions: {
              co2_generated: 123.5,
              co2_avoided: 156.8,
              net_co2_impact: -33.3,
              renewable_percentage: 89.3
            }
          },
          quantum_metrics: {
            quantum_advantage: 3.7,
            circuit_depth: 28,
            gate_count: 156,
            fidelity: 0.985,
            error_rate: 0.0015,
            quantum_volume_used: 128
          }
        },
        {
          id: 'opt_002',
          type: 'demand_response',
          status: 'running',
          created_at: new Date(Date.now() - 300000).toISOString(),
          quantum_algorithm: 'VQE',
          progress: 78,
          estimated_completion: new Date(Date.now() + 120000).toISOString(),
          results: {
            demand_shifting_potential: 15.2,
            load_factor_improvement: 8.7,
            peak_reduction_estimate: 19.3,
            cost_savings_estimate: 8750
          },
          quantum_metrics: {
            quantum_advantage: 2.9,
            circuit_depth: 22,
            gate_count: 134,
            fidelity: 0.978,
            error_rate: 0.0022
          }
        },
        {
          id: 'opt_003',
          type: 'energy_storage_optimization',
          status: 'pending',
          created_at: new Date(Date.now() - 180000).toISOString(),
          quantum_algorithm: 'QAOA',
          results: {},
          quantum_metrics: {}
        }
      ],
      algorithms: [
        {
          name: 'QAOA',
          description: 'Quantum Approximate Optimization Algorithm',
          best_for: 'Combinatorial optimization problems',
          qubits_required: '20-50',
          quantum_advantage_factor: '2-10x',
          current_performance: 'excellent'
        },
        {
          name: 'VQE',
          description: 'Variational Quantum Eigensolver',
          best_for: 'Optimization with continuous variables',
          qubits_required: '10-30',
          quantum_advantage_factor: '1.5-5x',
          current_performance: 'good'
        },
        {
          name: 'Quantum Annealing',
          description: 'Quantum annealing for optimization',
          best_for: 'Large-scale optimization problems',
          qubits_required: '50-1000',
          quantum_advantage_factor: '5-50x',
          current_performance: 'excellent'
        }
      ],
      grid_optimization_metrics: {
        total_optimizations: 247,
        completed_optimizations: 189,
        running_optimizations: 12,
        pending_optimizations: 46,
        average_energy_savings: 16.8,
        total_cost_savings: 2847500,
        average_quantum_advantage: 4.2,
        grid_efficiency_improvement: 8.3,
        renewable_integration_improvement: 12.7,
        carbon_reduction_total: 45680
      }
    };

    // Filter by ID or status if provided
    let filtered_results = optimization_results.optimizations;
    
    if (optimization_id) {
      filtered_results = filtered_results.filter(opt => opt.id === optimization_id);
    }
    
    if (status) {
      filtered_results = filtered_results.filter(opt => opt.status === status);
    }

    return NextResponse.json({
      optimizations: filtered_results,
      algorithms: optimization_results.algorithms,
      metrics: optimization_results.grid_optimization_metrics
    });
  } catch (error) {
    console.error('Quantum Energy Optimization GET API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}