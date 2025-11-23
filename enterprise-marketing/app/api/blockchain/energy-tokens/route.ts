import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

interface EnergyToken {
  id: string;
  symbol: string;
  name: string;
  contractAddress: string;
  network: string;
  totalSupply: string;
  circulatingSupply: string;
  decimals: number;
  type: 'renewable' | 'fossil' | 'nuclear' | 'storage' | 'grid';
  sourceType: 'solar' | 'wind' | 'hydro' | 'geothermal' | 'coal' | 'gas' | 'nuclear' | 'battery';
  carbonOffset: string;
  location: string;
  issuanceDate: string;
  expirationDate?: string;
  verified: boolean;
  issuer: string;
  certificateUrl?: string;
  metadata: {
    powerOutput: string;
    efficiency: number;
    capacity: string;
    operationalHours: number;
    environmentalScore: number;
  };
  tradingData: {
    price: string;
    volume24h: string;
    marketCap: string;
    priceChange24h: number;
    liquidity: string;
    tradingPairs: string[];
  };
  compliance: {
    standard: string;
    certified: boolean;
    regulatoryStatus: 'compliant' | 'pending' | 'non_compliant';
    lastAudit: string;
    auditScore: number;
  };
}

interface TokenBalance {
  id: string;
  address: string;
  tokenId: string;
  balance: string;
  locked: string;
  available: string;
  lastUpdated: string;
}

interface TokenTransfer {
  id: string;
  hash: string;
  tokenId: string;
  from: string;
  to: string;
  amount: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  network: string;
  gasFee: string;
  method: 'transfer' | 'transferFrom' | 'mint' | 'burn';
}

interface TokenMetadata {
  id: string;
  location: string;
  powerPlantName: string;
  sourceType: string;
  commissioningDate: string;
  capacity: string;
  annualGeneration: string;
  carbonIntensity: string;
  certificates: {
    type: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    documentHash: string;
  }[];
  documentation: {
    type: string;
    url: string;
    hash: string;
    verified: boolean;
  }[];
}

interface PoolData {
  id: string;
  name: string;
  tokenId: string;
  totalLiquidity: string;
  reserveToken: string;
  reserveETH: string;
  exchangeRate: string;
  volume24h: string;
  fees24h: string;
  participants: number;
  apy: number;
}

