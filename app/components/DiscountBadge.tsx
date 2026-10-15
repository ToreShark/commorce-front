interface DiscountBadgeProps {
  percent: number;
  size?: "sm" | "lg";
}

/** Плашка «Скидка −30%» в углу фото товара. Ничего не рисует, если скидки нет. */
export default function DiscountBadge({ percent, size = "sm" }: DiscountBadgeProps) {
  if (!(percent > 0)) return null;

  const sizing =
    size === "lg"
      ? "left-4 top-4 px-3 py-1.5 text-[15px]"
      : "left-2 top-2 px-2 py-1 text-[11px] sm:left-3 sm:top-3 sm:text-[13px]";

  return (
    <span
      className={`pointer-events-none absolute z-20 rounded bg-qred font-700 uppercase leading-none text-white shadow ${sizing}`}
    >
      Скидка −{Math.round(percent)}%
    </span>
  );
}
