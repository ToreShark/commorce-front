"use client";

import Link from "next/link";

interface EmptyWishlistProps {
  className?: string;
}

export default function EmptyWishlist({ className }: EmptyWishlistProps) {
  return (
    <div className={`empty-wishlist w-full py-[100px] flex flex-col items-center justify-center ${className || ""}`}>
      {/* Heart Icon */}
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
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-qblack mb-4">
        Список избранного пуст
      </h2>

      {/* Description */}
      <p className="text-qgray text-center mb-8 max-w-md">
        Вы еще не добавили товары в избранное. Найдите интересующие вас товары
        и добавьте их в список желаний.
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