// Simulated energy token data
const energyTokens: EnergyToken[] = [
  {
    id: 'energy-solar-001',
    symbol: 'ESOLAR',
    name: 'Solar Energy Token',
    contractAddress: '0x445A7E9B4C3D2E1F6A7B8C9D0E1F2A3B4C5D6E7F8',
    network: 'polygon',
    totalSupply: '10000000',
    circulatingSupply: '8750000',
    decimals: 18,
    type: 'renewable',
    sourceType: 'solar',
    carbonOffset: '125000',
    location: 'California, USA',
    issuanceDate: '2025-01-15T00:00:00Z',
    expirationDate: '2026-01-15T00:00:00Z',
    verified: true,
    issuer: 'SolarFarm Corp',
    certificateUrl: 'https://certificates.solarfarm.com/ESOLAR-001',
    metadata: {
      powerOutput: '50 MW',
      efficiency: 0.92,
      capacity: '50000 MWh/year',
      operationalHours: 8760,
      environmentalScore: 95
    },
    tradingData: {
      price: '0.085',
      volume24h: '245,000',
      marketCap: '743,750',
      priceChange24h: 3.2,
      liquidity: '125,000',
      tradingPairs: ['ESOLAR/USDC', 'ESOLAR/ETH']
    },
    compliance: {
      standard: 'ISO 14064',
      certified: true,
      regulatoryStatus: 'compliant',
      lastAudit: '2025-10-15T00:00:00Z',
      auditScore: 98
    }
  },
  {
    id: 'energy-wind-002',
    symbol: 'EWIND',
    name: 'Wind Energy Token',
    contractAddress: '0x556789E1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8',
    network: 'ethereum',
    totalSupply: '5000000',
    circulatingSupply: '4200000',
    decimals: 18,
    type: 'renewable',
    sourceType: 'wind',
    carbonOffset: '85000',
    location: 'Texas, USA',
    issuanceDate: '2025-02-01T00:00:00Z',
    expirationDate: '2026-02-01T00:00:00Z',
    verified: true,
    issuer: 'WindTech Industries',
    certificateUrl: 'https://certificates.windtech.com/EWIND-002',
    metadata: {
      powerOutput: '75 MW',
      efficiency: 0.88,
      capacity: '75000 MWh/year',
      operationalHours: 7200,
      environmentalScore: 97
    },
    tradingData: {
      price: '0.092',
      volume24h: '180,000',
      marketCap: '386,400',
      priceChange24h: -1.1,
      liquidity: '95,000',
      tradingPairs: ['EWIND/USDC', 'EWIND/ETH', 'EWIND/DAI']
    },
    compliance: {
      standard: 'I-REC Standard',
      certified: true,
      regulatoryStatus: 'compliant',
      lastAudit: '2025-09-20T00:00:00Z',
      auditScore: 96
    }
  },
  {
    id: 'energy-storage-003',
    symbol: 'ESTORAGE',
    name: 'Energy Storage Token',
    contractAddress: '0x667890F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8',
    network: 'arbitrum',
    totalSupply: '3000000',
    circulatingSupply: '2600000',
    decimals: 18,
    type: 'storage',
    sourceType: 'battery',
    carbonOffset: '45000',
    location: 'Nevada, USA',
    issuanceDate: '2025-03-10T00:00:00Z',
    expirationDate: '2027-03-10T00:00:00Z',
    verified: true,
    issuer: 'GridStorage Solutions',
    certificateUrl: 'https://certificates.gridstorage.com/ESTORAGE-003',
    metadata: {
      powerOutput: '100 MW',
      efficiency: 0.95,
      capacity: '400 MWh',
      operationalHours: 8760,
      environmentalScore: 92
    },
    tradingData: {
      price: '0.078',
      volume24h: '95,000',
      marketCap: '202,800',
      priceChange24h: 2.8,
      liquidity: '65,000',
      tradingPairs: ['ESTORAGE/USDC', 'ESTORAGE/ETH']
    },
    compliance: {
      standard: 'REC Standard',
      certified: true,
      regulatoryStatus: 'compliant',
      lastAudit: '2025-11-01T00:00:00Z',
      auditScore: 94
    }
  },
  {
    id: 'energy-hydro-004',
    symbol: 'EHYDRO',
    name: 'Hydroelectric Energy Token',
    contractAddress: '0x778901A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8',
    network: 'polygon',
    totalSupply: '8000000',
    circulatingSupply: '7200000',
    decimals: 18,
    type: 'renewable',
    sourceType: 'hydro',
    carbonOffset: '95000',
    location: 'British Columbia, Canada',
    issuanceDate: '2025-01-20T00:00:00Z',
    verified: true,
    issuer: 'HydroPower BC',
    certificateUrl: 'https://certificates.hydrobc.com/EHYDRO-004',
    metadata: {
      powerOutput: '200 MW',
      efficiency: 0.94,
      capacity: '200000 MWh/year',
      operationalHours: 8760,
      environmentalScore: 98
    },
    tradingData: {
      price: '0.065',
      volume24h: '320,000',
      marketCap: '468,000',
      priceChange24h: 0.5,
      liquidity: '180,000',
      tradingPairs: ['EHYDRO/USDC', 'EHYDRO/ETH', 'EHYDRO/USDT']
    },
    compliance: {
      standard: 'GoECO Standard',
      certified: true,
      regulatoryStatus: 'compliant',
      lastAudit: '2025-08-30T00:00:00Z',
      auditScore: 99
    }
  }
];

const tokenBalances: TokenBalance[] = [
  {
    id: 'balance-001',
    address: '0x742d35Cc6C1e7A8B1c6C3C9B2F4C2A5D8E9F1B3A',
    tokenId: 'energy-solar-001',
    balance: '50000',
    locked: '5000',
    available: '45000',
    lastUpdated: '2025-11-19T01:30:45Z'
  },
  {
    id: 'balance-002',
    address: '0x742d35Cc6C1e7A8B1c6C3C9B2F4C2A5D8E9F1B3A',
    tokenId: 'energy-wind-002',
    balance: '25000',
    locked: '2500',
    available: '22500',
    lastUpdated: '2025-11-19T01:30:45Z'
  },
  {
    id: 'balance-003',
    address: '0x823c3C5c2B1C2A3E4F5B6C7D8E9F1A2B3C4D5E6F7',
    tokenId: 'energy-storage-003',
    balance: '15000',
    locked: '0',
    available: '15000',
    lastUpdated: '2025-11-19T01:25:12Z'
  }
];

