import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Cookies from "js-cookie";
import { sendSmsCodeOrder } from "./data";
import { subscribeAuthChanged } from "./authEvents";

/**
 * Вход покупателя, выданный на подтверждении заказа.
 *
 * Учётку заводят ещё на отправке кода, но сессию ей не выдавали: человек оформлял
 * заказ и оставался анонимом — в шапке «войти», «История заказов» пуста.
 * Бэкенд теперь кладёт access-токен в ответ ConfirmAndSaveDelivery, и его надо
 * сохранить там же, где его сохраняет обычный вход по коду (sendSmsCode).
 *
 * Разбор: I_STORE/docs/checkout-cart-reset-and-autologin-2026-09-08.md.
 */
describe("sendSmsCodeOrder", () => {
  const PHONE = "+77011234567";
  const ORDER_ID = "dbbea6bd-8c94-4aea-8a63-41fc4b07e1a5";
  const TOKEN = "eyJhbGciOiJIUzI1NiJ9.живой-токен";

  const respondWith = (body: unknown) => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => body,
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  };

  const confirm = () =>
    sendSmsCodeOrder(PHONE, "123456", ORDER_ID, "Pickup");

  beforeEach(() => {
    localStorage.clear();
    Cookies.remove("token");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("сохраняет выданный вход так же, как обычный вход по коду", async () => {
    respondWith({ success: true, message: "Pickup selected successfully", token: TOKEN });

    await confirm();

    // Оба места: шапка читает localStorage, запросы с сервера — куку
    expect(localStorage.getItem("accessToken")).toBe(TOKEN);
    expect(Cookies.get("token")).toBe(TOKEN);
  });

  it("сообщает шапке о новом входе, чтобы та не ждала перезагрузки", async () => {
    respondWith({ success: true, message: "Pickup selected successfully", token: TOKEN });

    const onAuthChanged = vi.fn();
    const unsubscribe = subscribeAuthChanged(onAuthChanged);

    await confirm();
    unsubscribe();

    expect(onAuthChanged).toHaveBeenCalledTimes(1);
  });

  it("не роняет оформление, если токена в ответе нет", async () => {
    // Так отвечает бэкенд, не нашедший учётку по номеру, — и так отвечал
    // старый бэкенд до выкладки. Заказ создан, ошибку показывать не за что
    respondWith({ success: true, message: "Pickup selected successfully" });

    const result = await confirm();

    expect(result.success).toBe(true);
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(Cookies.get("token")).toBeUndefined();
  });

  it("не тревожит шапку, когда входа не выдали", async () => {
    respondWith({ success: true, message: "Pickup selected successfully" });

    const onAuthChanged = vi.fn();
    const unsubscribe = subscribeAuthChanged(onAuthChanged);

    await confirm();
    unsubscribe();

    expect(onAuthChanged).not.toHaveBeenCalled();
  });

  it("не выдаёт вход по неверному коду", async () => {
    respondWith({
      success: false,
      error: "invalid_code",
      message: "Неверный код. Осталось попыток: 2",
    });

    const result = await confirm();

    expect(result.success).toBe(false);
    expect(localStorage.getItem("accessToken")).toBeNull();
  });

  it("не затирает уже сохранённый вход ответом без токена", async () => {
    localStorage.setItem("accessToken", "прежний-токен");
    respondWith({ success: true, message: "Pickup selected successfully" });

    await confirm();

    expect(localStorage.getItem("accessToken")).toBe("прежний-токен");
  });
});
