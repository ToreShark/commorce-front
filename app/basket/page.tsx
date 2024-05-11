"use client";
import { useContext } from "react";
import { CartContext } from "@/app/lib/CartContext";
import BasketContent from "./basket-component/basket-component";

export default function BasketPage() {
  return <BasketContent />;
}
