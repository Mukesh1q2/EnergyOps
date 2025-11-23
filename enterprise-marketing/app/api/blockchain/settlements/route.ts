import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

interface Settlement {
  id: string;
  settlementId: number;
  transactionHash: string;
  partyA: string;
  partyB: string;
  amount: string;
  price: string;
  totalValue: string;
  assetType: 'energy_token' | 'fiat' | 'crypto' | 'mixed';
  paymentMethod: 'token_transfer' | 'bank_transfer' | 'crypto_transfer' | 'smart_contract';
  network: string;
  status: 'pending' | 'escrow' | 'released' | 'disputed' | 'cancelled' | 'expired';
  createdAt: string;
  expiresAt: string;
  completedAt?: string;
  fee: string;
  feeToken: string;
  gasUsed?: string;
  blockNumber?: number;
  terms: {
    deliveryDate: string;
    quality: string;
    location: string;
    paymentTerms: string;
    disputeWindow: number; // hours
  };
  escrow: {
    locked: boolean;
    releaseConditions: string[];
    autoRelease: boolean;
    mediator?: string;
  };
  dispute?: {
    reason: string;
    filedBy: string;
    filedAt: string;
    status: 'open' | 'investigating' | 'resolved' | 'escalated';
    resolution?: 'in_favor_a' | 'in_favor_b' | 'split' | 'dismissed';
    mediator?: string;
    evidence: {
      type: 'document' | 'image' | 'data' | 'testimony';
      description: string;
      submittedBy: string;
      submittedAt: string;
      hash: string;
    }[];
  };
}

interface AutomatedSettlement {
  id: string;
  trigger: 'time_based' | 'event_based' | 'condition_met' | 'manual';
  settlementId: string;
  conditions: {
    type: 'delivery_confirmation' | 'payment_received' | 'quality_verified' | 'time_elapsed';
    value: any;
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  }[];
  actions: {
    type: 'release_funds' | 'cancel_settlement' | 'notify_parties' | 'escalate_dispute';
    parameters: any;
  }[];
  status: 'active' | 'paused' | 'completed' | 'failed';
  createdAt: string;
  executedAt?: string;
  executionLogs: {
    timestamp: string;
    event: string;
    result: 'success' | 'failure' | 'partial';
    details: string;
  }[];
}

