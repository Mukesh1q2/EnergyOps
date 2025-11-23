import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

interface TradeOrder {
  id: string;
  orderId: number;
  orderHash: string;
  trader: string;
  type: 'buy' | 'sell';
  tokenId: string;
  tokenSymbol: string;
  amount: string;
  price: string;
  totalValue: string;
  timestamp: string;
  expiryTime: string;
  status: 'open' | 'partial' | 'filled' | 'cancelled' | 'expired';
  filledAmount: string;
  remainingAmount: string;
  fee: string;
  feeToken: string;
  gasUsed: string;
  blockNumber: number;
  transactionHash: string;
  network: string;
  counterparty?: string;
  matchPrice?: string;
  slippage: number;
  priorityFee: string;
}

interface Match {
  id: string;
  buyOrderId: string;
  sellOrderId: string;
  amount: string;
  price: string;
  timestamp: string;
  transactionHash: string;
  blockNumber: number;
  fee: string;
  maker: string;
  taker: string;
  slippage: number;
}

interface OrderBook {
  tokenId: string;
  tokenSymbol: string;
  network: string;
  bids: Array<{
    price: string;
    amount: string;
    orders: number;
    totalValue: string;
  }>;
  asks: Array<{
    price: string;
    amount: string;
    orders: number;
    totalValue: string;
  }>;
  spread: {
    price: string;
    percentage: number;
  };
  lastPrice: string;
  priceChange24h: number;
  volume24h: string;
  liquidity: string;
}

interface DEXPool {
  id: string;
  name: string;
  tokenA: string;
  tokenB: string;
  tokenASymbol: string;
  tokenBSymbol: string;
  reserveA: string;
  reserveB: string;
  totalValueLocked: string;
  volume24h: string;
  fees24h: string;
  apy: number;
  participants: number;
  priceImpact: number;
  network: string;
  contractAddress: string;
  fee: number;
}

interface LiquidityPosition {
  id: string;
  poolId: string;
  userAddress: string;
  lpTokens: string;
  sharePercentage: number;
  tokenAAmount: string;
  tokenBAmount: string;
  valueUSD: string;
  earnedFees: string;
  impermanentLoss: string;
  timestamp: string;
}

interface TradeHistory {
  id: string;
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  tokenId: string;
  tokenSymbol: string;
  side: 'buy' | 'sell';
  amount: string;
  price: string;
  total: string;
  fee: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'cancelled';
  counterparty?: string;
  txHash: string;
}

// Simulated decentralized trading data
const tradeOrders: TradeOrder[] = [
  {
    id: 'order-001',
    orderId: 12345,
    orderHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    trader: '0x742d35Cc6C1e7A8B1c6C3C9B2F4C2A5D8E9F1B3A',
    type: 'buy',
    tokenId: 'energy-solar-001',
    tokenSymbol: 'ESOLAR',
    amount: '1000',
    price: '0.085',
    totalValue: '85',
    timestamp: '2025-11-19T01:35:12Z',
    expiryTime: '2025-11-20T01:35:12Z',
    status: 'open',
    filledAmount: '0',
    remainingAmount: '1000',
    fee: '0.085',
    feeToken: 'ESOLAR',
    gasUsed: '125430',
    blockNumber: 18450325,
    transactionHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab',
    network: 'polygon',
    slippage: 1.0,
    priorityFee: '2'
  },
  {
    id: 'order-002',
    orderId: 12346,
    orderHash: '0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef',
    trader: '0x823c3C5c2B1C2A3E4F5B6C7D8E9F1A2B3C4D5E6F7',
    type: 'sell',
    tokenId: 'energy-solar-001',
    tokenSymbol: 'ESOLAR',
    amount: '500',
    price: '0.086',
    totalValue: '43',
    timestamp: '2025-11-19T01:32:45Z',
    expiryTime: '2025-11-20T01:32:45Z',
    status: 'partial',
    filledAmount: '250',
    remainingAmount: '250',
    fee: '0.043',
    feeToken: 'ESOLAR',
    gasUsed: '98765',
    blockNumber: 18450324,
    transactionHash: '0x2b3c4d5e6f7890ab1234567890abcdef1234567890abcdef1234567890abcdef',
    network: 'polygon',
    slippage: 0.5,
    priorityFee: '1.5'
  },
  {
    id: 'order-003',
    orderId: 12347,
    orderHash: '0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef',
    trader: '0x445A7E9B4C3D2E1F6A7B8C9D0E1F2A3B4C5D6E7F8',
    type: 'buy',
    tokenId: 'energy-wind-002',
    tokenSymbol: 'EWIND',
    amount: '750',
    price: '0.092',
    totalValue: '69',
    timestamp: '2025-11-19T01:40:23Z',
    expiryTime: '2025-11-20T01:40:23Z',
    status: 'open',
    filledAmount: '0',
    remainingAmount: '750',
    fee: '0.069',
    feeToken: 'EWIND',
    gasUsed: '112345',
    blockNumber: 18450326,
    transactionHash: '0x3c4d5e6f7890ab234567890abcdef1234567890abcdef1234567890abcdef12',
    network: 'ethereum',
    slippage: 2.0,
    priorityFee: '3'
  }
];

