"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Layout from "@/app/components/Layout";
import { Breadcrumb, ProductGrid } from "@/app/components/Shop";
import CategorySidebar from "@/app/components/Shop/CategorySidebar";
import FilterBar from "@/app/components/Shop/FilterBar";
import FilterDropdown from "@/app/components/Shop/FilterDropdown";
import { fetchCategories, fetchProducts } from "@/app/lib/data";
import Category from "@/app/lib/interfaces/category.interace";
import { Product } from "@/app/lib/interfaces/product.interface";
import {
  CatalogFilters,
  EMPTY_VALUES,
  SORT_OPTIONS,
  applyFilters,
  filtersFromParams,
  filtersToParams,
  hasActiveFilters,
  sortProducts,
} from "@/app/lib/catalogFilters";

const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Меню и карточки категорий ведут на /shop?category={slug}, а карточка товара —
// на ?category={guid}. Принимаем оба вида.
function resolveCategoryId(param: string, categories: Category[]): string {
  if (!param) return "";
  if (GUID_PATTERN.test(param)) return param;

  const match = categories.find(
    (category) => category.slug?.toLowerCase() === param.toLowerCase()
  );

  if (!match && categories.length > 0 && process.env.NODE_ENV === "development") {
    console.warn(`[SHOP] Категория "${param}" не найдена, фильтр не применён`);
  }

  return match?.id ?? "";
}

function productsWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "товар";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "товара";
  return "товаров";
}

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const categoryFromUrl = searchParams.get("category") || "";

  // Строка поиска в шапке кладёт запрос сюда.
  // Разбор: I_STORE/docs/search-relevance-task-2026-09-08.md
  const searchFromUrl = searchParams.get("search") || "";

  const paramsKey = searchParams.toString();
  const filters = useMemo(
    () => filtersFromParams(new URLSearchParams(paramsKey)),
    [paramsKey]
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then((data: Category[]) => setCategories(data || []))
      .catch((error) => {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      });
  }, []);

  // Каталог грузится целиком (по поиску, без цены и категории): категории,
  // размеры, цвета и цена отбираются на месте, иначе нечем считать счётчики.
  // searchFromUrl обязан быть в зависимостях: без него второй поиск из шапки
  // меняет адрес, но не перезапрашивает выдачу
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProducts(undefined, undefined, "", searchFromUrl)
      .then((data) => {
        if (!cancelled) setProducts(data || []);
      })
      .catch((error) => {
        console.error("Failed to fetch products:", error);
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [searchFromUrl]);

  const selectedCategoryId = resolveCategoryId(categoryFromUrl, categories);
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1));
    return counts;
  }, [products]);

  const categoryProducts = useMemo(
    () =>
      selectedCategoryId
        ? products.filter((p) => p.categoryId === selectedCategoryId)
        : products,
    [products, selectedCategoryId]
  );

  const visibleProducts = useMemo(
    () => sortProducts(applyFilters(categoryProducts, filters), filters.sort),
    [categoryProducts, filters]
  );

  const replaceParams = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname]
  );

  const changeFilters = useCallback(
    (next: CatalogFilters) => replaceParams(filtersToParams(next, new URLSearchParams(paramsKey))),
    [replaceParams, paramsKey]
  );

  // Размеры обуви к платьям не подходят — при смене категории фильтры сбрасываются,
  // сортировка и поиск остаются
  const selectCategory = useCallback(
    (categoryId: string) => {
      const params = filtersToParams(
        { ...filters, values: EMPTY_VALUES, priceFrom: null, priceTo: null },
        new URLSearchParams(paramsKey)
      );
      const slug = categories.find((c) => c.id === categoryId)?.slug;
      if (categoryId) params.set("category", slug || categoryId);
      else params.delete("category");
      replaceParams(params);
    },
    [filters, paramsKey, categories, replaceParams]
  );

  const title = searchFromUrl
    ? `Поиск: «${searchFromUrl}»`
    : selectedCategory?.name ?? "Каталог";

  const breadcrumbPaths = [
    { name: "Главная", path: "/" },
    { name: "Каталог", path: selectedCategory || searchFromUrl ? "/shop" : "" },
    ...(searchFromUrl
      ? [{ name: `Поиск: ${searchFromUrl}`, path: "" }]
      : selectedCategory
        ? [{ name: selectedCategory.name, path: "" }]
        : []),
  ];

  // Пустой поиск — это «ничего не нашлось», а не «подкрутите фильтр».
  // Показывать каталог целиком в ответ на неудачный запрос нельзя: ровно
  // это поведение и было исходной жалобой
  const emptyState =
    searchFromUrl && products.length === 0 ? (
      <div className="flex flex-col items-center justify-center bg-white px-6 py-20">
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mb-4 text-qgray"
        >
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 className="mb-2 text-center text-xl font-600 text-qblack">
          По запросу «{searchFromUrl}» ничего не найдено
        </h3>
        <p className="mb-6 text-center text-sm text-qgray">
          Проверьте написание или посмотрите весь каталог.
        </p>
        <Link href="/shop">
          <button
            type="button"
            className="h-[45px] rounded bg-qbrand px-6 text-sm font-semibold text-white transition-colors hover:bg-qbrand/90"
          >
            Перейти в каталог
          </button>
        </Link>
      </div>
    ) : hasActiveFilters(filters) ? (
      <div className="flex flex-col items-center justify-center bg-white px-6 py-20">
        <h3 className="mb-2 text-xl font-600 text-qblack">Товары не найдены</h3>
        <p className="mb-6 text-sm text-qgray">С такими фильтрами ничего нет.</p>
        <button
          type="button"
          onClick={() =>
            changeFilters({ ...filters, values: EMPTY_VALUES, priceFrom: null, priceTo: null })
          }
          className="h-[45px] rounded bg-qbrand px-6 text-sm font-semibold text-white transition-colors hover:bg-qbrand/90"
        >
          Сбросить фильтры
        </button>
      </div>
    ) : undefined;

  const sortLabel = SORT_OPTIONS.find((o) => o.key === filters.sort)?.label;

  return (
    <Layout>
      <div className="products-page-wrapper w-full bg-white pb-[60px] pt-[30px]">
        <div className="container-x mx-auto">
          <Breadcrumb paths={breadcrumbPaths} />

          <h1 className="mb-6 text-[26px] font-700 leading-tight text-qblack sm:text-[32px]">
            {title}
          </h1>

          <div className="w-full lg:flex lg:gap-[40px]">
            <aside className="mb-6 lg:mb-0 lg:w-[220px] lg:shrink-0">
              <CategorySidebar
                categories={categories}
                counts={categoryCounts}
                total={products.length}
                selectedCategoryId={selectedCategoryId}
                onSelect={selectCategory}
              />
            </aside>

            <div className="min-w-0 flex-1">
              <FilterBar
                products={categoryProducts}
                filters={filters}
                onChange={changeFilters}
              />

              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-[15px] text-qgray">
                  {loading ? "Загрузка…" : `${visibleProducts.length} ${productsWord(visibleProducts.length)}`}
                </p>
                <FilterDropdown
                  variant="text"
                  alignRight
                  label={
                    <>
                      <span className="text-qgray">Сортировать: </span>
                      <span className="font-600">{sortLabel}</span>
                    </>
                  }
                >
                  {(close) => (
                    <ul className="py-2">
                      {SORT_OPTIONS.map((option) => (
                        <li key={option.key}>
                          <button
                            type="button"
                            onClick={() => {
                              changeFilters({ ...filters, sort: option.key });
                              close();
                            }}
                            className={`block w-full whitespace-nowrap px-4 py-2 text-left text-[14px] hover:bg-primarygray ${
                              option.key === filters.sort ? "font-600 text-qblack" : "text-qblack"
                            }`}
                          >
                            {option.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </FilterDropdown>
              </div>

              <ProductGrid
                products={visibleProducts}
                loading={loading}
                emptyState={emptyState}
                className="mb-[40px]"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