interface SettlementRule {
  id: string;
  name: string;
  description: string;
  network: string;
  conditions: {
    assetType?: string[];
    amountRange?: { min: string; max: string };
    paymentMethods?: string[];
    parties?: string[];
  };
  automation: {
    enabled: boolean;
    trigger: AutomatedSettlement['trigger'];
    timeouts: {
      escrow: number; // minutes
      dispute: number; // hours
      autoRelease: number; // hours
    };
    notifications: {
      email: boolean;
      sms: boolean;
      webhook: string;
    };
  };
  riskManagement: {
    maxAmount: string;
    requireApproval: boolean;
    maxDisputes: number;
    whitelistParties: boolean;
    blacklistParties: string[];
  };
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

interface SettlementMetrics {
  period: string;
  totalSettlements: number;
  completedSettlements: number;
  disputedSettlements: number;
  avgCompletionTime: string; // hours
  totalValue: string;
  avgFee: string;
  successRate: number;
  topAssets: Array<{
    type: string;
    count: number;
    value: string;
  }>;
  networks: Array<{
    network: string;
    count: number;
    percentage: number;
  }>;
}

// Simulated settlement data
const settlements: Settlement[] = [
  {
    id: 'settlement-001',
    settlementId: 10001,
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    partyA: '0x742d35Cc6C1e7A8B1c6C3C9B2F4C2A5D8E9F1B3A',
    partyB: '0x823c3C5c2B1C2A3E4F5B6C7D8E9F1A2B3C4D5E6F7',
    amount: '1000',
    price: '0.085',
    totalValue: '85',
    assetType: 'energy_token',
    paymentMethod: 'token_transfer',
    network: 'polygon',
    status: 'released',
    createdAt: '2025-11-18T10:00:00Z',
    expiresAt: '2025-11-20T10:00:00Z',
    completedAt: '2025-11-18T14:30:00Z',
    fee: '0.085',
    feeToken: 'ESOLAR',
    gasUsed: '125430',
    blockNumber: 50248935,
    terms: {
      deliveryDate: '2025-11-19T00:00:00Z',
      quality: 'High purity solar energy certificates',
      location: 'California, USA',
      paymentTerms: 'Net 30',
      disputeWindow: 72
    },
    escrow: {
      locked: false,
      releaseConditions: [
        'Delivery confirmation received',
        'Quality verification passed',
        'Payment authorization confirmed'
      ],
      autoRelease: true,
      mediator: '0x934B5C7E6F8D2A1C3E4F5B6C7D8E9F1A2B3C4D5E6F'
    }
  },
  {
    id: 'settlement-002',
    settlementId: 10002,
    transactionHash: '0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef',
    partyA: '0x445A7E9B4C3D2E1F6A7B8C9D0E1F2A3B4C5D6E7F8',
    partyB: '0x556789E1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8',
    amount: '500',
    price: '0.092',
    totalValue: '46',
    assetType: 'energy_token',
    paymentMethod: 'smart_contract',
    network: 'ethereum',
    status: 'escrow',
    createdAt: '2025-11-19T01:00:00Z',
    expiresAt: '2025-11-21T01:00:00Z',
    fee: '0.046',
    feeToken: 'EWIND',
    gasUsed: '98765',
    blockNumber: 18450324,
    terms: {
      deliveryDate: '2025-11-20T00:00:00Z',
      quality: 'Wind energy certificates with carbon offset',
      location: 'Texas, USA',
      paymentTerms: 'Immediate',
      disputeWindow: 48
    },
    escrow: {
      locked: true,
      releaseConditions: [
        'Smart contract delivery verified',
        'Carbon offset validated',
        'Regulatory compliance confirmed'
      ],
      autoRelease: false,
      mediator: '0xA45C6D8E2F1A3B4C5D6E7F8A9B1C2D3E4F5A6B7C8'
    }
  },
  {
    id: 'settlement-003',
    settlementId: 10003,
    transactionHash: '0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef',
    partyA: '0x667890F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8',
    partyB: '0x778901A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9',
    amount: '750',
    price: '0.078',
    totalValue: '58.5',
    assetType: 'mixed',
    paymentMethod: 'bank_transfer',
    network: 'arbitrum',
    status: 'disputed',
    createdAt: '2025-11-18T16:30:00Z',
    expiresAt: '2025-11-20T16:30:00Z',
    fee: '0.585',
    feeToken: 'ESTORAGE',
    gasUsed: '0',
    terms: {
      deliveryDate: '2025-11-19T12:00:00Z',
      quality: 'Battery storage capacity allocation',
      location: 'Nevada, USA',
      paymentTerms: 'Net 15',
      disputeWindow: 24
    },
    escrow: {
      locked: true,
      releaseConditions: [
        'Storage capacity verified',
        'Grid connection confirmed',
        'Performance metrics validated'
      ],
      autoRelease: false,
      mediator: '0x889012E3F4C2D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9'
    },
    dispute: {
      reason: 'Storage capacity delivered was 15% below promised specification',
      filedBy: '0x667890F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8',
      filedAt: '2025-11-18T18:45:00Z',
      status: 'investigating',
      mediator: '0x99A123E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1',
      evidence: [
        {
          type: 'document',
          description: 'Technical specification report showing actual vs promised capacity',
          submittedBy: '0x667890F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8',
          submittedAt: '2025-11-18T19:00:00Z',
          hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
        },
        {
          type: 'data',
          description: 'Real-time performance monitoring data from grid connection',
          submittedBy: '0x778901A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9',
          submittedAt: '2025-11-18T20:15:00Z',
          hash: '0x456789abcdef123456789abcdef123456789abcdef123456789abcdef123456789'
        }
      ]
    }
  }
];

const automatedSettlements: AutomatedSettlement[] = [
  {
    id: 'auto-001',
    trigger: 'time_based',
    settlementId: 'settlement-001',
    conditions: [
      {
        type: 'time_elapsed',
        value: 24,
        operator: 'greater_than'
      }
    ],
    actions: [
      {
        type: 'release_funds',
        parameters: {
          percentage: 100
        }
      },
      {
        type: 'notify_parties',
        parameters: {
          message: 'Settlement automatically released after 24 hours'
        }
      }
    ],
    status: 'completed',
    createdAt: '2025-11-18T10:00:00Z',
    executedAt: '2025-11-18T14:30:00Z',
    executionLogs: [
      {
        timestamp: '2025-11-18T14:30:00Z',
        event: 'Automation triggered',
        result: 'success',
        details: 'Time-based condition met, executing settlement release'
      },
      {
        timestamp: '2025-11-18T14:30:05Z',
        event: 'Funds released',
        result: 'success',
        details: 'Escrow funds released to party B'
      },
      {
        timestamp: '2025-11-18T14:30:10Z',
        event: 'Notifications sent',
        result: 'success',
        details: 'Both parties notified of settlement completion'
      }
    ]
  },
  {
    id: 'auto-002',
    trigger: 'condition_met',
    settlementId: 'settlement-002',
    conditions: [
      {
        type: 'delivery_confirmation',
        value: 'confirmed',
        operator: 'equals'
      },
      {
        type: 'quality_verified',
        value: 'passed',
        operator: 'equals'
      }
    ],
    actions: [
      {
        type: 'release_funds',
        parameters: {
          percentage: 100
        }
      }
    ],
    status: 'active',
    createdAt: '2025-11-19T01:00:00Z',
    executionLogs: [
      {
        timestamp: '2025-11-19T01:00:00Z',
        event: 'Automation setup',
        result: 'success',
        details: 'Settlement automation configured for conditional release'
      }
    ]
  }
];

const settlementRules: SettlementRule[] = [
  {
    id: 'rule-001',
    name: 'Energy Token Standard Settlement',
    description: 'Automated settlement rules for energy token trades',
    network: 'polygon',
    conditions: {
      assetType: ['energy_token'],
      amountRange: { min: '0', max: '1000000' },
      paymentMethods: ['token_transfer', 'smart_contract']
    },
    automation: {
      enabled: true,
      trigger: 'condition_met',
      timeouts: {
        escrow: 1440, // 24 hours
        dispute: 72, // 3 days
        autoRelease: 24 // 1 day
      },
      notifications: {
        email: true,
        sms: false,
        webhook: 'https://api.optibid.com/webhooks/settlement'
      }
    },
    riskManagement: {
      maxAmount: '1000000',
      requireApproval: false,
      maxDisputes: 5,
      whitelistParties: false,
      blacklistParties: []
    },
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2025-11-15T00:00:00Z',
    active: true
  },
  {
    id: 'rule-002',
    name: 'High Value Settlement Rules',
    description: 'Enhanced procedures for settlements over $100,000',
    network: 'ethereum',
    conditions: {
      amountRange: { min: '100000', max: '10000000' }
    },
    automation: {
      enabled: true,
      trigger: 'manual',
      timeouts: {
        escrow: 2880, // 48 hours
        dispute: 168, // 7 days
        autoRelease: 48 // 2 days
      },
      notifications: {
        email: true,
        sms: true,
        webhook: 'https://api.optibid.com/webhooks/high-value-settlement'
      }
    },
    riskManagement: {
      maxAmount: '10000000',
      requireApproval: true,
      maxDisputes: 2,
      whitelistParties: false,
      blacklistParties: []
    },
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2025-11-10T00:00:00Z',
    active: true
  }
];

const settlementMetrics: SettlementMetrics = {
  period: '30d',
  totalSettlements: 1247,
  completedSettlements: 1189,
  disputedSettlements: 23,
  avgCompletionTime: '4.2',
  totalValue: '2,847,500',
  avgFee: '0.25',
  successRate: 95.3,
  topAssets: [
    { type: 'solar_energy', count: 456, value: '1,245,600' },
    { type: 'wind_energy', count: 387, value: '892,400' },
    { type: 'storage_capacity', count: 234, value: '567,800' },
    { type: 'hydro_power', count: 170, value: '141,700' }
  ],
  networks: [
    { network: 'polygon', count: 567, percentage: 45.5 },
    { network: 'ethereum', count: 423, percentage: 33.9 },
    { network: 'arbitrum', count: 257, percentage: 20.6 }
  ]
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network');
    const status = searchParams.get('status');
    const party = searchParams.get('party');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (action === 'metrics') {
      return NextResponse.json({
        success: true,
        data: settlementMetrics
      });
    }

    if (action === 'rules') {
      let filteredRules = settlementRules;
      if (network) {
        filteredRules = settlementRules.filter(rule => rule.network === network);
      }
      return NextResponse.json({
        success: true,
        data: filteredRules,
        total: filteredRules.length
      });
    }

    if (action === 'automation') {
      return NextResponse.json({
        success: true,
        data: automatedSettlements,
        total: automatedSettlements.length
      });
    }

    let filteredSettlements = [...settlements];

    if (network) {
      filteredSettlements = filteredSettlements.filter(settlement => settlement.network === network);
    }

    if (status) {
      filteredSettlements = filteredSettlements.filter(settlement => settlement.status === status);
    }

    if (party) {
      filteredSettlements = filteredSettlements.filter(settlement => 
        settlement.partyA.toLowerCase() === party.toLowerCase() ||
        settlement.partyB.toLowerCase() === party.toLowerCase()
      );
    }

    // Sort by creation date (newest first)
    filteredSettlements.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const paginatedSettlements = filteredSettlements.slice(offset, offset + limit);

    // Calculate statistics
    const stats = {
      total: filteredSettlements.length,
      pending: filteredSettlements.filter(s => s.status === 'pending').length,
      escrow: filteredSettlements.filter(s => s.status === 'escrow').length,
      released: filteredSettlements.filter(s => s.status === 'released').length,
      disputed: filteredSettlements.filter(s => s.status === 'disputed').length,
      totalValue: filteredSettlements
        .filter(s => s.status === 'released')
        .reduce((sum, s) => sum + parseFloat(s.totalValue), 0),
      avgTimeToComplete: filteredSettlements
        .filter(s => s.completedAt)
        .reduce((acc, s) => {
          const created = new Date(s.createdAt).getTime();
          const completed = new Date(s.completedAt!).getTime();
          return acc + (completed - created);
        }, 0) / (filteredSettlements.filter(s => s.completedAt).length || 1) / (1000 * 60 * 60) // hours
    };

    return NextResponse.json({
      success: true,
      data: paginatedSettlements,
      pagination: {
        total: filteredSettlements.length,
        limit,
        offset,
        hasMore: offset + limit < filteredSettlements.length
      },
      stats
    });
  } catch (error) {
    console.error('Settlements API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settlements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, settlementData } = body;

    switch (action) {
      case 'create':
        const newSettlement: Settlement = {
          id: `settlement-${String(settlements.length + 1).padStart(3, '0')}`,
          settlementId: Math.floor(Math.random() * 100000) + 10000,
          transactionHash: generateMockTxHash(),
          partyA: settlementData.partyA,
          partyB: settlementData.partyB,
          amount: settlementData.amount,
          price: settlementData.price,
          totalValue: (parseFloat(settlementData.amount) * parseFloat(settlementData.price)).toFixed(3),
          assetType: settlementData.assetType,
          paymentMethod: settlementData.paymentMethod,
          network: settlementData.network,
          status: 'pending',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          fee: ((parseFloat(settlementData.amount) * parseFloat(settlementData.price)) * 0.001).toFixed(3),
          feeToken: settlementData.feeToken || 'ENERGY',
          gasUsed: '0',
          terms: settlementData.terms,
          escrow: {
            locked: settlementData.escrowRequired || false,
            releaseConditions: settlementData.releaseConditions || [],
            autoRelease: settlementData.autoRelease || false,
            mediator: settlementData.mediator
          }
        };

        settlements.unshift(newSettlement);
        return NextResponse.json({
          success: true,
          data: newSettlement,
          message: 'Settlement created successfully'
        });

      case 'release':
        const settlementIndex = settlements.findIndex(s => s.id === settlementData.settlementId);
        if (settlementIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Settlement not found' },
            { status: 404 }
          );
        }

        if (!settlements[settlementIndex].escrow.locked) {
          return NextResponse.json(
            { success: false, error: 'Settlement not in escrow' },
            { status: 400 }
          );
        }

        settlements[settlementIndex].status = 'released';
        settlements[settlementIndex].completedAt = new Date().toISOString();
        settlements[settlementIndex].escrow.locked = false;

        return NextResponse.json({
          success: true,
          data: settlements[settlementIndex],
          message: 'Settlement released successfully'
        });

      case 'dispute':
        const disputeIndex = settlements.findIndex(s => s.id === settlementData.settlementId);
        if (disputeIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Settlement not found' },
            { status: 404 }
          );
        }

        settlements[disputeIndex].status = 'disputed';
        settlements[disputeIndex].dispute = {
          reason: settlementData.reason,
          filedBy: settlementData.filedBy,
          filedAt: new Date().toISOString(),
          status: 'open',
          evidence: []
        };

        return NextResponse.json({
          success: true,
          data: settlements[disputeIndex],
          message: 'Dispute filed successfully'
        });

      case 'resolve-dispute':
        const resolveIndex = settlements.findIndex(s => s.id === settlementData.settlementId);
        if (resolveIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Settlement not found' },
            { status: 404 }
          );
        }

