import { fetchProducts } from "@/app/lib/data";
import type { Product } from "@/app/lib/interfaces/product.interface";

/**
 * Товары акции — настоящие товары каталога из категорий акции.
 * По кругу из каждой категории, чтобы обувь не потерялась за одеждой.
 * Порядок внутри категории — как отдаёт бэкенд (по убыванию цены): для акции
 * за самый большой чек это как раз то, что нужно показать первым.
 */
export function interleave(lists: Product[][], limit: number): Product[] {
  const result: Product[] = [];
  const seen = new Set<string>();
  for (let i = 0; result.length < limit; i++) {
    let added = false;
    for (const list of lists) {
      const product = list[i];
      if (!product) continue;
      added = true;
      if (seen.has(product.id) || !hasImage(product)) continue;
      seen.add(product.id);
      result.push(product);
      if (result.length >= limit) break;
    }
    if (!added) break;
  }
  return result;
}

function hasImage(product: Product): boolean {
  return Boolean(product.images?.[0]?.imagePath || product.image);
}

export async function getPromoProducts(categoryIds: string[], limit: number): Promise<Product[]> {
  const lists = await Promise.all(
    categoryIds.map((id) => fetchProducts(undefined, undefined, id).catch(() => null))
  );
  return interleave(lists.map((l) => l ?? []), limit);
}

/** Полный адрес первого фото товара — как его строит ProductCard. */
export function productImageUrl(product: Product): string | null {
  const path = product.images?.[0]?.imagePath ?? product.image;
  return path ? `${process.env.NEXT_PUBLIC_API_URL || ""}${path}` : null;
}
