"use client";

import Image from "next/image";
import Link from "next/link";
import { formatLongDate } from "@/app/lib/promo/format";
import { getPromoTexts } from "@/app/lib/promo/texts";
import { PROMO_CONFIG } from "@/app/lib/promo/config";
import { clarityEvent } from "@/app/lib/clarity";
import { useRunningPromo } from "./usePromoRunning";

const DAY = 86_400_000;

/**
 * Полоса акции на главной: приз, срок, сколько дней осталось и ссылка на
 * лендинг. Пока акция не идёт (выключена, не началась, закончилась) — пусто.
 */
export default function PromoStrip({ className = "" }: { className?: string }) {
  const promo = useRunningPromo();
  if (!promo) return null;

  const t = getPromoTexts().strip;
  // Полные дни, как в таймере лендинга; в последний день — «ещё 1 день»
  const days = Math.max(1, Math.floor((Date.parse(promo.config.endsAt) - promo.now) / DAY));

  return (
    <section aria-label={t.eyebrow} className={`container-x mx-auto ${className}`}>
      <Link
        href="/akciya"
        onClick={() => clarityEvent("promo_home_banner_click")}
        className="group flex items-center gap-4 bg-qbrand px-4 py-4 text-white sm:gap-6 sm:px-8 sm:py-5"
      >
        <span className="relative h-14 w-14 shrink-0 overflow-hidden bg-white sm:h-16 sm:w-16">
          <Image src={PROMO_CONFIG.prizeImage} alt="" fill sizes="64px" className="object-cover" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-600 uppercase tracking-[0.14em] text-white/75">
            {t.eyebrow} · {t.daysLeft(days)}
          </span>
          <span className="mt-1 block text-[16px] font-700 leading-snug sm:text-[20px]">
            {t.text(PROMO_CONFIG.prizeShortName, formatLongDate(promo.config.endsAt))}
          </span>
        </span>
        <span className="hidden shrink-0 border border-white px-5 py-2.5 text-[14px] font-600 transition-colors group-hover:bg-white group-hover:text-qbrand sm:inline-block">
          {t.cta}
        </span>
        <svg className="shrink-0 sm:hidden" width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden>
          <path d="M2 2l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </section>
  );
}
