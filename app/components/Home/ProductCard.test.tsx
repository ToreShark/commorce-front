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
  return `${value.toLocaleString()} ₸`.replace(/\s+/g, " ");
}

function renderCard(product: Product = PRODUCT) {
  const addItemToCart = vi.fn();

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

  it("показывает бейдж скидки только когда скидка есть", () => {
    const { unmount } = renderCard();
    expect(screen.queryByText(/-\d+%/)).not.toBeInTheDocument();
    unmount();

    renderCard({ ...PRODUCT, discountPercentage: 20 } as Product);
    expect(screen.getByText("-20%")).toBeInTheDocument();
  });
});
