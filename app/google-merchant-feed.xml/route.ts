import { apiBase } from "@/app/lib/apiBase";
import { Product } from "@/app/lib/interfaces/product.interface";
import { buildMerchantFeed } from "@/app/lib/merchantFeed";

/**
 * https://crysshop.kz/google-merchant-feed.xml — фид для Google Merchant Center.
 *
 * Собирается из базы на запрос, а не на сборке: бэкенда на сборке нет, товары
 * меняются из админки. Список товаров кэшируется на час (кэш данных Next),
 * ответ — тоже на час у Cloudflare и Google.
 */
export const dynamic = "force-dynamic";

const CACHE_SECONDS = 3600;

export async function GET() {
  let products: Product[] | null = null;
  try {
    const response = await fetch(`${apiBase()}/Product/GetProducts`, {
      headers: { Accept: "application/json" },
      next: { revalidate: CACHE_SECONDS },
    });
    if (response.ok) products = await response.json();
  } catch {
    products = null;
  }

  // Пустой фид не отдаём: Merchant Center снял бы с показа все товары.
  // 503 — «временно», Google придёт за фидом ещё раз.
  if (!Array.isArray(products) || products.length === 0) {
    return new Response("Feed temporarily unavailable", {
      status: 503,
      headers: { "Retry-After": "600", "Cache-Control": "no-store" },
    });
  }

  return new Response(buildMerchantFeed(products), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, max-age=${CACHE_SECONDS}`,
    },
  });
}
