"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sendSmsCode, getUser } from "@/app/lib/data";
import { UserContext } from "@/app/lib/UserInfo";

interface SmsCodeFormProps {
  phoneNumber: string;
}

export default function SmsCodeForm({ phoneNumber }: SmsCodeFormProps) {
  const router = useRouter();
  const { setCurrentUser } = useContext(UserContext);
  const [smsCode, setSmsCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPhoneDisplay = (phone: string) => {
    if (phone.length > 6) {
      return phone.slice(0, 4) + " **** " + phone.slice(-4);
    }
    return phone;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setSmsCode(value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!smsCode.trim()) {
      setError("Введите код из SMS");
      return;
    }

    if (smsCode.length < 4) {
      setError("Код слишком короткий");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const hashedCode = localStorage.getItem("hashedCode");
      const salt = localStorage.getItem("salt");

      if (!hashedCode || !salt) {
        setError("Сессия истекла. Запросите код повторно.");
        return;
      }

      const result = await sendSmsCode(phoneNumber, smsCode, hashedCode, salt);

      if (result.token) {
        localStorage.removeItem("phoneNumber");
        localStorage.removeItem("hashedCode");
        localStorage.removeItem("salt");

        sessionStorage.setItem("token", result.token);

        const userData = await getUser();
        setCurrentUser(userData);

        router.push("/");
      } else {
        setError(result.message || "Неверный код");
      }
    } catch (err) {
      setError((err as Error).message || "Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    router.push("/sendphone");
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Phone Display */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F6F6F6] rounded-full">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#666"
            strokeWidth="2"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span className="text-[14px] font-medium text-qblack">
            {formatPhoneDisplay(phoneNumber)}
          </span>
        </div>
      </div>

      {/* SMS Code Input */}
      <div className="mb-6">
        <label className="block text-[13px] font-medium text-qblack mb-2 text-center">
          Код из SMS
        </label>
        <input
          type="text"
          value={smsCode}
          onChange={handleCodeChange}
          placeholder="______"
          maxLength={6}
          className={`w-full h-[65px] px-4 text-center text-[32px] tracking-[0.5em] font-bold border rounded-lg focus:outline-none transition-colors ${
            error
              ? "border-qred focus:border-qred"
              : "border-[#EDEDED] focus:border-qyellow"
          }`}
          autoFocus
        />
        {error && (
          <p className="text-qred text-[13px] mt-2 text-center">{error}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !smsCode.trim()}
        className="w-full h-[55px] bg-qblack hover:bg-qyellow text-white hover:text-qblack font-semibold text-[15px] rounded-lg transition-colors disabled:bg-qgray disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
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
            Проверка...
          </>
        ) : (
          "Войти"
        )}
      </button>

      {/* Resend / Change Number */}
      <div className="space-y-3 text-center">
        <p className="text-[13px] text-qgray">
          Не получили код?{" "}
          <button
            type="button"
            onClick={handleResendCode}
            className="text-qyellow hover:underline font-medium"
          >
            Отправить повторно
          </button>
        </p>
        <Link
          href="/sendphone"
          className="text-[13px] text-qgray hover:text-qblack transition-colors inline-flex items-center gap-1"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Изменить номер
        </Link>
      </div>
    </form>
  );
}
