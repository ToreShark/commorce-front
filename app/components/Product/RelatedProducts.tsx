"use client";

import { useEffect, useState } from "react";
import { Product } from "@/app/lib/interfaces/product.interface";
import { fetchProducts } from "@/app/lib/data";
import { ProductCard } from "@/app/components/Home";

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
  className?: string;
}

export default function RelatedProducts({
  categoryId,
  currentProductId,
  className,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRelatedProducts = async () => {
      try {
        const data = await fetchProducts(0, 1000000, categoryId);
        // Filter out current product and limit to 4
        const filtered = (data || [])
          .filter((p) => p.id !== currentProductId)
          .slice(0, 4);
        setProducts(filtered);
      } catch (error) {
        console.error("Failed to fetch related products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      loadRelatedProducts();
    } else {
      setLoading(false);
    }
  }, [categoryId, currentProductId]);

  if (loading) {
    return (
      <div className={`related-products ${className || ""}`}>
        <div className="container-x mx-auto">
          <div className="py-[60px]">
            <h2 className="sm:text-3xl text-xl font-600 text-qblacktext leading-none mb-[30px]">
              Похожие товары
            </h2>
            <div className="grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse bg-white rounded-lg overflow-hidden"
                  style={{ boxShadow: "0px 15px 64px 0px rgba(0, 0, 0, 0.05)" }}
                >
                  <div className="w-full h-[250px] bg-gray-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={`related-products bg-white ${className || ""}`}>
      <div className="container-x mx-auto">
        <div className="py-[60px]">
          <h2 className="sm:text-3xl text-xl font-600 text-qblacktext leading-none mb-[30px]">
            Похожие товары
          </h2>
          <div className="grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5">
            {products.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
