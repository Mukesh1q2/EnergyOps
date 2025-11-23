// =============================================================================
// FEATURE FLAG REACT COMPONENTS
// =============================================================================
'use client';

import React from 'react';
import { useFeatureFlags, useFeatureFlag } from './FeatureFlagProvider';
import { FeatureGateProps, FeatureToggleProps, WidgetConfigProps, WidgetConfiguration } from './types';

// Feature Gate Component - Show/hide content based on feature flags
export function FeatureGate({ 
  feature, 
  organizationId, 
  fallback = null, 
  children, 
  exact = true 
}: FeatureGateProps) {
  const isEnabled = useFeatureFlag(feature, organizationId);
  
  if (!isEnabled) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Conditional Component Wrapper
export function FeatureEnabled({ 
  feature, 
  organizationId, 
  children 
}: { 
  feature: string; 
  organizationId?: string; 
  children: React.ReactNode; 
}) {
  const isEnabled = useFeatureFlag(feature, organizationId);
  
  if (!isEnabled) {
    return null;
  }
  
  return <>{children}</>;
}

// Feature Disabled Wrapper
export function FeatureDisabled({ 
  feature, 
  organizationId, 
  children 
}: { 
  feature: string; 
  organizationId?: string; 
  children: React.ReactNode; 
}) {
  const isEnabled = useFeatureFlag(feature, organizationId);
  
  if (isEnabled) {
    return null;
  }
  
  return <>{children}</>;
}

// Feature Toggle Component - Interactive toggle for enabling/disabling features
export function FeatureToggle({ 
  feature, 
  organizationId, 
  enabled: controlledEnabled, 
  onChange, 
  className = '' 
}: FeatureToggleProps) {
  const { isFeatureEnabled, updateFeatureSetting } = useFeatureFlags();
  const [isEnabled, setIsEnabled] = React.useState(
    controlledEnabled !== undefined ? controlledEnabled : isFeatureEnabled(feature, organizationId)
  );
  const [isLoading, setIsLoading] = React.useState(false);

  // Update local state when controlled value changes
  React.useEffect(() => {
    if (controlledEnabled !== undefined) {
      setIsEnabled(controlledEnabled);
    }
  }, [controlledEnabled]);

  const handleToggle = async () => {
    if (isLoading || !organizationId) return;

    setIsLoading(true);
    const newEnabled = !isEnabled;

    try {
      // Find feature ID
      const { features } = useFeatureFlags();
      const featureDef = features.find(f => f.name === feature);
      if (!featureDef) throw new Error('Feature not found');

      // Update via API
      await updateFeatureSetting(organizationId, featureDef.id, newEnabled);

      // Update local state
      setIsEnabled(newEnabled);
      onChange?.(newEnabled);

    } catch (error) {
      console.error('Failed to toggle feature:', error);
      // Revert local state on error
      setIsEnabled(isEnabled);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || !organizationId}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${isEnabled ? 'bg-blue-600' : 'bg-gray-200'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      aria-label={`Toggle ${feature} feature`}
      aria-pressed={isEnabled}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
}

// Feature Status Badge Component
export function FeatureStatusBadge({ 
  feature, 
  organizationId, 
  showLabel = true,
  className = '' 
}: { 
  feature: string; 
  organizationId?: string; 
  showLabel?: boolean;
  className?: string;
}) {
  const isEnabled = useFeatureFlag(feature, organizationId);

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${isEnabled 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
        }
        ${className}
      `}
    >
      <span
        className={`
          w-2 h-2 rounded-full mr-1.5
          ${isEnabled ? 'bg-green-400' : 'bg-gray-400'}
        `}
      />
      {showLabel && (isEnabled ? 'Enabled' : 'Disabled')}
    </span>
  );
}

// Widget Configuration Component
export function WidgetConfig({ 
  widgetId, 
  userId, 
  onSave, 
  onCancel 
}: WidgetConfigProps) {
  const { widgets, updateUserPreference } = useFeatureFlags();
  const widget = widgets.find(w => w.id === widgetId);
  
  const [config, setConfig] = React.useState<WidgetConfiguration>(
    widget?.default_config || {}
  );
  const [isLoading, setIsLoading] = React.useState(false);

  if (!widget) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-700">Widget not found: {widgetId}</p>
      </div>
    );
  }

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUserPreference(userId, widgetId, {
        widget_settings: config,
      });
      onSave?.(config);
    } catch (error) {
      console.error('Failed to save widget configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">{widget.name}</h3>
        <p className="text-sm text-gray-600">{widget.description}</p>
      </div>

      <div className="space-y-4">
        {/* Title Configuration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Widget Title
          </label>
          <input
            type="text"
            value={config.title || ''}
            onChange={(e) => handleConfigChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter widget title"
          />
        </div>

        {/* Refresh Interval */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Refresh Interval (seconds)
          </label>
          <select
            value={config.refresh_interval || 30}
            onChange={(e) => handleConfigChange('refresh_interval', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10 seconds</option>
            <option value={30}>30 seconds</option>
            <option value={60}>1 minute</option>
            <option value={300}>5 minutes</option>
            <option value={900}>15 minutes</option>
          </select>
        </div>

        {/* Chart Type (if applicable) */}
        {widget.component_type.includes('chart') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chart Type
            </label>
            <select
              value={config.chart_type || 'line'}
              onChange={(e) => handleConfigChange('chart_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="area">Area Chart</option>
              <option value="scatter">Scatter Plot</option>
            </select>
          </div>
        )}

        {/* Color Scheme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color Scheme
          </label>
          <select
            value={config.color_scheme || 'default'}
            onChange={(e) => handleConfigChange('color_scheme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="default">Default</option>
            <option value="blue">Blue</option>
            <option value="green">Green</option>
            <option value="purple">Purple</option>
            <option value="orange">Orange</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        {/* Display Options */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Display Options
          </label>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="show-legend"
              checked={config.show_legend !== false}
              onChange={(e) => handleConfigChange('show_legend', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="show-legend" className="ml-2 text-sm text-gray-700">
              Show Legend
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enable-tooltips"
              checked={config.enable_tooltips !== false}
              onChange={(e) => handleConfigChange('enable_tooltips', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="enable-tooltips" className="ml-2 text-sm text-gray-700">
              Enable Tooltips
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="exportable"
              checked={config.exportable === true}
              onChange={(e) => handleConfigChange('exportable', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="exportable" className="ml-2 text-sm text-gray-700">
              Enable Export
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}

// Feature List Component
export function FeatureList({ 
  organizationId, 
  category 
}: { 
  organizationId: string; 
  category?: string;
}) {
  const { features, organizationSettings, updateFeatureSetting } = useFeatureFlags();
  
  const filteredFeatures = category 
    ? features.filter(f => f.category === category)
    : features;

  const handleFeatureToggle = async (featureId: string, enabled: boolean) => {
    try {
      await updateFeatureSetting(organizationId, featureId, enabled);
    } catch (error) {
      console.error('Failed to update feature:', error);
    }
  };

  return (
    <div className="space-y-4">
      {filteredFeatures.map(feature => {
        const setting = organizationSettings.find(s => 
          s.feature_id === feature.id && s.organization_id === organizationId
        );
        const isEnabled = setting ? setting.is_enabled : feature.default_enabled;

        return (
          <div key={feature.id} className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="text-sm font-medium text-gray-900">{feature.name}</h4>
                  <FeatureStatusBadge feature={feature.name} organizationId={organizationId} />
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {feature.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                {feature.tiers.length > 0 && (
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-gray-500">Available in:</span>
                    {feature.tiers.map(tier => (
                      <span key={tier} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {tier}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <FeatureToggle 
                feature={feature.name}
                organizationId={organizationId}
                enabled={isEnabled}
                onChange={(enabled) => handleFeatureToggle(feature.id, enabled)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}