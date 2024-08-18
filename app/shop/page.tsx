"use client";
import dynamic from 'next/dynamic'
import Link from "next/link";
import { SetStateAction, Suspense, useContext, useEffect, useState } from "react";
import { CartContext } from '../lib/CartContext';
import { fetchProducts } from "../lib/data";
import { CartItemInterface } from '../lib/interfaces/cart.item.interface';
import { Product } from "../lib/interfaces/product.interface";
import ShopPageComponent from "../ui/categoryDetail";

const CategoryList = dynamic(() => import('./props/CategoryList'), {
  loading: () => <p>Загрузка категорий...</p>,
});

const PriceFilter = dynamic(() => import('./props/PriceFilter'), {
  loading: () => <p>Загрузка фильтра цен...</p>,
});

export default function ShopPage() {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<
    { id: string; name: string | undefined }[]
  >([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  //   const products = (await fetchProducts()) || [];

  const { addItemToCart } = useContext(CartContext);

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
    const updatedProducts = await fetchProducts(
      minPrice,
      maxPrice,
      categoryId !== undefined ? categoryId : undefined
    );
    setProducts(updatedProducts || []);
    setSelectedCategoryId(categoryId || "");
  };

  const addProductToCart = (product: Product) => {
    const newItem: CartItemInterface = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1, // Устанавливаем начальное количество
      imageUrl: product.images && product.images.length > 0 ? `${process.env.NEXT_PUBLIC_API_URL}${product.images[0].imagePath}` : '',
    };
    addItemToCart(newItem);
  };

  return (
    <div className="px-4 sm:px-8">
       <div className="block md:hidden mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
        </button>
      </div>

      <div className={`${showFilters ? 'block' : 'hidden'} md:grid grid-cols-4 gap-4`}>
        <div className="col-span-1">
          <Suspense fallback={<div>Загрузка категорий...</div>}>
            <CategoryList
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              handleFilterUpdate={handleFilterUpdate}
            />
          </Suspense>
          <Suspense fallback={<div>Загрузка фильтра цен...</div>}>
            <PriceFilter
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              handlePriceUpdate={handlePriceUpdate}
            />
          </Suspense>
        </div>
        <div className="col-span-3">
          <ShopPageComponent products={products} addProductToCart={addProductToCart} />
        </div>
      </div>
      <div className="md:hidden">
        <ShopPageComponent products={products} addProductToCart={addProductToCart} />
      </div>
    </div>
  );
}
