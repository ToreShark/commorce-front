import { apiBase } from "@/app/lib/apiBase";
import type { EntryStatus, Leaderboard, LeaderboardEntry, PromoApiConfig, PromoMe } from "./types";

/**
 * Запросы к API акции и разбор ответов. Валидатора (zod) в проекте нет,
 * поэтому ответы проверяются руками: неверная форма — то же, что недоступное
 * API, страница показывает запасное состояние, а не падает.
 */

type Json = Record<string, unknown>;

const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === "string";
const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isDate = (v: unknown): v is string => isString(v) && !Number.isNaN(Date.parse(v));
const isStatus = (v: unknown): v is EntryStatus => v === "pending" || v === "confirmed";

export function parsePromoConfig(v: unknown): PromoApiConfig | null {
  if (
    !isObject(v) ||
    !isString(v.slug) ||
    !isString(v.title) ||
    !isString(v.prizeName) ||
    !isDate(v.startsAt) ||
    !isDate(v.endsAt) ||
    !isNumber(v.freezeHoursBeforeEnd) ||
    !isNumber(v.holdDays) ||
    !isNumber(v.minOrderAmount) ||
    !isString(v.rulesVersion) ||
    typeof v.isFrozen !== "boolean" ||
    !isDate(v.serverTime)
  ) {
    return null;
  }
  return {
    slug: v.slug,
    title: v.title,
    prizeName: v.prizeName,
    startsAt: v.startsAt,
    endsAt: v.endsAt,
    freezeHoursBeforeEnd: v.freezeHoursBeforeEnd,
    holdDays: v.holdDays,
    minOrderAmount: v.minOrderAmount,
    rulesVersion: v.rulesVersion,
    isFrozen: v.isFrozen,
    serverTime: v.serverTime,
  };
}

function parseEntry(v: unknown): LeaderboardEntry | null {
  if (
    !isObject(v) ||
    !isNumber(v.place) ||
    !isString(v.label) ||
    !(v.amount === null || isNumber(v.amount)) ||
    !isStatus(v.status) ||
    !(v.activatesAt === null || v.activatesAt === undefined || isDate(v.activatesAt))
  ) {
    return null;
  }
  return {
    place: v.place,
    label: v.label,
    amount: v.amount,
    status: v.status,
    activatesAt: v.activatesAt ?? null,
  };
}

export function parseLeaderboard(v: unknown): Leaderboard | null {
  if (!isObject(v) || typeof v.isFrozen !== "boolean" || !isDate(v.updatedAt) || !Array.isArray(v.entries)) {
    return null;
  }
  const entries = v.entries.map(parseEntry);
  if (entries.some((e) => e === null)) return null;
  const list = entries as LeaderboardEntry[];
  // Сервер прячет суммы на финале; если вдруг прислал — всё равно не показываем
  return {
    isFrozen: v.isFrozen,
    updatedAt: v.updatedAt,
    entries: v.isFrozen ? list.map((e) => ({ ...e, amount: null })) : list,
  };
}

export function parsePromoMe(v: unknown): PromoMe | null {
  if (!isObject(v) || typeof v.participating !== "boolean") return null;
  if (!v.participating) return { participating: false };
  if (
    !isString(v.label) ||
    !isNumber(v.place) ||
    !isNumber(v.amount) ||
    !isStatus(v.status) ||
    !(v.activatesAt === null || v.activatesAt === undefined || isDate(v.activatesAt))
  ) {
    return null;
  }
  return {
    participating: true,
    label: v.label,
    place: v.place,
    amount: v.amount,
    status: v.status,
    activatesAt: v.activatesAt ?? null,
  };
}

/** Кэш на сервере — как у страницы; в браузере всегда свежий ответ. */
const cacheOptions = (): RequestInit & { next?: { revalidate: number } } =>
  typeof window === "undefined" ? { next: { revalidate: 60 } } : { cache: "no-store" };

async function getJson(path: string): Promise<unknown> {
  try {
    const response = await fetch(`${apiBase()}${path}`, cacheOptions());
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/** Настройки акции. null — акция выключена (404) или API недоступно. */
export async function fetchPromoConfig(slug: string): Promise<PromoApiConfig | null> {
  return parsePromoConfig(await getJson(`/api/promo/${encodeURIComponent(slug)}`));
}

export async function fetchLeaderboard(slug: string, limit = 20): Promise<Leaderboard | null> {
  return parseLeaderboard(await getJson(`/api/promo/${encodeURIComponent(slug)}/leaderboard?limit=${limit}`));
}

export type PromoMeResult =
  | { kind: "ok"; me: PromoMe }
  /** Не вошёл или вход протух. */
  | { kind: "unauthorized" }
  /** Акция выключена или API недоступно — блок не показывается. */
  | { kind: "unavailable" };

/** Запись текущего покупателя. Только в браузере: токен лежит в localStorage. */
export async function fetchPromoMe(slug: string, token: string | null): Promise<PromoMeResult> {
  if (!token) return { kind: "unauthorized" };
  try {
    const response = await fetch(`${apiBase()}/api/promo/${encodeURIComponent(slug)}/me`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 401) return { kind: "unauthorized" };
    if (!response.ok) return { kind: "unavailable" };
    const me = parsePromoMe(await response.json());
    return me ? { kind: "ok", me } : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}

/** Идёт ли акция в момент now (мс, по часам сервера). */
export function isRunning(config: Pick<PromoApiConfig, "startsAt" | "endsAt">, now: number): boolean {
  return Date.parse(config.startsAt) <= now && now <= Date.parse(config.endsAt);
}
