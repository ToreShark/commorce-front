import type { Metadata } from "next";
import Link from "next/link";
import Layout from "@/app/components/Layout";
import { Breadcrumb } from "@/app/components/Shop";
import { SHOP } from "@/app/lib/seo";

export const metadata: Metadata = {
  title: "Контакты",
  description: `Магазин ${SHOP.name}: ${SHOP.address}, ${SHOP.hours}. Телефон и WhatsApp ${SHOP.phoneDisplay}.`,
  alternates: { canonical: "/kontakty" },
};

const MAP_URL = `https://2gis.kz/atyrau/search/${encodeURIComponent("Орыгали Смагулова 22")}`;

export default function ContactsPage() {
  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: "Телефон",
      value: <a href={`tel:${SHOP.phone}`} className="text-qbrand underline">{SHOP.phoneDisplay}</a>,
    },
    {
      label: "WhatsApp",
      value: (
        <a href={SHOP.whatsapp} target="_blank" rel="noopener noreferrer" className="text-qbrand underline">
          Написать в WhatsApp
        </a>
      ),
    },
    { label: "Город", value: SHOP.city },
    {
      label: "Самовывоз",
      value: (
        <>
          {SHOP.street}{" "}
          <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap text-qbrand underline">
            на карте 2ГИС
          </a>
        </>
      ),
    },
    { label: "График работы", value: SHOP.hours },
  ];

  return (
    <Layout>
      <div className="container-x mx-auto">
        <Breadcrumb
          paths={[
            { name: "Главная", path: "/" },
            { name: "Контакты", path: "/kontakty" },
          ]}
        />
        <article className="max-w-[760px] pb-16">
          <h1 className="mb-6 text-[28px] font-700 text-qblack sm:text-[32px]">Контакты</h1>
          <dl className="divide-y divide-[#EDEDED] border-y border-[#EDEDED]">
            {rows.map((r) => (
              <div key={r.label} className="grid gap-1 py-4 sm:grid-cols-[200px_1fr] sm:gap-6">
                <dt className="text-[14px] uppercase tracking-wide text-qgray">{r.label}</dt>
                <dd className="text-[16px] text-qblack">{r.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-[15px] text-[#555]">
            Условия доставки и возврата —{" "}
            <Link href="/dostavka-i-vozvrat" className="text-qbrand underline">на отдельной странице</Link>.
          </p>
        </article>
      </div>
    </Layout>
  );
}
