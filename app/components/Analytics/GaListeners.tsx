"use client";

import { useEffect } from "react";
import { apiBase } from "@/app/lib/apiBase";
import {
  PENDING_TTL_MS,
  gaEvent,
  gaPurchaseOnce,
  getPendingPurchases,
  removePendingPurchase,
} from "@/app/lib/ga";

interface PaymentStatus {
  isPaid: boolean;
  isRefunded: boolean;
}

/**
 * Статус оплаты заказа. Доступ — по сессии корзины или по токену покупателя
 * (заказ привязывается к нему при подтверждении кода). null — не узнали.
 */
async function fetchPaymentStatus(orderId: string): Promise<PaymentStatus | null> {
  let token: string | null = null;
  try {
    token = localStorage.getItem("accessToken");
  } catch {
    // без токена спросим по сессии
  }
  try {
    const response = await fetch(`${apiBase()}/api/payment/check-status/${encodeURIComponent(orderId)}`, {
      credentials: "include",
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (typeof data !== "object" || data === null) return null;
    const d = data as Record<string, unknown>;
    return { isPaid: d.isPaid === true, isRefunded: d.isRefunded === true };
  } catch {
    return null;
  }
}

/**
 * Покупки, ушедшие на страницу банка: на каждом заходе на сайт спрашиваем
 * статус и шлём purchase, когда оплата подтверждена. Отказ, возврат денег или
 * истёкшее ожидание (3 дня) — заказ из ожидания убирается без события.
 */
async function checkPendingPurchases(): Promise<void> {
  for (const pending of getPendingPurchases()) {
    const expired = Date.now() - pending.createdAt > PENDING_TTL_MS;
    const status = await fetchPaymentStatus(pending.transaction_id);
    if (status?.isPaid) {
      const { createdAt: _createdAt, ...purchase } = pending;
      gaPurchaseOnce(purchase);
      removePendingPurchase(pending.transaction_id);
    } else if (status?.isRefunded || expired) {
      removePendingPurchase(pending.transaction_id);
    }
  }
}

/** Клик по любой ссылке на WhatsApp — шапка, меню, контакты, страницы. */
function onDocumentClick(event: MouseEvent) {
  const target = event.target as Element | null;
  const link = target?.closest?.('a[href*="wa.me"], a[href*="whatsapp.com"]') as HTMLAnchorElement | null;
  if (!link) return;
  gaEvent("whatsapp_click", {
    link_url: link.href,
    link_text: (link.textContent || link.getAttribute("aria-label") || "").trim().slice(0, 100),
  });
}

/** Общие слушатели GA4 на всём сайте; ничего не рисует. */
export default function GaListeners() {
  useEffect(() => {
    checkPendingPurchases();
    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, []);

  return null;
}
