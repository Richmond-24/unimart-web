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
};

module.exports = nextConfig;
