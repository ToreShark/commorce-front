"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "./PhoneInput";
import { sendPhone, sendSmsCode } from "@/app/lib/data";

interface WhatsAppLoginWidgetProps {
  onSuccess?: () => void;
}

type Step = "phone" | "code";

export default function WhatsAppLoginWidget({
  onSuccess,
}: WhatsAppLoginWidgetProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rate limiting state
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimer, setBlockTimer] = useState(0);

  // Auth data from server
  const [hashedCode, setHashedCode] = useState("");
  const [salt, setSalt] = useState("");

  const handlePhoneChange = (clean: string, formatted: string) => {
    setPhoneNumber(clean);
    setFormattedPhone(formatted);
    setError(null);
  };

  const handleSendPhone = async () => {
    if (phoneNumber.length !== 11) {
      setError("Введите корректный номер телефона");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Отправляем чистый номер без форматирования
      const result = await sendPhone(phoneNumber);

      if (result.success) {
        setHashedCode(result.hashedCode);
        setSalt(result.salt);
        // Сохраняем чистый номер для консистентности
        localStorage.setItem("phoneNumber", phoneNumber);
        localStorage.setItem("hashedCode", result.hashedCode);
        localStorage.setItem("salt", result.salt);
        setStep("code");
      } else {
        setError(result.message || "Ошибка отправки кода");
      }
    } catch (err) {
      setError("Ошибка подключения к серверу");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (otpCode.length !== 4) {
      setError("Код должен содержать 4 цифры");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const storedHashedCode = localStorage.getItem("hashedCode") || hashedCode;
      const storedSalt = localStorage.getItem("salt") || salt;
      const storedPhone = localStorage.getItem("phoneNumber") || phoneNumber;

      // sendSmsCode(phoneNumber, smsCode, hashedCode, salt)
      const result = await sendSmsCode(
        storedPhone,
        otpCode,
        storedHashedCode,
        storedSalt
      );

      if (result.success || result.token) {
        // Успешная авторизация
        localStorage.removeItem("hashedCode");
        localStorage.removeItem("salt");
        localStorage.removeItem("phoneNumber");

        if (result.token) {
          localStorage.setItem("accessToken", result.token);
          document.cookie = `token=${result.token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        }

        onSuccess?.();
        router.push("/");
        router.refresh();
      } else {
        // Обработка ошибок rate limiting
        if (result.error === "blocked") {
          setIsBlocked(true);
          setBlockTimer(result.secondsUntilUnblock || 86400);
          setError("Номер заблокирован из-за превышения попыток. Попробуйте через 24 часа.");
        } else if (result.error === "invalid_code") {
          setAttemptsRemaining(result.attemptsRemaining ?? attemptsRemaining - 1);
          if (result.isBlocked) {
            setIsBlocked(true);
            setBlockTimer(result.secondsUntilUnblock || 86400);
            setError("Номер заблокирован на 24 часа из-за превышения попыток");
          } else {
            setError(result.message || `Неверный код. Осталось попыток: ${result.attemptsRemaining}`);
          }
        } else {
          setError(result.message || "Неверный код подтверждения");
        }
      }
    } catch (err) {
      setError("Ошибка подключения к серверу");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setOtpCode("");
    setError(null);
    setAttemptsRemaining(3);
    await handleSendPhone();
  };

  const handleBack = () => {
    setStep("phone");
    setOtpCode("");
    setError(null);
    setAttemptsRemaining(3);
    setIsBlocked(false);
  };

  // Форматирование времени блокировки
  const formatBlockTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} ч. ${minutes} мин.`;
    }
    return `${minutes} мин.`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex items-center gap-2 text-green-600">
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
          <span>{step === "phone" ? "Отправка кода..." : "Проверка кода..."}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {step === "phone" ? (
        <>
          <PhoneInput
            value={phoneNumber}
            onChange={handlePhoneChange}
            error={error || undefined}
            placeholder="+7 (___) ___-__-__"
          />

          <button
            onClick={handleSendPhone}
            disabled={phoneNumber.length !== 11}
            className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300
                       text-white font-medium rounded-lg transition-colors
                       flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Получить код в WhatsApp
          </button>
        </>
      ) : (
        <>
          <div className="text-center mb-2">
            <p className="text-sm text-gray-600">
              Код отправлен на номер
            </p>
            <p className="font-medium text-gray-900">{formattedPhone}</p>
          </div>

          {isBlocked ? (
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-red-600 font-medium">Номер заблокирован</p>
              <p className="text-sm text-red-500 mt-1">
                Попробуйте через {formatBlockTime(blockTimer)}
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otpCode[index] || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val) {
                        const newCode = otpCode.split("");
                        newCode[index] = val;
                        setOtpCode(newCode.join("").slice(0, 4));
                        // Автофокус на следующий инпут
                        const nextInput = e.target.nextElementSibling as HTMLInputElement;
                        if (nextInput && val) nextInput.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otpCode[index]) {
                        const prevInput = e.currentTarget.previousElementSibling as HTMLInputElement;
                        if (prevInput) {
                          prevInput.focus();
                          const newCode = otpCode.split("");
                          newCode[index - 1] = "";
                          setOtpCode(newCode.join(""));
                        }
                      }
                    }}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ))}
              </div>

              {attemptsRemaining < 3 && (
                <p className="text-center text-sm text-orange-600">
                  Осталось попыток: {attemptsRemaining}
                </p>
              )}

              <button
                onClick={handleVerifyCode}
                disabled={otpCode.length !== 4}
                className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300
                           text-white font-medium rounded-lg transition-colors"
              >
                Подтвердить
              </button>
            </>
          )}

          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}

          <div className="flex justify-center gap-4 text-sm">
            <button
              onClick={handleBack}
              className="text-gray-500 hover:text-gray-700"
            >
              Изменить номер
            </button>
            {!isBlocked && (
              <button
                onClick={handleResendCode}
                className="text-green-600 hover:text-green-700"
              >
                Отправить снова
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
