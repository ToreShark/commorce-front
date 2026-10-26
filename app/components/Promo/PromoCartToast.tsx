"use client";

import { useContext, useEffect, useState } from "react";
import { CartContext } from "@/app/lib/CartContext";
import { CART_ITEM_ADDED } from "@/app/lib/cartEvents";
import { getPromoTexts } from "@/app/lib/promo/texts";
import PromoCartHint from "./PromoCartHint";
import { itemsTotal, useRunningPromo } from "./usePromoRunning";

const SHOW_MS = 8000;

/**
 * Всплывающая подсказка об акции сразу после добавления товара в корзину —
 * с карточки в каталоге и со страницы товара. Показывает, сколько осталось до
 * порога акции или что заказ уже подходит. Пока акция не идёт — молчит.
 */
export default function PromoCartToast() {
  const { cartItems } = useContext(CartContext);
  const promo = useRunningPromo();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onAdded = () => setOpen(true);
    window.addEventListener(CART_ITEM_ADDED, onAdded);
    return () => window.removeEventListener(CART_ITEM_ADDED, onAdded);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => setOpen(false), SHOW_MS);
    return () => clearTimeout(timer);
  }, [open, cartItems]);

  if (!open || !promo) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[76px] z-50 mx-auto max-w-[420px] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.18)] md:inset-x-auto md:bottom-6 md:right-6"
    >
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label={getPromoTexts().cartHint.close}
        className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center text-qgray hover:text-qblack"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <PromoCartHint total={itemsTotal(cartItems)} className="pr-10" onLinkClick={() => setOpen(false)} />
    </div>
  );
}
