import type { Product } from "@/app/lib/interfaces/product.interface";
import type { PromoTexts } from "@/app/lib/promo/texts";
import { PricingClockProvider } from "@/app/lib/PricingClock";
import ProductCard from "@/app/components/Home/ProductCard";
import SectionTitle from "@/app/components/Home/SectionTitle";
import Reveal from "@/app/components/Reveal";

interface PromoProductsProps {
  products: Product[];
  texts: PromoTexts["products"];
}

/**
 * Сетка товаров теми же карточками, что на главной. Карточки считают скидку
 * от «сейчас», поэтому, как и на /shop, — через PricingClockProvider: иначе
 * разметка сервера и браузера разойдётся на границе дня скидки.
 */
export default function PromoProducts({ products, texts }: PromoProductsProps) {
  return (
    <section id="tovary" aria-label={texts.title} className="container-x mx-auto scroll-mt-6">
      <SectionTitle title={texts.title} seeMoreUrl="/shop" />
      {products.length === 0 ? (
        <p className="border border-qgray-border bg-primarygray px-6 py-10 text-center text-[15px] text-qblack">
          {texts.empty}
        </p>
      ) : (
        <PricingClockProvider serverNow={new Date().toISOString()}>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product, index) => (
              <Reveal key={product.id} delay={Math.min(index, 7) * 60}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </PricingClockProvider>
      )}
    </section>
  );
}
