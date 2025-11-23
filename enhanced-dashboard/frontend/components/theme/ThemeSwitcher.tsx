"""
Theme Switcher Component
Phase 5: Theme System & Admin Controls

Interactive component for switching between available themes.
"""

import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Palette,
  ChevronDown,
  Check,
  Loader2
} from 'lucide-react';
import { useTheme, ThemeMode, THEME_MODE_LABELS, THEME_MODE_DESCRIPTIONS } from './ThemeContext';

interface ThemeSwitcherProps {
  variant?: 'dropdown' | 'inline' | 'compact';
  showLabels?: boolean;
  showDescriptions?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeIcon: React.FC<{ mode: ThemeMode; size?: number }> = ({ 
  mode, 
  size = 16 
}) => {
  const iconProps = { size, className: 'text-current' };
  
  switch (mode) {
    case 'light':
      return <Sun {...iconProps} />;
    case 'dark':
      return <Moon {...iconProps} />;
    case 'auto':
      return <Monitor {...iconProps} />;
    case 'light-blue':
      return <Palette {...iconProps} />;
    default:
      return <Sun {...iconProps} />;
  }
};

const ThemeOption: React.FC<{
  mode: ThemeMode;
  isSelected: boolean;
  onSelect: (mode: ThemeMode) => void;
  showLabel?: boolean;
  showDescription?: boolean;
}> = ({ mode, isSelected, onSelect, showLabel = true, showDescription = false }) => {
  return (
    <button
      onClick={() => onSelect(mode)}
      className={`
        flex items-center w-full px-3 py-2 text-left rounded-lg transition-colors
        hover:bg-gray-100 dark:hover:bg-gray-700
        ${isSelected 
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
          : 'text-gray-700 dark:text-gray-300'
        }
      `}
    >
      <ThemeIcon mode={mode} size={18} />
      
      <div className="ml-3 flex-1">
        {showLabel && (
          <div className="font-medium text-sm">
            {THEME_MODE_LABELS[mode]}
          </div>
        )}
        
        {showDescription && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {THEME_MODE_DESCRIPTIONS[mode]}
          </div>
        )}
      </div>
      
      {isSelected && (
        <Check size={16} className="text-blue-600 dark:text-blue-400" />
      )}
    </button>
  );
};

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'dropdown',
  showLabels = true,
  showDescriptions = false,
  className = '',
  size = 'md'
}) => {
  const { 
    themeMode, 
    setThemeMode, 
    isLoading, 
    availableThemes,
    systemThemes 
  } = useTheme();
  
  const [isOpen, setIsOpen] = useState(false);

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'p-2',
      icon: 16,
      dropdown: 'w-48'
    },
    md: {
      button: 'p-2.5',
      icon: 18,
      dropdown: 'w-56'
    },
    lg: {
      button: 'p-3',
      icon: 20,
      dropdown: 'w-64'
    }
  };

  const config = sizeConfig[size];

  const handleThemeSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
    setIsOpen(false);
  };

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`
            flex items-center space-x-2 rounded-lg border border-gray-200 dark:border-gray-700
            bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
            hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
            ${config.button}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isLoading ? (
            <Loader2 size={config.icon} className="animate-spin" />
          ) : (
            <ThemeIcon mode={themeMode} size={config.icon} />
          )}
          
          {showLabels && (
            <span className="font-medium text-sm">
              {THEME_MODE_LABELS[themeMode]}
            </span>
          )}
          
          <ChevronDown 
            size={14} 
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Dropdown menu */}
            <div className={`
              absolute right-0 top-full mt-2 z-20
              bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
              shadow-lg py-2 ${config.dropdown}
            `}>
              <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Theme Mode
                </div>
              </div>
              
              {systemThemes.map((theme) => (
                <ThemeOption
                  key={theme.mode}
                  mode={theme.mode}
                  isSelected={themeMode === theme.mode}
                  onSelect={handleThemeSelect}
                  showLabel={showLabels}
                  showDescription={showDescriptions}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Inline variant
  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        {systemThemes.map((theme) => (
          <button
            key={theme.mode}
            onClick={() => handleThemeSelect(theme.mode)}
            disabled={isLoading}
            title={THEME_MODE_DESCRIPTIONS[theme.mode]}
            className={`
              p-2 rounded-lg transition-colors
              ${themeMode === theme.mode
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isLoading ? (
              <Loader2 size={config.icon} className="animate-spin" />
            ) : (
              <ThemeIcon mode={theme.mode} size={config.icon} />
            )}
          </button>
        ))}
      </div>
    );
  }

  // Compact variant (just the current theme icon)
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      disabled={isLoading}
      className={`
        p-2 rounded-lg transition-colors
        text-gray-500 dark:text-gray-400 
        hover:text-gray-700 dark:hover:text-gray-300 
        hover:bg-gray-100 dark:hover:bg-gray-700
        ${config.button}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      title={`Current theme: ${THEME_MODE_LABELS[themeMode]}`}
    >
      {isLoading ? (
        <Loader2 size={config.icon} className="animate-spin" />
      ) : (
        <ThemeIcon mode={themeMode} size={config.icon} />
      )}
    </button>
  );
};

// Specialized components for different use cases

export const ThemeSwitcherDropdown: React.FC<{
  className?: string;
}> = ({ className }) => (
  <ThemeSwitcher
    variant="dropdown"
    showLabels={true}
    showDescriptions={true}
    className={className}
  />
);

export const ThemeSwitcherInline: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ className, size = 'md' }) => (
  <ThemeSwitcher
    variant="inline"
    showLabels={false}
    size={size}
    className={className}
  />
);

export const ThemeSwitcherCompact: React.FC<{
  className?: string;
}> = ({ className }) => (
  <ThemeSwitcher
    variant="compact"
    className={className}
  />
);

// Advanced theme switcher with preview
interface ThemePreview {
  id: number;
  name: string;
  mode: ThemeMode;
  preview: string;
  colors: Record<string, string>;
}

export const AdvancedThemeSwitcher: React.FC<{
  className?: string;
}> = ({ className }) => {
  const { themeMode, setThemeMode, systemThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Generate previews for available themes
  const themePreviews: ThemePreview[] = systemThemes.map((theme, index) => ({
    id: theme.id,
    name: theme.name,
    mode: theme.mode,
    preview: generateThemePreview(theme),
    colors: theme.colors,
  }));

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          <img
            src={themePreviews.find(p => p.mode === themeMode)?.preview}
            alt={`${THEME_MODE_LABELS[themeMode]} theme preview`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-left">
          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
            {THEME_MODE_LABELS[themeMode]}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {THEME_MODE_DESCRIPTIONS[themeMode]}
          </div>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 w-80 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="p-4">
              <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-3">
                Choose a theme
              </h3>
              <div className="space-y-2">
                {themePreviews.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setThemeMode(theme.mode);
                      setIsOpen(false);
                    }}
                    className={`
                      flex items-center w-full p-3 rounded-lg border transition-colors text-left
                      ${themeMode === theme.mode
                        ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <div className="w-12 h-8 rounded border border-gray-200 dark:border-gray-600 overflow-hidden mr-3">
                      <img
                        src={theme.preview}
                        alt={`${theme.name} theme preview`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {theme.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {THEME_MODE_DESCRIPTIONS[theme.mode]}
                      </div>
                    </div>
                    {themeMode === theme.mode && (
                      <Check size={16} className="text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Helper function to generate theme previews
const generateThemePreview = (theme: any): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  // Background
  ctx.fillStyle = theme.colors.background;
  ctx.fillRect(0, 0, 64, 32);
  
  // Header bar
  ctx.fillStyle = theme.colors.surface;
  ctx.fillRect(0, 0, 64, 8);
  
  // Primary button
  ctx.fillStyle = theme.colors.primary;
  ctx.fillRect(4, 12, 16, 6);
  
  // Secondary button
  ctx.fillStyle = theme.colors.secondary;
  ctx.fillRect(24, 12, 16, 6);
  
  // Text
  ctx.fillStyle = theme.colors['text-primary'];
  ctx.font = '6px sans-serif';
  ctx.fillText('Aa', 8, 22);
  
  return canvas.toDataURL();
};