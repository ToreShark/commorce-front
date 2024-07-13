// "use client";
import { fetchProductDetails } from "@/app/lib/data";
import ProductDetailComponent from "@/app/ui/productDetail";

export default async function ProductDetails({ params }: { params: { slug: string } }) {
    const productDetail = await fetchProductDetails(params.slug);
  return (
    <>
      <ProductDetailComponent product={productDetail} /> 
    </>
  );
}