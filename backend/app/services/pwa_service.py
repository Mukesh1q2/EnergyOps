"""
Progressive Web App (PWA) Service

Comprehensive PWA implementation with offline capabilities, service worker management,
app manifest generation, and mobile-optimized features.

Features:
- Service worker registration and lifecycle management
- App manifest generation and optimization
- Offline data caching and sync strategies
- Push notification support
- Background sync capabilities
- Mobile-first responsive design
- App installation prompts
"""

import asyncio
import json
import hashlib
import base64
from typing import Dict, List, Optional, Any, Union, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class CacheStrategy(Enum):
    """Offline cache strategies"""
    CACHE_FIRST = "cache_first"
    NETWORK_FIRST = "network_first"
    STALE_WHILE_REVALIDATE = "stale_while_revalidate"
    NETWORK_ONLY = "network_only"
    CACHE_ONLY = "cache_only"


class NotificationType(Enum):
    """Types of push notifications"""
    MARKET_ALERT = "market_alert"
    SYSTEM_NOTIFICATION = "system_notification"
    DATA_UPDATE = "data_update"
    ERROR_ALERT = "error_alert"


@dataclass
class PWAManifest:
    """PWA manifest configuration"""
    name: str
    short_name: str
    description: str
    start_url: str
    scope: str
    display: str = "standalone"
    orientation: str = "any"
    theme_color: str = "#0b6cff"
    background_color: str = "#ffffff"
    icons: List[Dict[str, str]] = None
    categories: List[str] = None
    screenshots: List[Dict[str, str]] = None
    shortcuts: List[Dict[str, Any]] = None
    related_applications: List[Dict[str, str]] = None
    prefer_related_applications: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to manifest dictionary"""
        data = asdict(self)
        # Remove None values
        return {k: v for k, v in data.items() if v is not None}


@dataclass
class ServiceWorkerConfig:
    """Service worker configuration"""
    cache_name: str
    cache_version: str
    offline_page: str = "/offline"
    cache_strategies: Dict[str, CacheStrategy] = None
    background_sync: List[str] = None
    push_notifications: bool = True
    update_available_message: str = "A new version is available!"
    
    def __post_init__(self):
        if self.cache_strategies is None:
            self.cache_strategies = {}
        if self.background_sync is None:
            self.background_sync = []


@dataclass
class OfflineResource:
    """Offline resource definition"""
    url: str
    cache_strategy: CacheStrategy
    priority: int = 1  # 1=high, 2=medium, 3=low
    cache_key: Optional[str] = None
    headers: Optional[Dict[str, str]] = None
    max_age_seconds: Optional[int] = None


class PWAService:
    """
    Progressive Web App service for mobile optimization and offline functionality
    """
    
    def __init__(self):
        self.manifest: Optional[PWAManifest] = None
        self.service_worker_config: Optional[ServiceWorkerConfig] = None
        self.offline_resources: List[OfflineResource] = []
        self.cache_manifest: Dict[str, Any] = {}
        
        # PWA features
        self.push_notification_config: Dict[str, Any] = {}
        self.background_sync_config: Dict[str, Any] = {}
        
        # Setup default configurations
        self._setup_default_config()
        
        # Initialize offline resource list
        self._setup_offline_resources()
    
    def _setup_default_config(self):
        """Setup default PWA configuration"""
        self.manifest = PWAManifest(
            name="OptiBid Energy - Energy Trading Dashboard",
            short_name="OptiBid",
            description="Real-time energy trading and market analysis platform",
            start_url="/",
            scope="/",
            theme_color="#0b6cff",
            background_color="#ffffff",
            categories=["business", "finance", "productivity"],
            icons=[
                {
                    "src": "/icons/icon-72x72.png",
                    "sizes": "72x72",
                    "type": "image/png",
                    "purpose": "any maskable"
                },
                {
                    "src": "/icons/icon-96x96.png",
                    "sizes": "96x96",
                    "type": "image/png",
                    "purpose": "any maskable"
                },
                {
                    "src": "/icons/icon-128x128.png",
                    "sizes": "128x128",
                    "type": "image/png",
                    "purpose": "any maskable"
                },
                {
                    "src": "/icons/icon-144x144.png",
                    "sizes": "144x144",
                    "type": "image/png",
                    "purpose": "any maskable"
                },
                {
                    "src": "/icons/icon-152x152.png",
                    "sizes": "152x152",
                    "type": "image/png",
                    "purpose": "any maskable"
                },
                {
                    "src": "/icons/icon-192x192.png",
                    "sizes": "192x192",
                    "type": "image/png",
                    "purpose": "any maskable"
                },
                {
                    "src": "/icons/icon-384x384.png",
                    "sizes": "384x384",
                    "type": "image/png",
                    "purpose": "any maskable"
                },
                {
                    "src": "/icons/icon-512x512.png",
                    "sizes": "512x512",
                    "type": "image/png",
                    "purpose": "any maskable"
                }
            ],
            screenshots=[
                {
                    "src": "/screenshots/desktop-home.png",
                    "sizes": "1280x720",
                    "type": "image/png",
                    "form_factor": "wide",
                    "label": "OptiBid Energy Dashboard on Desktop"
                },
                {
                    "src": "/screenshots/mobile-home.png",
                    "sizes": "375x812",
                    "type": "image/png",
                    "form_factor": "narrow",
                    "label": "OptiBid Energy Dashboard on Mobile"
                }
            ],
            shortcuts=[
                {
                    "name": "Market Overview",
                    "short_name": "Market",
                    "description": "View current market prices",
                    "url": "/market",
                    "icons": [{"src": "/icons/shortcut-market.png", "sizes": "96x96"}]
                },
                {
                    "name": "Dashboard",
                    "short_name": "Dashboard",
                    "description": "Main trading dashboard",
                    "url": "/dashboard",
                    "icons": [{"src": "/icons/shortcut-dashboard.png", "sizes": "96x96"}]
                },
                {
                    "name": "Analytics",
                    "short_name": "Analytics",
                    "description": "View market analytics",
                    "url": "/analytics",
                    "icons": [{"src": "/icons/shortcut-analytics.png", "sizes": "96x96"}]
                }
            ]
        )
        
        self.service_worker_config = ServiceWorkerConfig(
            cache_name="optibid-cache-v1",
            cache_version="1.0.0",
            offline_page="/offline",
            cache_strategies={
                # High priority cache strategies
                "/api/market/*": CacheStrategy.NETWORK_FIRST,
                "/api/dashboard/*": CacheStrategy.STALE_WHILE_REVALIDATE,
                "/api/analytics/*": CacheStrategy.NETWORK_FIRST,
                
                # Static assets
                "*.js": CacheStrategy.CACHE_FIRST,
                "*.css": CacheStrategy.CACHE_FIRST,
                "*.woff2": CacheStrategy.CACHE_FIRST,
                "*.woff": CacheStrategy.CACHE_FIRST,
                
                # Images
                "*.png": CacheStrategy.CACHE_FIRST,
                "*.jpg": CacheStrategy.CACHE_FIRST,
                "*.jpeg": CacheStrategy.CACHE_FIRST,
                "*.webp": CacheStrategy.CACHE_FIRST,
                "*.svg": CacheStrategy.CACHE_FIRST,
                
                # Documents
                "*.html": CacheStrategy.NETWORK_FIRST,
                "*.json": CacheStrategy.STALE_WHILE_REVALIDATE
            },
            background_sync=["market-data-sync", "user-preferences-sync"],
            push_notifications=True,
            update_available_message="A new version of OptiBid is available!"
        )
    
    def _setup_offline_resources(self):
        """Setup offline resource definitions"""
        self.offline_resources = [
            # High priority resources
            OfflineResource(
                url="/",
                cache_strategy=CacheStrategy.CACHE_FIRST,
                priority=1,
                cache_key="app-shell"
            ),
            OfflineResource(
                url="/offline",
                cache_strategy=CacheStrategy.CACHE_ONLY,
                priority=1
            ),
            OfflineResource(
                url="/dashboard",
                cache_strategy=CacheStrategy.STALE_WHILE_REVALIDATE,
                priority=1,
                cache_key="dashboard-layout"
            ),
            
            # API endpoints for offline functionality
            OfflineResource(
                url="/api/market/summary",
                cache_strategy=CacheStrategy.NETWORK_FIRST,
                priority=2,
                max_age_seconds=300  # 5 minutes
            ),
            OfflineResource(
                url="/api/market/zones",
                cache_strategy=CacheStrategy.STALE_WHILE_REVALIDATE,
                priority=2,
                max_age_seconds=3600  # 1 hour
            ),
            OfflineResource(
                url="/api/user/preferences",
                cache_strategy=CacheStrategy.CACHE_FIRST,
                priority=2,
                cache_key="user-preferences"
            ),
            
            # Static assets
            OfflineResource(
                url="/static/css/main.css",
                cache_strategy=CacheStrategy.CACHE_FIRST,
                priority=3,
                cache_key="main-styles"
            ),
            OfflineResource(
                url="/static/js/main.js",
                cache_strategy=CacheStrategy.CACHE_FIRST,
                priority=3,
                cache_key="main-scripts"
            ),
            OfflineResource(
                url="/static/fonts/inter.woff2",
                cache_strategy=CacheStrategy.CACHE_FIRST,
                priority=3,
                cache_key="inter-font"
            )
        ]
    
    async def generate_manifest(self) -> Dict[str, Any]:
        """Generate PWA manifest JSON"""
        if not self.manifest:
            raise ValueError("PWA manifest not configured")
        
        manifest = self.manifest.to_dict()
        
        # Add generated icons if not provided
        if not manifest.get("icons"):
            manifest["icons"] = self._generate_default_icons()
        
        # Ensure proper manifest format
        manifest.update({
            "lang": "en-US",
            "dir": "ltr",
            "id": "optibid-energy",
            "start_url": self.manifest.start_url,
            "scope": self.manifest.scope,
            "display": self.manifest.display,
            "orientation": self.manifest.orientation,
            "theme_color": self.manifest.theme_color,
            "background_color": self.manifest.background_color,
            "iarc_rating_id": "e77b9bd4-6d66-44ae-a72d-9e4d28b2d8e5"
        })
        
        return manifest
    
    async def generate_service_worker(self) -> str:
        """Generate service worker JavaScript code"""
        if not self.service_worker_config:
            raise ValueError("Service worker config not configured")
        
        sw_config = self.service_worker_config
        
        # Generate service worker code
        service_worker_code = f"""
