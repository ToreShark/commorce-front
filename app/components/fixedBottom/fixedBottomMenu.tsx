"use client";

import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Home, ShoppingCart, User, LogIn } from "lucide-react";
import { CartContext } from "@/app/lib/CartContext";
import { Category } from "@mui/icons-material";
import { getCurrentUser } from "@/app/lib/data";
import { UserInfo } from "@/app/lib/interfaces/auth.interface";

const FixedBottomMenu: React.FC = () => {
  const { cartCount } = useContext(CartContext);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const result = await getCurrentUser();
        if (result.success && result.user) {
          setUser(result.user);
        }
      }
    };
    checkAuth();
  }, []);

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
        <ShoppingCart className="w-6 h-6" />
        <span className="text-xs font-semibold text-gray-600">Корзина</span>
        {cartCount > 0 && (
          <span className="absolute top-0 right-0 mt-[-8px] mr-[-8px] flex items-center justify-center h-4 w-4 bg-red-500 rounded-full text-white text-xs">
            {cartCount}
          </span>
        )}
      </Link>
      <Link href="/login" className="flex flex-col items-center">
        {user ? (
          <>
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-medium">
              {user.firstName?.charAt(0) || "U"}
            </div>
            <span className="text-xs font-semibold text-green-600">{user.firstName}</span>
          </>
        ) : (
          <>
            <LogIn className="w-6 h-6" />
            <span className="text-xs font-semibold text-gray-600">Войти</span>
          </>
        )}
      </Link>
    </div>
  );
};

export default FixedBottomMenu;
