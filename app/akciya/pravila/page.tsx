import type { Metadata } from "next";
import Link from "next/link";
import Layout from "@/app/components/Layout";
import { Breadcrumb } from "@/app/components/Shop";
import { getPromoTexts } from "@/app/lib/promo/texts";

// Заглушка до этапа 5: в индекс не пускаем, пока правил нет
export const metadata: Metadata = {
  title: getPromoTexts().rules.title,
  robots: { index: false, follow: true },
};

export default function PromoRulesPage() {
  const t = getPromoTexts();

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
        <h1 className="mb-4 text-[28px] font-700 text-qblack sm:text-[32px]">{t.rules.title}</h1>
        <p className="max-w-[720px] text-base leading-relaxed text-[#555]">{t.rules.stub}</p>
        <Link
          href="/akciya"
          className="mt-6 inline-flex min-h-[44px] items-center text-[15px] font-600 text-qbrand underline underline-offset-4 hover:text-qblack"
        >
          &larr; {t.rules.back}
        </Link>
        <p className="mt-10 max-w-[720px] text-xs leading-relaxed text-[#666]">{t.footer.disclaimer}</p>
      </div>
    </Layout>
  );
}
