"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sendSmsCodeOrder, fetchOrderDetails } from "@/app/lib/data";
import { OrderDataViewModel } from "@/app/lib/interfaces/OrderDataViewModel.interface";
import OrderConfirmationModal from "./OrderConfirmationModal";

interface SmsVerificationModalProps {
  phoneNumber: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SmsVerificationModal({
  phoneNumber,
  isOpen,
  onClose,
}: SmsVerificationModalProps) {
  const [smsCode, setSmsCode] = useState("");
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderDataViewModel | null>(null);
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const closeModal = () => {
    dialogRef.current?.close();
    router.push("/");
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (rect) {
      const isInDialog =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!isInDialog) {
        closeModal();
      }
    }
  };

  const handleSendCode = async () => {
    if (!smsCode.trim()) {
      setError("Введите код из SMS");
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
        setError("Ошибка: необходимые данные не найдены.");
        setLoading(false);
        return;
      }

      let region, city, street, houseNumber;

      if (uniqueCode === "Courier") {
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
        const orderDetails = await fetchOrderDetails(orderId);
        setOrderData(orderDetails);

        // Clear localStorage
        localStorage.removeItem("phoneNumber");
        localStorage.removeItem("hashedCode");
        localStorage.removeItem("salt");
        localStorage.removeItem("orderId");
        localStorage.removeItem("deliveryType");
        localStorage.removeItem("redirectUrl");

        if (uniqueCode === "Courier") {
          localStorage.removeItem("region");
          localStorage.removeItem("city");
          localStorage.removeItem("street");
          localStorage.removeItem("houseNumber");
        }

        setIsConfirmationModalOpen(true);
      } else {
        setError(result.message || "Неверный код");
      }
    } catch (err) {
      setError((err as Error).message || "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Mask middle digits for privacy
    if (phone.length > 6) {
      return phone.slice(0, 4) + "****" + phone.slice(-4);
    }
    return phone;
  };

  return (
    <>
      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        onClose={closeModal}
        className="backdrop:bg-black/60 backdrop:backdrop-blur-sm p-0 rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="bg-white rounded-lg p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-[22px] font-bold text-qblack mb-2">
                Подтверждение заказа
              </h2>
              <p className="text-[14px] text-qgray">
                Введите код из SMS, отправленный на номер{" "}
                <span className="font-medium text-qblack">
                  {formatPhoneNumber(phoneNumber)}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="w-8 h-8 flex items-center justify-center text-qgray hover:text-qblack transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M13 1L1 13M1 1L13 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* SMS Code Input */}
          <div className="mb-6">
            <label className="block text-[13px] font-medium text-qblack mb-2">
              Код из SMS
            </label>
            <input
              type="text"
              value={smsCode}
              onChange={(e) => {
                setSmsCode(e.target.value);
                setError(null);
              }}
              placeholder="Введите 6-значный код"
              maxLength={6}
              className={`w-full h-[55px] px-4 text-center text-[24px] tracking-[0.5em] font-medium border rounded focus:outline-none transition-colors ${
                error
                  ? "border-qred focus:border-qred"
                  : "border-[#EDEDED] focus:border-qyellow"
              }`}
              autoFocus
            />
            {error && (
              <p className="text-qred text-[13px] mt-2">{error}</p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleSendCode}
              disabled={loading || !smsCode.trim()}
              className="w-full h-[50px] bg-qblack hover:bg-qyellow text-white hover:text-qblack font-semibold text-[15px] rounded transition-colors disabled:bg-qgray disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
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
                "Подтвердить"
              )}
            </button>

            <button
              type="button"
              onClick={closeModal}
              className="w-full h-[50px] bg-[#F6F6F6] hover:bg-[#EDEDED] text-qblack font-semibold text-[15px] rounded transition-colors"
            >
              Отмена
            </button>
          </div>

          {/* Resend Link */}
          <div className="mt-6 text-center">
            <p className="text-[13px] text-qgray">
              Не получили код?{" "}
              <button
                type="button"
                className="text-qyellow hover:underline font-medium"
                onClick={() => {
                  // Resend logic would go here
                  alert("Код отправлен повторно");
                }}
              >
                Отправить повторно
              </button>
            </p>
          </div>
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
