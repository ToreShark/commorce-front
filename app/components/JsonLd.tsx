import { jsonLdString } from "@/app/lib/seo";

/** Микроразметка schema.org. Серверный компонент: разметка сразу в HTML. */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Текст экранирован в jsonLdString — «<» не может закрыть тег
      dangerouslySetInnerHTML={{ __html: jsonLdString(data) }}
    />
  );
}
