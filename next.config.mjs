/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  images: {
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
        protocol: 'https', // Протокол источника
        hostname: 'crysshop.kz', // Домен, с которого будут загружаться изображения
        pathname: '/images/**', // Путь к изображениям на сервере
      },
    ],
  },
};

export default nextConfig;