import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SmsVerificationModal from "./SmsVerificationModal";
import { CartContext } from "@/app/lib/CartContext";
import { CartItemInterface } from "@/app/lib/interfaces/cart.item.interface";
import { OrderDataViewModel } from "@/app/lib/interfaces/OrderDataViewModel.interface";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const sendSmsCodeOrder = vi.fn();
const fetchOrderDetails = vi.fn();

vi.mock("@/app/lib/data", () => ({
  sendSmsCodeOrder: (...args: unknown[]) => sendSmsCodeOrder(...args),
  fetchOrderDetails: (...args: unknown[]) => fetchOrderDetails(...args),
}));

const PHONE = "+77011234567";
const ORDER_ID = "dbbea6bd-8c94-4aea-8a63-41fc4b07e1a5";
const CODE = "123456";

const ORDER: OrderDataViewModel = {
  orderId: ORDER_ID,
  customerName: "Иванов Иван",
  cellPhone: PHONE,
  referenceId: "",
  items: [],
  totalPrice: 76_950,
  orderDate: "2026-09-08T15:12:52Z",
  status: "Confirmed",
  delivery: null,
  payment: null,
  deliveryAddress: null,
};

/**
 * Подтверждение заказа кодом из WhatsApp.
 *
 * Живой проверкой 08.09 нашли: заказ уходит в Confirmed, сервер чистит корзину
 * в сессии, а счётчик в шапке продолжает показывать товар — провайдер читает
 * корзину один раз на монтировании и о серверной очистке не узнаёт.
 * Разбор: I_STORE/docs/checkout-cart-reset-and-autologin-2026-09-08.md.
 */
describe("Подтверждение заказа кодом", () => {
  const STALE_ITEM = {
    productId: "0f3f2b16-1f2d-4a71-9a1f-2f4b7e6c1234",
    quantity: 1,
  } as unknown as CartItemInterface;

  let cart: {
    items: CartItemInterface[];
    count: number;
    total: number;
    refreshed: number;
  };

  /** Провайдер, в котором корзина ещё держит уже оформленный товар. */
  const renderModal = (refreshCart: () => Promise<boolean>) => {
    const value = {
      isCartOpen: false,
      setIsCartOpen: vi.fn(),
      cartItems: cart.items,
      setCartItems: (items: CartItemInterface[]) => {
        cart.items = items;
      },
      addItemToCart: vi.fn(),
      cartCount: cart.count,
      setCartCount: (count: number) => {
        cart.count = count;
      },
      totalPrice: cart.total,
      setTotalPrice: (price: number) => {
        cart.total = price;
      },
      refreshCart,
    };

    return render(
      <CartContext.Provider value={value}>
        <SmsVerificationModal phoneNumber={PHONE} isOpen onClose={vi.fn()} />
      </CartContext.Provider>
    );
  };

  const submitCode = async () => {
    const user = userEvent.setup();
    await user.type(screen.getByRole("textbox"), CODE);
    await user.click(screen.getByRole("button", { name: "Подтвердить" }));
  };

  beforeEach(() => {
    cart = { items: [STALE_ITEM], count: 1, total: 76_950, refreshed: 0 };

    localStorage.setItem("orderId", ORDER_ID);
    localStorage.setItem("deliveryType", "Pickup");
    localStorage.setItem("phoneNumber", PHONE);

    fetchOrderDetails.mockResolvedValue(ORDER);
  });

  it("перечитывает корзину с сервера, а не обнуляет её вслепую", async () => {
    sendSmsCodeOrder.mockResolvedValue({ success: true, token: "живой-токен" });

    // Сервер уже пуст: Session.Remove("Cart") отработал в ConfirmAndSaveDelivery
    const refreshCart = vi.fn(async () => {
      cart.items = [];
      cart.count = 0;
      cart.total = 0;
      cart.refreshed += 1;
      return true;
    });

    renderModal(refreshCart);
    await submitCode();

    await waitFor(() => expect(refreshCart).toHaveBeenCalledTimes(1));
    expect(cart.count).toBe(0);
    expect(cart.items).toEqual([]);
    expect(cart.total).toBe(0);
  });

  it("обнуляет корзину сам, если сервер не ответил", async () => {
    sendSmsCodeOrder.mockResolvedValue({ success: true, token: "живой-токен" });

    // fetchCartInfo сетевую ошибку глотает и отдаёт null — исключения не будет,
    // о неудаче говорит false. Заказ оформлен, показывать старую корзину нельзя
    const refreshCart = vi.fn(async () => false);

    renderModal(refreshCart);
    await submitCode();

    await waitFor(() => expect(cart.count).toBe(0));
    expect(cart.items).toEqual([]);
    expect(cart.total).toBe(0);
  });

  it("доводит оформление до конца, даже если вход не выдан", async () => {
    // Бэкенд без правки блока B либо не нашедший учётку токена не вернёт.
    // Заказ уже создан — ошибку покупателю показывать не за что
    sendSmsCodeOrder.mockResolvedValue({ success: true });

    const refreshCart = vi.fn(async () => true);

    renderModal(refreshCart);
    await submitCode();

    await waitFor(() =>
      expect(screen.getByText("Заказ оформлен!")).toBeInTheDocument()
    );
    expect(screen.queryByText(/Неверный код/)).not.toBeInTheDocument();
    expect(localStorage.getItem("orderId")).toBeNull();
  });

  it("не трогает корзину, когда код неверный", async () => {
    sendSmsCodeOrder.mockResolvedValue({
      success: false,
      message: "Неверный код. Осталось попыток: 2",
    });

    const refreshCart = vi.fn(async () => true);

    renderModal(refreshCart);
    await submitCode();

    await waitFor(() =>
      expect(screen.getByText(/Неверный код/)).toBeInTheDocument()
    );
    expect(refreshCart).not.toHaveBeenCalled();
    expect(cart.count).toBe(1);
    // Заказ не подтверждён — данные для повторной попытки должны остаться
    expect(localStorage.getItem("orderId")).toBe(ORDER_ID);
  });
});
