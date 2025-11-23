'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GovernanceVoting: React.FC = () => {
  const [activeTab, setActiveTab] = useState('proposals');
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [votingPower, setVotingPower] = useState(0);
  const [userDelegations, setUserDelegations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data for proposals
  const proposals = [
    {
      id: 'prop-2024-089',
      title: 'Implement Advanced Yield Farming Strategies',
      description: 'Proposal to deploy capital into advanced yield farming strategies across multiple DeFi protocols to maximize treasury returns while maintaining safety.',
      proposer: '0x742d35Cc6C2C5e3B4F8e8E2D1C9A7B5F3E8D2A1C9',
      status: 'active',
      type: 'treasury',
      category: 'investment',
      createdAt: '2025-11-15T10:30:00Z',
      endTime: '2025-11-22T10:30:00Z',
      executionTime: '2025-11-25T10:30:00Z',
      votes: {
        for: 23456789,
        against: 3456789,
        abstain: 1234567,
        total: 28158145
      },
      percentages: {
        for: 83.3,
        against: 12.3,
        abstain: 4.4
      },
      quorum: {
        required: 10000000,
        achieved: 28158145,
        percentage: 281.6
      },
      budget: 5000000,
      timeline: '6 months',
      protocols: ['compound', 'aave', 'yearn', 'curve'],
      expectedAPY: '12-18%',
      riskLevel: 'medium'
    },
    {
      id: 'prop-2024-088',
      title: 'Carbon Offset Program Expansion',
      description: 'Expand carbon offset program to include direct purchase of verified carbon credits and development of new offset methodologies.',
      proposer: '0x987f32a1B9C7e5d3F2A8B6C4E9D1A7F3E5B8C2A9',
      status: 'passed',
      type: 'program',
      category: 'sustainability',
      createdAt: '2025-11-10T14:15:00Z',
      endTime: '2025-11-17T14:15:00Z',
      executionTime: '2025-11-20T14:15:00Z',
      votes: {
        for: 18934567,
        against: 2345678,
        abstain: 890123,
        total: 22070368
      },
      percentages: {
        for: 85.8,
        against: 10.6,
        abstain: 4.0
      },
      quorum: {
        required: 10000000,
        achieved: 22070368,
        percentage: 220.7
      },
      budget: 2000000,
      timeline: '12 months',
      partners: ['Verra', 'Gold Standard', 'American Carbon Registry'],
      targets: {
        offsetTonnes: 500000,
        methodologies: 5,
        partnerships: 12
      }
    },
    {
      id: 'prop-2024-087',
      title: 'Cross-Chain Bridge Integration',
      description: 'Deploy bridges to Polygon, Arbitrum, and Optimism to enable multi-chain energy trading and reduce transaction costs.',
      proposer: '0x1234567890abcdef1234567890abcdef12345678',
      status: 'failed',
      type: 'technical',
      category: 'infrastructure',
      createdAt: '2025-11-05T09:45:00Z',
      endTime: '2025-11-12T09:45:00Z',
      votes: {
        for: 4567890,
        against: 12345678,
        abstain: 2345678,
        total: 19259246
      },
      percentages: {
        for: 23.7,
        against: 64.1,
        abstain: 12.2
      },
      quorum: {
        required: 10000000,
        achieved: 19259246,
        percentage: 192.6
      },
      failureReason: 'Low community support due to security concerns'
    }
  ];

  // Delegates data
  const delegates = [
    {
      id: 'delegate-001',
      name: 'Energy Expert Collective',
      address: '0x1111111111111111111111111111111111111111',
      votingPower: 45678901,
      reputation: 95.7,
      specialization: 'Energy Markets',
      proposalsVoted: 189,
      successRate: 87.3,
      delegates: 1245,
      totalStake: 45678901,
      feeRate: 1.5,
      socials: {
        twitter: '@energyexpertdao',
        discord: 'energy-expert',
        forum: 'energy-expert-collective'
      },
      performance: {
        monthlyReturns: 15.6,
        riskScore: 2.3,
        consistency: 92.4
      }
    },
    {
      id: 'delegate-002',
      name: 'DeFi Strategies Guild',
      address: '0x2222222222222222222222222222222222222222',
      votingPower: 34567890,
      reputation: 89.2,
      specialization: 'DeFi Protocols',
      proposalsVoted: 156,
      successRate: 84.6,
      delegates: 892,
      totalStake: 34567890,
      feeRate: 2.0,
      socials: {
        twitter: '@defistrategies',
        discord: 'defi-guild'
      },
      performance: {
        monthlyReturns: 18.2,
        riskScore: 3.1,
        consistency: 88.7
      }
    }
  ];

  // Treasury data
  const treasuryData = {
    totalValue: 45670000,
    tokenBreakdown: {
      'ETH': 2450.67,
      'USDC': 12500000,
      'OPBID': 28900000,
      'WBTC': 125.45,
      'CRV': 156789.45
    },
    allocation: {
      development: 35,
      marketing: 20,
      operations: 15,
      reserves: 20,
      grants: 10
    },
    monthlyFlow: {
      income: 890000,
      expenses: 567000,
      netFlow: 323000
    }
  };

  const governanceMetrics = {
    totalProposals: 234,
    activeProposals: 8,
    passedProposals: 189,
    failedProposals: 37,
    voterTurnout: 65.7,
    proposalSuccessRate: 83.6,
    averageVotingTime: 3.2,
    totalVotingPower: 124567890,
    activeDelegates: 89
  };

  const votingHistory = [
    {
      proposalId: 'prop-2024-089',
      vote: 'for',
      votingPower: 50000,
      timestamp: '2025-11-18T14:30:00Z',
      reason: 'Strong alignment with yield optimization goals'
    },
    {
      proposalId: 'prop-2024-088',
      vote: 'for',
      votingPower: 50000,
      timestamp: '2025-11-16T10:15:00Z',
      reason: 'Important for sustainability initiatives'
    },
    {
      proposalId: 'prop-2024-087',
      vote: 'against',
      votingPower: 50000,
      timestamp: '2025-11-11T16:45:00Z',
      reason: 'Security concerns with multi-chain bridges'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'investment': return 'bg-purple-100 text-purple-800';
      case 'sustainability': return 'bg-green-100 text-green-800';
      case 'infrastructure': return 'bg-blue-100 text-blue-800';
      case 'technical': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleVote = async (proposalId: string, support: string, reason?: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Voting ${support} on proposal ${proposalId}`, { reason });
      // Update local state
    } finally {
      setLoading(false);
    }
  };

  const handleDelegate = async (delegateAddress: string, amount: number) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Delegating ${amount} tokens to ${delegateAddress}`);
      // Update local state
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'proposals', name: 'Proposals', icon: DocumentTextIcon },
    { id: 'delegates', name: 'Delegates', icon: UserGroupIcon },
    { id: 'treasury', name: 'Treasury', icon: CurrencyDollarIcon },
    { id: 'voting-history', name: 'Voting History', icon: ChartBarIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">DAO Governance</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Participate in decentralized governance, delegate voting power, and manage treasury
                </p>
              </div>
              <div className="flex space-x-4">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="text-sm text-gray-600">Your Voting Power</div>
                  <div className="text-lg font-semibold text-gray-900">{votingPower.toLocaleString()} OPBID</div>
                </div>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                  Create Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'proposals' && (
          <div className="space-y-8">
            {/* Governance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DocumentTextIcon className="h-8 w-8 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Active Proposals
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {governanceMetrics.activeProposals}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-8 w-8 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Success Rate
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {governanceMetrics.proposalSuccessRate}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserGroupIcon className="h-8 w-8 text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Voter Turnout
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {governanceMetrics.voterTurnout}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShieldCheckIcon className="h-8 w-8 text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Active Delegates
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {governanceMetrics.activeDelegates}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Proposals List */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Proposals</h3>
                <div className="space-y-6">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">{proposal.title}</h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                              {proposal.status}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(proposal.category)}`}>
                              {proposal.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{proposal.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time Remaining</div>
                              <div className="mt-1 flex items-center text-sm text-gray-900">
                                <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                                {proposal.status === 'active' ? 
                                  `${Math.ceil((new Date(proposal.endTime).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days` :
                                  'Ended'
                                }
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Budget</div>
                              <div className="mt-1 text-sm text-gray-900">
                                ${(proposal.budget / 1000000).toFixed(1)}M
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Proposer</div>
                              <div className="mt-1 text-sm text-gray-900">
                                {formatAddress(proposal.proposer)}
                              </div>
                            </div>
                          </div>

                          {/* Voting Results */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                              <span>Voting Results</span>
                              <span>Total: {proposal.votes.total.toLocaleString()} votes</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="flex h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-green-500" 
                                  style={{ width: `${proposal.percentages.for}%` }}
                                ></div>
                                <div 
                                  className="bg-red-500" 
                                  style={{ width: `${proposal.percentages.against}%` }}
                                ></div>
                                <div 
                                  className="bg-gray-400" 
                                  style={{ width: `${proposal.percentages.abstain}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>For: {proposal.percentages.for}%</span>
                              <span>Against: {proposal.percentages.against}%</span>
                              <span>Abstain: {proposal.percentages.abstain}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-6 flex-shrink-0">
                          {proposal.status === 'active' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleVote(proposal.id, 'for')}
                                disabled={loading}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                              >
                                Vote For
                              </button>
                              <button
                                onClick={() => handleVote(proposal.id, 'against')}
                                disabled={loading}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                              >
                                Vote Against
                              </button>
                              <button
                                onClick={() => handleVote(proposal.id, 'abstain')}
                                disabled={loading}
                                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
                              >
                                Abstain
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'delegates' && (
          <div className="space-y-8">
            {/* Delegate Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserGroupIcon className="h-8 w-8 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Active Delegates
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {delegates.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyDollarIcon className="h-8 w-8 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Delegated
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {(delegates.reduce((sum, d) => sum + d.votingPower, 0) / 1000000).toFixed(1)}M
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-8 w-8 text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Average Fee
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {(delegates.reduce((sum, d) => sum + d.feeRate, 0) / delegates.length).toFixed(1)}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delegates List */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Available Delegates</h3>
                <div className="space-y-6">
                  {delegates.map((delegate) => (
                    <div key={delegate.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">{delegate.name}</h4>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {delegate.specialization}
                            </span>
                            <div className="flex items-center">
                              <span className="text-sm text-gray-600 mr-1">Reputation:</span>
                              <span className="text-sm font-medium text-gray-900">{delegate.reputation}/100</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Voting Power</div>
                              <div className="mt-1 text-sm text-gray-900">
                                {(delegate.votingPower / 1000000).toFixed(1)}M OPBID
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Success Rate</div>
                              <div className="mt-1 text-sm text-gray-900">
                                {delegate.successRate}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Delegators</div>
                              <div className="mt-1 text-sm text-gray-900">
                                {delegate.delegates.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fee Rate</div>
                              <div className="mt-1 text-sm text-gray-900">
                                {delegate.feeRate}%
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Performance Metrics</div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Monthly Returns:</span>
                                <span className="ml-1 font-medium text-green-600">+{delegate.performance.monthlyReturns}%</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Risk Score:</span>
                                <span className="ml-1 font-medium text-gray-900">{delegate.performance.riskScore}/10</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Consistency:</span>
                                <span className="ml-1 font-medium text-gray-900">{delegate.performance.consistency}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Address: {formatAddress(delegate.address)}</span>
                            <span>•</span>
                            <span>Proposals Voted: {delegate.proposalsVoted}</span>
                          </div>
                        </div>
                        
                        <div className="ml-6 flex-shrink-0">
                          <button
                            onClick={() => handleDelegate(delegate.address, 10000)}
                            disabled={loading}
                            className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
                          >
                            Delegate Tokens
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'treasury' && (
          <div className="space-y-8">
            {/* Treasury Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyDollarIcon className="h-8 w-8 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Treasury Value
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          ${(treasuryData.totalValue / 1000000).toFixed(1)}M
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-sm">
                    <span className="text-green-600 font-medium">+2.34%</span>
                    <span className="text-gray-500 ml-2">24h</span>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ArrowTrendingUpIcon className="h-8 w-8 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Monthly Net Flow
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          ${(treasuryData.monthlyFlow.netFlow / 1000).toFixed(0)}K
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-sm">
                    <span className="text-green-600 font-medium">Income: ${(treasuryData.monthlyFlow.income / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-8 w-8 text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          OPBID Holdings
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {(treasuryData.tokenBreakdown.OPBID / 1000000).toFixed(1)}M
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-sm">
                    <span className="text-gray-600">63.3% of treasury</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Treasury Allocation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Asset Allocation</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'OPBID', value: treasuryData.tokenBreakdown.OPBID },
                        { name: 'USDC', value: treasuryData.tokenBreakdown.USDC },
                        { name: 'WBTC', value: treasuryData.tokenBreakdown.WBTC * 36500 },
                        { name: 'CRV', value: treasuryData.tokenBreakdown.CRV * 0.3 },
                        { name: 'ETH', value: treasuryData.tokenBreakdown.ETH * 25000 }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${((value / treasuryData.totalValue) * 100).toFixed(1)}%`}
                    >
                      <Cell fill="#8b5cf6" />
                      <Cell fill="#10b981" />
                      <Cell fill="#3b82f6" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${(value / 1000000).toFixed(1)}M`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Fund Allocation</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Development', value: treasuryData.allocation.development },
                    { name: 'Marketing', value: treasuryData.allocation.marketing },
                    { name: 'Operations', value: treasuryData.allocation.operations },
                    { name: 'Reserves', value: treasuryData.allocation.reserves },
                    { name: 'Grants', value: treasuryData.allocation.grants }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="value" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'voting-history' && (
          <div className="space-y-8">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Voting History</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Proposal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vote
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Voting Power
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {votingHistory.map((vote, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {vote.proposalId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              vote.vote === 'for' ? 'bg-green-100 text-green-800' :
                              vote.vote === 'against' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {vote.vote}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {vote.votingPower.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(vote.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {vote.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernanceVoting;