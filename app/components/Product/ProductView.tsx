"use client";

import { Product } from "@/app/lib/interfaces/product.interface";
import Layout from "@/app/components/Layout";
import { Breadcrumb } from "@/app/components/Shop";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductTabs from "./ProductTabs";
import RelatedProducts from "./RelatedProducts";

interface ProductViewProps {
  product: Product;
}

export default function ProductView({ product }: ProductViewProps) {
  const breadcrumbPaths = [
    { name: "Главная", path: "/" },
    { name: "Каталог", path: "/shop" },
    ...(product.categoryName
      ? [
          {
            name: product.categoryName,
            path: `/shop?category=${product.categoryId}`,
          },
        ]
      : []),
    { name: product.name || product.title, path: "#" },
  ];

  return (
    <Layout>
      <div className="single-product-wrapper w-full">
        {/* Product View Section */}
        <div className="product-view-main-wrapper bg-white pt-[30px] w-full">
          {/* Breadcrumb */}
          <div className="breadcrumb-wrapper w-full">
            <div className="container-x mx-auto">
              <Breadcrumb paths={breadcrumbPaths} />
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full bg-white pb-[60px]">
            <div className="container-x mx-auto">
              <div className="product-view w-full lg:flex lg:space-x-[50px] xl:space-x-[70px]">
                {/* Gallery */}
                <div className="lg:w-1/2 mb-10 lg:mb-0">
                  <ProductGallery
                    images={product.images || []}
                    productName={product.name || product.title}
                    discountPercentage={product.discountPercentage}
                  />
                </div>

                {/* Info */}
                <div className="lg:w-1/2">
                  <ProductInfo product={product} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs (Description, Specs) */}
        <div className="product-des-wrapper w-full relative pb-[60px] bg-primarygray">
          <ProductTabs product={product} />
        </div>

        {/* Related Products */}
        <RelatedProducts
          categoryId={product.categoryId}
          currentProductId={product.id}
        />
      </div>
    </Layout>
  );
}
