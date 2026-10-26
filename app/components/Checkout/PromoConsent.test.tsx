import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PromoConsent from "./PromoConsent";
import type { PromoClock } from "@/app/lib/promo/clock";

const clock: { current: PromoClock } = { current: { offset: 0, config: null, ready: true } };

vi.mock("@/app/lib/promo/clock", () => ({
  usePromoClock: () => clock.current,
}));

const NBSP = /[  ]/g;

const runningConfig = (minOrderAmount = 15000) => ({
  slug: "pokupatel-mesyaca",
  title: "Покупатель месяца",
  prizeName: "Смартфон",
  startsAt: new Date(Date.now() - 86_400_000).toISOString(),
  endsAt: new Date(Date.now() + 86_400_000).toISOString(),
  freezeHoursBeforeEnd: 24,
  holdDays: 14,
  minOrderAmount,
  rulesVersion: "2026-10-26",
  isFrozen: false,
  serverTime: new Date().toISOString(),
});

function Harness({ itemsTotal, paymentMethod = "card", onAvailable = vi.fn() }: {
  itemsTotal: number;
  paymentMethod?: string;
  onAvailable?: (v: string | null) => void;
}) {
  const [checked, setChecked] = useState(false);
  return (
    <>
      <PromoConsent
        itemsTotal={itemsTotal}
        paymentMethod={paymentMethod}
        checked={checked}
        onChange={setChecked}
        onAvailableChange={onAvailable}
      />
      <output data-testid="value">{String(checked)}</output>
    </>
  );
}

describe("галочка акции в оформлении", () => {
  beforeEach(() => {
    clock.current = { offset: 0, config: runningConfig(), ready: true };
  });

  it("по умолчанию снята и отмечается", async () => {
    render(<Harness itemsTotal={20000} />);
    const box = screen.getByRole("checkbox");
    expect(box).not.toBeChecked();
    await userEvent.click(box);
    expect(screen.getByTestId("value").textContent).toBe("true");
  });

  it("ниже порога неактивна и считает, сколько добавить", () => {
    render(<Harness itemsTotal={10500} />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
    expect(screen.getByText(/добавьте ещё/).textContent?.replace(NBSP, " ")).toBe(
      "Участвуют заказы от 15 000 ₸ — добавьте ещё 4 500 ₸"
    );
  });

  it("при оплате наличными неактивна", () => {
    render(<Harness itemsTotal={50000} paymentMethod="cash" />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
    expect(screen.getByText(/оплатой картой/)).toBeInTheDocument();
  });

  it("корзина ушла ниже порога — отметка снимается", async () => {
    const { rerender } = render(<Harness itemsTotal={20000} />);
    await userEvent.click(screen.getByRole("checkbox"));
    rerender(<Harness itemsTotal={9000} />);
    expect(screen.getByTestId("value").textContent).toBe("false");
  });

  it("промо-API не ответило — галочки нет, версия правил null", () => {
    clock.current = { offset: 0, config: null, ready: true };
    const onAvailable = vi.fn();
    render(<Harness itemsTotal={20000} onAvailable={onAvailable} />);
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(onAvailable).toHaveBeenLastCalledWith(null);
  });

  it("акция закончилась по часам сервера — галочки нет, хотя часы устройства отстают", () => {
    const config = runningConfig();
    // Сервер на двое суток впереди устройства: конец акции (через сутки) уже прошёл
    clock.current = { offset: 2 * 86_400_000, config, ready: true };
    render(<Harness itemsTotal={20000} />);
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("отдаёт наверх версию правил, пока акция идёт", () => {
    const onAvailable = vi.fn();
    render(<Harness itemsTotal={20000} onAvailable={onAvailable} />);
    expect(onAvailable).toHaveBeenLastCalledWith("2026-10-26");
  });
});
