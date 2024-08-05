// interfaces/product.ts

export interface ProductImage {
  id: string; 
  imagePath: string; 
  order: number; 
}

export interface Product {
  id: string;
  title: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  categoryName?: string; 
  categoryId: string;
  lastModified: string;
  createdAt: string;
  discountPercentage: number;
  discountStartDate?: string; 
  discountEndDate?: string; 
  slug: string;
  images: ProductImage[]; 
  propertiesJson: string; 
  image?: string | null;
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
}
