import type { LeaderboardEntry, PromoConfig } from "./types";

/**
 * Моковые данные табло — до подключения API (этап 2). Файл удаляется вместе
 * с переводом getPromoData() на настоящий запрос.
 *
 * Сценарий переключает вид страницы для проверки:
 *  - "normal" — обычное табло;
 *  - "frozen" — конец акции через 10 часов, суммы скрыты;
 *  - "empty"  — на табло никого.
 */
export type MockScenario = "normal" | "frozen" | "empty";

export const MOCK_SCENARIO: MockScenario = "normal";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Даты чеков считаются от «сейчас», чтобы «на проверке до …» не устаревало. */
export function mockEntries(scenario: MockScenario, now: Date): LeaderboardEntry[] {
  if (scenario === "empty") return [];

  const inDays = (days: number) => new Date(now.getTime() + days * DAY).toISOString();

  return [
    { label: "Покупатель №7Q4K", amount: 118000, status: "pending", activatesAt: inDays(9) },
    { label: "Покупатель №M2XA", amount: 96500, status: "confirmed" },
    { label: "Покупатель №R8TD", amount: 74000, status: "pending", activatesAt: inDays(12) },
    { label: "Покупатель №3HFP", amount: 61200, status: "confirmed" },
    { label: "Покупатель №KW5N", amount: 48900, status: "pending", activatesAt: inDays(4) },
    { label: "Покупатель №9BLE", amount: 39000, status: "confirmed" },
    { label: "Покупатель №TZ6C", amount: 27400, status: "pending", activatesAt: inDays(13) },
  ];
}

/** Для сценария "frozen" сдвигает конец акции на «через 10 часов». */
export function mockConfig(config: PromoConfig, scenario: MockScenario, now: Date): PromoConfig {
  if (scenario !== "frozen") return config;
  return {
    ...config,
    startsAt: new Date(now.getTime() - 20 * DAY).toISOString(),
    endsAt: new Date(now.getTime() + 10 * HOUR).toISOString(),
  };
}
