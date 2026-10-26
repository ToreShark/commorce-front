"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import {
  AdminEntry,
  AdminEntryStatus,
  AuditRow,
  EntryAction,
  FinalizeCheck,
  REMOVE_REASONS,
  RETURN_OUTCOMES,
  RemoveReason,
  ReturnOutcome,
  Winner,
  allowedActions,
  downloadCsv,
  finalize,
  finalizeCheck,
  getAudit,
  getEntries,
  getWinners,
  markDelivered,
  markReviewed,
  removeEntry,
  requestReturn,
  resolveReturn,
  restoreEntry,
} from "@/app/lib/promo/admin";

const STATUS_LABEL: Record<string, string> = {
  Pending: "На проверке",
  Confirmed: "Подтверждён",
  Removed: "Снят",
};

const REASON_LABEL: Record<RemoveReason, string> = {
  Return: "Возврат",
  PartialReturn: "Частичный возврат",
  ExchangeLower: "Обмен на более дешёвый",
  Wholesale: "Перепродажа (опт)",
  Fraud: "Мошенничество",
  Duplicate: "Дубль",
  Manual: "Другое",
};

const OUTCOME_LABEL: Record<ReturnOutcome, string> = {
  Return: "Вернули всё — снять",
  PartialReturn: "Вернули часть — снять",
  ExchangeLower: "Обмен на более дешёвый — снять",
  Declined: "Отказ / равноценный обмен — продолжить проверку",
};

const ACTION_LABEL: Record<EntryAction, string> = {
  remove: "Снять",
  restore: "Восстановить",
  delivered: "Выдан",
  requestReturn: "Запрос на возврат",
  resolveReturn: "Решение по возврату",
  reviewed: "Проверено",
};

type Filter = "all" | "review" | AdminEntryStatus;

const kzt = (n: number) => `${n.toLocaleString("ru-RU")} ₸`;

const dateTime = (iso: string | null) =>
  iso
    ? new Date(iso.endsWith("Z") || /[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Almaty",
      })
    : "—";

const reasonLabel = (reason: string | null) =>
  reason && reason in REASON_LABEL ? REASON_LABEL[reason as RemoveReason] : reason;

const errorText = (err: unknown) => (err instanceof Error && err.message ? err.message : "Произошла ошибка");

interface ActionFormProps {
  entry: AdminEntry;
  action: EntryAction;
  onDone: () => void;
  onCancel: () => void;
}

/** Форма действия: комментарий обязателен — он попадает в журнал аудита. */
function ActionForm({ entry, action, onDone, onCancel }: ActionFormProps) {
  const [comment, setComment] = useState("");
  const [reason, setReason] = useState<RemoveReason>("Return");
  const [outcome, setOutcome] = useState<ReturnOutcome>("Declined");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const text = comment.trim();
    if (!text) {
      setError("Укажите комментарий: он попадает в журнал");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      switch (action) {
        case "remove":
          await removeEntry(entry.entryId, reason, text);
          break;
        case "restore":
          await restoreEntry(entry.entryId, text);
          break;
        case "delivered":
          await markDelivered(entry.entryId, text);
          break;
        case "requestReturn":
          await requestReturn(entry.entryId, text);
          break;
        case "resolveReturn":
          await resolveReturn(entry.entryId, outcome, text);
          break;
        case "reviewed":
          await markReviewed(entry.entryId, text);
          break;
      }
      onDone();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 rounded border border-gray-200 bg-gray-50 p-4">
      <p className="font-semibold">
        {ACTION_LABEL[action]} — {entry.label}
      </p>
      {action === "remove" && (
        <label className="block text-sm">
          Причина
          <select
            className="mt-1 block w-full rounded border border-gray-300 p-2"
            value={reason}
            onChange={(e) => setReason(e.target.value as RemoveReason)}
          >
            {REMOVE_REASONS.map((r) => (
              <option key={r} value={r}>
                {REASON_LABEL[r]}
              </option>
            ))}
          </select>
        </label>
      )}
      {action === "resolveReturn" && (
        <label className="block text-sm">
          Итог обращения
          <select
            className="mt-1 block w-full rounded border border-gray-300 p-2"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as ReturnOutcome)}
          >
            {RETURN_OUTCOMES.map((o) => (
              <option key={o} value={o}>
                {OUTCOME_LABEL[o]}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="block text-sm">
        Комментарий
        <textarea
          className="mt-1 block w-full rounded border border-gray-300 p-2"
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? "Сохранение..." : "Сохранить"}
        </button>
        <button type="button" onClick={onCancel} className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
          Отмена
        </button>
      </div>
    </div>
  );
}

function AuditList({ entryId }: { entryId: string }) {
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAudit(entryId).then(setRows, (err) => setError(errorText(err)));
  }, [entryId]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!rows) return <p className="text-sm text-gray-500">Загрузка журнала...</p>;
  if (rows.length === 0) return <p className="text-sm text-gray-500">Журнал пуст</p>;

  return (
    <ul className="space-y-1 text-sm">
      {rows.map((r, i) => (
        <li key={i}>
          <span className="text-gray-500">{dateTime(r.createdAt)}</span>{" "}
          {r.fromStatus ? `${STATUS_LABEL[r.fromStatus] ?? r.fromStatus} → ` : ""}
          {STATUS_LABEL[r.toStatus] ?? r.toStatus}
          {r.reason ? ` · ${reasonLabel(r.reason)}` : ""} · {r.actor}
          {r.comment ? ` · «${r.comment}»` : ""}
        </li>
      ))}
    </ul>
  );
}

