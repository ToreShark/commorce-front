"use client";
import Image from "next/image";
import Link from "@/node_modules/next/link";
import { fetchCategories, fetchCategoryDetails } from "../lib/data";
import Category from "../lib/interfaces/category.interace";
import { useEffect, useState } from "react";
import CategoryLinkComponent from "../ui/categoryLink";
import CategoryComponent from "../ui/category";

export default function Main() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<{
    [key: string]: any[];
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategoriesAndProducts() {
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);

        const productsByCategory: { [key: string]: any[] } = {};
        for (const category of fetchedCategories) {
          const categoryDetails = await fetchCategoryDetails(category.slug);
          if (categoryDetails && categoryDetails.products) {
            // Ограничиваем количество товаров до 4
            productsByCategory[category.slug] =
              categoryDetails.products.slice(0, 4);
          }
        }
        setCategoriesWithProducts(productsByCategory);
      } catch (err) {
        setError("Failed to load categories or products");
      } finally {
        setIsLoading(false);
      }
    }

    loadCategoriesAndProducts();
  }, []);

  if (isLoading) return <p>Loading categories...</p>;
  if (error) return <p>{error}</p>;
  if (!categories) return <p>No categories found</p>;

  return (
    <section className="mx-auto max-w-2xl px-4 sm:pb-6 lg:max-w-7xl lg:px-8">
      {/* Описание и рендеринг товаров категории */}
      <div className="mb-8 flex flex-wrap justify-between md:mb-16 lg:flex lg:items-start lg:justify-between lg:space-x-8">
        <div className="mb-6 flex w-full flex-col justify-center sm:mb-12 lg:mb-0 lg:w-1/3 lg:pb-24 lg:pt-48">
          <h1 className="mb-4 text-4xl font-bold text-black sm:text-5xl md:mb-8 md:text-6xl">
            Лучший товар, лучшая цена!
          </h1>
          <p className="max-w-md leading-relaxed text-gray-500 xl:text-lg">
            Только отборные и качественные товары для вас. Мы знаем, что вам
            нужно. Приходите и выбирайте.
          </p>
        </div>

        <div className="w-full">
          {Object.entries(categoriesWithProducts).map(([slug, products]) => (
            <div key={slug} className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {categories?.find(category => category.slug === slug)?.name}
              </h2>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-4">
                {products.map((product) => (
                  <Link key={product.id} href={`/product/${product.slug}`}>
                    <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200">
                      {product.images &&
                      product.images.length > 0 &&
                      product.images[0].imagePath ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}${product.images[0].imagePath}`}
                          alt={`Image of ${product.name}`}
                          className="h-full w-full object-cover object-center"
                          width={300}
                          height={300}
                          priority
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          No image available
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Скрыть на мобильных, показать на десктопе */}
      <div className="lg:block hidden">
        <CategoryLinkComponent categories={categories} />
      </div>
    </section>
  );
}