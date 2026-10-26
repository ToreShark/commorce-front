import type { PromoConfig } from "./types";

/**
 * Настройки акции — единственное место, где меняются даты, приз и порог.
 *
 * Даты пишутся с поясом Алматы (+05:00): с марта 2024 года весь Казахстан
 * живёт по UTC+5. Конец акции — последняя секунда дня, а не полночь
 * следующего, чтобы на странице было «до 30 декабря», а не «до 31 декабря».
 */
export const PROMO_CONFIG: PromoConfig = {
  title: "Покупатель месяца",
  prizeName: "Смартфон iPhone 17 Pro Max, 256 ГБ",
  prizeShortName: "iPhone",
  // Фото с Pexels (pexels.com/photo/34624326, автор japy), лицензия Pexels —
  // коммерческое использование без указания автора. Кадр обрезан так, чтобы
  // логотип Apple не попал: на лендинге его быть не должно. Не рекламный снимок Apple
  prizeImage: "/assets/images/promo/prize-iphone.jpg",
  startsAt: "2026-10-26T00:00:00+05:00",
  endsAt: "2026-12-30T23:59:59+05:00",
  resultsBy: "2027-01-31T23:59:59+05:00",
  freezeHoursBeforeEnd: 24,
  minOrderAmount: 15000,
  confirmDays: 14,
  rulesUrl: "/akciya/pravila",
  // Дата редакции правил; совпадает с Promos.RulesVersion на бэкенде
  rulesVersion: "2026-10-26",
  productCategoryIds: [
    "25a5d169-c2d6-4e93-c542-08dc233d9b16", // Женская одежда
    "c7e58dca-f60e-4a2e-b49b-08dbf99704a5", // Обувь женская
  ],
};

/** Сколько товаров показывать в блоке «Товары акции». */
export const PROMO_PRODUCTS_LIMIT = 8;
