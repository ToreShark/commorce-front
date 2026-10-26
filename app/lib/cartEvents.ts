// Событие «товар добавлен в корзину» для всего, что должно на это отреагировать
// (подсказка об акции). Шлёт его CartContext после ответа сервера, поэтому
// неудачное добавление не вызывает реакции.

export const CART_ITEM_ADDED = "crysshop:cart-item-added";

export function notifyCartItemAdded(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_ITEM_ADDED));
  }
}
