import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GaListeners from "./GaListeners";
import { getPendingPurchases, savePendingPurchase } from "@/app/lib/ga";

type W = { dataLayer?: unknown[] };
const sent = (name: string) =>
  ((window as unknown as W).dataLayer ?? [])
    .map((a) => Array.from(a as ArrayLike<unknown>))
    .filter((e) => e[1] === name);

const PURCHASE = {
  transaction_id: "11111111-2222-3333-4444-555555555555",
  value: 104000,
  items: [{ item_id: "p1", item_name: "Пальто", price: 95000, quantity: 1 }],
};

const stubStatus = (body: Record<string, unknown>, status = 200) =>
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: status === 200, status, json: async () => body }));

describe("GA4: оплата картой и WhatsApp", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-TEST");
    delete (window as unknown as W).dataLayer;
    localStorage.clear();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("банк подтвердил оплату — purchase один раз, ожидание снято", async () => {
    savePendingPurchase(PURCHASE);
    stubStatus({ isPaid: true, isRefunded: false });
    render(<GaListeners />);
    await waitFor(() => expect(getPendingPurchases()).toHaveLength(0));
    expect(sent("purchase")).toHaveLength(1);
    expect(sent("purchase")[0][2]).toMatchObject({ transaction_id: PURCHASE.transaction_id, currency: "KZT" });
  });

  it("оплаты ещё нет — purchase не уходит, заказ ждёт", async () => {
    savePendingPurchase(PURCHASE);
    stubStatus({ isPaid: false, isRefunded: false });
    render(<GaListeners />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(sent("purchase")).toHaveLength(0);
    expect(getPendingPurchases()).toHaveLength(1);
  });

  it("деньги вернули — заказ снимается без purchase", async () => {
    savePendingPurchase(PURCHASE);
    stubStatus({ isPaid: false, isRefunded: true });
    render(<GaListeners />);
    await waitFor(() => expect(getPendingPurchases()).toHaveLength(0));
    expect(sent("purchase")).toHaveLength(0);
  });

  it("запрос статуса идёт с токеном покупателя", async () => {
    savePendingPurchase(PURCHASE);
    localStorage.setItem("accessToken", "tok");
    stubStatus({ isPaid: false });
    render(<GaListeners />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toContain(`/api/payment/check-status/${PURCHASE.transaction_id}`);
    expect((init as RequestInit).headers).toEqual({ Authorization: "Bearer tok" });
  });

  it("клик по ссылке WhatsApp — whatsapp_click", () => {
    stubStatus({});
    render(
      <>
        <GaListeners />
        <a href="https://wa.me/77058887876">
          <span>WhatsApp</span>
        </a>
      </>
    );
    document.querySelector("a span")!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(sent("whatsapp_click")).toHaveLength(1);
    expect(sent("whatsapp_click")[0][2]).toMatchObject({ link_url: "https://wa.me/77058887876" });
  });
});
