"use client";
import { FormEvent, useContext } from "react";
import { CartContext } from "../lib/CartContext";
import "@/app/order/order-component/order-component.style.scss";
import OrderContent from "./order-component/order-component";

export default function OrderPage() {
  

  return (
    <OrderContent />
  );
}
