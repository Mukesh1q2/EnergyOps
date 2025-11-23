'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  HomeIcon,
  ChartBarIcon,
  BoltIcon,
  CurrencyRupeeIcon,
  MapIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  CalculatorIcon,
  LightBulbIcon,
  TrashIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const navigationItems = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: HomeIcon,
    description: 'Main dashboard and KPIs'
  },
  {
    name: 'Market Data',
    href: '/market',
    icon: ChartBarIcon,
    description: 'Real-time market prices and trends',
    submenu: [
      { name: 'Price Monitoring', href: '/market/prices' },
      { name: 'Market Analysis', href: '/market/analysis' },
      { name: 'Weather Data', href: '/market/weather' },
      { name: 'Load Forecasting', href: '/market/forecasting' }
    ]
  },
  {
    name: 'Assets',
    href: '/assets',
    icon: BoltIcon,
    description: 'Manage your energy assets',
    submenu: [
      { name: 'Solar Farms', href: '/assets/solar' },
      { name: 'Wind Farms', href: '/assets/wind' },
      { name: 'Storage Systems', href: '/assets/storage' },
      { name: 'Hydro Plants', href: '/assets/hydro' },
      { name: 'Asset Monitoring', href: '/assets/monitoring' }
    ]
  },
  {
    name: 'Bidding',
    href: '/bidding',
    icon: CurrencyRupeeIcon,
    description: 'Submit and manage bids',
    submenu: [
      { name: 'Create Bids', href: '/bidding/create' },
      { name: 'Active Bids', href: '/bidding/active' },
      { name: 'Bid History', href: '/bidding/history' },
      { name: 'Bid Templates', href: '/bidding/templates' }
    ]
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: DocumentChartBarIcon,
    description: 'Performance insights and reports',
    submenu: [
      { name: 'Performance KPIs', href: '/analytics/performance' },
      { name: 'Revenue Analysis', href: '/analytics/revenue' },
      { name: 'Risk Analysis', href: '/analytics/risk' },
      { name: 'Benchmarking', href: '/analytics/benchmarking' }
    ]
  },
  {
    name: 'Geographic',
    href: '/geographic',
    icon: MapIcon,
    description: 'Location-based views',
    submenu: [
      { name: 'Asset Map', href: '/geographic/assets' },
      { name: 'Market Coverage', href: '/geographic/coverage' },
      { name: 'Transmission Lines', href: '/geographic/transmission' }
    ]
  },
  {
    name: 'Optimization',
    href: '/optimization',
    icon: LightBulbIcon,
    description: 'AI-powered optimization',
    submenu: [
      { name: 'Bid Optimization', href: '/optimization/bids' },
      { name: 'Portfolio Optimization', href: '/optimization/portfolio' },
      { name: 'Market Opportunities', href: '/optimization/opportunities' }
    ]
  },
  {
    name: 'Alerts',
    href: '/alerts',
    icon: ExclamationTriangleIcon,
    description: 'System notifications and alerts'
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: ClipboardDocumentListIcon,
    description: 'Generate and view reports',
    submenu: [
      { name: 'Daily Reports', href: '/reports/daily' },
      { name: 'Monthly Reports', href: '/reports/monthly' },
      { name: 'Custom Reports', href: '/reports/custom' }
    ]
  }
]

const adminItems = [
  {
    name: 'User Management',
    href: '/admin/users',
    icon: UserGroupIcon,
    description: 'Manage users and permissions'
  },
  {
    name: 'System Config',
    href: '/admin/config',
    icon: Cog6ToothIcon,
    description: 'System configuration settings'
  },
  {
    name: 'Backup & Restore',
    href: '/admin/backup',
    icon: ArrowPathIcon,
    description: 'Data backup and recovery'
  },
  {
    name: 'Data Cleanup',
    href: '/admin/cleanup',
    icon: TrashIcon,
    description: 'Archive and cleanup old data'
  }
]

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()
  const router = useRouter()

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    )
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const isExpanded = (name: string) => {
    return expandedItems.includes(name)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out border-r border-gray-200 dark:border-gray-700',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        'lg:relative lg:translate-x-0'
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="OptiBid Energy"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">
              OptiBid
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4 space-y-1 overflow-y-auto">
          {/* Main Navigation */}
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <div key={item.name}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={clsx(
                        'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                        isActive(item.href)
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </div>
                      <ChevronRightIcon 
                        className={clsx(
                          'h-4 w-4 transition-transform duration-200',
                          isExpanded(item.name) ? 'rotate-90' : ''
                        )} 
                      />
                    </button>
                    {isExpanded(item.name) && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={clsx(
                              'block px-3 py-2 text-sm rounded-md transition-colors duration-200',
                              pathname === subItem.href
                                ? 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-300'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
                            )}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={clsx(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

          {/* Admin Section */}
          <div className="space-y-1">
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Administration
            </h3>
            {adminItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                  isActive(item.href)
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                <UserGroupIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                System Status
              </p>
              <div className="flex items-center mt-1">
                <div className="h-2 w-2 bg-secondary-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  All systems operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}