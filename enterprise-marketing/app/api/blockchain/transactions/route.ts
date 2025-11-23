import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

interface TransactionData {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  gasLimit: string;
  nonce: number;
  status: 'pending' | 'confirmed' | 'failed' | 'reverted';
  blockNumber: number;
  network: string;
  timestamp: string;
  confirmations: number;
  type: 'energy_trade' | 'token_transfer' | 'settlement' | 'contract_deployment' | 'smart_contract';
  fee: string;
  contractAddress?: string;
  methodName?: string;
  params?: any;
  events?: ContractEvent[];
}

interface ContractEvent {
  name: string;
  signature: string;
  data: any;
  topics: string[];
}

interface BlockData {
  number: number;
  hash: string;
  timestamp: string;
  miner: string;
  gasUsed: string;
  gasLimit: string;
  transactions: string[];
  size: string;
  difficulty: string;
}

interface NetworkStats {
  network: string;
  latestBlock: number;
  avgGasPrice: string;
  pendingTxs: number;
  tps: number;
  finalityTime: string;
  totalValue: string;
}

// Simulated blockchain transaction data
const transactions: TransactionData[] = [
  {
    id: 'tx-001',
    hash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab',
    from: '0x742d35Cc6C1e7A8B1c6C3C9B2F4C2A5D8E9F1B3A',
    to: '0x823c3C5c2B1C2A3E4F5B6C7D8E9F1A2B3C4D5E6F7',
    value: '0',
    gasUsed: '125430',
    gasPrice: '25000000000',
    gasLimit: '150000',
    nonce: 1847,
    status: 'confirmed',
    blockNumber: 18450325,
    network: 'ethereum',
    timestamp: '2025-11-19T01:35:12Z',
    confirmations: 247,
    type: 'energy_trade',
    fee: '0.00313575 ETH',
    methodName: 'fulfillTradeOrder',
    params: {
      orderId: 12345,
      amount: '1000'
    },
    events: [
      {
        name: 'TradeOrderFulfilled',
        signature: 'TradeOrderFulfilled(uint256,address,uint256,uint256)',
        data: {
          orderId: 12345,
          seller: '0x823c3C5c2B1C2A3E4F5B6C7D8E9F1A2B3C4D5E6F7',
          amount: '1000',
          price: '0.025'
        },
        topics: [
          '0x1234567890abcdef...',
          '0xabcdef1234567890...',
          '0x1234567890abcdef...'
        ]
      }
    ]
  },
  {
    id: 'tx-002',
    hash: '0x2b3c4d5e6f7890ab1234567890abcdef1234567890abcdef1234567890abcdef',
    from: '0x445A7E9B4C3D2E1F6A7B8C9D0E1F2A3B4C5D6E7F8',
    to: '0x556789E1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8',
    value: '0',
    gasUsed: '65432',
    gasPrice: '30000000000',
    gasLimit: '80000',
    nonce: 892,
    status: 'confirmed',
    blockNumber: 50248936,
    network: 'polygon',
    timestamp: '2025-11-19T01:32:45Z',
    confirmations: 1456,
    type: 'token_transfer',
    fee: '0.001963 MATIC',
    methodName: 'transfer',
    params: {
      to: '0x556789E1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8',
      amount: '500'
    }
  },
  {
    id: 'tx-003',
    hash: '0x3c4d5e6f7890ab234567890abcdef1234567890abcdef1234567890abcdef12',
    from: '0x667890F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8',
    to: '0x889012E3F4C2D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9',
    value: '0',
    gasUsed: '234567',
    gasPrice: '20000000000',
    gasLimit: '300000',
    nonce: 567,
    status: 'pending',
    blockNumber: 0,
    network: 'arbitrum',
    timestamp: '2025-11-19T01:40:23Z',
    confirmations: 0,
    type: 'settlement',
    fee: '0.00469134 ETH'
  },
  {
    id: 'tx-004',
    hash: '0x4d5e6f7890ab34567890123456789abcdef1234567890abcdef123456789012',
    from: '0x99A123E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1',
    to: '',
    value: '0',
    gasUsed: '3456789',
    gasPrice: '15000000000',
    gasLimit: '4000000',
    nonce: 23,
    status: 'confirmed',
    blockNumber: 18450320,
    network: 'ethereum',
    timestamp: '2025-11-18T22:15:34Z',
    confirmations: 252,
    type: 'contract_deployment',
    fee: '0.051851835 ETH',
    contractAddress: '0xA45C6D8E2F1A3B4C5D6E7F8A9B1C2D3E4F5A6B7C8'
  },
  {
    id: 'tx-005',
    hash: '0x5e6f7890ab4567890123456789012abcdef1234567890abcdef1234567890123',
    from: '0x778901A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9',
    to: '0x445A7E9B4C3D2E1F6A7B8C9D0E1F2A3B4C5D6E7F8',
    value: '0',
    gasUsed: '87654',
    gasPrice: '25000000000',
    gasLimit: '100000',
    nonce: 445,
    status: 'failed',
    blockNumber: 50248935,
    network: 'polygon',
    timestamp: '2025-11-19T00:45:12Z',
    confirmations: 1457,
    type: 'smart_contract',
    fee: '0.00219135 MATIC',
    error: 'Revert: Insufficient balance'
  }
];

