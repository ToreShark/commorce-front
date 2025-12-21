"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthLayout, SmsCodeForm } from "@/app/components/Auth";

function SmsCodeContent() {
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get("phoneNumber") || "";

  return (
    <AuthLayout
      title="Подтверждение"
      subtitle="Введите код из SMS-сообщения"
    >
      <SmsCodeForm phoneNumber={phoneNumber} />
    </AuthLayout>
  );
}

export default function SendCodePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-qyellow" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-qgray">Загрузка...</span>
          </div>
        </div>
      }
    >
      <SmsCodeContent />
    </Suspense>
  );
}
