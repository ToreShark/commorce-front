"use client";
import Image from "next/image";
import { useCategories } from "@/app/lib/CategoryContext";
import Link from "@/node_modules/next/link";
import { encodeImagePath } from "../services/encodeImagePath";
import { fetchCategories } from "../lib/data";
import CategoryComponent from "../ui/category";
import CategoryLinkComponent from "../ui/categoryLink";
import Category from "../lib/interfaces/category.interace";
import { useEffect, useState } from "react";

export default function Main() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        setError('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, []);

  if (isLoading) return <p>Loading categories...</p>;
  if (error) return <p>{error}</p>;
  if (!categories) return <p>No categories found</p>;

  return (
    <section className="mx-auto max-w-2xl px-4 sm:pb-6 lg:max-w-7xl lg:px-8">
      <div className="mb-8 flex flex-wrap justify-between md:mb-16">
        <div className="mb-6 flex w-full flex-col justify-center sm:mb-12 lg:mb-0 lg:w-1/3 lg:pb-24 lg:pt-48">
          <h1 className="mb-4 text-4xl font-bold text-black sm:text-5xl md:mb-8 md:text-6xl">
            Лучший товар, лучшая цена!
          </h1>
          <p className="max-w-md leading-relaxed text-gray-500 xl:text-lg">
            Только отборные и качественные товары для вас.
            Мы знаем, что вам нужно. Приходите и выбирайте.
          </p>
        </div>

        {/* <CategoryComponent categories={categories} /> */}

      </div>

        {/* <CategoryLinkComponent categories={categories} /> */}

    </section>
  );
}
