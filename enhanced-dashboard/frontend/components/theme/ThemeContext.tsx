"""
Theme Context and Provider
Phase 5: Theme System & Admin Controls

React context for managing theme state and providing theme switching capabilities.
"""

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto' | 'light-blue';

export interface ThemeColors {
  background: string;
  surface: string;
  'surface-variant': string;
  primary: string;
  secondary: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  'text-primary': string;
  'text-secondary': string;
  'text-disabled': string;
  border: string;
  divider: string;
}

export interface ThemeVariables {
  '--spacing-xs': string;
  '--spacing-sm': string;
  '--spacing-md': string;
  '--spacing-lg': string;
  '--spacing-xl': string;
  '--border-radius-sm': string;
  '--border-radius-md': string;
  '--border-radius-lg': string;
  '--shadow-sm': string;
  '--shadow-md': string;
  '--shadow-lg': string;
}

export interface ThemeTypography {
  'font-family-primary': string;
  'font-family-secondary': string;
  'font-size-xs': string;
  'font-size-sm': string;
  'font-size-md': string;
  'font-size-lg': string;
  'font-size-xl': string;
  'font-size-xxl': string;
  'line-height-tight': string;
  'line-height-normal': string;
  'line-height-loose': string;
  'font-weight-normal': string;
  'font-weight-medium': string;
  'font-weight-bold': string;
}

export interface Theme {
  id: number;
  name: string;
  description?: string;
  mode: ThemeMode;
  type: 'system' | 'custom' | 'organization';
  colors: ThemeColors;
  variables: ThemeVariables;
  typography: ThemeTypography;
  is_active: boolean;
  is_default: boolean;
  is_public: boolean;
  organization_id?: number;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  css_variables?: Record<string, string>;
}

export interface ThemeContextType {
  // Current theme state
  currentTheme: Theme | null;
  themeMode: ThemeMode;
  isLoading: boolean;
  error: string | null;

  // Theme management
  setThemeMode: (mode: ThemeMode) => void;
  setCurrentTheme: (theme: Theme) => void;
  loadTheme: (themeId: number) => Promise<void>;
  loadAvailableThemes: () => Promise<Theme[]>;
  
  // Theme utilities
  getCSSVariables: () => Record<string, string>;
  applyTheme: (theme: Theme) => void;
  resetToSystemTheme: () => void;
  
  // Available themes
  availableThemes: Theme[];
  systemThemes: Theme[];
  customThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
  autoDetectSystem?: boolean;
}

