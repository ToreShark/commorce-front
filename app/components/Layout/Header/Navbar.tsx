"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCategories } from "@/app/lib/data";
import Category from "@/app/lib/interfaces/category.interace";
import { Arrow } from "@/app/components/icons";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className }: NavbarProps) {
  const [categoryToggle, setToggle] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [elementsSize, setSize] = useState("0px");

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

  useEffect(() => {
    if (categoryToggle && categories.length > 0) {
      setSize(`${42 * Math.min(categories.length, 10)}px`);
    } else {
      setSize("0px");
    }
  }, [categoryToggle, categories.length]);

  const handler = () => {
    setToggle(!categoryToggle);
  };

  return (
    <div
      className={`nav-widget-wrapper w-full bg-qh5-bwhite h-[60px] relative z-30 ${
        className || ""
      }`}
    >
      <div className="container-x mx-auto h-full">
        <div className="w-full h-full relative">
          <div className="w-full h-full flex justify-between items-center">
            {/* Categories Dropdown */}
            <div className="category-and-nav flex xl:space-x-7 space-x-3 items-center">
              <div className="category w-[270px] h-[53px] bg-white px-5 rounded-t-md mt-[6px] relative">
                <button
                  onClick={handler}
                  type="button"
                  className="w-full h-full flex justify-between items-center"
                >
                  <div className="flex space-x-3 items-center">
                    <span className="text-qblack">
                      <svg
                        className="fill-current"
                        width="14"
                        height="9"
                        viewBox="0 0 14 9"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="14" height="1" />
                        <rect y="8" width="14" height="1" />
                        <rect y="4" width="10" height="1" />
                      </svg>
                    </span>
                    <span className="text-sm font-600 text-qblacktext">
                      Все категории
                    </span>
                  </div>
                  <div>
                    <Arrow className="fill-current text-qblacktext" />
                  </div>
                </button>

                {categoryToggle && (
                  <div
                    className="fixed top-0 left-0 w-full h-full -z-10"
                    onClick={handler}
                  ></div>
                )}

                <div
                  className="category-dropdown w-full absolute left-0 top-[53px] overflow-hidden transition-all duration-300 bg-white shadow-lg"
                  style={{ height: elementsSize }}
                >
                  <ul className="categories-list">
                    {categories.map((category) => (
                      <li key={category.id} className="category-item">
                        <Link href={`/shop?category=${category.slug}`} onClick={handler}>
                          <div className="flex justify-between items-center px-5 h-10 bg-white hover:bg-qyellow transition-all duration-300 ease-in-out cursor-pointer text-qblack hover:text-qblack">
                            <span className="text-sm font-400">
                              {category.name}
                            </span>
                            <Arrow className="fill-current" />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="nav">
                <ul className="flex space-x-6">
                  <li>
                    <Link href="/">
                      <span className="text-sm font-600 text-qblack hover:text-qyellow transition-colors">
                        Главная
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop">
                      <span className="text-sm font-600 text-qblack hover:text-qyellow transition-colors">
                        Каталог
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/hello">
                      <span className="text-sm font-600 text-qblack hover:text-qyellow transition-colors">
                        О нас
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/payment">
                      <span className="text-sm font-600 text-qblack hover:text-qyellow transition-colors">
                        Оплата
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Side - Contact */}
            <div className="flex items-center space-x-4">
              <a
                href="https://wa.me/77019654666"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-qblack hover:text-qyellow transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="text-sm font-500 hidden xl:block">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
