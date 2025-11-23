import { NextRequest, NextResponse } from 'next/server';
import { quantumSupplyChain } from '@/lib/quantum-applications/supply-chain';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      optimization_type,
      supply_chain_data,
      network_topology,
      demand_forecast,
      constraints,
      time_horizon,
      quantum_algorithm,
      optimization_objective
    } = body;

    // Validate input
    if (!optimization_type || !supply_chain_data || !network_topology) {
      return NextResponse.json(
        { error: 'Missing required parameters: optimization_type, supply_chain_data, network_topology' },
        { status: 400 }
      );
    }

    const result = await quantumSupplyChain({
      optimization_type,
      supply_chain_data,
      network_topology,
      demand_forecast,
      constraints,
      time_horizon,
      quantum_algorithm,
      optimization_objective
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Quantum Supply Chain API Error:', error);
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
    const optimization_type = url.searchParams.get('optimization_type');
    const status = url.searchParams.get('status');

    // Mock data for demonstration
    const supply_chain_optimizations = {
      optimizations: [
        {
          id: 'sc_opt_001',
          type: 'route_optimization',
          status: 'completed',
          created_at: new Date().toISOString(),
          quantum_algorithm: 'QAOA',
          computation_time: '3.8s',
          cost_savings: 23.7,
          delivery_time_reduction: 18.5,
          fuel_efficiency: 15.2,
          co2_reduction: 12.8,
          results: {
            optimal_routes: [
              {
                route_id: 'route_001',
                origin: 'warehouse_alpha',
                destination: 'customer_zone_north',
                distance: 245.7,
                estimated_time: '4h 32m',
                cost: 1850.50,
                fuel_consumption: 87.2,
                carbon_emission: 185.4
              },
              {
                route_id: 'route_002',
                origin: 'warehouse_beta',
                destination: 'customer_zone_south',
                distance: 189.3,
                estimated_time: '3h 45m',
                cost: 1425.75,
                fuel_consumption: 67.8,
                carbon_emission: 144.2
              }
            ],
            fleet_utilization: {
              total_vehicles: 150,
              utilized_vehicles: 142,
              utilization_rate: 94.7,
              idle_time_reduction: 28.3,
              maintenance_optimization: 15.6
            },
            delivery_performance: {
              on_time_delivery: 96.8,
              customer_satisfaction: 4.7,
              complaint_reduction: 32.1,
              return_rate: 2.3
            }
          },
          quantum_metrics: {
            quantum_advantage: 4.1,
            circuit_depth: 32,
            gate_count: 198,
            fidelity: 0.981,
            error_rate: 0.0019,
            quantum_volume_used: 128
          }
        },
        {
          id: 'sc_opt_002',
          type: 'inventory_optimization',
          status: 'running',
          created_at: new Date(Date.now() - 420000).toISOString(),
          quantum_algorithm: 'VQE',
          progress: 72,
          estimated_completion: new Date(Date.now() + 90000).toISOString(),
          results: {
            inventory_levels: {
              current_inventory_value: 15750000,
              optimized_inventory_value: 13890000,
              reduction_percentage: 11.8,
              stockout_risk_reduction: 34.2
            },
            carrying_cost_savings: 892000,
            order_frequency_optimization: 18.5,
            safety_stock_optimization: 22.7
          },
          quantum_metrics: {
            quantum_advantage: 3.3,
            circuit_depth: 26,
            gate_count: 154,
            fidelity: 0.975,
            error_rate: 0.0025
          }
        },
        {
          id: 'sc_opt_003',
          type: 'supplier_selection',
          status: 'completed',
          created_at: new Date(Date.now() - 600000).toISOString(),
          quantum_algorithm: 'QAOA',
          computation_time: '5.1s',
          cost_reduction: 19.3,
          risk_reduction: 25.8,
          quality_improvement: 12.1,
          delivery_reliability: 94.7,
          results: {
            supplier_allocation: {
              primary_suppliers: 8,
              backup_suppliers: 4,
              diversity_score: 87.5,
              concentration_risk: 15.2
            },
            cost_analysis: {
              total_procurement_cost: 28400000,
              optimized_cost: 22925000,
              savings_percentage: 19.3,
              cost_per_unit_reduction: 8.7
            },
            risk_metrics: {
              supply_disruption_risk: 12.5,
              quality_risk: 8.3,
              financial_risk: 6.7,
              geopolitical_risk: 4.2
            }
          },
          quantum_metrics: {
            quantum_advantage: 4.8,
            circuit_depth: 38,
            gate_count: 245,
            fidelity: 0.987,
            error_rate: 0.0013,
            quantum_volume_used: 128
          }
        }
      ],
      algorithms: [
        {
          name: 'QAOA',
          description: 'Quantum Approximate Optimization for Route & Inventory Problems',
          best_for: 'Combinatorial optimization, vehicle routing, inventory management',
          qubits_required: '25-80',
          quantum_advantage_factor: '3-8x',
          accuracy: '94-98%'
        },
        {
          name: 'VQE',
          description: 'Variational Quantum Eigensolver for Supply Chain Optimization',
          best_for: 'Continuous optimization, resource allocation',
          qubits_required: '15-50',
          quantum_advantage_factor: '2-5x',
          accuracy: '88-95%'
        },
        {
          name: 'Quantum Annealing',
          description: 'Quantum annealing for complex supply chain problems',
          best_for: 'Large-scale network optimization, multi-objective problems',
          qubits_required: '100-2000',
          quantum_advantage_factor: '5-20x',
          accuracy: '92-97%'
        }
      ],
      supply_chain_metrics: {
        total_optimizations: 156,
        completed_optimizations: 118,
        running_optimizations: 15,
        pending_optimizations: 23,
        average_cost_savings: 21.4,
        total_cost_savings: 45600000,
        average_delivery_improvement: 16.8,
        inventory_reduction: 18.9,
        sustainability_improvement: 14.2,
        risk_reduction: 22.3
      }
    };

    // Filter by parameters if provided
    let filtered_optimizations = supply_chain_optimizations.optimizations;
    
    if (optimization_id) {
      filtered_optimizations = filtered_optimizations.filter(opt => opt.id === optimization_id);
    }
    
    if (optimization_type) {
      filtered_optimizations = filtered_optimizations.filter(opt => opt.type === optimization_type);
    }
    
    if (status) {
      filtered_optimizations = filtered_optimizations.filter(opt => opt.status === status);
    }

    return NextResponse.json({
      optimizations: filtered_optimizations,
      algorithms: supply_chain_optimizations.algorithms,
      metrics: supply_chain_optimizations.supply_chain_metrics
    });
  } catch (error) {
    console.error('Quantum Supply Chain GET API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}