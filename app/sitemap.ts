import { MetadataRoute } from "next";
import { fetchCategories, fetchProducts } from "./lib/data";
import Category from "./lib/interfaces/category.interace";
import { Product } from "./lib/interfaces/product.interface";
import { SITE_URL } from "./lib/seo";

// Собирается на каждый запрос: на сборке бэкенда нет, а товары меняются из админки
export const dynamic = "force-dynamic";

/**
 * Слаг, который можно отдать поисковику: латиница в нижнем регистре, цифры и
 * одиночные дефисы. В базе есть «Unisex -…», «"…"», пробелы в конце и даже
 * русские «о»/«е» внутри латинского слага — такие адреса в карту сайта не идут,
 * пока их не исправят в админке (товар открывается только по слагу из базы,
 * «почищенная» здесь ссылка вела бы на 404).
 */
export const CLEAN_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Страницы без данных из базы, которые стоит отдать поисковику. */
const STATIC_PAGES = ["", "/shop", "/dostavka-i-vozvrat", "/kontakty", "/offer", "/warranty", "/payment-security", "/privacy-policy"];

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
    if (!CLEAN_SLUG.test(category.slug ?? "")) continue;
    add({
      url: `${SITE_URL}/shop?category=${category.slug}`,
      lastModified: category.lastModified || undefined,
    });
  }

  for (const product of products) {
    if (!CLEAN_SLUG.test(product.slug ?? "")) continue;
    add({
      url: `${SITE_URL}/product/${product.slug}`,
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
