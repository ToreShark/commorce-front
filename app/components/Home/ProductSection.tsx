"use client";

import { Product } from "@/app/lib/interfaces/product.interface";
import ProductCard from "./ProductCard";
import SectionTitle from "./SectionTitle";

interface ProductSectionProps {
  title: string;
  products: Product[];
  seeMoreUrl?: string;
  className?: string;
}

export default function ProductSection({
  title,
  products,
  seeMoreUrl = "/shop",
  className,
}: ProductSectionProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className={`product-section ${className || ""}`}>
      <div className="container-x mx-auto">
        <SectionTitle title={title} seeMoreUrl={seeMoreUrl} />
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
