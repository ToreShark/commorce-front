import { describe, expect, it } from "vitest";
import { activeDiscountPercent, discountedPrice, toDateInputValue } from "./discount";

const now = new Date(Date.UTC(2026, 9, 15, 12, 0, 0));

describe("activeDiscountPercent", () => {
  it("процент без дат действует сразу — распродажа остатков", () => {
    expect(activeDiscountPercent({ price: 65000, discountPercentage: 30 }, now)).toBe(30);
    expect(discountedPrice({ price: 65000, discountPercentage: 30 }, now)).toBe(45500);
  });

  it.each(["0001-01-01T00:00:00", "1970-01-01T00:00:00.000Z", "1969-12-31T00:00:00"])(
    "заглушка старой админки %s считается пустой датой",
    (placeholder) => {
      const p = { price: 100, discountPercentage: 20, discountStartDate: placeholder, discountEndDate: placeholder };
      expect(activeDiscountPercent(p, now)).toBe(20);
    }
  );

  it("дата окончания включительно", () => {
    const p = { price: 100, discountPercentage: 10, discountEndDate: "2026-10-15T00:00:00" };
    expect(activeDiscountPercent(p, now)).toBe(10);
    expect(activeDiscountPercent(p, new Date(Date.UTC(2026, 9, 16)))).toBe(0);
  });

  it("закончившаяся скидка не показывается — сумки с январской скидкой 2024", () => {
    const p = {
      price: 31000,
      discountPercentage: 10,
      discountStartDate: "2024-01-05T00:00:00",
      discountEndDate: "2024-01-29T00:00:00",
    };
    expect(discountedPrice(p, now)).toBeNull();
  });

  it("скидка с будущей даты ещё не действует", () => {
    expect(activeDiscountPercent({ price: 100, discountPercentage: 10, discountStartDate: "2026-10-16" }, now)).toBe(0);
  });

  it.each([null, undefined, 0, -5, 100, 150])("бессмысленный процент %s игнорируется", (percent) => {
    expect(discountedPrice({ price: 100, discountPercentage: percent }, now)).toBeNull();
  });

  it("округляет до целого тенге, как сервер", () => {
    expect(discountedPrice({ price: 2780, discountPercentage: 33 }, now)).toBe(1863);
  });
});

describe("toDateInputValue", () => {
  it("обрезает время и прячет заглушки", () => {
    expect(toDateInputValue("2026-10-20T00:00:00")).toBe("2026-10-20");
    expect(toDateInputValue("1970-01-01T00:00:00")).toBe("");
    expect(toDateInputValue(null)).toBe("");
  });
});
