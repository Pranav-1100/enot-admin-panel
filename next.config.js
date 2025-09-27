/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    
    // Environment variables
    env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
    },
  
    // Image optimization
    images: {
      domains: [
        'localhost',
        '127.0.0.1',
        'enot.trou.hackclub.app'
      ],
      formats: ['image/webp', 'image/avif'],
    },
  
    // API rewrites for proxy approach
    async rewrites() {
        return [
          {
            source: '/api/:path*',
            destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/:path*`,
          },
          {
            source: '/auth/:path*',
            destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/:path*`,
          },
        ];
      },
  
    // Headers for CORS and security
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
              value: 'origin-when-cross-origin',
            },
          ],
        },
      ];
    },
  
    // Webpack configuration for file handling
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      config.module.rules.push({
        test: /\.svg$/i,
        use: ['@svgr/webpack'],
      });
      return config;
    },
  
    // Compiler options
    compiler: {
      removeConsole: process.env.NODE_ENV === 'production',
    },
  
    // Output configuration
    output: 'standalone',
    poweredByHeader: false,
  
    // Redirects
    async redirects() {
      return [
        {
          source: '/admin',
          destination: '/',
          permanent: true,
        },
        {
          source: '/dashboard',
          destination: '/',
          permanent: true,
        },
      ];
    },
  };
  
  module.exports = nextConfig;