const tokenTransfers: TokenTransfer[] = [
  {
    id: 'transfer-001',
    hash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab',
    tokenId: 'energy-solar-001',
    from: '0x742d35Cc6C1e7A8B1c6C3C9B2F4C2A5D8E9F1B3A',
    to: '0x823c3C5c2B1C2A3E4F5B6C7D8E9F1A2B3C4D5E6F7',
    amount: '1000',
    timestamp: '2025-11-19T01:35:12Z',
    status: 'confirmed',
    network: 'polygon',
    gasFee: '0.001963 MATIC',
    method: 'transfer'
  },
  {
    id: 'transfer-002',
    hash: '0x2b3c4d5e6f7890ab1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenId: 'energy-wind-002',
    from: '0x823c3C5c2B1C2A3E4F5B6C7D8E9F1A2B3C4D5E6F7',
    to: '0x742d35Cc6C1e7A8B1c6C3C9B2F4C2A5D8E9F1B3A',
    amount: '500',
    timestamp: '2025-11-19T01:32:45Z',
    status: 'confirmed',
    network: 'ethereum',
    gasFee: '0.00313575 ETH',
    method: 'transfer'
  },
  {
    id: 'transfer-003',
    hash: '0x3c4d5e6f7890ab234567890abcdef1234567890abcdef1234567890abcdef12',
    tokenId: 'energy-storage-003',
    from: '0x667890F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8',
    to: '0x742d35Cc6C1e7A8B1c6C3C9B2F4C2A5D8E9F1B3A',
    amount: '750',
    timestamp: '2025-11-19T01:40:23Z',
    status: 'pending',
    network: 'arbitrum',
    gasFee: '0.00469134 ETH',
    method: 'transfer'
  }
];

const tokenMetadata: TokenMetadata[] = [
  {
    id: 'energy-solar-001',
    location: 'California, USA',
    powerPlantName: 'Desert Solar Farm Alpha',
    sourceType: 'Photovoltaic Solar Panels',
    commissioningDate: '2020-06-15',
    capacity: '50 MW',
    annualGeneration: '50000 MWh',
    carbonIntensity: '0.0 kg CO2/MWh',
    certificates: [
      {
        type: 'Renewable Energy Certificate',
        issuer: 'Western Renewable Energy Generation Information System',
        issueDate: '2025-01-15',
        expiryDate: '2026-01-15',
        documentHash: '0x1234567890abcdef...'
      }
    ],
    documentation: [
      {
        type: 'Environmental Impact Assessment',
        url: 'https://docs.solarfarm.com/eia-desert-alpha.pdf',
        hash: '0xabcdef1234567890...',
        verified: true
      },
      {
        type: 'Grid Connection Agreement',
        url: 'https://docs.solarfarm.com/grid-connection.pdf',
        hash: '0x567890abcdef1234...',
        verified: true
      }
    ]
  }
];