// OptiBid Energy - Service Worker v{sw_config.cache_version}
// Generated automatically by PWA Service

const CACHE_NAME = '{sw_config.cache_name}';
const CACHE_VERSION = '{sw_config.cache_version}';
const OFFLINE_PAGE = '{sw_config.offline_page}';

// Cache strategies configuration
const CACHE_STRATEGIES = {json.dumps({k: v.value for k, v in sw_config.cache_strategies.items()})};

// Pre-cache offline resources
const OFFLINE_RESOURCES = {json.dumps([{
    'url': resource.url,
    'strategy': resource.cache_strategy.value,
    'priority': resource.priority,
    'cacheKey': resource.cache_key,
    'maxAge': resource.max_age_seconds
} for resource in self.offline_resources])};

// Installation event
self.addEventListener('install', (event) => {{
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {{
            // Cache app shell and critical resources
            return cache.addAll([
                '/',
                '/offline',
                '/dashboard',
                '/static/css/main.css',
                '/static/js/main.js'
            ]);
        }}).then(() => {{
            // Force activation of new service worker
            return self.skipWaiting();
        }})
    );
}});

// Activation event
self.addEventListener('activate', (event) => {{
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {{
            return Promise.all(
                cacheNames.map((cacheName) => {{
                    if (cacheName !== CACHE_NAME) {{
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }}
                }})
            );
        }}).then(() => {{
            // Take control of all pages
            return self.clients.claim();
        }})
    );
}});

