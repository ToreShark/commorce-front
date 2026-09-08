import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchPurchaseHistory } from "./data";

/**
 * История заказов: что уходит на бэкенд и как читается ответ.
 *
 * Страница показывала пустоту при двух оформленных заказах. Метод слал заголовок
 * безусловно — без токена в него уходил литерал `Bearer null`, а схема
 * аутентификации на бэкенде выбирает JWT по одному лишь префиксу `Bearer `.
 * Мусорный заголовок глушил живую cookie-сессию, покупатель становился анонимом,
 * и ответ приходил кодом 200: отличить «протух токен» от «заказов нет» было
 * не по чему, обновиться — тоже.
 *
 * Разбор: I_STORE/docs/purchase-history-empty-2026-09-08.md.
 */
describe("fetchPurchaseHistory", () => {
  const ORDER = {
    orderId: "74017513-23cc-4182-bdcc-2daecb802f47",
    orderDate: "2025-12-25T15:44:41",
    totalPrice: 82_500,
    isPickup: true,
    items: [],
  };

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("без токена не ходит на сервер и просит войти", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchPurchaseHistory();

    // Пустой Bearer хуже отсутствующего: он отключает cookie-сессию,
    // которая в этот момент может быть жива
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.unauthorized).toBe(true);
    expect(result.data).toEqual([]);
  });

  it("отдаёт заказы, когда токен действителен", async () => {
    localStorage.setItem("accessToken", "живой-токен");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [ORDER] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchPurchaseHistory();

    expect(result.unauthorized).toBe(false);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer живой-токен");
  });

  it("на 401 обновляет токен и повторяет запрос", async () => {
    // Access-токен живёт час, refresh — семь дней. У getUser() эта цепочка
    // была, у истории заказов — нет
    localStorage.setItem("accessToken", "протухший");

    const fetchMock = vi
      .fn()
      // сама история — сначала 401
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
      // затем обновление токена
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ token: "свежий" }),
      })
      // и повтор истории
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: [ORDER] }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchPurchaseHistory();

    expect(result.unauthorized).toBe(false);
    expect(result.data).toHaveLength(1);
    expect(localStorage.getItem("accessToken")).toBe("свежий");

    const [, retryOptions] = fetchMock.mock.calls[2];
    expect(retryOptions.headers.Authorization).toBe("Bearer свежий");
  });

  it("когда обновить токен не вышло — забывает вход, а не рисует пустую историю", async () => {
    localStorage.setItem("accessToken", "протухший");

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
      .mockRejectedValueOnce(new Error("refresh отвалился"));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchPurchaseHistory();

    expect(result.unauthorized).toBe(true);

    // Иначе шапка ещё неделю показывает вошедшего покупателя,
    // у которого все запросы с Bearer мертвы
    expect(localStorage.getItem("accessToken")).toBeNull();
  });
});
