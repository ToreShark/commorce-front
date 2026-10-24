"use client";

import { useEffect, useState } from "react";
import { Product } from "@/app/lib/interfaces/product.interface";
import {
  CatalogFilters,
  EMPTY_VALUES,
  FACETS,
  FacetConfig,
  facetOptions,
  hasActiveFilters,
  priceBounds,
} from "@/app/lib/catalogFilters";
import ColorDot from "@/app/components/ColorDot";
import FilterDropdown from "./FilterDropdown";
import { usePricingNow } from "@/app/lib/PricingClock";

interface FilterBarProps {
  /** Товары до фильтров (уже с учётом категории и поиска) — из них строятся варианты. */
  products: Product[];
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
}

const money = (n: number) => `${n.toLocaleString("ru-RU")} ₸`;

export function FacetPanel({
  facet,
  products,
  filters,
  onChange,
}: {
  facet: FacetConfig;
  products: Product[];
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
}) {
  const options = facetOptions(products, filters, facet, usePricingNow());
  const selected = filters.values[facet.key];

  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange({ ...filters, values: { ...filters.values, [facet.key]: next } });
  };

  // Размеры и возраст — плиткой, как на Интертопе; цвета — списком с кружками
  if (facet.key !== "color") {
    return (
      <div className="p-3">
        <div className="grid grid-cols-4 gap-1.5">
          {options.map(({ value, count }) => {
            const on = selected.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggle(value)}
                disabled={count === 0 && !on}
                aria-pressed={on}
                className={`h-10 min-w-[56px] border px-2 text-[13px] transition-colors disabled:cursor-not-allowed disabled:text-qgray-border ${
                  on
                    ? "border-qblack bg-qblack text-white"
                    : "border-qgray-border text-qblack hover:border-qblack"
                }`}
              >
                {facet.format ? facet.format(value) : value}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <ul className="max-h-[320px] overflow-y-auto py-2">
      {options.map(({ value, count }) => {
        const on = selected.includes(value);
        return (
          <li key={value}>
            <label
              className={`flex items-center gap-3 px-4 py-2 text-[14px] ${
                count === 0 && !on
                  ? "cursor-not-allowed text-qgray"
                  : "cursor-pointer text-qblack hover:bg-primarygray"
              }`}
            >
              <input
                type="checkbox"
                checked={on}
                disabled={count === 0 && !on}
                onChange={() => toggle(value)}
                className="h-4 w-4 accent-qblack"
              />
              <ColorDot color={value} size={16} />
              <span className="flex-1">{value}</span>
              <span className="text-[12px] text-qgray">{count}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export function PricePanel({
  bounds,
  filters,
  onChange,
  close,
  wide,
}: {
  bounds: [number, number];
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  close: () => void;
  /** Во всю ширину — для панели фильтров на телефоне. */
  wide?: boolean;
}) {
  const [from, setFrom] = useState(filters.priceFrom?.toString() ?? "");
  const [to, setTo] = useState(filters.priceTo?.toString() ?? "");

  // «Сбросить» и крестик на чипе меняют цену в адресе, пока панель открыта.
  // Без этого поля хранили старую цену, и «Применить» возвращал её обратно
  useEffect(() => {
    setFrom(filters.priceFrom?.toString() ?? "");
    setTo(filters.priceTo?.toString() ?? "");
  }, [filters.priceFrom, filters.priceTo]);

  const apply = () => {
    const parse = (s: string) => (s.trim() === "" ? null : Math.max(0, Number(s) || 0));
    let priceFrom = parse(from);
    let priceTo = parse(to);
    if (priceFrom !== null && priceTo !== null && priceFrom > priceTo) {
      [priceFrom, priceTo] = [priceTo, priceFrom];
    }
    onChange({ ...filters, priceFrom, priceTo });
    close();
  };

  const input =
    "h-10 w-full min-w-0 border border-qgray-border px-3 text-[14px] focus:border-qblack focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

  return (
    <form
      className={`${wide ? "w-full" : "w-[280px] max-w-full p-4"} space-y-3`}
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          aria-label="Цена от"
          placeholder={`от ${bounds[0].toLocaleString("ru-RU")}`}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className={input}
        />
        <span className="text-qgray">—</span>
        <input
          type="number"
          inputMode="numeric"
          aria-label="Цена до"
          placeholder={`до ${bounds[1].toLocaleString("ru-RU")}`}
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className={input}
        />
      </div>
      <button
        type="submit"
        className="h-10 w-full bg-qblack text-[14px] font-600 text-white transition-colors hover:bg-qbrand"
      >
        Применить
      </button>
    </form>
  );
}

export default function FilterBar({ products, filters, onChange }: FilterBarProps) {
  const now = usePricingNow();
  const bounds = priceBounds(products, now);
  // Фильтр без вариантов не показываем: «Возраст» в женской обуви только мешает.
  // Но если в нём что-то выбрано (пришло ссылкой), он остаётся — иначе выбор не снять
  const facets = FACETS.filter(
    (facet) =>
      filters.values[facet.key].length > 0 ||
      facetOptions(products, filters, facet, now).length > 0
  );

  const priceActive = filters.priceFrom !== null || filters.priceTo !== null;
  const priceLabel = priceActive
    ? [
        filters.priceFrom !== null && `от ${money(filters.priceFrom)}`,
        filters.priceTo !== null && `до ${money(filters.priceTo)}`,
      ]
        .filter(Boolean)
        .join(" ")
    : "Цена";

  const removeValue = (key: FacetConfig["key"], value: string) =>
    onChange({
      ...filters,
      values: { ...filters.values, [key]: filters.values[key].filter((v) => v !== value) },
    });

  return (
    <div className="mb-6 hidden lg:block">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
        {facets.map((facet, i) => {
          const count = filters.values[facet.key].length;
          return (
            <FilterDropdown
              key={facet.key}
              active={count > 0}
              alignRight={i % 2 === 1}
              label={count > 0 ? `${facet.label} · ${count}` : facet.label}
            >
              {() => (
                <FacetPanel
                  facet={facet}
                  products={products}
                  filters={filters}
                  onChange={onChange}
                />
              )}
            </FilterDropdown>
          );
        })}

        {bounds && (
          <FilterDropdown label={priceLabel} active={priceActive} alignRight={facets.length % 2 === 1}>
            {(close) => (
              <PricePanel bounds={bounds} filters={filters} onChange={onChange} close={close} />
            )}
          </FilterDropdown>
        )}
      </div>

      {hasActiveFilters(filters) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {FACETS.flatMap((facet) =>
            filters.values[facet.key].map((value) => (
              <button
                key={`${facet.key}-${value}`}
                type="button"
                onClick={() => removeValue(facet.key, value)}
                className="flex items-center gap-2 bg-primarygray px-3 py-1.5 text-[13px] text-qblack hover:bg-qgray-border"
                aria-label={`Убрать фильтр ${facet.label}: ${value}`}
              >
                {facet.key === "color" && <ColorDot color={value} size={12} />}
                <span>{facet.format ? facet.format(value) : value}</span>
                <span aria-hidden className="text-qgray">✕</span>
              </button>
            ))
          )}
          {priceActive && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, priceFrom: null, priceTo: null })}
              className="flex items-center gap-2 bg-primarygray px-3 py-1.5 text-[13px] text-qblack hover:bg-qgray-border"
              aria-label="Убрать фильтр по цене"
            >
              <span>{priceLabel}</span>
              <span aria-hidden className="text-qgray">✕</span>
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              onChange({ ...filters, values: EMPTY_VALUES, priceFrom: null, priceTo: null })
            }
            className="px-2 py-1.5 text-[13px] font-600 text-qbrand hover:underline"
          >
            Сбросить всё
          </button>
        </div>
      )}
    </div>
  );
}
