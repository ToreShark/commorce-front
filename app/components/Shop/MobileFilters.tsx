"use client";

import { ReactNode, useEffect, useState } from "react";
import Category from "@/app/lib/interfaces/category.interace";
import { Product } from "@/app/lib/interfaces/product.interface";
import {
  CatalogFilters,
  EMPTY_VALUES,
  FACETS,
  SORT_OPTIONS,
  facetOptions,
  hasActiveFilters,
  priceBounds,
  productsWord,
} from "@/app/lib/catalogFilters";
import { FacetPanel, PricePanel } from "./FilterBar";
import { usePricingNow } from "@/app/lib/PricingClock";

interface MobileFiltersProps {
  categories: Category[];
  categoryCounts: Map<string, number>;
  total: number;
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  /** Товары категории до фильтров — из них строятся варианты. */
  products: Product[];
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  /** Сколько товаров покажет выдача с текущими фильтрами. */
  resultCount: number;
}

function Section({
  title,
  hint,
  defaultOpen,
  children,
}: {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-qgray-border">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 [&::-webkit-details-marker]:hidden">
        <span className="text-[16px] font-600 text-qblack">{title}</span>
        <span className="flex min-w-0 items-center gap-2">
          {hint && <span className="truncate text-[13px] text-qgray">{hint}</span>}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            aria-hidden
            className="shrink-0 transition-transform group-open:rotate-180"
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </summary>
      <div className="pb-4">{children}</div>
    </details>
  );
}

/**
 * Фильтры на телефоне, как на Интертопе: ряд выпадающих списков на узком экране
 * съедал первый экран целиком, поэтому выдача начинается сразу с товаров, а всё
 * остальное — за плавающей кнопкой «Фильтры» в полноэкранной панели.
 * Выбор применяется сразу, кнопка внизу показывает, сколько товаров получится.
 */
export default function MobileFilters({
  categories,
  categoryCounts,
  total,
  selectedCategoryId,
  onSelectCategory,
  products,
  filters,
  onChange,
  resultCount,
}: MobileFiltersProps) {
  const [open, setOpen] = useState(false);

  // Под открытой панелью страница не должна прокручиваться
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const activeCount =
    FACETS.reduce((n, f) => n + filters.values[f.key].length, 0) +
    (filters.priceFrom !== null || filters.priceTo !== null ? 1 : 0);

  const now = usePricingNow();
  const bounds = priceBounds(products, now);
  const facets = FACETS.filter(
    (facet) =>
      filters.values[facet.key].length > 0 ||
      facetOptions(products, filters, facet, now).length > 0
  );
  const categoryList = [
    { id: "", name: "Все товары", count: total },
    ...categories
      .filter((c) => (categoryCounts.get(c.id) ?? 0) > 0 || c.id === selectedCategoryId)
      .map((c) => ({ id: c.id, name: c.name, count: categoryCounts.get(c.id) ?? 0 })),
  ];
  const selectedCategoryName = categoryList.find((c) => c.id === selectedCategoryId)?.name;

  return (
    <div className="lg:hidden">
      {/* Над нижним меню сайта (оно есть только до md) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-[76px] left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 border border-qblack bg-white px-6 py-3 text-[16px] font-600 text-qblack shadow-lg md:bottom-6"
      >
        Фильтры
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-qbrand px-1.5 text-[12px] text-white">
            {activeCount}
          </span>
        )}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M4 7h10M18 7h2M4 17h4M12 17h8" strokeLinecap="round" />
          <circle cx="16" cy="7" r="2" />
          <circle cx="10" cy="17" r="2" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Фильтры"
          className="fixed inset-0 z-[60] flex flex-col bg-white"
        >
          <div className="flex items-center justify-between border-b border-qgray-border px-4 py-4">
            <span className="text-[18px] font-700 text-qblack">Фильтры</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Закрыть фильтры"
              className="flex h-10 w-10 items-center justify-center text-qblack"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4">
            <Section title="Категория" hint={selectedCategoryName}>
              <ul>
                {categoryList.map((c) => (
                  <li key={c.id || "all"}>
                    <button
                      type="button"
                      onClick={() => onSelectCategory(c.id)}
                      className={`flex w-full items-center justify-between py-2 text-left text-[15px] ${
                        c.id === selectedCategoryId ? "font-700 text-qblack" : "text-qblack"
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-[13px] font-400 text-qgray">{c.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Section>

            <Section
              title="Сортировка"
              hint={SORT_OPTIONS.find((o) => o.key === filters.sort)?.label}
            >
              <ul>
                {SORT_OPTIONS.map((option) => (
                  <li key={option.key}>
                    <label className="flex cursor-pointer items-center gap-3 py-2 text-[15px] text-qblack">
                      <input
                        type="radio"
                        name="mobile-sort"
                        checked={option.key === filters.sort}
                        onChange={() => onChange({ ...filters, sort: option.key })}
                        className="h-4 w-4 accent-qblack"
                      />
                      {option.label}
                    </label>
                  </li>
                ))}
              </ul>
            </Section>

            {facets.map((facet) => (
              <Section
                key={facet.key}
                title={facet.label}
                defaultOpen={filters.values[facet.key].length > 0}
                hint={filters.values[facet.key]
                  .map((v) => (facet.format ? facet.format(v) : v))
                  .join(", ")}
              >
                <div className="-mx-4">
                  <FacetPanel facet={facet} products={products} filters={filters} onChange={onChange} />
                </div>
              </Section>
            ))}

            {bounds && (
              <Section title="Цена" defaultOpen={filters.priceFrom !== null || filters.priceTo !== null}>
                <PricePanel wide bounds={bounds} filters={filters} onChange={onChange} close={() => {}} />
              </Section>
            )}
          </div>

          <div className="flex gap-3 border-t border-qgray-border px-4 py-3">
            {hasActiveFilters(filters) && (
              <button
                type="button"
                onClick={() => onChange({ ...filters, values: EMPTY_VALUES, priceFrom: null, priceTo: null })}
                className="h-12 border border-qgray-border px-4 text-[15px] font-600 text-qblack"
              >
                Сбросить
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-12 flex-1 bg-qblack text-[15px] font-600 text-white"
            >
              Показать {resultCount} {productsWord(resultCount)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
