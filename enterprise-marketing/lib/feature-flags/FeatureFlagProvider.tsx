// =============================================================================
// FEATURE FLAG PROVIDER - MAIN CONTEXT PROVIDER
// =============================================================================
'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  FeatureFlagContextValue, 
  FeatureDefinition, 
  OrganizationFeatureSetting, 
  UserFeaturePreference,
  FeatureTemplate,
  WidgetLibrary,
  FeatureConfiguration 
} from './types';

// Feature Flag State
interface FeatureFlagState {
  features: FeatureDefinition[];
  organizationSettings: OrganizationFeatureSetting[];
  userPreferences: UserFeaturePreference[];
  templates: FeatureTemplate[];
  widgets: WidgetLibrary[];
  loading: boolean;
  error: string | null;
}

// Action Types
type FeatureFlagAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FEATURES'; payload: FeatureDefinition[] }
  | { type: 'SET_ORGANIZATION_SETTINGS'; payload: OrganizationFeatureSetting[] }
  | { type: 'SET_USER_PREFERENCES'; payload: UserFeaturePreference[] }
  | { type: 'SET_TEMPLATES'; payload: FeatureTemplate[] }
  | { type: 'SET_WIDGETS'; payload: WidgetLibrary[] }
  | { type: 'UPDATE_FEATURE_SETTING'; payload: { featureId: string; enabled: boolean; config?: FeatureConfiguration } }
  | { type: 'UPDATE_USER_PREFERENCE'; payload: { featureId: string; preference: Partial<UserFeaturePreference> } };

// Initial State
const initialState: FeatureFlagState = {
  features: [],
  organizationSettings: [],
  userPreferences: [],
  templates: [],
  widgets: [],
  loading: false,
  error: null,
};

// Reducer
function featureFlagReducer(state: FeatureFlagState, action: FeatureFlagAction): FeatureFlagState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_FEATURES':
      return { ...state, features: action.payload };
    case 'SET_ORGANIZATION_SETTINGS':
      return { ...state, organizationSettings: action.payload };
    case 'SET_USER_PREFERENCES':
      return { ...state, userPreferences: action.payload };
    case 'SET_TEMPLATES':
      return { ...state, templates: action.payload };
    case 'SET_WIDGETS':
      return { ...state, widgets: action.payload };
    case 'UPDATE_FEATURE_SETTING':
      const { featureId, enabled, config } = action.payload;
      return {
        ...state,
        organizationSettings: state.organizationSettings.map(setting =>
          setting.feature_id === featureId
            ? { ...setting, is_enabled: enabled, configuration: config || setting.configuration }
            : setting
        ),
      };
    case 'UPDATE_USER_PREFERENCE':
      const { featureId: prefFeatureId, preference } = action.payload;
      return {
        ...state,
        userPreferences: state.userPreferences.map(pref =>
          pref.feature_id === prefFeatureId
            ? { ...pref, ...preference }
            : pref
        ),
      };
    default:
      return state;
  }
}

// Context
const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

// API Functions
async function fetchFeatures(): Promise<FeatureDefinition[]> {
  const response = await fetch('/api/feature-flags/features');
  if (!response.ok) throw new Error('Failed to fetch features');
  const data = await response.json();
  return data.features || [];
}

async function fetchOrganizationSettings(organizationId: string): Promise<OrganizationFeatureSetting[]> {
  const response = await fetch(`/api/feature-flags/organizations/${organizationId}/features`);
  if (!response.ok) throw new Error('Failed to fetch organization settings');
  const data = await response.json();
  return data.settings || [];
}

async function fetchUserPreferences(userId: string): Promise<UserFeaturePreference[]> {
  const response = await fetch(`/api/feature-flags/users/${userId}/preferences`);
  if (!response.ok) throw new Error('Failed to fetch user preferences');
  const data = await response.json();
  return data.preferences || [];
}

async function fetchTemplates(): Promise<FeatureTemplate[]> {
  const response = await fetch('/api/feature-flags/templates');
  if (!response.ok) throw new Error('Failed to fetch templates');
  const data = await response.json();
  return data.templates || [];
}

async function fetchWidgets(): Promise<WidgetLibrary[]> {
  const response = await fetch('/api/feature-flags/widgets');
  if (!response.ok) throw new Error('Failed to fetch widgets');
  const data = await response.json();
  return data.widgets || [];
}

async function updateFeatureSetting(
  organizationId: string, 
  featureId: string, 
  enabled: boolean, 
  config?: FeatureConfiguration
): Promise<void> {
  const response = await fetch(`/api/feature-flags/organizations/${organizationId}/features/${featureId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled, configuration: config }),
  });
  if (!response.ok) throw new Error('Failed to update feature setting');
}

async function updateUserPreference(
  userId: string, 
  featureId: string, 
  preference: Partial<UserFeaturePreference>
): Promise<void> {
  const response = await fetch(`/api/feature-flags/users/${userId}/preferences/${featureId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preference),
  });
  if (!response.ok) throw new Error('Failed to update user preference');
}

