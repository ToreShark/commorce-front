import type { Metadata } from "next";
import Link from "next/link";
import Layout from "@/app/components/Layout";
import { Breadcrumb } from "@/app/components/Shop";
import { SHOP } from "@/app/lib/seo";

/*
 * Условия — со слов владельца (26.10.2026). Бесплатной доставки от суммы нет:
 * в оформлении стоимость СДЭК всегда считается по тарифу, обещать иное нельзя.
 * Возврат через СДЭК — за счёт магазина. Меняя условия, поправьте и
 * returnPolicyJsonLd в lib/seo.ts.
 */

export const metadata: Metadata = {
  title: "Доставка и возврат",
  description: `Самовывоз в Атырау (${SHOP.street}), доставка СДЭК по Казахстану. Возврат в течение ${SHOP.returnDays} дней, обратная доставка СДЭК — за счёт магазина.`,
  alternates: { canonical: "/dostavka-i-vozvrat" },
};

const sections = [
  { id: "samovyvoz", title: "Самовывоз в Атырау" },
  { id: "sdek", title: "Доставка СДЭК по Казахстану" },
  { id: "oplata", title: "Оплата" },
  { id: "vozvrat", title: "Возврат и обмен" },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <h2 className="mb-3 text-xl font-600 text-qblack">{title}</h2>
      <div className="space-y-2 text-base leading-relaxed text-[#444]">{children}</div>
    </section>
  );
}

export default function DeliveryReturnsPage() {
  return (
    <Layout>
      <div className="container-x mx-auto">
        <Breadcrumb
          paths={[
            { name: "Главная", path: "/" },
            { name: "Доставка и возврат", path: "/dostavka-i-vozvrat" },
          ]}
        />
        <article className="max-w-[760px] pb-16">
          <h1 className="mb-6 text-[28px] font-700 text-qblack sm:text-[32px]">Доставка и возврат</h1>

          <nav aria-label="Содержание" className="mb-10 flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="text-qbrand underline-offset-4 hover:underline">
                {s.title}
              </a>
            ))}
          </nav>

          <Section id="samovyvoz" title="Самовывоз в Атырау">
            <p>
              Бесплатно. Адрес: {SHOP.address}. График: {SHOP.hours}.
            </p>
            <p>
              Время, когда удобно забрать заказ, согласуйте по телефону{" "}
              <a href={`tel:${SHOP.phone}`} className="text-qbrand underline">{SHOP.phoneDisplay}</a> или в{" "}
              <a href={SHOP.whatsapp} target="_blank" rel="noopener noreferrer" className="text-qbrand underline">WhatsApp</a>.
            </p>
          </Section>

          <Section id="sdek" title="Доставка СДЭК по Казахстану">
            <p>До пункта выдачи СДЭК или курьером до двери — в любой город, где работает СДЭК.</p>
            <p>
              Стоимость и срок рассчитываются по тарифу СДЭК при оформлении заказа, после выбора города и способа
              доставки. Вы видите итоговую сумму до оплаты; доставку оплачивает покупатель.
            </p>
          </Section>

          <Section id="oplata" title="Оплата">
            <p>Банковской картой онлайн на сайте или наличными при получении.</p>
            <p>
              Подробнее о защите платежей — на странице{" "}
              <Link href="/payment-security" className="text-qbrand underline">«Безопасная оплата»</Link>.
            </p>
          </Section>

          <Section id="vozvrat" title="Возврат и обмен">
            <p>
              Вернуть или обменять товар надлежащего качества можно в течение {SHOP.returnDays} дней с момента получения,
              если он не был в употреблении, сохранены товарный вид, ярлыки и бирки, а у вас есть номер заказа или
              документ об оплате.
            </p>
            <p>Как вернуть:</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                Напишите нам в{" "}
                <a href={SHOP.whatsapp} target="_blank" rel="noopener noreferrer" className="text-qbrand underline">WhatsApp</a>{" "}
                или позвоните по номеру{" "}
                <a href={`tel:${SHOP.phone}`} className="text-qbrand underline">{SHOP.phoneDisplay}</a> и назовите номер
                заказа.
              </li>
              <li>Принесите товар в магазин ({SHOP.street}) или отправьте его через СДЭК.</li>
              <li>
                <strong className="font-600 text-qblack">Возврат через СДЭК — за наш счёт:</strong> расходы на обратную
                доставку несёт магазин.
              </li>
            </ol>
            <p>
              Деньги возвращаем тем же способом, которым был оплачен заказ: на ту же карту (срок зачисления зависит от
              банка) или наличными, — в течение 10 дней после того, как товар поступит в магазин.
            </p>
            <p>
              По закону не подлежат возврату и обмену надлежащего качества нижнее бельё и чулочно-носочные изделия.
              Если товар оказался с браком, свяжитесь с нами — см.{" "}
              <Link href="/warranty" className="text-qbrand underline">«Гарантия»</Link>.
            </p>
          </Section>

          <p className="text-[15px] text-[#555]">
            Остались вопросы — <Link href="/kontakty" className="text-qbrand underline">контакты магазина</Link>.
          </p>
        </article>
      </div>
    </Layout>
  );
}
