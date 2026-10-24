/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    // Готовая картинка живёт в кэше 30 дней: фото товара по одному адресу не
    // меняется (новое фото — новый файл). По умолчанию было max-age=14400 (4 ч).
    minimumCacheTTL: 2592000,
    // Только WebP. AVIF замерили 24.10.2026: первый запрос ≈0,34 с против ≈0,14 с
    // у WebP при выигрыше в весе 6–12%, а Google при проверке URL как раз не
    // дожидается первых ответов /_next/image. К тому же Cloudflare не различает
    // форматы по Accept — с кэшем на его стороне AVIF ушёл бы и старым браузерам.
    formats: ['image/webp'],
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
      {
        protocol: 'http',
        hostname: 'crysshop.kz',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;