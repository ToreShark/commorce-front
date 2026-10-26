"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchPromoMe, isRunning } from "@/app/lib/promo/api";
import { usePromoClock } from "@/app/lib/promo/clock";
import { PROMO_CONFIG } from "@/app/lib/promo/config";
import { formatKzt, formatShortDate } from "@/app/lib/promo/format";
import { getPromoTexts } from "@/app/lib/promo/texts";
import type { PromoMe } from "@/app/lib/promo/types";

/**
 * Блок акции в истории заказов: метка, место, сумма и статус своего чека
 * из /api/promo/{slug}/me. Не участвует — приглашение, пока акция идёт.
 * Акция выключена, API молчит или вход протух — блока нет, страница
 * заказов работает как раньше.
 */
export default function PromoAccountBlock() {
  const t = getPromoTexts().account;
  const { config, offset, ready } = usePromoClock();
  const [me, setMe] = useState<PromoMe | null>(null);

  useEffect(() => {
    let alive = true;
    let token: string | null = null;
    try {
      token = localStorage.getItem("accessToken");
    } catch {
      return;
    }
    fetchPromoMe(PROMO_CONFIG.slug, token).then((r) => {
      if (alive && r.kind === "ok") setMe(r.me);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!ready || !config || !me) return null;

  if (!me.participating) {
    if (!isRunning(config, Date.now() + offset)) return null;
    return (
      <section aria-labelledby="promo-account" className="mb-6 border border-[#EDEDED] rounded-lg bg-white px-6 py-5">
        <h2 id="promo-account" className="text-[18px] font-bold text-qblack">{t.title}</h2>
        <p className="mt-2 text-[14px] text-[#555]">{t.invite(formatKzt(config.minOrderAmount))}</p>
        <Link href="/akciya" className="mt-3 inline-block text-[14px] font-semibold text-qbrand underline underline-offset-2">
          {t.inviteCta}
        </Link>
      </section>
    );
  }

  const status =
    me.status === "confirmed"
      ? t.confirmed
      : me.activatesAt
        ? t.pending(formatShortDate(me.activatesAt))
        : t.pendingNoDate;

  const cells: { label: string; value: string }[] = [
    { label: t.label, value: me.label },
    { label: t.place, value: String(me.place) },
    { label: t.amount, value: formatKzt(me.amount) },
    { label: t.status, value: status },
  ];

  return (
    <section aria-labelledby="promo-account" className="mb-6 border border-qbrand/30 rounded-lg bg-qbrand/[0.04] px-6 py-5">
      <h2 id="promo-account" className="text-[18px] font-bold text-qblack">{t.title}</h2>
      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        {cells.map((c) => (
          <div key={c.label} className="min-w-0">
            <dt className="text-[12px] uppercase tracking-wide text-qgray">{c.label}</dt>
            <dd className="mt-0.5 text-[15px] font-semibold text-qblack break-words">{c.value}</dd>
          </div>
        ))}
      </dl>
      <Link href="/akciya#tablo" className="mt-4 inline-block text-[14px] font-semibold text-qbrand underline underline-offset-2">
        {t.boardCta}
      </Link>
    </section>
  );
}
