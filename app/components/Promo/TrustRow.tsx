import { CreditCard, RotateCcw, Truck } from "lucide-react";
import type { PromoTexts } from "@/app/lib/promo/texts";

const ICONS: Record<string, typeof Truck> = {
  delivery: Truck,
  payment: CreditCard,
  returns: RotateCcw,
};

export default function TrustRow({ texts }: { texts: PromoTexts["trust"] }) {
  return (
    <section aria-label={texts.title} className="border-y border-qgray-border bg-primarygray">
      <ul className="container-x mx-auto grid gap-5 py-7 sm:grid-cols-3 sm:gap-6">
        {texts.items.map((item) => {
          const Icon = ICONS[item.key];
          return (
            <li key={item.key} className="flex items-start gap-3">
              <Icon aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-qbrand" strokeWidth={1.5} />
              <div>
                <p className="text-[15px] font-600 text-qblack">{item.title}</p>
                <p className="text-sm text-[#555]">{item.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
