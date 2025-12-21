"use client";

import Link from "next/link";

export default function EmptyCart() {
  return (
    <div className="empty-cart w-full py-[100px] flex flex-col items-center justify-center">
      {/* Cart Icon */}
      <div className="mb-8">
        <svg
          width="100"
          height="100"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-qgray"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-qblack mb-4">Корзина пуста</h2>

      {/* Description */}
      <p className="text-qgray text-center mb-8 max-w-md">
        Похоже, вы еще не добавили товары в корзину. Перейдите в каталог, чтобы
        начать покупки.
      </p>

      {/* CTA Button */}
      <Link href="/shop">
        <button
          type="button"
          className="h-[50px] px-8 bg-qyellow hover:bg-qyellow/90 text-qblack font-semibold text-sm rounded transition-colors flex justify-center items-center"
        >
          Перейти в каталог
        </button>
      </Link>
    </div>
  );
}
