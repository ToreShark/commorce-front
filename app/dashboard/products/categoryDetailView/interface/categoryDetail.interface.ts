export interface CategoryDetailsProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string | null | undefined;
    imagePath?: string | undefined;
    lastModified?: string | undefined;
    metaTitle?: string | null | undefined;
    metaKeywords?: string | null | undefined;
    metaDescription?: string | null | undefined;
  };
  onEdit: () => void;
  onClose: () => void;
}
