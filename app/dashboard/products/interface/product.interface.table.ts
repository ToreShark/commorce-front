import { ProductImage } from "./productImage.interface";
import { Property } from "./productProperty.interface";

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
  discountPercentage?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  slug: string;
  mainImagePath: string;
  propertiesJson: string;
  viewCount: number;
  // Добавляем мета поля для SEO
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
  images: ProductImage[];
  properties: Property[];
}