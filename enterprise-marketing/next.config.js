/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow build to proceed with ESLint warnings (don't fail on lint errors)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Allow build to proceed with TypeScript errors (for incremental fixes)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove deprecated appDir config (now default in Next.js 13+)
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'optibid-energy.com',
      'storage.googleapis.com',
      'cloudinary.com'
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  webpack: (config, { dev, isServer }) => {
    // Add performance optimizations for canvas animation
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: { loader: 'worker-loader' },
    });
    
    return config;
  },
  // Proxy configuration for backend API
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },

  // Security headers for enterprise compliance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
  // Redirects for SEO
  async redirects() {
    return [];
  },
  // Environmental variables (with fallback)
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || 'default-development-key',
  },
};

module.exports = nextConfig;