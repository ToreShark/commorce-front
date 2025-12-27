import { Metadata } from "next";
import { getStaticPage } from "../lib/data";
import StaticPageContent from "../components/StaticPageContent";
import Layout from "@/app/components/Layout";
import { Breadcrumb } from "@/app/components/Shop";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("warranty");

  return {
    title: page?.metaTitle || "Гарантия и возврат - CrysShop",
    description: page?.metaDescription || "Информация о гарантии и возврате товаров",
    keywords: page?.metaKeywords,
  };
}

export default async function WarrantyPage() {
  const page = await getStaticPage("warranty");

  const breadcrumbPaths = [
    { name: "Главная", path: "/" },
    { name: "Гарантия и возврат", path: "/warranty" },
  ];

  if (!page) {
    return (
      <Layout>
        <div className="w-full bg-white pb-[60px]">
          <div className="w-full bg-[#F6F6F6] py-[40px] mb-[60px]">
            <div className="container-x mx-auto">
              <h1 className="text-[30px] font-bold text-qblack mb-2">Гарантия и возврат</h1>
              <Breadcrumb paths={breadcrumbPaths} className="mb-0" />
            </div>
          </div>
          <div className="container-x mx-auto">
            <p className="text-qgray">Запрашиваемая страница временно недоступна.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full bg-white pb-[60px]">
        <div className="w-full bg-[#F6F6F6] py-[40px] mb-[60px]">
          <div className="container-x mx-auto">
            <h1 className="text-[30px] font-bold text-qblack mb-2">{page.title}</h1>
            <Breadcrumb paths={breadcrumbPaths} className="mb-0" />
          </div>
        </div>

        <div className="container-x mx-auto">
          <StaticPageContent page={page} />

          <div className="mt-8">
            <Link href="/" className="text-qblack hover:text-qyellow transition-colors">
              &larr; На главную
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
