import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ProductItemProps {
  product: {
    id: string;
    imageUrl: string;
    name: string;
    price: number;
    slug: string;
    categoryName?: string;
    addProductToCart: (product: any) => void; // Добавляем функцию для добавления в корзину
  };
}

const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  return (
    <div key={product.id} className="group relative">
      <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-80 relative">
        {product.imageUrl ? (
          <>
            <Image
              src={product.imageUrl}
              alt={`Изображение продукта ${product.name}`}
              className="h-full w-full object-cover object-center"
              width={300}
              height={300}
              priority
            />
            <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button onClick={() => product.addProductToCart(product)}>Добавить</Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            Изображение недоступно
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">
            <Link href={`/product/${product.slug}`}>
              {product.name}
            </Link>
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
  );
};

export default ProductItem;