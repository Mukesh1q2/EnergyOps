/**
 * Enhanced Dashboard Page
 * Phase 3: Enhanced Dashboard & Enterprise Features
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Settings, 
  Share2, 
  Download, 
  Upload,
  Layout,
  Users,
  Activity,
  Zap,
  Brain,
  Globe,
  Clock,
  BarChart3,
  Network,
  Map,
  Filter,
  FileText,
  Shield,
  Palette,
  Building2,
  UserCog
} from 'lucide-react';

import { DashboardCanvas } from '../components/dashboard/DashboardCanvas';
import { FileUpload } from '../components/file-upload/FileUpload';
import { CollaborationPanel } from '../components/dashboard/CollaborationPanel';
import { LayoutTemplate } from '../components/dashboard/LayoutTemplate';
import { ThemeProvider, useTheme, ThemeSwitcher } from '../components/theme/ThemeContext';
import { AdminPanel } from '../components/admin/AdminPanel';

// Theme Manager Page Component
const ThemeManagerPage: React.FC = () => {
  const { currentTheme, availableThemes, themeMode, setThemeMode } = useTheme();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Advanced Theme System
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage visual themes with multiple color modes, custom CSS variables, 
          and comprehensive theme switching capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Theme Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Current Theme
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active Theme
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentTheme?.name || 'Default'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mode
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {themeMode}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Type
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentTheme?.type || 'system'}
              </span>
            </div>
          </div>

          {/* Theme Preview */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Theme Preview
            </h4>
            <div className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600">
              <div className="space-y-3">
                {/* Sample UI elements */}
                <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded"></div>
                <div className="h-6 bg-blue-500 rounded w-3/4"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-green-500 rounded w-1/4"></div>
                  <div className="h-6 bg-yellow-500 rounded w-1/4"></div>
                  <div className="h-6 bg-red-500 rounded w-1/4"></div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Sample text with {currentTheme?.colors?.['text-primary'] || '#000000'} color
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Switcher */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Theme Switcher
          </h3>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose from available theme modes:
            </p>
            
            {/* Advanced Theme Switcher */}
            <div className="flex justify-center">
              <ThemeSwitcher 
                variant="dropdown" 
                showLabels={true} 
                showDescriptions={true}
                size="lg"
              />
            </div>
            
            {/* Quick Switcher */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Quick switch:
              </p>
              <ThemeSwitcher 
                variant="inline" 
                size="md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Available Themes Grid */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Available Themes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableThemes.map((theme) => (
            <div
              key={theme.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                theme.id === currentTheme?.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setThemeMode(theme.mode)}
            >
              <div className="mb-3">
                <div className="h-16 rounded border border-gray-200 dark:border-gray-600 overflow-hidden">
                  {/* Theme preview */}
                  <div className="h-full flex">
                    <div 
                      className="flex-1"
                      style={{ backgroundColor: theme.colors.background }}
                    ></div>
                    <div 
                      className="w-8"
                      style={{ backgroundColor: theme.colors.primary }}
                    ></div>
                    <div 
                      className="w-8"
                      style={{ backgroundColor: theme.colors.secondary }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">
                {theme.name}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {theme.description}
              </p>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  theme.mode === 'light'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : theme.mode === 'dark'
                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    : theme.mode === 'auto'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                }`}>
                  {theme.mode}
                </span>
                
                {theme.id === currentTheme?.id && (
                  <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                    Active
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Theme Features */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Theme System Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                Multi-Mode
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Light, Dark, Auto, Blue
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                CSS Variables
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Dynamic theming
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                Smart Auto
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                System detection
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                Instant Switch
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Real-time preview
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
import KnowledgeGraphPage from './KnowledgeGraphPage';
import { useDashboard } from '../hooks/useDashboard';
import { useCollaboration } from '../hooks/useCollaboration';
import { useUser } from '../hooks/useUser';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { WidgetLibrary } from '../components/widgets/WidgetLibrary';
import { DataProcessingPanel } from '../components/data-processing/DataProcessingPanel';
import { 
  Dashboard as DashboardType,
  User as UserType 
} from '../types/dashboard';

interface DashboardPageProps {
  dashboardId?: string;
  isCreating?: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  dashboardId,
  isCreating = false
}) => {
  return (
    <ThemeProvider>
      <DashboardPageContent 
        dashboardId={dashboardId}
        isCreating={isCreating}
      />
    </ThemeProvider>
  );
};

const DashboardPageContent: React.FC<DashboardPageProps> = ({
  dashboardId,
  isCreating = false
}) => {
  const [activeDashboard, setActiveDashboard] = useState<DashboardType | null>(null);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showLayoutTemplate, setShowLayoutTemplate] = useState(false);
  const [showDataProcessing, setShowDataProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'upload' | 'processing' | 'knowledge-graph' | 'admin' | 'theme'>('dashboard');

  // Hooks
  const { user } = useUser();
  const { 
    dashboards,
    currentDashboard,
    loading,
    error,
    createDashboard,
    updateDashboard,
    deleteDashboard
  } = useDashboard();

  const {
    sessions,
    activeSession,
    presence,
    liveCursors,
    isCollaborating
  } = useCollaboration(null, user?.id);

  // Load dashboard or create new one
  useEffect(() => {
    if (isCreating || !dashboardId) {
      // Create new dashboard
      handleCreateNewDashboard();
    } else if (dashboardId) {
      // Load existing dashboard
      // This would typically be handled by the useDashboard hook
    }
  }, [dashboardId, isCreating]);

  const handleCreateNewDashboard = async () => {
    try {
      const newDashboard = await createDashboard({
        name: 'New Dashboard',
        description: 'Enhanced dashboard with enterprise features',
        theme: 'default',
        refresh_interval: 300,
        allow_collaboration: true,
        allow_comments: true
      });

      setActiveDashboard(newDashboard);
    } catch (error) {
      console.error('Failed to create dashboard:', error);
    }
  };

  const handleAddWidget = async (widgetType: string, template?: any) => {
    if (!activeDashboard) return;

    try {
      // This would typically call an API to add the widget
      console.log('Adding widget:', widgetType, template);
    } catch (error) {
      console.error('Failed to add widget:', error);
    }
  };

  const handleFileUploaded = async (file: any) => {
    console.log('File uploaded:', file);
    // Process file and potentially create widgets from it
    setShowFileUpload(false);
    setViewMode('processing');
  };

  const handleStartCollaboration = async () => {
    if (!activeDashboard) return;

    try {
      // Start collaboration session
      console.log('Starting collaboration for dashboard:', activeDashboard.id);
      setShowCollaboration(true);
    } catch (error) {
      console.error('Failed to start collaboration:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-red-600">
            <p className="font-semibold">Failed to load dashboard</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!activeDashboard && !isCreating) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Layout className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Dashboard Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The dashboard you're looking for doesn't exist or you don't have access to it.
            </p>
            <button
              onClick={handleCreateNewDashboard}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="enhanced-dashboard-page h-full flex flex-col">
        {/* Feature Showcase Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Phase 5: Theme System & Admin Controls
                </h1>
                <p className="text-blue-100">
                  Advanced theme system with multiple color modes, comprehensive admin panel, 
                  organization management, and enterprise-grade controls
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Feature Status Indicators */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Real-time</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Palette className="w-4 h-4 text-pink-400" />
                    <span className="text-sm">Multi-Theme</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm">Enterprise Admin</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Brain className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">AI-Powered</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Network className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">Knowledge Graphs</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Collaborative</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Feature Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Dashboard
              </button>
              
              <button
                onClick={() => setViewMode('upload')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'upload' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                File Upload
              </button>
              
              <button
                onClick={() => setViewMode('processing')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'processing' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Zap className="w-4 h-4 inline mr-2" />
                Data Processing
              </button>
              
              <button
                onClick={() => setViewMode('knowledge-graph')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'knowledge-graph' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Network className="w-4 h-4 inline mr-2" />
                Knowledge Graph
              </button>
              
              <button
                onClick={() => setViewMode('theme')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'theme' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Palette className="w-4 h-4 inline mr-2" />
                Theme
              </button>
              
              <button
                onClick={() => setViewMode('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'admin' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Admin
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {/* Theme Switcher */}
              <ThemeSwitcher variant="compact" className="mr-2" />

              {/* Quick Actions */}
              <button
                onClick={() => setShowWidgetLibrary(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Add widgets"
              >
                <Plus className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowFileUpload(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Upload files"
              >
                <Upload className="w-5 h-5" />
              </button>

              <button
                onClick={handleStartCollaboration}
                className={`p-2 rounded-lg transition-colors ${
                  isCollaborating 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Collaboration"
              >
                <Users className="w-5 h-5" />
                {presence.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {presence.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowLayoutTemplate(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Layout templates"
              >
                <Layout className="w-5 h-5" />
              </button>

              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>

              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>

              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {viewMode === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {activeDashboard && user ? (
                  <DashboardCanvas
                    dashboardId={activeDashboard.id}
                    user={user}
                    isEditable={true}
                    onDashboardUpdate={(updates) => {
                      if (activeDashboard) {
                        setActiveDashboard({ ...activeDashboard, ...updates });
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Layout className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Create Your First Dashboard
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Start building your enhanced dashboard with enterprise features
                      </p>
                      <button
                        onClick={handleCreateNewDashboard}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {viewMode === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="h-full p-6 overflow-auto"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Multi-Format File Upload & Processing
                    </h2>
                    <p className="text-gray-600">
                      Upload CSV, Excel, JSON, PDF and other formats. Our ML-powered system will 
                      automatically detect schemas, validate data, and suggest optimal visualizations.
                    </p>
                  </div>

                  <FileUpload
                    onFileUploaded={handleFileUploaded}
                    autoProcess={true}
                    organizationId={user?.organization_id}
                  />

                  {/* Supported Formats Showcase */}
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <BarChart3 className="mx-auto h-8 w-8 text-green-600 mb-2" />
                      <h4 className="font-medium text-green-900">CSV/Excel</h4>
                      <p className="text-xs text-green-700 mt-1">Auto schema detection</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <Network className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                      <h4 className="font-medium text-blue-900">JSON/XML</h4>
                      <p className="text-xs text-blue-700 mt-1">Structure analysis</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <FileText className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                      <h4 className="font-medium text-purple-900">PDF/Images</h4>
                      <p className="text-xs text-purple-700 mt-1">OCR processing</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <Brain className="mx-auto h-8 w-8 text-orange-600 mb-2" />
                      <h4 className="font-medium text-orange-900">ML Mapping</h4>
                      <p className="text-xs text-orange-700 mt-1">Smart suggestions</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {viewMode === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <DataProcessingPanel />
              </motion.div>
            )}

            {viewMode === 'knowledge-graph' && (
              <motion.div
                key="knowledge-graph"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <KnowledgeGraphPage />
              </motion.div>
            )}

            {viewMode === 'theme' && (
              <motion.div
                key="theme"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="h-full p-6 overflow-auto"
              >
                <ThemeManagerPage />
              </motion.div>
            )}

            {viewMode === 'admin' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <AnalyticsPage />
              </motion.div>
            )}

            {viewMode === 'admin' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <AdminPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modals and Panels */}
        <AnimatePresence>
          {showWidgetLibrary && (
            <WidgetLibrary
              onClose={() => setShowWidgetLibrary(false)}
              onAddWidget={handleAddWidget}
              dashboardId={activeDashboard?.id}
            />
          )}

          {showFileUpload && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowFileUpload(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <FileUpload
                  onFileUploaded={handleFileUploaded}
                  autoProcess={true}
                  organizationId={user?.organization_id}
                />
              </motion.div>
            </motion.div>
          )}

          {showCollaboration && activeDashboard && (
            <CollaborationPanel
              dashboardId={activeDashboard.id}
              user={user!}
              onClose={() => setShowCollaboration(false)}
            />
          )}

          {showLayoutTemplate && (
            <LayoutTemplate
              onClose={() => setShowLayoutTemplate(false)}
              onApplyTemplate={(template) => {
                console.log('Applying template:', template);
                setShowLayoutTemplate(false);
              }}
            />
          )}
        </AnimatePresence>

        {/* Feature Highlights */}
        {viewMode === 'dashboard' && activeDashboard && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white bg-opacity-95 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">Real-time updates</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Palette className="w-4 h-4 text-pink-500" />
                    <span className="text-gray-700">Multi-theme system</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-cyan-500" />
                    <span className="text-gray-700">Enterprise admin</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-700">{presence.length} collaborators</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-700">ML-powered insights</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-700">Enterprise ready</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;