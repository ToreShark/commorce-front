"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import "@/app/product/new/whatsApp.scss";

// Номер магазина. Тот же, что в шапке, в мобильном меню и в appsettings.json
// бэкенда — держим в одном месте, чтобы он не разъезжался по файлам.
// До 04.09.2026 здесь стоял 77058887876: он не встречался больше нигде
// в проекте и остался от первой версии кнопки (август 2024).
const SHOP_WHATSAPP = "77019654666";

interface WhatsAppOrderButtonProps {
  /** Название товара — подставляется в текст сообщения. */
  productName: string;
}

/**
 * Плавающая кнопка «заказать в WhatsApp» на карточке товара.
 *
 * Зачем: на телефоне контакты магазина не видно вовсе. TopBar скрыт
 * (`hidden sm:block`), Navbar скрыт (`lg:block hidden`), и остаётся только
 * ссылка в самом низу гамбургер-меню. Покупателю, который хочет просто
 * написать и заказать, до неё не добраться.
 *
 * Сообщение уходит с названием товара и ссылкой на него, чтобы менеджер
 * сразу видел предмет разговора и не переспрашивал.
 */
export default function WhatsAppOrderButton({
  productName,
}: WhatsAppOrderButtonProps) {
  const pathname = usePathname();

  // origin берём из окна, но компонент рендерится и на сервере — там window
  // недоступен, поэтому подставляем боевой адрес. Ссылка нужна только внутри
  // текста сообщения, до гидратации по ней никто не кликает.
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://crysshop.kz";

  const message = `Здравствуйте! Хочу заказать: ${productName} — ${origin}${pathname}`;

  return (
    <a
      href={`https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-button"
      aria-label={`Заказать «${productName}» в WhatsApp`}
      title="Заказать в WhatsApp"
    >
      <Image
        src="/whatsapp (1).png"
        alt=""
        width={32}
        height={32}
        aria-hidden="true"
      />
    </a>
  );
}
