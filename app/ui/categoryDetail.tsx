import { Button } from "@/components/ui/button";
import Link from "@/node_modules/next/link";
import Image from "next/image";
import { useContext } from "react";
import { CartContext } from "../lib/CartContext";
import { CartItemInterface } from "../lib/interfaces/cart.item.interface";
import { Product } from "../lib/interfaces/product.interface";


interface ProductsProps {
  products: Product[];
}

const ShopPageComponent: React.FC<ProductsProps> = ({ products }) => {
  const {addItemToCart} = useContext(CartContext);

  const addProductToCart = (product: Product) => {
    const newItem: CartItemInterface = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1, // Устанавливаем начальное количество
      imageUrl: `${process.env.NEXT_PUBLIC_API_URL}${product.images[0].imagePath}`
    };
    addItemToCart(newItem);
  };

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
            <div key={product.id} className="group relative">
              <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-80 relative">
                {product.images && product.images.length > 0 ? (
                  <>
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}${product.images[0].imagePath}`}
                    alt={`Изображение продукта ${product.name}`}
                    className="h-full w-full object-cover object-center"
                    width={300}
                    height={300}
                    priority
                  />
                  <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button onClick={() => addProductToCart(product)}>Добавить</Button>
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopPageComponent;
