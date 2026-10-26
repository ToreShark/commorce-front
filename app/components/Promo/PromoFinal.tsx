import Link from "next/link";
import type { PromoConfig } from "@/app/lib/promo/types";
import type { PromoTexts } from "@/app/lib/promo/texts";
import Countdown from "./Countdown";
import PromoActions from "./PromoActions";

interface PromoFinalProps {
  config: PromoConfig;
  texts: PromoTexts;
}

/** Финальный блок: повтор таймера и кнопок, ссылка на правила и оговорка про Apple. */
export default function PromoFinal({ config, texts }: PromoFinalProps) {
  return (
    <>
      <section aria-labelledby="promo-final" className="container-x mx-auto">
        <div className="bg-qbrand px-6 py-10 text-white sm:px-12 sm:py-14">
          <h2 id="promo-final" className="text-2xl font-700 leading-tight sm:text-[32px]">
            {texts.final.title}
          </h2>
          <p className="mt-3 max-w-[520px] text-base text-white/85">{texts.final.text}</p>
          <div className="mt-8">
            <Countdown
              startsAt={config.startsAt}
              endsAt={config.endsAt}
              resultsBy={config.resultsBy}
              tone="onDark"
            />
          </div>
          <div className="mt-8">
            <PromoActions
              cta={texts.hero.cta}
              rules={texts.hero.rules}
              rulesUrl={config.rulesUrl}
              tone="onDark"
            />
          </div>
        </div>
      </section>

      <div className="container-x mx-auto">
        <Link
          href={config.rulesUrl}
          className="inline-flex min-h-[44px] items-center text-[15px] font-600 text-qblack underline underline-offset-4 hover:text-qbrand"
        >
          {texts.footer.rulesLink}
        </Link>
        <p className="mt-2 max-w-[820px] text-xs leading-relaxed text-[#666]">{texts.footer.disclaimer}</p>
      </div>
    </>
  );
}