const liquidityPools: PoolData[] = [
  {
    id: 'pool-001',
    name: 'ESOLAR/USDC Pool',
    tokenId: 'energy-solar-001',
    totalLiquidity: '250,000',
    reserveToken: '125,000',
    reserveETH: '125,000',
    exchangeRate: '0.68',
    volume24h: '45,000',
    fees24h: '450',
    participants: 127,
    apy: 8.5
  },
  {
    id: 'pool-002',
    name: 'EWIND/ETH Pool',
    tokenId: 'energy-wind-002',
    totalLiquidity: '180,000',
    reserveToken: '90,000',
    reserveETH: '90,000',
    exchangeRate: '1.2',
    volume24h: '32,000',
    fees24h: '320',
    participants: 89,
    apy: 7.2
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network');
    const type = searchParams.get('type');
    const address = searchParams.get('address');
    const action = searchParams.get('action');
    const tokenId = searchParams.get('tokenId');

    if (action === 'balances') {
      let filteredBalances = tokenBalances;
      if (address) {
        filteredBalances = tokenBalances.filter(b => 
          b.address.toLowerCase() === address.toLowerCase()
        );
      }
      if (tokenId) {
        filteredBalances = filteredBalances.filter(b => b.tokenId === tokenId);
      }

      const enrichedBalances = filteredBalances.map(balance => {
        const token = energyTokens.find(t => t.id === balance.tokenId);
        return {
          ...balance,
          token: token ? {
            symbol: token.symbol,
            name: token.name,
            price: token.tradingData.price,
            value: (parseFloat(balance.available) * parseFloat(token.tradingData.price)).toFixed(2)
          } : null
        };
      });

      return NextResponse.json({
        success: true,
        data: enrichedBalances,
        total: enrichedBalances.length
      });
    }

    if (action === 'transfers') {
      let filteredTransfers = tokenTransfers;
      if (address) {
        filteredTransfers = filteredTransfers.filter(t => 
          t.from.toLowerCase() === address.toLowerCase() ||
          t.to.toLowerCase() === address.toLowerCase()
        );
      }
      if (tokenId) {
        filteredTransfers = filteredTransfers.filter(t => t.tokenId === tokenId);
      }
      if (network) {
        filteredTransfers = filteredTransfers.filter(t => t.network === network);
      }

      return NextResponse.json({
        success: true,
        data: filteredTransfers,
        total: filteredTransfers.length
      });
    }

    if (action === 'pools') {
      return NextResponse.json({
        success: true,
        data: liquidityPools,
        total: liquidityPools.length
      });
    }

    if (action === 'metadata' && tokenId) {
      const metadata = tokenMetadata.find(m => m.id === tokenId);
      if (!metadata) {
        return NextResponse.json(
          { success: false, error: 'Metadata not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: metadata
      });
    }

    let filteredTokens = [...energyTokens];

    if (network) {
      filteredTokens = filteredTokens.filter(token => token.network === network);
    }

    if (type) {
      filteredTokens = filteredTokens.filter(token => token.type === type);
    }

    // Calculate total market data
    const marketData = {
      totalMarketCap: filteredTokens
        .reduce((sum, token) => sum + parseFloat(token.tradingData.marketCap.replace(',', '')), 0)
        .toLocaleString(),
      totalVolume24h: filteredTokens
        .reduce((sum, token) => sum + parseFloat(token.tradingData.volume24h.replace(',', '')), 0)
        .toLocaleString(),
      avgPrice: (filteredTokens
        .reduce((sum, token) => sum + parseFloat(token.tradingData.price), 0) / 
        filteredTokens.length
      ).toFixed(3),
      totalCarbonOffset: filteredTokens
        .reduce((sum, token) => sum + parseFloat(token.carbonOffset), 0)
        .toLocaleString(),
      verifiedTokens: filteredTokens.filter(token => token.verified).length,
      compliantTokens: filteredTokens.filter(token => token.compliance.regulatoryStatus === 'compliant').length
    };

    return NextResponse.json({
      success: true,
      data: filteredTokens,
      total: filteredTokens.length,
      marketData
    });
  } catch (error) {
    console.error('Energy tokens API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch energy tokens' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tokenData } = body;

    switch (action) {
      case 'mint':
        const newToken: EnergyToken = {
          id: tokenData.id || `energy-${tokenData.sourceType}-${String(energyTokens.length + 1).padStart(3, '0')}`,
          symbol: tokenData.symbol,
          name: tokenData.name,
          contractAddress: tokenData.contractAddress || generateMockAddress(),
          network: tokenData.network,
          totalSupply: tokenData.totalSupply,
          circulatingSupply: tokenData.circulatingSupply || tokenData.totalSupply,
          decimals: tokenData.decimals || 18,
          type: tokenData.type,
          sourceType: tokenData.sourceType,
          carbonOffset: tokenData.carbonOffset,
          location: tokenData.location,
          issuanceDate: new Date().toISOString(),
          expirationDate: tokenData.expirationDate,
          verified: false,
          issuer: tokenData.issuer,
          metadata: tokenData.metadata,
          tradingData: {
            price: tokenData.price || '0.050',
            volume24h: '0',
            marketCap: '0',
            priceChange24h: 0,
            liquidity: '0',
            tradingPairs: []
          },
          compliance: {
            standard: tokenData.standard || 'REC Standard',
            certified: false,
            regulatoryStatus: 'pending',
            lastAudit: '',
            auditScore: 0
          }
        };

        energyTokens.push(newToken);
        return NextResponse.json({
          success: true,
          data: newToken,
          message: 'Energy token minted successfully'
        });

      case 'transfer':
        const newTransfer: TokenTransfer = {
          id: `transfer-${String(tokenTransfers.length + 1).padStart(3, '0')}`,
          hash: generateMockTxHash(),
          tokenId: tokenData.tokenId,
          from: tokenData.from,
          to: tokenData.to,
          amount: tokenData.amount,
          timestamp: new Date().toISOString(),
          status: 'pending',
          network: tokenData.network,
          gasFee: calculateFee(tokenData.gasLimit, tokenData.gasPrice),
          method: 'transfer'
        };

        tokenTransfers.unshift(newTransfer);
        return NextResponse.json({
          success: true,
          data: newTransfer,
          message: 'Token transfer initiated'
        });

      case 'verify':
        const tokenIndex = energyTokens.findIndex(t => t.id === tokenData.tokenId);
        if (tokenIndex !== -1) {
          energyTokens[tokenIndex].verified = true;
          energyTokens[tokenIndex].compliance.certified = true;
          energyTokens[tokenIndex].compliance.regulatoryStatus = 'compliant';
          energyTokens[tokenIndex].compliance.lastAudit = new Date().toISOString();
          energyTokens[tokenIndex].compliance.auditScore = tokenData.auditScore || 90;
          
          return NextResponse.json({
            success: true,
            data: energyTokens[tokenIndex],
            message: 'Token verification completed'
          });
        }
        return NextResponse.json(
          { success: false, error: 'Token not found' },
          { status: 404 }
        );

      case 'burn':
        const burnIndex = energyTokens.findIndex(t => t.id === tokenData.tokenId);
        if (burnIndex !== -1) {
          const currentSupply = parseFloat(energyTokens[burnIndex].circulatingSupply);
          const burnAmount = parseFloat(tokenData.amount);
          const newSupply = Math.max(0, currentSupply - burnAmount);
          
          energyTokens[burnIndex].circulatingSupply = newSupply.toString();
          energyTokens[burnIndex].totalSupply = newSupply.toString();
          
          return NextResponse.json({
            success: true,
            data: energyTokens[burnIndex],
            message: 'Tokens burned successfully'
          });
        }
        return NextResponse.json(
          { success: false, error: 'Token not found' },
          { status: 404 }
        );

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Energy tokens POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process token operation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenId, updates } = body;

    const tokenIndex = energyTokens.findIndex(t => t.id === tokenId);
    if (tokenIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Token not found' },
        { status: 404 }
      );
    }

    const updatedToken = {
      ...energyTokens[tokenIndex],
      ...updates
    };

    energyTokens[tokenIndex] = updatedToken;

    return NextResponse.json({
      success: true,
      data: updatedToken,
      message: 'Token updated successfully'
    });
  } catch (error) {
    console.error('Energy tokens PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update token' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('tokenId');

    if (!tokenId) {
      return NextResponse.json(
        { success: false, error: 'Token ID required' },
        { status: 400 }
      );
    }

    const tokenIndex = energyTokens.findIndex(t => t.id === tokenId);
    if (tokenIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Token not found' },
        { status: 404 }
      );
    }

    energyTokens.splice(tokenIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Token removed successfully'
    });
  } catch (error) {
    console.error('Energy tokens DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove token' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateMockAddress(): string {
  return '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function generateMockTxHash(): string {
  return '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function calculateFee(gasLimit: string, gasPrice: string): string {
  const gasUsed = parseInt(gasLimit);
  const price = parseInt(gasPrice);
  const fee = (gasUsed * price) / 1e18;
  return `${fee.toFixed(6)} ETH`;
}