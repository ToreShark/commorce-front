import Link from "next/link";

interface PromoActionsProps {
  cta: string;
  rules: string;
  rulesUrl: string;
  tone?: "light" | "onDark";
}

/** Пара кнопок «Выбрать покупку» + «Правила акции» — в первом и финальном блоке. */
export default function PromoActions({ cta, rules, rulesUrl, tone = "light" }: PromoActionsProps) {
  const primary =
    tone === "onDark"
      ? "bg-white text-qbrand hover:bg-qblack hover:text-white focus-visible:outline-white"
      : "bg-qbrand text-white hover:bg-qblack focus-visible:outline-qblack";
  const secondary =
    tone === "onDark" ? "text-white hover:text-white/80" : "text-qblack hover:text-qbrand";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
      {/* Обычный якорь: прокрутка работает и без JavaScript */}
      <a
        href="#tovary"
        className={`inline-flex min-h-[48px] items-center justify-center px-8 text-[15px] font-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${primary}`}
      >
        {cta}
      </a>
      <Link
        href={rulesUrl}
        className={`inline-flex min-h-[44px] items-center justify-center text-[15px] font-500 underline underline-offset-4 transition-colors ${secondary}`}
      >
        {rules}
      </Link>
    </div>
  );
}
