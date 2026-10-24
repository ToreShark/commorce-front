//app/product/[slug]/page.tsx
import { fetchProductDetails } from "@/app/lib/data";
import { ProductView } from "@/app/components/Product";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/app/components/JsonLd";
import { productJsonLd, productSeo } from "@/app/lib/seo";
import { PricingClockProvider } from "@/app/lib/PricingClock";

/**
 * Слаг для canonical и разметки — из адреса страницы, а не из ответа API:
 * /Product/IndexDetail не заполняет поле slug (приходит null), и canonical
 * указывал на /product/null. Next отдаёт параметр то декодированным, то нет —
 * приводим к одному виду.
 */
function canonicalSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

// Dynamic metadata generation
export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const productDetail = await fetchProductDetails(slug);

  if (!productDetail) {
    return {
      title: "Товар не найден",
    };
  }

  const seo = productSeo(productDetail);
  const url = `/product/${encodeURIComponent(canonicalSlug(slug))}`;
  // og:image — прямой адрес оригинала, а не /_next/image: мессенджеры и
  // поисковик забирают его сразу, без подготовки картинки на сервере
  const images = seo.image ? [{ url: seo.image, alt: productDetail.name || productDetail.title }] : undefined;

  return {
    // absolute: шаблон «%s | CrysShop» из layout не нужен — бренд уже в заголовке
    title: { absolute: seo.title },
    description: seo.description,
    keywords: productDetail.metaKeywords || "",
    // Один адрес на товар: ссылки с метками рекламы и ?category= не плодят дубли
    alternates: { canonical: url },
    openGraph: { title: seo.title, description: seo.description, url, images },
    twitter: { title: seo.title, description: seo.description, images: seo.image ? [seo.image] : undefined },
  };
}

// Product page
export default async function ProductDetails({ params }: RouteParams) {
  const { slug } = await params;
  const productDetail = await fetchProductDetails(slug);

  if (!productDetail) {
    // notFound() отдаёт HTTP 404 и рендерит app/product/not-found.tsx.
    // Возврат вёрстки прямо отсюда давал 200 на любой несуществующий slug.
    notFound();
  }

  // Один момент для цены в разметке, в HTML и при сверке в браузере
  const now = new Date();
  return (
    <PricingClockProvider serverNow={now.toISOString()}>
      <JsonLd data={productJsonLd({ ...productDetail, slug: canonicalSlug(slug) }, now)} />
      <ProductView product={productDetail} />
    </PricingClockProvider>
  );
}
