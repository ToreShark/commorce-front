// app/lib/CategoryContext.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { fetchCategories } from './data';

interface Category {
  name: string;
  slug: string;
  description?: string;
  parentCategoryId?: null | string;
  parentCategory?: null | any;
  imagePath?: string;
  childCategories?: null | any[];
  products?: null | any[];
  lastModified?: string;
  metaTitle?: string | null;
  metaKeywords?: string | null;
  metaDescription?: string | null;
  id: string;
}

interface CategoryContextType {
  categories: Category[];
}

const CategoryContext = React.createContext<CategoryContextType>({ categories: [] });

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCategories();
        console.log(data.length);
        console.log('result', data);
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => React.useContext(CategoryContext);