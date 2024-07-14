import { Product } from "./product.interface";

export interface ProductsResponse {
  totalItems: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  items: Product[];
}
