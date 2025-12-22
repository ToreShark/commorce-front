"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CartContext } from "@/app/lib/CartContext";
import { ThinBag, ThinPeople } from "@/app/components/icons";
import SearchBox from "./SearchBox";
import CartDropdown from "./CartDropdown";
import { getCurrentUser } from "@/app/lib/data";
import { UserInfo } from "@/app/lib/interfaces/auth.interface";

interface MiddlebarProps {
  className?: string;
}

export default function Middlebar({ className }: MiddlebarProps) {
  const { cartCount } = useContext(CartContext);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const result = await getCurrentUser();
        if (result.success && result.user) {
          setUser(result.user);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  return (
    <div className={`w-full h-[86px] bg-white ${className || ""}`}>
      <div className="container-x mx-auto h-full">
        <div className="relative h-full">
          <div className="flex justify-between items-center h-full">
            {/* Logo */}
            <div>
              <Link href="/">
                <Image
                  width={152}
                  height={36}
                  src="/assets/images/logo-5.svg"
                  alt="CrysShop"
                  priority
                />
              </Link>
            </div>

            {/* Search Box */}
            <div className="w-[517px] h-[44px] hidden lg:block">
              <SearchBox />
            </div>

            {/* Icons */}
            <div className="flex space-x-6 items-center">
              {/* Cart */}
              <div className="cart-wrapper group relative py-4">
                <div className="cart relative cursor-pointer">
                  <Link href="/basket">
                    <span>
                      <ThinBag className="text-qblack" />
                    </span>
                  </Link>
                  <span className="w-[18px] h-[18px] rounded-full bg-qyellow absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px] text-qblack font-600">
                    {cartCount}
                  </span>
                </div>
                <CartDropdown className="absolute -right-[45px] top-11 z-50 hidden group-hover:block" />
              </div>

              {/* Profile / Login */}
              <div className="relative group">
                <Link href="/login" className="flex items-center gap-2">
                  {isLoading ? (
                    <span className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
                  ) : user ? (
                    <>
                      <span className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
                        {user.firstName?.charAt(0) || "U"}
                      </span>
                      <span className="hidden lg:block text-sm font-medium text-qblack">
                        {user.firstName}
                      </span>
                    </>
                  ) : (
                    <span>
                      <ThinPeople className="text-qblack" />
                    </span>
                  )}
                </Link>

                {/* Dropdown для авторизованного пользователя */}
                {user && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 hidden group-hover:block z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                    <Link href="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Профиль
                    </Link>
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Админ-панель
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
