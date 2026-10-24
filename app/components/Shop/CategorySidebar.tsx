"use client";

import Category from "@/app/lib/interfaces/category.interace";

interface CategorySidebarProps {
  categories: Category[];
  /** Сколько товаров в каждой категории — по текущему поиску, без остальных фильтров. */
  counts: Map<string, number>;
  total: number;
  selectedCategoryId: string;
  onSelect: (categoryId: string) => void;
}

/**
 * Категории со счётчиками, как на Интертопе. На десктопе — колонка слева,
 * на телефоне — лента, которую листают пальцем.
 * Пустые категории не показываем, кроме выбранной.
 */
export default function CategorySidebar({
  categories,
  counts,
  total,
  selectedCategoryId,
  onSelect,
}: CategorySidebarProps) {
  const visible = categories.filter(
    (c) => (counts.get(c.id) ?? 0) > 0 || c.id === selectedCategoryId
  );
  const items = [
    { id: "", name: "Все товары", count: total },
    ...visible.map((c) => ({ id: c.id, name: c.name, count: counts.get(c.id) ?? 0 })),
  ];

  return (
    <nav aria-label="Категории">
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0">
        {items.map((item) => {
          const on = item.id === selectedCategoryId;
          return (
            <li key={item.id || "all"} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-current={on ? "page" : undefined}
                className={`whitespace-nowrap text-left text-[15px] transition-colors max-lg:rounded-full max-lg:border max-lg:px-4 max-lg:py-2 lg:py-1.5 ${
                  on
                    ? "font-700 text-qblack max-lg:border-qblack"
                    : "text-qblack hover:text-qbrand max-lg:border-qgray-border"
                }`}
              >
                {item.name}
                <span className="ml-2 text-[13px] font-400 text-qgray">{item.count}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