const blocks: BlockData[] = [
  {
    number: 18450325,
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
    timestamp: '2025-11-19T01:35:12Z',
    miner: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
    gasUsed: '12450000',
    gasLimit: '15000000',
    transactions: ['tx-001', 'tx-006', 'tx-007', 'tx-008'],
    size: '2.4 MB',
    difficulty: '8765432109876543210'
  },
  {
    number: 50248936,
    hash: '0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef',
    timestamp: '2025-11-19T01:32:45Z',
    miner: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    gasUsed: '8450000',
    gasLimit: '30000000',
    transactions: ['tx-002', 'tx-009', 'tx-010'],
    size: '1.8 MB',
    difficulty: '0'
  },
  {
    number: 18450324,
    hash: '0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef',
    timestamp: '2025-11-19T01:30:23Z',
    miner: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
    gasUsed: '11200000',
    gasLimit: '15000000',
    transactions: ['tx-011', 'tx-012'],
    size: '2.1 MB',
    difficulty: '8765432109876543210'
  }
];

const networkStats: NetworkStats[] = [
  {
    network: 'ethereum',
    latestBlock: 18450325,
    avgGasPrice: '25 Gwei',
    pendingTxs: 347,
    tps: 15.2,
    finalityTime: '13 seconds',
    totalValue: '2,847.5 ETH'
  },
  {
    network: 'polygon',
    latestBlock: 50248936,
    avgGasPrice: '30 Gwei',
    pendingTxs: 89,
    tps: 124.7,
    finalityTime: '2 seconds',
    totalValue: '15,642.3 MATIC'
  },
  {
    network: 'arbitrum',
    latestBlock: 2389475,
    avgGasPrice: '20 Gwei',
    pendingTxs: 156,
    tps: 87.3,
    finalityTime: '1 second',
    totalValue: '3,456.7 ETH'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const address = searchParams.get('address');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (action === 'network-stats') {
      let filteredStats = networkStats;
      if (network) {
        filteredStats = networkStats.filter(s => s.network === network);
      }
      return NextResponse.json({
        success: true,
        data: filteredStats,
        total: filteredStats.length
      });
    }

    if (action === 'blocks') {
      let filteredBlocks = blocks;
      if (network) {
        // Filter blocks by network based on block numbers
        filteredBlocks = blocks.filter(b => 
          (network === 'ethereum' && b.number > 18000000) ||
          (network === 'polygon' && b.number > 50000000) ||
          (network === 'arbitrum' && b.number > 2000000)
        );
      }
      return NextResponse.json({
        success: true,
        data: filteredBlocks.slice(offset, offset + limit),
        total: filteredBlocks.length
      });
    }

    let filteredTransactions = [...transactions];

    if (network) {
      filteredTransactions = filteredTransactions.filter(tx => tx.network === network);
    }

    if (status) {
      filteredTransactions = filteredTransactions.filter(tx => tx.status === status);
    }

    if (type) {
      filteredTransactions = filteredTransactions.filter(tx => tx.type === type);
    }

    if (address) {
      filteredTransactions = filteredTransactions.filter(tx => 
        tx.from.toLowerCase() === address.toLowerCase() ||
        tx.to?.toLowerCase() === address.toLowerCase()
      );
    }

    // Sort by timestamp (newest first)
    filteredTransactions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const paginatedTransactions = filteredTransactions.slice(offset, offset + limit);

    // Calculate statistics
    const stats = {
      total: filteredTransactions.length,
      confirmed: filteredTransactions.filter(tx => tx.status === 'confirmed').length,
      pending: filteredTransactions.filter(tx => tx.status === 'pending').length,
      failed: filteredTransactions.filter(tx => tx.status === 'failed').length,
      totalValue: filteredTransactions
        .filter(tx => tx.status === 'confirmed')
        .reduce((sum, tx) => sum + parseFloat(tx.value || '0'), 0),
      avgGasPrice: Math.round(
        filteredTransactions
          .reduce((sum, tx) => sum + parseFloat(tx.gasPrice) / 1e9, 0) / 
        filteredTransactions.length
      )
    };

    return NextResponse.json({
      success: true,
      data: paginatedTransactions,
      pagination: {
        total: filteredTransactions.length,
        limit,
        offset,
        hasMore: offset + limit < filteredTransactions.length
      },
      stats
    });
  } catch (error) {
    console.error('Transactions API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, transactionData } = body;

    switch (action) {
      case 'broadcast':
        const newTransaction: TransactionData = {
          id: `tx-${String(transactions.length + 1).padStart(3, '0')}`,
          hash: transactionData.hash || generateMockTxHash(),
          from: transactionData.from,
          to: transactionData.to,
          value: transactionData.value || '0',
          gasUsed: '0',
          gasPrice: transactionData.gasPrice,
          gasLimit: transactionData.gasLimit,
          nonce: transactionData.nonce,
          status: 'pending',
          blockNumber: 0,
          network: transactionData.network,
          timestamp: new Date().toISOString(),
          confirmations: 0,
          type: transactionData.type || 'smart_contract',
          fee: calculateFee(transactionData.gasLimit, transactionData.gasPrice),
          methodName: transactionData.methodName,
          params: transactionData.params
        };

        transactions.unshift(newTransaction);
        return NextResponse.json({
          success: true,
          data: newTransaction,
          message: 'Transaction broadcast successfully'
        });

      case 'simulate':
        const simulation = simulateTransaction(transactionData);
        return NextResponse.json({
          success: true,
          data: simulation,
          message: 'Transaction simulation completed'
        });

      case 'estimate-gas':
        const gasEstimate = estimateGas(transactionData);
        return NextResponse.json({
          success: true,
          data: gasEstimate,
          message: 'Gas estimation completed'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Transactions POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, updates } = body;

    const txIndex = transactions.findIndex(tx => tx.id === transactionId);
    if (txIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const updatedTransaction = {
      ...transactions[txIndex],
      ...updates
    };

    transactions[txIndex] = updatedTransaction;

    return NextResponse.json({
      success: true,
      data: updatedTransaction,
      message: 'Transaction updated successfully'
    });
  } catch (error) {
    console.error('Transactions PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID required' },
        { status: 400 }
      );
    }

    const txIndex = transactions.findIndex(tx => tx.id === transactionId);
    if (txIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    transactions.splice(txIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Transaction removed successfully'
    });
  } catch (error) {
    console.error('Transactions DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove transaction' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateMockTxHash(): string {
  return '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function calculateFee(gasLimit: string, gasPrice: string): string {
  const gasUsed = parseInt(gasLimit);
  const price = parseInt(gasPrice);
  const fee = (gasUsed * price) / 1e18;
  return `${fee.toFixed(6)} ETH`;
}

function simulateTransaction(txData: any) {
  return {
    success: true,
    gasEstimate: Math.floor(Math.random() * 200000) + 50000,
    events: [
      {
        name: 'Transfer',
        data: {
          from: txData.from,
          to: txData.to,
          value: txData.value
        }
      }
    ],
    status: 'success',
    logs: [
      'Transaction would succeed',
      'No reverts detected'
    ]
  };
}

function estimateGas(txData: any) {
  return {
    gasLimit: Math.floor(Math.random() * 100000) + 21000,
    gasPrice: txData.gasPrice || '25000000000',
    totalCost: calculateFee(
      (Math.floor(Math.random() * 100000) + 21000).toString(),
      txData.gasPrice || '25000000000'
    )
  };
}