/** version растёт после каждого действия с записью: снятие или подтверждение меняет, можно ли подводить итоги. */
function FinalizeBlock({ version }: { version: number }) {
  const [check, setCheck] = useState<FinalizeCheck | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [c, w] = await Promise.all([finalizeCheck(), getWinners()]);
      setCheck(c);
      setWinners(w);
    } catch (err) {
      setError(errorText(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, version]);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      await finalize();
      setConfirming(false);
      await load();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-8 rounded border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-xl font-semibold">Итоги</h3>
      {error && (
        <p role="alert" className="mb-3 text-red-600">
          {error}
        </p>
      )}
      {check && (
        <div className="space-y-2">
          <p>
            Подвести итоги можно с {dateTime(check.finalizableFrom)}.{" "}
            {check.alreadyFinalized
              ? "Итоги уже подведены."
              : check.canFinalize
                ? "Всё готово."
                : "Пока нельзя."}
          </p>
          {check.problems.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-red-700">
              {check.problems.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          )}
          {!check.alreadyFinalized && (
            <div className="flex gap-2">
              {confirming ? (
                <>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={run}
                    className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {busy ? "Подводим..." : "Да, подвести итоги — это нельзя отменить"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
                  >
                    Отмена
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={!check.canFinalize}
                  onClick={() => setConfirming(true)}
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Подвести итоги
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {winners.length > 0 && (
        <ol className="mt-4 space-y-1">
          {winners.map((w) => (
            <li key={w.place}>
              <strong>{w.place === 1 ? "Победитель" : `${w.place} место (резерв)`}:</strong> {w.label} ·{" "}
              {kzt(w.amount)} · {w.customerName || "—"} · {w.phone || "—"} · заказ {w.orderId.slice(0, 8)}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default function PromoAdmin() {
  const [entries, setEntries] = useState<AdminEntry[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<{ entryId: string; action: EntryAction } | null>(null);
  const [auditFor, setAuditFor] = useState<string | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEntries(
        filter === "all" ? {} : filter === "review" ? { needsReview: true } : { status: filter }
      );
      setEntries(data);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const exportCsv = async () => {
    setCsvError(null);
    try {
      await downloadCsv();
    } catch (err) {
      setCsvError(errorText(err));
    }
  };

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "Все" },
    { key: "review", label: "Нужна проверка" },
    { key: "Pending", label: "На проверке" },
    { key: "Confirmed", label: "Подтверждены" },
    { key: "Removed", label: "Сняты" },
  ];

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Акция «Покупатель месяца»</h2>
        <button type="button" onClick={exportCsv} className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
          Выгрузить CSV
        </button>
      </div>
      {csvError && (
        <p role="alert" className="mb-3 text-red-600">
          {csvError}
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Фильтр записей">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded px-3 py-1.5 text-sm ${
              filter === f.key ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-3 text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p>Загрузка...</p>
      ) : entries.length === 0 ? (
        <p className="text-gray-500">Записей нет</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-white text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border-b px-3 py-2">Место</th>
                <th className="border-b px-3 py-2">Метка</th>
                <th className="border-b px-3 py-2 text-right">Сумма</th>
                <th className="border-b px-3 py-2">Статус</th>
                <th className="border-b px-3 py-2">Заказ</th>
                <th className="border-b px-3 py-2">Покупатель</th>
                <th className="border-b px-3 py-2">Оплачен / получен</th>
                <th className="border-b px-3 py-2">Действия</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <Fragment key={entry.entryId}>
                  <tr className="align-top hover:bg-gray-50">
                    <td className="border-b px-3 py-2">{entry.place ?? "—"}</td>
                    <td className="border-b px-3 py-2 font-semibold">{entry.label}</td>
                    <td className="whitespace-nowrap border-b px-3 py-2 text-right">{kzt(entry.amount)}</td>
                    <td className="border-b px-3 py-2">
                      <div>{STATUS_LABEL[entry.status]}</div>
                      {entry.removedReason && (
                        <div className="text-xs text-gray-500">{reasonLabel(entry.removedReason)}</div>
                      )}
                      {entry.needsReview && (
                        <div className="mt-1 inline-block rounded bg-amber-100 px-1.5 text-xs text-amber-800">
                          Опт — нужна проверка
                        </div>
                      )}
                      {entry.returnRequestedAt && (
                        <div className="mt-1 inline-block rounded bg-red-100 px-1.5 text-xs text-red-800">
                          Запрос на возврат
                        </div>
                      )}
                    </td>
                    <td className="border-b px-3 py-2" title={entry.orderId}>
                      {entry.orderId.slice(0, 8)}
                      {entry.deliveryMethod && (
                        <div className="text-xs text-gray-500">{entry.deliveryMethod}</div>
                      )}
                    </td>
                    <td className="border-b px-3 py-2">
                      {entry.customerName && <div>{entry.customerName}</div>}
                      <div className="whitespace-nowrap">{entry.phone || "—"}</div>
                    </td>
                    <td className="whitespace-nowrap border-b px-3 py-2">
                      <div>{dateTime(entry.paidAt)}</div>
                      <div className="text-xs text-gray-500">получен: {dateTime(entry.deliveredAt)}</div>
                      {entry.activatesAt && entry.status === "Pending" && (
                        <div className="text-xs text-gray-500">до {dateTime(entry.activatesAt)}</div>
                      )}
                    </td>
                    <td className="min-w-[230px] border-b px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {allowedActions(entry).map((action) => (
                          <button
                            key={action}
                            type="button"
                            onClick={() => setActive({ entryId: entry.entryId, action })}
                            className="whitespace-nowrap rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
                          >
                            {ACTION_LABEL[action]}
                          </button>
                        ))}
                        <button
                          type="button"
                          aria-expanded={auditFor === entry.entryId}
                          onClick={() => setAuditFor(auditFor === entry.entryId ? null : entry.entryId)}
                          className="rounded px-2 py-1 text-xs text-blue-600 hover:underline"
                        >
                          Журнал
                        </button>
                      </div>
                    </td>
                  </tr>
                  {active?.entryId === entry.entryId && (
                    <tr>
                      <td colSpan={8} className="border-b px-3 py-2">
                        <ActionForm
                          entry={entry}
                          action={active.action}
                          onCancel={() => setActive(null)}
                          onDone={() => {
                            setActive(null);
                            load();
                            setVersion((v) => v + 1);
                          }}
                        />
                      </td>
                    </tr>
                  )}
                  {auditFor === entry.entryId && (
                    <tr>
                      <td colSpan={8} className="border-b bg-gray-50 px-3 py-2">
                        <AuditList entryId={entry.entryId} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FinalizeBlock version={version} />
    </div>
  );
}