// Fetch event handler
self.addEventListener('fetch', (event) => {{
    const request = event.request;
    const url = new URL(request.url);
    
    // Handle different request types
    if (request.method === 'GET') {{
        event.respondWith(handleGetRequest(request, url));
    }} else if (request.method === 'POST' && request.url.includes('/api/')) {{
        event.respondWith(handlePostRequest(request, url));
    }}
}});

// Handle GET requests with cache strategies
async function handleGetRequest(request, url) {{
    const cacheStrategy = getCacheStrategy(url.pathname);
    
    switch (cacheStrategy) {{
        case 'cache_first':
            return cacheFirst(request);
        case 'network_first':
            return networkFirst(request);
        case 'stale_while_revalidate':
            return staleWhileRevalidate(request);
        case 'network_only':
            return fetch(request);
        case 'cache_only':
            return caches.match(request);
        default:
            return fetch(request);
    }}
}}

// Handle POST requests with offline queue
async function handlePostRequest(request, url) {{
    try {{
        // Try network first
        const response = await fetch(request.clone());
        
        if (response.ok) {{
            return response;
        }} else {{
            throw new Error('Network request failed');
        }}
    }} catch (error) {{
        // Queue offline for background sync
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {{
            const data = await request.clone().json();
            await queueOfflineRequest(url.pathname, data);
            
            // Register background sync
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register('{sw_config.background_sync[0] if sw_config.background_sync else 'default-sync'}');
            
            return new Response(
                JSON.stringify({{status: 'queued', message: 'Request queued for sync'}}),
                {{status: 202, headers: {{'Content-Type': 'application/json'}}}}
            );
        }} else {{
            // Fallback: return error response
            return new Response(
                JSON.stringify({{status: 'error', message: 'Network unavailable'}}),
                {{status: 503, headers: {{'Content-Type': 'application/json'}}}}
            );
        }}
    }}
}}

