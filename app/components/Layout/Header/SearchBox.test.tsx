import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SearchBox from "./SearchBox";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

/**
 * Строка поиска в шапке.
 *
 * Разбор: I_STORE/docs/search-relevance-task-2026-09-08.md.
 */
describe("SearchBox", () => {
  beforeEach(() => {
    push.mockClear();
    window.history.replaceState({}, "", "/");
  });

  it("уводит на выдачу с запросом в адресе", async () => {
    const user = userEvent.setup();
    render(<SearchBox />);

    await user.type(screen.getByPlaceholderText("Поиск товаров..."), "платья");
    await user.click(screen.getByRole("button", { name: "Поиск" }));

    expect(push).toHaveBeenCalledWith(`/shop?search=${encodeURIComponent("платья")}`);
  });

  it("пустой запрос никуда не ведёт", async () => {
    const user = userEvent.setup();
    render(<SearchBox />);

    await user.type(screen.getByPlaceholderText("Поиск товаров..."), "   ");
    await user.click(screen.getByRole("button", { name: "Поиск" }));

    expect(push).not.toHaveBeenCalled();
  });

  it("показывает запрос, с которым покупатель пришёл", () => {
    // Иначе после поиска поле пустое, и уточнить запрос — значит набрать заново
    window.history.replaceState({}, "", "/shop?search=платья");

    render(<SearchBox />);

    expect(screen.getByPlaceholderText("Поиск товаров...")).toHaveValue("платья");
  });
});
