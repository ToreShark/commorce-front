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
  phone: "+77058887876",
  city: "Атырау",
  street: "ул. Орыгали Смагулова, 22",
  /** Одной строкой — для текстов и description. */
  address: "г. Атырау, ул. Орыгали Смагулова, 22",
  /** «8 705 888 78 76» — для показа. */
  phoneDisplay: "8 705 888 78 76",
  whatsapp: "https://wa.me/77058887876",
  /** График точки самовывоза (назвал владелец 27.10.2026). */
  hours: "Пн–Сб 10:00–19:00, воскресенье — выходной",
  /** Срок возврата товара надлежащего качества, дней. */
  returnDays: 14,
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

const TITLE_MAX = 65;

/** Пол из названия раздела: «Обувь женская», «Женская одежда», «Товары для детей». */
function categoryGender(category?: string | null): "женск" | "мужск" | "детск" | null {
  const c = (category ?? "").toLowerCase();
  if (c.includes("жен")) return "женск";
  if (c.includes("муж")) return "мужск";
  if (c.includes("дет")) return "детск";
  return null;
}

const ADJECTIVE_ENDING = /(?:ый|ий|ой|ая|яя|ое|ее|ые|ие)$/;
const PREPOSITIONS = new Set(["для", "с", "со", "на", "из", "в", "во", "к", "по", "без", "под", "от"]);

/** Окончание прилагательного, согласованного с существительным: ботинки → «ие». */
function endingFor(noun: string): string {
  const last = noun.slice(-1);
  return "иы".includes(last) ? "ие" : "ая".includes(last) ? "ая" : "оеё".includes(last) ? "ое" : "ий";
}

/**
 * «женские / женская / женское / женский» — по роду и числу существительного:
 * «Ботинки женские», «Футболка женская», «Пальто женское», «Пиджак женский».
 * Буквально «женские» дало бы «Пальто женские».
 *
 * Существительное — первое слово до предлога, не похожее на прилагательное:
 * у «Кожаные ботинки» род берётся от «ботинки», а не от «кожаные» (по последней
 * букве первого слова выходило «Кожаные ботинки женское» — замечание ревью).
 * Название из одного слова — само существительное. Не нашли существительное —
 * слово не добавляем: лучше без него, чем с ошибкой.
 * Если пол в названии уже есть («для девочек», «унисекс», «женский») — тоже ничего.
 */
export function genderWord(name: string, category?: string | null): string | null {
  const stem = categoryGender(category);
  if (!stem || /жен|муж|дет|девоч|мальч|унисекс|unisex/i.test(name)) return null;

  const words = name.toLowerCase().split(/[\s-]+/).filter(Boolean);
  // Единственное слово — тоже только русское: «Nike» или «38» не существительное,
  // для них род не угадать (замечание ревью)
  if (words.length === 1) return /^[а-яё]+$/.test(words[0]) ? stem + endingFor(words[0]) : null;

  for (const word of words) {
    if (PREPOSITIONS.has(word)) break;
    if (!/^[а-яё]+$/.test(word)) continue; // цифры, латиница, размеры
    if (!ADJECTIVE_ENDING.test(word)) return stem + endingFor(word);
  }
  return null;
}

/**
 * Заголовок, описание и картинка для поисковика и превью ссылки.
 * Title: «Название [женские] [Бренд] — цена ₸ | CrysShop Атырау», не длиннее
 * 65 символов: сначала «| CrysShop Атырау» сокращается до «| CrysShop», потом
 * обрезается название. Description до 160 символов: то же название, раздел,
 * размеры, доставка и оплата. Kaspi не упоминается — среди способов оплаты
 * его нет (карта через ForteBank и наличные).
 */
/**
 * Есть ли в названии бренд отдельными словами. Подстрока не годится:
 * у товара «Milan» с брендом Mila бренд считался бы уже упомянутым.
 */
export function hasWords(text: string, phrase: string): boolean {
  const tokens = (v: string) => v.toLowerCase().split(/[^a-zа-яё0-9]+/i).filter(Boolean);
  const hay = tokens(text);
  const needle = tokens(phrase);
  if (needle.length === 0) return false;
  return hay.some((_, i) => needle.every((w, j) => hay[i + j] === w));
}

export function productSeo(product: Product, now: Date = new Date()) {
  // Точка в конце названия («Набор тарелок Bernadote.») в заголовке лишняя
  const name = (product.name || product.title || "").trim().replace(/[.,;:]+$/, "");
  const brand = productBrand(product);
  const gender = genderWord(name, product.categoryName);
  // Свой бренд в label не дописываем: «CrysShop» и так стоит в хвосте заголовка
  const label = [name, gender, brand && !isOwnBrand(brand) && !hasWords(name, brand) ? brand : null]
    .filter(Boolean)
    .join(" ");

  const price = discountedPrice(product, now) ?? product.price;
  const tailLong = ` — ${money(price)} | CrysShop Атырау`;
  const tailShort = ` — ${money(price)} | CrysShop`;
  let title = label + tailLong;
  if (title.length > TITLE_MAX) title = label + tailShort;
  if (title.length > TITLE_MAX) {
    title = label.slice(0, TITLE_MAX - tailShort.length - 1).trimEnd() + "…" + tailShort;
  }

  const option = productOptions(product).find((o) => o.facet.key !== "color");
  const sizes = option?.values.map((v) => (option.facet.format ? option.facet.format(v) : v)) ?? [];
  const tail = "Доставка по Атырау и Казахстану, оплата картой онлайн.";
  const head = [label, product.categoryName?.trim()].filter(Boolean).join(", ");

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
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "10:00",
        closes: "19:00",
      },
    ],
  };
}

/**
 * Условия возврата для разметки товара — те же, что на странице
 * «Доставка и возврат»: 14 дней, в магазине или через СДЭК за счёт магазина.
 */
export function returnPolicyJsonLd() {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "KZ",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: SHOP.returnDays,
    returnMethod: ["https://schema.org/ReturnInStore", "https://schema.org/ReturnByMail"],
    returnFees: "https://schema.org/FreeReturn",
    merchantReturnLink: `${SITE_URL}/dostavka-i-vozvrat#vozvrat`,
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
 * Не нашли — null: бренд магазина товару сам не приписываем.
 *
 * Товары собственного производства помечаются в описании так же — «Бренд CrysShop»;
 * любое написание («Crysshop», «crys shop») приводится к имени магазина.
 */
export function productBrand(product: Product): string | null {
  const m = (product.description ?? "").match(
    /(?:Бренд|Brand)\s*[:\-–]?\s*([A-Za-z][A-Za-z0-9&'’ -]*?)(?=\s+[А-Яа-яЁё]|[.,;:\n(]|$)/
  );
  if (!m) return null;
  const brand = m[1].trim();
  return isOwnBrand(brand) ? SHOP.name : brand;
}

/** Бренд — сам магазин (собственное производство). */
export function isOwnBrand(brand: string | null): boolean {
  return !!brand && brand.replace(/\s+/g, "").toLowerCase() === SHOP.name.toLowerCase();
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
      hasMerchantReturnPolicy: returnPolicyJsonLd(),
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
