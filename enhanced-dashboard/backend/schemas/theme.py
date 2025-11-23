"""
Theme Management Schemas
Phase 5: Theme System & Admin Controls

Pydantic schemas for theme system API validation and serialization.
"""

from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum

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

class ThemeBase(BaseModel):
    """Base theme schema with common fields"""
    name: str = Field(..., max_length=100, description="Theme name")
    description: Optional[str] = Field(None, description="Theme description")
    mode: ThemeMode = Field(..., description="Theme mode")
    type: ThemeType = Field(..., description="Theme type")
    
    class Config:
        use_enum_values = True

class ThemeCreate(ThemeBase):
    """Schema for creating a new theme"""
    colors: Dict[str, str] = Field(
        default_factory=dict, 
        description="Theme color variables"
    )
    variables: Dict[str, str] = Field(
        default_factory=dict, 
        description="CSS custom properties"
    )
    typography: Dict[str, str] = Field(
        default_factory=dict, 
        description="Typography settings"
    )
    is_active: bool = Field(True, description="Whether theme is active")
    is_default: bool = Field(False, description="Whether theme is default")
    organization_id: Optional[int] = Field(None, description="Organization ID")

class ThemeUpdate(BaseModel):
    """Schema for updating an existing theme"""
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    colors: Optional[Dict[str, str]] = None
    variables: Optional[Dict[str, str]] = None
    typography: Optional[Dict[str, str]] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None

class ThemeResponse(BaseModel):
    """Schema for theme API responses"""
    id: int
    name: str
    description: Optional[str]
    mode: str
    type: str
    colors: Dict[str, str]
    variables: Dict[str, str]
    typography: Dict[str, str]
    is_active: bool
    is_default: bool
    is_public: bool
    organization_id: Optional[int]
    created_by: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    css_variables: Optional[Dict[str, str]] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, theme):
        """Create response from ORM model"""
        return cls(
            id=theme.id,
            name=theme.name,
            description=theme.description,
            mode=theme.mode,
            type=theme.type,
            colors=theme.colors,
            variables=theme.variables,
            typography=theme.typography,
            is_active=theme.is_active,
            is_default=theme.is_default,
            is_public=theme.is_public,
            organization_id=theme.organization_id,
            created_by=theme.created_by,
            created_at=theme.created_at,
            updated_at=theme.updated_at
        )

class ThemeListResponse(BaseModel):
    """Schema for theme list responses"""
    themes: List[ThemeResponse]
    total: int
    filters: Dict[str, Any]

class ThemeCustomizationBase(BaseModel):
    """Base theme customization schema"""
    name: str = Field(..., max_length=100, description="Customization name")
    description: Optional[str] = Field(None, description="Customization description")

class ThemeCustomizationCreate(ThemeCustomizationBase):
    """Schema for creating theme customization"""
    base_theme_id: int = Field(..., description="Base theme ID")
    custom_colors: Optional[Dict[str, str]] = Field(
        default_factory=dict,
        description="Custom color overrides"
    )
    custom_variables: Optional[Dict[str, str]] = Field(
        default_factory=dict,
        description="Custom CSS variables"
    )
    custom_typography: Optional[Dict[str, str]] = Field(
        default_factory=dict,
        description="Custom typography settings"
    )
    preview_url: Optional[str] = Field(None, max_length=500, description="Preview image URL")
    screenshot_url: Optional[str] = Field(None, max_length=500, description="Screenshot URL")
    is_active: bool = Field(True, description="Whether customization is active")
    is_public: bool = Field(False, description="Whether customization is public")
    organization_id: Optional[int] = Field(None, description="Organization ID")

class ThemeCustomizationUpdate(BaseModel):
    """Schema for updating theme customization"""
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    custom_colors: Optional[Dict[str, str]] = None
    custom_variables: Optional[Dict[str, str]] = None
    custom_typography: Optional[Dict[str, str]] = None
    preview_url: Optional[str] = Field(None, max_length=500)
    screenshot_url: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None
    is_public: Optional[bool] = None

class ThemeCustomizationResponse(BaseModel):
    """Schema for theme customization responses"""
    id: int
    name: str
    description: Optional[str]
    base_theme_id: int
    custom_colors: Dict[str, str]
    custom_variables: Dict[str, str]
    custom_typography: Dict[str, str]
    preview_url: Optional[str]
    screenshot_url: Optional[str]
    is_active: bool
    is_public: bool
    organization_id: Optional[int]
    created_by: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    merged_config: Dict[str, Any]

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, customization):
        """Create response from ORM model"""
        return cls(
            id=customization.id,
            name=customization.name,
            description=customization.description,
            base_theme_id=customization.base_theme_id,
            custom_colors=customization.custom_colors,
            custom_variables=customization.custom_variables,
            custom_typography=customization.custom_typography,
            preview_url=customization.preview_url,
            screenshot_url=customization.screenshot_url,
            is_active=customization.is_active,
            is_public=customization.is_public,
            organization_id=customization.organization_id,
            created_by=customization.created_by,
            created_at=customization.created_at,
            updated_at=customization.updated_at,
            merged_config=customization.get_merged_config()
        )

class ThemeAnalyticsResponse(BaseModel):
    """Schema for theme analytics responses"""
    id: int
    theme_id: int
    user_id: int
    organization_id: int
    session_duration_minutes: int
    views_count: int
    interactions_count: int
    rating: Optional[float]
    feedback_text: Optional[str]
    first_used_at: Optional[datetime]
    last_used_at: Optional[datetime]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, analytics):
        """Create response from ORM model"""
        return cls(
            id=analytics.id,
            theme_id=analytics.theme_id,
            user_id=analytics.user_id,
            organization_id=analytics.organization_id,
            session_duration_minutes=analytics.session_duration_minutes,
            views_count=analytics.views_count,
            interactions_count=analytics.interactions_count,
            rating=analytics.rating,
            feedback_text=analytics.feedback_text,
            first_used_at=analytics.first_used_at,
            last_used_at=analytics.last_used_at,
            created_at=analytics.created_at
        )