// Default themes data
const defaultThemes: Record<ThemeMode, Omit<Theme, 'id' | 'created_by' | 'created_at' | 'updated_at'>> = {
  light: {
    name: 'Light Default',
    description: 'Default light theme with clean, modern colors',
    mode: 'light',
    type: 'system',
    colors: {
      background: '#ffffff',
      surface: '#f5f5f5',
      'surface-variant': '#eeeeee',
      primary: '#1976d2',
      secondary: '#dc004e',
      error: '#f44336',
      warning: '#ff9800',
      success: '#4caf50',
      info: '#2196f3',
      'text-primary': '#212121',
      'text-secondary': '#757575',
      'text-disabled': '#9e9e9e',
      border: '#e0e0e0',
      divider: '#e0e0e0',
    },
    variables: {
      '--spacing-xs': '4px',
      '--spacing-sm': '8px',
      '--spacing-md': '16px',
      '--spacing-lg': '24px',
      '--spacing-xl': '32px',
      '--border-radius-sm': '4px',
      '--border-radius-md': '8px',
      '--border-radius-lg': '12px',
      '--shadow-sm': '0 1px 2px rgba(0,0,0,0.1)',
      '--shadow-md': '0 4px 6px rgba(0,0,0,0.1)',
      '--shadow-lg': '0 10px 15px rgba(0,0,0,0.1)',
    },
    typography: {
      'font-family-primary': "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      'font-family-secondary': "'Roboto', Arial, sans-serif",
      'font-size-xs': '12px',
      'font-size-sm': '14px',
      'font-size-md': '16px',
      'font-size-lg': '18px',
      'font-size-xl': '20px',
      'font-size-xxl': '24px',
      'line-height-tight': '1.25',
      'line-height-normal': '1.5',
      'line-height-loose': '1.75',
      'font-weight-normal': '400',
      'font-weight-medium': '500',
      'font-weight-bold': '700',
    },
    is_active: true,
    is_default: true,
    is_public: true,
  },
  dark: {
    name: 'Dark Default',
    description: 'Default dark theme with comfortable colors for low-light environments',
    mode: 'dark',
    type: 'system',
    colors: {
      background: '#121212',
      surface: '#1e1e1e',
      'surface-variant': '#2d2d2d',
      primary: '#bb86fc',
      secondary: '#03dac6',
      error: '#cf6679',
      warning: '#ffab00',
      success: '#4caf50',
      info: '#64b5f6',
      'text-primary': '#ffffff',
      'text-secondary': '#b3b3b3',
      'text-disabled': '#808080',
      border: '#404040',
      divider: '#404040',
    },
    variables: {
      '--spacing-xs': '4px',
      '--spacing-sm': '8px',
      '--spacing-md': '16px',
      '--spacing-lg': '24px',
      '--spacing-xl': '32px',
      '--border-radius-sm': '4px',
      '--border-radius-md': '8px',
      '--border-radius-lg': '12px',
      '--shadow-sm': '0 1px 2px rgba(255,255,255,0.1)',
      '--shadow-md': '0 4px 6px rgba(255,255,255,0.1)',
      '--shadow-lg': '0 10px 15px rgba(255,255,255,0.1)',
    },
    typography: {
      'font-family-primary': "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      'font-family-secondary': "'Roboto', Arial, sans-serif",
      'font-size-xs': '12px',
      'font-size-sm': '14px',
      'font-size-md': '16px',
      'font-size-lg': '18px',
      'font-size-xl': '20px',
      'font-size-xxl': '24px',
      'line-height-tight': '1.25',
      'line-height-normal': '1.5',
      'line-height-loose': '1.75',
      'font-weight-normal': '400',
      'font-weight-medium': '500',
      'font-weight-bold': '700',
    },
    is_active: true,
    is_default: false,
    is_public: true,
  },
  auto: {
    name: 'Auto Theme',
    description: 'Automatically switches between light and dark based on system preference or time',
    mode: 'auto',
    type: 'system',
    colors: {
      background: '#ffffff', // Will be overridden based on system preference
      surface: '#f5f5f5',
      'surface-variant': '#eeeeee',
      primary: '#1976d2',
      secondary: '#dc004e',
      error: '#f44336',
      warning: '#ff9800',
      success: '#4caf50',
      info: '#2196f3',
      'text-primary': '#212121',
      'text-secondary': '#757575',
      'text-disabled': '#9e9e9e',
      border: '#e0e0e0',
      divider: '#e0e0e0',
    },
    variables: {
      '--spacing-xs': '4px',
      '--spacing-sm': '8px',
      '--spacing-md': '16px',
      '--spacing-lg': '24px',
      '--spacing-xl': '32px',
      '--border-radius-sm': '4px',
      '--border-radius-md': '8px',
      '--border-radius-lg': '12px',
      '--shadow-sm': '0 1px 2px rgba(0,0,0,0.1)',
      '--shadow-md': '0 4px 6px rgba(0,0,0,0.1)',
      '--shadow-lg': '0 10px 15px rgba(0,0,0,0.1)',
    },
    typography: {
      'font-family-primary': "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      'font-family-secondary': "'Roboto', Arial, sans-serif",
      'font-size-xs': '12px',
      'font-size-sm': '14px',
      'font-size-md': '16px',
      'font-size-lg': '18px',
      'font-size-xl': '20px',
      'font-size-xxl': '24px',
      'line-height-tight': '1.25',
      'line-height-normal': '1.5',
      'line-height-loose': '1.75',
      'font-weight-normal': '400',
      'font-weight-medium': '500',
      'font-weight-bold': '700',
    },
    is_active: true,
    is_default: false,
    is_public: true,
  },
  'light-blue': {
    name: 'Light Blue',
    description: 'Light theme with blue accent colors',
    mode: 'light-blue',
    type: 'system',
    colors: {
      background: '#ffffff',
      surface: '#f5f5f5',
      'surface-variant': '#eeeeee',
      primary: '#1976d2',
      secondary: '#03a9f4',
      error: '#f44336',
      warning: '#ff9800',
      success: '#4caf50',
      info: '#2196f3',
      'text-primary': '#212121',
      'text-secondary': '#757575',
      'text-disabled': '#9e9e9e',
      border: '#e0e0e0',
      divider: '#e0e0e0',
    },
    variables: {
      '--spacing-xs': '4px',
      '--spacing-sm': '8px',
      '--spacing-md': '16px',
      '--spacing-lg': '24px',
      '--spacing-xl': '32px',
      '--border-radius-sm': '4px',
      '--border-radius-md': '8px',
      '--border-radius-lg': '12px',
      '--shadow-sm': '0 1px 2px rgba(0,0,0,0.1)',
      '--shadow-md': '0 4px 6px rgba(0,0,0,0.1)',
      '--shadow-lg': '0 10px 15px rgba(0,0,0,0.1)',
    },
    typography: {
      'font-family-primary': "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      'font-family-secondary': "'Roboto', Arial, sans-serif",
      'font-size-xs': '12px',
      'font-size-sm': '14px',
      'font-size-md': '16px',
      'font-size-lg': '18px',
      'font-size-xl': '20px',
      'font-size-xxl': '24px',
      'line-height-tight': '1.25',
      'line-height-normal': '1.5',
      'line-height-loose': '1.75',
      'font-weight-normal': '400',
      'font-weight-medium': '500',
      'font-weight-bold': '700',
    },
    is_active: true,
    is_default: false,
    is_public: true,
  },
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'light',
  autoDetectSystem = true,
}) => {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableThemes, setAvailableThemes] = useState<Theme[]>([]);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    initializeTheme();
  }, []);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (themeMode === 'auto' && autoDetectSystem) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const systemMode = mediaQuery.matches ? 'dark' : 'light';
        applyAutoTheme(systemMode);
      };

      mediaQuery.addEventListener('change', handleChange);
      handleChange(); // Initial call

      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode, autoDetectSystem]);

  const initializeTheme = async () => {
    try {
      setIsLoading(true);
      
      // Load saved theme mode from localStorage
      const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
      const initialMode = savedMode || defaultMode;
      
      setThemeModeState(initialMode);
      
      // Load available themes from API
      await loadAvailableThemes();
      
      // Apply initial theme
      if (initialMode === 'auto' && autoDetectSystem) {
        const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        applyAutoTheme(systemMode);
      } else {
        applyThemeMode(initialMode);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize theme');
      // Fallback to light theme
      applyThemeMode('light');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableThemes = async (): Promise<Theme[]> => {
    try {
      // In a real implementation, this would fetch from the API
      // For now, we'll use the default themes
      const themes: Theme[] = Object.entries(defaultThemes).map(([mode, themeData], index) => ({
        ...themeData,
        id: index + 1,
        created_by: 0, // System user
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })) as Theme[];

      setAvailableThemes(themes);
      return themes;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load themes');
      return [];
    }
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('theme-mode', mode);
    
    if (mode === 'auto' && autoDetectSystem) {
      const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      applyAutoTheme(systemMode);
    } else {
      applyThemeMode(mode);
    }
  };

  const applyThemeMode = (mode: ThemeMode) => {
    const themeData = defaultThemes[mode];
    if (!themeData) {
      setError(`Theme mode "${mode}" not found`);
      return;
    }

    const theme: Theme = {
      ...themeData,
      id: 0,
      created_by: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setCurrentTheme(theme);
    applyTheme(theme);
  };

  const applyAutoTheme = (systemMode: 'light' | 'dark') => {
    const autoTheme = defaultThemes.auto;
    const targetMode = systemMode === 'dark' ? 'dark' : 'light';
    const targetTheme = defaultThemes[targetMode];
    
    if (!targetTheme) return;

    const autoAppliedTheme: Theme = {
      ...autoTheme,
      ...targetTheme,
      id: 0,
      created_by: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setCurrentTheme(autoAppliedTheme);
    applyTheme(autoAppliedTheme);
  };

  const loadTheme = async (themeId: number): Promise<void> => {
    try {
      setIsLoading(true);
      
      // In a real implementation, this would fetch from the API
      const theme = availableThemes.find(t => t.id === themeId);
      if (!theme) {
        throw new Error(`Theme with ID ${themeId} not found`);
      }

      setCurrentTheme(theme);
      applyTheme(theme);
      setThemeModeState(theme.mode);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load theme');
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    setThemeModeState(theme.mode);
    applyTheme(theme);
  };

  const getCSSVariables = (): Record<string, string> => {
    if (!currentTheme) return {};

    const variables: Record<string, string> = {};

    // Add colors as CSS variables
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      variables[`--color-${key}`] = value;
    });

    // Add spacing and layout variables
    Object.entries(currentTheme.variables).forEach(([key, value]) => {
      variables[key] = value;
    });

    // Add typography variables
    Object.entries(currentTheme.typography).forEach(([key, value]) => {
      variables[key] = value;
    });

    return variables;
  };

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    const cssVariables = getCSSVariables();

    // Apply all CSS variables
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', theme.mode);
    
    // Add theme class to body for additional styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme.mode}`);
  };

  const resetToSystemTheme = () => {
    setThemeMode('auto');
  };

  // Computed values
  const systemThemes = availableThemes.filter(theme => theme.type === 'system');
  const customThemes = availableThemes.filter(theme => theme.type === 'custom');

  const contextValue: ThemeContextType = {
    currentTheme,
    themeMode,
    isLoading,
    error,
    setThemeMode,
    setCurrentTheme: setTheme,
    loadTheme,
    loadAvailableThemes,
    getCSSVariables,
    applyTheme,
    resetToSystemTheme,
    availableThemes,
    systemThemes,
    customThemes,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme mode labels for UI
export const THEME_MODE_LABELS: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  auto: 'Auto',
  'light-blue': 'Light Blue',
};

// Theme mode descriptions
export const THEME_MODE_DESCRIPTIONS: Record<ThemeMode, string> = {
  light: 'Clean and bright light theme',
  dark: 'Comfortable dark theme for low-light environments',
  auto: 'Automatically switches based on system preference',
  'light-blue': 'Light theme with blue accents',
};

// Utility functions
export const isDarkMode = (theme: Theme): boolean => {
  return theme.mode === 'dark';
};

export const getContrastColor = (backgroundColor: string): string => {
  // Simple luminance-based contrast calculation
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export const getThemePreview = (theme: Theme): string => {
  // Generate a preview URL or data URL for the theme
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 120;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  // Fill background
  ctx.fillStyle = theme.colors.background;
  ctx.fillRect(0, 0, 200, 120);
  
  // Add some sample UI elements
  ctx.fillStyle = theme.colors.surface;
  ctx.fillRect(10, 10, 180, 30);
  
  ctx.fillStyle = theme.colors.primary;
  ctx.fillRect(10, 50, 80, 20);
  
  ctx.fillStyle = theme.colors['text-primary'];
  ctx.font = '12px sans-serif';
  ctx.fillText(theme.name, 15, 25);
  
  return canvas.toDataURL();
};