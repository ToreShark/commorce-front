"use client";
import Image from "next/image";
import { useCategories } from "@/app/lib/CategoryContext";
import Link from "@/node_modules/next/link";
import { encodeImagePath } from "../services/encodeImagePath";
import { fetchCategories } from "../lib/data";
import CategoryComponent from "../ui/category";
import CategoryLinkComponent from "../ui/categoryLink";

export default async function Main() {
  const category = await fetchCategories();
  if (!category) {
    return <p>Loading categories failed...</p>;  // Or other error handling approach
  }

  return (
    <section className="mx-auto max-w-2xl px-4 sm:pb-6 lg:max-w-7xl lg:px-8">
      <div className="mb-8 flex flex-wrap justify-between md:mb-16">
        <div className="mb-6 flex w-full flex-col justify-center sm:mb-12 lg:mb-0 lg:w-1/3 lg:pb-24 lg:pt-48">
          <h1 className="mb-4 text-4xl font-bold text-black sm:text-5xl md:mb-8 md:text-6xl">
            Top Fashion for a top price!
          </h1>
          <p className="max-w-md leading-relaxed text-gray-500 xl:text-lg">
            We sell only the most exclusive and high quality products for you.
            We are the best so come and shop with us.
          </p>
        </div>

        <CategoryComponent categories={category} />

      </div>

        <CategoryLinkComponent categories={category} />

    </section>
  );
}
