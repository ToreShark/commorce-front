"use client";

import Link from "next/link";
import Layout from "@/app/components/Layout";
import { Breadcrumb } from "@/app/components/Shop";

export default function NotFound() {
  const breadcrumbPaths = [
    { name: "Главная", path: "/" },
    { name: "404", path: "#" },
  ];

  return (
    <Layout>
      <div className="not-found-wrapper w-full bg-white pb-[60px]">
        {/* Page Header */}
        <div className="w-full bg-[#F6F6F6] py-[40px] mb-[60px]">
          <div className="container-x mx-auto">
            <h1 className="text-[30px] font-bold text-qblack mb-2">
              Страница не найдена
            </h1>
            <Breadcrumb paths={breadcrumbPaths} className="mb-0" />
          </div>
        </div>

        <div className="container-x mx-auto">
          <div className="w-full py-[60px] flex flex-col items-center justify-center">
            {/* 404 Illustration */}
            <div className="mb-10">
              <svg
                width="280"
                height="180"
                viewBox="0 0 280 180"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background shapes */}
                <circle cx="140" cy="90" r="80" fill="#F6F6F6" />
                <circle cx="60" cy="50" r="15" fill="#FFBB38" opacity="0.2" />
                <circle cx="220" cy="140" r="20" fill="#FFBB38" opacity="0.15" />
                <circle cx="240" cy="40" r="10" fill="#EDEDED" />

                {/* 404 Text */}
                <text
                  x="140"
                  y="105"
                  textAnchor="middle"
                  className="fill-qblack"
                  style={{
                    fontSize: "72px",
                    fontWeight: "bold",
                    fontFamily: "system-ui",
                  }}
                >
                  404
                </text>

                {/* Decorative line */}
                <path
                  d="M80 130 Q140 145 200 130"
                  stroke="#FFBB38"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-[28px] font-bold text-qblack mb-4 text-center">
              Упс! Страница не найдена
            </h2>

            {/* Description */}
            <p className="text-[15px] text-qgray text-center mb-8 max-w-md leading-relaxed">
              Страница, которую вы ищете, не существует или была перемещена.
              Вернитесь на главную страницу или перейдите в каталог товаров.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/">
                <button className="h-[50px] px-8 bg-qblack hover:bg-qyellow text-white hover:text-qblack font-semibold text-[14px] rounded transition-colors min-w-[180px]">
                  На главную
                </button>
              </Link>
              <Link href="/shop">
                <button className="h-[50px] px-8 bg-[#F6F6F6] hover:bg-[#EDEDED] text-qblack font-semibold text-[14px] rounded transition-colors min-w-[180px]">
                  В каталог
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
