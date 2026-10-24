import { describe, expect, it } from "vitest";
import { buildSitemap } from "@/app/sitemap";
import { buildRobots } from "@/app/robots";
import { categorySeo, jsonLdString, productJsonLd, storeJsonLd } from "./seo";
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
