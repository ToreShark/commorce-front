"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchProducts } from "../lib/data";
import { Product } from "../lib/interfaces/product.interface";
import ShopPageComponent from "../ui/categoryDetail";

export default function ShopPage() {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);
  const [products, setProducts] = useState<Product[]>([]);
  //   const products = (await fetchProducts()) || [];

  const calculatePriceRange = (products: any[]) => {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    products.forEach((product) => {
      if (product.price < min) min = product.price;
      if (product.price > max) max = product.price;
    });

    return { min, max };
  };
  // Загрузка продуктов и установка начальных значений цен
  useEffect(() => {
    async function loadProductsAndSetPriceRange() {
      const initialProducts = await fetchProducts(); // Предполагается, что это может вернуть `Product[]` или `null`

      if (initialProducts) {
        // Проверяем, что initialProducts не null
        const { min, max } = calculatePriceRange(initialProducts);
        setMinPrice(min);
        setMaxPrice(max);
        setProducts(initialProducts); // Устанавливаем продукты только если они не null
      } else {
        setProducts([]); // Если initialProducts null, устанавливаем пустой массив
      }
    }
    loadProductsAndSetPriceRange();
  }, []);

  const handlePriceUpdate = async () => {
    const updatedProducts = await fetchProducts(minPrice, maxPrice);
    setProducts(updatedProducts || []);
  };

  return (
    <div className="px-4 sm:px-8">
      <div className="hidden md:grid grid-cols-4 gap-4">
        {/* <div className="col-span-1">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
            placeholder="Min Price"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            placeholder="Max Price"
          />
          <button onClick={handlePriceUpdate}>Apply Prices</button>
        </div> */}
        <div className="col-span-1">
          <div className="mb-4 flex items-center">
            <div className="mr-4">
              <label
                htmlFor="minPrice"
                className="block text-sm font-medium text-gray-700"
              >
                Мин. цена
              </label>
              <input
                type="number"
                id="minPrice"
                value={minPrice || ""} // Установка пустой строки, если minPrice равно 0
                onChange={(e) => setMinPrice(parseInt(e.target.value) || 0)}
                placeholder="Мин. цена"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="maxPrice"
                className="block text-sm font-medium text-gray-700"
              >
                Макс. цена
              </label>
              <input
                type="number"
                id="maxPrice"
                value={maxPrice || ""} // Установка пустой строки, если maxPrice равно 0
                onChange={(e) => setMaxPrice(parseInt(e.target.value) || 0)}
                placeholder="Макс. цена"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <button
            onClick={handlePriceUpdate}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Применить цены
          </button>
        </div>
        <div className="col-span-3">
          <ShopPageComponent products={products} />
        </div>
      </div>
      <div className="md:hidden">
        <ShopPageComponent products={products} />
      </div>
    </div>
  );
}
