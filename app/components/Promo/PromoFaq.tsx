import type { PromoConfig } from "@/app/lib/promo/types";
import type { PromoTexts } from "@/app/lib/promo/texts";
import { formatKzt, formatLongDate } from "@/app/lib/promo/format";

interface PromoFaqProps {
  config: PromoConfig;
  texts: PromoTexts["faq"];
}

/**
 * Аккордеон на <details>: открывается без JavaScript, клавиатура и читалки
 * поддерживают его сами. Так же устроены разделы в карточке товара.
 */
export default function PromoFaq({ config, texts }: PromoFaqProps) {
  const items = texts.items({
    minAmount: formatKzt(config.minOrderAmount),
    endsAt: formatLongDate(config.endsAt),
    resultsBy: formatLongDate(config.resultsBy),
    days: config.confirmDays,
  });

  return (
    <section aria-labelledby="promo-faq" className="container-x mx-auto">
      <h2 id="promo-faq" className="mb-6 text-2xl font-700 text-qblack sm:text-[28px]">
        {texts.title}
      </h2>
      <div className="max-w-[820px] border-t border-qgray-border">
        {items.map((item) => (
          <details key={item.q} className="group border-b border-qgray-border">
            <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
              <span className="text-base font-600 text-qblack">{item.q}</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
                className="shrink-0 text-qblack transition-transform motion-reduce:transition-none group-open:rotate-180"
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <p className="pb-5 pr-8 text-[15px] leading-relaxed text-[#555]">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
