"use client";

import Layout from "@/app/components/Layout";
import { Breadcrumb } from "@/app/components/Shop";
import Image from "next/image";

export default function AboutPage() {
  const breadcrumbPaths = [
    { name: "Главная", path: "/" },
    { name: "О нас", path: "/hello" },
  ];

  return (
    <Layout>
      <div className="about-page-wrapper w-full bg-white pb-[60px]">
        {/* Page Header */}
        <div className="w-full bg-[#F6F6F6] py-[40px] mb-[60px]">
          <div className="container-x mx-auto">
            <h1 className="text-[30px] font-bold text-qblack mb-2">О нас</h1>
            <Breadcrumb paths={breadcrumbPaths} className="mb-0" />
          </div>
        </div>

        <div className="container-x mx-auto">
          {/* Hero Section */}
          <div className="w-full lg:flex lg:gap-[60px] mb-[60px]">
            {/* Image */}
            <div className="lg:w-1/2 w-full mb-8 lg:mb-0">
              <div className="w-full h-[400px] relative rounded-lg overflow-hidden bg-[#F6F6F6]">
                <Image
                  src="/assets/images/about-banner.png"
                  alt="О нашем магазине"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                {/* Fallback gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-qyellow/20 to-qblack/10 flex items-center justify-center">
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFBB38"
                    strokeWidth="1"
                    className="opacity-50"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:w-1/2 w-full">
              <h2 className="text-[28px] font-bold text-qblack mb-4">
                Добро пожаловать в наш магазин
              </h2>
              <div className="w-[60px] h-[3px] bg-qyellow mb-6" />
              <p className="text-[15px] text-qgray leading-[28px] mb-6">
                Мы рады приветствовать вас в нашем интернет-магазине! Наша команда
                стремится предоставить вам лучший сервис и качественные товары по
                доступным ценам.
              </p>
              <p className="text-[15px] text-qgray leading-[28px] mb-6">
                С момента основания мы работаем над тем, чтобы каждый клиент
                получил именно то, что искал. Мы тщательно отбираем товары,
                следим за качеством и всегда готовы помочь с выбором.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-[32px] font-bold text-qyellow mb-1">1000+</div>
                  <div className="text-[13px] text-qgray">Товаров</div>
                </div>
                <div className="text-center">
                  <div className="text-[32px] font-bold text-qyellow mb-1">500+</div>
                  <div className="text-[13px] text-qgray">Клиентов</div>
                </div>
                <div className="text-center">
                  <div className="text-[32px] font-bold text-qyellow mb-1">24/7</div>
                  <div className="text-[13px] text-qgray">Поддержка</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="w-full mb-[60px]">
            <h3 className="text-[22px] font-bold text-qblack text-center mb-8">
              Почему выбирают нас
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="p-6 border border-[#EDEDED] rounded-lg text-center hover:border-qyellow transition-colors">
                <div className="w-16 h-16 bg-qyellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFBB38"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h4 className="text-[16px] font-semibold text-qblack mb-2">
                  Гарантия качества
                </h4>
                <p className="text-[13px] text-qgray">
                  Все товары проходят проверку качества
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 border border-[#EDEDED] rounded-lg text-center hover:border-qyellow transition-colors">
                <div className="w-16 h-16 bg-qyellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFBB38"
                    strokeWidth="2"
                  >
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <h4 className="text-[16px] font-semibold text-qblack mb-2">
                  Быстрая доставка
                </h4>
                <p className="text-[13px] text-qgray">
                  Доставляем по всему Казахстану
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 border border-[#EDEDED] rounded-lg text-center hover:border-qyellow transition-colors">
                <div className="w-16 h-16 bg-qyellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFBB38"
                    strokeWidth="2"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h4 className="text-[16px] font-semibold text-qblack mb-2">
                  Поддержка 24/7
                </h4>
                <p className="text-[13px] text-qgray">
                  Всегда на связи с нашими клиентами
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 border border-[#EDEDED] rounded-lg text-center hover:border-qyellow transition-colors">
                <div className="w-16 h-16 bg-qyellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFBB38"
                    strokeWidth="2"
                  >
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <h4 className="text-[16px] font-semibold text-qblack mb-2">
                  Лучшие цены
                </h4>
                <p className="text-[13px] text-qgray">
                  Конкурентные цены на весь ассортимент
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="w-full bg-[#F6F6F6] rounded-lg p-8">
            <h3 className="text-[22px] font-bold text-qblack text-center mb-8">
              Свяжитесь с нами
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-qyellow rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-qblack mb-1">Адрес</h4>
                  <p className="text-[14px] text-qgray">г. Атырау, Казахстан</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-qyellow rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-qblack mb-1">Телефон</h4>
                  <p className="text-[14px] text-qgray">+7 (7XX) XXX-XX-XX</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-qyellow rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-qblack mb-1">Email</h4>
                  <p className="text-[14px] text-qgray">info@crysshop.kz</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
