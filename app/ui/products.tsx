// products.server.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "../lib/interfaces/product.interface";

interface ProductsProps {
  products: Product[];
}

const ProductsComponent: React.FC<ProductsProps> = ({ products }) => {
  const sortedProducts = React.useMemo(() => {
    if (!Array.isArray(products)) {
      console.error("products is not an array:", products);
      return [];
    }
    return [...products]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return isNaN(dateB) || isNaN(dateA) ? 0 : dateB - dateA;
      })
      .slice(0, 4);
  }, [products]);

  if (!products || products.length === 0) {
    return <p>No products available.</p>;
  }

  return (
    <div>
      {/* Десктопная версия */}
      <div className="hidden lg:grid mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {sortedProducts.map((product) => (
          <div key={product.id} className="group relative">
            <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-80">
              {product.images &&
              product.images.length > 0 &&
              product.images[0].imagePath ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}${product.images[0].imagePath}`}
                  alt={`Image of ${product.name}`}
                  className="h-full w-full object-cover object-center"
                  width={300}
                  height={300}
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  No image available
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-between">
              <div>
                <h3 className="text-sm text-gray-700">
                  <Link href={`/product/${product.slug}`}>{product.name}</Link>
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {product.categoryName}
                </p>
              </div>
              <p className="text-sm font-medium text-gray-900">
                ₸{product.price}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* Мобильная версия */}
      <div className="grid grid-cols-2 gap-2 lg:hidden">
        {sortedProducts.map((product) => (
          <Link key={product.id} href={`/product/${product.slug}`}>
            <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200">
              {product.images &&
              product.images.length > 0 &&
              product.images[0].imagePath ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}${product.images[0].imagePath}`}
                  alt={`Image of ${product.name}`}
                  className="h-full w-full object-cover object-center"
                  width={300}
                  height={300}
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  No image available
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductsComponent;
