import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ShopPage from "./page";

const searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams,
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/shop",
}));

const fetchProducts = vi.fn();
const fetchCategories = vi.fn();

vi.mock("@/app/lib/data", () => ({
  fetchProducts: (...args: unknown[]) => fetchProducts(...args),
  fetchCategories: () => fetchCategories(),
}));

vi.mock("@/app/components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const DRESS = {
  id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  title: "Платье",
  name: "Платье нарядное",
  price: 72_500,
  discountPercentage: 0,
  slug: "plate-naryadnoe",
  images: [],
};

/**
 * Страница выдачи.
 *
 * Строка поиска клала запрос в /shop?search=…, а страница этот параметр
 * не читала: запрос уходил на бэкенд без единого признака поиска, и покупатель
 * получал весь каталог по убыванию цены.
 * Разбор: I_STORE/docs/search-relevance-task-2026-09-08.md.
 */
describe("ShopPage — поиск", () => {
  beforeEach(() => {
    fetchProducts.mockReset();
    fetchCategories.mockReset().mockResolvedValue([]);
    Array.from(searchParams.keys()).forEach((key) => searchParams.delete(key));
  });

  it("передаёт запрос из адреса на бэкенд", async () => {
    searchParams.set("search", "платья");
    fetchProducts.mockResolvedValue([DRESS]);

    render(<ShopPage />);

    await waitFor(() => expect(fetchProducts).toHaveBeenCalled());
    // Четвёртым аргументом — сам запрос; раньше параметра не существовало вовсе
    expect(fetchProducts.mock.calls[0][3]).toBe("платья");
  });

  it("без запроса на бэкенд уходит пустая строка — это обычный каталог", async () => {
    fetchProducts.mockResolvedValue([DRESS]);

    render(<ShopPage />);

    await waitFor(() => expect(fetchProducts).toHaveBeenCalled());
    expect(fetchProducts.mock.calls[0][3]).toBe("");
  });

  it("пустая выдача поиска говорит про запрос, а не про фильтры", async () => {
    searchParams.set("search", "ыфваыфва");
    fetchProducts.mockResolvedValue([]);

    render(<ShopPage />);

    // Показать каталог целиком в ответ на неудачный поиск нельзя —
    // это ровно та жалоба, с которой всё началось
    expect(
      await screen.findByText(/По запросу «ыфваыфва» ничего не найдено/)
    ).toBeInTheDocument();
    expect(screen.getByText("Перейти в каталог")).toBeInTheDocument();
  });

  it("пустой каталог без запроса по-прежнему предлагает поменять фильтры", async () => {
    fetchProducts.mockResolvedValue([]);

    render(<ShopPage />);

    expect(await screen.findByText("Товары не найдены")).toBeInTheDocument();
  });

  it("показывает, по какому запросу выдача", async () => {
    searchParams.set("search", "платья");
    fetchProducts.mockResolvedValue([DRESS]);

    render(<ShopPage />);

    expect(
      await screen.findByText(/Результаты поиска/)
    ).toBeInTheDocument();
  });
});
