"use client";

import Link from "next/link";

interface CartSummaryProps {
  totalPrice: number;
  itemCount: number;
  className?: string;
}

export default function CartSummary({
  totalPrice,
  itemCount,
  className,
}: CartSummaryProps) {
  return (
    <div
      className={`w-full sm:w-[370px] border border-[#EDEDED] rounded-lg px-[30px] py-[26px] ${
        className || ""
      }`}
    >
      {/* Subtotal */}
      <div className="sub-total mb-6">
        <div className="flex justify-between mb-4">
          <p className="text-[15px] font-medium text-qblack">Товаров</p>
          <p className="text-[15px] font-medium text-qgray">{itemCount} шт.</p>
        </div>
        <div className="flex justify-between mb-6">
          <p className="text-[15px] font-medium text-qblack">Подитог</p>
          <p className="text-[15px] font-medium text-qblack">
            {totalPrice.toLocaleString()} ₸
          </p>
        </div>
        <div className="w-full h-[1px] bg-[#EDEDED]"></div>
      </div>

      {/* Shipping Info */}
      <div className="shipping mb-6">
        <span className="text-[15px] font-medium text-qblack mb-[18px] block">
          Доставка
        </span>
        <p className="text-[13px] text-qgray leading-6">
          Стоимость доставки рассчитывается при оформлении заказа в зависимости
          от вашего адреса.
        </p>
      </div>

      {/* Total */}
      <div className="total mb-6">
        <div className="flex justify-between">
          <p className="text-[18px] font-medium text-qblack">Итого</p>
          <p className="text-[18px] font-medium text-qred">
            {totalPrice.toLocaleString()} ₸
          </p>
        </div>
      </div>

      {/* Checkout Button */}
      <Link href="/order">
        <button
          type="button"
          className="w-full h-[50px] bg-qblack hover:bg-qyellow text-white hover:text-qblack font-semibold text-sm rounded transition-colors flex justify-center items-center"
        >
          Оформить заказ
        </button>
      </Link>

      {/* Continue Shopping */}
      <Link href="/shop">
        <button
          type="button"
          className="w-full h-[50px] bg-[#F6F6F6] hover:bg-[#EDEDED] text-qblack font-semibold text-sm rounded mt-3 transition-colors flex justify-center items-center"
        >
          Продолжить покупки
        </button>
      </Link>
    </div>
  );
}
