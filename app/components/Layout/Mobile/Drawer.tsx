"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchCategories } from "@/app/lib/data";
import Category from "@/app/lib/interfaces/category.interace";

interface DrawerProps {
  open: boolean;
  action: () => void;
}

export default function Drawer({ open, action }: DrawerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tab, setTab] = useState<"categories" | "menu">("categories");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    loadCategories();
  }, []);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={action}
        className={`w-full h-screen bg-black bg-opacity-40 fixed left-0 top-0 z-40 transition-all duration-300 ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      ></div>

      {/* Drawer */}
      <div
        className={`w-[280px] sm:w-[310px] h-screen overflow-y-auto overflow-x-hidden bg-white fixed left-0 top-0 z-50 transition-all duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="w-full px-5 py-4 flex justify-between items-center border-b border-qgray-border">
          <Link href="/" onClick={action}>
            <Image
              width={120}
              height={30}
              src="/assets/images/logo-5.svg"
              alt="CrysShop"
            />
          </Link>
          <button
            onClick={action}
            type="button"
            className="text-qblack hover:text-qred transition-colors"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="w-full flex border-b border-qgray-border">
          <button
            onClick={() => setTab("categories")}
            className={`flex-1 py-3 text-sm font-600 transition-colors ${
              tab === "categories"
                ? "text-qyellow border-b-2 border-qyellow"
                : "text-qblack"
            }`}
          >
            Категории
          </button>
          <button
            onClick={() => setTab("menu")}
            className={`flex-1 py-3 text-sm font-600 transition-colors ${
              tab === "menu"
                ? "text-qyellow border-b-2 border-qyellow"
                : "text-qblack"
            }`}
          >
            Меню
          </button>
        </div>

        {/* Content */}
        <div className="w-full">
          {tab === "categories" ? (
            <ul className="categories-list">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/shop?category=${category.slug}`}
                    onClick={action}
                    className="block px-5 py-3 text-sm text-qblack hover:bg-primarygray hover:text-qyellow transition-colors border-b border-qgray-border"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="menu-list">
              <li>
                <Link
                  href="/"
                  onClick={action}
                  className="block px-5 py-3 text-sm text-qblack hover:bg-primarygray hover:text-qyellow transition-colors border-b border-qgray-border"
                >
                  Главная
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  onClick={action}
                  className="block px-5 py-3 text-sm text-qblack hover:bg-primarygray hover:text-qyellow transition-colors border-b border-qgray-border"
                >
                  Каталог
                </Link>
              </li>
              <li>
                <Link
                  href="/basket"
                  onClick={action}
                  className="block px-5 py-3 text-sm text-qblack hover:bg-primarygray hover:text-qyellow transition-colors border-b border-qgray-border"
                >
                  Корзина
                </Link>
              </li>
              <li>
                <Link
                  href="/purchaseHistory"
                  onClick={action}
                  className="block px-5 py-3 text-sm text-qblack hover:bg-primarygray hover:text-qyellow transition-colors border-b border-qgray-border"
                >
                  История заказов
                </Link>
              </li>
              <li>
                <Link
                  href="/sendphone"
                  onClick={action}
                  className="block px-5 py-3 text-sm text-qblack hover:bg-primarygray hover:text-qyellow transition-colors border-b border-qgray-border"
                >
                  Аккаунт
                </Link>
              </li>
              <li>
                <Link
                  href="/hello"
                  onClick={action}
                  className="block px-5 py-3 text-sm text-qblack hover:bg-primarygray hover:text-qyellow transition-colors border-b border-qgray-border"
                >
                  О нас
                </Link>
              </li>
            </ul>
          )}
        </div>

        {/* Contact */}
        <div className="w-full px-5 py-6 border-t border-qgray-border mt-auto">
          <a
            href="https://wa.me/77019654666"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 text-qblack hover:text-qyellow transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="text-sm font-500">+7 (701) 965-46-66</span>
          </a>
        </div>
      </div>
    </>
  );
}
