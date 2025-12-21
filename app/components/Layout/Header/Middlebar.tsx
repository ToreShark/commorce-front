"use client";

import { useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { CartContext } from "@/app/lib/CartContext";
import { ThinBag, ThinPeople } from "@/app/components/icons";
import SearchBox from "./SearchBox";
import CartDropdown from "./CartDropdown";

interface MiddlebarProps {
  className?: string;
}

export default function Middlebar({ className }: MiddlebarProps) {
  const { cartCount } = useContext(CartContext);

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

              {/* Profile */}
              <div>
                <Link href="/sendphone">
                  <span>
                    <ThinPeople className="text-qblack" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
