// Google Analytics 4: события электронной торговли и клики по WhatsApp.
//
// Поток тот же, что считает просмотры страниц (NEXT_PUBLIC_GA_ID, gtag в
// app/layout.tsx). Загрузчик стоит со strategy="afterInteractive", поэтому
// событие из первого useEffect может обогнать его — тогда кладём вызов в
// dataLayer сами, тем же форматом, что и gtag: gtag.js разберёт очередь, когда
// загрузится.
//
// Отладка: открыть сайт с ?ga_debug=1 — до закрытия вкладки все события уходят
// с debug_mode и видны в GA4 → Администратор → DebugView.

export const GA_CURRENCY = "KZT";

const DEBUG_KEY = "ga_debug";

type GaParams = Record<string, unknown>;
type Gtag = (...args: unknown[]) => void;

function debugMode(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get(DEBUG_KEY) === "1") {
      sessionStorage.setItem(DEBUG_KEY, "1");
    }
    return sessionStorage.getItem(DEBUG_KEY) === "1";
  } catch {
    return false;
  }
}

function getGtag(): Gtag {
  const w = window as unknown as { gtag?: Gtag; dataLayer?: unknown[] };
  if (typeof w.gtag === "function") return w.gtag;
  w.dataLayer = w.dataLayer || [];
  // gtag кладёт в очередь именно объект arguments, массив он не разберёт
  return function gtagQueue() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
}

export function gaEvent(name: string, params: GaParams = {}): void {
  // NEXT_PUBLIC_* подставляется на сборке; без потока (dev, превью) событий нет
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_GA_ID) return;
  getGtag()("event", name, debugMode() ? { ...params, debug_mode: true } : params);
}

/** Товар в формате GA4 (items[]). Цена — за штуку, в тенге. */
export interface GaItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_category?: string;
  /** Размер/цвет: «Размер: 44, Цвет: бежевый». */
  item_variant?: string;
}

export function gaValue(items: GaItem[]): number {
  return Math.round(items.reduce((sum, i) => sum + i.price * i.quantity, 0));
}

// --- Покупка ---------------------------------------------------------------
//
// purchase уходит один раз на заказ и только когда заказ состоялся:
//  - наличные — на экране «Заказ оформлен» (оплата будет при получении);
//  - карта — после того как банк подтвердил оплату. Банк возвращает покупателя
//    на главную, а не на страницу успеха, поэтому перед уходом на банк заказ
//    кладётся в «ожидающие» (без персональных данных), а PaymentReturnWatcher
//    на следующем заходе спрашивает /api/payment/check-status.

const SENT_KEY = "ga_purchase_sent";
const PENDING_KEY = "ga_purchase_pending";
/** Сколько ждать оплату: дальше ожидание снимается (как перепроверка оплат на бэкенде — 3 дня). */
export const PENDING_TTL_MS = 3 * 24 * 60 * 60 * 1000;

export interface GaPurchase {
  transaction_id: string;
  value: number;
  items: GaItem[];
  shipping?: number;
}

export interface PendingPurchase extends GaPurchase {
  createdAt: number;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Приватный режим или переполнение — событие просто не дедуплицируется
  }
}

/** Отправить purchase, если по этому заказу ещё не отправляли. true — отправлено сейчас. */
export function gaPurchaseOnce(purchase: GaPurchase): boolean {
  const sent = readJson<string[]>(SENT_KEY, []);
  if (sent.includes(purchase.transaction_id)) return false;
  gaEvent("purchase", { ...purchase, currency: GA_CURRENCY });
  // Хватает последних 50 заказов: повтор старого заказа не появится
  writeJson(SENT_KEY, [...sent, purchase.transaction_id].slice(-50));
  return true;
}

export function savePendingPurchase(purchase: GaPurchase): void {
  const list = readJson<PendingPurchase[]>(PENDING_KEY, []).filter(
    (p) => p.transaction_id !== purchase.transaction_id
  );
  writeJson(PENDING_KEY, [...list, { ...purchase, createdAt: Date.now() }]);
}

export function getPendingPurchases(): PendingPurchase[] {
  return readJson<PendingPurchase[]>(PENDING_KEY, []);
}

export function removePendingPurchase(transactionId: string): void {
  writeJson(
    PENDING_KEY,
    getPendingPurchases().filter((p) => p.transaction_id !== transactionId)
  );
}
