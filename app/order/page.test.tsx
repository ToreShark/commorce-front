import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OrderPage from "./page";
import { CartContext } from "@/app/lib/CartContext";
import { calculateDeliveryOptions, searchCdekCities } from "@/app/lib/data";
import { CartItemInterface } from "@/app/lib/interfaces/cart.item.interface";

vi.mock("@/app/lib/data", () => ({
  searchCdekCities: vi.fn(),
  calculateDeliveryOptions: vi.fn(),
  fetchCdekDeliveryPoints: vi.fn().mockResolvedValue([]),
  setOrderDelivery: vi.fn(),
  sendOrderData: vi.fn(),
  fetchOrderDetails: vi.fn(),
  sendSmsCodeOrder: vi.fn(),
}));

// Шапка и футер тянут свои контексты и запросы — для проверки вёрстки заказа не нужны
vi.mock("@/app/components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/app/components/Shop", () => ({
  Breadcrumb: () => null,
}));

const ALMATY = {
  code: "4756",
  city: "Алматы",
  region: "городской округ Алматы",
  country: "Казахстан",
  fullName: "Алматы, городской округ Алматы, Казахстан",
};

const PVZ_OPTION = {
  type: "cdek_pvz",
  name: "СДЭК до ПВЗ",
  cost: 4030,
  daysMin: 2,
  daysMax: 3,
  tariffCode: 136,
};

const CART_ITEMS: CartItemInterface[] = [
  {
    productId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    orderId: "11111111-2222-3333-4444-555555555555",
    quantity: 1,
    name: "Диван угловой",
    price: 100_000,
    imageUrl: "",
  },
];

/** Testing Library схлопывает неразрывные пробелы, поэтому ожидание нормализуем так же. */
function money(value: number) {
  return `${value.toLocaleString()} ₸`.replace(/\s+/g, " ");
}

function renderPage(cartItems: CartItemInterface[]) {
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  render(
    <CartContext.Provider
      value={{
        isCartOpen: false,
        setIsCartOpen: () => {},
        cartItems,
        setCartItems: () => {},
        addItemToCart: () => {},
        cartCount: cartItems.length,
        setCartCount: () => {},
        totalPrice,
        setTotalPrice: () => {},
      }}
    >
      <OrderPage />
    </CartContext.Provider>
  );
}

describe("Страница оформления заказа", () => {
  beforeEach(() => {
    vi.mocked(searchCdekCities).mockResolvedValue([ALMATY]);
    vi.mocked(calculateDeliveryOptions).mockResolvedValue([PVZ_OPTION]);
  });

  it("показывает заглушку вместо формы, если корзина пуста", () => {
    renderPage([]);

    expect(screen.getByText("Корзина пуста")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Подтвердить заказ" })
    ).not.toBeInTheDocument();
  });

  it("переносит стоимость доставки из формы в сводку заказа", async () => {
    const user = userEvent.setup();
    renderPage(CART_ITEMS);

    // До выбора города доставка неизвестна
    expect(screen.getByText("Бесплатно")).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText("Начните вводить название города"),
      "Алматы"
    );
    await user.click(await screen.findByText("Алматы", {}, { timeout: 3000 }));
    await user.click(await screen.findByText("СДЭК до ПВЗ", {}, { timeout: 3000 }));

    // Сводка считает итог сама, поэтому сверяем и доставку, и сумму.
    // Стоимость доставки показывают и варианты доставки, и сводка — отсюда getAllByText
    await waitFor(() => expect(screen.getAllByText(money(4030)).length).toBeGreaterThan(0));
    expect(screen.getByText(money(104_030))).toBeInTheDocument();
  });
});
