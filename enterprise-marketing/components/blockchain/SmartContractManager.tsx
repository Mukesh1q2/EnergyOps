'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CubeIcon, 
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface SmartContractInfo {
  id: string;
  name: string;
  network: string;
  address: string;
  version: string;
  status: 'active' | 'paused' | 'upgrading';
  deployments: number;
  gasUsage: string;
  lastActivity: string;
  security: 'verified' | 'audit_pending' | 'audit_failed';
  performance: {
    tps: number;
    avgGas: string;
    successRate: number;
  };
  features: string[];
  auditInfo?: {
    auditor: string;
    date: string;
    score: number;
    reportUrl: string;
  };
}

const SmartContractManager: React.FC = () => {
  const [selectedNetwork, setSelectedNetwork] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [contractAction, setContractAction] = useState<{
    contractId: string;
    action: 'pause' | 'resume' | 'upgrade' | 'delete';
  } | null>(null);

  const queryClient = useQueryClient();

  // Fetch smart contracts
  const { data: contractsData, isLoading, refetch } = useQuery({
    queryKey: ['smart-contracts', selectedNetwork, selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(selectedNetwork !== 'all' && { network: selectedNetwork }),
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      });
      const response = await fetch(`/api/blockchain/smart-contracts?${params}`);
      const result = await response.json();
      return result.success ? result.data : [];
    },
  });

  // Contract action mutation
  const contractMutation = useMutation({
    mutationFn: async ({ contractId, action, contractData }: any) => {
      const response = await fetch('/api/blockchain/smart-contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, contractData: { ...contractData, contractId } })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-contracts'] });
      setContractAction(null);
    }
  });

  // Deploy contract mutation
  const deployMutation = useMutation({
    mutationFn: async (contractData: any) => {
      const response = await fetch('/api/blockchain/smart-contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'deploy',
          contractData 
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-contracts'] });
      setShowDeployModal(false);
    }
  });

  const handleContractAction = (contractId: string, action: 'pause' | 'resume' | 'upgrade' | 'delete') => {
    contractMutation.mutate({ contractId, action });
  };

  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      upgrading: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const SecurityBadge: React.FC<{ security: string }> = ({ security }) => {
    const styles = {
      verified: 'bg-green-100 text-green-800',
      audit_pending: 'bg-yellow-100 text-yellow-800',
      audit_failed: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[security as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {security.replace('_', ' ')}
      </span>
    );
  };

  const ContractCard: React.FC<{ contract: SmartContractInfo }> = ({ contract }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{contract.name}</h3>
          <p className="text-sm text-gray-600 mb-2">
            {contract.network} • v{contract.version}
          </p>
          <div className="flex items-center space-x-2 mb-3">
            <StatusBadge status={contract.status} />
            <SecurityBadge security={contract.security} />
          </div>
        </div>
        <div className="flex space-x-2">
          {contract.status === 'active' && (
            <button
              onClick={() => setContractAction({ contractId: contract.id, action: 'pause' })}
              className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
              title="Pause Contract"
            >
              <PauseIcon className="w-5 h-5" />
            </button>
          )}
          {contract.status === 'paused' && (
            <button
              onClick={() => setContractAction({ contractId: contract.id, action: 'resume' })}
              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
              title="Resume Contract"
            >
              <PlayIcon className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setContractAction({ contractId: contract.id, action: 'upgrade' })}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Upgrade Contract"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Contract Address</p>
          <p className="text-sm font-mono text-gray-900">{contract.address.slice(0, 10)}...{contract.address.slice(-8)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Deployments</p>
          <p className="text-sm font-semibold text-gray-900">{contract.deployments}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">TPS</p>
          <p className="text-sm font-semibold text-gray-900">{contract.performance.tps.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Success Rate</p>
          <p className="text-sm font-semibold text-gray-900">{contract.performance.successRate}%</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Key Features</p>
        <div className="flex flex-wrap gap-1">
          {contract.features.slice(0, 3).map((feature, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {feature}
            </span>
          ))}
          {contract.features.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              +{contract.features.length - 3} more
            </span>
          )}
        </div>
      </div>

      {contract.auditInfo && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DocumentCheckIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Security Audit</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-700">{contract.auditInfo.auditor}</span>
              <span className="text-sm font-semibold text-blue-900">{contract.auditInfo.score}%</span>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Audit completed: {new Date(contract.auditInfo.date).toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Last activity: {new Date(contract.lastActivity).toLocaleString()}</span>
        <span>Gas used: {contract.gasUsage}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Smart Contract Management</h2>
          <p className="text-gray-600">Deploy, monitor, and manage smart contracts across networks</p>
        </div>
        <button
          onClick={() => setShowDeployModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Deploy Contract
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <select 
          value={selectedNetwork}
          onChange={(e) => setSelectedNetwork(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Networks</option>
          <option value="ethereum">Ethereum</option>
          <option value="polygon">Polygon</option>
          <option value="arbitrum">Arbitrum</option>
        </select>
        <select 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="upgrading">Upgrading</option>
        </select>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4 inline mr-2" />
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({length: 6}).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      )}

      {/* Contract Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contractsData?.map((contract: SmartContractInfo) => (
          <ContractCard key={contract.id} contract={contract} />
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && (!contractsData || contractsData.length === 0) && (
        <div className="text-center py-12">
          <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No smart contracts found</h3>
          <p className="text-gray-600 mb-4">
            {selectedNetwork === 'all' && selectedStatus === 'all' 
              ? 'Get started by deploying your first smart contract'
              : 'Try adjusting your filters to see more results'
            }
          </p>
          {selectedNetwork === 'all' && selectedStatus === 'all' && (
            <button
              onClick={() => setShowDeployModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Deploy Contract
            </button>
          )}
        </div>
      )}

      {/* Deploy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deploy New Smart Contract</h3>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                deployMutation.mutate({
                  name: formData.get('name'),
                  network: formData.get('network'),
                  contractType: formData.get('contractType'),
                  compilerVersion: formData.get('compilerVersion'),
                  optimization: formData.get('optimization') === 'on'
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contract Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Energy Trading Contract"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
                <select
                  name="network"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Network</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="polygon">Polygon</option>
                  <option value="arbitrum">Arbitrum</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
                <select
                  name="contractType"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Type</option>
                  <option value="energy_trading">Energy Trading</option>
                  <option value="token_contract">Token Contract</option>
                  <option value="settlement">Settlement</option>
                  <option value="marketplace">Marketplace</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compiler Version</label>
                <select
                  name="compilerVersion"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="0.8.19">0.8.19</option>
                  <option value="0.8.20">0.8.20</option>
                  <option value="0.8.21">0.8.21</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  id="optimization"
                  name="optimization"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="optimization" className="ml-2 block text-sm text-gray-700">
                  Enable gas optimization
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeployModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deployMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {deployMutation.isPending ? 'Deploying...' : 'Deploy Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {contractAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {contractAction.action === 'pause' && 'Pause Contract'}
              {contractAction.action === 'resume' && 'Resume Contract'}
              {contractAction.action === 'upgrade' && 'Upgrade Contract'}
              {contractAction.action === 'delete' && 'Delete Contract'}
            </h3>
            <p className="text-gray-600 mb-6">
              {contractAction.action === 'pause' && 'Are you sure you want to pause this contract? It will stop processing transactions.'}
              {contractAction.action === 'resume' && 'Are you sure you want to resume this contract?'}
              {contractAction.action === 'upgrade' && 'Are you sure you want to upgrade this contract? This will deploy a new version.'}
              {contractAction.action === 'delete' && 'Are you sure you want to delete this contract? This action cannot be undone.'}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setContractAction(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleContractAction(contractAction.contractId, contractAction.action)}
                disabled={contractMutation.isPending}
                className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  contractAction.action === 'delete' 
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : contractAction.action === 'pause'
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {contractMutation.isPending ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartContractManager;