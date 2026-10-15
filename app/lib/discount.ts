/**
 * Скидка на товар.
 *
 * Правило совпадает с Product.ActiveDiscountPercent / PriceAt на бэкенде
 * (I_STORE.DAL/Entities/Product.cs), менять вместе: витрина показывает ту же цену,
 * по которой корзина и заказ потом считают деньги.
 *
 * - процент действует, если он больше 0 и меньше 100;
 * - даты необязательны, пустая — нет границы с этой стороны;
 * - даты раньше 2000 года тоже пустые: старая админка вместо пустоты писала 0001-01-01 и 1970-01-01;
 * - дата окончания включительно, сравнение по UTC, как на сервере.
 */

export interface DiscountFields {
  price: number;
  discountPercentage?: number | null;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
}

/** Полночь UTC дня из строки вида "2026-10-20" или "2026-10-20T00:00:00", иначе null. */
function dayStartUtc(value?: string | null): number | null {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  if (y < 2000) return null;
  return Date.UTC(y, m - 1, d);
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Процент скидки, который действует сейчас, иначе 0. */
export function activeDiscountPercent(product: DiscountFields, now: Date = new Date()): number {
  const percent = Number(product.discountPercentage ?? 0);
  if (!(percent > 0 && percent < 100)) return 0;

  const t = now.getTime();
  const start = dayStartUtc(product.discountStartDate);
  if (start !== null && t < start) return 0;

  const end = dayStartUtc(product.discountEndDate);
  if (end !== null && t >= end + DAY_MS) return 0;

  return percent;
}

/** Цена со скидкой, округлённая до целого тенге, или null, если скидки сейчас нет. */
export function discountedPrice(product: DiscountFields, now: Date = new Date()): number | null {
  const percent = activeDiscountPercent(product, now);
  if (percent === 0) return null;
  return Math.round(product.price - (product.price * percent) / 100);
}

/** Дата с сервера ("2026-10-20T00:00:00") → значение для <input type="date">. */
export function toDateInputValue(value?: string | null): string {
  return dayStartUtc(value) === null ? "" : value!.slice(0, 10);
}
