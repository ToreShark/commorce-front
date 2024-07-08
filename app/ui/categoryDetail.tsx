import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import Link from "@/node_modules/next/link";
import Image from "next/image";
import { useContext } from "react";
import { CartContext } from "../lib/CartContext";
import { CartItemInterface } from "../lib/interfaces/cart.item.interface";
import { Product } from "../lib/interfaces/product.interface";

const ProductItem = dynamic(() => import("../shop/ProductItem"), {
  ssr: false,
});

interface ProductsProps {
  products: Product[];
  addProductToCart: (product: Product) => void;
}

const ShopPageComponent: React.FC<ProductsProps> = ({ products, addProductToCart }) => {
  const { addItemToCart } = useContext(CartContext);

  if (!products || products.length === 0) {
    return <p>Продукты недоступны.</p>;
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Наши продукты для
          </h2>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ProductItem
              key={product.id}
              product={{
                id: product.id,
                imageUrl: `${process.env.NEXT_PUBLIC_API_URL}${product.images[0]?.imagePath || ""}`,
                name: product.name,
                price: product.price,
                slug: product.slug,
                categoryName: product.categoryName,
                addProductToCart,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopPageComponent;
