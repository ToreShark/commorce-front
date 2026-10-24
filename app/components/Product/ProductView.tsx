"use client";

import { Product } from "@/app/lib/interfaces/product.interface";
import Layout from "@/app/components/Layout";
import { Breadcrumb } from "@/app/components/Shop";
import ProductGallery from "./ProductGallery";
import { activeDiscountPercent } from "@/app/lib/discount";
import ProductInfo from "./ProductInfo";
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
              {/* Как на Интертопе: галерея шире, справа — цена, размер и разделы */}
              <div className="product-view w-full lg:flex lg:items-start lg:gap-[40px] xl:gap-[56px]">
                {/* Gallery */}
                <div className="mb-6 lg:mb-0 lg:w-[56%]">
                  <ProductGallery
                    images={product.images || []}
                    productName={product.name || product.title}
                    discountPercent={activeDiscountPercent(product)}
                  />
                </div>

                {/* Info */}
                <div className="lg:sticky lg:top-6 lg:w-[44%]">
                  <ProductInfo product={product} />
                </div>
              </div>
            </div>
          </div>
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
