import { NextRequest, NextResponse } from 'next/server';
import { mqtt } from 'mqtt';
import { serialport } from 'serialport';

export interface IoTDevice {
  id: string;
  name: string;
  type: 'sensor' | 'actuator' | 'gateway' | 'edge-node' | 'smart-meter' | 'battery-storage';
  protocol: 'mqtt' | 'coap' | 'opcua' | 'modbus' | 'zigbee' | 'z-wave' | 'matter' | 'thread';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    region: string;
    facilityId?: string;
  };
  status: 'online' | 'offline' | 'maintenance' | 'error';
  capabilities: string[];
  firmware: {
    version: string;
    updateAvailable: boolean;
    lastUpdate: Date;
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    batteryLevel?: number;
    uptime: number;
    dataRate: number;
  };
  sensors: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
    power?: number;
    voltage?: number;
    current?: number;
    frequency?: number;
    energy?: number;
    windSpeed?: number;
    solarIrradiance?: number;
    soilMoisture?: number;
    ph?: number;
    co2?: number;
    voc?: number;
    pm25?: number;
    noise?: number;
    motion?: boolean;
    vibration?: number;
    pressure?: number;
    flowRate?: number;
    waterLevel?: number;
    gasLevel?: number;
    radiation?: number;
    magneticField?: number;
    light?: number;
  };
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceCommand {
  deviceId: string;
  command: string;
  parameters: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'critical';
  scheduledTime?: Date;
  timeout: number;
}

