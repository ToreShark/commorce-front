"use client";
import { useContext, useEffect } from "react";
import { CartContext } from "@/app/lib/CartContext";
import BasketContent from "./basket-component/basket-component";
import '@/app/basket/basket-component/checkout.styles.scss';
import { fetchCartInfo } from "../lib/data";
import { useRouter } from 'next/navigation';
import Link from "@/node_modules/next/link";


export default function BasketPage() {
  const { cartItems } = useContext(CartContext);
  const router = useRouter();

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  return (
    <div className="checkout-container">

    <div className="checkout-header">
    <div className="header-block">
        <span>Товар</span>
    </div>
    <div className="header-block">
        <span>Описание</span>
    </div>
    <div className="header-block">
        <span>Количество</span>
    </div>
    <div className="header-block">
        <span>Цена</span>
    </div>
    <div className="header-block">
        <span>Удалить</span>
    </div>
  </div>
  <BasketContent />
    <span className="total">Итого: ₸{totalPrice}</span>
    <Link href="/order">
      <button className="checkout-button" onClick={() => router.push('/order')}>Оформить заказ</button>
    </Link>
  </div>
  );
}
