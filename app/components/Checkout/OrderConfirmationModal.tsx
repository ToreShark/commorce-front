"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { OrderDataViewModel } from "@/app/lib/interfaces/OrderDataViewModel.interface";
import { FB_CURRENCY, fbTrack } from "@/app/lib/fbPixel";
import { gaPurchaseOnce, savePendingPurchase, type GaPurchase } from "@/app/lib/ga";
import { formatSelection } from "@/app/lib/productOptions";
import { getPromoTexts } from "@/app/lib/promo/texts";
import { PROMO_CONFIG } from "@/app/lib/promo/config";
import { usePromoClock } from "@/app/lib/promo/clock";

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: OrderDataViewModel | null;
  /** Адрес платёжной страницы банка. Пусто при оплате наличными. */
  paymentUrl?: string;
  /** Покупатель отметил участие в акции (только при оплате картой). */
  promoJoined?: boolean;
}

export default function OrderConfirmationModal({
  isOpen,
  onClose,
  orderData,
  paymentUrl,
  promoJoined = false,
}: OrderConfirmationModalProps) {
  const promoTexts = getPromoTexts().success;
  // Срок проверки — из API, как в правилах; без ответа — из своих настроек
  const holdDays = usePromoClock().config?.holdDays ?? PROMO_CONFIG.confirmDays;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else if (dialogRef.current?.open) {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  // Purchase — на экране «Заказ оформлен!»: заказ создан и подтверждён кодом.
  // При оплате картой это ещё ДО страницы банка (после неё ForteBank возвращает
  // человека на /order, а не на отдельный экран успеха), поэтому событие
  // считает оформленные заказы, а не проведённые платежи.
  // eventID = номер заказа: если событие повторится, Meta схлопнет дубль.
  const purchaseTracked = useRef(false);
  useEffect(() => {
    if (!isOpen || !orderData || purchaseTracked.current) return;
    purchaseTracked.current = true;

    fbTrack(
      "Purchase",
      {
        content_ids: orderData.items.map((item) => item.productId),
        content_type: "product",
        contents: orderData.items.map((item) => ({
          id: item.productId,
          quantity: item.quantity,
        })),
        num_items: orderData.items.reduce(
          (count, item) => count + item.quantity,
          0
        ),
        value: orderData.totalPrice,
        currency: FB_CURRENCY,
      },
      { eventID: `order-${orderData.orderId}` }
    );

    // GA4 purchase — только состоявшийся заказ. Наличные: оформлен — значит
    // состоялся. Карта: денег ещё нет, заказ ждёт подтверждения банка, purchase
    // пошлёт GaListeners, когда check-status ответит isPaid (один раз на заказ).
    const purchase: GaPurchase = {
      transaction_id: orderData.orderId,
      value: Math.round(orderData.totalPrice),
      shipping: orderData.delivery?.amount ? Math.round(orderData.delivery.amount) : undefined,
      items: orderData.items.map((item) => ({
        item_id: item.productId,
        item_name: item.productName,
        price: item.price,
        quantity: item.quantity,
        item_variant: formatSelection(item.selectedPropertiesJson) || undefined,
      })),
    };
    if (paymentUrl) {
      savePendingPurchase(purchase);
    } else {
      gaPurchaseOnce(purchase);
    }
  }, [isOpen, orderData, paymentUrl]);

  const goHome = () => {
    dialogRef.current?.close();
    onClose();
    localStorage.removeItem("redirectUrl");
    router.push("/");
  };

  const goToPayment = () => {
    if (!paymentUrl) {
      goHome();
      return;
    }

    dialogRef.current?.close();
    onClose();
    localStorage.removeItem("redirectUrl");
    // Страница банка — внешний адрес, router.push по нему не уходит
    window.location.href = paymentUrl;
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
                  {orderData.items.map((item, index) => (
                    <div
                      key={`${item.productId}-${index}`}
                      className="flex justify-between items-center py-2 px-3 bg-[#F6F6F6] rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-[13px] text-qblack truncate block">
                          {item.productName}
                        </span>
                        {formatSelection(item.selectedPropertiesJson) && (
                          <span className="text-[12px] text-qgray block">
                            {formatSelection(item.selectedPropertiesJson)}
                          </span>
                        )}
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
                <svg className="animate-spin h-5 w-5 text-qbrand" viewBox="0 0 24 24">
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

        {promoJoined && (
          <div className="mx-8 mb-6 border-l-4 border-qbrand bg-qbrand/[0.06] px-4 py-3">
            <p className="text-[14px] font-semibold text-qblack">{promoTexts.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#555]">
              {promoTexts.text(holdDays)}
            </p>
            <a
              href="/akciya#tablo"
              target="_blank"
              rel="noopener"
              className="mt-2 inline-block text-[13px] font-semibold text-qbrand underline underline-offset-2"
            >
              {promoTexts.cta}
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="px-8 py-6 border-t border-[#EDEDED] bg-[#F9F9F9] rounded-b-lg">
          {paymentUrl ? (
            <div className="space-y-3">
              <button
                type="button"
                onClick={goToPayment}
                className="w-full h-[50px] bg-qbrand hover:bg-qbrand/90 text-white font-semibold text-[15px] rounded transition-colors"
              >
                Оплатить заказ
              </button>
              <button
                type="button"
                onClick={goHome}
                className="w-full h-[50px] border border-[#EDEDED] bg-white hover:bg-[#F6F6F6] text-qblack font-semibold text-[15px] rounded transition-colors"
              >
                Вернуться на главную
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={goHome}
              className="w-full h-[50px] bg-qblack hover:bg-qbrand text-white hover:text-white font-semibold text-[15px] rounded transition-colors"
            >
              Вернуться на главную
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
