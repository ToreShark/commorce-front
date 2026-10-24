import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchCategories } from "@/app/lib/data";
import Category from "@/app/lib/interfaces/category.interace";
import { SHOP } from "@/app/lib/seo";
import ShopPage from "./ShopPage";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

function findCategory(param: string, categories: Category[]): Category | undefined {
  const key = param.toLowerCase();
  return categories.find((c) => c.slug?.toLowerCase() === key || c.id?.toLowerCase() === key);
}

/**
 * Заголовок и canonical каталога. Сама страница — клиентская (фильтры живут
 * в адресе), поэтому метаданные отдаёт этот серверный слой.
 *
 * Canonical — только категория: ?size=, ?sort=, ?price_from= и прочие
 * фильтры для Google дубли одной и той же страницы.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const search = first(params.search).trim();
  const categoryParam = first(params.category).trim();

  // Выдача поиска не страница для индекса: бесконечное число адресов
  if (search) {
    return {
      title: `Поиск: «${search}»`,
      alternates: { canonical: "/shop" },
      robots: { index: false, follow: true },
    };
  }

  let category: Category | undefined;
  if (categoryParam) {
    const categories: Category[] = await fetchCategories().catch(() => []);
    category = findCategory(categoryParam, categories || []);
  }

  if (category) {
    const title = category.metaTitle?.trim() || `${category.name} — купить в Атырау`;
    const description =
      category.metaDescription?.trim() ||
      `${category.name} в интернет-магазине CrysShop. Самовывоз в Атырау (${SHOP.street}), доставка СДЭК по Казахстану, оплата картой или наличными.`;
    return {
      title,
      description,
      alternates: { canonical: `/shop?category=${encodeURIComponent(category.slug)}` },
      openGraph: { title, description },
    };
  }

  return {
    title: "Каталог — одежда, обувь и товары для дома в Атырау",
    description: `Каталог CrysShop: женская и детская одежда, обувь, сумки, посуда, ковры и мебель. Самовывоз в Атырау (${SHOP.street}), доставка СДЭК по Казахстану.`,
    alternates: { canonical: "/shop" },
  };
}

export default function Page() {
  // useSearchParams в клиентской части требует границы Suspense
  return (
    <Suspense>
      <ShopPage />
    </Suspense>
  );
}