        if (!settlements[resolveIndex].dispute) {
          return NextResponse.json(
            { success: false, error: 'No dispute found for this settlement' },
            { status: 400 }
          );
        }

        settlements[resolveIndex].dispute.status = 'resolved';
        settlements[resolveIndex].dispute.resolution = settlementData.resolution;
        settlements[resolveIndex].dispute.mediator = settlementData.mediator;

        // Update settlement status based on resolution
        if (settlementData.resolution === 'in_favor_a') {
          settlements[resolveIndex].status = 'released';
        } else if (settlementData.resolution === 'in_favor_b') {
          settlements[resolveIndex].status = 'cancelled';
        } else {
          settlements[resolveIndex].status = 'released'; // split or dismissed
        }

        settlements[resolveIndex].completedAt = new Date().toISOString();

        return NextResponse.json({
          success: true,
          data: settlements[resolveIndex],
          message: 'Dispute resolved successfully'
        });

      case 'create-rule':
        const newRule: SettlementRule = {
          id: `rule-${String(settlementRules.length + 1).padStart(3, '0')}`,
          name: settlementData.name,
          description: settlementData.description,
          network: settlementData.network,
          conditions: settlementData.conditions,
          automation: settlementData.automation,
          riskManagement: settlementData.riskManagement,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          active: settlementData.active || true
        };

