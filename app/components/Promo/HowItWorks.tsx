import { Gem, Receipt, ShoppingBag } from "lucide-react";
import type { PromoConfig } from "@/app/lib/promo/types";
import type { PromoTexts } from "@/app/lib/promo/texts";
import { formatKzt } from "@/app/lib/promo/format";

interface HowItWorksProps {
  config: PromoConfig;
  texts: PromoTexts["steps"];
}

const ICONS = [ShoppingBag, Receipt, Gem];

export default function HowItWorks({ config, texts }: HowItWorksProps) {
  return (
    <section aria-labelledby="promo-steps" className="container-x mx-auto">
      <h2 id="promo-steps" className="mb-8 text-2xl font-700 text-qblack sm:text-[28px]">
        {texts.title}
      </h2>
      <ol className="grid gap-4 sm:grid-cols-3 sm:gap-6">
        {texts.items.map((step, i) => {
          const Icon = ICONS[i];
          return (
            <li key={step.title} className="border border-qgray-border bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <Icon aria-hidden className="h-7 w-7 text-qbrand" strokeWidth={1.5} />
                <span className="text-sm font-600 tabular-nums text-qgraytwo">0{i + 1}</span>
              </div>
              <h3 className="text-lg font-600 text-qblack">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#555]">
                {step.text(formatKzt(config.minOrderAmount))}
              </p>
            </li>
          );
        })}
      </ol>
      <p className="mt-5 text-[15px] text-[#555]">{texts.note(config.confirmDays)}</p>
    </section>
  );
}
