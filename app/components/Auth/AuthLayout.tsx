"use client";

import Link from "next/link";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-[500px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={152}
              height={36}
              className="h-[36px] w-auto"
            />
          </Link>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-lg border border-[#EDEDED] shadow-sm">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-[#EDEDED]">
            <h1 className="text-[28px] font-bold text-qblack mb-2">{title}</h1>
            {subtitle && (
              <p className="text-[14px] text-qgray">{subtitle}</p>
            )}
            {/* Decorative Line */}
            <div className="flex justify-center mt-4">
              <svg
                width="120"
                height="10"
                viewBox="0 0 120 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 5C20 1 40 9 60 5C80 1 100 9 119 5"
                  stroke="#FFBB38"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {children}
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-[14px] text-qgray hover:text-qblack transition-colors inline-flex items-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