// Cache strategies implementation
async function cacheFirst(request) {{
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {{
        return cachedResponse;
    }}
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {{
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
    }}
    
    return networkResponse;
}}

async function networkFirst(request) {{
    try {{
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {{
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }}
        return networkResponse;
    }} catch (error) {{
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {{
            return cachedResponse;
        }}
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {{
            return caches.match(OFFLINE_PAGE);
        }}
        
        throw error;
    }}
}}

async function staleWhileRevalidate(request) {{
    const cachedResponse = await caches.match(request);
    
    const networkResponsePromise = fetch(request).then((networkResponse) => {{
        if (networkResponse.ok) {{
            const cache = caches.open(CACHE_NAME);
            cache.then((c) => c.put(request, networkResponse.clone()));
        }}
        return networkResponse;
    }});
    
    return cachedResponse || networkResponsePromise;
}}

// Utility functions
function getCacheStrategy(pathname) {{
    // Check specific patterns first
    for (const [pattern, strategy] of Object.entries(CACHE_STRATEGIES)) {{
        if (pathname.match(new RegExp(pattern.replace(/\\*/g, '.*')))) {{
            return strategy;
        }}
    }}
    
    // Default strategy
    return 'network_first';
}}

async function queueOfflineRequest(url, data) {{
    // Store offline request for later sync
    const db = await openOfflineDB();
    const transaction = db.transaction(['offlineRequests'], 'readwrite');
    const store = transaction.objectStore('offlineRequests');
    
    await store.add({{
        url: url,
        data: data,
        timestamp: Date.now(),
        retries: 0
    }});
}}

// Background sync event
self.addEventListener('sync', (event) => {{
    if (event.tag === '{sw_config.background_sync[0] if sw_config.background_sync else 'default-sync'}') {{
        event.waitUntil(processOfflineQueue());
    }}
}});

