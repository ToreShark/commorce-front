"use client";
import { createContext, useEffect, useState } from "react";
import CartItem from "../components/cart-item/cart-item.component";
import { addItemToCartAPI, fetchCartInfo } from "./data";
import { CartItemInterface } from "./interfaces/cart.item.interface";

type CartItemsArray = CartItemInterface[];

export const CartContext = createContext<{
  isCartOpen: boolean;
  setIsCartOpen: (value: boolean) => void;
  cartItems: CartItemsArray;
  setCartItems: (items: CartItemsArray) => void;
  addItemToCart: (item: CartItemInterface) => void;
  cartCount: number;
  setCartCount: (count: number) => void;
  totalPrice: number;
  setTotalPrice: (price: number) => void;
  refreshCart: () => Promise<boolean>;
}>({
  isCartOpen: false,
  setIsCartOpen: () => {}, // Определение как noop для начального значения
  cartItems: [],
  setCartItems: () => {},
  addItemToCart: () => {},
  cartCount: 0,
  setCartCount: () => {},
  totalPrice: 0,
  setTotalPrice: () => {},
  refreshCart: async () => false,
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemsArray>([]);
  const [cartCount, setCartCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  /**
   * Перечитать корзину с сервера.
   *
   * Провайдер живёт в layout.tsx и при переходах внутри SPA не перемонтируется,
   * поэтому единственный fetch на монтировании не узнаёт о том, что сервер корзину
   * почистил. Так было после подтверждения заказа: сессия на бэкенде пуста, а
   * счётчик в шапке всё ещё показывал товар.
   *
   * Состав берём с сервера, а не считаем на клиенте: расхождение клиентского счёта
   * с серверным было первопричиной бага «+1» в addItemToCart.
   *
   * @returns удалось ли взять состав с сервера. fetchCartInfo сетевую ошибку глотает
   * и отдаёт null, поэтому исключения тут не будет — о неудаче говорит именно false,
   * и вызывающий решает, что показывать вместо устаревшей корзины.
   */
  const refreshCart = async (): Promise<boolean> => {
    const cartInfo = await fetchCartInfo();
    if (!cartInfo) {
      return false;
    }

    setCartItems(cartInfo.items);
    setCartCount(cartInfo.totalCount);
    setTotalPrice(cartInfo.totalPrice);
    return true;
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const addItemToCart = async (item: CartItemInterface): Promise<void> => {
    try {
      const { productId, selectedProperties, cellphone, quantity } = item;
      const addedItem = await addItemToCartAPI(
        productId,
        selectedProperties ?? "",
        cellphone ?? "",
        quantity && quantity > 0 ? quantity : 1
      );
      if (addedItem) {
        // Состав корзины берём с сервера, а не досчитываем на клиенте: количество
        // складывается там же, где живёт заказ, и локальный «+1» с ним расходился
        await refreshCart();
      }
    } catch (error) {
      console.error("Ошибка при добавлении товара в корзину:", error);
    }
  };

  const value = {
    isCartOpen,
    setIsCartOpen,
    addItemToCart,
    cartItems,
    setCartItems,
    cartCount,
    setCartCount,
    totalPrice,
    setTotalPrice,
    refreshCart,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
