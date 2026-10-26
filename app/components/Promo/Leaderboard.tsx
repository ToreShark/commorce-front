import type { LeaderboardEntry } from "@/app/lib/promo/types";
import type { PromoTexts } from "@/app/lib/promo/texts";
import { formatKzt, formatShortDate } from "@/app/lib/promo/format";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  frozen: boolean;
  texts: PromoTexts["board"];
}

// Мягкое свечение лидера; keyframes promo-glow — в globals.css. Без motion-safe не анимируется
const LEADER =
  "bg-qbrand/[0.04] shadow-[inset_3px_0_0_#7A1F35] motion-safe:animate-[promo-glow_4s_ease-in-out_infinite]";

function StatusBadge({ entry, texts }: { entry: LeaderboardEntry; texts: PromoTexts["board"] }) {
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

function Amount({ amount, texts }: { amount: number | null; texts: PromoTexts["board"] }) {
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

/**
 * Табло лидеров. На планшете и шире — настоящая таблица, на телефоне — список
 * карточек с ролями таблицы. Скрытый вариант убран через display:none, поэтому
 * читалка видит ровно одну таблицу.
 */
export default function Leaderboard({ entries, frozen, texts }: LeaderboardProps) {
  return (
    <section id="tablo" aria-labelledby="promo-board" className="container-x mx-auto scroll-mt-6">
      <h2 id="promo-board" className="mb-2 text-2xl font-700 text-qblack sm:text-[28px]">
        {texts.title}
      </h2>
      <p className="mb-6 text-[15px] text-[#555]">{texts.caption}</p>

      {frozen && (
        <p role="status" className="mb-4 border-l-4 border-qbrand bg-qbrand/[0.06] px-4 py-3 text-[15px] font-600 text-qblack">
          {texts.frozen}
        </p>
      )}

      {entries.length === 0 ? (
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
              {entries.map((entry, i) => (
                <tr
                  key={entry.label}
                  className={`border-b border-qgray-border ${i === 0 ? LEADER : ""}`}
                >
                  <td className={`py-4 pr-4 text-lg font-700 tabular-nums ${i === 0 ? "pl-3 text-qbrand" : "text-qblack"}`}>
                    {i + 1}
                    {i === 0 && <span className="sr-only">, {texts.leader}</span>}
                  </td>
                  <td className="py-4 pr-4 text-[15px] font-500 text-qblack">{entry.label}</td>
                  <td className={`py-4 pr-4 text-right text-[15px] text-qblack ${i === 0 ? "text-lg font-700" : "font-600"}`}>
                    <Amount amount={entry.amount} texts={texts} />
                  </td>
                  <td className="py-4 pr-3 text-right">
                    <StatusBadge entry={entry} texts={texts} />
                  </td>
                </tr>
              ))}
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
              {entries.map((entry, i) => (
                <div
                  role="row"
                  key={entry.label}
                  className={`grid grid-cols-[36px_1fr_auto] items-center gap-x-3 gap-y-1.5 px-2 py-4 ${i === 0 ? LEADER : ""}`}
                >
                  <span
                    role="cell"
                    className={`row-span-2 text-xl font-700 tabular-nums ${i === 0 ? "text-qbrand" : "text-qblack"}`}
                  >
                    {i + 1}
                    {i === 0 && <span className="sr-only">, {texts.leader}</span>}
                  </span>
                  <span role="cell" className="min-w-0 truncate text-[15px] font-500 text-qblack">
                    {entry.label}
                  </span>
                  <span role="cell" className={`text-right text-qblack ${i === 0 ? "text-lg font-700" : "text-[15px] font-600"}`}>
                    <Amount amount={entry.amount} texts={texts} />
                  </span>
                  <span role="cell" className="col-span-2">
                    <StatusBadge entry={entry} texts={texts} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
