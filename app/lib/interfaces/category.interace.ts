export default interface Category {
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