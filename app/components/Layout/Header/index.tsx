"use client";

import Link from "next/link";
import Image from "next/image";
import { useContext } from "react";
import { CartContext } from "@/app/lib/CartContext";
import { ThinBag } from "@/app/components/icons";
import TopBar from "./TopBar";
import Middlebar from "./Middlebar";
import Navbar from "./Navbar";

interface HeaderProps {
  className?: string;
  drawerAction?: () => void;
}

export default function Header({ className, drawerAction }: HeaderProps) {
  const { cartCount } = useContext(CartContext);

  return (
    <header className={`${className || ""} header-section-wrapper relative`}>
      {/* TopBar - Desktop */}
      <TopBar className="quomodo-shop-top-bar hidden sm:block" />

      {/* Middlebar - Desktop */}
      <Middlebar className="quomodo-shop-middle-bar lg:block hidden" />

      {/* Mobile Header */}
      <div className="quomodo-shop-drawer lg:hidden block w-full h-[60px] bg-white border-b border-qgray-border">
        <div className="w-full h-full flex justify-between items-center px-5">
          {/* Hamburger Menu */}
          <div onClick={drawerAction} className="cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </div>

          {/* Logo */}
          <div>
            <Link href="/">
              <Image
                width={120}
                height={30}
                src="/assets/images/logo-5.svg"
                alt="CrysShop"
                priority
              />
            </Link>
          </div>

          {/* Cart */}
          <div className="cart relative cursor-pointer">
            <Link href="/basket">
              <span>
                <ThinBag className="text-qblack" />
              </span>
            </Link>
            <span className="w-[18px] h-[18px] text-qblack rounded-full bg-qyellow absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px] font-600">
              {cartCount}
            </span>
          </div>
        </div>
      </div>

      {/* Navbar - Desktop */}
      <Navbar className="quomodo-shop-nav-bar lg:block hidden" />
    </header>
  );
}