async function processOfflineQueue() {{
    const db = await openOfflineDB();
    const transaction = db.transaction(['offlineRequests'], 'readwrite');
    const store = transaction.objectStore('offlineRequests');
    const requests = await store.getAll();
    
    for (const request of requests) {{
        try {{
            await fetch(request.url, {{
                method: 'POST',
                headers: {{'Content-Type': 'application/json'}},
                body: JSON.stringify(request.data)
            }});
            
            // Remove from queue on success
            await store.delete(request.id);
        }} catch (error) {{
            console.error('Failed to sync offline request:', error);
            request.retries++;
            
            if (request.retries > 3) {{
                // Remove after too many retries
                await store.delete(request.id);
            }} else {{
                // Update retry count
                await store.put(request);
            }}
        }}
    }}
}}

// IndexedDB for offline storage
function openOfflineDB() {{
    return new Promise((resolve, reject) => {{
        const request = indexedDB.open('OptiBidOfflineDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {{
            const db = event.target.result;
            if (!db.objectStoreNames.contains('offlineRequests')) {{
                db.createObjectStore('offlineRequests', {{ keyPath: 'id', autoIncrement: true }});
            }}
        }};
    }});
}}

// Push notification handling
{self._generate_push_notification_code() if sw_config.push_notifications else ''}

// Update available notification
self.addEventListener('message', (event) => {{
    if (event.data && event.data.type === 'SKIP_WAITING') {{
        self.skipWaiting();
    }}
}});

console.log('OptiBid Service Worker loaded successfully');
"""
        
        return service_worker_code
    
    def _generate_push_notification_code(self) -> str:
        """Generate push notification handling code"""
        return """
