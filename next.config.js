const isDev = process.env.NODE_ENV !== 'production';
const backend = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
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

  // Skip TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Output standalone for smaller deployments
  output: 'standalone',
  
  // Image optimization with remotePatterns
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Optimize SWC compiler
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  staticPageGenerationTimeout: 120,
  httpAgentOptions: {
    keepAlive: true,
  },
  
  // Experimental features for faster builds
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
    ],
    // Reduce build memory usage
    workerThreads: false,
    cpus: 2,
  },
  
  // Reduce bundle size
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;