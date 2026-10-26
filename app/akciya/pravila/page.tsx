import type { Metadata } from "next";
import Link from "next/link";
import Layout from "@/app/components/Layout";
import { Breadcrumb } from "@/app/components/Shop";
import { PROMO_CONFIG } from "@/app/lib/promo/config";
import { fetchPromoConfig } from "@/app/lib/promo/api";
import { mergeConfig } from "@/app/lib/promo/data";
import { formatLongDate } from "@/app/lib/promo/format";
import { getPromoRules } from "@/app/lib/promo/rules";
import { getPromoTexts } from "@/app/lib/promo/texts";

// Как и лендинг: сроки, порог, приз и редакция — из API, страница обновляется раз в минуту
export const revalidate = 60;

/** Те же настройки, что у лендинга и галочки в оформлении: правила не должны с ними расходиться. */
async function getRulesConfig() {
  return mergeConfig(PROMO_CONFIG, await fetchPromoConfig(PROMO_CONFIG.slug));
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await getRulesConfig();
  const t = getPromoTexts().rules;
  return {
    title: t.title,
    description: t.description(formatLongDate(config.endsAt)),
    alternates: { canonical: "/akciya/pravila" },
  };
}

export default async function PromoRulesPage() {
  const t = getPromoTexts();
  const config = await getRulesConfig();
  const sections = getPromoRules(config);
  // rulesVersion — дата редакции «2026-10-26», та же строка уходит в согласие при оформлении
  // Версию ведёт бэкенд (Promos.RulesVersion); не дату показываем как есть
  const edition = /^\d{4}-\d{2}-\d{2}$/.test(config.rulesVersion)
    ? `${formatLongDate(`${config.rulesVersion}T12:00:00+05:00`)} ${config.rulesVersion.slice(0, 4)} г.`
    : config.rulesVersion;

  return (
    <Layout>
      <div className="container-x mx-auto">
        <Breadcrumb
          paths={[
            { name: t.breadcrumb.home, path: "/" },
            { name: t.breadcrumb.current, path: "/akciya" },
            { name: "Правила", path: "/akciya/pravila" },
          ]}
        />
        <article className="max-w-[760px] pb-16">
          <h1 className="mb-2 text-[28px] font-700 text-qblack sm:text-[32px]">{t.rules.title}</h1>
          <p className="mb-8 text-sm text-[#666]">{t.rules.edition(edition)}</p>

          <nav aria-labelledby="rules-toc" className="mb-10 rounded-lg border border-[#e5e5e5] p-5">
            <h2 id="rules-toc" className="mb-3 text-base font-600 text-qblack">
              {t.rules.toc}
            </h2>
            <ol className="list-decimal space-y-1.5 pl-5 text-[15px]">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-qbrand underline-offset-4 hover:underline">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="mb-8 scroll-mt-24">
              <h2 className="mb-3 text-xl font-600 text-qblack">
                {i + 1}. {s.title}
              </h2>
              <ol className="space-y-2 text-base leading-relaxed text-[#444]">
                {s.items.map((item, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="shrink-0 tabular-nums text-[#888]">
                      {i + 1}.{j + 1}.
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </section>
          ))}

          <Link
            href="/akciya"
            className="mt-4 inline-flex min-h-[44px] items-center text-[15px] font-600 text-qbrand underline underline-offset-4 hover:text-qblack"
          >
            &larr; {t.rules.back}
          </Link>
        </article>
      </div>
    </Layout>
  );
}
