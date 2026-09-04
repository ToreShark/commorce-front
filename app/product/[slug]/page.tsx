//app/product/[slug]/page.tsx
import { fetchProductDetails } from "@/app/lib/data";
import { ProductView } from "@/app/components/Product";
import { Metadata } from "next";
import { notFound } from "next/navigation";

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

  return <ProductView product={productDetail} />;
}
