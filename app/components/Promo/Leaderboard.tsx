"use client";

import { useEffect, useRef, useState } from "react";
import type { Leaderboard as Board, LeaderboardEntry } from "@/app/lib/promo/types";
import { getPromoTexts, type PromoTexts } from "@/app/lib/promo/texts";
import { formatKzt, formatShortDate } from "@/app/lib/promo/format";
import { PROMO_CONFIG } from "@/app/lib/promo/config";
import { fetchLeaderboard, fetchPromoMe } from "@/app/lib/promo/api";
import { LEADERBOARD_LIMIT } from "@/app/lib/promo/data";
import { clarityEvent } from "@/app/lib/clarity";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  frozen: boolean;
  /** false — сервер не получил табло; клиент попробует сам при следующем обновлении. */
  available: boolean;
}

/** Раз в минуту — как кэш табло на сервере. */
export const POLL_MS = 60_000;

type BoardTexts = PromoTexts["board"];

// Мягкое свечение лидера; keyframes promo-glow — в globals.css. Без motion-safe не анимируется
const LEADER =
  "bg-qbrand/[0.04] shadow-[inset_3px_0_0_#7A1F35] motion-safe:animate-[promo-glow_4s_ease-in-out_infinite]";
const MINE = "outline outline-2 -outline-offset-2 outline-qbrand";

/**
 * Обновление табло раз в минуту, пока вкладка видна. Скрытая вкладка не
 * опрашивает; при возвращении — сразу запрос, если данные устарели.
 * Неудачный запрос не стирает табло: остаётся последнее полученное.
 */
function useLiveBoard(initial: Board | null): Board | null {
  const [board, setBoard] = useState(initial);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let lastFetch = Date.now();
    let alive = true;

    const schedule = (ms: number) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(tick, ms);
    };

    async function tick() {
      timer = null;
      if (document.hidden) return; // продолжит visibilitychange
      lastFetch = Date.now();
      const fresh = await fetchLeaderboard(PROMO_CONFIG.slug, LEADERBOARD_LIMIT);
      if (!alive) return;
      if (fresh) setBoard(fresh);
      schedule(POLL_MS);
    }

    const onVisibility = () => {
      if (document.hidden) {
        if (timer) clearTimeout(timer);
        timer = null;
      } else if (!timer) {
        schedule(Math.max(0, POLL_MS - (Date.now() - lastFetch)));
      }
    };

    schedule(POLL_MS);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return board;
}

/** Метка вошедшего покупателя, чтобы выделить его строку. Ни имя, ни телефон не нужны. */
function useMyLabel(): string | null {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    let token: string | null = null;
    try {
      token = localStorage.getItem("accessToken");
    } catch {
      return;
    }
    if (!token) return;
    fetchPromoMe(PROMO_CONFIG.slug, token).then((r) => {
      if (alive && r.kind === "ok" && r.me.participating) setLabel(r.me.label);
    });
    return () => {
      alive = false;
    };
  }, []);

  return label;
}

