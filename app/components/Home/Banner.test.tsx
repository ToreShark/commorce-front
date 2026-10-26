import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Banner from "./Banner";
import { Product } from "@/app/lib/interfaces/product.interface";

const BAG = {
  id: "bag-1",
  name: "Женская сумка на плечо",
  title: "Женская сумка на плечо",
  price: 31000,
  // Скидка была в январе 2024 и давно закончилась
  discountPercentage: 10,
  discountStartDate: "2024-01-05T00:00:00",
  discountEndDate: "2024-01-29T00:00:00",
  slug: "zhenskaya-sumka-na-plecho-golubaya",
  createdAt: "2026-10-01T00:00:00",
  images: [{ id: "i", imagePath: "/images/bag.jpg", order: 0 }],
} as unknown as Product;

const text = () => document.body.textContent?.replace(/[  ]/g, " ") ?? "";

describe("баннер на главной — цена", () => {
  it("закончившаяся скидка не применяется: 31 000 ₸, а не 27 900", () => {
    render(<Banner products={[BAG]} />);
    expect(text()).toContain("31 000 ₸");
    expect(text()).not.toContain("27");
    expect(screen.queryByText(/27[ ,.]900/)).toBeNull();
  });

  it("действующая скидка — цена со скидкой в русском формате", () => {
    render(<Banner products={[{ ...BAG, discountStartDate: null, discountEndDate: null } as unknown as Product]} />);
    expect(text()).toContain("27 900 ₸");
  });
});
