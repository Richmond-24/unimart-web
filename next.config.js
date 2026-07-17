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
  },
  
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  poweredByHeader: false,
  compress: true,
  staticPageGenerationTimeout: 120,
};

module.exports = nextConfig;