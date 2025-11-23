import React from 'react';
import DeFiDashboard from '@/components/defi/DeFiDashboard';
import GovernanceVoting from '@/components/defi/GovernanceVoting';
import CrossChainBridge from '@/components/defi/CrossChainBridge';
import DerivativesTrading from '@/components/defi/DerivativesTrading';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon,
  ArrowsRightLeftIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

interface DeFiManagementProps {
  activeSection?: string;
}

const DeFiManagement: React.FC<DeFiManagementProps> = ({ activeSection = 'dashboard' }) => {
  // This component can be used to render specific sections or the full dashboard
  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DeFiDashboard />;
      case 'governance':
        return <GovernanceVoting />;
      case 'bridges':
        return <CrossChainBridge />;
      case 'derivatives':
        return <DerivativesTrading />;
      default:
        return <DeFiDashboard />;
    }
  };

  if (activeSection !== 'dashboard') {
    return renderSection();
  }

  // For the main dashboard, show navigation to all sections
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
                Advanced DeFi & Governance
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Comprehensive decentralized finance platform with governance, cross-chain bridges, derivatives trading, and risk management
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <a
                    href="#get-started"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                  >
                    Get Started
                  </a>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <a
                    href="#learn-more"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Platform Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for DeFi
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              From basic lending to advanced derivatives, our platform provides all the tools you need for comprehensive DeFi participation.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {/* DeFi Dashboard */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <ChartBarIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">DeFi Dashboard</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Comprehensive overview of all DeFi protocols, yields, risks, and portfolio performance with real-time analytics.
                </p>
                <div className="mt-4 ml-16">
                  <a href="/defi-management?section=dashboard" className="text-indigo-600 hover:text-indigo-500 font-medium">
                    View Dashboard →
                  </a>
                </div>
              </div>

              {/* Governance Voting */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <ShieldCheckIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">DAO Governance</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Participate in decentralized governance, delegate voting power, and manage treasury allocations with transparency.
                </p>
                <div className="mt-4 ml-16">
                  <a href="/defi-management?section=governance" className="text-indigo-600 hover:text-indigo-500 font-medium">
                    View Governance →
                  </a>
                </div>
              </div>

              {/* Cross-Chain Bridge */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <ArrowsRightLeftIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Cross-Chain Bridge</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Transfer assets seamlessly across 6 blockchain networks with multi-signature security and optimistic verification.
                </p>
                <div className="mt-4 ml-16">
                  <a href="/defi-management?section=bridges" className="text-indigo-600 hover:text-indigo-500 font-medium">
                    Use Bridge →
                  </a>
                </div>
              </div>

              {/* Derivatives Trading */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <CubeIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Derivatives Trading</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Trade futures, options, swaps, and structured products with advanced risk management and real-time pricing.
                </p>
                <div className="mt-4 ml-16">
                  <a href="/defi-management?section=derivatives" className="text-indigo-600 hover:text-indigo-500 font-medium">
                    Start Trading →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Platform Statistics
            </h2>
            <p className="mt-3 text-xl text-indigo-200 sm:mt-4">
              Comprehensive metrics across all DeFi operations
            </p>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-indigo-200">
                Total Value Locked
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">
                $45.6B
              </dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-indigo-200">
                Active Users
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">
                156K+
              </dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-indigo-200">
                Governance Proposals
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">
                234
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Platform Modules
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500">
              Explore each module in detail
            </p>
          </div>

          {/* DeFi Dashboard Section */}
          <div className="mb-16">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  DeFi Dashboard - Comprehensive Analytics
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Real-time overview of all DeFi protocols, yields, risks, and portfolio performance
                </p>
              </div>
              <div className="px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">$45.6B</div>
                    <div className="text-sm text-gray-500">Total Value Locked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">156K+</div>
                    <div className="text-sm text-gray-500">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">12.5%</div>
                    <div className="text-sm text-gray-500">Average APY</div>
                  </div>
                </div>
                <div className="mt-6">
                  <a 
                    href="/defi-management?section=dashboard" 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    View Full Dashboard
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Governance Section */}
          <div className="mb-16">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  DAO Governance - Decentralized Decision Making
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Participate in governance, delegate voting power, and manage treasury allocations
                </p>
              </div>
              <div className="px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">8</div>
                    <div className="text-sm text-gray-500">Active Proposals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">89</div>
                    <div className="text-sm text-gray-500">Active Delegates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">78.5%</div>
                    <div className="text-sm text-gray-500">Voter Participation</div>
                  </div>
                </div>
                <div className="mt-6">
                  <a 
                    href="/defi-management?section=governance" 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    View Governance Portal
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bridge Section */}
          <div className="mb-16">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Cross-Chain Bridge - Multi-Network Asset Transfer
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Secure, fast asset transfers across 6 blockchain networks
                </p>
              </div>
              <div className="px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">6</div>
                    <div className="text-sm text-gray-500">Supported Networks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">123K</div>
                    <div className="text-sm text-gray-500">Total Transactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">99.2%</div>
                    <div className="text-sm text-gray-500">Success Rate</div>
                  </div>
                </div>
                <div className="mt-6">
                  <a 
                    href="/defi-management?section=bridges" 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Use Bridge Interface
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Derivatives Section */}
          <div className="mb-16">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Derivatives Trading - Advanced Financial Instruments
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Trade futures, options, swaps, and structured products with advanced risk management
                </p>
              </div>
              <div className="px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">$87.5M</div>
                    <div className="text-sm text-gray-500">Total Notional</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">2.34M</div>
                    <div className="text-sm text-gray-500">Open Interest</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">98.7%</div>
                    <div className="text-sm text-gray-500">Order Success Rate</div>
                  </div>
                </div>
                <div className="mt-6">
                  <a 
                    href="/defi-management?section=derivatives" 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Start Trading Derivatives
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-indigo-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to dive into DeFi?</span>
            <span className="block">Start your journey today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Join thousands of users already leveraging our comprehensive DeFi platform for yield optimization, governance participation, and advanced trading strategies.
          </p>
          <a
            href="#get-started"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
};

export default DeFiManagement;