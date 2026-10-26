import { describe, expect, it } from "vitest";
import { buildSitemap } from "@/app/sitemap";
import { buildRobots } from "@/app/robots";
import { categorySeo, genderWord, hasWords, imageUrl, jsonLdString, productBrand, productJsonLd, productSeo, productSku, storeJsonLd } from "./seo";
import Category from "./interfaces/category.interace";
import { Product } from "./interfaces/product.interface";

const SHOES = {
  id: "1",
  name: "Туфли мюли",
  title: "Туфли",
  slug: "tufli-myuli",
  price: 20_000,
  discountPercentage: 25,
  images: [{ id: "i", imagePath: "/images/a.jpeg", order: 0 }],
  lastModified: "2026-10-01T00:00:00",
} as unknown as Product;

describe("SEO", () => {
  it("sitemap — только crysshop.kz и реальные адреса товаров и категорий", () => {
    // Прежний sitemap: next.crysshop.kz/Category/Index/… — все ссылки отдавали 404
    const urls = buildSitemap(
      [{ id: "c", name: "Обувь", slug: "obuv" } as Category],
      [SHOES, SHOES, { ...SHOES, id: "2", slug: "Unisex -krossovki" } as Product]
    ).map((u) => u.url);

    expect(urls.every((u) => u.startsWith("https://crysshop.kz"))).toBe(true);
    expect(urls).toContain("https://crysshop.kz/shop?category=obuv");
    expect(urls).toContain("https://crysshop.kz/product/tufli-myuli");
    expect(urls.filter((u) => u.endsWith("tufli-myuli"))).toHaveLength(1);

    // Слаги из базы, которые нарушают правило «латиница, нижний регистр»,
    // в карту сайта не идут: «о» и «е» в первых двух — русские
    const dirty = ["serо-zelenoe-palto", "felkupе", "Unisex -krossovki", '"sumka"', "sumka ", "/nabor-tarelok", "a--b"];
    const dirtyUrls = buildSitemap([], dirty.map((slug, i) => ({ ...SHOES, id: String(i), slug }) as Product));
    expect(dirtyUrls.filter((u) => u.url.includes("/product/"))).toEqual([]);
  });

  it("robots на next.crysshop.kz запрещает всё — это копия основного сайта", () => {
    expect(buildRobots("next.crysshop.kz").rules).toEqual({ userAgent: "*", disallow: "/" });
  });

  it("robots на crysshop.kz открывает сайт, закрывает служебное и даёт sitemap", () => {
    const robots = buildRobots("crysshop.kz");
    const rules = robots.rules as { disallow: string[] };
    expect(rules.disallow).toContain("/dashboard");
    expect(rules.disallow).not.toContain("/payment"); // закрыло бы /payment-security
    expect(robots.sitemap).toBe("https://crysshop.kz/sitemap.xml");
  });

  it("разметка товара — цена со скидкой в тенге и абсолютные картинки", () => {
    const ld = productJsonLd(SHOES);
    expect(ld.offers.price).toBe("15000");
    expect(ld.offers.priceCurrency).toBe("KZT");
    expect(ld.image).toEqual(["https://crysshop.kz/images/a.jpeg"]);
  });

  it("разметка магазина — адрес в Атырау", () => {
    expect(storeJsonLd().address).toMatchObject({
      addressLocality: "Атырау",
      streetAddress: "ул. Орыгали Смагулова, 22",
    });
  });

  it("текст из базы не может закрыть тег script", () => {
    expect(jsonLdString({ name: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
});

describe("SEO-заголовок раздела", () => {
  const cat = (extra: Partial<Category>) => ({ id: "c", name: "Обувь женская", slug: "obuv", ...extra }) as Category;

  it("заголовок из админки без Атырау заменяется на «… — купить в Атырау»", () => {
    expect(categorySeo(cat({ metaTitle: "Женская Обувь — Купить Онлайн" })).title).toBe(
      "Обувь женская — купить в Атырау"
    );
  });

  it("свой заголовок со словом «Атырау» из админки сохраняется", () => {
    expect(categorySeo(cat({ metaTitle: "Сапоги в Атырау недорого" })).title).toBe("Сапоги в Атырау недорого");
  });
});

describe("SEO страницы товара", () => {
  const BOOTS = {
    ...SHOES,
    name: "Ботинки",
    categoryName: "Обувь женская",
    price: 20_000,
    discountPercentage: 0,
    images: [{ id: "i", imagePath: "/images/photo1702227480 (2).jpeg", order: 0 }],
    propertiesJson: JSON.stringify(
      ["36", "37", "38", "39", "40"].map((v) => ({ Название: "Размер", Значение: v }))
    ),
  } as unknown as Product;

  const sp = (v: string) => v.replace(/\s/g, " ");

  it("title — «Название женские Бренд — цена ₸ | CrysShop Атырау», цена со скидкой", () => {
    const withBrand = { ...BOOTS, description: "Ботинки зимние. Бренд Bestello.Кожа." } as Product;
    expect(sp(productSeo(withBrand).title)).toBe("Ботинки женские Bestello — 20 000 ₸ | CrysShop Атырау");
    expect(sp(productSeo(BOOTS).title)).toBe("Ботинки женские — 20 000 ₸ | CrysShop Атырау");
    expect(sp(productSeo(SHOES).title)).toContain("15 000 ₸");
  });

  it("длиннее 65 — сначала «| CrysShop Атырау» → «| CrysShop», потом обрезка названия", () => {
    const long = { ...BOOTS, name: "Туфли с открытой пяткой", description: "Бренд Mario Muzi." } as Product;
    expect(sp(productSeo(long).title)).toBe("Туфли с открытой пяткой женские Mario Muzi — 20 000 ₸ | CrysShop");
    const huge = { ...BOOTS, name: "Очень длинное название товара, которое никуда не помещается" } as Product;
    const t = productSeo(huge).title;
    expect(t.length).toBeLessThanOrEqual(65);
    expect(sp(t)).toMatch(/… — 20 000 ₸ \| CrysShop$/);
  });

  it("пол согласуется с названием и не дублируется", () => {
    expect(genderWord("Пальто", "Женская одежда")).toBe("женское");
    expect(genderWord("Футболка", "Детская одежда")).toBe("детская");
    expect(genderWord("Пиджак", "Женская одежда")).toBe("женский");
    expect(genderWord("Колготки капроновые", "Товары для детей")).toBe("детские");
    expect(genderWord("Юбка для девочек", "Детская одежда")).toBeNull();
    expect(genderWord("Кроссовки унисекс", "Обувь женская")).toBeNull();
    expect(genderWord("Ваза", "Посуда")).toBeNull();
  });

  it("род — от существительного, а не от прилагательного в начале названия", () => {
    // Замечание ревью: по последней букве первого слова выходило «Кожаные ботинки женское»
    expect(genderWord("Кожаные ботинки", "Обувь женская")).toBe("женские");
    expect(genderWord("Зимние сапоги", "Обувь женская")).toBe("женские");
    expect(genderWord("Летнее платье", "Женская одежда")).toBe("женское");
    expect(genderWord("Платье миди", "Женская одежда")).toBe("женское");
    expect(genderWord("Пальто-пиджак", "Женская одежда")).toBe("женское");
    expect(genderWord("Туфли с открытой пяткой", "Обувь женская")).toBe("женские");
    expect(genderWord("Костюм брючный", "Детская одежда")).toBe("детский");
    // Существительное не нашлось — лучше без слова, чем «женские» наугад
    expect(genderWord("Украшение серебряное", "Женская одежда")).toBeNull();
  });

  it("название из одного нерусского слова — род не угадываем", () => {
    // Замечание ревью: «Nike» и «38» получали «женский»
    expect(genderWord("Nike", "Обувь женская")).toBeNull();
    expect(genderWord("38", "Обувь женская")).toBeNull();
    expect(genderWord("Сапоги", "Обувь женская")).toBe("женские");
  });

  it("бренд в названии ищется отдельными словами, а не подстрокой", () => {
    // Замечание ревью: «Milan» с брендом Mila считался уже содержащим бренд
    expect(hasWords("Milan", "Mila")).toBe(false);
    expect(hasWords("Набор тарелок Bernadote", "Bernadote")).toBe(true);
    expect(hasWords("Кроссовки Mario Muzi белые", "Mario Muzi")).toBe(true);
    expect(hasWords("Кроссовки Mario белые", "Mario Muzi")).toBe(false);
    const p = { ...BOOTS, name: "Milan", categoryName: "Cумки", description: "Бренд Mila." } as Product;
    expect(sp(productSeo(p).title)).toBe("Milan Mila — 20 000 ₸ | CrysShop Атырау");
  });

  it("бренд не дублируется, если уже в названии; точка в конце названия срезается", () => {
    const p = { ...BOOTS, name: "Набор тарелок Bernadote.", categoryName: "Посуда", description: "Бренд Bernadote." } as Product;
    expect(sp(productSeo(p).title)).toBe("Набор тарелок Bernadote — 20 000 ₸ | CrysShop Атырау");
  });

  it("description — название, раздел, размеры, доставка; не длиннее 160", () => {
    const { description } = productSeo(BOOTS);
    expect(description).toBe(
      "Ботинки женские, Обувь женская, размеры 36, 37, 38, 39, 40. Доставка по Атырау и Казахстану, оплата картой онлайн."
    );

    const many = {
      ...BOOTS,
      name: "Очень длинное название товара для проверки обрезки описания",
      propertiesJson: JSON.stringify(
        Array.from({ length: 30 }, (_, i) => ({ Название: "Размер", Значение: String(30 + i) }))
      ),
    } as Product;
    expect(productSeo(many).description.length).toBeLessThanOrEqual(160);
    expect(productSeo(many).description).toContain("Доставка по Атырау");
  });

  it("og:image и картинки разметки — прямой адрес оригинала, пробелы закодированы", () => {
    expect(productSeo(BOOTS).image).toBe("https://crysshop.kz/images/photo1702227480%20(2).jpeg");
    expect(imageUrl("/images/a b.jpeg")).not.toContain(" ");
    expect(productJsonLd(BOOTS).image).toEqual(["https://crysshop.kz/images/photo1702227480%20(2).jpeg"]);
  });

  it("бренд — из описания, если указан; иначе поля нет, CrysShop только продавец", () => {
    const withBrand = { ...BOOTS, description: "Ботинки зимние. Маломерят.Бренд Bestello.Кожа." } as Product;
    expect(productJsonLd(withBrand)).toMatchObject({ brand: { "@type": "Brand", name: "Bestello" } });
    expect(productJsonLd(BOOTS)).not.toHaveProperty("brand");
    expect(productJsonLd(BOOTS).offers.seller).toEqual({ "@type": "Organization", name: "CrysShop" });
  });

  it("бренд не путается со страной и цветом", () => {
    const d = (description: string) => productBrand({ description } as Product);
    expect(d("Бренд Fjolla Цвет бежевый Кожа")).toBe("Fjolla");
    expect(d("Бренд: Mario Muzi, кожа")).toBe("Mario Muzi");
    expect(d("Производитель: Чехия")).toBeNull();
  });

  it("собственное производство: «Бренд CrysShop» в описании — brand = CrysShop", () => {
    const own = { ...BOOTS, name: "Платье нарядное", description: "Иск. шелк. Бренд Crysshop. Производство: Казахстан" } as Product;
    expect(productBrand(own)).toBe("CrysShop");
    expect(productBrand({ description: "Бренд crys shop Размеры 44-50" } as Product)).toBe("CrysShop");
    expect(productJsonLd(own)).toMatchObject({ brand: { "@type": "Brand", name: "CrysShop" } });
    // В заголовке «CrysShop» один раз — в хвосте, бренд в название не дописывается
    const title = productSeo(own).title;
    expect(title.match(/CrysShop/g)).toHaveLength(1);
  });

  it("условия возврата в разметке совпадают со страницей: 14 дней, СДЭК за счёт магазина", () => {
    const policy = productJsonLd(BOOTS).offers.hasMerchantReturnPolicy;
    expect(policy).toMatchObject({
      merchantReturnDays: 14,
      returnFees: "https://schema.org/FreeReturn",
      applicableCountry: "KZ",
    });
    expect(policy.merchantReturnLink).toBe("https://crysshop.kz/dostavka-i-vozvrat#vozvrat");
  });

  it("график магазина в разметке: пн–сб 10–19, воскресенья нет", () => {
    const [hours] = storeJsonLd().openingHoursSpecification;
    expect(hours).toMatchObject({ opens: "10:00", closes: "19:00" });
    expect(hours.dayOfWeek).not.toContain("Sunday");
  });

  it("без пометки бренда магазина товару не приписываем", () => {
    const plain = { ...BOOTS, description: "Производство: Казахстан" } as Product;
    expect(productJsonLd(plain)).not.toHaveProperty("brand");
  });

  it("артикул без пробелов и слова Color; без артикула — Id товара", () => {
    const s = (sku: string) => productSku({ id: "id-1", sku } as Product);
    expect(s("14725-99 Color 1308-2207")).toBe("14725-99-1308-2207");
    expect(s("LTN01-01.Color 2501")).toBe("LTN01-01-2501");
    expect(s("23443 Color512B631")).toBe("23443-512B631");
    expect(s("212 519-60")).toBe("212-519-60");
    expect(s("222IK362T/07")).toBe("222IK362T/07");
    expect(s("")).toBe("id-1");
  });

  it("offers.price — целое число строкой, без пробелов, точек и запятых", () => {
    // Сумки: 31 000 ₸ и −10% в январе 2024 — скидка давно кончилась
    const bag = { ...BOOTS, price: 31000, discountPercentage: 10, discountStartDate: "2024-01-05T00:00:00", discountEndDate: "2024-01-29T00:00:00" } as unknown as Product;
    expect(productJsonLd(bag).offers.price).toBe("31000");
    // Действующая скидка с дробным результатом — округление до целого тенге
    const active = { ...BOOTS, price: 36900, discountPercentage: 10, discountStartDate: null, discountEndDate: null } as unknown as Product;
    expect(productJsonLd(active).offers.price).toBe("33210");
    expect(productJsonLd({ ...BOOTS, price: 1234567.5 } as Product).offers.price).toMatch(/^\d+$/);
  });

  it("цены на витрине — только в русском формате (toLocaleString без языка даёт «27,900»)", () => {
    const { readdirSync, readFileSync, statSync } = require("node:fs") as typeof import("node:fs");
    const { join } = require("node:path") as typeof import("node:path");
    const walk = (dir: string): string[] =>
      readdirSync(dir).flatMap((n) => {
        const f = join(dir, n);
        if (statSync(f).isDirectory()) return n === "dashboard" || n === "node_modules" ? [] : walk(f);
        return /\.tsx?$/.test(n) && !/\.test\./.test(n) ? [f] : [];
      });
    const offenders = walk(join(process.cwd(), "app")).filter((f) => readFileSync(f, "utf8").includes(".toLocaleString()"));
    expect(offenders).toEqual([]);
  });

  it("в sitemap нет удалённой страницы /hello, есть контакты и доставка", () => {
    const urls = buildSitemap([], []).map((e) => e.url);
    expect(urls).not.toContain("https://crysshop.kz/hello");
    expect(urls).toContain("https://crysshop.kz/kontakty");
    expect(urls).toContain("https://crysshop.kz/dostavka-i-vozvrat");
  });

  it("в разметке нет category", () => {
    expect(productJsonLd(BOOTS)).not.toHaveProperty("category");
  });
});
