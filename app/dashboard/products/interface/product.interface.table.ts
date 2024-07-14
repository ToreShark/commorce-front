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
    mainImagePath: string; 
    propertiesJson: string; 
    image?: string | null;
  }