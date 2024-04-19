/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
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