// Push notification event
self.addEventListener('push', (event) => {
    console.log('Push message received');
    
    let notificationData = {
        title: 'OptiBid Energy',
        body: 'You have a new notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'default',
        requireInteraction: false,
        actions: []
    };
    
    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                ...notificationData,
                ...data
            };
        } catch (e) {
            console.error('Error parsing push data:', e);
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const action = event.action;
    let urlToOpen = '/';
    
    // Handle different notification actions
    switch (action) {
        case 'view_market':
            urlToOpen = '/market';
            break;
        case 'view_dashboard':
            urlToOpen = '/dashboard';
            break;
        case 'dismiss':
            return; // Just close notification
        default:
            urlToOpen = action || '/';
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // Check if app is already open
            for (const client of clientList) {
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // Open new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
    console.log('Notification closed:', event.notification.tag);
});
"""
    
    def _generate_default_icons(self) -> List[Dict[str, str]]:
        """Generate default icon definitions"""
        return [
            {
                "src": "/icons/icon-72x72.png",
                "sizes": "72x72",
                "type": "image/png",
                "purpose": "any"
            },
            {
                "src": "/icons/icon-192x192.png",
                "sizes": "192x192",
                "type": "image/png",
                "purpose": "any maskable"
            },
            {
                "src": "/icons/icon-512x512.png",
                "sizes": "512x512",
                "type": "image/png",
                "purpose": "any maskable"
            }
        ]
    
    async def update_manifest(self, updates: Dict[str, Any]) -> bool:
        """Update PWA manifest configuration"""
        try:
            if not self.manifest:
                return False
            
            # Update manifest fields
            for key, value in updates.items():
                if hasattr(self.manifest, key):
                    setattr(self.manifest, key, value)
            
            logger.info("PWA manifest updated successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update PWA manifest: {e}")
            return False
    
    async def add_offline_resource(self, resource: OfflineResource) -> bool:
        """Add offline resource for caching"""
        try:
            # Remove existing resource with same URL
            self.offline_resources = [
                r for r in self.offline_resources if r.url != resource.url
            ]
            
            # Add new resource
            self.offline_resources.append(resource)
            
            # Sort by priority
            self.offline_resources.sort(key=lambda x: x.priority)
            
            logger.info(f"Added offline resource: {resource.url}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add offline resource: {e}")
            return False
    
    async def configure_push_notifications(
        self,
        vapid_public_key: str,
        notification_settings: Dict[str, Any]
    ) -> bool:
        """Configure push notifications"""
        try:
            self.push_notification_config = {
                "vapid_public_key": vapid_public_key,
                "settings": notification_settings,
                "enabled": True
            }
            
            logger.info("Push notifications configured successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to configure push notifications: {e}")
            return False
    
    async def generate_pwa_registration_script(self) -> str:
        """Generate client-side PWA registration script"""
        return f"""
// OptiBid Energy - PWA Registration Script

class PWAManager {{
    constructor() {{
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        this.isAndroid = /Android/.test(navigator.userAgent);
        this.isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        this.deferredPrompt = null;
        
        this.init();
    }}
    
    async init() {{
        // Register service worker
        if ('serviceWorker' in navigator) {{
            await this.registerServiceWorker();
        }}
        
        // Setup push notifications
        if ('Notification' in window) {{
            await this.setupPushNotifications();
        }}
        
        // Setup install prompt
        this.setupInstallPrompt();
        
        // Setup update notifications
        this.setupUpdateNotifications();
        
        // Track PWA usage
        this.trackPWAUsage();
    }}
    
    async registerServiceWorker() {{
        try {{
            const registration = await navigator.serviceWorker.register('/sw.js');
            
            console.log('Service Worker registered:', registration);
            
            // Handle updates
            registration.addEventListener('updatefound', () => {{
                const newWorker = registration.installing;
                
                newWorker.addEventListener('statechange', () => {{
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {{
                        // New update available
                        this.showUpdateAvailable();
                    }}
                }});
            }});
            
        }} catch (error) {{
            console.error('Service Worker registration failed:', error);
        }}
    }}
    
    setupInstallPrompt() {{
        window.addEventListener('beforeinstallprompt', (e) => {{
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        }});
        
        window.addEventListener('appinstalled', () => {{
            console.log('PWA installed successfully');
            this.hideInstallButton();
            this.deferredPrompt = null;
        }});
    }}
    
    showInstallButton() {{
        // Create and show install button
        const installButton = document.getElementById('pwa-install-button');
        if (installButton) {{
            installButton.style.display = 'block';
            
            installButton.addEventListener('click', async () => {{
                if (this.deferredPrompt) {{
                    this.deferredPrompt.prompt();
                    const choiceResult = await this.deferredPrompt.userChoice;
                    
                    if (choiceResult.outcome === 'accepted') {{
                        console.log('User accepted PWA installation');
                    }}
                    
                    this.deferredPrompt = null;
                }}
            }});
        }}
    }}
    
    hideInstallButton() {{
        const installButton = document.getElementById('pwa-install-button');
        if (installButton) {{
            installButton.style.display = 'none';
        }}
    }}
    
    async setupPushNotifications() {{
        if ('serviceWorker' in navigator && 'PushManager' in window) {{
            try {{
                const permission = await Notification.requestPermission();
                
                if (permission === 'granted') {{
                    const registration = await navigator.serviceWorker.ready;
                    await registration.pushManager.subscribe({{
                        userVisibleOnly: true,
                        applicationServerKey: this.urlBase64ToUint8Array(
                            '{self.push_notification_config.get('vapid_public_key', '')}'
                        )
                    }});
                    
                    console.log('Push notifications enabled');
                }}
            }} catch (error) {{
                console.error('Push notification setup failed:', error);
            }}
        }}
    }}
    
    setupUpdateNotifications() {{
        navigator.serviceWorker.addEventListener('message', (event) => {{
            if (event.data.type === 'UPDATE_AVAILABLE') {{
                this.showUpdateNotification();
            }}
        }});
    }}
    
    showUpdateAvailable() {{
        // Show update notification
        const updateBanner = document.createElement('div');
        updateBanner.innerHTML = `
            <div style="
                position: fixed; top: 0; left: 0; right: 0; 
                background: #0b6cff; color: white; 
                padding: 10px; text-align: center; z-index: 10000;
            ">
                <span>New version available!</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="margin-left: 10px; padding: 5px 10px;">
                    Update Now
                </button>
            </div>
        `;
        document.body.appendChild(updateBanner);
    }}
    
    showUpdateNotification() {{
        // Additional update notifications can be added here
        console.log('Update notification shown');
    }}
    
    trackPWAUsage() {{
        // Track PWA-specific usage
        if (this.isStandalone) {{
            console.log('App is running in standalone mode');
            document.body.classList.add('pwa-standalone');
        }} else {{
            console.log('App is running in browser mode');
        }}
        
        // Track installation status
        localStorage.setItem('pwa_install_attempted', 'true');
    }}
    
    urlBase64ToUint8Array(base64String) {{
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {{
            outputArray[i] = rawData.charCodeAt(i);
        }}
        return outputArray;
    }}
}}

// Initialize PWA manager
const pwaManager = new PWAManager();

// Add PWA-specific CSS classes
document.addEventListener('DOMContentLoaded', () => {{
    if (pwaManager.isIOS) {{
        document.body.classList.add('ios-device');
    }}
    if (pwaManager.isAndroid) {{
        document.body.classList.add('android-device');
    }}
    if (pwaManager.isStandalone) {{
        document.body.classList.add('standalone-mode');
    }}
}});
"""
    
    async def get_pwa_status(self) -> Dict[str, Any]:
        """Get PWA status and capabilities"""
        return {
            "manifest_configured": self.manifest is not None,
            "service_worker_configured": self.service_worker_config is not None,
            "offline_resources_count": len(self.offline_resources),
            "push_notifications_enabled": bool(self.push_notification_config),
            "background_sync_enabled": bool(self.service_worker_config and 
                                          self.service_worker_config.background_sync),
            "capabilities": {
                "service_worker": True,
                "push_notifications": "PushManager" in globals() or "serviceWorker" in navigator,
                "background_sync": "serviceWorker" in navigator and "sync" in window.ServiceWorkerRegistration.prototype,
                "app_install": "beforeinstallprompt" in window,
                "offline_support": True
            },
            "configuration": {
                "cache_name": self.service_worker_config.cache_name if self.service_worker_config else None,
                "cache_version": self.service_worker_config.cache_version if self.service_worker_config else None,
                "offline_page": self.service_worker_config.offline_page if self.service_worker_config else None
            }
        }


# Singleton instance
_pwa_instance: Optional[PWAService] = None


async def get_pwa_service() -> PWAService:
    """Get or create PWA service instance"""
    global _pwa_instance
    
    if _pwa_instance is None:
        _pwa_instance = PWAService()
    
    return _pwa_instance


async def shutdown_pwa_service():
    """Shutdown PWA service instance"""
    global _pwa_instance
    _pwa_instance = None


# Utility functions for PWA integration
async def generate_pwa_files(pwa_service: PWAService) -> Dict[str, str]:
    """Generate all PWA-related files"""
    files = {}
    
    # Generate manifest.json
    manifest = await pwa_service.generate_manifest()
    files["/manifest.json"] = json.dumps(manifest, indent=2)
    
    # Generate service worker
    sw_code = await pwa_service.generate_service_worker()
    files["/sw.js"] = sw_code
    
    # Generate PWA registration script
    registration_script = pwa_service.generate_pwa_registration_script()
    files["/pwa-registration.js"] = registration_script
    
    return files


def is_pwa_installed() -> bool:
    """Check if PWA is currently installed (standalone mode)"""
    return (
        window.matchMedia('(display-mode: standalone)').matches or
        window.navigator.standalone or
        document.referrer.includes('android-app://')
    ) if 'window' in globals() and 'navigator' in globals() else False


def is_pwa_capable() -> bool:
    """Check if device supports PWA features"""
    return (
        'serviceWorker' in navigator and
        'fetch' in window and
        'Promise' in window
    ) if 'navigator' in globals() and 'window' in globals() else False