export interface DeviceAlert {
  id: string;
  deviceId: string;
  type: 'malfunction' | 'low-battery' | 'connectivity' | 'performance' | 'security' | 'environmental';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export interface FleetMetrics {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  maintenanceDevices: number;
  errorDevices: number;
  totalDataPoints: number;
  avgUptime: number;
  totalEnergyConsumed: number;
  totalDataTransmitted: number;
  alertCount: {
    info: number;
    warning: number;
    error: number;
    critical: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceType = searchParams.get('type');
    const status = searchParams.get('status');
    const location = searchParams.get('location');
    const protocol = searchParams.get('protocol');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Simulate comprehensive IoT device database
    const devices: IoTDevice[] = [
      {
        id: 'iot-001-solar-panels',
        name: 'Solar Array Monitor - Site A',
        type: 'sensor',
        protocol: 'zigbee',
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          address: '123 Solar Way, San Francisco, CA',
          region: 'North America West',
          facilityId: 'solar-farm-a'
        },
        status: 'online',
        capabilities: ['power-monitoring', 'temperature-sensing', 'irradiance-measurement', 'panel-cleanliness'],
        firmware: {
          version: '2.3.1',
          updateAvailable: false,
          lastUpdate: new Date('2024-01-15')
        },
        performance: {
          cpuUsage: 23.4,
          memoryUsage: 45.7,
          batteryLevel: 89.2,
          uptime: 8760, // hours
          dataRate: 1024
        },
        sensors: {
          temperature: 24.5,
          power: 2347.6,
          voltage: 23.4,
          current: 89.3,
          solarIrradiance: 847.2,
          windSpeed: 3.2
        },
        lastSeen: new Date(),
        createdAt: new Date('2023-06-01'),
        updatedAt: new Date()
      },
      {
        id: 'iot-002-wind-turbine',
        name: 'Wind Turbine Monitor - Unit 7',
        type: 'gateway',
        protocol: 'opcua',
        location: {
          latitude: 34.0522,
          longitude: -118.2437,
          address: '456 Wind Ave, Los Angeles, CA',
          region: 'North America West',
          facilityId: 'wind-farm-b'
        },
        status: 'online',
        capabilities: ['wind-measurement', 'power-generation', 'vibration-analysis', 'maintenance-prediction'],
        firmware: {
          version: '3.1.0',
          updateAvailable: true,
          lastUpdate: new Date('2023-12-20')
        },
        performance: {
          cpuUsage: 67.8,
          memoryUsage: 78.9,
          uptime: 21024,
          dataRate: 2048
        },
        sensors: {
          temperature: 18.3,
          power: 4567.8,
          windSpeed: 12.4,
          vibration: 0.02,
          frequency: 50.1
        },
        lastSeen: new Date(),
        createdAt: new Date('2023-03-15'),
        updatedAt: new Date()
      },
      {
        id: 'iot-003-battery-storage',
        name: 'Battery Storage System BESS-01',
        type: 'battery-storage',
        protocol: 'modbus',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: '789 Battery Blvd, New York, NY',
          region: 'North America East',
          facilityId: 'battery-storage-hub'
        },
        status: 'online',
        capabilities: ['charge-monitoring', 'discharge-control', 'state-estimation', 'thermal-management'],
        firmware: {
          version: '1.8.2',
          updateAvailable: false,
          lastUpdate: new Date('2024-02-01')
        },
        performance: {
          cpuUsage: 45.3,
          memoryUsage: 62.1,
          batteryLevel: 76.8,
          uptime: 15840,
          dataRate: 4096
        },
        sensors: {
          temperature: 22.1,
          power: 1250.0,
          voltage: 380.0,
          current: 328.9,
          energy: 2345.6
        },
        lastSeen: new Date(),
        createdAt: new Date('2023-08-10'),
        updatedAt: new Date()
      },
      {
        id: 'iot-004-grid-sensor',
        name: 'Smart Grid Sensor - Grid Node 15',
        type: 'smart-meter',
        protocol: 'mqtt',
        location: {
          latitude: 41.8781,
          longitude: -87.6298,
          address: '321 Grid St, Chicago, IL',
          region: 'North America Central',
          facilityId: 'smart-grid-node-15'
        },
        status: 'online',
        capabilities: ['voltage-measurement', 'current-measurement', 'frequency-monitoring', 'power-quality'],
        firmware: {
          version: '2.1.3',
          updateAvailable: false,
          lastUpdate: new Date('2023-11-30')
        },
        performance: {
          cpuUsage: 34.7,
          memoryUsage: 52.3,
          uptime: 8760,
          dataRate: 512
        },
        sensors: {
          voltage: 230.5,
          current: 125.8,
          frequency: 50.0,
          power: 28934.0
        },
        lastSeen: new Date(),
        createdAt: new Date('2023-05-20'),
        updatedAt: new Date()
      },
      {
        id: 'iot-005-edge-node',
        name: 'Edge Computing Node - AWS Greengrass',
        type: 'edge-node',
        protocol: 'matter',
        location: {
          latitude: 29.7604,
          longitude: -95.3698,
          address: '654 Edge Rd, Houston, TX',
          region: 'North America South',
          facilityId: 'edge-computing-hub-1'
        },
        status: 'online',
        capabilities: ['edge-inference', 'data-processing', 'local-storage', 'offline-operation'],
        firmware: {
          version: '4.2.1',
          updateAvailable: true,
          lastUpdate: new Date('2023-09-15')
        },
        performance: {
          cpuUsage: 78.9,
          memoryUsage: 84.2,
          uptime: 2190,
          dataRate: 8192
        },
        sensors: {
          temperature: 28.5,
          power: 890.4
        },
        lastSeen: new Date(),
        createdAt: new Date('2023-10-01'),
        updatedAt: new Date()
      }
    ];

    // Apply filters
    let filteredDevices = devices;
    
    if (deviceType) {
      filteredDevices = filteredDevices.filter(d => d.type === deviceType);
    }
    
    if (status) {
      filteredDevices = filteredDevices.filter(d => d.status === status);
    }
    
    if (protocol) {
      filteredDevices = filteredDevices.filter(d => d.protocol === protocol);
    }
    
