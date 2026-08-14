import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CheckoutForm from "./CheckoutForm";
import { CartContext } from "@/app/lib/CartContext";
import {
  calculateDeliveryOptions,
  fetchCdekDeliveryPoints,
  searchCdekCities,
  sendOrderData,
  setOrderDelivery,
} from "@/app/lib/data";
import { CartItemInterface } from "@/app/lib/interfaces/cart.item.interface";

vi.mock("@/app/lib/data", () => ({
  searchCdekCities: vi.fn(),
  calculateDeliveryOptions: vi.fn(),
  fetchCdekDeliveryPoints: vi.fn(),
  setOrderDelivery: vi.fn(),
  sendOrderData: vi.fn(),
}));

const ORDER_ID = "11111111-2222-3333-4444-555555555555";

const CART_ITEMS: CartItemInterface[] = [
  {
    productId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    orderId: ORDER_ID,
    quantity: 1,
    name: "Диван угловой",
    price: 100_000,
    imageUrl: "",
  },
];

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

const COURIER_OPTION = {
  type: "cdek_courier",
  name: "СДЭК курьером",
  cost: 5200,
  daysMin: 2,
  daysMax: 3,
  tariffCode: 137,
};

const PICKUP_OPTION = {
  type: "pickup",
  name: "Самовывоз",
  cost: 0,
  daysMin: 0,
  daysMax: 0,
};

const DELIVERY_POINT = {
  code: "ALM173",
  name: "Постамат ALM173",
  address: "ул. Сатпаева, 90",
  workTime: "Пн-Пт 10:00-20:00",
  phone: "+77011234567",
};

function renderForm() {
  const onOrderSubmit = vi.fn();
  const onDeliveryCostChange = vi.fn();

  render(
    <CartContext.Provider
      value={{
        isCartOpen: false,
        setIsCartOpen: () => {},
        cartItems: CART_ITEMS,
        setCartItems: () => {},
        addItemToCart: () => {},
        cartCount: 1,
        setCartCount: () => {},
        totalPrice: 100_000,
        setTotalPrice: () => {},
      }}
    >
      <CheckoutForm
        onOrderSubmit={onOrderSubmit}
        onDeliveryCostChange={onDeliveryCostChange}
      />
    </CartContext.Provider>
  );

  return { onOrderSubmit, onDeliveryCostChange };
}

async function fillPersonalData(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Введите фамилию"), "Иванов");
  await user.type(screen.getByPlaceholderText("Введите имя"), "Иван");
  await user.type(screen.getByPlaceholderText("Введите email"), "ivanov@example.com");
  await user.type(screen.getByPlaceholderText("+7 (___) ___-__-__"), "+77011234567");
}

/** Выбирает город и вариант доставки — общее начало всех сценариев. */
async function selectCityAndOption(
  user: ReturnType<typeof userEvent.setup>,
  optionName: string
) {
  await user.type(
    screen.getByPlaceholderText("Начните вводить название города"),
    "Алматы"
  );

  const cityOption = await screen.findByText("Алматы", {}, { timeout: 3000 });
  await user.click(cityOption);

  const deliveryOption = await screen.findByText(optionName, {}, { timeout: 3000 });
  await user.click(deliveryOption);
}

