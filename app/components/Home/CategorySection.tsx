"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchCategories } from "@/app/lib/data";
import Category from "@/app/lib/interfaces/category.interace";
import SectionTitle from "./SectionTitle";

interface CategorySectionProps {
  className?: string;
}

export default function CategorySection({ className }: CategorySectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    loadCategories();
  }, []);

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className={`category-section ${className || ""}`}>
      <div className="container-x mx-auto">
        <SectionTitle title="Категории" seeMoreUrl="/shop" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="category-card bg-white rounded-lg p-4 hover:shadow-lg transition-shadow group"
            >
              <div className="w-full aspect-square relative mb-3 bg-primarygray rounded-lg overflow-hidden">
                {category.imagePath ? (
                  <Image
                    src={`${apiUrl}${category.imagePath}`}
                    alt={category.name}
                    fill
                    className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-qgray">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="text-center text-sm font-600 text-qblack group-hover:text-qyellow transition-colors line-clamp-2">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
