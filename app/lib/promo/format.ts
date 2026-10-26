import type { LeaderboardEntry, PromoConfig } from "./types";

/** Все даты акции показываются по Алматы, независимо от пояса сервера и браузера. */
export const PROMO_TIME_ZONE = "Asia/Almaty";

const kzt = new Intl.NumberFormat("ru-KZ", {
  style: "currency",
  currency: "KZT",
  maximumFractionDigits: 0,
});

const shortDate = new Intl.DateTimeFormat("ru-KZ", {
  day: "2-digit",
  month: "2-digit",
  timeZone: PROMO_TIME_ZONE,
});

const longDate = new Intl.DateTimeFormat("ru-KZ", {
  day: "numeric",
  month: "long",
  timeZone: PROMO_TIME_ZONE,
});

/** 118000 → «118 000 ₸». */
export function formatKzt(amount: number): string {
  return kzt.format(amount);
}

/** ISO → «12.11» по Алматы. */
export function formatShortDate(iso: string): string {
  return shortDate.format(new Date(iso));
}

/** ISO → «30 ноября» по Алматы. */
export function formatLongDate(iso: string): string {
  return longDate.format(new Date(iso));
}

/** Финал: за freezeHoursBeforeEnd до конца и после него суммы не показываются. */
export function isFrozen(config: PromoConfig, now: Date): boolean {
  const freezeFrom = Date.parse(config.endsAt) - config.freezeHoursBeforeEnd * 60 * 60 * 1000;
  return now.getTime() >= freezeFrom;
}

/** По убыванию суммы; записи без суммы — в конец, порядок среди равных сохраняется. */
export function rankEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => (b.amount ?? -1) - (a.amount ?? -1));
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Остаток до момента; null — момент уже наступил. */
export function timeLeft(untilMs: number, nowMs: number): TimeLeft | null {
  const diff = untilMs - nowMs;
  if (diff <= 0) return null;
  const total = Math.floor(diff / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}
