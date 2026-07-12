"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Layout from "@/app/components/Layout";
import { Breadcrumb, ProductsFilter, ProductGrid } from "@/app/components/Shop";
import { fetchCategories, fetchProducts } from "@/app/lib/data";
import Category from "@/app/lib/interfaces/category.interace";
import { Product } from "@/app/lib/interfaces/product.interface";

const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Меню и карточки категорий ведут на /shop?category={slug}, а карточка товара —
// на ?category={guid}. Бэкенд принимает только GUID: всё остальное биндится в
// null, и фильтр молча отключается, отдавая весь каталог.
function resolveCategoryId(param: string, categories: Category[]): string {
  if (!param) return "";
  if (GUID_PATTERN.test(param)) return param;

  const match = categories.find(
    (category) => category.slug?.toLowerCase() === param.toLowerCase()
  );

  if (!match && process.env.NODE_ENV === "development") {
    console.warn(`[SHOP] Категория "${param}" не найдена, фильтр не применён`);
  }

  return match?.id ?? "";
}

export default function ShopPage() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [filterToggle, setFilterToggle] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 1000000]);
  const [sortBy, setSortBy] = useState("default");

  // Calculate price bounds from products
  const calculatePriceBounds = (products: Product[]): [number, number] => {
    if (products.length === 0) return [0, 1000000];
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    products.forEach((product) => {
      if (product.price < min) min = product.price;
      if (product.price > max) max = product.price;
    });

    return [Math.floor(min), Math.ceil(max)];
  };

  // Load products
  const loadProducts = useCallback(
    async (minPrice?: number, maxPrice?: number, categoryId?: string) => {
      setLoading(true);
      try {
        const data = await fetchProducts(
          minPrice ?? priceRange[0],
          maxPrice ?? priceRange[1],
          categoryId ?? selectedCategoryId
        );
        setProducts(data || []);

        // Update price bounds only on initial load
        if (minPrice === undefined && maxPrice === undefined) {
          const bounds = calculatePriceBounds(data || []);
          setPriceBounds(bounds);
          setPriceRange(bounds);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [priceRange, selectedCategoryId]
  );

  // Load categories
  useEffect(() => {
    fetchCategories()
      .then((data: Category[]) => setCategories(data || []))
      .catch((error) => {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      })
      .finally(() => setCategoriesLoaded(true));
  }, []);

  // Load products — только после категорий, иначе slug из URL не в чем резолвить
  useEffect(() => {
    if (!categoriesLoaded) return;

    const categoryId = resolveCategoryId(categoryFromUrl, categories);
    setSelectedCategoryId(categoryId);
    loadProducts(undefined, undefined, categoryId);
  }, [categoriesLoaded, categories, categoryFromUrl]);

  // Handle category change
  const handleCategoryChange = useCallback(
    async (categoryId: string) => {
      setSelectedCategoryId(categoryId);
      const data = await fetchProducts(priceRange[0], priceRange[1], categoryId);
      setProducts(data || []);
    },
    [priceRange]
  );

  // Handle price change
  const handlePriceChange = useCallback(
    async (min: number, max: number) => {
      setPriceRange([min, max]);
      const data = await fetchProducts(min, max, selectedCategoryId);
      setProducts(data || []);
    },
    [selectedCategoryId]
  );

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name":
        return (a.name || a.title).localeCompare(b.name || b.title);
      default:
        return 0;
    }
  });

  const breadcrumbPaths = [
    { name: "Главная", path: "/" },
    { name: "Каталог", path: "/shop" },
  ];

  return (
    <Layout>
      <div className="products-page-wrapper w-full pt-[30px] pb-[60px]">
        <div className="container-x mx-auto">
          <Breadcrumb paths={breadcrumbPaths} />

          <div className="w-full lg:flex lg:space-x-[30px]">
            {/* Sidebar Filter */}
            <div className="lg:w-[270px]">
              <ProductsFilter
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onCategoryChange={handleCategoryChange}
                priceRange={priceRange}
                priceBounds={priceBounds}
                onPriceChange={handlePriceChange}
                filterToggle={filterToggle}
                onFilterToggle={() => setFilterToggle(!filterToggle)}
                className="mb-[30px]"
              />
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Sorting Bar */}
              <div className="products-sorting w-full bg-white md:h-[70px] flex md:flex-row flex-col md:space-y-0 space-y-5 md:justify-between md:items-center p-[30px] mb-[40px] rounded-lg">
                <div>
                  <p className="font-400 text-[13px]">
                    <span className="text-qgray">Показано</span>{" "}
                    {sortedProducts.length} товаров
                  </p>
                </div>

                <div className="flex space-x-3 items-center">
                  <span className="font-400 text-[13px]">Сортировка:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="font-400 text-[13px] text-qgray border-b border-b-qgray bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="default">По умолчанию</option>
                    <option value="price-low">Сначала дешевые</option>
                    <option value="price-high">Сначала дорогие</option>
                    <option value="name">По названию</option>
                  </select>
                </div>

                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setFilterToggle(!filterToggle)}
                  type="button"
                  className="w-10 lg:hidden h-10 rounded flex justify-center items-center border border-qyellow text-qyellow"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </button>
              </div>

              {/* Products */}
              <ProductGrid
                products={sortedProducts}
                loading={loading}
                className="mb-[40px]"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
