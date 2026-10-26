"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePromoClock } from "@/app/lib/promo/clock";
import { isRunning } from "@/app/lib/promo/api";
import { formatKzt } from "@/app/lib/promo/format";
import { getPromoTexts } from "@/app/lib/promo/texts";
import { PROMO_CONFIG } from "@/app/lib/promo/config";
import { clarityEvent } from "@/app/lib/clarity";

export interface PromoConsentValue {
  consent: boolean;
  rulesVersion: string;
}

interface PromoConsentProps {
  /** Стоимость товаров без доставки — от неё считает порог бэкенд. */
  itemsTotal: number;
  paymentMethod: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Редакция правил, которую видит покупатель; null — галочки нет (акция не идёт или API молчит). */
  onAvailableChange: (rulesVersion: string | null) => void;
}

/**
 * Галочка участия в акции перед отправкой кода в WhatsApp.
 *
 * Показывается, только пока акция идёт по часам сервера. Если промо-API
 * выключено или упало — галочки нет, оформление работает как раньше.
 * По умолчанию снята. Ниже порога и при оплате наличными неактивна:
 * такие заказы бэкенд в акцию всё равно не возьмёт.
 */
export default function PromoConsent({
  itemsTotal,
  paymentMethod,
  checked,
  onChange,
  onAvailableChange,
}: PromoConsentProps) {
  const t = getPromoTexts().consent;
  const { config, offset } = usePromoClock();
  const visible = config !== null && isRunning(config, Date.now() + offset);
  const left = config ? Math.max(0, config.minOrderAmount - Math.round(itemsTotal)) : 0;
  const cash = paymentMethod !== "card";
  const disabled = left > 0 || cash;

  useEffect(() => {
    onAvailableChange(visible && config ? config.rulesVersion : null);
  }, [visible, config, onAvailableChange]);

  // Корзина ушла ниже порога или выбраны наличные — снять, а не держать невидимое согласие
  useEffect(() => {
    if (disabled && checked) onChange(false);
  }, [disabled, checked, onChange]);

  if (!visible || !config) return null;

  const hint = cash ? t.cashOnly : left > 0 ? t.belowMin(formatKzt(config.minOrderAmount), formatKzt(left)) : null;

  return (
    <div className="w-full bg-white border border-[#EDEDED] rounded-lg px-[30px] py-[20px] mb-6">
      <label className={`flex items-start gap-3 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
        <input
          type="checkbox"
          name="promoConsent"
          checked={checked}
          disabled={disabled}
          aria-describedby={hint ? "promo-consent-hint" : undefined}
          onChange={(e) => {
            onChange(e.target.checked);
            if (e.target.checked) clarityEvent("promo_consent_checked");
          }}
          className="mt-1 h-5 w-5 shrink-0 accent-qbrand disabled:opacity-50"
        />
        <span className={`text-[14px] leading-relaxed ${disabled ? "text-qgray" : "text-qblack"}`}>
          {t.label}
          <Link
            href={`${PROMO_CONFIG.rulesUrl}#how`}
            target="_blank"
            className="text-qbrand underline underline-offset-2"
          >
            {t.rulesLink}
          </Link>
          {t.labelEnd}
        </span>
      </label>
      {hint && (
        <p id="promo-consent-hint" className="mt-2 pl-8 text-[13px] text-qbrand">
          {hint}
        </p>
      )}
    </div>
  );
}
