import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ProductCard from "./ProductCard";
import { CartContext } from "@/app/lib/CartContext";
import { Product } from "@/app/lib/interfaces/product.interface";

const PRODUCT = {
  id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  title: "Диван угловой",
  name: "Диван угловой",
  price: 100_000,
  discountPercentage: 0,
  slug: "divan-uglovoj",
  images: [{ imagePath: "/images/sofa.jpg" }],
} as unknown as Product;

/** Testing Library схлопывает неразрывные пробелы, поэтому ожидание нормализуем так же. */
function money(value: number) {
  return `${value.toLocaleString("ru-RU")} ₸`.replace(/\s+/g, " ");
}

function renderCard(product: Product = PRODUCT) {
  const addItemToCart = vi.fn().mockResolvedValue(true);

  const view = render(
    <CartContext.Provider
      value={{
        isCartOpen: false,
        setIsCartOpen: () => {},
        cartItems: [],
        setCartItems: () => {},
        addItemToCart,
        cartCount: 0,
        setCartCount: () => {},
        totalPrice: 0,
        setTotalPrice: () => {},
        refreshCart: async () => true,
      }}
    >
      <ProductCard product={product} />
    </CartContext.Provider>
  );

  return { addItemToCart, ...view };
}

describe("Карточка товара", () => {
  it("кнопка «В корзину» лежит в потоке, а не спозиционирована абсолютно", () => {
    // Регрессия: кнопка была absolute на top-40 и выезжала только по group-hover.
    // На тач-экранах ховера нет, карточка overflow-hidden — с телефона
    // добавить товар в корзину было невозможно.
    renderCard();

    const button = screen.getByRole("button", { name: /в корзину/i });
    const wrapper = button.parentElement!;

    expect(wrapper.className).not.toMatch(/\babsolute\b/);
    expect(wrapper.className).not.toMatch(/top-40/);
  });

  it("кладёт товар в корзину с ценой и путём картинки", async () => {
    const user = userEvent.setup();
    const { addItemToCart } = renderCard();

    await user.click(screen.getByRole("button", { name: /в корзину/i }));

    expect(addItemToCart).toHaveBeenCalledWith({
      productId: PRODUCT.id,
      name: "Диван угловой",
      price: 100_000,
      // Без префикса API: его добавляет вьюха корзины через getImageUrl
      imageUrl: "/images/sofa.jpg",
      quantity: 1,
      selectedProperties: "{}",
    });
  });

  it("округляет цену со скидкой до целых тенге", async () => {
    const user = userEvent.setup();
    const { addItemToCart } = renderCard({
      ...PRODUCT,
      price: 9_999,
      discountPercentage: 33,
    } as Product);

    // 9999 - 33% = 6699.33 — дробные тенге в корзину попасть не должны
    expect(screen.getByText(money(6699))).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /в корзину/i }));

    expect(addItemToCart).toHaveBeenCalledWith(
      expect.objectContaining({ price: 6699 })
    );
  });

  it("пишет «Скидка» на фото товара, пока скидка действует", () => {
    renderCard({ ...PRODUCT, discountPercentage: 20 } as Product);

    expect(screen.getByText("Скидка −20%")).toBeInTheDocument();
  });

  it("не пишет «Скидка» и не зачёркивает цену, если акция закончилась", () => {
    // Сумки со скидкой до 29.01.2024 висели на витрине зачёркнутой ценой,
    // а корзина считала полную — из-за этого бейдж в своё время и убирали
    renderCard({
      ...PRODUCT,
      discountPercentage: 10,
      discountStartDate: "2024-01-05T00:00:00",
      discountEndDate: "2024-01-29T00:00:00",
    } as Product);

    expect(screen.queryByText(/Скидка/)).not.toBeInTheDocument();
    expect(document.querySelector(".line-through")).toBeNull();
  });

  it("товар с несколькими размерами не кладёт в корзину, а ведёт выбирать размер", async () => {
    const user = userEvent.setup();
    const { addItemToCart } = renderCard({
      ...PRODUCT,
      propertiesJson: JSON.stringify([
        { Название: "Размер", Значение: "38" },
        { Название: "Размер", Значение: "39" },
      ]),
    } as Product);

    expect(screen.queryByRole("button", { name: /в корзину/i })).not.toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Выбрать размер" });
    expect(link).toHaveAttribute("href", "/product/divan-uglovoj");

    await user.click(link);
    expect(addItemToCart).not.toHaveBeenCalled();
  });

  it("единственный размер кладёт сразу и передаёт его в заказ", async () => {
    const user = userEvent.setup();
    const { addItemToCart } = renderCard({
      ...PRODUCT,
      propertiesJson: JSON.stringify([{ Название: "Размер", Значение: "240х95" }]),
    } as Product);

    await user.click(screen.getByRole("button", { name: /в корзину/i }));

    expect(addItemToCart).toHaveBeenCalledWith(
      expect.objectContaining({ selectedProperties: JSON.stringify({ Размер: "240х95" }) })
    );
  });
});
