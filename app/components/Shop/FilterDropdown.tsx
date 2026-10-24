"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

interface FilterDropdownProps {
  label: ReactNode;
  /** Подсветить кнопку, когда в фильтре что-то выбрано. */
  active?: boolean;
  /** Прижать панель к правому краю кнопки — для крайних справа фильтров и сортировки. */
  alignRight?: boolean;
  /** Вид кнопки: рамка, как у фильтров, или текст, как у сортировки. */
  variant?: "box" | "text";
  children: (close: () => void) => ReactNode;
}

/** Кнопка со стрелкой и выпадающая панель. Закрывается кликом мимо и по Esc. */
export default function FilterDropdown({
  label,
  active,
  alignRight,
  variant = "box",
  children,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const arrow = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden
      className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={
          variant === "box"
            ? `flex h-12 w-full items-center justify-between gap-2 border bg-white px-3 text-left text-[14px] transition-colors ${
                open || active ? "border-qblack" : "border-qgray-border hover:border-qgray"
              } ${active ? "font-600 text-qblack" : "text-qblack"}`
            : "flex items-center gap-2 text-[14px] text-qblack"
        }
      >
        <span className="min-w-0 truncate">{label}</span>
        {arrow}
      </button>

      {open && (
        <div
          className={`absolute top-full z-30 mt-1 min-w-full w-max max-w-[min(320px,calc(100vw-32px))] border border-qgray-border bg-white shadow-lg ${
            alignRight ? "right-0" : "left-0"
          }`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
