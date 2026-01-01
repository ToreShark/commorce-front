"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DevLoginButton from "@/app/components/Auth/DevLoginButton";
import AuthMethodSelector from "@/app/components/Auth/AuthMethodSelector";
import { getCurrentUser, authLogout } from "@/app/lib/data";
import { UserInfo } from "@/app/lib/interfaces/auth.interface";

// Имя Telegram бота из переменной окружения
const TELEGRAM_BOT_NAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "your_bot_name";

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);
  const [isDev, setIsDev] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    setIsDev(process.env.NODE_ENV === "development");

    // Проверяем авторизацию
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const result = await getCurrentUser();
        if (result.success && result.user) {
          setUser(result.user);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await authLogout();
    setUser(null);
    setIsLoggingOut(false);
    router.refresh();
  };

  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Загрузка...</div>
      </div>
    );
  }

  // Если пользователь авторизован - показываем профиль
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
            {/* Аватар и имя */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-500 mt-1">Вы авторизованы</p>
              {user.role && (
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {user.role}
                </span>
              )}
            </div>

            {/* Действия */}
            <div className="space-y-3">
              {/* Админ-панель - только для админов */}
              {user.isAdmin && (
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3
                             bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors
                             text-white font-medium"
                >
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
                      d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                    />
                  </svg>
                  <span>Админ-панель</span>
                </Link>
              )}

              {/* На главную */}
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full px-4 py-3
                           bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors
                           text-gray-700 font-medium"
              >
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
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span>На главную</span>
              </Link>

              {/* Выйти */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center justify-center gap-2 w-full px-4 py-3
                           bg-red-50 hover:bg-red-100 rounded-lg transition-colors
                           text-red-600 font-medium disabled:opacity-50"
              >
                {isLoggingOut ? (
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
                ) : (
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                )}
                <span>{isLoggingOut ? "Выход..." : "Выйти"}</span>
              </button>
            </div>
          </div>

          {/* Подпись */}
          <p className="text-center text-xs text-gray-400 mt-6">
            &copy; {new Date().getFullYear()} CrysShop. Все права защищены.
          </p>
        </div>
      </div>
    );
  }

  // Если не авторизован - показываем форму входа
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        {/* Карточка входа */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          {/* Логотип / Заголовок */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Вход в систему</h1>
            <p className="text-gray-500 mt-2">
              {isDev
                ? "Режим разработки"
                : "Выберите удобный способ входа"}
            </p>
          </div>

          {/* Разделитель */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                {isDev ? "DEV Mode" : "Авторизация"}
              </span>
            </div>
          </div>

          {/* Кнопки входа */}
          <div className="space-y-4">
            <AuthMethodSelector telegramBotName={TELEGRAM_BOT_NAME} />

            {/* Dev Login - только в режиме разработки */}
            {isDev && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400 text-center mb-3">Dev Mode</p>
                <DevLoginButton />
              </div>
            )}
          </div>
        </div>

        {/* Подпись */}
        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} CrysShop. Все права защищены.
        </p>
      </div>
    </div>
  );
}
