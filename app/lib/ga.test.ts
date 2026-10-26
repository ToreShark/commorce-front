import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gaEvent, gaPurchaseOnce, getPendingPurchases, savePendingPurchase } from "./ga";

type W = { dataLayer?: unknown[]; gtag?: unknown };
const events = () =>
  ((window as unknown as W).dataLayer ?? []).map((a) => Array.from(a as ArrayLike<unknown>));

const PURCHASE = {
  transaction_id: "order-1",
  value: 104000,
  items: [{ item_id: "p1", item_name: "Пальто", price: 95000, quantity: 1 }],
};

describe("GA4", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-TEST");
    delete (window as unknown as W).dataLayer;
    delete (window as unknown as W).gtag;
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState(null, "", "/");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("до загрузки gtag.js событие уходит в dataLayer тем же форматом", () => {
    gaEvent("view_item", { value: 1 });
    expect(events()).toEqual([["event", "view_item", { value: 1 }]]);
  });

  it("без потока GA (dev) ничего не отправляется", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "");
    gaEvent("view_item");
    expect(events()).toEqual([]);
  });

  it("?ga_debug=1 включает debug_mode до конца сессии вкладки", () => {
    window.history.replaceState(null, "", "/?ga_debug=1");
    gaEvent("add_to_cart");
    window.history.replaceState(null, "", "/shop");
    gaEvent("begin_checkout");
    expect(events().map((e) => (e[2] as Record<string, unknown>).debug_mode)).toEqual([true, true]);
  });

  it("purchase — один раз на заказ, с валютой KZT", () => {
    expect(gaPurchaseOnce(PURCHASE)).toBe(true);
    expect(gaPurchaseOnce(PURCHASE)).toBe(false);
    const purchases = events().filter((e) => e[1] === "purchase");
    expect(purchases).toHaveLength(1);
    expect(purchases[0][2]).toMatchObject({ transaction_id: "order-1", value: 104000, currency: "KZT" });
  });

  it("ожидающая покупка не дублируется при повторном сохранении", () => {
    savePendingPurchase(PURCHASE);
    savePendingPurchase(PURCHASE);
    expect(getPendingPurchases()).toHaveLength(1);
  });
});
