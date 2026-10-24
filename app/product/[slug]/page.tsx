//app/product/[slug]/page.tsx
import { fetchProductDetails } from "@/app/lib/data";
import { ProductView } from "@/app/components/Product";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/app/components/JsonLd";
import { productJsonLd } from "@/app/lib/seo";

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

  return {
    title: productDetail.metaTitle || productDetail.title,
    description: productDetail.metaDescription || productDetail.description,
    keywords: productDetail.metaKeywords || "",
    // Один адрес на товар: ссылки с метками рекламы и ?category= не плодят дубли
    alternates: { canonical: `/product/${encodeURIComponent(canonicalSlug(slug))}` },
    openGraph: {
      title: productDetail.metaTitle || productDetail.title,
      description: productDetail.metaDescription || productDetail.description,
    },
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

  return (
    <>
      <JsonLd data={productJsonLd({ ...productDetail, slug: canonicalSlug(slug) })} />
      <ProductView product={productDetail} />
    </>
  );
}
