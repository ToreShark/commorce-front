import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ProductCard from "@/app/components/Home/ProductCard";
import { Product } from "./interfaces/product.interface";
import { PricingClockProvider } from "./PricingClock";

// Акция по 29.01.2024 включительно; сервер рендерил в последний её день
const SALE = {
  id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  name: "Сумка",
  title: "Сумка",
  slug: "sumka",
  price: 10_000,
  discountPercentage: 10,
  discountStartDate: "2024-01-05T00:00:00",
  discountEndDate: "2024-01-29T00:00:00",
  images: [],
} as unknown as Product;

const card = (
  <PricingClockProvider serverNow="2024-01-29T23:30:00.000Z">
    <ProductCard product={SALE} />
  </PricingClockProvider>
);

/**
 * Скидка зависит от «сейчас». На границе UTC-дня сервер и браузер расходились,
 * действует ли она, — React ловил hydration mismatch (замечание ревью Codex).
 */
describe("Часы цен", () => {
  it("серверная разметка считает скидку от момента сервера, а не от часов машины", () => {
    // По часам машины акция давно кончилась, но HTML собран 29.01.2024 — скидка есть
    // React разбивает текст комментариями <!-- --> — убираем их перед сравнением
    const html = renderToString(card).replace(/<!-- -->/g, "").replace(/[\u00a0\u202f]/g, " ");
    expect(html).toContain("Скидка −10%");
    expect(html).toContain("9 000 ₸");
  });

  it("после гидратации браузер переходит на своё время и снимает кончившуюся скидку", () => {
    render(card);
    expect(screen.queryByText(/Скидка/)).not.toBeInTheDocument();
  });
});
