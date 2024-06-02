'use client';
import { useProducts } from "@/app/lib/ProductContext";
import Link from "@/node_modules/next/link";
import { ArrowRight } from "lucide-react";
import { fetchProducts } from "../lib/data";
import ProductsComponent from "../ui/products";


export default async function ProductsPage() {
  const products = await fetchProducts();
  if (!products) {
    return <p>Loading products failed...</p>;  // Или другой подход обработки ошибки
  }
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Наши новые продукты
          </h2>

          <Link className="text-primary flex items-center gap-x-1" href="/shop">
            Увидеть все{" "}
            <span>
              <ArrowRight />
            </span>
          </Link>
        </div>
            <ProductsComponent products={products} /> 
      </div>
    </div>
  );
}
