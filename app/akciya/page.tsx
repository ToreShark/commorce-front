import type { Metadata } from "next";
import Layout from "@/app/components/Layout";
import { Breadcrumb } from "@/app/components/Shop";
import Reveal from "@/app/components/Reveal";
import PromoHero from "@/app/components/Promo/PromoHero";
import HowItWorks from "@/app/components/Promo/HowItWorks";
import Leaderboard from "@/app/components/Promo/Leaderboard";
import PromoProducts from "@/app/components/Promo/PromoProducts";
import TrustRow from "@/app/components/Promo/TrustRow";
import PromoFaq from "@/app/components/Promo/PromoFaq";
import PromoFinal from "@/app/components/Promo/PromoFinal";
import { getPromoData } from "@/app/lib/promo/data";
import { getPromoProducts, productImageUrl } from "@/app/lib/promo/products";
import { PROMO_CONFIG, PROMO_PRODUCTS_LIMIT } from "@/app/lib/promo/config";
import { formatLongDate } from "@/app/lib/promo/format";
import { getPromoTexts } from "@/app/lib/promo/texts";

// Табло и заморозка зависят от времени: страница пересобирается раз в минуту,
// а не на каждый заход из рекламы
export const revalidate = 60;

const LOOK_PLACEHOLDER = "/assets/images/promo/look-placeholder.svg";

export function generateMetadata(): Metadata {
  const t = getPromoTexts().meta;
  const title = t.title(PROMO_CONFIG.prizeShortName);
  const description = t.description(PROMO_CONFIG.prizeName, formatLongDate(PROMO_CONFIG.endsAt));
  // Картинку превью отдаёт соседний opengraph-image.tsx
  return {
    title,
    description,
    alternates: { canonical: "/akciya" },
    openGraph: { type: "website", url: "/akciya", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PromoPage() {
  const texts = getPromoTexts();
  const { config, leaderboard, frozen } = await getPromoData();
  const products = await getPromoProducts(config.productCategoryIds, PROMO_PRODUCTS_LIMIT);
  const collectionImage = (products[0] && productImageUrl(products[0])) || LOOK_PLACEHOLDER;

  return (
    <Layout>
      <main className="w-full">
        <div className="container-x mx-auto">
          <Breadcrumb
            paths={[
              { name: texts.breadcrumb.home, path: "/" },
              { name: texts.breadcrumb.current, path: "/akciya" },
            ]}
          />
        </div>

        <div className="space-y-16 sm:space-y-24">
          <PromoHero config={config} texts={texts} collectionImage={collectionImage} />
          <Reveal>
            <HowItWorks config={config} texts={texts.steps} />
          </Reveal>
          <Reveal>
            <Leaderboard entries={leaderboard} frozen={frozen} texts={texts.board} />
          </Reveal>
          <PromoProducts products={products} texts={texts.products} />
          <TrustRow texts={texts.trust} />
          <Reveal>
            <PromoFaq config={config} texts={texts.faq} />
          </Reveal>
          <Reveal>
            <PromoFinal config={config} texts={texts} />
          </Reveal>
        </div>
      </main>
    </Layout>
  );
}
