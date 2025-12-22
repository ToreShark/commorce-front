"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { devLogin } from "@/app/lib/data";

interface DevLoginButtonProps {
  onSuccess?: () => void;
}

export default function DevLoginButton({ onSuccess }: DevLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDevLogin = async () => {
    console.log("[DEV LOGIN] Начало авторизации...");
    setIsLoading(true);
    setError(null);

    try {
      console.log("[DEV LOGIN] Вызов devLogin()...");
      const result = await devLogin();
      console.log("[DEV LOGIN] Результат:", result);

      if (result.success) {
        console.log("[DEV LOGIN] Успех! Токен:", result.accessToken?.substring(0, 20) + "...");
        console.log("[DEV LOGIN] User:", result.user);
        console.log("[DEV LOGIN] localStorage accessToken:", localStorage.getItem("accessToken")?.substring(0, 20) + "...");
        onSuccess?.();
        console.log("[DEV LOGIN] Редирект на /...");
        router.push("/");
        router.refresh();
      } else {
        console.error("[DEV LOGIN] Ошибка:", result.error);
        setError(result.error || "Ошибка авторизации");
      }
    } catch (err) {
      console.error("[DEV LOGIN] Exception:", err);
      setError("Ошибка подключения к серверу");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleDevLogin}
        disabled={isLoading}
        className="w-full max-w-xs px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                   text-white font-medium rounded-lg transition-colors duration-200
                   flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Вход...</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            <span>Войти (DEV)</span>
          </>
        )}
      </button>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      <p className="text-xs text-gray-500 text-center max-w-xs">
        Режим разработки. Вход как SuperAdmin без валидации Telegram.
      </p>
    </div>
  );
}
