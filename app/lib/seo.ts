import { Product } from "./interfaces/product.interface";
import { discountedPrice } from "./discount";

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

/** Абсолютный адрес картинки товара: в разметке относительные пути не годятся. */
function imageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  return path.startsWith("http") ? path : `${SITE_URL}${path}`;
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

export function productJsonLd(product: Product) {
  const price = discountedPrice(product) ?? product.price;
  const url = `${SITE_URL}/product/${encodeURIComponent(product.slug)}`;
  const images = (product.images ?? [])
    .map((img) => imageUrl(img.imagePath))
    .filter((src): src is string => Boolean(src));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name || product.title,
    description: product.description || undefined,
    sku: product.sku || undefined,
    image: images.length ? images : imageUrl(product.image),
    category: product.categoryName || undefined,
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
