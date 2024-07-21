export interface ProductImage {
  id: string;
  productId: string;
  imagePath: string;
  description?: string;
  uploadDate: string;
  imageType: string;
  order: number;
}