// Provider Component
export function FeatureFlagProvider({ children, organizationId, userId }: {
  children: React.ReactNode;
  organizationId?: string;
  userId?: string;
}) {
  const [state, dispatch] = useReducer(featureFlagReducer, initialState);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Load all feature flag data in parallel
      const [
        features,
        templates,
        widgets,
        ...settings
      ] = await Promise.all([
        fetchFeatures(),
        fetchTemplates(),
        fetchWidgets(),
        ...(organizationId ? [fetchOrganizationSettings(organizationId)] : []),
        ...(userId ? [fetchUserPreferences(userId)] : []),
      ]);

      dispatch({ type: 'SET_FEATURES', payload: features });
      dispatch({ type: 'SET_TEMPLATES', payload: templates });
      dispatch({ type: 'SET_WIDGETS', payload: widgets });
      
      if (organizationId) {
        dispatch({ type: 'SET_ORGANIZATION_SETTINGS', payload: settings[0] });
      }
      
      if (userId) {
        const userPrefsIndex = organizationId ? 1 : 0;
        dispatch({ type: 'SET_USER_PREFERENCES', payload: settings[userPrefsIndex] });
      }

    } catch (error) {
      console.error('Failed to load feature flags:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [organizationId, userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Feature checking functions
  const isFeatureEnabled = useCallback((featureName: string, orgId?: string) => {
    const feature = state.features.find(f => f.name === featureName);
    if (!feature || !feature.is_active) return false;

    const targetOrgId = orgId || organizationId;
    if (!targetOrgId) return feature.default_enabled;

    const setting = state.organizationSettings.find(s => 
      s.feature_id === feature.id && s.organization_id === targetOrgId
    );

    return setting ? setting.is_enabled : feature.default_enabled;
  }, [state.features, state.organizationSettings, organizationId]);

  const getFeatureConfig = useCallback((featureName: string, orgId?: string) => {
    const feature = state.features.find(f => f.name === featureName);
    if (!feature) return null;

    const targetOrgId = orgId || organizationId;
    if (!targetOrgId) return feature.metadata;

    const setting = state.organizationSettings.find(s => 
      s.feature_id === feature.id && s.organization_id === targetOrgId
    );

    return setting ? setting.configuration : feature.metadata;
  }, [state.features, state.organizationSettings, organizationId]);

  const getUserPreference = useCallback((featureName: string, uid: string) => {
    const feature = state.features.find(f => f.name === featureName);
    if (!feature) return null;

    return state.userPreferences.find(p => 
      p.feature_id === feature.id && p.user_id === uid
    ) || null;
  }, [state.features, state.userPreferences]);

  const updateFeatureSettingHandler = useCallback(async (
    orgId: string, 
    featureId: string, 
    enabled: boolean, 
    config?: FeatureConfiguration
  ) => {
    try {
      await updateFeatureSetting(orgId, featureId, enabled, config);
      dispatch({ 
        type: 'UPDATE_FEATURE_SETTING', 
        payload: { featureId, enabled, config } 
      });
    } catch (error) {
      console.error('Failed to update feature setting:', error);
      throw error;
    }
  }, []);

  const updateUserPreferenceHandler = useCallback(async (
    uid: string, 
    featureId: string, 
    preference: Partial<UserFeaturePreference>
  ) => {
    try {
      await updateUserPreference(uid, featureId, preference);
      dispatch({ 
        type: 'UPDATE_USER_PREFERENCE', 
        payload: { featureId, preference } 
      });
    } catch (error) {
      console.error('Failed to update user preference:', error);
      throw error;
    }
  }, []);

  const refreshFeatures = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const value: FeatureFlagContextValue = {
    features: state.features,
    organizationSettings: state.organizationSettings,
    userPreferences: state.userPreferences,
    templates: state.templates,
    widgets: state.widgets,
    isFeatureEnabled,
    getFeatureConfig,
    getUserPreference,
    updateFeatureSetting: updateFeatureSettingHandler,
    updateUserPreference: updateUserPreferenceHandler,
    refreshFeatures,
    loading: state.loading,
    error: state.error,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

// Hook to use feature flags
export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
}

// Hook to check if feature is enabled
export function useFeatureFlag(featureName: string, organizationId?: string) {
  const { isFeatureEnabled } = useFeatureFlags();
  return isFeatureEnabled(featureName, organizationId);
}

// Hook to get feature configuration
export function useFeatureConfig(featureName: string, organizationId?: string) {
  const { getFeatureConfig } = useFeatureFlags();
  return getFeatureConfig(featureName, organizationId);
}