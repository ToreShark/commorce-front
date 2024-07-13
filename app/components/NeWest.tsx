'use client';
import { useProducts } from "@/app/lib/ProductContext";
import Link from "@/node_modules/next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchProducts } from "../lib/data";
import { Product } from "../lib/interfaces/product.interface";
import ProductsComponent from "../ui/products";


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function loadProducts() {
      try {
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts); // Теперь это должно работать без ошибок типизации
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (isLoading) return <p>Loading products...</p>;
  if (error) return <p>{error}</p>;
  if (!products) return <p>No products found</p>;
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
