import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PricePanel } from "./FilterBar";
import { CatalogFilters, EMPTY_VALUES } from "@/app/lib/catalogFilters";

const withPrice: CatalogFilters = { values: EMPTY_VALUES, priceFrom: 5000, priceTo: 20000, sort: "new" };

describe("Фильтр цены", () => {
  it("после «Сбросить» при открытой панели «Применить» не возвращает старую цену", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <PricePanel bounds={[1000, 50000]} filters={withPrice} onChange={onChange} close={() => {}} />
    );
    expect(screen.getByLabelText("Цена от")).toHaveValue(5000);

    // Сброс пришёл снаружи — через адрес страницы
    const reset = { ...withPrice, priceFrom: null, priceTo: null };
    rerender(<PricePanel bounds={[1000, 50000]} filters={reset} onChange={onChange} close={() => {}} />);

    await user.click(screen.getByRole("button", { name: "Применить" }));

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ priceFrom: null, priceTo: null }));
  });
});
