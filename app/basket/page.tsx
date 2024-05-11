"use client";
import { useContext } from "react";
import { CartContext } from "@/app/lib/CartContext";
import BasketContent from "./basket-component/basket-component";
import '@/app/basket/basket-component/checkout.styles.scss';


export default function BasketPage() {
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
  </div>
  );
}
