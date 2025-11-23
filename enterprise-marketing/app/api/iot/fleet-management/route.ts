import { NextRequest, NextResponse } from 'next/server';

export interface FleetDevice {
  id: string;
  assetTag: string;
  name: string;
  category: 'energy-generation' | 'energy-storage' | 'energy-distribution' | 'sensors' | 'actuators' | 'gateways';
  manufacturer: string;
  model: string;
  serialNumber: string;
  hardwareVersion: string;
  firmwareVersion: string;
  purchaseDate: Date;
  warrantyExpiry: Date;
  status: 'active' | 'maintenance' | 'retired' | 'replaced' | 'decommissioned';
  location: {
    site: string;
    building?: string;
    floor?: string;
    room?: string;
    rack?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  specifications: {
    powerRating?: number; // kW
    voltageRange?: string;
    currentRating?: number; // A
    operatingTemp?: string;
    connectivity?: string[];
    protocols?: string[];
    sensors?: string[];
  };
  lifecycle: {
    commissioningDate: Date;
    lastMaintenance: Date;
    nextMaintenance: Date;
    expectedLifespan: number; // years
    depreciationRate: number; // percentage per year
    replacementScheduled?: Date;
  };
  performance: {
    efficiency: number; // percentage
    uptime: number; // percentage
    reliability: number; // percentage
    lastPerformanceScore: number; // 1-100
    performanceTrend: 'improving' | 'stable' | 'declining';
  };
  costs: {
    purchaseCost: number;
    maintenanceCost: number; // annual
    operatingCost: number; // annual
    totalCostOfOwnership: number;
    roi: number; // percentage
  };
  certifications: string[];
  connectivity: {
    primaryConnection: string;
    backupConnection?: string;
    dataUsage: number; // MB/month
    bandwidth: number; // Mbps
    signalStrength?: number; // percentage
  };
  maintenanceHistory: MaintenanceRecord[];
  performanceHistory: PerformanceRecord[];
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceRecord {
  id: string;
  deviceId: string;
  type: 'scheduled' | 'unscheduled' | 'emergency' | 'preventive' | 'predictive';
  description: string;
  technician: string;
  startDate: Date;
  endDate?: Date;
  duration: number; // hours
  cost: number;
  partsReplaced: string[];
  issuesFound: string[];
  recommendations: string[];
  nextDueDate: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  completionNotes?: string;
}

export interface PerformanceRecord {
  id: string;
  deviceId: string;
  timestamp: Date;
  metrics: {
    efficiency?: number;
    uptime?: number;
    power?: number;
    temperature?: number;
    errorRate?: number;
    throughput?: number;
    latency?: number;
  };
  status: 'normal' | 'warning' | 'critical';
  alertGenerated: boolean;
  notes?: string;
}

export interface FleetMetrics {
  totalDevices: number;
  activeDevices: number;
  maintenanceDevices: number;
  retiredDevices: number;
  decommissionedDevices: number;
  averageAge: number; // years
  totalAssetValue: number;
  totalMaintenanceCost: number;
  averageUptime: number;
  averageEfficiency: number;
  replacementNeed: {
    urgent: number; // next 6 months
    planned: number; // next 2 years
    monitoring: number; // next 5 years
  };
  performanceScore: {
    excellent: number; // 90-100
    good: number; // 75-89
    fair: number; // 60-74
    poor: number; // below 60
  };
  costOptimization: {
    potentialSavings: number;
    maintenanceOptimization: number;
    replacementROI: number;
    lifecycleOptimization: number;
  };
  complianceStatus: {
    certified: number;
    expiring: number;
    expired: number;
  };
}

export interface FleetOperation {
  id: string;
  type: 'firmware-update' | 'configuration-change' | 'maintenance-schedule' | 'bulk-command' | 'data-collection';
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  devices: string[];
  progress: {
    total: number;
    completed: number;
    failed: number;
    inProgress: number;
  };
  scheduledTime?: Date;
  startedAt?: Date;
  completedAt?: Date;
  parameters: Record<string, any>;
  results: FleetOperationResult[];
  createdBy: string;
  createdAt: Date;
}

export interface FleetOperationResult {
  deviceId: string;
  deviceName: string;
  status: 'success' | 'failed' | 'skipped' | 'timeout';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  result?: any;
  error?: string;
  retryCount: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const location = searchParams.get('location');
    const manufacturer = searchParams.get('manufacturer');
    const performanceScore = searchParams.get('performanceScore');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Simulate comprehensive fleet database
    const fleetDevices: FleetDevice[] = [
      {
        id: 'fleet-001',
        assetTag: 'SA-2023-001',
        name: 'Solar Array Monitor - Site A',
        category: 'sensors',
        manufacturer: 'SolarTech Industries',
        model: 'ST-SM-400',
        serialNumber: 'ST2023SM001',
        hardwareVersion: '2.1',
        firmwareVersion: '3.2.1',
        purchaseDate: new Date('2023-03-15'),
        warrantyExpiry: new Date('2026-03-15'),
        status: 'active',
        location: {
          site: 'Solar Farm A',
          building: 'Monitoring Station',
          floor: 'Ground',
          room: 'Control Room',
          rack: 'Rack-A1',
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194
          }
        },
        specifications: {
          powerRating: 0.05,
          voltageRange: '12V DC',
          currentRating: 4.2,
          operatingTemp: '-20°C to +70°C',
          connectivity: ['Ethernet', 'WiFi', 'Cellular'],
          protocols: ['MQTT', 'CoAP', 'HTTP'],
          sensors: ['Temperature', 'Irradiance', 'Power', 'Voltage', 'Current']
        },
        lifecycle: {
          commissioningDate: new Date('2023-06-01'),
          lastMaintenance: new Date('2024-01-15'),
          nextMaintenance: new Date('2024-07-15'),
          expectedLifespan: 15,
          depreciationRate: 6.67
        },
        performance: {
          efficiency: 94.2,
          uptime: 99.7,
          reliability: 98.5,
          lastPerformanceScore: 87,
          performanceTrend: 'stable'
        },
        costs: {
          purchaseCost: 2400,
          maintenanceCost: 120, // annual
          operatingCost: 50, // annual
          totalCostOfOwnership: 3450,
          roi: 156
        },
        certifications: ['UL', 'CE', 'FCC', 'Energy Star'],
        connectivity: {
          primaryConnection: 'Ethernet',
          backupConnection: 'Cellular',
          dataUsage: 245, // MB/month
          bandwidth: 10
        },
        maintenanceHistory: [],
        performanceHistory: [],
        lastSeen: new Date(),
        createdAt: new Date('2023-03-15'),
        updatedAt: new Date()
      },
      {
        id: 'fleet-002',
        assetTag: 'WT-2023-007',
        name: 'Wind Turbine Monitor - Unit 7',
        category: 'sensors',
        manufacturer: 'WindCorp',
        model: 'WC-WTM-2000',
        serialNumber: 'WC2023WTM007',
        hardwareVersion: '1.5',
        firmwareVersion: '2.8.0',
        purchaseDate: new Date('2023-05-20'),
        warrantyExpiry: new Date('2028-05-20'),
        status: 'active',
        location: {
          site: 'Wind Farm B',
          building: 'Turbine 7',
          floor: 'Nacelle',
          room: 'Control Cabinet',
          rack: 'Cabinet-01',
          coordinates: {
            latitude: 34.0522,
            longitude: -118.2437
          }
        },
        specifications: {
          powerRating: 0.1,
          voltageRange: '24V DC',
          currentRating: 4.2,
          operatingTemp: '-40°C to +85°C',
          connectivity: ['Fiber Optic', 'Ethernet'],
          protocols: ['OPC UA', 'Modbus', 'TCP/IP'],
          sensors: ['Wind Speed', 'Direction', 'Temperature', 'Vibration', 'Power', 'RPM']
        },
        lifecycle: {
          commissioningDate: new Date('2023-08-10'),
          lastMaintenance: new Date('2024-02-01'),
          nextMaintenance: new Date('2024-08-01'),
          expectedLifespan: 20,
          depreciationRate: 5
        },
        performance: {
          efficiency: 91.8,
          uptime: 98.9,
          reliability: 96.7,
          lastPerformanceScore: 92,
          performanceTrend: 'improving'
        },
        costs: {
          purchaseCost: 5600,
          maintenanceCost: 280, // annual
          operatingCost: 120, // annual
          totalCostOfOwnership: 8200,
          roi: 187
        },
        certifications: ['IEC', 'UL', 'CE', 'ISO 9001'],
        connectivity: {
          primaryConnection: 'Fiber Optic',
          dataUsage: 156, // MB/month
          bandwidth: 100
        },
        maintenanceHistory: [],
        performanceHistory: [],
        lastSeen: new Date(),
        createdAt: new Date('2023-05-20'),
        updatedAt: new Date()
      },
      {
        id: 'fleet-003',
        assetTag: 'BESS-2023-001',
        name: 'Battery Storage System BESS-01',
        category: 'energy-storage',
        manufacturer: 'EnergyStorage Solutions',
        model: 'ESS-BESS-2500',
        serialNumber: 'ESS2023BESS001',
        hardwareVersion: '3.0',
        firmwareVersion: '1.9.2',
        purchaseDate: new Date('2023-07-12'),
        warrantyExpiry: new Date('2033-07-12'),
        status: 'active',
        location: {
          site: 'Battery Storage Hub',
          building: 'Storage Facility',
          floor: 'Ground',
          room: 'Battery Room A',
          rack: 'Rack-BESS-01',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        },
        specifications: {
          powerRating: 2.5,
          voltageRange: '400V AC',
          currentRating: 6.25,
          operatingTemp: '15°C to 35°C',
          connectivity: ['Ethernet', 'CAN Bus', 'RS485'],
          protocols: ['Modbus', 'CAN Bus', 'IEC 61850'],
          sensors: ['Voltage', 'Current', 'Temperature', 'State of Charge', 'Pressure']
        },
        lifecycle: {
          commissioningDate: new Date('2023-09-15'),
          lastMaintenance: new Date('2024-01-20'),
          nextMaintenance: new Date('2024-07-20'),
          expectedLifespan: 15,
          depreciationRate: 6.67
        },
        performance: {
          efficiency: 89.4,
          uptime: 99.2,
          reliability: 97.8,
          lastPerformanceScore: 89,
          performanceTrend: 'stable'
        },
        costs: {
          purchaseCost: 45000,
          maintenanceCost: 2250, // annual
          operatingCost: 890, // annual
          totalCostOfOwnership: 67440,
          roi: 143
        },
        certifications: ['UL', 'CE', 'IEC 62619', 'UN38.3'],
        connectivity: {
          primaryConnection: 'Ethernet',
          backupConnection: 'CAN Bus',
          dataUsage: 892, // MB/month
          bandwidth: 50
        },
        maintenanceHistory: [],
        performanceHistory: [],
        lastSeen: new Date(),
        createdAt: new Date('2023-07-12'),
        updatedAt: new Date()
      }
    ];

    // Apply filters
    let filteredDevices = fleetDevices;
    
    if (category) {
      filteredDevices = filteredDevices.filter(d => d.category === category);
    }
    
    if (status) {
      filteredDevices = filteredDevices.filter(d => d.status === status);
    }
    
    if (location) {
      filteredDevices = filteredDevices.filter(d => 
        d.location.site.toLowerCase().includes(location.toLowerCase()) ||
        (d.location.building && d.location.building.toLowerCase().includes(location.toLowerCase()))
      );
    }
    
    if (manufacturer) {
      filteredDevices = filteredDevices.filter(d => 
        d.manufacturer.toLowerCase().includes(manufacturer.toLowerCase())
      );
    }

    // Calculate fleet metrics
    const fleetMetrics: FleetMetrics = {
      totalDevices: fleetDevices.length,
      activeDevices: fleetDevices.filter(d => d.status === 'active').length,
      maintenanceDevices: fleetDevices.filter(d => d.status === 'maintenance').length,
      retiredDevices: fleetDevices.filter(d => d.status === 'retired').length,
      decommissionedDevices: fleetDevices.filter(d => d.status === 'decommissioned').length,
      averageAge: 1.2, // years
      totalAssetValue: fleetDevices.reduce((sum, d) => sum + d.costs.purchaseCost, 0),
      totalMaintenanceCost: fleetDevices.reduce((sum, d) => sum + d.costs.maintenanceCost, 0),
      averageUptime: fleetDevices.reduce((sum, d) => sum + d.performance.uptime, 0) / fleetDevices.length,
      averageEfficiency: fleetDevices.reduce((sum, d) => sum + d.performance.efficiency, 0) / fleetDevices.length,
      replacementNeed: {
        urgent: 2,
        planned: 5,
        monitoring: 12
      },
      performanceScore: {
        excellent: 8,
        good: 12,
        fair: 3,
        poor: 1
      },
      costOptimization: {
        potentialSavings: 15670,
        maintenanceOptimization: 8234,
        replacementROI: 156,
        lifecycleOptimization: 7436
      },
      complianceStatus: {
        certified: fleetDevices.length - 1,
        expiring: 1,
        expired: 0
      }
    };

    // Simulate ongoing fleet operations
    const fleetOperations: FleetOperation[] = [
      {
        id: 'op-001',
        type: 'firmware-update',
        name: 'Solar Monitor Firmware Update',
        description: 'Update firmware to version 3.3.0 for all solar monitoring devices',
        status: 'running',
        devices: ['fleet-001'],
        progress: {
          total: 1,
          completed: 0,
          failed: 0,
          inProgress: 1
        },
        scheduledTime: new Date(),
        startedAt: new Date(),
        parameters: {
          targetVersion: '3.3.0',
          rollbackEnabled: true,
          maintenanceWindow: '02:00-04:00'
        },
        results: [],
        createdBy: 'admin@optibid.com',
        createdAt: new Date()
      },
      {
        id: 'op-002',
        type: 'data-collection',
        name: 'Monthly Performance Data Collection',
        description: 'Collect performance data for all active devices',
        status: 'completed',
        devices: ['fleet-001', 'fleet-002', 'fleet-003'],
        progress: {
          total: 3,
          completed: 3,
          failed: 0,
          inProgress: 0
        },
        startedAt: new Date(Date.now() - 3600000),
        completedAt: new Date(Date.now() - 1800000),
        parameters: {
          collectionType: 'performance-metrics',
          timeRange: '30d',
          includeMaintenanceHistory: true
        },
        results: [
          {
            deviceId: 'fleet-001',
            deviceName: 'Solar Array Monitor - Site A',
            status: 'success',
            startTime: new Date(Date.now() - 3600000),
            endTime: new Date(Date.now() - 3500000),
            duration: 100,
            result: { dataPoints: 43200, size: '2.4MB' },
            retryCount: 0
          }
        ],
        createdBy: 'admin@optibid.com',
        createdAt: new Date(Date.now() - 7200000)
      }
    ];

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDevices = filteredDevices.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      fleetDevices: paginatedDevices,
      fleetOperations,
      fleetMetrics,
      pagination: {
        page,
        limit,
        total: filteredDevices.length,
        pages: Math.ceil(filteredDevices.length / limit)
      },
      summary: {
        totalDevices: fleetMetrics.totalDevices,
        activeDevices: fleetMetrics.activeDevices,
        averageUptime: fleetMetrics.averageUptime.toFixed(1) + '%',
        totalAssetValue: '$' + fleetMetrics.totalAssetValue.toLocaleString(),
        maintenanceSavings: '$' + fleetMetrics.costOptimization.maintenanceOptimization.toLocaleString(),
        replacementROI: fleetMetrics.costOptimization.replacementROI + '%'
      }
    });

  } catch (error) {
    console.error('Fleet Management API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve fleet management data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const operationData: Partial<FleetOperation> = await request.json();

    // Validate required fields
    if (!operationData.type || !operationData.name || !operationData.devices || !operationData.parameters) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: type, name, devices, parameters' 
        },
        { status: 400 }
      );
    }

    // Generate unique operation ID
    const operationId = `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create new fleet operation
    const newOperation: FleetOperation = {
      id: operationId,
      type: operationData.type,
      name: operationData.name,
      description: operationData.description || '',
      status: 'pending',
      devices: operationData.devices,
      progress: {
        total: operationData.devices.length,
        completed: 0,
        failed: 0,
        inProgress: 0
      },
      scheduledTime: operationData.scheduledTime,
      parameters: operationData.parameters,
      results: [],
      createdBy: 'system',
      createdAt: new Date()
    };

    // Simulate operation execution based on type
    let executionPlan;
    
    switch (newOperation.type) {
      case 'firmware-update':
        executionPlan = {
          phases: ['pre-update-check', 'backup-current', 'apply-update', 'verify-update', 'rollback-if-needed'],
          estimatedDuration: `${newOperation.devices.length * 5} minutes`,
          riskLevel: 'medium',
          requirements: ['maintenance-window', 'backup-creds', 'rollback-plan']
        };
        break;
        
      case 'configuration-change':
        executionPlan = {
          phases: ['validate-config', 'apply-config', 'test-changes', 'monitor-stability'],
          estimatedDuration: `${newOperation.devices.length * 2} minutes`,
          riskLevel: 'low',
          requirements: ['change-approval', 'testing-environment']
        };
        break;
        
      case 'data-collection':
        executionPlan = {
          phases: ['connect-devices', 'collect-data', 'validate-data', 'store-results'],
          estimatedDuration: `${newOperation.devices.length * 1} minutes`,
          riskLevel: 'low',
          requirements: ['data-retention-policy', 'privacy-compliance']
        };
        break;
        
      case 'bulk-command':
        executionPlan = {
          phases: ['validate-command', 'execute-command', 'verify-results', 'rollback-if-needed'],
          estimatedDuration: `${newOperation.devices.length * 3} minutes`,
          riskLevel: 'high',
          requirements: ['admin-approval', 'emergency-contacts']
        };
        break;
        
      default:
        executionPlan = {
          phases: ['validate', 'execute', 'verify'],
          estimatedDuration: `${newOperation.devices.length * 2} minutes`,
          riskLevel: 'medium',
          requirements: ['standard-approval']
        };
    }

    // Simulate device-specific operation results
    const operationResults: FleetOperationResult[] = newOperation.devices.map(deviceId => ({
      deviceId,
      deviceName: `Device ${deviceId}`,
      status: Math.random() > 0.9 ? 'failed' : 'success',
      startTime: new Date(),
      endTime: new Date(Date.now() + Math.random() * 60000), // Random completion time
      duration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
      result: newOperation.type === 'data-collection' ? {
        dataPoints: Math.floor(Math.random() * 10000) + 1000,
        size: (Math.random() * 10 + 1).toFixed(1) + 'MB'
      } : { success: true },
      error: Math.random() > 0.9 ? 'Connection timeout' : undefined,
      retryCount: Math.floor(Math.random() * 3)
    }));

    return NextResponse.json({
      success: true,
      fleetOperation: newOperation,
      execution: executionPlan,
      estimatedStart: newOperation.scheduledTime || new Date(),
      results: operationResults,
      message: 'Fleet operation initiated successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Fleet Operation Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initiate fleet operation',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}