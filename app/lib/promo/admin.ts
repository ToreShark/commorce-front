import Cookies from "js-cookie";
import { apiBase } from "@/app/lib/apiBase";

/**
 * Запросы раздела «Акция» админки к /Admin/PromoAdmin/* (роли 1 и 2).
 * Контракт — I_STORE.WEB/Areas/Admin/Controllers/PromoAdminController.cs.
 * Ответы проверяются руками: что не совпало с контрактом, отбрасывается,
 * а не уезжает в интерфейс как undefined.
 */

export const PROMO_SLUG = "pokupatel-mesyaca";

export type AdminEntryStatus = "Pending" | "Confirmed" | "Removed";

export const REMOVE_REASONS = [
  "Return",
  "PartialReturn",
  "ExchangeLower",
  "Wholesale",
  "Fraud",
  "Duplicate",
  "Manual",
] as const;
export type RemoveReason = (typeof REMOVE_REASONS)[number];

export const RETURN_OUTCOMES = ["Return", "PartialReturn", "ExchangeLower", "Declined"] as const;
export type ReturnOutcome = (typeof RETURN_OUTCOMES)[number];

export interface AdminEntry {
  entryId: string;
  place: number | null;
  label: string;
  amount: number;
  status: AdminEntryStatus;
  removedReason: string | null;
  needsReview: boolean;
  returnRequestedAt: string | null;
  orderId: string;
  customerName: string;
  phone: string;
  deliveryMethod: string | null;
  paidAt: string;
  deliveredAt: string | null;
  activatesAt: string | null;
  updatedAt: string;
}

export interface AuditRow {
  createdAt: string;
  fromStatus: string | null;
  toStatus: string;
  reason: string | null;
  actor: string;
  comment: string | null;
}

export interface FinalizeTopRow {
  place: number;
  label: string;
  amount: number;
  status: string;
  entryId: string;
}

export interface FinalizeCheck {
  canFinalize: boolean;
  alreadyFinalized: boolean;
  finalizableFrom: string;
  problems: string[];
  top: FinalizeTopRow[];
}

export interface Winner {
  place: number;
  label: string;
  amount: number;
  orderId: string;
  phone: string | null;
  customerName: string | null;
  finalizedAt: string;
  finalizedBy: string;
}

/** Ошибка, которую можно показать админу как есть: текст бэкенда или понятное описание. */
export class PromoAdminError extends Error {}

type Json = Record<string, unknown>;

const isObj = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string";
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isBool = (v: unknown): v is boolean => typeof v === "boolean";
const isStrOrNull = (v: unknown): v is string | null => v === null || isStr(v);
const isNumOrNull = (v: unknown): v is number | null => v === null || isNum(v);
const isStatus = (v: unknown): v is AdminEntryStatus => v === "Pending" || v === "Confirmed" || v === "Removed";

export function isAdminEntry(v: unknown): v is AdminEntry {
  return (
    isObj(v) &&
    isStr(v.entryId) &&
    isNumOrNull(v.place) &&
    isStr(v.label) &&
    isNum(v.amount) &&
    isStatus(v.status) &&
    isStrOrNull(v.removedReason) &&
    isBool(v.needsReview) &&
    isStrOrNull(v.returnRequestedAt) &&
    isStr(v.orderId) &&
    isStr(v.customerName) &&
    isStr(v.phone) &&
    isStrOrNull(v.deliveryMethod) &&
    isStr(v.paidAt) &&
    isStrOrNull(v.deliveredAt) &&
    isStrOrNull(v.activatesAt) &&
    isStr(v.updatedAt)
  );
}

function isAuditRow(v: unknown): v is AuditRow {
  return (
    isObj(v) &&
    isStr(v.createdAt) &&
    isStrOrNull(v.fromStatus) &&
    isStr(v.toStatus) &&
    isStrOrNull(v.reason) &&
    isStr(v.actor) &&
    isStrOrNull(v.comment)
  );
}

function isTopRow(v: unknown): v is FinalizeTopRow {
  return isObj(v) && isNum(v.place) && isStr(v.label) && isNum(v.amount) && isStr(v.status) && isStr(v.entryId);
}

function isFinalizeCheck(v: unknown): v is FinalizeCheck {
  return (
    isObj(v) &&
    isBool(v.canFinalize) &&
    isBool(v.alreadyFinalized) &&
    isStr(v.finalizableFrom) &&
    Array.isArray(v.problems) &&
    v.problems.every(isStr) &&
    Array.isArray(v.top) &&
    v.top.every(isTopRow)
  );
}

