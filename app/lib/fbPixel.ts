// Пиксель Meta: единая точка отправки стандартных событий.
//
// Загрузчик пикселя стоит в app/layout.tsx со strategy="afterInteractive",
// поэтому window.fbq появляется НЕ сразу. События, которые компонент шлёт
// в первом же useEffect (ViewContent на карточке товара), успевают обогнать
// загрузчик — такие вызовы копим и отправляем, как только fbq появится.

type FbqParams = Record<string, unknown>;

/** Опции вызова fbq: eventID нужен для дедупликации одинаковых событий. */
type FbqOptions = { eventID?: string };

type Fbq = (...args: unknown[]) => void;

// Через каст, а не declare global: в мёртвом app/ui/productDetail.tsx уже
// объявлен свой Window.fbq, и второе глобальное объявление с ним конфликтует.
function getFbq(): Fbq | undefined {
  return (window as unknown as { fbq?: Fbq }).fbq;
}

// Идентификатор пикселя. NEXT_PUBLIC_* подставляется на сборке, поэтому смена
// значения требует пересборки образа, а не рестарта. Переменной нет — берём
// боевой пиксель магазина: в проде счётчик должен работать по умолчанию.
// Пустая строка (.env.development) — пиксель не грузится и события не уходят.
export const FB_PIXEL_ID =
  process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? "309925558692805";

/** Валюта магазина. Все суммы в событиях уходят в тенге. */
export const FB_CURRENCY = "KZT";

const RETRY_MS = 300;
const MAX_TRIES = 20; // ~6 секунд, дальше считаем, что пиксель заблокирован

const pending: Array<[string, FbqParams | undefined, FbqOptions | undefined]> =
  [];
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let tries = 0;

function send(
  fbq: Fbq,
  event: string,
  params?: FbqParams,
  options?: FbqOptions
): void {
  if (options) {
    fbq("track", event, params, options);
  } else {
    fbq("track", event, params);
  }
}

function flush(): void {
  retryTimer = null;

  const fbq = getFbq();
  if (typeof fbq !== "function") {
    tries += 1;
    if (tries >= MAX_TRIES) {
      // Блокировщик рекламы или пустой NEXT_PUBLIC_FB_PIXEL_ID — чистим очередь,
      // чтобы она не росла на всю сессию.
      pending.length = 0;
      return;
    }
    retryTimer = setTimeout(flush, RETRY_MS);
    return;
  }

  tries = 0;
  while (pending.length > 0) {
    const [event, params, options] = pending.shift()!;
    send(fbq, event, params, options);
  }
}

/**
 * Отправить стандартное событие Meta Pixel.
 * На сервере и без идентификатора пикселя — тихо ничего не делает.
 */
export function fbTrack(
  event: "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase",
  params?: FbqParams,
  options?: FbqOptions
): void {
  if (!FB_PIXEL_ID || typeof window === "undefined") return;

  const fbq = getFbq();
  if (typeof fbq === "function") {
    send(fbq, event, params, options);
    return;
  }

  pending.push([event, params, options]);
  if (!retryTimer) {
    retryTimer = setTimeout(flush, RETRY_MS);
  }
}
