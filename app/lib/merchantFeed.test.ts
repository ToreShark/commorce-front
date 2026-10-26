import { describe, expect, it } from "vitest";
import { buildMerchantFeed, feedItems, feedPrice } from "./merchantFeed";
import { Product } from "./interfaces/product.interface";

const base = {
  id: "11111111-0000-0000-0000-000000000001",
  name: "Ковер 1,6х2,8",
  title: "Ковры",
  description: "Ковёр с узорами. <b>Синий</b> & прочный",
  sku: "KV-1",
  slug: "kover-s-uzorami-siniy",
  price: 35000,
  categoryName: "Ковры",
  discountPercentage: 0,
  images: [
    { id: "b", imagePath: "/images/k2.jpg", order: 1 },
    { id: "a", imagePath: "/images/k1 (2).jpg", order: 0 },
  ],
} as unknown as Product;

const NOW = new Date("2026-10-26T12:00:00Z");

describe("товарный фид Merchant Center", () => {
  it("цена — «35000.00 KZT», без разделителей тысяч", () => {
    expect(feedPrice(35000)).toBe("35000.00 KZT");
    expect(feedPrice(1360)).toBe("1360.00 KZT");
    const [item] = feedItems([base], NOW);
    expect(item.price).toBe("35000.00 KZT");
    expect(item.salePrice).toBeUndefined();
  });

  it("действующая скидка — sale_price с датами; закончившаяся — без неё", () => {
    const bag = { ...base, categoryName: "Cумки", price: 36900, discountPercentage: 10 } as Product;
    const active = feedItems([{ ...bag, discountStartDate: "2026-10-01T00:00:00", discountEndDate: "2026-10-31T00:00:00" } as Product], NOW)[0];
    expect(active.price).toBe("36900.00 KZT");
    expect(active.salePrice).toBe("33210.00 KZT");
    expect(active.salePriceEffectiveDate).toBe("2026-10-01T00:00:00Z/2026-10-31T23:59:59Z");
    const expired = feedItems([{ ...bag, discountStartDate: "2024-01-05T00:00:00", discountEndDate: "2024-01-29T00:00:00" } as Product], NOW)[0];
    expect(expired.salePrice).toBeUndefined();
  });

  it("id — уникальный артикул; у вариантов с общим артикулом — Id товара и item_group_id", () => {
    const polo1 = { ...base, id: "p1", sku: "Y-6528", slug: "polo-1" } as Product;
    const polo2 = { ...base, id: "p2", sku: "Y-6528", slug: "polo-2" } as Product;
    const items = feedItems([base, polo1, polo2], NOW);
    expect(items.map((i) => [i.id, i.itemGroupId])).toEqual([["KV-1", undefined], ["p1", "Y-6528"], ["p2", "Y-6528"]]);
  });

  it("фото: первое по порядку — image_link, остальные — additional, прямые адреса", () => {
    const [item] = feedItems([base], NOW);
    expect(item.imageLink).toBe("https://crysshop.kz/images/k1%20(2).jpg");
    expect(item.additionalImageLinks).toEqual(["https://crysshop.kz/images/k2.jpg"]);
  });

  it("категория Google сопоставляется и для «Cумки» с латинской C", () => {
    const items = feedItems([base, { ...base, id: "2", sku: "S", categoryName: "Cумки" } as Product], NOW);
    expect(items.map((i) => i.googleProductCategory)).toEqual(["598", "3032"]);
    expect(items[1]).toMatchObject({ gender: "female", ageGroup: "adult" });
  });

  it("XML валиден: экранирование, без HTML в описании, обязательные поля", () => {
    const xml = buildMerchantFeed([base], NOW);
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    expect(doc.getElementsByTagName("parsererror")).toHaveLength(0);
    const g = (name: string) => doc.getElementsByTagNameNS("http://base.google.com/ns/1.0", name)[0]?.textContent;
    expect(g("description")).toBe("Ковёр с узорами. Синий & прочный");
    expect(g("link")).toBe("https://crysshop.kz/product/kover-s-uzorami-siniy");
    expect(g("availability")).toBe("in_stock");
    expect(g("condition")).toBe("new");
    expect(g("price")).toBe("35000.00 KZT");
  });
});