describe("CheckoutForm — доставка СДЭК", () => {
  beforeEach(() => {
    vi.mocked(searchCdekCities).mockResolvedValue([ALMATY]);
    vi.mocked(calculateDeliveryOptions).mockResolvedValue([
      PVZ_OPTION,
      COURIER_OPTION,
      PICKUP_OPTION,
    ]);
    vi.mocked(fetchCdekDeliveryPoints).mockResolvedValue([DELIVERY_POINT]);
    vi.mocked(setOrderDelivery).mockResolvedValue({
      success: true,
      orderId: ORDER_ID,
      deliveryType: "cdek_pvz",
      deliveryCost: 4030,
    });
    vi.mocked(sendOrderData).mockResolvedValue({
      phoneNumber: "+77011234567",
      orderId: ORDER_ID,
    });
  });

  it("сохраняет доставку до создания счёта и шлёт реальный тип доставки", async () => {
    const user = userEvent.setup();
    renderForm();

    await fillPersonalData(user);
    await selectCityAndOption(user, "СДЭК до ПВЗ");

    const pointSelect = await screen.findByRole("combobox", {}, { timeout: 3000 });
    await user.selectOptions(pointSelect, "ALM173");

    await user.click(screen.getByRole("button", { name: "Подтвердить заказ" }));

    await waitFor(() => expect(sendOrderData).toHaveBeenCalled());

    // Код ПВЗ и город уходят в СДЭК, без них накладную не создать
    expect(setOrderDelivery).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: ORDER_ID,
        deliveryType: "cdek_pvz",
        cdekDeliveryPointCode: "ALM173",
        address: expect.objectContaining({ cityCode: "4756" }),
        recipient: expect.objectContaining({ phone: "+77011234567" }),
      })
    );

    // Сумма счёта считается на бэкенде как товары + доставка,
    // поэтому доставка обязана сохраниться раньше создания заказа
    expect(vi.mocked(setOrderDelivery).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(sendOrderData).mock.invocationCallOrder[0]
    );

    // Раньше сюда уходил "Courier", и бэкенд затирал доставку СДЭК
    expect(sendOrderData).toHaveBeenCalledWith(
      expect.objectContaining({ deliveryMethod: "cdek_pvz", totalPrice: 104_030 })
    );
  });

  it("не уводит на банк, пока код не подтверждён", async () => {
    // Раньше здесь стоял window.location.href, и браузер уходил на ForteBank
    // сразу после создания счёта. Код приходил в WhatsApp «в никуда»,
    // а подтверждение доставки не выполнялось вовсе.
    const paymentUrl = "https://ecom.fortebank.com/flex?id=1000002014936";
    vi.mocked(sendOrderData).mockResolvedValue({
      phoneNumber: "+77011234567",
      orderId: ORDER_ID,
      redirectUrl: paymentUrl,
    });

    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: { href: "" },
    });

    try {
      const user = userEvent.setup();
      const { onOrderSubmit } = renderForm();

      await fillPersonalData(user);
      await selectCityAndOption(user, "СДЭК до ПВЗ");

      const pointSelect = await screen.findByRole("combobox", {}, { timeout: 3000 });
      await user.selectOptions(pointSelect, "ALM173");

      await user.click(screen.getByRole("button", { name: "Подтвердить заказ" }));

      await waitFor(() => expect(sendOrderData).toHaveBeenCalled());

      // Никуда не ушли, окно ввода кода получило управление
      expect(window.location.href).toBe("");
      expect(onOrderSubmit).toHaveBeenCalledWith("+77011234567");

      // Ссылку придержали до подтверждения
      expect(localStorage.getItem("redirectUrl")).toBe(paymentUrl);
    } finally {
      Object.defineProperty(window, "location", {
        configurable: true,
        writable: true,
        value: originalLocation,
      });
    }
  });

  it("для курьера передаёт адрес и не требует ПВЗ", async () => {
    const user = userEvent.setup();
    renderForm();

    await fillPersonalData(user);
    await selectCityAndOption(user, "СДЭК курьером");

    await user.type(screen.getByPlaceholderText("Введите улицу"), "Абая");
    await user.type(screen.getByPlaceholderText("Номер дома и квартиры"), "10");

    await user.click(screen.getByRole("button", { name: "Подтвердить заказ" }));

    await waitFor(() => expect(sendOrderData).toHaveBeenCalled());

    expect(setOrderDelivery).toHaveBeenCalledWith(
      expect.objectContaining({
        deliveryType: "cdek_courier",
        cdekDeliveryPointCode: undefined,
        address: expect.objectContaining({ street: "Абая", house: "10" }),
      })
    );
    expect(sendOrderData).toHaveBeenCalledWith(
      expect.objectContaining({ deliveryMethod: "cdek_courier" })
    );
  });

  it("не оформляет заказ до ПВЗ, если пункт выдачи не выбран", async () => {
    // В городе нет ПВЗ — селектор не отображается, срабатывает проверка формы
    vi.mocked(fetchCdekDeliveryPoints).mockResolvedValue([]);

    const user = userEvent.setup();
    renderForm();

    await fillPersonalData(user);
    await selectCityAndOption(user, "СДЭК до ПВЗ");

    await screen.findByText(/нет пунктов выдачи/i, {}, { timeout: 3000 });
    await user.click(screen.getByRole("button", { name: "Подтвердить заказ" }));

    expect(await screen.findByText("Выберите пункт выдачи.")).toBeInTheDocument();
    expect(setOrderDelivery).not.toHaveBeenCalled();
    expect(sendOrderData).not.toHaveBeenCalled();
  });

  it("самовывоз не дёргает API доставки и уходит как Pickup", async () => {
    const user = userEvent.setup();
    renderForm();

    await fillPersonalData(user);
    await selectCityAndOption(user, "Самовывоз");

    await user.click(screen.getByRole("button", { name: "Подтвердить заказ" }));

    await waitFor(() => expect(sendOrderData).toHaveBeenCalled());

    expect(setOrderDelivery).not.toHaveBeenCalled();
    expect(sendOrderData).toHaveBeenCalledWith(
      expect.objectContaining({ deliveryMethod: "Pickup", totalPrice: 100_000 })
    );
  });

  it("не создаёт заказ, если доставку сохранить не удалось", async () => {
    vi.mocked(setOrderDelivery).mockResolvedValue({
      success: false,
      orderId: ORDER_ID,
      deliveryType: "cdek_pvz",
      deliveryCost: 0,
      error: "Ошибка расчёта СДЭК",
    });

    const user = userEvent.setup();
    renderForm();

    await fillPersonalData(user);
    await selectCityAndOption(user, "СДЭК до ПВЗ");

    const pointSelect = await screen.findByRole("combobox", {}, { timeout: 3000 });
    await user.selectOptions(pointSelect, "ALM173");

    await user.click(screen.getByRole("button", { name: "Подтвердить заказ" }));

    expect(await screen.findByText("Ошибка расчёта СДЭК")).toBeInTheDocument();
    // Иначе покупатель оплатил бы заказ без доставки
    expect(sendOrderData).not.toHaveBeenCalled();
  });

  it("сообщает наверх стоимость доставки для сводки заказа", async () => {
    const user = userEvent.setup();
    const { onDeliveryCostChange } = renderForm();

    await selectCityAndOption(user, "СДЭК до ПВЗ");

    await waitFor(() => expect(onDeliveryCostChange).toHaveBeenCalledWith(4030));
  });
});
