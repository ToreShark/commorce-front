"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { telegramLogin } from "@/app/lib/data";
import { TelegramAuthData } from "@/app/lib/interfaces/auth.interface";

interface TelegramLoginWidgetProps {
  botName: string;
  onSuccess?: () => void;
}

// Расширяем Window для Telegram callback
declare global {
  interface Window {
    onTelegramAuth: (user: TelegramAuthData) => void;
  }
}

export default function TelegramLoginWidget({
  botName,
  onSuccess,
}: TelegramLoginWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Определяем callback функцию для Telegram
    window.onTelegramAuth = async (user: TelegramAuthData) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await telegramLogin(user);

        if (result.success) {
          onSuccess?.();
          router.push("/");
          router.refresh();
        } else {
          setError(result.error || "Ошибка авторизации");
        }
      } catch (err) {
        setError("Ошибка подключения к серверу");
      } finally {
        setIsLoading(false);
      }
    };

    // Создаём Telegram Login Widget скрипт
    if (containerRef.current) {
      // Очищаем контейнер
      containerRef.current.innerHTML = "";

      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.setAttribute("data-telegram-login", botName);
      script.setAttribute("data-size", "large");
      script.setAttribute("data-radius", "8");
      script.setAttribute("data-onauth", "onTelegramAuth(user)");
      script.setAttribute("data-request-access", "write");
      script.async = true;

      containerRef.current.appendChild(script);
    }

    return () => {
      // Cleanup
      delete (window as any).onTelegramAuth;
    };
  }, [botName, onSuccess, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-blue-600">
          <svg
            className="animate-spin h-5 w-5"
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
          <span>Авторизация...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={containerRef} className="telegram-login-container" />

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      <p className="text-xs text-gray-500 text-center max-w-xs">
        Нажмите кнопку выше для входа через Telegram
      </p>
    </div>
  );
}
