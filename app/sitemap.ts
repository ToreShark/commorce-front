import { MetadataRoute } from "next";
import { fetchCategories, fetchProducts } from "./lib/data";
import Category from "./lib/interfaces/category.interace";
import { Product } from "./lib/interfaces/product.interface";
import { SITE_URL } from "./lib/seo";

// Собирается на каждый запрос: на сборке бэкенда нет, а товары меняются из админки
export const dynamic = "force-dynamic";

/** Страницы без данных из базы, которые стоит отдать поисковику. */
const STATIC_PAGES = ["", "/shop", "/hello", "/offer", "/warranty", "/payment-security", "/privacy-policy"];

/**
 * Карта сайта из живой базы.
 *
 * Прежняя версия писала домен next.crysshop.kz и адреса /Category/Index/… от
 * старого MVC-сайта: все 152 ссылки отдавали 404, а товаров в ней не было вовсе.
 * Теперь — только crysshop.kz и только адреса, которые реально открываются.
 */
export function buildSitemap(categories: Category[], products: Product[]): MetadataRoute.Sitemap {
  const urls = new Map<string, MetadataRoute.Sitemap[number]>();
  const add = (entry: MetadataRoute.Sitemap[number]) => {
    if (!urls.has(entry.url)) urls.set(entry.url, entry);
  };

  STATIC_PAGES.forEach((path) => add({ url: `${SITE_URL}${path}` }));

  for (const category of categories) {
    if (!category.slug?.trim()) continue;
    add({
      url: `${SITE_URL}/shop?category=${encodeURIComponent(category.slug)}`,
      lastModified: category.lastModified || undefined,
    });
  }

  for (const product of products) {
    // Слаг с «/» внутри (в базе есть "/nabor-tarelok-…") не открывается вовсе —
    // такой адрес в карте сайта даёт только 404
    if (!product.slug?.trim() || product.slug.includes("/")) continue;
    // Слаг кодируется как есть: витрина открывает товар ровно по нему, и
    // «исправленный» здесь адрес вёл бы на 404
    add({
      url: `${SITE_URL}/product/${encodeURIComponent(product.slug)}`,
      lastModified: product.lastModified || undefined,
    });
  }

  return Array.from(urls.values());
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    fetchCategories().catch(() => [] as Category[]),
    fetchProducts().catch(() => null),
  ]);
  return buildSitemap(categories || [], products || []);
}
