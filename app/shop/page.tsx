"use client";
import dynamic from "next/dynamic";
import { Suspense, useContext, useEffect, useState, useCallback } from "react";
import { CartContext } from "../lib/CartContext";
import { fetchProducts } from "../lib/data";
import { CartItemInterface } from "../lib/interfaces/cart.item.interface";
import { Product } from "../lib/interfaces/product.interface";
import ShopPageComponent from "../ui/categoryDetail";
import usePriceRange from "./usePriceRange";

const CategoryList = dynamic(() => import("./props/CategoryList"), {
  loading: () => <p>Загрузка категорий...</p>,
});

const PriceFilter = dynamic(() => import("./props/PriceFilter"), {
  loading: () => <p>Загрузка фильтра цен...</p>,
});

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<
    { id: string; name: string | undefined }[]
  >([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { range, bounds, updateRange, updateBounds } = usePriceRange(0, 100000);

  const { addItemToCart } = useContext(CartContext);

  const extractCategories = (products: Product[]) => {
    const uniqueCategories = [];
    const map = new Map();

    for (const product of products) {
      if (!map.has(product.categoryId)) {
        map.set(product.categoryId, true);
        uniqueCategories.push({
          id: product.categoryId,
          name: product.categoryName,
        });
      }
    }

    return uniqueCategories;
  };

  const calculatePriceRange = (products: Product[]) => {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    products.forEach((product) => {
      if (product.price < min) min = product.price;
      if (product.price > max) max = product.price;
    });

    return { min, max };
  };

  useEffect(() => {
    async function loadProductsAndSetPriceRange() {
      const initialProducts = await fetchProducts();

      if (initialProducts) {
        const { min, max } = calculatePriceRange(initialProducts);
        updateBounds(min, max);
        updateRange(min, max);
        setProducts(initialProducts);
        setCategories(extractCategories(initialProducts));
      } else {
        setProducts([]);
      }
    }
    loadProductsAndSetPriceRange();
  }, []);

  const handlePriceUpdate = useCallback(
    async (newMin: number, newMax: number) => {
      const updatedProducts = await fetchProducts(
        newMin,
        newMax,
        selectedCategoryId
      );
      setProducts(updatedProducts || []);
    },
    [selectedCategoryId]
  );

  const handleFilterUpdate = useCallback(
    async (categoryId?: string) => {
      const updatedProducts = await fetchProducts(
        range[0],
        range[1],
        categoryId !== undefined ? categoryId : undefined
      );
      setProducts(updatedProducts || []);
      setSelectedCategoryId(categoryId || "");
    },
    [range]
  );

  const addProductToCart = (product: Product) => {
    const newItem: CartItemInterface = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl:
        product.images && product.images.length > 0
          ? `${process.env.NEXT_PUBLIC_API_URL}${product.images[0].imagePath}`
          : "",
    };
    addItemToCart(newItem);
  };

  return (
    <div className="px-4 sm:px-8">
      <div className="block md:hidden mb-4">
        <button
          className="w-full bg-white text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-lg shadow-sm transition duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Скрыть фильтры" : "Выбрать товар"}
          <svg
            className={`inline-block ml-2 h-4 w-4 transition-transform duration-200 ${
              showFilters ? "rotate-180" : ""
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="md:grid md:grid-cols-4 md:gap-4">
        <div
          className={`col-span-1 ${showFilters ? "block" : "hidden"} md:block`}
        >
          <Suspense fallback={<div>Загрузка категорий...</div>}>
            <CategoryList
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              handleFilterUpdate={handleFilterUpdate}
            />
          </Suspense>
          <Suspense fallback={<div>Загрузка фильтра цен...</div>}>
            <PriceFilter
              range={range}
              bounds={bounds}
              onRangeChange={updateRange}
              onPriceUpdate={handlePriceUpdate}
            />
          </Suspense>
        </div>
        <div className="col-span-3 md:col-span-3">
          <ShopPageComponent
            products={products}
            addProductToCart={addProductToCart}
          />
        </div>
      </div>
    </div>
  );
}
