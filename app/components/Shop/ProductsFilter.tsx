"use client";

import { useEffect, useState } from "react";
import { fetchCategories } from "@/app/lib/data";
import Category from "@/app/lib/interfaces/category.interace";

interface ProductsFilterProps {
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  priceRange: [number, number];
  priceBounds: [number, number];
  onPriceChange: (min: number, max: number) => void;
  filterToggle: boolean;
  onFilterToggle: () => void;
  className?: string;
}

export default function ProductsFilter({
  selectedCategoryId,
  onCategoryChange,
  priceRange,
  priceBounds,
  onPriceChange,
  filterToggle,
  onFilterToggle,
  className,
}: ProductsFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [minPrice, setMinPrice] = useState(priceRange[0]);
  const [maxPrice, setMaxPrice] = useState(priceRange[1]);

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
    setMinPrice(priceRange[0]);
    setMaxPrice(priceRange[1]);
  }, [priceRange]);

  const handlePriceApply = () => {
    onPriceChange(minPrice, maxPrice);
  };

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategoryId === categoryId) {
      onCategoryChange("");
    } else {
      onCategoryChange(categoryId);
    }
  };

  return (
    <>
      <div
        className={`filter-widget w-full fixed lg:relative left-0 top-0 h-screen z-10 lg:h-auto overflow-y-scroll lg:overflow-y-auto bg-white px-[30px] pt-[40px] ${
          className || ""
        } ${filterToggle ? "block" : "hidden lg:block"}`}
      >
        {/* Categories */}
        <div className="filter-subject-item pb-10 border-b border-qgray-border">
          <div className="subject-title mb-[30px]">
            <h1 className="text-black text-base font-500">Категории товаров</h1>
          </div>
          <div className="filter-items">
            <ul className="space-y-4">
              <li
                onClick={() => onCategoryChange("")}
                className={`cursor-pointer text-sm transition-colors ${
                  selectedCategoryId === ""
                    ? "text-qyellow font-600"
                    : "text-qgray hover:text-qblack"
                }`}
              >
                Все категории
              </li>
              {categories.map((category) => (
                <li
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`cursor-pointer text-sm transition-colors flex items-center justify-between ${
                    selectedCategoryId === category.id
                      ? "text-qyellow font-600"
                      : "text-qgray hover:text-qblack"
                  }`}
                >
                  <span>{category.name}</span>
                  {selectedCategoryId === category.id && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-qyellow"
                    >
                      <path
                        d="M10 3L4.5 8.5L2 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Price Range */}
        <div className="filter-subject-item pb-10 border-b border-qgray-border mt-10">
          <div className="subject-title mb-[30px]">
            <h1 className="text-black text-base font-500">Диапазон цен</h1>
          </div>
          <div className="price-range space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1 min-w-0">
                <label className="text-xs text-qgray mb-1 block">От</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  min={priceBounds[0]}
                  max={priceBounds[1]}
                  className="w-full h-9 border border-qgray-border rounded px-2 text-xs text-right focus:border-qyellow focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                />
              </div>
              <span className="text-qgray pt-4 text-sm">—</span>
              <div className="flex-1 min-w-0">
                <label className="text-xs text-qgray mb-1 block">До</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  min={priceBounds[0]}
                  max={priceBounds[1]}
                  className="w-full h-9 border border-qgray-border rounded px-2 text-xs text-right focus:border-qyellow focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="100000"
                />
              </div>
            </div>
            <button
              onClick={handlePriceApply}
              className="w-full h-10 bg-qyellow text-qblack font-600 text-sm rounded hover:bg-qyellow/90 transition-colors"
            >
              Применить
            </button>
            <p className="text-xs text-qgray">
              Цена: {minPrice.toLocaleString()} ₸ — {maxPrice.toLocaleString()} ₸
            </p>
          </div>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={onFilterToggle}
          type="button"
          className="w-10 h-10 fixed top-5 right-5 z-50 rounded lg:hidden flex justify-center items-center border border-qred text-qred bg-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </>
  );
}
