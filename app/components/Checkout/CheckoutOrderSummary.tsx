"use client";

import Image from "next/image";
import { CartItemInterface } from "@/app/lib/interfaces/cart.item.interface";

interface CheckoutOrderSummaryProps {
  items: CartItemInterface[];
  totalPrice: number;
  deliveryMethod: string;
  className?: string;
}

export default function CheckoutOrderSummary({
  items,
  totalPrice,
  deliveryMethod,
  className,
}: CheckoutOrderSummaryProps) {
  const deliveryFee = deliveryMethod === "Courier" ? Math.round(totalPrice * 0.1) : 0;
  const finalTotal = totalPrice + deliveryFee;

  return (
    <div className={`w-full bg-white border border-[#EDEDED] rounded-lg ${className || ""}`}>
      {/* Header */}
      <div className="px-[30px] py-[20px] border-b border-[#EDEDED]">
        <h3 className="text-[18px] font-bold text-qblack">
          Ваш заказ ({items.length} {getItemsWord(items.length)})
        </h3>
      </div>

      {/* Items List */}
      <div className="px-[30px] py-[20px] border-b border-[#EDEDED] max-h-[400px] overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.uniqueOrderId || item.productId}
            className="flex gap-4 mb-4 last:mb-0"
          >
            {/* Product Image */}
            <div className="w-[65px] h-[65px] relative flex-shrink-0 bg-[#F6F6F6] rounded overflow-hidden">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#999"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-medium text-qblack truncate mb-1">
                {item.name}
              </h4>
              {item.selectedProperties && (
                <p className="text-[12px] text-qgray mb-1">
                  {item.selectedProperties}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-qgray">
                  {item.quantity} x {item.price.toLocaleString()} ₸
                </span>
                <span className="text-[14px] font-semibold text-qblack">
                  {(item.price * item.quantity).toLocaleString()} ₸
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="px-[30px] py-[20px]">
        {/* Subtotal */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-[14px] text-qgray">Подитог</span>
          <span className="text-[14px] font-medium text-qblack">
            {totalPrice.toLocaleString()} ₸
          </span>
        </div>

        {/* Delivery */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-[14px] text-qgray">Доставка</span>
          <span className="text-[14px] font-medium text-qblack">
            {deliveryFee > 0 ? `${deliveryFee.toLocaleString()} ₸` : "Бесплатно"}
          </span>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-[#EDEDED] my-4" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-[16px] font-bold text-qblack">Итого</span>
          <span className="text-[20px] font-bold text-qred">
            {finalTotal.toLocaleString()} ₸
          </span>
        </div>
      </div>
    </div>
  );
}

function getItemsWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return "товаров";
  }

  if (lastDigit === 1) {
    return "товар";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "товара";
  }

  return "товаров";
}
