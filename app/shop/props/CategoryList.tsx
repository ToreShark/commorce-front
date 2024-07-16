import React from 'react';

interface CategoryListProps {
  categories: { id: string; name: string | undefined }[];
  selectedCategoryId: string;
  handleFilterUpdate: (categoryId: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, selectedCategoryId, handleFilterUpdate }) => {
  return (
    <div className="mb-4">
      <div className="grid gap-2">
        {categories.map(({ id, name }) => (
          <button
            key={id}
            onClick={() => handleFilterUpdate(id)}
            className={`py-2 px-4 rounded-md border ${
              selectedCategoryId === id
                ? "bg-indigo-500 text-white"
                : "bg-white text-gray-800"
            } shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;