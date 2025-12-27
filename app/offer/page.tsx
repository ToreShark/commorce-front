import { Metadata } from "next";
import { getOfferDocumentUrl } from "../lib/data";
import Layout from "@/app/components/Layout";
import { Breadcrumb } from "@/app/components/Shop";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Публичная оферта - CrysShop",
  description: "Публичный договор-оферта интернет-магазина CrysShop",
  keywords: "оферта, договор, публичная оферта, условия продажи",
};

export default function OfferPage() {
  const pdfUrl = getOfferDocumentUrl();

  const breadcrumbPaths = [
    { name: "Главная", path: "/" },
    { name: "Публичная оферта", path: "/offer" },
  ];

  return (
    <Layout>
      <div className="w-full bg-white pb-[60px]">
        <div className="w-full bg-[#F6F6F6] py-[40px] mb-[60px]">
          <div className="container-x mx-auto">
            <h1 className="text-[30px] font-bold text-qblack mb-2">Публичная оферта</h1>
            <Breadcrumb paths={breadcrumbPaths} className="mb-0" />
          </div>
        </div>

        <div className="container-x mx-auto">
          <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
            <p className="text-qgray">
              Договор публичной оферты интернет-магазина CrysShop
            </p>
            <a
              href={pdfUrl}
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-qyellow text-qblack rounded hover:bg-qyellow/80 transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Скачать PDF
            </a>
          </div>

          <div className="w-full bg-[#F6F6F6] rounded-lg overflow-hidden" style={{ height: "80vh" }}>
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="Публичная оферта"
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/payment" className="text-qblack hover:text-qyellow transition-colors">
              &larr; Оплата
            </Link>
            <span className="text-qgray">|</span>
            <Link href="/privacy-policy" className="text-qblack hover:text-qyellow transition-colors">
              Политика конфиденциальности
            </Link>
            <span className="text-qgray">|</span>
            <Link href="/warranty" className="text-qblack hover:text-qyellow transition-colors">
              Гарантия и возврат
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
