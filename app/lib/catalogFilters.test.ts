import { describe, expect, it } from "vitest";
import {
  CatalogFilters,
  EMPTY_VALUES,
  FACETS,
  applyFilters,
  facetOptions,
  filtersFromParams,
  filtersToParams,
  productFacetValues,
  sortProducts,
} from "./catalogFilters";
import { Product } from "./interfaces/product.interface";

const props = (rows: [string, string][]) =>
  JSON.stringify(rows.map(([Название, Значение], id) => ({ id, Название, Значение })));

const product = (id: string, price: number, rows: [string, string][], extra = {}) =>
  ({ id, price, discountPercentage: 0, propertiesJson: props(rows), createdAt: "2026-01-01", ...extra }) as unknown as Product;

const SIZE = FACETS.find((f) => f.key === "size")!;
const COLOR = FACETS.find((f) => f.key === "color")!;
const AGE = FACETS.find((f) => f.key === "age")!;

const none: CatalogFilters = { values: EMPTY_VALUES, priceFrom: null, priceTo: null, sort: "new" };

const SHOES = product("shoes", 30_000, [["Размер", "38"], ["Размер", "39"], ["Цвет", "Белый"]]);
const BOOTS = product("boots", 50_000, [["Размер ", "39"], ["Цвет", "черный"]]);
const SHIRT = product("shirt", 10_000, [["Возраст", "7"], ["Возраст", "Бежевый"], ["Цвет", "Белый"]]);
const ALL = [SHOES, BOOTS, SHIRT];

describe("Фильтры каталога", () => {
  it("читает характеристику без учёта пробелов и регистра, цвета сводит к одному виду", () => {
    expect(productFacetValues(BOOTS, SIZE)).toEqual(["39"]);
    expect(productFacetValues(BOOTS, COLOR)).toEqual(["Черный"]);
  });

  it("выкидывает из «Возраста» то, что не число", () => {
    expect(productFacetValues(SHIRT, AGE)).toEqual(["7"]);
  });

  it("внутри фильтра — «или», между фильтрами — «и»", () => {
    const sizes = { ...none, values: { ...EMPTY_VALUES, size: ["38", "39"] } };
    expect(applyFilters(ALL, sizes).map((p) => p.id)).toEqual(["shoes", "boots"]);

    const sizeAndColor = { ...none, values: { ...EMPTY_VALUES, size: ["39"], color: ["Белый"] } };
    expect(applyFilters(ALL, sizeAndColor).map((p) => p.id)).toEqual(["shoes"]);
  });

  it("цена фильтруется по цене со скидкой — той, что видна на карточке", () => {
    const sale = product("sale", 100_000, [], { discountPercentage: 50 });
    const upTo60 = { ...none, priceTo: 60_000 };
    expect(applyFilters([sale], upTo60)).toHaveLength(1);
  });

  it("счётчики фильтра не учитывают выбор в нём же", () => {
    const filters = { ...none, values: { ...EMPTY_VALUES, size: ["38"] } };
    expect(facetOptions(ALL, filters, SIZE)).toEqual([
      { value: "38", count: 1 },
      { value: "39", count: 2 },
    ]);
    // А цвета считаются уже по 38-му размеру
    expect(facetOptions(ALL, filters, COLOR)).toEqual([{ value: "Белый", count: 1 }]);
  });

  it("выбранное значение остаётся в списке, даже если товаров с ним нет", () => {
    const filters = { ...none, values: { ...EMPTY_VALUES, size: ["45"] } };
    expect(facetOptions(ALL, filters, SIZE)).toContainEqual({ value: "45", count: 0 });
  });

  it("размеры идут по возрастанию как числа", () => {
    const p = product("p", 1, [["Размер", "10"], ["Размер", "9"], ["Размер", "240х95"]]);
    expect(facetOptions([p], none, SIZE).map((o) => o.value)).toEqual(["9", "10", "240х95"]);
  });

  it("переживает поездку через адрес и не трогает category и search", () => {
    const filters: CatalogFilters = {
      values: { size: ["38", "39"], color: ["Белый"], age: [] },
      priceFrom: 1000,
      priceTo: null,
      sort: "price-asc",
    };
    const params = filtersToParams(filters, new URLSearchParams("category=obuv&search=туфли"));
    expect(params.get("category")).toBe("obuv");
    expect(params.get("search")).toBe("туфли");
    expect(filtersFromParams(params)).toEqual(filters);
  });

  it("мусор в адресе не ломает страницу", () => {
    const f = filtersFromParams(new URLSearchParams("sort=hack&price_from=abc&price_to=-5"));
    expect(f).toEqual(none);
  });

  it("сортировка по цене учитывает скидку", () => {
    const sale = product("sale", 100_000, [], { discountPercentage: 90 });
    expect(sortProducts([SHOES, sale], "price-asc").map((p) => p.id)).toEqual(["sale", "shoes"]);
  });

  it("«со скидкой» ставит акционные товары первыми, большую скидку — раньше", () => {
    const sale10 = product("sale10", 1000, [], { discountPercentage: 10 });
    const sale50 = product("sale50", 1000, [], { discountPercentage: 50 });
    expect(sortProducts([SHOES, sale10, sale50], "discount").map((p) => p.id)).toEqual([
      "sale50",
      "sale10",
      "shoes",
    ]);
  });
});
