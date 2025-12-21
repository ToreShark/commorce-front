import { MetadataRoute } from "next";
import { fetchCategories, fetchCategoriesSitemap, fetchProducts } from "./lib/data";

// Force dynamic generation to avoid build-time API calls
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://next.crysshop.kz";

  try {
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
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return basic sitemap if API is unavailable
    return [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
      }
    ];
  }
}
