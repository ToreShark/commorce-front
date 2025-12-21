"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { OrderDataViewModel } from "@/app/lib/interfaces/OrderDataViewModel.interface";

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: OrderDataViewModel | null;
}

export default function OrderConfirmationModal({
  isOpen,
  onClose,
  orderData,
}: OrderConfirmationModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else if (dialogRef.current?.open) {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const closeModal = () => {
    dialogRef.current?.close();
    onClose();
    const redirectUrl = localStorage.getItem("redirectUrl") || "";

    if (redirectUrl) {
      router.push(redirectUrl);
    } else {
      router.push("/");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/60 backdrop:backdrop-blur-sm p-0 rounded-lg shadow-xl max-w-lg w-full"
    >
      <div className="bg-white rounded-lg">
        {/* Success Header */}
        <div className="bg-green-50 px-8 py-6 border-b border-green-100 rounded-t-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-qblack">
                Заказ оформлен!
              </h2>
              <p className="text-[14px] text-qgray">
                Спасибо за покупку
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="px-8 py-6">
          {orderData ? (
            <div className="space-y-4">
              {/* Order Info */}
              <div className="flex justify-between items-center py-3 border-b border-[#EDEDED]">
                <span className="text-[14px] text-qgray">Номер заказа</span>
                <span className="text-[14px] font-semibold text-qblack">
                  #{orderData.referenceId || orderData.orderId.slice(0, 8)}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-[#EDEDED]">
                <span className="text-[14px] text-qgray">Дата оформления</span>
                <span className="text-[14px] font-medium text-qblack">
                  {formatDate(orderData.orderDate)}
                </span>
              </div>

              {/* Delivery */}
              {orderData.delivery && (
                <div className="py-3 border-b border-[#EDEDED]">
                  <div className="flex justify-between items-start">
                    <span className="text-[14px] text-qgray">Доставка</span>
                    <div className="text-right">
                      <span className="text-[14px] font-medium text-qblack block">
                        {orderData.delivery.description}
                      </span>
                      {orderData.delivery.uniqueCode === "Courier" &&
                        orderData.deliveryAddress && (
                          <span className="text-[13px] text-qgray block mt-1">
                            {orderData.deliveryAddress.region},{" "}
                            {orderData.deliveryAddress.city},{" "}
                            {orderData.deliveryAddress.street},{" "}
                            {orderData.deliveryAddress.houseNumber}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment */}
              {orderData.payment && (
                <div className="flex justify-between items-center py-3 border-b border-[#EDEDED]">
                  <span className="text-[14px] text-qgray">Способ оплаты</span>
                  <span className="text-[14px] font-medium text-qblack">
                    {orderData.payment.description}
                  </span>
                </div>
              )}

              {/* Items */}
              <div className="py-3">
                <span className="text-[14px] font-medium text-qblack block mb-3">
                  Товары ({orderData.items.length})
                </span>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {orderData.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between items-center py-2 px-3 bg-[#F6F6F6] rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-[13px] text-qblack truncate block">
                          {item.productName}
                        </span>
                        <span className="text-[12px] text-qgray">
                          {item.quantity} x {item.price.toLocaleString()} ₸
                        </span>
                      </div>
                      <span className="text-[14px] font-medium text-qblack ml-4">
                        {item.itemTotalPrice.toLocaleString()} ₸
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t-2 border-[#EDEDED]">
                <span className="text-[16px] font-bold text-qblack">Итого</span>
                <span className="text-[20px] font-bold text-qred">
                  {orderData.totalPrice.toLocaleString()} ₸
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-qyellow" viewBox="0 0 24 24">
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
                <span className="text-[14px] text-qgray">
                  Загрузка деталей заказа...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-8 py-6 border-t border-[#EDEDED] bg-[#F9F9F9] rounded-b-lg">
          <button
            type="button"
            onClick={closeModal}
            className="w-full h-[50px] bg-qblack hover:bg-qyellow text-white hover:text-qblack font-semibold text-[15px] rounded transition-colors"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    </dialog>
  );
}
