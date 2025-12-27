import { Metadata } from "next";
import { getStaticPage } from "../lib/data";
import StaticPageContent from "../components/StaticPageContent";
import Layout from "@/app/components/Layout";
import { Breadcrumb } from "@/app/components/Shop";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("privacy-policy");

  return {
    title: page?.metaTitle || "Политика конфиденциальности - CrysShop",
    description: page?.metaDescription || "Соглашение об обработке персональных данных",
    keywords: page?.metaKeywords,
  };
}

export default async function PrivacyPolicyPage() {
  const page = await getStaticPage("privacy-policy");

  const breadcrumbPaths = [
    { name: "Главная", path: "/" },
    { name: "Политика конфиденциальности", path: "/privacy-policy" },
  ];

  if (!page) {
    return (
      <Layout>
        <div className="w-full bg-white pb-[60px]">
          <div className="w-full bg-[#F6F6F6] py-[40px] mb-[60px]">
            <div className="container-x mx-auto">
              <h1 className="text-[30px] font-bold text-qblack mb-2">Политика конфиденциальности</h1>
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

          <div className="mt-8 p-6 bg-[#F6F6F6] rounded-lg">
            <h3 className="text-[18px] font-semibold text-qblack mb-4">Документы</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/offer" className="text-qblack hover:text-qyellow transition-colors">
                  Публичная оферта
                </Link>
              </li>
            </ul>
          </div>

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
