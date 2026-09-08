/**
 * Оповещение о том, что вход изменился.
 *
 * Шапка (TopBar, Middlebar) решает, показывать «войти» или имя покупателя, по
 * наличию accessToken в localStorage, и читает его один раз на монтировании.
 * Компоненты живут в layout.tsx и при переходах внутри SPA не перемонтируются,
 * поэтому вход, выданный без перезагрузки страницы — как при подтверждении
 * заказа кодом, — до шапки не доходил: покупатель оставался «не вошедшим»
 * до F5. Та же болезнь, что была у счётчика корзины.
 *
 * localStorage сам о себе в этой же вкладке не сообщает: событие `storage`
 * браузер шлёт только другим вкладкам. Отсюда своё событие.
 *
 * Разбор: I_STORE/docs/checkout-cart-reset-and-autologin-2026-09-08.md.
 */
const AUTH_CHANGED = "crysshop:auth-changed";

/** Сказать интерфейсу, что вход появился или пропал. */
export function notifyAuthChanged(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_CHANGED));
}

/**
 * Подписаться на изменение входа.
 *
 * @returns функция отписки — её и возвращают из useEffect.
 */
export function subscribeAuthChanged(listener: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(AUTH_CHANGED, listener);
  return () => window.removeEventListener(AUTH_CHANGED, listener);
}
