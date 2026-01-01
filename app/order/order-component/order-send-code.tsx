"use client";
import { fetchOrderDetails, sendSmsCodeOrder } from "@/app/lib/data";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import OrderConfirmationModal from "./OrderConfirmationModal";
import { OrderDataViewModel } from "@/app/lib/interfaces/OrderDataViewModel.interface";

export default function OrderSendCodeModal({
  phoneNumber,
  isOpen,
  onClose,
}: {
  phoneNumber: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [smsCode, setSmsCode] = useState("");
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderDataViewModel | null>(null);
  const router = useRouter();

  // Rate limiting state
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimer, setBlockTimer] = useState(0);

  const dialogRef = useRef<React.ElementRef<"dialog">>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  // Таймер блокировки
  useEffect(() => {
    if (isBlocked && blockTimer > 0) {
      const timer = setInterval(() => {
        setBlockTimer((prev) => {
          if (prev <= 1) {
            setIsBlocked(false);
            setAttemptsRemaining(3);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isBlocked, blockTimer]);

  const closeModal = () => {
    dialogRef.current?.close();
    router.push("/");
  };

  const handleCodeChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = smsCode.split("");
    newCode[index] = digit;
    setSmsCode(newCode.join("").slice(0, 4));

    // Автофокус на следующий инпут
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !smsCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newCode = smsCode.split("");
      newCode[index - 1] = "";
      setSmsCode(newCode.join(""));
    }
  };

  const handleSendCode = async () => {
    if (smsCode.length !== 4) {
      setError("Введите 4-значный код");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const hashedCode = localStorage.getItem("hashedCode");
      const salt = localStorage.getItem("salt");
      const orderId = localStorage.getItem("orderId");
      const uniqueCode = localStorage.getItem("deliveryType");
      const redirectUrl = localStorage.getItem("redirectUrl") || "";

      if (!hashedCode || !salt || !orderId || !uniqueCode) {
        setError("Необходимые данные не найдены. Попробуйте оформить заказ заново.");
        setLoading(false);
        return;
      }

      let region, city, street, houseNumber;

      if (uniqueCode === "Courier" || uniqueCode === "cdek_courier") {
        region = localStorage.getItem("region") || undefined;
        city = localStorage.getItem("city") || undefined;
        street = localStorage.getItem("street") || undefined;
        houseNumber = localStorage.getItem("houseNumber") || undefined;
      }

      const result = await sendSmsCodeOrder(
        phoneNumber,
        smsCode,
        salt,
        hashedCode,
        orderId,
        uniqueCode,
        region,
        city,
        street,
        houseNumber,
        redirectUrl
      );

      if (result.success) {
        // Успешная верификация
        const orderDetails = await fetchOrderDetails(orderId);
        setOrderData(orderDetails);

        // Очищаем localStorage
        localStorage.removeItem("phoneNumber");
        localStorage.removeItem("hashedCode");
        localStorage.removeItem("salt");
        localStorage.removeItem("orderId");
        localStorage.removeItem("deliveryType");
        localStorage.removeItem("redirectUrl");
        localStorage.removeItem("uniqueCode");

        if (uniqueCode === "Courier" || uniqueCode === "cdek_courier") {
          localStorage.removeItem("region");
          localStorage.removeItem("city");
          localStorage.removeItem("street");
          localStorage.removeItem("houseNumber");
        }

        setIsConfirmationModalOpen(true);
      } else {
        // Обработка ошибок rate limiting
        if (result.error === "blocked") {
          setIsBlocked(true);
          setBlockTimer(result.secondsUntilUnblock || 86400);
          setAttemptsRemaining(0);
          setError("Номер заблокирован из-за превышения попыток");
        } else if (result.error === "invalid_code") {
          setAttemptsRemaining(result.attemptsRemaining ?? attemptsRemaining - 1);

          if (result.isBlocked) {
            setIsBlocked(true);
            setBlockTimer(result.secondsUntilUnblock || 86400);
            setError("Номер заблокирован на 24 часа из-за превышения попыток");
          } else {
            setError(
              result.message ||
                `Неверный код. Осталось попыток: ${result.attemptsRemaining}`
            );
          }
        } else {
          setError(result.message || "Неверный код подтверждения");
        }
        // Очищаем введённый код
        setSmsCode("");
      }
    } catch (err) {
      setError("Ошибка подключения к серверу");
    } finally {
      setLoading(false);
    }
  };

  // Форматирование времени блокировки
  const formatBlockTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours} ч. ${minutes} мин.`;
    }
    if (minutes > 0) {
      return `${minutes} мин. ${secs} сек.`;
    }
    return `${secs} сек.`;
  };

  return (
    <>
      <dialog
        ref={dialogRef}
        onClose={closeModal}
        className="backdrop:bg-black/60 backdrop:backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full mx-auto"
      >
        <div className="p-6 sm:p-8">
          {/* Заголовок */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Подтверждение заказа
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Код отправлен на номер
            </p>
            <p className="font-medium text-gray-900">{phoneNumber}</p>
          </div>

          {isBlocked ? (
            /* Экран блокировки */
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-600">
                Номер заблокирован
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Превышено количество попыток ввода кода.
              </p>
              <p className="text-sm text-gray-600">
                Попробуйте через{" "}
                <span className="font-medium">{formatBlockTime(blockTimer)}</span>
              </p>
              <Button
                variant="outline"
                onClick={closeModal}
                className="mt-6"
              >
                Закрыть
              </Button>
            </div>
          ) : (
            /* Форма ввода кода */
            <>
              {/* Поля ввода кода */}
              <div className="flex justify-center gap-3 mb-4">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={smsCode[index] || ""}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={loading}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                               disabled:bg-gray-100 disabled:cursor-not-allowed
                               transition-all"
                  />
                ))}
              </div>

              {/* Индикатор попыток */}
              {attemptsRemaining < 3 && (
                <div className="text-center mb-4">
                  <span
                    className={`text-sm font-medium ${
                      attemptsRemaining === 1 ? "text-red-600" : "text-orange-600"
                    }`}
                  >
                    Осталось попыток: {attemptsRemaining}
                  </span>
                </div>
              )}

              {/* Ошибка */}
              {error && (
                <div className="text-center mb-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Кнопка подтверждения */}
              <Button
                onClick={handleSendCode}
                disabled={smsCode.length !== 4 || loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg
                           disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
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
                    Проверка...
                  </span>
                ) : (
                  "Подтвердить заказ"
                )}
              </Button>

              {/* Кнопка закрытия */}
              <div className="text-center mt-4">
                <Button variant="link" onClick={closeModal} className="text-gray-500">
                  Отмена
                </Button>
              </div>
            </>
          )}
        </div>
      </dialog>

      {isConfirmationModalOpen && (
        <OrderConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={onClose}
          orderData={orderData}
        />
      )}
    </>
  );
}
