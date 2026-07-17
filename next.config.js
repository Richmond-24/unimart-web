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

  typescript: {
    ignoreBuildErrors: true,
  },
  
  output: 'standalone',
  
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
  },
  
  poweredByHeader: false,
  compress: true,
  staticPageGenerationTimeout: 120,
  
  // CRITICAL: Enable Turbopack with empty config
  turbopack: {},
};

module.exports = nextConfig;