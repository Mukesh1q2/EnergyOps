"""
Theme Management Models
Phase 5: Theme System & Admin Controls

Advanced theme system with multiple color modes, CSS variable management,
and database storage for theme configurations.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON, Text, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()

class ThemeMode(str, Enum):
    """Theme mode enumeration"""
    LIGHT = "light"
    DARK = "dark"
    AUTO = "auto"
    LIGHT_BLUE = "light-blue"

class ThemeType(str, Enum):
    """Theme type enumeration"""
    SYSTEM = "system"
    CUSTOM = "custom"
    ORGANIZATION = "organization"

class Theme(Base):
    """
    Theme configuration model for managing visual themes
    """
    __tablename__ = "themes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    mode = Column(String(20), nullable=False)  # ThemeMode enum
    type = Column(String(20), nullable=False)  # ThemeType enum
    
    # Theme colors and variables
    colors = Column(JSON, nullable=False, default={})  # All theme colors
    variables = Column(JSON, nullable=False, default={})  # CSS variables
    typography = Column(JSON, nullable=False, default={})  # Typography settings
    
    # Theme metadata
    is_active = Column(Boolean, default=False)
    is_default = Column(Boolean, default=False)
    is_public = Column(Boolean, default=True)
    
    # Organization association
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    organization = relationship("Organization", back_populates="themes")
    creator = relationship("User", foreign_keys=[created_by])
    customizations = relationship("ThemeCustomization", back_populates="theme")
    
    def get_css_variables(self) -> Dict[str, str]:
        """Get CSS variables for this theme"""
        variables = self.variables.copy()
        
        # Add colors as CSS variables
        for key, value in self.colors.items():
            variables[f"--color-{key}"] = value
        
        # Add typography as CSS variables
        for key, value in self.typography.items():
            variables[f"--font-{key}"] = value
            
        return variables
    
    def apply_mode_overrides(self, mode: ThemeMode) -> Dict[str, Any]:
        """Apply mode-specific overrides to theme"""
        overrides = {}
        
        if mode == ThemeMode.DARK:
            overrides.update({
                "background": "#1a1a1a",
                "surface": "#2d2d2d",
                "surface-variant": "#404040",
                "primary": "#bb86fc",
                "secondary": "#03dac6",
                "error": "#cf6679",
                "warning": "#ffab00",
                "success": "#4caf50",
                "text-primary": "#ffffff",
                "text-secondary": "#b3b3b3",
                "text-disabled": "#808080"
            })
        elif mode == ThemeMode.LIGHT_BLUE:
            overrides.update({
                "primary": "#1976d2",
                "secondary": "#03a9f4",
                "background": "#fafafa",
                "surface": "#ffffff",
                "accent": "#2196f3"
            })
        
        return overrides
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert theme to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "mode": self.mode,
            "type": self.type,
            "colors": self.colors,
            "variables": self.variables,
            "typography": self.typography,
            "is_active": self.is_active,
            "is_default": self.is_default,
            "is_public": self.is_public,
            "organization_id": self.organization_id,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "css_variables": self.get_css_variables()
        }

class ThemeCustomization(Base):
    """
    Theme customization model for user-specific modifications
    """
    __tablename__ = "theme_customizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    
    # Reference to base theme
    base_theme_id = Column(Integer, ForeignKey("themes.id"), nullable=False)
    
    # Customization data
    custom_colors = Column(JSON, nullable=True, default={})
    custom_variables = Column(JSON, nullable=True, default={})
    custom_typography = Column(JSON, nullable=True, default={})
    
    # Preview and screenshots
    preview_url = Column(String(500), nullable=True)
    screenshot_url = Column(String(500), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)
    
    # Ownership
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    theme = relationship("Theme", back_populates="customizations")
    organization = relationship("Organization")
    creator = relationship("User", foreign_keys=[created_by])
    
    def get_merged_config(self) -> Dict[str, Any]:
        """Get merged theme configuration (base + customizations)"""
        base_config = self.theme.to_dict()
        
        # Merge customizations
        merged = base_config.copy()
        if self.custom_colors:
            merged["colors"].update(self.custom_colors)
        if self.custom_variables:
            merged["variables"].update(self.custom_variables)
        if self.custom_typography:
            merged["typography"].update(self.custom_typography)
        
        return merged
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert customization to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "base_theme_id": self.base_theme_id,
            "custom_colors": self.custom_colors,
            "custom_variables": self.custom_variables,
            "custom_typography": self.custom_typography,
            "preview_url": self.preview_url,
            "screenshot_url": self.screenshot_url,
            "is_active": self.is_active,
            "is_public": self.is_public,
            "organization_id": self.organization_id,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "merged_config": self.get_merged_config()
        }

class ThemeAnalytics(Base):
    """
    Theme usage analytics for tracking theme adoption
    """
    __tablename__ = "theme_analytics"

    id = Column(Integer, primary_key=True, index=True)
    theme_id = Column(Integer, ForeignKey("themes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    
    # Usage metrics
    session_duration_minutes = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    interactions_count = Column(Integer, default=0)
    
    # User feedback
    rating = Column(Float, nullable=True)  # 1-5 stars
    feedback_text = Column(Text, nullable=True)
    
    # Timestamps
    first_used_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    theme = relationship("Theme")
    user = relationship("User")
    organization = relationship("Organization")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert analytics to dictionary"""
        return {
            "id": self.id,
            "theme_id": self.theme_id,
            "user_id": self.user_id,
            "organization_id": self.organization_id,
            "session_duration_minutes": self.session_duration_minutes,
            "views_count": self.views_count,
            "interactions_count": self.interactions_count,
            "rating": self.rating,
            "feedback_text": self.feedback_text,
            "first_used_at": self.first_used_at.isoformat() if self.first_used_at else None,
            "last_used_at": self.last_used_at.isoformat() if self.last_used_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

# Utility functions for theme management
def get_default_light_theme() -> Dict[str, Any]:
    """Get default light theme configuration"""
    return {
        "name": "Light Default",
        "description": "Default light theme with clean, modern colors",
        "mode": ThemeMode.LIGHT.value,
        "type": ThemeType.SYSTEM.value,
        "colors": {
            "background": "#ffffff",
            "surface": "#f5f5f5",
            "surface-variant": "#eeeeee",
            "primary": "#1976d2",
            "secondary": "#dc004e",
            "error": "#f44336",
            "warning": "#ff9800",
            "success": "#4caf50",
            "info": "#2196f3",
            "text-primary": "#212121",
            "text-secondary": "#757575",
            "text-disabled": "#9e9e9e",
            "border": "#e0e0e0",
            "divider": "#e0e0e0"
        },
        "variables": {
            "--spacing-xs": "4px",
            "--spacing-sm": "8px",
            "--spacing-md": "16px",
            "--spacing-lg": "24px",
            "--spacing-xl": "32px",
            "--border-radius-sm": "4px",
            "--border-radius-md": "8px",
            "--border-radius-lg": "12px",
            "--shadow-sm": "0 1px 2px rgba(0,0,0,0.1)",
            "--shadow-md": "0 4px 6px rgba(0,0,0,0.1)",
            "--shadow-lg": "0 10px 15px rgba(0,0,0,0.1)"
        },
        "typography": {
            "font-family-primary": "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            "font-family-secondary": "'Roboto', Arial, sans-serif",
            "font-size-xs": "12px",
            "font-size-sm": "14px",
            "font-size-md": "16px",
            "font-size-lg": "18px",
            "font-size-xl": "20px",
            "font-size-xxl": "24px",
            "line-height-tight": "1.25",
            "line-height-normal": "1.5",
            "line-height-loose": "1.75",
            "font-weight-normal": "400",
            "font-weight-medium": "500",
            "font-weight-bold": "700"
        }
    }

def get_default_dark_theme() -> Dict[str, Any]:
    """Get default dark theme configuration"""
    base_light = get_default_light_theme()
    base_light["name"] = "Dark Default"
    base_light["description"] = "Default dark theme with comfortable colors for low-light environments"
    base_light["mode"] = ThemeMode.DARK.value
    
    # Dark mode overrides
    base_light["colors"].update({
        "background": "#121212",
        "surface": "#1e1e1e",
        "surface-variant": "#2d2d2d",
        "primary": "#bb86fc",
        "secondary": "#03dac6",
        "error": "#cf6679",
        "warning": "#ffab00",
        "success": "#4caf50",
        "info": "#64b5f6",
        "text-primary": "#ffffff",
        "text-secondary": "#b3b3b3",
        "text-disabled": "#808080",
        "border": "#404040",
        "divider": "#404040"
    })
    
    return base_light

def get_default_auto_theme() -> Dict[str, Any]:
    """Get default auto theme configuration"""
    return {
        "name": "Auto Theme",
        "description": "Automatically switches between light and dark based on system preference or time",
        "mode": ThemeMode.AUTO.value,
        "type": ThemeType.SYSTEM.value,
        "colors": {
            "auto_light": get_default_light_theme()["colors"],
            "auto_dark": get_default_dark_theme()["colors"]
        },
        "variables": get_default_light_theme()["variables"],
        "typography": get_default_light_theme()["typography"]
    }

def get_default_light_blue_theme() -> Dict[str, Any]:
    """Get default light-blue theme configuration"""
    base_light = get_default_light_theme()
    base_light["name"] = "Light Blue"
    base_light["description"] = "Light theme with blue accent colors"
    base_light["mode"] = ThemeMode.LIGHT_BLUE.value
    
    # Blue theme overrides
    base_light["colors"].update({
        "primary": "#1976d2",
        "secondary": "#03a9f4",
        "accent": "#2196f3",
        "info": "#2196f3"
    })
    
    return base_light