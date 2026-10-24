import { Product } from "./interfaces/product.interface";
import { discountedPrice } from "./discount";
import Category from "./interfaces/category.interace";
import { productOptions } from "./productOptions";

/**
 * Всё, что поисковик узнаёт о магазине, — в одном месте.
 *
 * Аудит 24.10.2026: Google не связывал магазин с Атырау (слово не встречалось
 * ни в title, ни в разметке), sitemap вёл на next.crysshop.kz по несуществующим
 * адресам, canonical не было вовсе. Адрес точки сообщил владелец.
 */

/** Единственный домен для поисковиков. next.crysshop.kz — копия, её не индексируем. */
export const SITE_URL = "https://crysshop.kz";

export const SHOP = {
  name: "CrysShop",
  phone: "+77019654666",
  city: "Атырау",
  street: "ул. Орыгали Смагулова, 22",
  /** Одной строкой — для текстов и description. */
  address: "г. Атырау, ул. Орыгали Смагулова, 22",
};

/**
 * Прямой адрес оригинала картинки (не /_next/image): его отдаёт бэкенд сразу,
 * без подготовки. Пробелы и скобки в именах вида «photo1702227480 (2).jpeg»
 * кодируются — с сырым пробелом адрес в разметке недействителен.
 */
export function imageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  return path.startsWith("http") ? encodeURI(path) : `${SITE_URL}${encodeURI(path)}`;
}

const money = (n: number) => `${Math.round(n).toLocaleString("ru-RU")} ₸`;

/**
 * Заголовок, описание и картинка для поисковика и превью ссылки.
 * Title: «Название — цена ₸ | CrysShop Атырау». Description до 160 символов:
 * название, раздел, размеры, доставка и оплата. Kaspi не упоминается — среди
 * способов оплаты его нет (карта через ForteBank и наличные).
 */
export function productSeo(product: Product, now: Date = new Date()) {
  const name = (product.name || product.title || "").trim();
  const price = discountedPrice(product, now) ?? product.price;
  const title = `${name} — ${money(price)} | CrysShop Атырау`;

  const option = productOptions(product).find((o) => o.facet.key !== "color");
  const sizes = option?.values.map((v) => (option.facet.format ? option.facet.format(v) : v)) ?? [];
  const tail = "Доставка по Атырау и Казахстану, оплата картой онлайн.";
  const head = [name, product.categoryName?.trim()].filter(Boolean).join(", ");

  const build = (list: string[], cut: boolean) =>
    list.length
      ? `${head}, ${option!.facet.key === "age" ? "возраст" : "размеры"} ${list.join(", ")}${cut ? "…" : ""}. ${tail}`
      : `${head}. ${tail}`;

  // Список размеров укорачивается, пока описание не влезет в 160 символов
  let description = build(sizes, false);
  for (let n = sizes.length - 1; description.length > 160 && n >= 0; n--) {
    description = build(sizes.slice(0, n), n > 0);
  }
  if (description.length > 160) description = description.slice(0, 159).trimEnd() + "…";

  return { title, description, image: imageUrl(product.images?.[0]?.imagePath ?? product.image) };
}

export function storeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: SHOP.name,
    url: SITE_URL,
    logo: `${SITE_URL}/assets/images/logo-crysshop.svg`,
    image: `${SITE_URL}/assets/images/logo-crysshop.svg`,
    telephone: SHOP.phone,
    priceRange: "₸₸",
    currenciesAccepted: "KZT",
    paymentAccepted: "Наличные, банковская карта",
    address: {
      "@type": "PostalAddress",
      streetAddress: SHOP.street,
      addressLocality: SHOP.city,
      addressCountry: "KZ",
    },
    areaServed: { "@type": "Country", name: "Казахстан" },
  };
}

/**
 * Артикул для разметки. В базе бывает «14725-99 Color 1308-2207» и
 * «LTN01-01.Color 2501»: слово Color убирается, пробелы и точки между частями —
 * в дефис. Артикул без пробелов не трогаем; пустой — внутренний Id товара.
 */
export function productSku(product: Product): string {
  const raw = (product.sku ?? "").trim();
  if (raw && !/\s/.test(raw)) return raw;
  const sku = raw
    .replace(/color/gi, " ")
    .split(/[\s.]+/)
    .map((part) => part.replace(/^[.-]+|[.-]+$/g, ""))
    .filter(Boolean)
    .join("-")
    .replace(/-{2,}/g, "-");
  return sku || product.id;
}

/**
 * Бренд товара. Отдельного поля в базе нет — бренд пишут в описании:
 * «…Бренд Bestello.Кожа…», «Бренд Fjolla Цвет бежевый». Берём слово после
 * «Бренд»/«Brand» латиницей до первого русского слова или знака препинания —
 * так «Производитель: Чехия» и «Цвет бежевый» брендом не становятся.
 * Не нашли — null: бренд магазина товару не приписываем.
 */
export function productBrand(product: Product): string | null {
  const m = (product.description ?? "").match(
    /(?:Бренд|Brand)\s*[:\-–]?\s*([A-Za-z][A-Za-z0-9&'’ -]*?)(?=\s+[А-Яа-яЁё]|[.,;:\n(]|$)/
  );
  return m ? m[1].trim() : null;
}

export function productJsonLd(product: Product, now: Date = new Date()) {
  const price = discountedPrice(product, now) ?? product.price;
  const url = `${SITE_URL}/product/${encodeURIComponent(product.slug)}`;
  const brand = productBrand(product);
  const images = (product.images ?? [])
    .map((img) => imageUrl(img.imagePath))
    .filter((src): src is string => Boolean(src));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name || product.title,
    description: product.description || undefined,
    sku: productSku(product),
    image: images.length ? images : imageUrl(product.image),
    // category убран; бренд — только настоящий, CrysShop остаётся продавцом в offers.seller
    ...(brand ? { brand: { "@type": "Brand", name: brand } } : {}),
    offers: {
      "@type": "Offer",
      url,
      price: price.toFixed(0),
      priceCurrency: "KZT",
      // Учёта остатков нет: на витрине висит только то, что продаётся
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: SHOP.name },
    },
  };
}

/**
 * JSON для <script type="application/ld+json">. «<» экранируется: название или
 * описание товара из базы с «</script>» иначе закрыло бы тег и открыло XSS.
 */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * SEO-заголовок и описание раздела. Тексты из админки (MetaTitle/MetaDescription)
 * берутся, только если в них уже есть «Атырау»: заполненные там заголовки вида
 * «…— Купить Онлайн» город не упоминают, а ради него всё и затевалось.
 * Чтобы задать свой текст — впишите в админке вариант со словом «Атырау».
 */
export function categorySeo(category: Category): { title: string; description: string } {
  const own = (v?: string | null) => (v && /атырау/i.test(v) ? v.trim() : "");
  return {
    title: own(category.metaTitle) || `${category.name} — купить в Атырау`,
    description:
      own(category.metaDescription) ||
      `${category.name} в интернет-магазине CrysShop. Самовывоз в Атырау (${SHOP.street}), доставка СДЭК по Казахстану, оплата картой или наличными.`,
  };
}
