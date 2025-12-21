"use client";

import { Product } from "@/app/lib/interfaces/product.interface";
import { ProductCard } from "@/app/components/Home";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  className?: string;
}

export default function ProductGrid({
  products,
  loading,
  className,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className={`${className || ""}`}>
        <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-white rounded-lg overflow-hidden"
              style={{ boxShadow: "0px 15px 64px 0px rgba(0, 0, 0, 0.05)" }}
            >
              <div className="w-full h-[300px] bg-gray-200"></div>
              <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className={`${className || ""}`}>
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-qgray mb-4"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-xl font-600 text-qblack mb-2">
            Товары не найдены
          </h3>
          <p className="text-qgray text-sm">
            Попробуйте изменить параметры фильтра
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className || ""}`}>
      <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5">
        {products.map((product) => (
          <div key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
