import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE_URL } from "./lib/seo";

// Ответ зависит от домена запроса
export const dynamic = "force-dynamic";

/**
 * /robots.txt. Раньше его не было вовсе: nginx отдаёт этот путь фронту, а тот
 * отвечал 404 (робот в бэкенде, RobotsController, до него запрос не доходит).
 *
 * Тот же фронт открывается и на next.crysshop.kz — для Google это второй сайт
 * с теми же страницами. Там индексация запрещена целиком; основной — crysshop.kz.
 */
export function buildRobots(host: string): MetadataRoute.Robots {
  if (host.split(":")[0].toLowerCase() !== new URL(SITE_URL).hostname) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Личное и служебное: корзина, заказ, вход, админка и API
      disallow: [
        "/dashboard",
        "/basket",
        "/order",
        // Правила — префиксы: просто "/payment" закрыл бы и /payment-security
        "/payment$",
        "/payment?",
        "/purchaseHistory",
        "/login",
        "/sendphone",
        "/sendcode",
        "/api/",
        "/Cart/",
        "/Account/",
        "/Admin/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  return buildRobots(h.get("x-forwarded-host") || h.get("host") || "");
}
