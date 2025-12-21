"use client";

import { useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { CartContext } from "@/app/lib/CartContext";

interface CartDropdownProps {
  className?: string;
}

export default function CartDropdown({ className }: CartDropdownProps) {
  const { cartItems, totalPrice } = useContext(CartContext);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  return (
    <div
      style={{ boxShadow: "0px 15px 50px 0px rgba(0, 0, 0, 0.14)" }}
      className={`w-[300px] bg-white border-t-[3px] border-qyellow ${className || ""}`}
    >
      <div className="w-full h-full">
        <div className="product-items max-h-[310px] overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="p-4 text-center text-qgray">
              Корзина пуста
            </div>
          ) : (
            <ul>
              {cartItems.slice(0, 5).map((item, index) => (
                <li key={item.productId || index} className="w-full h-full flex">
                  <div className="flex space-x-[6px] justify-center items-center px-4 my-[20px]">
                    <div className="w-[65px] h-[65px] relative flex-shrink-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl.startsWith("http") ? item.imageUrl : `${apiUrl}${item.imageUrl}`}
                          alt={item.name || "Product"}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-400">No img</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 h-full flex flex-col justify-center">
                      <p className="title mb-2 text-[13px] font-600 text-qblack leading-4 line-clamp-2">
                        {item.name}
                      </p>
                      <p className="price">
                        <span className="text-qgray text-[13px] mr-1">
                          {item.quantity} x
                        </span>
                        <span className="offer-price text-qred font-600 text-[15px]">
                          {item.price?.toLocaleString()} ₸
                        </span>
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-full px-4 mt-[20px] mb-[12px]">
          <div className="h-[1px] bg-[#F0F1F3]"></div>
        </div>

        <div className="product-actions px-4 mb-[30px]">
          <div className="total-equation flex justify-between items-center mb-[28px]">
            <span className="text-[15px] font-500 text-qblack">Итого</span>
            <span className="text-[15px] font-500 text-qred">
              {totalPrice.toLocaleString()} ₸
            </span>
          </div>
          <div className="product-action-btn">
            <Link href="/basket">
              <div className="w-full h-[50px] mb-[10px] bg-primarygray flex justify-center items-center hover:bg-qgray-border transition-colors">
                <span className="text-qblack text-sm font-600">Корзина</span>
              </div>
            </Link>
            <Link href="/order">
              <div className="w-full h-[50px] bg-qyellow flex justify-center items-center hover:bg-qyellow/90 transition-colors">
                <span className="text-qblack text-sm font-600">Оформить заказ</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
