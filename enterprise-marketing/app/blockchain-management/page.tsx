'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BlockchainDashboard from '@/components/blockchain/BlockchainDashboard';
import SmartContractManager from '@/components/blockchain/SmartContractManager';
import DecentralizedTrading from '@/components/blockchain/DecentralizedTrading';
import EnergyTokenWallet from '@/components/blockchain/EnergyTokenWallet';
import { 
  CubeIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  WalletIcon,
  CogIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

// Create a client
const queryClient = new QueryClient();

type TabType = 'dashboard' | 'contracts' | 'trading' | 'wallet' | 'automation';

const BlockchainManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    {
      id: 'dashboard' as TabType,
      name: 'Blockchain Dashboard',
      icon: ChartBarIcon,
      description: 'Real-time blockchain monitoring and analytics'
    },
    {
      id: 'contracts' as TabType,
      name: 'Smart Contracts',
      icon: CubeIcon,
      description: 'Deploy and manage smart contracts'
    },
    {
      id: 'trading' as TabType,
      name: 'Decentralized Trading',
      icon: CurrencyDollarIcon,
      description: 'Trade energy tokens on blockchain'
    },
    {
      id: 'wallet' as TabType,
      name: 'Energy Token Wallet',
      icon: WalletIcon,
      description: 'Manage your energy token portfolio'
    },
    {
      id: 'automation' as TabType,
      name: 'Settlement Automation',
      icon: CogIcon,
      description: 'Automated settlement and dispute resolution'
    }
  ];

  const TabButton: React.FC<{
    tab: typeof tabs[0];
    isActive: boolean;
    onClick: () => void;
  }> = ({ tab, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <tab.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
      <div>
        <p className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
          {tab.name}
        </p>
        <p className={`text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
          {tab.description}
        </p>
      </div>
    </button>
  );

  const StatCard: React.FC<{
    title: string;
    value: string;
    change?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">
              <ArrowPathIcon className="w-4 h-4 inline mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Blockchain Management</h1>
                <p className="text-gray-600 mt-2">
                  Comprehensive blockchain and smart contract management for OptiBid Energy
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">All Systems Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Active Smart Contracts"
              value="17"
              change="+2 new"
              icon={CubeIcon}
              color="bg-blue-500"
            />
            <StatCard
              title="Daily Transactions"
              value="2,847"
              change="+15.2%"
              icon={ArrowPathIcon}
              color="bg-green-500"
            />
            <StatCard
              title="Network Security"
              value="99.8%"
              change="Verified"
              icon={ShieldCheckIcon}
              color="bg-purple-500"
            />
            <StatCard
              title="Energy Traded"
              value="145.2 MWh"
              change="+$12,450"
              icon={BoltIcon}
              color="bg-orange-500"
            />
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Management Tools</h2>
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <TabButton
                      key={tab.id}
                      tab={tab}
                      isActive={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                    />
                  ))}
                </nav>

                {/* Quick Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                      Deploy New Contract
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                      Create Trade Order
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                      Setup Automation
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                      View Analytics
                    </button>
                  </div>
                </div>

                {/* Network Status */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Network Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ethereum</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">15.2 TPS</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Polygon</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">124.7 TPS</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Arbitrum</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">87.3 TPS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'dashboard' && <BlockchainDashboard />}
                  {activeTab === 'contracts' && <SmartContractManager />}
                  {activeTab === 'trading' && <DecentralizedTrading />}
                  {activeTab === 'wallet' && <EnergyTokenWallet />}
                  {activeTab === 'automation' && (
                    <div className="space-y-6">
                      <div className="text-center py-12">
                        <CogIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Settlement Automation
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Advanced automated settlement and dispute resolution system coming soon.
                        </p>
                        <div className="bg-blue-50 rounded-lg p-4 max-w-2xl mx-auto">
                          <h4 className="font-medium text-blue-900 mb-2">Planned Features:</h4>
                          <ul className="text-sm text-blue-800 space-y-1 text-left">
                            <li>• Automated escrow and release mechanisms</li>
                            <li>• AI-powered dispute resolution</li>
                            <li>• Multi-party settlement orchestration</li>
                            <li>• Real-time settlement monitoring</li>
                            <li>• Customizable settlement rules and workflows</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>OptiBid Energy Platform v2.1.0</span>
                <span>•</span>
                <span>Blockchain Management Module</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>Last Updated: {new Date().toLocaleDateString()}</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default BlockchainManagementPage;