const matches: Match[] = [
  {
    id: 'match-001',
    buyOrderId: 'order-002',
    sellOrderId: 'order-001',
    amount: '250',
    price: '0.0855',
    timestamp: '2025-11-19T01:33:12Z',
    transactionHash: '0x4d5e6f7890ab34567890123456789abcdef1234567890abcdef123456789012345',
    blockNumber: 18450324,
    fee: '0.021375',
    maker: '0x823c3C5c2B1C2A3E4F5B6C7D8E9F1A2B3C4D5E6F7',
    taker: '0x742d35Cc6C1e7A8B1c6C3C9B2F4C2A5D8E9F1B3A',
    slippage: 0.3
  },
  {
    id: 'match-002',
    buyOrderId: 'order-004',
    sellOrderId: 'order-005',
    amount: '500',
    price: '0.091',
    timestamp: '2025-11-19T01:28:45Z',
    transactionHash: '0x5e6f7890ab4567890123456789012abcdef1234567890abcdef1234567890123456',
    blockNumber: 18450323,
    fee: '0.0455',
    maker: '0x556789E1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8',
    taker: '0x667890F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8',
    slippage: 0.8
  }
];

const orderBooks: OrderBook[] = [
  {
    tokenId: 'energy-solar-001',
    tokenSymbol: 'ESOLAR',
    network: 'polygon',
    bids: [
      { price: '0.0845', amount: '1500', orders: 3, totalValue: '126.75' },
      { price: '0.0840', amount: '2000', orders: 5, totalValue: '168' },
      { price: '0.0835', amount: '2500', orders: 7, totalValue: '208.75' }
    ],
    asks: [
      { price: '0.0860', amount: '1000', orders: 2, totalValue: '86' },
      { price: '0.0865', amount: '1500', orders: 4, totalValue: '129.75' },
      { price: '0.0870', amount: '2000', orders: 6, totalValue: '174' }
    ],
    spread: { price: '0.0015', percentage: 1.76 },
    lastPrice: '0.0855',
    priceChange24h: 2.1,
    volume24h: '245,000',
    liquidity: '125,000'
  },
  {
    tokenId: 'energy-wind-002',
    tokenSymbol: 'EWIND',
    network: 'ethereum',
    bids: [
      { price: '0.0915', amount: '800', orders: 2, totalValue: '73.2' },
      { price: '0.0910', amount: '1200', orders: 3, totalValue: '109.2' },
      { price: '0.0905', amount: '1500', orders: 4, totalValue: '135.75' }
    ],
    asks: [
      { price: '0.0925', amount: '600', orders: 1, totalValue: '55.5' },
      { price: '0.0930', amount: '1000', orders: 2, totalValue: '93' },
      { price: '0.0935', amount: '1300', orders: 3, totalValue: '121.55' }
    ],
    spread: { price: '0.0010', percentage: 1.08 },
    lastPrice: '0.0920',
    priceChange24h: -0.8,
    volume24h: '180,000',
    liquidity: '95,000'
  }
];

const dexPools: DEXPool[] = [
  {
    id: 'pool-001',
    name: 'ESOLAR/WETH Pool',
    tokenA: 'energy-solar-001',
    tokenB: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    tokenASymbol: 'ESOLAR',
    tokenBSymbol: 'WETH',
    reserveA: '50000',
    reserveB: '4250',
    totalValueLocked: '893750',
    volume24h: '245000',
    fees24h: '2450',
    apy: 12.5,
    participants: 127,
    priceImpact: 0.15,
    network: 'polygon',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    fee: 0.003
  },
  {
    id: 'pool-002',
    name: 'EWIND/USDC Pool',
    tokenA: 'energy-wind-002',
    tokenB: '0xA0b86a33E6411C1d4b20B9A2b1C3D4E5F6A7B8C9',
    tokenASymbol: 'EWIND',
    tokenBSymbol: 'USDC',
    reserveA: '35000',
    reserveB: '3220000',
    totalValueLit: '3864000',
    volume24h: '180000',
    fees24h: '1800',
    apy: 9.8,
    participants: 89,
    priceImpact: 0.22,
    network: 'ethereum',
    contractAddress: '0x2345678901abcdef2345678901abcdef23456789',
    fee: 0.003
  },
  {
    id: 'pool-003',
    name: 'ESTORAGE/ETH Pool',
    tokenA: 'energy-storage-003',
    tokenB: '0x0000000000000000000000000000000000000000',
    tokenASymbol: 'ESTORAGE',
    tokenBSymbol: 'ETH',
    reserveA: '25000',
    reserveB: '1950',
    totalValueLocked: '250000',
    volume24h: '95000',
    fees24h: '950',
    apy: 15.2,
    participants: 64,
    priceImpact: 0.18,
    network: 'arbitrum',
    contractAddress: '0x3456789012abcdef3456789012abcdef34567890',
    fee: 0.003
  }
];

const liquidityPositions: LiquidityPosition[] = [
  {
    id: 'lp-001',
    poolId: 'pool-001',
    userAddress: '0x742d35Cc6C1e7A8B1c6C3C9B2F4C2A5D8E9F1B3A',
    lpTokens: '1250',
    sharePercentage: 2.5,
    tokenAAmount: '1250',
    tokenBAmount: '106.25',
    valueUSD: '22343.75',
    earnedFees: '187.50',
    impermanentLoss: '-2.3',
    timestamp: '2025-11-15T14:23:45Z'
  },
  {
    id: 'lp-002',
    poolId: 'pool-002',
    userAddress: '0x823c3C5c2B1C2A3E4F5B6C7D8E9F1A2B3C4D5E6F7',
    lpTokens: '800',
    sharePercentage: 1.6,
    tokenAAmount: '560',
    tokenBAmount: '51520',
    valueUSD: '61824',
    earnedFees: '245.60',
    impermanentLoss: '-0.8',
    timestamp: '2025-11-10T09:15:22Z'
  }
];

const tradeHistory: TradeHistory[] = [
  {
    id: 'trade-001',
    type: 'limit',
    tokenId: 'energy-solar-001',
    tokenSymbol: 'ESOLAR',
    side: 'buy',
    amount: '1000',
    price: '0.085',
    total: '85',
    fee: '0.85',
    timestamp: '2025-11-19T01:35:12Z',
    status: 'completed',
    txHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab'
  },
  {
    id: 'trade-002',
    type: 'market',
    tokenId: 'energy-wind-002',
    tokenSymbol: 'EWIND',
    side: 'sell',
    amount: '500',
    price: '0.092',
    total: '46',
    fee: '0.46',
    timestamp: '2025-11-19T01:32:45Z',
    status: 'completed',
    counterparty: '0x445A7E9B4C3D2E1F6A7B8C9D0E1F2A3B4C5D6E7F8',
    txHash: '0x2b3c4d5e6f7890ab1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  {
    id: 'trade-003',
    type: 'limit',
    tokenId: 'energy-storage-003',
    tokenSymbol: 'ESTORAGE',
    side: 'buy',
    amount: '750',
    price: '0.078',
    total: '58.5',
    fee: '0.585',
    timestamp: '2025-11-19T01:28:23Z',
    status: 'pending',
    txHash: '0x3c4d5e6f7890ab234567890abcdef1234567890abcdef1234567890abcdef12'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network');
    const tokenId = searchParams.get('tokenId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const address = searchParams.get('address');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (action === 'orderbook') {
      let filteredBooks = orderBooks;
      if (tokenId) {
        filteredBooks = orderBooks.filter(book => book.tokenId === tokenId);
      }
      if (network) {
        filteredBooks = filteredBooks.filter(book => book.network === network);
      }

      return NextResponse.json({
        success: true,
        data: filteredBooks,
        total: filteredBooks.length
      });
    }

    if (action === 'pools') {
      let filteredPools = dexPools;
      if (network) {
        filteredPools = dexPools.filter(pool => pool.network === network);
      }

      return NextResponse.json({
        success: true,
        data: filteredPools,
        total: filteredPools.length
      });
    }

    if (action === 'positions') {
      let filteredPositions = liquidityPositions;
      if (address) {
        filteredPositions = liquidityPositions.filter(pos => 
          pos.userAddress.toLowerCase() === address.toLowerCase()
        );
      }
      if (network) {
        filteredPositions = filteredPositions.filter(pos => {
          const pool = dexPools.find(p => p.id === pos.poolId);
          return pool?.network === network;
        });
      }

      return NextResponse.json({
        success: true,
        data: filteredPositions,
        total: filteredPositions.length
      });
    }

    if (action === 'history') {
      let filteredHistory = tradeHistory;
      if (tokenId) {
        filteredHistory = tradeHistory.filter(trade => trade.tokenId === tokenId);
      }
      if (type) {
        filteredHistory = filteredHistory.filter(trade => trade.type === type);
      }
      if (status) {
        filteredHistory = filteredHistory.filter(trade => trade.status === status);
      }
      if (address) {
        filteredHistory = filteredHistory.filter(trade => 
          trade.counterparty?.toLowerCase() === address.toLowerCase()
        );
      }

      // Sort by timestamp (newest first)
      filteredHistory.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      const paginatedHistory = filteredHistory.slice(offset, offset + limit);

      return NextResponse.json({
        success: true,
        data: paginatedHistory,
        pagination: {
          total: filteredHistory.length,
          limit,
          offset,
          hasMore: offset + limit < filteredHistory.length
        }
      });
    }

    let filteredOrders = [...tradeOrders];

    if (network) {
      filteredOrders = filteredOrders.filter(order => order.network === network);
    }

    if (tokenId) {
      filteredOrders = filteredOrders.filter(order => order.tokenId === tokenId);
    }

    if (type) {
      filteredOrders = filteredOrders.filter(order => order.type === type);
    }

    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    if (address) {
      filteredOrders = filteredOrders.filter(order => 
        order.trader.toLowerCase() === address.toLowerCase()
      );
    }

    // Sort by timestamp (newest first)
    filteredOrders.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const paginatedOrders = filteredOrders.slice(offset, offset + limit);

    // Calculate statistics
    const stats = {
      total: filteredOrders.length,
      open: filteredOrders.filter(order => order.status === 'open').length,
      partial: filteredOrders.filter(order => order.status === 'partial').length,
      filled: filteredOrders.filter(order => order.status === 'filled').length,
      totalVolume: filteredOrders
        .filter(order => order.status === 'filled' || order.status === 'partial')
        .reduce((sum, order) => sum + parseFloat(order.filledAmount || '0'), 0),
      avgPrice: filteredOrders.length > 0 ? 
        filteredOrders.reduce((sum, order) => sum + parseFloat(order.price), 0) / filteredOrders.length : 0
    };

    return NextResponse.json({
      success: true,
      data: paginatedOrders,
      pagination: {
        total: filteredOrders.length,
        limit,
        offset,
        hasMore: offset + limit < filteredOrders.length
      },
      stats
    });
  } catch (error) {
    console.error('Decentralized trading API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trading data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, orderData } = body;

    switch (action) {
      case 'create-order':
        const newOrder: TradeOrder = {
          id: `order-${String(tradeOrders.length + 1).padStart(3, '0')}`,
          orderId: Math.floor(Math.random() * 100000) + 10000,
          orderHash: generateMockHash(),
          trader: orderData.trader,
          type: orderData.type,
          tokenId: orderData.tokenId,
          tokenSymbol: orderData.tokenSymbol,
          amount: orderData.amount,
          price: orderData.price,
          totalValue: (parseFloat(orderData.amount) * parseFloat(orderData.price)).toFixed(3),
          timestamp: new Date().toISOString(),
          expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          status: 'open',
          filledAmount: '0',
          remainingAmount: orderData.amount,
          fee: ((parseFloat(orderData.amount) * parseFloat(orderData.price)) * 0.001).toFixed(3),
          feeToken: orderData.tokenSymbol,
          gasUsed: '0',
          blockNumber: 0,
          transactionHash: '',
          network: orderData.network,
          slippage: orderData.slippage || 1.0,
          priorityFee: orderData.priorityFee || '2'
        };

        tradeOrders.unshift(newOrder);
        return NextResponse.json({
          success: true,
          data: newOrder,
          message: 'Order created successfully'
        });

      case 'cancel-order':
        const orderIndex = tradeOrders.findIndex(order => order.id === orderData.orderId);
        if (orderIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Order not found' },
            { status: 404 }
          );
        }

        if (tradeOrders[orderIndex].trader.toLowerCase() !== orderData.trader.toLowerCase()) {
          return NextResponse.json(
            { success: false, error: 'Unauthorized: Only order owner can cancel' },
            { status: 403 }
          );
        }

        tradeOrders[orderIndex].status = 'cancelled';
        return NextResponse.json({
          success: true,
          data: tradeOrders[orderIndex],
          message: 'Order cancelled successfully'
        });

      case 'add-liquidity':
        const poolIndex = dexPools.findIndex(pool => pool.id === orderData.poolId);
        if (poolIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Pool not found' },
            { status: 404 }
          );
        }

        const newPosition: LiquidityPosition = {
          id: `lp-${String(liquidityPositions.length + 1).padStart(3, '0')}`,
          poolId: orderData.poolId,
          userAddress: orderData.userAddress,
          lpTokens: orderData.lpTokens,
          sharePercentage: parseFloat(orderData.sharePercentage) || 0.1,
          tokenAAmount: orderData.tokenAAmount,
          tokenBAmount: orderData.tokenBAmount,
          valueUSD: orderData.valueUSD,
          earnedFees: '0',
          impermanentLoss: '0',
          timestamp: new Date().toISOString()
        };

        liquidityPositions.push(newPosition);
        
        // Update pool reserves
        dexPools[poolIndex].reserveA = (parseFloat(dexPools[poolIndex].reserveA) + parseFloat(orderData.tokenAAmount)).toString();
        dexPools[poolIndex].reserveB = (parseFloat(dexPools[poolIndex].reserveB) + parseFloat(orderData.tokenBAmount)).toString();
        dexPools[poolIndex].participants += 1;

        return NextResponse.json({
          success: true,
          data: newPosition,
          message: 'Liquidity added successfully'
        });

      case 'remove-liquidity':
        const positionIndex = liquidityPositions.findIndex(pos => 
          pos.id === orderData.positionId && 
          pos.userAddress.toLowerCase() === orderData.userAddress.toLowerCase()
        );

        if (positionIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Liquidity position not found' },
            { status: 404 }
          );
        }

        const position = liquidityPositions[positionIndex];
        const poolIdx = dexPools.findIndex(pool => pool.id === position.poolId);
        
        if (poolIdx !== -1) {
          // Remove liquidity from pool
          dexPools[poolIdx].reserveA = (parseFloat(dexPools[poolIdx].reserveA) - parseFloat(position.tokenAAmount)).toString();
          dexPools[poolIdx].reserveB = (parseFloat(dexPools[poolIdx].reserveB) - parseFloat(position.tokenBAmount)).toString();
          dexPools[poolIdx].participants = Math.max(0, dexPools[poolIdx].participants - 1);
        }

        liquidityPositions.splice(positionIndex, 1);
        return NextResponse.json({
          success: true,
          message: 'Liquidity removed successfully'
        });

      case 'execute-trade':
        const buyOrder = tradeOrders.find(order => order.id === orderData.buyOrderId);
        const sellOrder = tradeOrders.find(order => order.id === orderData.sellOrderId);
        
        if (!buyOrder || !sellOrder) {
          return NextResponse.json(
            { success: false, error: 'Order not found' },
            { status: 404 }
          );
        }

        if (buyOrder.type !== 'buy' || sellOrder.type !== 'sell') {
          return NextResponse.json(
            { success: false, error: 'Invalid order types for matching' },
            { status: 400 }
          );
        }

        const matchAmount = Math.min(
          parseFloat(buyOrder.remainingAmount),
          parseFloat(sellOrder.remainingAmount)
        );

        const matchPrice = (parseFloat(buyOrder.price) + parseFloat(sellOrder.price)) / 2;

        const newMatch: Match = {
          id: `match-${String(matches.length + 1).padStart(3, '0')}`,
          buyOrderId: buyOrder.id,
          sellOrderId: sellOrder.id,
          amount: matchAmount.toString(),
          price: matchPrice.toFixed(6),
          timestamp: new Date().toISOString(),
          transactionHash: generateMockTxHash(),
          blockNumber: Math.floor(Math.random() * 100000) + 18000000,
          fee: (matchAmount * matchPrice * 0.001).toFixed(6),
          maker: sellOrder.id < buyOrder.id ? sellOrder.trader : buyOrder.trader,
          taker: sellOrder.id < buyOrder.id ? buyOrder.trader : sellOrder.trader,
          slippage: 0.5
        };

        matches.push(newMatch);

        // Update order fills
        const buyOrderIndex = tradeOrders.findIndex(order => order.id === buyOrder.id);
        const sellOrderIndex = tradeOrders.findIndex(order => order.id === sellOrder.id);

        const buyFilled = parseFloat(buyOrder.filledAmount) + matchAmount;
        const sellFilled = parseFloat(sellOrder.filledAmount) + matchAmount;

        tradeOrders[buyOrderIndex].filledAmount = buyFilled.toString();
        tradeOrders[buyOrderIndex].remainingAmount = (parseFloat(buyOrder.amount) - buyFilled).toString();
        tradeOrders[sellOrderIndex].filledAmount = sellFilled.toString();
        tradeOrders[sellOrderIndex].remainingAmount = (parseFloat(sellOrder.amount) - sellFilled).toString();

        // Update order status
        if (buyFilled >= parseFloat(buyOrder.amount)) {
          tradeOrders[buyOrderIndex].status = 'filled';
        } else {
          tradeOrders[buyOrderIndex].status = 'partial';
        }

        if (sellFilled >= parseFloat(sellOrder.amount)) {
          tradeOrders[sellOrderIndex].status = 'filled';
        } else {
          tradeOrders[sellOrderIndex].status = 'partial';
        }

        return NextResponse.json({
          success: true,
          data: newMatch,
          message: 'Trade executed successfully'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Decentralized trading POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process trading operation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, updates } = body;

    const orderIndex = tradeOrders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const updatedOrder = {
      ...tradeOrders[orderIndex],
      ...updates
    };

    tradeOrders[orderIndex] = updatedOrder;

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Decentralized trading PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID required' },
        { status: 400 }
      );
    }

    const orderIndex = tradeOrders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    tradeOrders.splice(orderIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Order removed successfully'
    });
  } catch (error) {
    console.error('Decentralized trading DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove order' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateMockHash(): string {
  return '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function generateMockTxHash(): string {
  return '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
}