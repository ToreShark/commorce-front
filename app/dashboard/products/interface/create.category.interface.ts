export interface CreateCategory {
    name: string;
    slug: string;
    metaTitle: string;
    metaKeywords: string;
    metaDescription: string;
    description: string;
    image: File | null;
};