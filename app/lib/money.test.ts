import { describe, expect, it } from "vitest";
import { formatPrice, priceAmount } from "./money";

describe("цены", () => {
  it("машинный формат — целое число без разделителей", () => {
    expect(priceAmount(35000)).toBe("35000");
    expect(priceAmount(1360)).toBe("1360");
    expect(priceAmount(33210.4)).toBe("33210");
    expect(priceAmount(1234567)).toMatch(/^\d+$/);
  });

  it("видимый формат — тысячи через пробел, без точек, запятых и копеек", () => {
    const v = (n: number) => formatPrice(n).replace(/[  ]/g, " ");
    expect(v(35000)).toBe("35 000 ₸");
    expect(v(1360)).toBe("1 360 ₸");
    expect(v(33210.5)).toBe("33 211 ₸");
    expect(formatPrice(35000)).not.toMatch(/[.,]/);
  });
});
