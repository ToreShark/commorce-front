"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBoxProps {
  className?: string;
}

export default function SearchBox({ className }: SearchBoxProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Подставляем запрос, с которым покупатель пришёл, чтобы его было видно
  // и можно было уточнить, а не набирать заново. Читаем из window, а не через
  // useSearchParams: шапка рисуется на каждой странице, и хук потребовал бы
  // Suspense-границы вокруг всех них
  useEffect(() => {
    const current = new URLSearchParams(window.location.search).get("search");
    if (current) {
      setSearchQuery(current);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div
      className={`w-full h-full flex items-center border border-qgray-border bg-white ${
        className || ""
      }`}
    >
      <div className="flex-1 h-full">
        <form onSubmit={handleSearch} className="h-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full px-4 text-sm text-qblack placeholder:text-qgray focus:outline-none"
            placeholder="Поиск товаров..."
          />
        </form>
      </div>
      <button
        onClick={handleSearch}
        className="w-[93px] h-full bg-qyellow text-qblack text-sm font-600 hover:bg-qyellow/90 transition-colors"
        type="button"
      >
        Поиск
      </button>
    </div>
  );
}
