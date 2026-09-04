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
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemsArray>([]);
  const [cartCount, setCartCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchAndUpdateCart = async () => {
      const cartInfo = await fetchCartInfo();
      if (cartInfo) {
        setCartItems(cartInfo.items);
        setCartCount(cartInfo.totalCount);
        setTotalPrice(cartInfo.totalPrice);
      }
    };

    fetchAndUpdateCart();
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
        const cartInfo = await fetchCartInfo();
        if (cartInfo) {
          setCartItems(cartInfo.items);
          setCartCount(cartInfo.totalCount);
          setTotalPrice(cartInfo.totalPrice);
        }
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
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