    if (location) {
      filteredDevices = filteredDevices.filter(d => 
        d.location.region.toLowerCase().includes(location.toLowerCase()) ||
        d.location.address.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDevices = filteredDevices.slice(startIndex, endIndex);

    // Calculate fleet metrics
    const fleetMetrics: FleetMetrics = {
      totalDevices: devices.length,
      onlineDevices: devices.filter(d => d.status === 'online').length,
      offlineDevices: devices.filter(d => d.status === 'offline').length,
      maintenanceDevices: devices.filter(d => d.status === 'maintenance').length,
      errorDevices: devices.filter(d => d.status === 'error').length,
      totalDataPoints: 1456789,
      avgUptime: devices.reduce((sum, d) => sum + d.performance.uptime, 0) / devices.length,
      totalEnergyConsumed: 12456.78,
      totalDataTransmitted: 2345678.9,
      alertCount: {
        info: 12,
        warning: 8,
        error: 3,
        critical: 1
      }
    };

    return NextResponse.json({
      success: true,
      devices: paginatedDevices,
      pagination: {
        page,
        limit,
        total: filteredDevices.length,
        pages: Math.ceil(filteredDevices.length / limit)
      },
      fleetMetrics,
      summary: {
        onlineDevices: fleetMetrics.onlineDevices,
        offlineDevices: fleetMetrics.offlineDevices,
        maintenanceDevices: fleetMetrics.maintenanceDevices,
        totalDataPoints: fleetMetrics.totalDataPoints.toLocaleString(),
        avgUptime: Math.round(fleetMetrics.avgUptime).toLocaleString() + ' hours'
      }
    });

  } catch (error) {
    console.error('IoT Devices API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve IoT devices',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const deviceData: Partial<IoTDevice> = await request.json();

    // Validate required fields
    if (!deviceData.name || !deviceData.type || !deviceData.protocol) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, type, protocol' },
        { status: 400 }
      );
    }

    // Generate unique device ID
    const deviceId = `iot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create new device
    const newDevice: IoTDevice = {
      id: deviceId,
      name: deviceData.name,
      type: deviceData.type,
      protocol: deviceData.protocol,
      location: deviceData.location || {
        latitude: 0,
        longitude: 0,
        address: 'Unknown',
        region: 'Unknown'
      },
      status: 'online',
      capabilities: deviceData.capabilities || [],
      firmware: {
        version: '1.0.0',
        updateAvailable: false,
        lastUpdate: new Date()
      },
      performance: {
        cpuUsage: 0,
        memoryUsage: 0,
        uptime: 0,
        dataRate: 0
      },
      sensors: {},
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Simulate device registration with IoT protocols
    let registrationResult;
    
    switch (newDevice.protocol) {
      case 'mqtt':
        // Simulate MQTT broker registration
        registrationResult = {
          mqttTopic: `devices/${deviceId}/data`,
          mqttQos: 1,
          brokerEndpoint: 'mqtt://broker.iot.optibid.com:1883'
        };
        break;
        
      case 'coap':
        // Simulate CoAP registration
        registrationResult = {
          coapEndpoint: `coap://[device-ip]:5683/iot/${deviceId}`,
          resources: ['data', 'status', 'config']
        };
        break;
        
      case 'opcua':
        // Simulate OPC UA server registration
        registrationResult = {
          opcuaNodeId: `ns=4;s=Device_${deviceId}`,
          serverEndpoint: 'opc.tcp://gateway.optibid.com:4840'
        };
        break;
        
      case 'modbus':
        // Simulate Modbus device registration
        registrationResult = {
          modbusAddress: Math.floor(Math.random() * 247) + 1,
          functionCodes: [3, 4],
          registerRange: '40001-40100'
        };
        break;
        
      default:
        registrationResult = {
          protocolConfig: 'Device registered successfully'
        };
    }

    return NextResponse.json({
      success: true,
      device: newDevice,
      registration: registrationResult,
      message: 'IoT device registered successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Device Registration Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to register IoT device',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}