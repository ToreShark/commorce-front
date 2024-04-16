// CategoryLinkComponent.tsx
import React from 'react';
import Link from 'next/link';
import Category from '../lib/interfaces/category.interace';

interface CategoryLinkProps {
  categories: Category[];
}

const CategoryLinkComponent: React.FC<CategoryLinkProps> = ({ categories }) => {
  return (
    <div className="flex flex-col items-center justify-start md:justify-between gap-8 md:flex-row mb-12 w-full md:mb-16 lg:w-2/3">
      <div className="flex h-12 divide-x overflow-hidden rounded-lg border">
        {categories.map((category, index) => (
          <Link
            key={category.slug}
            href={`/${category.slug}`}
            className="flex items-center justify-center px-4 text-gray-500 transition duration-100 hover:bg-gray-100 active:bg-gray-200"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryLinkComponent;
