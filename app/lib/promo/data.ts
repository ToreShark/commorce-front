import { PROMO_CONFIG } from "./config";
import { fetchLeaderboard, fetchPromoConfigResult } from "./api";
import { isFrozen } from "./format";
import type { PromoApiConfig, PromoConfig, PromoData } from "./types";

/** Сколько строк табло показывать на лендинге. */
export const LEADERBOARD_LIMIT = 20;

/**
 * Короткое имя приза для заголовков. Своё («iPhone») — только пока приз на
 * бэкенде тот же, что в настройках фронта; сменили приз в таблице Promos —
 * показываем его полное имя, а не устаревшее короткое.
 */
export function prizeShortName(apiPrizeName: string, base: PromoConfig = PROMO_CONFIG): string {
  return apiPrizeName === base.prizeName ? base.prizeShortName : apiPrizeName;
}

/** Нейтральная картинка, когда приз на бэкенде сменили, а своего фото под него нет. */
export const PRIZE_PLACEHOLDER = "/assets/images/promo/prize-placeholder.svg";

/** Своё фото приза — только пока приз тот же; иначе заглушка, чтобы не показывать чужой приз. */
export function prizeImage(apiPrizeName: string, base: PromoConfig = PROMO_CONFIG): string {
  return apiPrizeName === base.prizeName ? base.prizeImage : PRIZE_PLACEHOLDER;
}

/** Настройки из API поверх своих: сроки, порог и приз — с бэкенда, оформление — свои. */
export function mergeConfig(base: PromoConfig, api: PromoApiConfig | null): PromoConfig {
  if (!api) return base;
  return {
    ...base,
    title: api.title,
    prizeName: api.prizeName,
    prizeShortName: prizeShortName(api.prizeName, base),
    prizeImage: prizeImage(api.prizeName, base),
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
 * Акцию рекламируем, только когда бэкенд подтвердил, что она включена
 * (status ok). Свои настройки при выключенной или недоступной акции остаются
 * в config — для правил и превью, — но лендинг по ним акцию не показывает.
 * Суммы на финале прячет сервер; здесь только флаг для плашки.
 */
export async function getPromoData(now: Date = new Date()): Promise<PromoData> {
  const [result, board] = await Promise.all([
    fetchPromoConfigResult(PROMO_CONFIG.slug),
    fetchLeaderboard(PROMO_CONFIG.slug, LEADERBOARD_LIMIT),
  ]);
  const api = result.kind === "ok" ? result.config : null;
  const config = mergeConfig(PROMO_CONFIG, api);

  return {
    status: result.kind,
    config,
    leaderboard: board?.entries ?? [],
    frozen: board?.isFrozen ?? api?.isFrozen ?? isFrozen(config, now),
    boardAvailable: board !== null,
  };
}
