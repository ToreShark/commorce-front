import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ProductInfo from "./ProductInfo";
import { CartContext } from "@/app/lib/CartContext";
import { Product } from "@/app/lib/interfaces/product.interface";

vi.mock("@/app/product/whatsAppButton", () => ({ default: () => null }));

const SHOES = {
  id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  title: "Туфли",
  name: "Туфли мюли",
  price: 24_000,
  discountPercentage: 0,
  slug: "tufli",
  images: [],
  propertiesJson: JSON.stringify([
    { Название: "Размер", Значение: "38" },
    { Название: "Размер", Значение: "39" },
    { Название: "Цвет", Значение: "Розовый" },
  ]),
} as unknown as Product;

function renderInfo() {
  const addItemToCart = vi.fn();
  render(
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
      <ProductInfo product={SHOES} />
    </CartContext.Provider>
  );
  return { addItemToCart };
}

/**
 * Размер на странице товара. Раньше выбора не было вовсе: товар уходил в заказ
 * без размера, и продавец узнавал его только звонком.
 */
describe("Страница товара — выбор размера", () => {
  it("без размера в корзину не кладёт и просит выбрать", async () => {
    const user = userEvent.setup();
    const { addItemToCart } = renderInfo();

    await user.click(screen.getByRole("button", { name: "Добавить в корзину" }));

    expect(addItemToCart).not.toHaveBeenCalled();
    expect(screen.getByText("выберите размер")).toBeInTheDocument();
  });

  it("выбранный размер и единственный цвет уходят в корзину", async () => {
    const user = userEvent.setup();
    const { addItemToCart } = renderInfo();

    await user.click(screen.getByRole("radio", { name: "39" }));
    await user.click(screen.getByRole("button", { name: "Добавить в корзину" }));

    expect(addItemToCart).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: SHOES.id,
        price: 24_000,
        selectedProperties: JSON.stringify({ Размер: "39", Цвет: "Розовый" }),
      })
    );
  });
});
