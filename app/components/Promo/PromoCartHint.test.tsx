import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PromoCartHint from "./PromoCartHint";
import type { PromoClock } from "@/app/lib/promo/clock";

const clock: { current: PromoClock } = { current: { offset: 0, config: null, ready: true } };
vi.mock("@/app/lib/promo/clock", () => ({ usePromoClock: () => clock.current }));

const NBSP = /[  ]/g;
const config = (endsInMs = 86_400_000) => ({
  slug: "pokupatel-mesyaca",
  title: "Покупатель месяца",
  prizeName: "Смартфон",
  startsAt: new Date(Date.now() - 86_400_000).toISOString(),
  endsAt: new Date(Date.now() + endsInMs).toISOString(),
  freezeHoursBeforeEnd: 24,
  holdDays: 14,
  minOrderAmount: 15000,
  rulesVersion: "2026-10-26",
  isFrozen: false,
  serverTime: new Date().toISOString(),
});

describe("подсказка об акции в корзине", () => {
  beforeEach(() => {
    clock.current = { offset: 0, config: config(), ready: true };
  });

  it("ниже порога — сколько добавить", () => {
    render(<PromoCartHint total={9000} />);
    expect(screen.getByText(/Добавьте ещё/).textContent?.replace(NBSP, " ")).toContain("Добавьте ещё 6 000 ₸");
  });

  it("порог пройден — что делать дальше", () => {
    render(<PromoCartHint total={15000} />);
    expect(screen.getByText(/отметьте участие при оформлении и оплатите картой/)).toBeInTheDocument();
  });

  it("акция выключена или API молчит — ничего", () => {
    clock.current = { offset: 0, config: null, ready: true };
    const { container } = render(<PromoCartHint total={9000} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("акция закончилась — ничего", () => {
    clock.current = { offset: 0, config: config(-1000), ready: true };
    const { container } = render(<PromoCartHint total={9000} />);
    expect(container).toBeEmptyDOMElement();
  });
});
