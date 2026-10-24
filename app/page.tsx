import type { Metadata } from "next";
import Layout from "./components/Layout";
import { HomePage } from "./components/Home";
import JsonLd from "./components/JsonLd";
import { storeJsonLd } from "./lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <Layout>
      {/* Магазин с адресом в Атырау — для карточки в поиске и карт */}
      <JsonLd data={storeJsonLd()} />
      <HomePage />
    </Layout>
  );
}
