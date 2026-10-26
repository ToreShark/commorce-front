import { discountedPrice } from "./discount";
import { Product } from "./interfaces/product.interface";
import { SHOP, SITE_URL, imageUrl, productBrand, productLabel, productSku } from "./seo";

/**
 * Товарный фид Google Merchant Center (RSS 2.0 + пространство имён g:).
 * Спецификация: support.google.com/merchants/answer/7052112.
 *
 * Всё, что видит покупатель на странице товара, берётся теми же функциями:
 * название — productLabel, бренд — productBrand, артикул — productSku,
 * скидка — discountedPrice. Поэтому цена в фиде не может разойтись с ценой
 * на странице и в её JSON-LD.
 */

/** Раздел каталога → категория Google (google_product_category, числовой id таксономии). */
const GOOGLE_CATEGORY: Record<string, string> = {
  "Женская одежда": "1604", // Apparel & Accessories > Clothing
  "Детская одежда": "1604",
  "Обувь женская": "187", // Apparel & Accessories > Shoes
  "Сумки": "3032", // Apparel & Accessories > Handbags, Wallets & Cases > Handbags
  "Посуда": "672", // Home & Garden > Kitchen & Dining > Tableware
  "Мебель": "436", // Furniture
  "Ковры": "598", // Home & Garden > Decor > Rugs
  "Товары для детей": "537", // Baby & Toddler
};

/** В базе раздел «Cумки» записан с латинской C — сравниваем по смыслу, а не побайтно. */
function normalizeCategory(name?: string | null): string {
  return (name ?? "").trim().replace(/^C/, "С");
}

export function googleCategory(product: Product): string | undefined {
  return GOOGLE_CATEGORY[normalizeCategory(product.categoryName)];
}

/** Пол и возраст — только для одежды, обуви и сумок, где Google их ждёт. */
function audience(product: Product): { gender?: string; ageGroup?: string } {
  const category = normalizeCategory(product.categoryName);
  if (category === "Детская одежда") return { gender: "unisex", ageGroup: "kids" };
  if (["Женская одежда", "Обувь женская", "Сумки"].includes(category)) {
    return { gender: "female", ageGroup: "adult" };
  }
  return {};
}

/** «35000.00 KZT» — формат цены, который требует Merchant Center. */
export function feedPrice(value: number): string {
  return `${Math.round(value)}.00 KZT`;
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function xml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    // Управляющие символы недопустимы в XML 1.0 — фид бы не разобрался целиком
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
}

/** Дата окончания скидки — включительно, до конца дня по UTC (как discountedPrice). */
function saleRange(product: Product): string | undefined {
  const day = (v?: string | null) => (v && v >= "2000" ? v.slice(0, 10) : null);
  const start = day(product.discountStartDate);
  const end = day(product.discountEndDate);
  if (!start && !end) return undefined;
  return `${start ?? "2000-01-01"}T00:00:00Z/${end ?? "2099-12-31"}T23:59:59Z`;
}

/**
 * id в фиде: артикул, если он уникален, — тот же, что Google видит в JSON-LD
 * страницы (sku). У цветовых вариантов артикул общий (поло Y-6528 ×5) — им Id
 * товара, а артикул уходит в item_group_id.
 */
export function feedIds(products: Product[]): Map<string, { id: string; group?: string }> {
  const count = new Map<string, number>();
  for (const p of products) count.set(productSku(p), (count.get(productSku(p)) ?? 0) + 1);
  return new Map(
    products.map((p) => {
      const sku = productSku(p);
      return [p.id, (count.get(sku) ?? 0) > 1 ? { id: p.id, group: sku } : { id: sku }];
    })
  );
}

export interface FeedItem {
  id: string;
  itemGroupId?: string;
  title: string;
  description: string;
  link: string;
  imageLink?: string;
  additionalImageLinks: string[];
  price: string;
  salePrice?: string;
  salePriceEffectiveDate?: string;
  brand?: string;
  googleProductCategory?: string;
  productType?: string;
  gender?: string;
  ageGroup?: string;
}

export function feedItems(products: Product[], now: Date = new Date()): FeedItem[] {
  const ids = feedIds(products);
  return products.map((p) => {
    const images = (p.images ?? [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((img) => imageUrl(img.imagePath))
      .filter((src): src is string => Boolean(src));
    if (images.length === 0 && p.image) images.push(imageUrl(p.image)!);

    const sale = discountedPrice(p, now);
    const { gender, ageGroup } = audience(p);
    const brand = productBrand(p);
    const description = stripHtml(p.description || "") || productLabel(p);

    return {
      id: ids.get(p.id)!.id,
      itemGroupId: ids.get(p.id)!.group,
      title: productLabel(p).slice(0, 150),
      description: description.slice(0, 5000),
      // Тот же адрес, что canonical страницы товара
      link: `${SITE_URL}/product/${encodeURIComponent(p.slug)}`,
      imageLink: images[0],
      additionalImageLinks: images.slice(1, 11),
      price: feedPrice(p.price),
      ...(sale !== null ? { salePrice: feedPrice(sale), salePriceEffectiveDate: saleRange(p) } : {}),
      brand: brand ?? undefined,
      googleProductCategory: googleCategory(p),
      productType: normalizeCategory(p.categoryName) || undefined,
      gender,
      ageGroup,
    };
  });
}

export function buildMerchantFeed(products: Product[], now: Date = new Date()): string {
  const tag = (name: string, value?: string) => (value ? `      <g:${name}>${xml(value)}</g:${name}>\n` : "");
  const items = feedItems(products, now)
    .map(
      (it) =>
        "    <item>\n" +
        tag("id", it.id) +
        tag("item_group_id", it.itemGroupId) +
        tag("title", it.title) +
        tag("description", it.description) +
        tag("link", it.link) +
        tag("image_link", it.imageLink) +
        it.additionalImageLinks.map((src) => tag("additional_image_link", src)).join("") +
        tag("price", it.price) +
        tag("sale_price", it.salePrice) +
        tag("sale_price_effective_date", it.salePriceEffectiveDate) +
        // Учёта остатков нет: на витрине висит только то, что продаётся (как InStock в JSON-LD)
        tag("availability", "in_stock") +
        tag("condition", "new") +
        tag("brand", it.brand) +
        // Штрихкодов (GTIN) в базе нет
        tag("identifier_exists", "no") +
        tag("google_product_category", it.googleProductCategory) +
        tag("product_type", it.productType) +
        tag("gender", it.gender) +
        tag("age_group", it.ageGroup) +
        "    </item>"
    )
    .join("\n");

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n' +
    "  <channel>\n" +
    `    <title>${xml(SHOP.name)}</title>\n` +
    `    <link>${SITE_URL}</link>\n` +
    `    <description>${xml(`${SHOP.name} — одежда, обувь и товары для дома, ${SHOP.city}`)}</description>\n` +
    items +
    "\n  </channel>\n</rss>\n"
  );
}
