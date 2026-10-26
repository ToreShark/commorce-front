"use client";

import Link from "next/link";
import { formatKzt } from "@/app/lib/promo/format";
import { getPromoTexts } from "@/app/lib/promo/texts";
import { PROMO_CONFIG } from "@/app/lib/promo/config";
import { clarityEvent } from "@/app/lib/clarity";
import { useRunningPromo } from "./usePromoRunning";

interface PromoCartHintProps {
  /** Сумма товаров в корзине без доставки. */
  total: number;
  className?: string;
  onLinkClick?: () => void;
}

/**
 * Подсказка об акции в корзине: сколько добавить до порога или что заказ
 * уже подходит. Пока акция не идёт — ничего не рисует.
 */
export default function PromoCartHint({ total, className = "", onLinkClick }: PromoCartHintProps) {
  const promo = useRunningPromo();
  if (!promo) return null;

  const t = getPromoTexts().cartHint;
  const left = Math.max(0, promo.config.minOrderAmount - total);

  return (
    <div className={`border-l-4 border-qbrand bg-qbrand/[0.06] px-4 py-3 ${className}`}>
      <p className="text-[13px] font-600 uppercase tracking-[0.08em] text-qbrand">{t.title}</p>
      <p className="mt-1 text-[14px] leading-snug text-qblack">
        {left > 0 ? t.left(formatKzt(left), PROMO_CONFIG.prizeShortName) : t.ok}
      </p>
      <Link
        href="/akciya"
        onClick={() => {
          clarityEvent("promo_cart_hint_click");
          onLinkClick?.();
        }}
        className="mt-1 inline-block text-[13px] font-600 text-qbrand underline underline-offset-2"
      >
        {t.link}
      </Link>
    </div>
  );
}
