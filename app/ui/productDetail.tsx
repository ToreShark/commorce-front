import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '../lib/interfaces/product.interface';

interface ProductDetailProps {
  product: Product | null;
}

const ProductDetailComponent: React.FC<ProductDetailProps> = ({ product }) => {
  if (!product) {
    return <p>Product not available.</p>;
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-80">
            {/* {product.images && product.images.length > 0 && product.images[0].imagePath ? (
              <Image
                src={`https://localhost:7264${product.images[0].imagePath}`}
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
            )} */}
          </div>
          <div className="md:py-8">
            <div className="mb-2 md:mb-3">
              <span className="mb-0.5 inline-block text-gray-500">{product.categoryName}</span>
              <h2 className="text-2xl font-bold text-gray-800 lg:text-3xl">{product.name}</h2>
            </div>
            <div className="mb-4 flex items-end gap-2">
              <span className="text-xl font-bold text-gray-800 md:text-2xl">${product.price}</span>
              <span className="mb-0.5 text-red-500 line-through">${product.price + 30}</span>
            </div>
            <span className="text-sm text-gray-500">Incl. Vat plus shipping</span>
            <div className="mb-6 flex items-center gap-2 text-gray-500">
              <span className="w-6 h-6">{/* Truck icon placeholder */}</span>
              <span className="text-sm">2-4 Day Shipping</span>
            </div>
            <p className="mt-12 text-base text-gray-500 tracking-wide">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailComponent;