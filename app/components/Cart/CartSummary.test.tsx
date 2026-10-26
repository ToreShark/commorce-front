import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CartSummary from "./CartSummary";
import { CartContext } from "@/app/lib/CartContext";
import type { CartItemInterface } from "@/app/lib/interfaces/cart.item.interface";

vi.mock("@/app/lib/promo/clock", () => ({
  usePromoClock: () => ({
    offset: 0,
    ready: true,
    config: {
      slug: "pokupatel-mesyaca",
      title: "Покупатель месяца",
      prizeName: "Смартфон iPhone 17 Pro Max, 256 ГБ",
      startsAt: new Date(Date.now() - 86_400_000).toISOString(),
      endsAt: new Date(Date.now() + 86_400_000).toISOString(),
      freezeHoursBeforeEnd: 24,
      holdDays: 14,
      minOrderAmount: 15000,
      rulesVersion: "2026-10-26",
      isFrozen: false,
      serverTime: new Date().toISOString(),
    },
  }),
}));

const NBSP = /[  ]/g;

describe("итоги корзины — подсказка акции", () => {
  it("порог считается по товарам, а не по сумме с доставкой", () => {
    // Товаров на 12 000 ₸, а totalPrice (Order.TotalPrice) с доставкой — 16 000 ₸
    const items = [{ productId: "p", orderId: "o", name: "Шарф", price: 6000, quantity: 2 }] as CartItemInterface[];
    render(
      <CartContext.Provider
        value={{
          isCartOpen: false,
          setIsCartOpen: vi.fn(),
          cartItems: items,
          setCartItems: vi.fn(),
          addItemToCart: vi.fn(),
          cartCount: 2,
          setCartCount: vi.fn(),
          totalPrice: 16000,
          setTotalPrice: vi.fn(),
          refreshCart: vi.fn(),
        }}
      >
        <CartSummary totalPrice={16000} itemCount={2} />
      </CartContext.Provider>
    );

    expect(screen.getByText(/Добавьте ещё/).textContent?.replace(NBSP, " ")).toContain("Добавьте ещё 3 000 ₸");
  });
});
