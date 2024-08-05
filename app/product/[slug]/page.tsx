// "use client";
import { Product } from "@/app/dashboard/products/interface/product.interface.table";
import { fetchProductDetails } from "@/app/lib/data";
import ProductDetailComponent from "@/app/ui/productDetail";
import { Metadata } from 'next'

interface RouteParams {
  params: {
    slug: string;
  };
}

// Динамическая функция для генерации метаданных
export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const productDetail = await fetchProductDetails(params.slug);

  if (!productDetail) {
    return {
      title: 'Product not found',
    };
  }

  return {
    title: productDetail.title,
    description: productDetail.description,
    keywords: productDetail.metaKeywords || "default, keywords",
    openGraph: {
      title: productDetail.metaTitle || productDetail.title,
      description: productDetail.metaDescription || productDetail.description,
    },
  };
}

// Страница продукта
export default async function ProductDetails({ params }: RouteParams) {
  const productDetail = await fetchProductDetails(params.slug);

  if (!productDetail) {
    return <div>Product not found</div>;
  }

  return (
    <>
      <ProductDetailComponent product={productDetail} />
    </>
  );
}
