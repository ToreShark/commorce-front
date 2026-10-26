import { PROMO_CONFIG } from "./config";
import { MOCK_SCENARIO, mockConfig, mockEntries } from "./mock";
import { isFrozen, rankEntries } from "./format";
import type { PromoData } from "./types";

/**
 * Единственная точка доступа к данным акции.
 *
 * Сейчас отдаёт мок. На этапе 2 тело меняется на запрос к API табло
 * (через apiBase(), как остальной data.ts) — компоненты и типы остаются.
 *
 * Суммы на финале обнуляются здесь, а не в вёрстке: скрытые стилями цифры
 * остались бы в HTML и в данных React. API на этапе 2 должен делать так же.
 */
export async function getPromoData(now: Date = new Date()): Promise<PromoData> {
  const config = mockConfig(PROMO_CONFIG, MOCK_SCENARIO, now);
  const frozen = isFrozen(config, now);
  const ranked = rankEntries(mockEntries(MOCK_SCENARIO, now));

  return {
    config,
    frozen,
    leaderboard: frozen ? ranked.map((e) => ({ ...e, amount: null })) : ranked,
  };
}
