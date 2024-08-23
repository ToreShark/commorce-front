"use client";

import React, { useContext } from "react";
import Link from "next/link";
import { Home, ShoppingCart, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { CartContext } from "@/app/lib/CartContext";
import { Category } from "@mui/icons-material";

const FixedBottomMenu: React.FC = () => {
  const router = useRouter();
  const { cartCount } = useContext(CartContext);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around items-center py-2 md:hidden">
      <Link href="/" className="flex flex-col items-center">
        <Home className="w-6 h-6" />
        <span className="text-xs font-semibold text-gray-600">Главная</span>
      </Link>
      <Link href="/shop" className="flex flex-col items-center">
        <Category className="w-6 h-6" />
        <span className="text-xs font-semibold text-gray-600">Покупки</span>
      </Link>
      <Link href="/basket" className="flex flex-col items-center relative">
        {" "}
        {/* Добавлено relative */}
        <ShoppingCart className="w-6 h-6" />
        <span className="text-xs font-semibold text-gray-600">Корзина</span>
        {cartCount > 0 && (
          <span className="absolute top-0 right-0 mt-[-8px] mr-[-8px] flex items-center justify-center h-4 w-4 bg-red-500 rounded-full text-white text-xs">
            {cartCount}
          </span>
        )}
      </Link>
      <Link href="/sendphone" className="flex flex-col items-center">
        <User className="w-6 h-6" />
        <span className="text-xs font-semibold text-gray-600">Аккаунт</span>
      </Link>
    </div>
  );
};

export default FixedBottomMenu;
