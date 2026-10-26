"use client";

import { useEffect, useState } from "react";
import { PROMO_CONFIG } from "./config";
import { fetchPromoConfig } from "./api";
import type { PromoApiConfig } from "./types";

/**
 * Часы акции в браузере: смещение часов устройства относительно сервера.
 *
 * Таймер не может верить часам телефона — они бывают сбиты на часы, и тогда
 * «до конца акции» врёт. Смещение считается один раз на страницу по свежему
 * ответу /api/promo/{slug}: serverTime против середины запроса (половина
 * задержки сети туда, половина обратно). serverTime из HTML не годится —
 * страница кэшируется на минуту.
 *
 * Запрос один на всю страницу, сколько бы компонентов ни спросили.
 */

export interface PromoClock {
  /** serverNow − Date.now(), мс. 0, пока ответа нет или если API недоступно. */
  offset: number;
  /** Свежие настройки из API; null — не пришли (акция выключена или сеть). */
  config: PromoApiConfig | null;
  /** Ответ получен (успешно или нет). */
  ready: boolean;
}

let pending: Promise<PromoClock> | null = null;

export function computeOffset(serverTime: string, sentAt: number, receivedAt: number): number {
  return Date.parse(serverTime) - (sentAt + receivedAt) / 2;
}

function loadClock(): Promise<PromoClock> {
  if (!pending) {
    const sentAt = Date.now();
    pending = fetchPromoConfig(PROMO_CONFIG.slug).then((config) => ({
      config,
      offset: config ? computeOffset(config.serverTime, sentAt, Date.now()) : 0,
      ready: true,
    }));
  }
  return pending;
}

/** Только для тестов. */
export function resetPromoClock(): void {
  pending = null;
}

export function usePromoClock(): PromoClock {
  const [clock, setClock] = useState<PromoClock>({ offset: 0, config: null, ready: false });

  useEffect(() => {
    let alive = true;
    loadClock().then((c) => alive && setClock(c));
    return () => {
      alive = false;
    };
  }, []);

  return clock;
}
