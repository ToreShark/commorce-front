// app/lib/ProductContext.tsx
'use client';
import React, { useState, useEffect, createContext } from 'react';
import { fetchProducts } from './data';
import { Product } from './interfaces/product.interface';

interface ProductContextType {
  products: Product[];
  productDetails: Product | null;
  fetchProductDetails: (slug: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType>({
  products: [],
  productDetails: null,
  fetchProductDetails: async () => {},
});

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productDetails, setProductDetails] = useState<Product | null>(null);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    fetchAllProducts();
  }, []);

  const fetchProductDetails = async (slug: string) => {
    try {
      const data = await fetchProductDetails(slug);
      if (data) {
        setProductDetails(data);
      } else {
        setProductDetails(null);
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      setProductDetails(null);
    }
  };

  return (
    <ProductContext.Provider value={{ products, productDetails, fetchProductDetails }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => React.useContext(ProductContext);
