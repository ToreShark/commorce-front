/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5249',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '7264',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'crysshop.kz',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;