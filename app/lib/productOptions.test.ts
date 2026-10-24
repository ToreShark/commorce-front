import { describe, expect, it } from "vitest";
import { buildSelection, formatSelection, needsChoice, productOptions } from "./productOptions";
import { Product } from "./interfaces/product.interface";

const product = (rows: [string, string][]) =>
  ({
    id: "p",
    price: 1000,
    propertiesJson: JSON.stringify(rows.map(([Название, Значение]) => ({ Название, Значение }))),
  }) as unknown as Product;

describe("Выбор размера и цвета", () => {
  it("у детской одежды без размера выбирают возраст", () => {
    const options = productOptions(product([["Возраст", "8"], ["Возраст", "7"]]));
    expect(options.map((o) => [o.facet.key, o.values])).toEqual([["age", ["7", "8"]]]);
  });

  it("выбирать нужно, только если вариантов больше одного", () => {
    expect(needsChoice(product([["Размер", "38"], ["Цвет", "Белый"]]))).toBe(false);
    expect(needsChoice(product([["Размер", "38"], ["Размер", "39"]]))).toBe(true);
  });

  it("пока размер не выбран, в корзину нельзя; единственный цвет подставляется сам", () => {
    const options = productOptions(product([["Размер", "38"], ["Размер", "39"], ["Цвет", "Белый"]]));

    expect(buildSelection(options, {}).missing.map((f) => f.key)).toEqual(["size"]);

    const done = buildSelection(options, { size: "39" });
    expect(done.missing).toEqual([]);
    expect(JSON.parse(done.json)).toEqual({ Размер: "39", Цвет: "Белый" });
  });

  it("значение, которого у товара нет, выбором не считается", () => {
    const options = productOptions(product([["Размер", "38"], ["Размер", "39"]]));
    expect(buildSelection(options, { size: "45" }).missing).toHaveLength(1);
  });

  it("показывает выбор человеческим текстом, пустой и битый — пустой строкой", () => {
    expect(formatSelection('{"Размер":"38","Цвет":"Белый"}')).toBe("Размер: 38 · Цвет: Белый");
    expect(formatSelection("{}")).toBe("");
    expect(formatSelection("не json")).toBe("");
    expect(formatSelection(null)).toBe("");
  });
});
