"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

/**
 * Момент, на который считается скидка.
 *
 * Скидка действует по датам (app/lib/discount.ts), то есть зависит от «сейчас».
 * Страницы каталога и товара рендерятся на сервере, а потом браузер проверяет
 * разметку: на границе UTC-дня сервер и браузер расходились во мнении, действует
 * ли скидка, — React ловил hydration mismatch, цена на миг была не та.
 *
 * Поэтому при гидратации браузер считает от того же момента, что и сервер, а
 * сразу после — переключается на своё время: если акция за это время кончилась,
 * цена обновится уже честно.
 */
const PricingClockContext = createContext<Date | null>(null);

export function PricingClockProvider({
  serverNow,
  children,
}: {
  /** Момент расчёта на сервере, ISO-строкой (Date через границу сервер/клиент не передать). */
  serverNow: string;
  children: ReactNode;
}) {
  const [now, setNow] = useState(() => new Date(serverNow));
  useEffect(() => setNow(new Date()), []);
  return <PricingClockContext.Provider value={now}>{children}</PricingClockContext.Provider>;
}

/**
 * Момент для расчёта цены. Вне провайдера (главная, где товары грузятся уже
 * в браузере) — текущее время: там серверной разметки цен нет и сверять нечего.
 */
export function usePricingNow(): Date {
  return useContext(PricingClockContext) ?? new Date();
}
