import { MetadataRoute } from "next";
import { fetchCategories, fetchCategoriesSitemap, fetchProducts } from "./lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://next.crysshop.kz";
  const categories = await fetchCategoriesSitemap();
  const products = await fetchProducts();

  const urls: MetadataRoute.Sitemap = [];

  // Добавление категорий в sitemap
  categories.forEach((category: { slug: string }) => {
    urls.push({
      url: `${baseUrl}/Category/Index/${category.slug}`,
      lastModified: new Date().toISOString(),
    });
  });

  return urls;
}
