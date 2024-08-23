import React from 'react';
import Image from 'next/image';
import Category from '../lib/interfaces/category.interace';

interface CategoryProps {
  categories: Category[];
}

const CategoryComponent: React.FC<CategoryProps> = ({ categories }) => {
  return (
    <div className="mb-12 flex w-full flex-wrap justify-between md:mb-16 lg:w-full">
      {categories.length > 0 && (
        <div className="relative z-10 overflow-hidden rounded-lg bg-gray-100 shadow-lg w-full lg:w-[48%] mb-4 lg:mb-0">
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL}${categories[0].imagePath}`}
            alt={`Image of ${categories[0].name}`}
            className="h-full w-full object-cover object-center"
            priority
            layout="responsive"
            width={500}
            height={500}
          />
        </div>
      )}

      {categories.length > 1 && (
        <div className="overflow-hidden rounded-lg bg-gray-100 shadow-lg w-full lg:w-[48%]">
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL}${categories[1].imagePath}`}
            alt={`Image of ${categories[1].name}`}
            className="h-full w-full object-cover object-center"
            priority
            layout="responsive"
            width={500}
            height={500}
          />
        </div>
      )}
    </div>
  );
};

export default CategoryComponent;