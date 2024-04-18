// app/lib/CategoryContext.tsx
'use client';
import React, { useState, useEffect, createContext } from 'react';
import { fetchCategories, fetchCategoryDetails } from './data';
import Category from './interfaces/category.interace';

interface CategoryContextType {
  categories: Category[];
  categoryDetails: Category | null;
  fetchCategoryDetails: (slug: string) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType>({
  categories: [],
  categoryDetails: null,
  fetchCategoryDetails: async () => {},
});

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // const [categories, setCategories] = useState<Category[]>([]);
  // const [categoryDetails, setCategoryDetails] = useState<Category | null>(null);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const data = await fetchCategories();
  //       setCategories(data);
  //     } catch (error) {
  //       console.error('Failed to fetch categories:', error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  // const fetchCategoryDetails = async (slug: string) => {
  //   try {
  //     const data = await fetchCategoryDetails(slug);
  //     if (data) {
  //       setCategoryDetails(data);
  //     } else {
  //       setCategoryDetails(null);
  //     }
  //   } catch (error) {
  //     console.error('Failed to fetch category details:', error);
  //     setCategoryDetails(null);
  //   }
  // };

  return (
    // <CategoryContext.Provider value={{ categories, categoryDetails, fetchCategoryDetails }}>
    //   {children}
    // </CategoryContext.Provider>
    <>
    </>
  );
};

export const useCategories = () => React.useContext(CategoryContext);