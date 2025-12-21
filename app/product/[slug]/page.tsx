//app/product/[slug]/page.tsx
import { fetchProductDetails } from "@/app/lib/data";
import { ProductView } from "@/app/components/Product";
import { Metadata } from "next";

interface RouteParams {
  params: {
    slug: string;
  };
}

// Dynamic metadata generation
export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const productDetail = await fetchProductDetails(params.slug);

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
  const productDetail = await fetchProductDetails(params.slug);

  if (!productDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-qblack mb-4">
            Товар не найден
          </h1>
          <p className="text-qgray mb-6">
            К сожалению, запрашиваемый товар не существует или был удален.
          </p>
          <a
            href="/shop"
            className="inline-block bg-qyellow text-qblack px-6 py-3 rounded font-medium hover:bg-qyellow/90 transition-colors"
          >
            Перейти в каталог
          </a>
        </div>
      </div>
    );
  }

  return <ProductView product={productDetail} />;
}
