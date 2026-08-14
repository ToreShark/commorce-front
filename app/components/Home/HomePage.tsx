"use client";

import { useEffect, useState } from "react";
import { Product } from "@/app/lib/interfaces/product.interface";
import { fetchProducts } from "@/app/lib/data";
import Banner from "./Banner";
import CategorySection from "./CategorySection";
import ProductSection from "./ProductSection";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Split products for different sections
  const newProducts = products.slice(0, 8);
  const popularProducts = products.slice(8, 16);

  return (
    <main className="w-full">
      {/* Hero Banner with Products Grid */}
      <Banner className="mb-[60px]" products={products} />

      {/* Categories Section */}
      <CategorySection className="mb-[60px]" />

      {/* New Products Section */}
      {!loading && newProducts.length > 0 && (
        <ProductSection
          title="Новинки"
          products={newProducts}
          seeMoreUrl="/shop?sort=newest"
          className="mb-[60px]"
        />
      )}

      {/* Popular Products */}
      {!loading && popularProducts.length > 0 && (
        <ProductSection
          title="Популярные товары"
          products={popularProducts}
          seeMoreUrl="/shop?sort=popular"
          className="mb-[60px]"
        />
      )}
    </main>
  );
}
