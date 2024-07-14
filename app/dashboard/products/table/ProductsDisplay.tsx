import React from 'react';
import { Product } from "@/app/lib/interfaces/product.interface";

interface ProductsDisplayProps {
  products: Product[];
  selectedCategories: string[];
}

export default function ProductsDisplay({ products, selectedCategories }: ProductsDisplayProps) {
  return (
    <div>
      {selectedCategories.length > 0 && (
        <div>
          <h3>Products in Selected Categories:</h3>
          {products.length > 0 ? (
            <ul>
              {products.map((product) => (
                <li key={product.id}>
                  <h4>{product.title}</h4>
                  <p>Name: {product.name}</p>
                  <p>Description: {product.description}</p>
                  <p>SKU: {product.sku}</p>
                  <p>Price: ${product.price.toFixed(2)}</p>
                  <p>Category: {product.categoryName || 'N/A'}</p>
                  {product.image && (
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL}${product.image}`} 
                      alt={product.name} 
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                    />
                  )}
                  <p>Discount: {product.discountPercentage}%</p>
                  {product.discountStartDate && <p>Discount Start: {new Date(product.discountStartDate).toLocaleDateString()}</p>}
                  {product.discountEndDate && <p>Discount End: {new Date(product.discountEndDate).toLocaleDateString()}</p>}
                  <p>Created: {new Date(product.createdAt).toLocaleDateString()}</p>
                  <p>Last Modified: {new Date(product.lastModified).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No products found for the selected categories.</p>
          )}
        </div>
      )}
    </div>
  );
}