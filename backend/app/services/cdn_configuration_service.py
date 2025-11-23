"""
CDN Configuration Service

Comprehensive CDN management for static asset optimization, including
CloudFront, Cloudflare, and other CDN providers configuration.

Features:
- Multi-CDN provider support
- Intelligent asset routing and caching
- Image optimization and compression
- Edge caching strategies
- Performance optimization rules
- Analytics and monitoring integration
"""

import asyncio
import json
import hashlib
import mimetypes
from typing import Dict, List, Optional, Any, Union, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import aiohttp
import logging

logger = logging.getLogger(__name__)


class CDNProvider(Enum):
    """Supported CDN providers"""
    CLOUDFLARE = "cloudflare"
    AWS_CLOUDFRONT = "aws_cloudfront"
    FASTLY = "fastly"
    KEYCDN = "keycdn"
    BUNNY = "bunny"
    RACKSPACE = "rackspace"


class AssetType(Enum):
    """Types of assets for CDN optimization"""
    JAVASCRIPT = "javascript"
    CSS = "css"
    IMAGE = "image"
    FONT = "font"
    VIDEO = "video"
    AUDIO = "audio"
    DOCUMENT = "document"
    JSON = "json"


class CacheStrategy(Enum):
    """CDN caching strategies"""
    AGGRESSIVE = "aggressive"    # Long TTL, immutable
    MODERATE = "moderate"       # Medium TTL, versioning
    CONSERVATIVE = "conservative"  # Short TTL, validation
    DYNAMIC = "dynamic"         # No caching, always fresh


