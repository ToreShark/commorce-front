import type { Metadata } from "next";
import { fetchCategories, fetchProducts } from "@/app/lib/data";
import Category from "@/app/lib/interfaces/category.interace";
import { Product } from "@/app/lib/interfaces/product.interface";
import { SHOP, categorySeo } from "@/app/lib/seo";
import { PricingClockProvider } from "@/app/lib/PricingClock";
import ShopPage from "./ShopPage";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

function findCategory(param: string, categories: Category[]): Category | undefined {
  const key = param.toLowerCase();
  return categories.find((c) => c.slug?.toLowerCase() === key || c.id?.toLowerCase() === key);
}

/**
 * Заголовок и canonical каталога. Canonical — только категория: ?size=,
 * ?sort=, ?price_from= и прочие фильтры для Google дубли одной страницы.
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
    const { title, description } = categorySeo(category);
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

/**
 * Товары и категории грузятся на сервере и уходят в HTML: без этого страница
 * без JavaScript была пустой («Loading…»), и поисковику нечего было ранжировать.
 * Фильтры и сортировка дальше работают в браузере, как раньше.
 * Запросы те же, что в generateMetadata, — Next отдаёт их из одного кэша запроса.
 */
export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const search = first(params.search).trim();

  const [products, categories] = await Promise.all([
    fetchProducts(undefined, undefined, "", search).catch(() => null),
    fetchCategories().catch(() => null) as Promise<Category[] | null>,
  ]);

  // Бэкенд не ответил — не отдаём пустой каталог как настоящий: пусть страница
  // загрузит данные сама в браузере, как делала до серверного рендера
  const initial =
    products && categories
      ? { products: products as Product[], categories, search: first(params.search) }
      : undefined;

  // Без <Suspense>: страница динамическая (читает searchParams), и граница была
  // не нужна — зато с ней Next отдавал весь каталог потоком в скрытом блоке,
  // а на месте страницы в HTML стояла пустая заглушка
  // Момент расчёта скидок уходит в браузер — он сверит разметку по тому же времени
  return (
    <PricingClockProvider serverNow={new Date().toISOString()}>
      <ShopPage initial={initial} />
    </PricingClockProvider>
  );
}
