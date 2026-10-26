"use client";

import { useEffect, useState } from "react";
import { isRunning } from "@/app/lib/promo/api";
import { usePromoClock } from "@/app/lib/promo/clock";
import type { PromoApiConfig } from "@/app/lib/promo/types";

/**
 * Настройки акции, пока она идёт по часам сервера; иначе null.
 * Акция выключена или API молчит — тоже null: рекламировать нечего.
 * Граница (старт/конец) ловится без перезагрузки, как у галочки в оформлении.
 */
export function useRunningPromo(): { config: PromoApiConfig; now: number } | null {
  const { config, offset } = usePromoClock();
  const [now, setNow] = useState(() => Date.now() + offset);

  useEffect(() => {
    setNow(Date.now() + offset);
  }, [offset]);

  useEffect(() => {
    if (!config) return;
    const serverNow = Date.now() + offset;
    const next = [Date.parse(config.startsAt), Date.parse(config.endsAt) + 1].find((ms) => ms > serverNow);
    if (next === undefined) return;
    const timer = setTimeout(() => setNow(Date.now() + offset), Math.min(next - serverNow, 2 ** 31 - 1));
    return () => clearTimeout(timer);
  }, [config, offset, now]);

  return config && isRunning(config, now) ? { config, now } : null;
}

/** Сумма товаров без доставки — от неё бэкенд считает порог. */
export function itemsTotal(items: { price: number; quantity: number }[]): number {
  return Math.round(items.reduce((sum, i) => sum + i.price * i.quantity, 0));
}
