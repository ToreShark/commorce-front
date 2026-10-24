import { Product } from "./interfaces/product.interface";
import { FACETS, FacetConfig, compareFacetValues, productFacetValues } from "./catalogFilters";

/**
 * Что покупатель выбирает перед корзиной: размер (у детской одежды вместо него —
 * возраст) и цвет. Выбор уходит в корзину как {"Размер":"38","Цвет":"Белый"} —
 * бэкенд хранит его в позиции заказа (OrderItem.SelectedPropertiesJson), и один
 * товар в разных размерах лежит в заказе разными строками.
 *
 * Выбирать надо, только если вариантов больше одного; единственный вариант
 * подставляется сам, чтобы продавец всё равно видел его в заказе.
 */

export interface ProductOption {
  facet: FacetConfig;
  values: string[];
}

const facet = (key: FacetConfig["key"]) => FACETS.find((f) => f.key === key)!;

export function productOptions(product: Product): ProductOption[] {
  const sizes = productFacetValues(product, facet("size")).sort(compareFacetValues);
  const ages = productFacetValues(product, facet("age")).sort(compareFacetValues);
  const colors = productFacetValues(product, facet("color"));

  const options: ProductOption[] = [];
  if (sizes.length > 0) options.push({ facet: facet("size"), values: sizes });
  else if (ages.length > 0) options.push({ facet: facet("age"), values: ages });
  if (colors.length > 0) options.push({ facet: facet("color"), values: colors });
  return options;
}

/** Без выбора на странице товара в корзину не положить — карточка ведёт туда. */
export function needsChoice(product: Product): boolean {
  return productOptions(product).some((o) => o.values.length > 1);
}

export type Choice = Partial<Record<FacetConfig["key"], string>>;

/**
 * Собирает выбор в JSON для корзины. missing — что ещё не выбрано: пока список
 * не пуст, класть в корзину нельзя.
 */
export function buildSelection(
  options: ProductOption[],
  choice: Choice
): { json: string; missing: FacetConfig[] } {
  const selected: Record<string, string> = {};
  const missing: FacetConfig[] = [];
  for (const { facet: f, values } of options) {
    const value = values.length === 1 ? values[0] : choice[f.key];
    if (value && values.includes(value)) selected[f.property] = value;
    else missing.push(f);
  }
  return { json: JSON.stringify(selected), missing };
}

/**
 * {"Размер":"38","Цвет":"Белый"} → «Размер: 38 · Цвет: Белый».
 * Пустой выбор "{}" и битый JSON — пустая строка: старые позиции заказа без
 * размера не должны показывать фигурные скобки.
 */
export function formatSelection(json?: string | null): string {
  if (!json) return "";
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return "";
    return Object.entries(parsed)
      .filter(([, v]) => v !== null && String(v).trim() !== "")
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ");
  } catch {
    return "";
  }
}