        settlementRules.push(newRule);
        return NextResponse.json({
          success: true,
          data: newRule,
          message: 'Settlement rule created successfully'
        });

      case 'setup-automation':
        const newAutomation: AutomatedSettlement = {
          id: `auto-${String(automatedSettlements.length + 1).padStart(3, '0')}`,
          trigger: settlementData.trigger,
          settlementId: settlementData.settlementId,
          conditions: settlementData.conditions,
          actions: settlementData.actions,
          status: 'active',
          createdAt: new Date().toISOString(),
          executionLogs: [
            {
              timestamp: new Date().toISOString(),
              event: 'Automation setup',
              result: 'success',
              details: 'Automated settlement configured'
            }
          ]
        };

        automatedSettlements.push(newAutomation);
        return NextResponse.json({
          success: true,
          data: newAutomation,
          message: 'Settlement automation configured successfully'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Settlements POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process settlement operation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settlementId, updates } = body;

    const settlementIndex = settlements.findIndex(s => s.id === settlementId);
    if (settlementIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Settlement not found' },
        { status: 404 }
      );
    }

    const updatedSettlement = {
      ...settlements[settlementIndex],
      ...updates
    };

    settlements[settlementIndex] = updatedSettlement;

    return NextResponse.json({
      success: true,
      data: updatedSettlement,
      message: 'Settlement updated successfully'
    });
  } catch (error) {
    console.error('Settlements PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settlement' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const settlementId = searchParams.get('settlementId');

    if (!settlementId) {
      return NextResponse.json(
        { success: false, error: 'Settlement ID required' },
        { status: 400 }
      );
    }

    const settlementIndex = settlements.findIndex(s => s.id === settlementId);
    if (settlementIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Settlement not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of cancelled or expired settlements
    if (!['cancelled', 'expired'].includes(settlements[settlementIndex].status)) {
      return NextResponse.json(
        { success: false, error: 'Can only delete cancelled or expired settlements' },
        { status: 400 }
      );
    }

    settlements.splice(settlementIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Settlement deleted successfully'
    });
  } catch (error) {
    console.error('Settlements DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete settlement' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateMockTxHash(): string {
  return '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
}