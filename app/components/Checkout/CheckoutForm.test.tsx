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
        refreshCart: async () => true,
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

async function fillPersonalData(
  user: ReturnType<typeof userEvent.setup>,
  { email = "ivanov@example.com" }: { email?: string } = {}
) {
  await user.type(screen.getByPlaceholderText("Введите имя"), "Иван");
  await user.type(screen.getByPlaceholderText("Введите фамилию"), "Иванов");
  if (email) {
    await user.type(screen.getByPlaceholderText("Введите email"), email);
  }
  await user.type(screen.getByPlaceholderText("+7 (___) ___-__-__"), "+77011234567");
}

/**
 * Что уходит на бэкенд из поля телефона.
 *
 * Поле теперь с маской (PhoneInput — тот же компонент, что и на входе),
 * и наружу оно отдаёт очищенные цифры, а не набранную строку. Бэкенд приводит
 * к E.164 любой из этих видов, но зафиксировать формат здесь стоит: именно
 * его расхождение между формами разводило одного покупателя по разным строкам
 * в Users. Разбор: I_STORE/docs/purchase-history-empty-2026-09-08.md.
 */
function submittedPhone() {
  return "77011234567";
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
        recipient: expect.objectContaining({ phone: submittedPhone() }),
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
    await user.type(screen.getByPlaceholderText("Номер дома"), "128");
    await user.type(screen.getByPlaceholderText("Квартира или офис"), "1");

    await user.click(screen.getByRole("button", { name: "Подтвердить заказ" }));

    await waitFor(() => expect(sendOrderData).toHaveBeenCalled());

    // Квартира отдельным полем: в DeliveryAddresses под неё своя колонка,
    // раньше «128, квартира 1» уезжало курьеру одной слипшейся строкой
    expect(setOrderDelivery).toHaveBeenCalledWith(
      expect.objectContaining({
        deliveryType: "cdek_courier",
        cdekDeliveryPointCode: undefined,
        address: expect.objectContaining({
          street: "Абая",
          house: "128",
          apartment: "1",
        }),
      })
    );
    expect(sendOrderData).toHaveBeenCalledWith(
      expect.objectContaining({ deliveryMethod: "cdek_courier" })
    );
  });

  it("не шлёт пустую квартиру, если её не заполнили", async () => {
    const user = userEvent.setup();
    renderForm();

    await fillPersonalData(user);
    await selectCityAndOption(user, "СДЭК курьером");

    await user.type(screen.getByPlaceholderText("Введите улицу"), "Абая");
    await user.type(screen.getByPlaceholderText("Номер дома"), "128");

    await user.click(screen.getByRole("button", { name: "Подтвердить заказ" }));

    await waitFor(() => expect(sendOrderData).toHaveBeenCalled());

    // Квартира необязательна: частный дом её не имеет
    const request = vi.mocked(setOrderDelivery).mock.calls[0][0];
    expect(request.address?.apartment).toBeUndefined();
    expect(request.address?.house).toBe("128");
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

  it("оформляет заказ без email", async () => {
    // Обязательный email стоял перед полем телефона и отсекал покупателей:
    // до отправки формы за неделю не дошёл никто (разбор от 02.09.2026)
    const user = userEvent.setup();
    renderForm();

    await fillPersonalData(user, { email: "" });
    await selectCityAndOption(user, "Самовывоз");

    await user.click(screen.getByRole("button", { name: "Подтвердить заказ" }));

    await waitFor(() => expect(sendOrderData).toHaveBeenCalled());
    expect(sendOrderData).toHaveBeenCalledWith(
      expect.objectContaining({ email: "", cellphone: submittedPhone() })
    );
  });

  it("отдаёт получателя как «Имя Фамилия», а не наоборот", async () => {
    // Поле firstName было подписано «Фамилия», и в накладную СДЭК уезжало
    // перевёрнутое имя получателя
    const user = userEvent.setup();
    renderForm();

    await fillPersonalData(user);
    await selectCityAndOption(user, "СДЭК до ПВЗ");

    const pointSelect = await screen.findByRole("combobox", {}, { timeout: 3000 });
    await user.selectOptions(pointSelect, "ALM173");

    await user.click(screen.getByRole("button", { name: "Подтвердить заказ" }));

    await waitFor(() => expect(setOrderDelivery).toHaveBeenCalled());
    expect(setOrderDelivery).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: expect.objectContaining({ name: "Иван Иванов" }),
      })
    );
    expect(sendOrderData).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: "Иван", lastName: "Иванов" })
    );
  });

  it("сообщает наверх стоимость доставки для сводки заказа", async () => {
    const user = userEvent.setup();
    const { onDeliveryCostChange } = renderForm();

    await selectCityAndOption(user, "СДЭК до ПВЗ");

    await waitFor(() => expect(onDeliveryCostChange).toHaveBeenCalledWith(4030));
  });
});