class ThemeModeRequest(BaseModel):
    """Schema for theme mode change requests"""
    mode: ThemeMode = Field(..., description="New theme mode")
    save_preference: bool = Field(True, description="Save as user preference")

class ThemeCSSVariablesResponse(BaseModel):
    """Schema for CSS variables response"""
    theme_id: int
    mode: str
    css_variables: Dict[str, str]
    generated_at: str

class ThemeValidationRequest(BaseModel):
    """Schema for theme validation requests"""
    colors: Optional[Dict[str, str]] = Field(None, description="Colors to validate")
    variables: Optional[Dict[str, str]] = Field(None, description="CSS variables to validate")
    typography: Optional[Dict[str, str]] = Field(None, description="Typography to validate")

class ThemeValidationResponse(BaseModel):
    """Schema for theme validation responses"""
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    suggestions: List[str]

class ThemePreviewRequest(BaseModel):
    """Schema for theme preview requests"""
    colors: Optional[Dict[str, str]] = None
    variables: Optional[Dict[str, str]] = None
    typography: Optional[Dict[str, str]] = None
    mode: Optional[ThemeMode] = None
    include_samples: bool = Field(True, description="Include sample components")

class ThemeComparisonRequest(BaseModel):
    """Schema for theme comparison requests"""
    theme_ids: List[int] = Field(..., min_items=2, max_items=5, description="Theme IDs to compare")
    mode: Optional[ThemeMode] = None
    include_metrics: bool = Field(True, description="Include usage metrics")

class ThemeComparisonResponse(BaseModel):
    """Schema for theme comparison responses"""
    themes: List[Dict[str, Any]]
    comparison_matrix: Dict[str, Dict[str, Any]]
    recommendations: List[str]

class ThemeImportRequest(BaseModel):
    """Schema for theme import requests"""
    theme_data: Dict[str, Any] = Field(..., description="Theme configuration data")
    import_as_custom: bool = Field(True, description="Import as custom theme")
    organization_id: Optional[int] = Field(None, description="Target organization")
    overwrite_existing: bool = Field(False, description="Overwrite existing theme with same name")

class ThemeExportRequest(BaseModel):
    """Schema for theme export requests"""
    theme_id: int
    format: str = Field("json", regex="^(json|css)$", description="Export format")
    include_analytics: bool = Field(False, description="Include usage analytics")
    include_customizations: bool = Field(True, description="Include associated customizations")

class BulkThemeOperation(BaseModel):
    """Schema for bulk theme operations"""
    theme_ids: List[int] = Field(..., min_items=1, max_items=50, description="Theme IDs")
    operation: str = Field(..., regex="^(activate|deactivate|delete|export)$", description="Operation to perform")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Operation parameters")

class BulkThemeOperationResponse(BaseModel):
    """Schema for bulk operation responses"""
    success_count: int
    failed_count: int
    errors: List[str]
    processed_themes: List[int]

# Theme Template Schemas

class ThemeTemplate(BaseModel):
    """Schema for theme templates"""
    name: str
    description: str
    mode: ThemeMode
    colors: Dict[str, str]
    variables: Dict[str, str]
    typography: Dict[str, str]
    preview_url: Optional[str] = None

class CreateThemeFromTemplate(BaseModel):
    """Schema for creating theme from template"""
    template_name: str = Field(..., description="Template name")
    customizations: Optional[Dict[str, Any]] = Field(None, description="Template customizations")
    name: Optional[str] = Field(None, description="Custom theme name")
    description: Optional[str] = Field(None, description="Custom theme description")
    organization_id: Optional[int] = Field(None, description="Target organization")

class ThemeAnalyticsSummary(BaseModel):
    """Schema for theme analytics summary"""
    total_themes: int
    active_themes: int
    most_used_theme: Optional[str]
    usage_distribution: Dict[str, int]
    average_session_duration: float
    total_views: int
    user_ratings: Dict[str, float]

class ThemeUsageMetrics(BaseModel):
    """Schema for theme usage metrics"""
    theme_id: int
    usage_count: int
    unique_users: int
    average_session_duration: float
    bounce_rate: float
    conversion_rate: Optional[float]
    last_used: Optional[datetime]
    trend: str = Field(..., regex="^(up|down|stable)$")

# Validation helpers

class ThemeColorValidator(BaseModel):
    """Helper for validating theme colors"""
    @validator('colors')
    def validate_colors(cls, v):
        """Validate color values"""
        if not v:
            return v
        
        errors = []
        valid_formats = [
            r'^#[0-9A-Fa-f]{3,8}$',  # Hex colors
            r'^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$',  # RGB
            r'^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$',  # RGBA
            r'^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$',  # HSL
            r'^[a-zA-Z]+$'  # Named colors
        ]
        
        import re
        for color_name, color_value in v.items():
            is_valid = any(re.match(pattern, color_value) for pattern in valid_formats)
            if not is_valid:
                errors.append(f"Invalid color format for {color_name}: {color_value}")
        
        if errors:
            raise ValueError("Color validation failed: " + "; ".join(errors))
        
        return v

    class Config:
        # Allow extra fields for forward compatibility
        extra = "allow"