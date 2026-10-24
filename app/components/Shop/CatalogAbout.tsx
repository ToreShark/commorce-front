import Link from "next/link";
import Category from "@/app/lib/interfaces/category.interace";
import { SHOP } from "@/app/lib/seo";

/**
 * Текст под сеткой товаров, как у Интертопа: о чём раздел и как купить в Атырау.
 * Поисковику нужен связный текст со словами «Атырау», «доставка», «оплата» —
 * одной сетки карточек для этого мало. Описание раздела берётся из админки
 * (Category.Description), второй абзац общий.
 */
export default function CatalogAbout({ category }: { category?: Category }) {
  const name = category?.name ?? "Одежда, обувь и товары для дома";
  const about = category?.description?.trim();

  return (
    <section className="mt-12 border-t border-qgray-border pt-8 text-[14px] leading-7 text-qgray lg:ml-[260px]">
      <h2 className="mb-3 text-[18px] font-700 text-qblack">{name} в Атырау</h2>
      {about && <p className="mb-3 whitespace-pre-line">{about}</p>}
      <p className="mb-3">
        В интернет-магазине CrysShop {category ? `«${category.name}»` : "товары"} можно
        заказать онлайн и забрать самостоятельно в Атырау — {SHOP.street}, бесплатно. В другие
        города Казахстана доставляем СДЭК: в пункт выдачи или курьером до двери.
      </p>
      <p>
        Оплата — картой онлайн или наличными. Размер выбирается на странице товара, а
        если сомневаетесь — напишите нам в WhatsApp, подскажем. Условия:{" "}
        <Link href="/offer" className="text-qblack underline hover:text-qbrand">
          оферта
        </Link>
        ,{" "}
        <Link href="/warranty" className="text-qblack underline hover:text-qbrand">
          гарантия и возврат
        </Link>
        .
      </p>
    </section>
  );
}
