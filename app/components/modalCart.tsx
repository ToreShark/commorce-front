// modalCart.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CartItemInterface } from "../lib/interfaces/cart.item.interface";
import { useRouter } from "next/navigation";

interface ModalCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItem: CartItemInterface | null;
}

const ModalCart: React.FC<ModalCartProps> = ({ isOpen, onClose, cartItem }) => {
  const router = useRouter();

  // Закрытие модального окна через несколько секунд
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !cartItem) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg max-w-xs w-full mx-4">
        <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">
          Товар добавлен в корзину
        </h2>
        <div className="flex items-center mb-3 md:mb-4">
          <Image
            src={cartItem.imageUrl}
            alt={cartItem.name}
            width={70}
            height={70}
            className="rounded-md"
          />
          <div className="ml-3 md:ml-4">
            <h3 className="text-base md:text-lg font-semibold">
              {cartItem.name}
            </h3>
            <p className="text-sm text-gray-600">{cartItem.price} ₸</p>
            <p className="text-sm text-gray-600">
              {cartItem.selectedProperties && (
                <>
                  {Object.entries(JSON.parse(cartItem.selectedProperties)).map(
                    ([key, value]) => (
                      <span key={key} className="block">
                        <strong>{key}:</strong> {String(value)}
                      </span>
                    )
                  )}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-2">
          <Button
            onClick={() => router.push("/basket")}
            className="w-full md:w-auto"
          >
            Перейти в корзину
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full md:w-auto"
          >
            Продолжить покупки
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalCart;