function isWinner(v: unknown): v is Winner {
  return (
    isObj(v) &&
    isNum(v.place) &&
    isStr(v.label) &&
    isNum(v.amount) &&
    isStr(v.orderId) &&
    isStrOrNull(v.phone) &&
    isStrOrNull(v.customerName) &&
    isStr(v.finalizedAt) &&
    isStr(v.finalizedBy)
  );
}

function token(): string {
  const value = Cookies.get("token") || localStorage.getItem("accessToken");
  if (!value) throw new PromoAdminError("Необходима авторизация");
  return value;
}

const base = () => `${apiBase()}/Admin/PromoAdmin`;

async function errorFrom(response: Response): Promise<PromoAdminError> {
  if (response.status === 401 || response.status === 403) {
    return new PromoAdminError("Нет доступа: войдите под администратором");
  }
  try {
    const body: unknown = await response.json();
    if (isObj(body) && isStr(body.error)) return new PromoAdminError(body.error);
  } catch {
    // тело не JSON — ниже общий текст
  }
  return new PromoAdminError(`Ошибка сервера (${response.status})`);
}

async function getJson(path: string): Promise<unknown> {
  const response = await fetch(`${base()}/${path}`, {
    headers: { Authorization: `Bearer ${token()}` },
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) throw await errorFrom(response);
  return response.json();
}

async function post(path: string, body: object): Promise<unknown> {
  const response = await fetch(`${base()}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await errorFrom(response);
  return response.json();
}

const slugQuery = (slug: string) => `slug=${encodeURIComponent(slug)}`;

export interface EntriesFilter {
  needsReview?: boolean;
  status?: AdminEntryStatus;
}

export async function getEntries(filter: EntriesFilter = {}, slug = PROMO_SLUG): Promise<AdminEntry[]> {
  let query = slugQuery(slug);
  if (filter.needsReview) query += "&needsReview=true";
  if (filter.status) query += `&status=${filter.status}`;
  const data = await getJson(`GetEntries?${query}`);
  if (!Array.isArray(data)) throw new PromoAdminError("Неожиданный ответ сервера");
  return data.filter(isAdminEntry);
}

export async function getAudit(entryId: string): Promise<AuditRow[]> {
  const data = await getJson(`GetAudit?entryId=${encodeURIComponent(entryId)}`);
  return Array.isArray(data) ? data.filter(isAuditRow) : [];
}

export const removeEntry = (entryId: string, reason: RemoveReason, comment: string) =>
  post("RemoveEntry", { entryId, reason, comment });
export const restoreEntry = (entryId: string, comment: string) => post("RestoreEntry", { entryId, comment });
export const markDelivered = (entryId: string, comment: string) => post("MarkDelivered", { entryId, comment });
export const requestReturn = (entryId: string, comment: string) => post("RequestReturn", { entryId, comment });
export const resolveReturn = (entryId: string, outcome: ReturnOutcome, comment: string) =>
  post("ResolveReturn", { entryId, outcome, comment });
export const markReviewed = (entryId: string, comment: string) => post("MarkReviewed", { entryId, comment });

export async function finalizeCheck(slug = PROMO_SLUG): Promise<FinalizeCheck> {
  const data = await getJson(`FinalizeCheck?${slugQuery(slug)}`);
  if (!isFinalizeCheck(data)) throw new PromoAdminError("Неожиданный ответ сервера");
  return data;
}

export async function finalize(slug = PROMO_SLUG): Promise<void> {
  await post("Finalize", { slug });
}

export async function getWinners(slug = PROMO_SLUG): Promise<Winner[]> {
  const data = await getJson(`GetWinners?${slugQuery(slug)}`);
  return Array.isArray(data) ? data.filter(isWinner) : [];
}

/** CSV всех записей; имя файла задаёт фронт — promo-ГГГГ-ММ-ДД.csv. */
export async function downloadCsv(slug = PROMO_SLUG): Promise<void> {
  const response = await fetch(`${base()}/ExportCsv?${slugQuery(slug)}`, {
    headers: { Authorization: `Bearer ${token()}` },
    credentials: "include",
  });
  if (!response.ok) throw await errorFrom(response);

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `promo-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export type EntryAction = "remove" | "restore" | "delivered" | "requestReturn" | "resolveReturn" | "reviewed";

/** Какие действия бэкенд примет для записи в таком состоянии (PromoEntryService). */
export function allowedActions(entry: AdminEntry): EntryAction[] {
  if (entry.status === "Removed") return ["restore"];

  const actions: EntryAction[] = [];
  if (!entry.deliveredAt) actions.push("delivered");
  if (entry.status === "Pending") {
    actions.push(entry.returnRequestedAt ? "resolveReturn" : "requestReturn");
  }
  if (entry.needsReview) actions.push("reviewed");
  actions.push("remove");
  return actions;
}
