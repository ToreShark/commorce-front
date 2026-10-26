import type { PromoConfig } from "./types";

/**
 * Настройки акции — единственное место, где меняются даты, приз и порог.
 *
 * Даты пишутся с поясом Алматы (+05:00): с марта 2024 года весь Казахстан
 * живёт по UTC+5. Конец акции — последняя секунда дня, а не полночь
 * следующего, чтобы на странице было «до 30 ноября», а не «до 1 декабря».
 */
export const PROMO_CONFIG: PromoConfig = {
  title: "Покупатель месяца",
  prizeName: "Смартфон iPhone 17, 256 ГБ",
  prizeShortName: "iPhone",
  // Заглушка: заменить своим фото приза (не рекламным изображением Apple)
  prizeImage: "/assets/images/promo/prize-placeholder.svg",
  startsAt: "2026-11-01T00:00:00+05:00",
  endsAt: "2026-11-30T23:59:59+05:00",
  resultsBy: "2026-12-25T23:59:59+05:00",
  freezeHoursBeforeEnd: 24,
  minOrderAmount: 15000,
  confirmDays: 14,
  rulesUrl: "/akciya/pravila",
  productCategoryIds: [
    "25a5d169-c2d6-4e93-c542-08dc233d9b16", // Женская одежда
    "c7e58dca-f60e-4a2e-b49b-08dbf99704a5", // Обувь женская
  ],
};

/** Сколько товаров показывать в блоке «Товары акции». */
export const PROMO_PRODUCTS_LIMIT = 8;
