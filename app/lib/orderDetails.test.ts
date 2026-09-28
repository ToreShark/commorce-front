import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Cookies from "js-cookie";
import { fetchOrderDetails } from "./data";

/**
 * Карточка заказа: с чем запрос уходит на бэкенд.
 *
 * /OrderClient/GetOrderById отдавал телефон и состав любого заказа кому угодно.
 * Теперь бэкенд пускает только владельца или админку, а остальным отвечает 404.
 * Запрос обязан нести вход: окно «заказ оформлен» открывается, когда корзина
 * в сессии уже очищена, а админка иначе как по токену не опознаётся.
 */
describe("fetchOrderDetails", () => {
  const ORDER_ID = "74017513-23cc-4182-bdcc-2daecb802f47";

  const okFetch = () =>
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ orderId: ORDER_ID }),
    });

  const headersOf = (fetchMock: ReturnType<typeof vi.fn>) =>
    fetchMock.mock.calls[0][1].headers as Record<string, string>;

  beforeEach(() => {
    localStorage.clear();
    Cookies.remove("token");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("шлёт токен покупателя, выданный после кода", async () => {
    localStorage.setItem("accessToken", "токен-покупателя");
    const fetchMock = okFetch();
    vi.stubGlobal("fetch", fetchMock);

    await fetchOrderDetails(ORDER_ID);

    expect(headersOf(fetchMock).Authorization).toBe("Bearer токен-покупателя");
    expect(fetchMock.mock.calls[0][1].credentials).toBe("include");
  });

  it("шлёт токен админки из cookie", async () => {
    Cookies.set("token", "токен-админа");
    const fetchMock = okFetch();
    vi.stubGlobal("fetch", fetchMock);

    await fetchOrderDetails(ORDER_ID);

    expect(headersOf(fetchMock).Authorization).toBe("Bearer токен-админа");
  });

  it("без токена не шлёт пустой Bearer", async () => {
    // Пустой Bearer отключает cookie-сессию на бэкенде
    const fetchMock = okFetch();
    vi.stubGlobal("fetch", fetchMock);

    await fetchOrderDetails(ORDER_ID);

    expect(headersOf(fetchMock).Authorization).toBeUndefined();
  });

  it("на отказ бэкенда отдаёт null, а не падает", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));

    expect(await fetchOrderDetails(ORDER_ID)).toBeNull();
  });
});
