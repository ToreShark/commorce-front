import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OrderConfirmationModal from "./OrderConfirmationModal";
import { OrderDataViewModel } from "@/app/lib/interfaces/OrderDataViewModel.interface";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const PAYMENT_URL = "https://ecom.fortebank.com/flex?id=1000002014936&password=igdlt0tz5j1v";

const ORDER: OrderDataViewModel = {
  orderId: "c8078e00-2204-473f-8e6a-beae4124ac04",
  customerName: "Иванов Иван",
  cellPhone: "+77011234567",
  referenceId: "",
  items: [],
  totalPrice: 76950,
  orderDate: "2026-08-14T10:00:00Z",
  status: "AwaitingPayment",
  delivery: null,
  payment: null,
  deliveryAddress: null,
};

let originalLocation: Location;

beforeEach(() => {
  originalLocation = window.location;
  // jsdom не умеет переходить по адресу — подменяем location, чтобы проверить намерение
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: { href: "" },
  });
});

afterEach(() => {
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: originalLocation,
  });
});

describe("Окно «Заказ оформлен»", () => {
  it("предлагает оплату и уводит на страницу банка", async () => {
    const user = userEvent.setup();

    render(
      <OrderConfirmationModal
        isOpen
        onClose={vi.fn()}
        orderData={ORDER}
        paymentUrl={PAYMENT_URL}
      />
    );

    await user.click(screen.getByRole("button", { name: "Оплатить заказ" }));

    // Адрес банка внешний: router.push по нему не уходит, нужен переход браузера
    expect(window.location.href).toBe(PAYMENT_URL);
    expect(push).not.toHaveBeenCalledWith(PAYMENT_URL);
  });

  it("оставляет только возврат на главную, если оплата не онлайн", () => {
    render(<OrderConfirmationModal isOpen onClose={vi.fn()} orderData={ORDER} />);

    expect(screen.queryByRole("button", { name: "Оплатить заказ" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Вернуться на главную" })).toBeInTheDocument();
  });

  it("возврат на главную не ведёт на оплату", async () => {
    const user = userEvent.setup();

    render(
      <OrderConfirmationModal
        isOpen
        onClose={vi.fn()}
        orderData={ORDER}
        paymentUrl={PAYMENT_URL}
      />
    );

    await user.click(screen.getByRole("button", { name: "Вернуться на главную" }));

    expect(window.location.href).toBe("");
    expect(push).toHaveBeenCalledWith("/");
  });

  it("блок акции не обещает участия до оплаты", () => {
    render(
      <OrderConfirmationModal isOpen onClose={vi.fn()} orderData={ORDER} paymentUrl={PAYMENT_URL} promoJoined />
    );

    // Запись в акции бэкенд создаёт только по подтверждённой оплате
    expect(screen.getByText(/Оплатите заказ картой, чтобы участвовать/)).toBeInTheDocument();
    expect(screen.getByText(/если оплата не пройдёт, в акции он не участвует/)).toBeInTheDocument();
    expect(screen.queryByText(/Ваш заказ участвует/)).toBeNull();
  });

  describe("GA4 purchase", () => {
    const purchases = () =>
      ((window as unknown as { dataLayer?: unknown[] }).dataLayer ?? [])
        .map((a) => Array.from(a as ArrayLike<unknown>))
        .filter((e) => e[1] === "purchase");

    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-TEST");
      delete (window as unknown as { dataLayer?: unknown[] }).dataLayer;
      localStorage.clear();
    });
    afterEach(() => vi.unstubAllEnvs());

    it("наличные: заказ оформлен — purchase сразу, повторное открытие не дублирует", () => {
      const { unmount } = render(<OrderConfirmationModal isOpen onClose={vi.fn()} orderData={ORDER} />);
      unmount();
      render(<OrderConfirmationModal isOpen onClose={vi.fn()} orderData={ORDER} />);
      expect(purchases()).toHaveLength(1);
      expect(purchases()[0][2]).toMatchObject({ transaction_id: ORDER.orderId, value: 76950, currency: "KZT" });
    });

    it("карта: до подтверждения банком purchase нет, заказ ждёт проверки оплаты", () => {
      render(<OrderConfirmationModal isOpen onClose={vi.fn()} orderData={ORDER} paymentUrl={PAYMENT_URL} />);
      expect(purchases()).toHaveLength(0);
      expect(JSON.parse(localStorage.getItem("ga_purchase_pending") || "[]")).toHaveLength(1);
    });
  });
});
