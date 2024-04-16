// CategoryComponent.tsx
import React from 'react';
import Image from 'next/image';
import Category from '../lib/interfaces/category.interace';

interface CategoryProps {
  categories: Category[];
}

const CategoryComponent: React.FC<CategoryProps> = ({ categories }) => {
  return (
    <div className="mb-12 flex w-full md:mb-16 lg:w-2/3">
      {categories.length > 0 && (
        <div className="relative left-12 top-12 z-10 -ml-12 overflow-hidden rounded-lg bg-gray-100 shadow-lg md:left-16 md:top-16 lg:ml-0">
          <Image
            src={`https://localhost:7264${categories[0].imagePath}`}
            alt={`Image of ${categories[0].name}`}
            className="h-full w-full object-cover object-center"
            priority
            width={500}
            height={500}
          />
        </div>
      )}

      {categories.length > 1 && (
        <div className="overflow-hidden rounded-lg bg-gray-100 shadow-lg">
          <Image
            src={`https://localhost:7264${categories[1].imagePath}`}
            alt={`Image of ${categories[1].name}`}
            className="h-full w-full object-cover object-center"
            width={500}
            height={500}
            priority
          />
        </div>
      )}
    </div>
  );
};

export default CategoryComponent;
