"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPhone } from "@/app/lib/data";

interface PhoneAuthFormProps {
  onSuccess?: (phoneNumber: string) => void;
}

export default function PhoneAuthForm({ onSuccess }: PhoneAuthFormProps) {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, "");
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      setError("Введите номер телефона");
      return;
    }

    if (phoneNumber.length < 10) {
      setError("Номер телефона слишком короткий");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await sendPhone(phoneNumber);
      if (result.success) {
        localStorage.setItem("phoneNumber", result.phoneNumber);
        localStorage.setItem("hashedCode", result.hashedCode);
        localStorage.setItem("salt", result.salt);

        if (onSuccess) {
          onSuccess(phoneNumber);
        }
        router.push(`/sendcode?phoneNumber=${encodeURIComponent(phoneNumber)}`);
      } else {
        setError(result.message || "Ошибка отправки кода");
      }
    } catch (err) {
      setError((err as Error).message || "Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Phone Input */}
      <div className="mb-6">
        <label className="block text-[13px] font-medium text-qblack mb-2">
          Номер телефона
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-qgray">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="+7 (___) ___-__-__"
            className={`w-full h-[55px] pl-12 pr-4 border rounded-lg focus:outline-none transition-colors text-[15px] ${
              error
                ? "border-qred focus:border-qred"
                : "border-[#EDEDED] focus:border-qyellow"
            }`}
            autoFocus
          />
        </div>
        {error && (
          <p className="text-qred text-[13px] mt-2">{error}</p>
        )}
      </div>

      {/* Info Text */}
      <div className="mb-6 p-4 bg-[#FFF8E5] rounded-lg">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#B8860B"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <p className="text-[13px] text-[#8B6914] leading-relaxed">
            На указанный номер будет отправлен SMS-код для подтверждения входа
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !phoneNumber.trim()}
        className="w-full h-[55px] bg-qblack hover:bg-qyellow text-white hover:text-qblack font-semibold text-[15px] rounded-lg transition-colors disabled:bg-qgray disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
            Отправка...
          </>
        ) : (
          <>
            Получить код
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
