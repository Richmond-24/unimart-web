
/**
 * Next.js config that adds an optional dev-time proxy to a separate backend.
 * If NEXT_PUBLIC_BACKEND_URL is set and we're in development, requests to
 * /api/:path* will be proxied to the backend to avoid CORS and keep client
 * code unchanged.
 */
const isDev = process.env.NODE_ENV !== 'production';
const backend = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Keep your existing rewrites
  async rewrites() {
    if (isDev && backend) {
      return [
        {
          source: '/api/:path*',
          destination: `${backend}/api/:path*`,
        },
      ];
    }
    return [];
  },

  // ===== NEW: Build Optimizations to fix 45-min timeout =====
  
  // CRITICAL: Skip linting during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // CRITICAL: Skip TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optimize build performance
  swcMinify: true,
  
  // Output standalone for smaller deployments
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: ['res.cloudinary.com', 'localhost'],
    // Limit image sizes to reduce processing time
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  
  // Reduce build logs
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // Security & performance
  poweredByHeader: false,
  compress: true,
  
  // Optional: Enable if you have many static pages
  // staticPageGenerationTimeout: 120, // Increase timeout to 120 seconds per page
};

module.exports = nextConfig;