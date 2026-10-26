import Image from "next/image";
import type { PromoConfig } from "@/app/lib/promo/types";
import type { PromoTexts } from "@/app/lib/promo/texts";
import { formatKzt, formatLongDate } from "@/app/lib/promo/format";
import Countdown from "./Countdown";
import PromoActions from "./PromoActions";

interface PromoHeroProps {
  config: PromoConfig;
  texts: PromoTexts;
  /** Фото образа из каталога; одежда — главная, приз — дополнение. */
  collectionImage: string;
}

/** SVG-заглушки через оптимизатор Next не проходят (dangerouslyAllowSVG выключен). */
const isSvg = (src: string) => src.endsWith(".svg");

export default function PromoHero({ config, texts, collectionImage }: PromoHeroProps) {
  const t = texts.hero;

  return (
    <section aria-labelledby="promo-title" className="container-x mx-auto">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
        <div>
          <p className="mb-4 text-xs font-600 uppercase tracking-[0.18em] text-qbrand">{t.eyebrow}</p>
          <h1
            id="promo-title"
            className="text-[32px] font-700 leading-[1.1] tracking-tight text-qblack sm:text-[44px] lg:text-[52px]"
          >
            {t.title(config.prizeShortName)}
          </h1>
          <p className="mt-4 max-w-[480px] text-base leading-relaxed text-[#555] sm:text-lg">
            {t.subtitle(formatKzt(config.minOrderAmount), formatLongDate(config.endsAt))}
          </p>
          <div className="mt-8">
            <Countdown startsAt={config.startsAt} endsAt={config.endsAt} resultsBy={config.resultsBy} />
          </div>
          <div className="mt-8">
            <PromoActions cta={t.cta} rules={t.rules} rulesUrl={config.rulesUrl} />
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[460px] md:max-w-none">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-primarygray">
            <Image
              src={collectionImage}
              alt={t.collectionAlt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              unoptimized={isSvg(collectionImage)}
            />
          </div>
          <figure className="absolute bottom-4 left-4 w-[42%] max-w-[200px] border border-qgray-border bg-white p-2 shadow-[0_12px_32px_rgba(0,0,0,0.12)] sm:bottom-6 sm:left-6">
            <div className="relative aspect-square w-full bg-primarygray">
              <Image
                src={config.prizeImage}
                alt={t.prizeAlt(config.prizeName)}
                fill
                sizes="200px"
                className="object-cover"
                unoptimized={isSvg(config.prizeImage)}
              />
            </div>
            <figcaption className="px-1 pb-1 pt-2">
              <span className="block text-[10px] font-600 uppercase tracking-[0.14em] text-qbrand">
                {t.prizeCaption}
              </span>
              <span className="mt-0.5 block text-[12px] font-600 leading-snug text-qblack sm:text-[13px]">
                {config.prizeName}
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
