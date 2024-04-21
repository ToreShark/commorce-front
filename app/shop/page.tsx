"use client";
import Link from "next/link";
import { SetStateAction, useEffect, useState } from "react";
import { fetchProducts } from "../lib/data";
import { Product } from "../lib/interfaces/product.interface";
import ShopPageComponent from "../ui/categoryDetail";

export default function ShopPage() {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<
    { id: string; name: string | undefined }[]
  >([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  //   const products = (await fetchProducts()) || [];

  const extractCategories = (products: Product[]) => {
    const uniqueCategories = [];
    const map = new Map();

    for (const product of products) {
      if (!map.has(product.categoryId)) {
        map.set(product.categoryId, true); // установка уникальных id категорий
        uniqueCategories.push({
          id: product.categoryId,
          name: product.categoryName,
        });
      }
    }

    return uniqueCategories;
  };
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
        setCategories(extractCategories(initialProducts));
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

  const handleFilterUpdate = async (categoryId?: string) => {
    console.log(categoryId);
    const updatedProducts = await fetchProducts(
      minPrice,
      maxPrice,
      categoryId !== undefined ? categoryId : undefined
    );
    setProducts(updatedProducts || []);
    setSelectedCategoryId(categoryId || "");
  };

  return (
    <div className="px-4 sm:px-8">
      <div className="hidden md:grid grid-cols-4 gap-4">
        <div className="col-span-1">
          {/* Блок с категориями */}
          <div className="mb-4">
            <div className="grid gap-2">
              {categories.map(({ id, name }) => (
                <button
                  key={id}
                  onClick={() => handleFilterUpdate(id)}
                  className={`py-2 px-4 rounded-md border ${
                    selectedCategoryId === id
                      ? "bg-indigo-500 text-white"
                      : "bg-white text-gray-800"
                  } shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Блок с ценами */}
          <div className="flex items-center">
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
                value={minPrice || ""}
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
                value={maxPrice || ""}
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
