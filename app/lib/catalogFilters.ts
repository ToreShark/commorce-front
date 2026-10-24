import { Product } from "./interfaces/product.interface";
import { parseProperties } from "./productProperties";
import { discountedPrice } from "./discount";

/**
 * Фильтры каталога в духе Интертопа: ряд выпадающих списков над выдачей.
 *
 * Значения берутся из «Размеров и характеристик» товара (propertiesJson), поэтому
 * новый фильтр — это одна строка в FACETS с названием характеристики из админки.
 * Внутри одного фильтра значения складываются через «или» (38 или 39), разные
 * фильтры — через «и» (38-й размер и белый цвет).
 *
 * Всё состояние лежит в адресе страницы: ссылку с выбранными фильтрами можно
 * переслать, а «назад» в браузере снимает последний выбор.
 */

export type FacetKey = "size" | "color" | "age";

export interface FacetConfig {
  key: FacetKey;
  /** Подпись на кнопке фильтра. */
  label: string;
  /** Название характеристики в админке; сравнивается без учёта регистра и пробелов по краям. */
  property: string;
  /** Отсев мусора: в «Возраст» у одного товара записан цвет. */
  accept?: (value: string) => boolean;
  /** Как показать значение покупателю. */
  format?: (value: string) => string;
}

const isNumeric = (value: string) => /^\d+([.,]\d+)?$/.test(value);

function yearsLabel(value: string): string {
  const n = Number(value);
  if (!Number.isInteger(n)) return value;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} год`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} года`;
  return `${n} лет`;
}

/** «1 товар», «3 товара», «12 товаров». */
export function productsWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "товар";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "товара";
  return "товаров";
}

export const FACETS: FacetConfig[] = [
  { key: "size", label: "Размер", property: "Размер" },
  { key: "color", label: "Цвет", property: "Цвет" },
  { key: "age", label: "Возраст", property: "Возраст", accept: isNumeric, format: yearsLabel },
];

export type SortKey = "new" | "price-asc" | "price-desc" | "discount";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "new", label: "сначала новые" },
  { key: "price-asc", label: "сначала дешёвые" },
  { key: "price-desc", label: "сначала дорогие" },
  { key: "discount", label: "со скидкой" },
];

export interface CatalogFilters {
  values: Record<FacetKey, string[]>;
  priceFrom: number | null;
  priceTo: number | null;
  sort: SortKey;
}

/**
 * «розовый» и «Розовый », записанные у разных товаров, — один цвет.
 * Приводим к виду «Первая заглавная, остальные строчные».
 */