/** Событие Clarity, когда табло впервые попало в экран. */
function useViewEvent(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((items) => {
      if (items.some((i) => i.isIntersecting)) {
        clarityEvent("promo_leaderboard_view");
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
}

function StatusBadge({ entry, texts }: { entry: LeaderboardEntry; texts: BoardTexts }) {
  if (entry.status === "confirmed") {
    return (
      <span className="inline-flex items-center whitespace-nowrap bg-qbrand px-2.5 py-1 text-xs font-600 text-white">
        {texts.confirmed}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center whitespace-nowrap border border-qgray-border bg-primarygray px-2.5 py-1 text-xs font-500 text-[#555]">
      {entry.activatesAt ? texts.pending(formatShortDate(entry.activatesAt)) : texts.pendingNoDate}
    </span>
  );
}

function Amount({ amount, texts }: { amount: number | null; texts: BoardTexts }) {
  if (amount === null) {
    return (
      <>
        <span aria-hidden className="tracking-[0.2em] text-qgraytwo">
          {texts.hidden}
        </span>
        <span className="sr-only">{texts.hiddenSr}</span>
      </>
    );
  }
  return <span className="tabular-nums">{formatKzt(amount)}</span>;
}

function YouBadge({ texts }: { texts: BoardTexts }) {
  return (
    <span className="ml-2 inline-flex items-center align-middle whitespace-nowrap bg-qblack px-2 py-0.5 text-[11px] font-600 uppercase tracking-wide text-white">
      {texts.you}
    </span>
  );
}

/**
 * Табло лидеров. На планшете и шире — настоящая таблица, на телефоне — список
 * карточек с ролями таблицы. Скрытый вариант убран через display:none, поэтому
 * читалка видит ровно одну таблицу.
 */
export default function Leaderboard({ entries, frozen, available }: LeaderboardProps) {
  const texts = getPromoTexts().board;
  const board = useLiveBoard(available ? { isFrozen: frozen, updatedAt: "", entries } : null);
  const myLabel = useMyLabel();
  const sectionRef = useRef<HTMLElement>(null);
  useViewEvent(sectionRef);

  const rows = board?.entries ?? [];
  const isFrozenNow = board?.isFrozen ?? frozen;

  return (
    <section ref={sectionRef} id="tablo" aria-labelledby="promo-board" className="container-x mx-auto scroll-mt-6">
      <h2 id="promo-board" className="mb-2 text-2xl font-700 text-qblack sm:text-[28px]">
        {texts.title}
      </h2>
      <p className="mb-6 text-[15px] text-[#555]">{texts.caption}</p>

      {board && isFrozenNow && (
        <p role="status" className="mb-4 border-l-4 border-qbrand bg-qbrand/[0.06] px-4 py-3 text-[15px] font-600 text-qblack">
          {texts.frozen}
        </p>
      )}

      {!board ? (
        <div role="status" className="border border-dashed border-qgray-border bg-primarygray px-6 py-12 text-center">
          <p className="text-base text-qblack">{texts.unavailable}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="border border-dashed border-qgray-border bg-primarygray px-6 py-12 text-center">
          <p className="text-base text-qblack">{texts.empty}</p>
        </div>
      ) : (
        <>
          <table className="hidden w-full border-collapse text-left sm:table">
            <caption className="sr-only">{texts.title}</caption>
            <thead>
              <tr className="border-b border-qblack text-xs uppercase tracking-[0.12em] text-qgray">
                <th scope="col" className="w-20 py-3 pr-4 font-600">{texts.colPlace}</th>
                <th scope="col" className="py-3 pr-4 font-600">{texts.colLabel}</th>
                <th scope="col" className="py-3 pr-4 text-right font-600">{texts.colAmount}</th>
                <th scope="col" className="py-3 text-right font-600">{texts.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => {
                const leader = entry.place === 1;
                const mine = entry.label === myLabel;
                return (
                  <tr
                    key={entry.label}
                    className={`border-b border-qgray-border ${leader ? LEADER : ""} ${mine ? MINE : ""}`}
                  >
                    <td className={`py-4 pr-4 text-lg font-700 tabular-nums ${leader ? "pl-3 text-qbrand" : "text-qblack"}`}>
                      {entry.place}
                      {leader && <span className="sr-only">, {texts.leader}</span>}
                    </td>
                    <td className="py-4 pr-4 text-[15px] font-500 text-qblack">
                      {texts.labelPrefix}
                      {entry.label}
                      {mine && <YouBadge texts={texts} />}
                    </td>
                    <td className={`py-4 pr-4 text-right text-[15px] text-qblack ${leader ? "text-lg font-700" : "font-600"}`}>
                      <Amount amount={entry.amount} texts={texts} />
                    </td>
                    <td className="py-4 pr-3 text-right">
                      <StatusBadge entry={entry} texts={texts} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div role="table" aria-label={texts.title} className="sm:hidden">
            <div role="rowgroup" className="sr-only">
              <div role="row">
                <span role="columnheader">{texts.colPlace}</span>
                <span role="columnheader">{texts.colLabel}</span>
                <span role="columnheader">{texts.colAmount}</span>
                <span role="columnheader">{texts.colStatus}</span>
              </div>
            </div>
            <div role="rowgroup" className="divide-y divide-qgray-border border-y border-qgray-border">
              {rows.map((entry) => {
                const leader = entry.place === 1;
                const mine = entry.label === myLabel;
                return (
                  <div
                    role="row"
                    key={entry.label}
                    className={`grid grid-cols-[36px_1fr_auto] items-center gap-x-3 gap-y-1.5 px-2 py-4 ${leader ? LEADER : ""} ${mine ? MINE : ""}`}
                  >
                    <span
                      role="cell"
                      className={`row-span-2 text-xl font-700 tabular-nums ${leader ? "text-qbrand" : "text-qblack"}`}
                    >
                      {entry.place}
                      {leader && <span className="sr-only">, {texts.leader}</span>}
                    </span>
                    <span role="cell" className="min-w-0 break-words text-[15px] font-500 text-qblack">
                      {texts.labelPrefix}
                      {entry.label}
                      {mine && <YouBadge texts={texts} />}
                    </span>
                    <span role="cell" className={`text-right text-qblack ${leader ? "text-lg font-700" : "text-[15px] font-600"}`}>
                      <Amount amount={entry.amount} texts={texts} />
                    </span>
                    <span role="cell" className="col-span-2">
                      <StatusBadge entry={entry} texts={texts} />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
