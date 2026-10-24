import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ShopPage from "./ShopPage";

const searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
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

    // Запрос стоит в заголовке страницы, как название категории
    expect(
      await screen.findByRole("heading", { level: 1, name: "Поиск: «платья»" })
    ).toBeInTheDocument();
  });
});

describe("ShopPage — фильтры", () => {
  const props = (size: string, color: string) =>
    JSON.stringify([
      { Название: "Размер", Значение: size },
      { Название: "Цвет", Значение: color },
    ]);

  const SHOES_38 = { ...DRESS, id: "1", name: "Туфли белые", slug: "t1", propertiesJson: props("38", "Белый") };
  const SHOES_40 = { ...DRESS, id: "2", name: "Туфли чёрные", slug: "t2", propertiesJson: props("40", "Черный") };

  beforeEach(() => {
    fetchProducts.mockReset().mockResolvedValue([SHOES_38, SHOES_40]);
    fetchCategories.mockReset().mockResolvedValue([]);
    Array.from(searchParams.keys()).forEach((key) => searchParams.delete(key));
  });

  it("каталог грузится без потолка цены — иначе дорогие товары пропадали", async () => {
    render(<ShopPage />);

    await waitFor(() => expect(fetchProducts).toHaveBeenCalled());
    expect(fetchProducts.mock.calls[0][0]).toBeUndefined();
    expect(fetchProducts.mock.calls[0][1]).toBeUndefined();
  });

  it("размер из адреса отбирает товары", async () => {
    searchParams.set("size", "38");

    render(<ShopPage />);

    expect(await screen.findByText("Туфли белые")).toBeInTheDocument();
    expect(screen.queryByText("Туфли чёрные")).not.toBeInTheDocument();
    expect(screen.getByText("1 товар")).toBeInTheDocument();
  });

  it("если фильтры отсекли всё, предлагает их сбросить", async () => {
    searchParams.set("size", "38");
    searchParams.set("color", "Черный");

    render(<ShopPage />);

    expect(await screen.findByText("Сбросить фильтры")).toBeInTheDocument();
  });

  it("на телефоне фильтры открываются кнопкой и показывают, сколько будет товаров", async () => {
    searchParams.set("size", "38");
    const user = userEvent.setup();

    render(<ShopPage />);
    await screen.findByText("Туфли белые");

    await user.click(screen.getByRole("button", { name: /^Фильтры/ }));

    expect(screen.getByRole("dialog", { name: "Фильтры" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Показать 1 товар" })).toBeInTheDocument();
  });

  it("GUID категории в адресе принимается в любом регистре", async () => {
    const id = "c7e58dca-f60e-4a2e-b49b-08dbf99704a5";
    fetchProducts.mockResolvedValue([
      { ...SHOES_38, categoryId: id },
      { ...SHOES_40, categoryId: "bdee48a7-2b85-4946-c541-08dc233d9b16" },
    ]);
    fetchCategories.mockResolvedValue([{ id, name: "Обувь женская", slug: "obuv" }]);
    searchParams.set("category", id.toUpperCase());

    render(<ShopPage />);

    expect(await screen.findByText("Туфли белые")).toBeInTheDocument();
    expect(screen.queryByText("Туфли чёрные")).not.toBeInTheDocument();
  });
});