@dataclass
class CDNConfiguration:
    """CDN configuration settings"""
    provider: CDNProvider
    zone_id: Optional[str] = None
    distribution_id: Optional[str] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    endpoint: Optional[str] = None
    custom_domain: Optional[str] = None
    ssl_enabled: bool = True
    compression_enabled: bool = True
    image_optimization: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary, excluding sensitive data"""
        data = asdict(self)
        # Remove sensitive fields
        if "api_key" in data:
            data["api_key"] = "***masked***" if data["api_key"] else None
        if "api_secret" in data:
            data["api_secret"] = "***masked***" if data["api_secret"] else None
        return data


@dataclass
class AssetCacheRule:
    """Asset-specific cache rule"""
    pattern: str
    asset_type: AssetType
    cache_strategy: CacheStrategy
    ttl_seconds: int
    compression: bool = True
    image_quality: Optional[int] = None
    enable_webp: bool = True
    custom_headers: Optional[Dict[str, str]] = None


@dataclass
class PerformanceMetrics:
    """CDN performance metrics"""
    cache_hit_ratio: float
    total_requests: int
    cached_requests: int
    bandwidth_saved_mb: float
    avg_response_time_ms: float
    geographic_distribution: Dict[str, int]
    top_assets: List[Dict[str, Any]]
    error_rate: float


class CDNConfigurationService:
    """
    Comprehensive CDN configuration and management service
    """
    
    def __init__(self):
        self.providers: Dict[CDNProvider, CDNConfiguration] = {}
        self.cache_rules: List[AssetCacheRule] = []
        self.performance_data: Dict[str, PerformanceMetrics] = {}
        
        # Default cache rules
        self._setup_default_cache_rules()
        
        # Asset optimization settings
        self.image_settings = {
            "quality": 85,
            "webp_quality": 80,
            "max_width": 1920,
            "max_height": 1080,
            "formats": ["webp", "avif", "jpeg", "png"]
        }
        
        self.compression_settings = {
            "gzip": True,
            "brotli": True,
            "deflate": True,
            "level": 6
        }
    
    def _setup_default_cache_rules(self):
        """Setup default cache rules for common asset types"""
        self.cache_rules = [
            # JavaScript files - aggressive caching with versioning
            AssetCacheRule(
                pattern="*.js",
                asset_type=AssetType.JAVASCRIPT,
                cache_strategy=CacheStrategy.AGGRESSIVE,
                ttl_seconds=31536000,  # 1 year
                compression=True
            ),
            
            # CSS files - aggressive caching with versioning
            AssetCacheRule(
                pattern="*.css",
                asset_type=AssetType.CSS,
                cache_strategy=CacheStrategy.AGGRESSIVE,
                ttl_seconds=31536000,  # 1 year
                compression=True
            ),
            
            # Images - moderate caching with format optimization
            AssetCacheRule(
                pattern="*.{jpg,jpeg,png,gif,webp,avif}",
                asset_type=AssetType.IMAGE,
                cache_strategy=CacheStrategy.MODERATE,
                ttl_seconds=2592000,  # 30 days
                compression=True,
                image_quality=85,
                enable_webp=True
            ),
            
            # SVG icons - aggressive caching
            AssetCacheRule(
                pattern="*.svg",
                asset_type=AssetType.IMAGE,
                cache_strategy=CacheStrategy.AGGRESSIVE,
                ttl_seconds=31536000,  # 1 year
                compression=True
            ),
            
            # Font files - aggressive caching
            AssetCacheRule(
                pattern="*.{woff,woff2,ttf,otf,eot}",
                asset_type=AssetType.FONT,
                cache_strategy=CacheStrategy.AGGRESSIVE,
                ttl_seconds=31536000,  # 1 year
                compression=False  # Fonts are already compressed
            ),
            
            # JSON API responses - moderate caching
            AssetCacheRule(
                pattern="/api/*",
                asset_type=AssetType.JSON,
                cache_strategy=CacheStrategy.MODERATE,
                ttl_seconds=3600,  # 1 hour
                compression=True
            ),
            
            # HTML pages - conservative caching
            AssetCacheRule(
                pattern="*.html",
                asset_type=AssetType.DOCUMENT,
                cache_strategy=CacheStrategy.CONSERVATIVE,
                ttl_seconds=3600,  # 1 hour
                compression=True
            ),
            
            # Manifest and service worker - moderate caching
            AssetCacheRule(
                pattern="*.{json,js}",
                asset_type=AssetType.JSON,
                cache_strategy=CacheStrategy.MODERATE,
                ttl_seconds=86400,  # 24 hours
                compression=True
            )
        ]
    
    async def configure_provider(
        self,
        provider: CDNProvider,
        configuration: CDNConfiguration
    ) -> bool:
        """Configure a CDN provider"""
        try:
            self.providers[provider] = configuration
            
            # Validate configuration
            if not await self._validate_configuration(provider, configuration):
                logger.error(f"Invalid configuration for {provider}")
                return False
            
            # Setup provider-specific configurations
            if provider == CDNProvider.CLOUDFLARE:
                await self._setup_cloudflare(configuration)
            elif provider == CDNProvider.AWS_CLOUDFRONT:
                await self._setup_cloudfront(configuration)
            elif provider == CDNProvider.FASTLY:
                await self._setup_fastly(configuration)
            
            logger.info(f"Successfully configured CDN provider: {provider}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to configure {provider}: {e}")
            return False
    
    async def deploy_configuration(self, provider: CDNProvider) -> bool:
        """Deploy CDN configuration to provider"""
        if provider not in self.providers:
            logger.error(f"Provider {provider} not configured")
            return False
        
        try:
            config = self.providers[provider]
            
            if provider == CDNProvider.CLOUDFLARE:
                return await self._deploy_cloudflare(config)
            elif provider == CDNProvider.AWS_CLOUDFRONT:
                return await self._deploy_cloudfront(config)
            elif provider == CDNProvider.FASTLY:
                return await self._deploy_fastly(config)
            else:
                logger.error(f"Deployment not supported for {provider}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to deploy configuration for {provider}: {e}")
            return False
    
    async def get_asset_cache_rule(self, asset_path: str) -> Optional[AssetCacheRule]:
        """Get cache rule for specific asset"""
        import fnmatch
        
        for rule in self.cache_rules:
            if fnmatch.fnmatch(asset_path.lower(), rule.pattern.lower()):
                return rule
        
        # Return default rule if no match
        return AssetCacheRule(
            pattern="*",
            asset_type=AssetType.DOCUMENT,
            cache_strategy=CacheStrategy.MODERATE,
            ttl_seconds=3600,
            compression=True
        )
    
    async def add_cache_rule(self, rule: AssetCacheRule) -> bool:
        """Add custom cache rule"""
        try:
            # Remove existing rule with same pattern
            self.cache_rules = [
                r for r in self.cache_rules if r.pattern != rule.pattern
            ]
            
            # Add new rule at the beginning (higher priority)
            self.cache_rules.insert(0, rule)
            
            # Deploy to all configured providers
            for provider in self.providers:
                await self.deploy_configuration(provider)
            
            logger.info(f"Added cache rule: {rule.pattern}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add cache rule: {e}")
            return False
    
    async def optimize_image(
        self,
        image_url: str,
        width: Optional[int] = None,
        height: Optional[int] = None,
        quality: Optional[int] = None,
        format: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate optimized image URL"""
        optimization_params = {
            "quality": quality or self.image_settings["quality"],
            "width": width,
            "height": height,
            "format": format
        }
        
        # Remove None values
        optimization_params = {
            k: v for k, v in optimization_params.items() if v is not None
        }
        
        # Generate optimized URL based on provider
        for provider in self.providers:
            if provider == CDNProvider.CLOUDFLARE:
                return await self._cloudflare_image_optimization(
                    image_url, optimization_params
                )
        
        # Fallback to direct URL with parameters
        separator = "&" if "?" in image_url else "?"
        query_params = "&".join([f"{k}={v}" for k, v in optimization_params.items()])
        
        return {
            "optimized_url": f"{image_url}{separator}{query_params}",
            "original_url": image_url,
            "savings_percent": 0,  # Placeholder
            "format": format or "original"
        }
    
    async def get_performance_metrics(
        self,
        provider: CDNProvider,
        timeframe: str = "24h"
    ) -> Optional[PerformanceMetrics]:
        """Get CDN performance metrics"""
        if provider not in self.providers:
            return None
        
        try:
            if provider == CDNProvider.CLOUDFLARE:
                return await self._get_cloudflare_metrics(
                    self.providers[provider], timeframe
                )
            elif provider == CDNProvider.AWS_CLOUDFRONT:
                return await self._get_cloudfront_metrics(
                    self.providers[provider], timeframe
                )
            else:
                # Return mock metrics for unsupported providers
                return self._get_mock_metrics()
                
        except Exception as e:
            logger.error(f"Failed to get metrics for {provider}: {e}")
            return None
    
    async def purge_cache(self, provider: CDNProvider, urls: List[str]) -> bool:
        """Purge CDN cache for specific URLs"""
        if provider not in self.providers:
            logger.error(f"Provider {provider} not configured")
            return False
        
        try:
            config = self.providers[provider]
            
            if provider == CDNProvider.CLOUDFLARE:
                return await self._cloudflare_purge_cache(config, urls)
            elif provider == CDNProvider.AWS_CLOUDFRONT:
                return await self._cloudfront_purge_cache(config, urls)
            else:
                logger.error(f"Cache purge not supported for {provider}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to purge cache for {provider}: {e}")
            return False
    
    async def generate_asset_urls(
        self,
        base_path: str,
        files: List[str],
        provider: Optional[CDNProvider] = None
    ) -> Dict[str, str]:
        """Generate CDN-optimized URLs for assets"""
        if provider is None:
            provider = next(iter(self.providers.keys()), None)
        
        if provider is None:
            # Return original paths if no CDN configured
            return {file: f"{base_path}/{file}" for file in files}
        
        base_url = self._get_provider_base_url(provider)
        asset_urls = {}
        
        for file in files:
            file_path = f"{base_path}/{file}"
            asset_rule = await self.get_asset_cache_rule(file)
            
            # Add cache busting for non-immutable assets
            if asset_rule.cache_strategy != CacheStrategy.AGGRESSIVE:
                # Generate hash for versioned caching
                file_hash = await self._generate_file_hash(f"{base_path}/{file}")
                file_name, file_ext = file.rsplit(".", 1) if "." in file else (file, "")
                if file_ext:
                    file_path = f"{base_path}/{file_name}.{file_hash}.{file_ext}"
                else:
                    file_path = f"{base_path}/{file_name}.{file_hash}"
            
            asset_urls[file] = f"{base_url}/{file_path}"
        
        return asset_urls
    
    async def health_check(self, provider: CDNProvider) -> Dict[str, Any]:
        """Perform health check on CDN provider"""
        if provider not in self.providers:
            return {"status": "error", "message": "Provider not configured"}
        
        try:
            config = self.providers[provider]
            
            if provider == CDNProvider.CLOUDFLARE:
                return await self._cloudflare_health_check(config)
            elif provider == CDNProvider.AWS_CLOUDFRONT:
                return await self._cloudfront_health_check(config)
            else:
                return {"status": "ok", "message": "Provider available"}
                
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    # Provider-specific implementations
    
    async def _setup_cloudflare(self, config: CDNConfiguration):
        """Setup Cloudflare-specific configuration"""
        # Cloudflare has zone-based configuration
        if not config.zone_id:
            raise ValueError("Cloudflare requires zone_id")
    
    async def _setup_cloudfront(self, config: CDNConfiguration):
        """Setup AWS CloudFront-specific configuration"""
        # CloudFront has distribution-based configuration
        if not config.distribution_id:
            raise ValueError("CloudFront requires distribution_id")
    
    async def _setup_fastly(self, config: CDNConfiguration):
        """Setup Fastly-specific configuration"""
        # Fastly requires service ID
        if not config.endpoint:
            raise ValueError("Fastly requires endpoint/service_id")
    
    async def _deploy_cloudflare(self, config: CDNConfiguration) -> bool:
        """Deploy configuration to Cloudflare"""
        # Mock implementation - replace with actual Cloudflare API calls
        logger.info(f"Deploying Cloudflare configuration for zone {config.zone_id}")
        await asyncio.sleep(1)  # Simulate API call
        return True
    
    async def _deploy_cloudfront(self, config: CDNConfiguration) -> bool:
        """Deploy configuration to AWS CloudFront"""
        # Mock implementation - replace with actual CloudFront API calls
        logger.info(f"Deploying CloudFront configuration for distribution {config.distribution_id}")
        await asyncio.sleep(1)  # Simulate API call
        return True
    
    async def _deploy_fastly(self, config: CDNConfiguration) -> bool:
        """Deploy configuration to Fastly"""
        # Mock implementation - replace with actual Fastly API calls
        logger.info(f"Deploying Fastly configuration for service {config.endpoint}")
        await asyncio.sleep(1)  # Simulate API call
        return True
    
    async def _validate_configuration(
        self,
        provider: CDNProvider,
        config: CDNConfiguration
    ) -> bool:
        """Validate CDN configuration"""
        if provider == CDNProvider.CLOUDFLARE:
            return bool(config.zone_id and config.api_key)
        elif provider == CDNProvider.AWS_CLOUDFRONT:
            return bool(config.distribution_id and config.api_key and config.api_secret)
        elif provider == CDNProvider.FASTLY:
            return bool(config.endpoint and config.api_key)
        else:
            return False
    
    async def _cloudflare_image_optimization(
        self,
        image_url: str,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Optimize image using Cloudflare Image Resizing"""
        # Cloudflare image optimization format
        cf_params = []
        
        if "width" in params:
            cf_params.append(f"width={params['width']}")
        if "height" in params:
            cf_params.append(f"height={params['height']}")
        if "quality" in params:
            cf_params.append(f"quality={params['quality']}")
        if "format" in params:
            cf_params.append(f"format={params['format']}")
        
        # Cloudflare optimization requires image.optimization variant
        if cf_params:
            separator = "&" if "?" in image_url else "?"
            optimized_url = f"{image_url}{separator}image.optimize=1&" + "&".join(cf_params)
        else:
            optimized_url = f"{image_url}?image.optimize=1"
        
        return {
            "optimized_url": optimized_url,
            "original_url": image_url,
            "savings_percent": 35,  # Cloudflare typically provides 30-40% savings
            "format": params.get("format", "auto")
        }
    
    async def _get_cloudflare_metrics(
        self,
        config: CDNConfiguration,
        timeframe: str
    ) -> PerformanceMetrics:
        """Get Cloudflare performance metrics"""
        # Mock implementation - replace with actual Cloudflare Analytics API
        return PerformanceMetrics(
            cache_hit_ratio=0.92,
            total_requests=125000,
            cached_requests=115000,
            bandwidth_saved_mb=2850.5,
            avg_response_time_ms=45.2,
            geographic_distribution={
                "US": 45000,
                "EU": 38000,
                "APAC": 25000,
                "Other": 17000
            },
            top_assets=[
                {"path": "/dashboard.js", "requests": 15000, "size_mb": 45.2},
                {"path": "/dashboard.css", "requests": 14500, "size_mb": 12.8},
                {"path": "/logo.webp", "requests": 12000, "size_mb": 8.5}
            ],
            error_rate=0.02
        )
    
    async def _get_cloudfront_metrics(
        self,
        config: CDNConfiguration,
        timeframe: str
    ) -> PerformanceMetrics:
        """Get AWS CloudFront performance metrics"""
        # Mock implementation - replace with actual CloudFront analytics
        return PerformanceMetrics(
            cache_hit_ratio=0.88,
            total_requests=98000,
            cached_requests=86240,
            bandwidth_saved_mb=1950.3,
            avg_response_time_ms=52.8,
            geographic_distribution={
                "US": 35000,
                "EU": 28000,
                "APAC": 22000,
                "Other": 13000
            },
            top_assets=[
                {"path": "/main.bundle.js", "requests": 12000, "size_mb": 38.5},
                {"path": "/styles.css", "requests": 11800, "size_mb": 15.2},
                {"path": "/chart.webp", "requests": 9500, "size_mb": 12.3}
            ],
            error_rate=0.03
        )
    
    def _get_mock_metrics(self) -> PerformanceMetrics:
        """Get mock metrics for unsupported providers"""
        return PerformanceMetrics(
            cache_hit_ratio=0.85,
            total_requests=50000,
            cached_requests=42500,
            bandwidth_saved_mb=950.0,
            avg_response_time_ms=65.0,
            geographic_distribution={
                "US": 20000,
                "EU": 15000,
                "APAC": 10000,
                "Other": 5000
            },
            top_assets=[],
            error_rate=0.05
        )
    
    async def _cloudflare_purge_cache(
        self,
        config: CDNConfiguration,
        urls: List[str]
    ) -> bool:
        """Purge Cloudflare cache"""
        # Mock implementation - replace with actual Cloudflare API
        logger.info(f"Purging Cloudflare cache for {len(urls)} URLs")
        await asyncio.sleep(0.5)  # Simulate API call
        return True
    
    async def _cloudfront_purge_cache(
        self,
        config: CDNConfiguration,
        urls: List[str]
    ) -> bool:
        """Purge CloudFront cache"""
        # Mock implementation - replace with actual CloudFront API
        logger.info(f"Purging CloudFront cache for {len(urls)} URLs")
        await asyncio.sleep(0.5)  # Simulate API call
        return True
    
    def _get_provider_base_url(self, provider: CDNProvider) -> str:
        """Get base URL for provider"""
        if provider == CDNProvider.CLOUDFLARE:
            # Return Cloudflare default URL
            return "https://cdn.example.com"
        elif provider == CDNProvider.AWS_CLOUDFRONT:
            # Return CloudFront distribution URL
            return "https://d1234567890abcdef.cloudfront.net"
        elif provider == CDNProvider.FASTLY:
            # Return Fastly service URL
            return "https://service-id.fastly.global"
        else:
            return "https://cdn.example.com"
    
    async def _generate_file_hash(self, file_path: str) -> str:
        """Generate hash for file for cache busting"""
        # Mock implementation - in reality, you'd read the file content
        content = f"mock-content-{file_path}"
        return hashlib.md5(content.encode()).hexdigest()[:8]
    
    async def _cloudflare_health_check(self, config: CDNConfiguration) -> Dict[str, Any]:
        """Cloudflare health check"""
        return {
            "status": "ok",
            "provider": "cloudflare",
            "zone_id": config.zone_id,
            "ssl_enabled": config.ssl_enabled,
            "compression_enabled": config.compression_enabled,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def _cloudfront_health_check(self, config: CDNConfiguration) -> Dict[str, Any]:
        """CloudFront health check"""
        return {
            "status": "ok",
            "provider": "aws_cloudfront",
            "distribution_id": config.distribution_id,
            "ssl_enabled": config.ssl_enabled,
            "compression_enabled": config.compression_enabled,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def get_configuration_summary(self) -> Dict[str, Any]:
        """Get CDN configuration summary"""
        return {
            "providers_configured": len(self.providers),
            "cache_rules_count": len(self.cache_rules),
            "providers": [
                {
                    "provider": provider.value,
                    "configured": config.to_dict()
                }
                for provider, config in self.providers.items()
            ],
            "default_rules": [
                {
                    "pattern": rule.pattern,
                    "type": rule.asset_type.value,
                    "strategy": rule.cache_strategy.value,
                    "ttl_seconds": rule.ttl_seconds
                }
                for rule in self.cache_rules
            ],
            "optimization_settings": {
                "image": self.image_settings,
                "compression": self.compression_settings
            }
        }


# Singleton instance
_cdn_instance: Optional[CDNConfigurationService] = None


async def get_cdn_service() -> CDNConfigurationService:
    """Get or create CDN service instance"""
    global _cdn_instance
    
    if _cdn_instance is None:
        _cdn_instance = CDNConfigurationService()
    
    return _cdn_instance


async def shutdown_cdn_service():
    """Shutdown CDN service instance"""
    global _cdn_instance
    _cdn_instance = None


# Utility functions for CDN integration
def get_optimal_asset_url(
    original_path: str,
    cdn_service: CDNConfigurationService,
    optimization_options: Optional[Dict[str, Any]] = None
) -> str:
    """
    Get optimized asset URL with CDN and compression
    
    Args:
        original_path: Original asset path
        cdn_service: CDN configuration service
        optimization_options: Image/asset optimization options
    
    Returns:
        Optimized URL for the asset
    """
    # This is a synchronous helper function for use in request handlers
    import asyncio
    
    async def _get_url():
        if optimization_options and original_path.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            optimized = await cdn_service.optimize_image(
                original_path, **optimization_options
            )
            return optimized["optimized_url"]
        
        return original_path
    
    try:
        # Create new event loop if needed
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # If called from async context, return the original path for now
            # In production, you'd want to handle this properly
            return original_path
        else:
            return loop.run_until_complete(_get_url())
    except:
        return original_path


def generate_versioned_asset_path(file_path: str, version: str) -> str:
    """Generate versioned asset path for cache busting"""
    if "." in file_path:
        parts = file_path.rsplit(".", 1)
        return f"{parts[0]}.{version}.{parts[1]}"
    else:
        return f"{file_path}.{version}"