export function normalizeValue(raw: string): string {
  const value = raw.trim().replace(/\s+/g, " ");
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

const sameName = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

/** Значения фильтра у товара. Один товар может нести несколько размеров и цветов. */
export function productFacetValues(product: Product, facet: FacetConfig): string[] {
  const values = new Set<string>();
  for (const row of parseProperties(product.propertiesJson)) {
    if (!sameName(row.Название, facet.property)) continue;
    const value = normalizeValue(row.Значение);
    if (!value || (facet.accept && !facet.accept(value))) continue;
    values.add(value);
  }
  return Array.from(values);
}

const LETTER_SIZES = ["XXXS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL"];

/** Числа — по возрастанию, буквенные размеры — от XS к XXL, остальное — по алфавиту. */
export function compareFacetValues(a: string, b: string): number {
  const na = parseFloat(a.replace(",", "."));
  const nb = parseFloat(b.replace(",", "."));
  const aNum = !Number.isNaN(na);
  const bNum = !Number.isNaN(nb);
  if (aNum && bNum && na !== nb) return na - nb;
  if (aNum !== bNum) return aNum ? -1 : 1;

  const la = LETTER_SIZES.indexOf(a.toUpperCase());
  const lb = LETTER_SIZES.indexOf(b.toUpperCase());
  if (la !== -1 && lb !== -1) return la - lb;
  if ((la !== -1) !== (lb !== -1)) return la !== -1 ? -1 : 1;

  return a.localeCompare(b, "ru");
}

/** Цена, которую покупатель видит на карточке: со скидкой, если она действует. */
export function effectivePrice(product: Product): number {
  return discountedPrice(product) ?? product.price;
}

function matchesFacets(
  product: Product,
  values: CatalogFilters["values"],
  skip?: FacetKey
): boolean {
  return FACETS.every((facet) => {
    if (facet.key === skip) return true;
    const selected = values[facet.key];
    if (selected.length === 0) return true;
    const own = productFacetValues(product, facet);
    return selected.some((value) => own.includes(value));
  });
}

function matchesPrice(product: Product, filters: CatalogFilters): boolean {
  const price = effectivePrice(product);
  if (filters.priceFrom !== null && price < filters.priceFrom) return false;
  if (filters.priceTo !== null && price > filters.priceTo) return false;
  return true;
}

export function applyFilters(products: Product[], filters: CatalogFilters): Product[] {
  return products.filter(
    (product) => matchesFacets(product, filters.values) && matchesPrice(product, filters)
  );
}

/**
 * Варианты фильтра со счётчиками. Счёт идёт с учётом всех остальных фильтров,
 * кроме этого же: выбрав 38-й размер, покупатель всё ещё видит, сколько товаров
 * будет в 39-м, а не ноль.
 */
export function facetOptions(
  products: Product[],
  filters: CatalogFilters,
  facet: FacetConfig
): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    if (!matchesPrice(product, filters) || !matchesFacets(product, filters.values, facet.key)) {
      continue;
    }
    for (const value of productFacetValues(product, facet)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  // Выбранное значение не пропадает из списка, даже если товаров с ним не осталось —
  // иначе его нельзя было бы снять
  for (const value of filters.values[facet.key]) {
    if (!counts.has(value)) counts.set(value, 0);
  }
  return Array.from(counts, ([value, count]) => ({ value, count })).sort((a, b) =>
    compareFacetValues(a.value, b.value)
  );
}

export function priceBounds(products: Product[]): [number, number] | null {
  if (products.length === 0) return null;
  const prices = products.map(effectivePrice);
  return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
}

const time = (value?: string) => (value ? Date.parse(value) || 0 : 0);

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => effectivePrice(a) - effectivePrice(b));
    case "price-desc":
      return sorted.sort((a, b) => effectivePrice(b) - effectivePrice(a));
    case "discount":
      // Сначала товары со скидкой, внутри — по размеру скидки
      return sorted.sort(
        (a, b) => (discountedPrice(b) ? 1 : 0) - (discountedPrice(a) ? 1 : 0) ||
          (b.price - effectivePrice(b)) / b.price - (a.price - effectivePrice(a)) / a.price
      );
    default:
      return sorted.sort((a, b) => time(b.createdAt) - time(a.createdAt));
  }
}

// ── адрес страницы ───────────────────────────────────────────────────────────

const PRICE_FROM = "price_from";
const PRICE_TO = "price_to";
const SORT = "sort";

function parsePrice(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function filtersFromParams(params: URLSearchParams): CatalogFilters {
  const values = {} as CatalogFilters["values"];
  for (const facet of FACETS) {
    values[facet.key] = Array.from(
      new Set(params.getAll(facet.key).map(normalizeValue).filter(Boolean))
    );
  }
  const sort = params.get(SORT) as SortKey | null;
  return {
    values,
    priceFrom: parsePrice(params.get(PRICE_FROM)),
    priceTo: parsePrice(params.get(PRICE_TO)),
    sort: SORT_OPTIONS.some((o) => o.key === sort) ? sort! : "new",
  };
}

/** Пишет фильтры в копию параметров, не трогая чужие (category, search). */
export function filtersToParams(filters: CatalogFilters, base: URLSearchParams): URLSearchParams {
  const params = new URLSearchParams(base);
  for (const facet of FACETS) {
    params.delete(facet.key);
    filters.values[facet.key].forEach((value) => params.append(facet.key, value));
  }
  params.delete(PRICE_FROM);
  params.delete(PRICE_TO);
  params.delete(SORT);
  if (filters.priceFrom !== null) params.set(PRICE_FROM, String(filters.priceFrom));
  if (filters.priceTo !== null) params.set(PRICE_TO, String(filters.priceTo));
  if (filters.sort !== "new") params.set(SORT, filters.sort);
  return params;
}

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return (
    FACETS.some((facet) => filters.values[facet.key].length > 0) ||
    filters.priceFrom !== null ||
    filters.priceTo !== null
  );
}

export const EMPTY_VALUES: CatalogFilters["values"] = { size: [], color: [], age: [] };
