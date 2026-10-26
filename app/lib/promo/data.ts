import { PROMO_CONFIG } from "./config";
import { fetchLeaderboard, fetchPromoConfig } from "./api";
import { isFrozen } from "./format";
import type { PromoApiConfig, PromoConfig, PromoData } from "./types";

/** Сколько строк табло показывать на лендинге. */
export const LEADERBOARD_LIMIT = 20;

/** Настройки из API поверх своих: сроки, порог и приз — с бэкенда, оформление — свои. */
export function mergeConfig(base: PromoConfig, api: PromoApiConfig | null): PromoConfig {
  if (!api) return base;
  return {
    ...base,
    title: api.title,
    prizeName: api.prizeName,
    startsAt: api.startsAt,
    endsAt: api.endsAt,
    freezeHoursBeforeEnd: api.freezeHoursBeforeEnd,
    minOrderAmount: api.minOrderAmount,
    confirmDays: api.holdDays,
    rulesVersion: api.rulesVersion,
  };
}

/**
 * Данные лендинга. Запросы идут на сервере и кэшируются на минуту (как и страница).
 *
 * Если API не ответило, лендинг всё равно рисуется — по своим настройкам,
 * с плашкой «Табло обновляется» вместо табло. Суммы на финале прячет сервер;
 * здесь только флаг для плашки.
 */
export async function getPromoData(now: Date = new Date()): Promise<PromoData> {
  const [api, board] = await Promise.all([
    fetchPromoConfig(PROMO_CONFIG.slug),
    fetchLeaderboard(PROMO_CONFIG.slug, LEADERBOARD_LIMIT),
  ]);
  const config = mergeConfig(PROMO_CONFIG, api);

  return {
    config,
    leaderboard: board?.entries ?? [],
    frozen: board?.isFrozen ?? api?.isFrozen ?? isFrozen(config, now),
    boardAvailable: board !== null,
  };
}
