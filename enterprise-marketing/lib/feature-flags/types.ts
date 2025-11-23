// =============================================================================
// FEATURE FLAGS TYPES & INTERFACES
// =============================================================================

export interface FeatureDefinition {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  is_active: boolean;
  default_enabled: boolean;
  dependencies: string[];
  conflicts: string[];
  tiers: SubscriptionTier[];
  metadata: FeatureMetadata;
  created_at: string;
  updated_at: string;
}

export interface OrganizationFeatureSetting {
  id: string;
  organization_id: string;
  feature_id: string;
  is_enabled: boolean;
  configuration: FeatureConfiguration;
  tier_restrictions: SubscriptionTier[];
  user_restrictions: string[];
  created_at: string;
  updated_at: string;
}

export interface UserFeaturePreference {
  id: string;
  user_id: string;
  feature_id: string;
  preference_value: any;
  is_favorite: boolean;
  widget_settings: WidgetSettings;
  created_at: string;
  updated_at: string;
}

export interface FeatureTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  company_size: CompanySize;
  features: FeatureTemplateItem[];
  metadata: FeatureMetadata;
  created_at: string;
  updated_at: string;
}

export interface WidgetLibrary {
  id: string;
  name: string;
  description: string;
  category: string;
  component_type: string;
  default_config: WidgetConfiguration;
  feature_dependencies: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeatureAudit {
  id: string;
  action: AuditAction;
  entity_type: EntityType;
  entity_id: string;
  user_id: string;
  organization_id: string;
  changes: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export type FeatureCategory = 
  | 'dashboard_core'
  | 'visualization' 
  | 'analytics'
  | 'ai_ml'
  | 'collaboration'
  | 'energy_specific'
  | 'financial'
  | 'geographic'
  | 'compliance'
  | 'mobile'
  | 'api_integration'
  | 'security'
  | 'admin';

export type SubscriptionTier = 
  | 'starter'
  | 'professional' 
  | 'enterprise'
  | 'fortune_500';

export type CompanySize = 
  | 'startup'
  | 'small'
  | 'medium'
  | 'large'
  | 'enterprise';

export type AuditAction = 
  | 'created'
  | 'updated'
  | 'deleted'
  | 'enabled'
  | 'disabled'
  | 'configured';

export type EntityType = 
  | 'feature_definition'
  | 'organization_setting'
  | 'user_preference'
  | 'template';

export interface FeatureMetadata {
  ui_component?: string;
  api_endpoint?: string;
  dependencies?: string[];
  performance_impact?: 'low' | 'medium' | 'high';
  data_requirements?: string[];
  min_users?: number;
  max_users?: number;
  cost_implications?: Record<string, any>;
  compliance_flags?: string[];
}

export interface FeatureConfiguration {
  [key: string]: any;
  enabled?: boolean;
  settings?: Record<string, any>;
  permissions?: string[];
  limits?: Record<string, number>;
}

export interface WidgetSettings {
  [key: string]: any;
  position?: { x: number; y: number; width: number; height: number };
  visible?: boolean;
  refresh_interval?: number;
  chart_type?: string;
  color_scheme?: string;
}

export interface FeatureTemplateItem {
  feature_id: string;
  enabled: boolean;
  configuration: FeatureConfiguration;
  priority: number;
}

export interface WidgetConfiguration {
  [key: string]: any;
  title?: string;
  description?: string;
  refresh_interval?: number;
  max_data_points?: number;
  chart_type?: string;
  color_scheme?: string;
  show_legend?: boolean;
  enable_tooltips?: boolean;
  exportable?: boolean;
}

// Feature Flag Context Types
export interface FeatureFlagContextValue {
  features: FeatureDefinition[];
  organizationSettings: OrganizationFeatureSetting[];
  userPreferences: UserFeaturePreference[];
  templates: FeatureTemplate[];
  widgets: WidgetLibrary[];
  
  // Actions
  isFeatureEnabled: (featureName: string, organizationId?: string) => boolean;
  getFeatureConfig: (featureName: string, organizationId?: string) => FeatureConfiguration | null;
  getUserPreference: (featureName: string, userId: string) => UserFeaturePreference | null;
  updateFeatureSetting: (organizationId: string, featureId: string, enabled: boolean, config?: FeatureConfiguration) => Promise<void>;
  updateUserPreference: (userId: string, featureId: string, preference: Partial<UserFeaturePreference>) => Promise<void>;
  refreshFeatures: () => Promise<void>;
  
  // Loading states
  loading: boolean;
  error: string | null;
}

// API Response Types
export interface FeatureFlagsAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface FeatureFlagsListResponse extends FeatureFlagsAPIResponse {
  data: {
    features: FeatureDefinition[];
    organization_settings: OrganizationFeatureSetting[];
    user_preferences: UserFeaturePreference[];
    total: number;
  };
}

// Component Props Types
export interface FeatureGateProps {
  feature: string;
  organizationId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  exact?: boolean;
}

export interface FeatureToggleProps {
  feature: string;
  organizationId?: string;
  enabled?: boolean;
  onChange?: (enabled: boolean) => void;
  className?: string;
}

export interface WidgetConfigProps {
  widgetId: string;
  userId: string;
  onSave?: (config: WidgetConfiguration) => void;
  onCancel?: () => void;
}