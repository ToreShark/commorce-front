/**
 * Типы акции «Покупатель месяца». Ответы API (контракт — I_STORE/docs/promo-pokupatel-mesyaca.md)
 * разбирает api.ts, компоненты зависят только от этих типов.
 */

/** pending — чек на проверке (срок возврата не истёк), confirmed — подтверждён. */
export type EntryStatus = "pending" | "confirmed";

export interface LeaderboardEntry {
  /** Место на табло — его считает сервер. */
  place: number;
  /** Обезличенная метка «7Q4K». Имён и телефонов на табло нет. */
  label: string;
  /**
   * Сумма заказа в тенге. null — финал, суммы скрыты: их убирает сервер,
   * фронт ничего не вычисляет сам, поэтому цифр нет и в HTML.
   */
  amount: number | null;
  status: EntryStatus;
  /** ISO-дата, когда чек станет подтверждённым (только для pending, пока заказ не получен — null). */
  activatesAt: string | null;
}

export interface Leaderboard {
  isFrozen: boolean;
  updatedAt: string;
  entries: LeaderboardEntry[];
}

/** GET /api/promo/{slug}. */
export interface PromoApiConfig {
  slug: string;
  title: string;
  prizeName: string;
  startsAt: string;
  endsAt: string;
  freezeHoursBeforeEnd: number;
  holdDays: number;
  minOrderAmount: number;
  rulesVersion: string;
  isFrozen: boolean;
  /** Время сервера — от него считается таймер, а не от часов устройства. */
  serverTime: string;
}

/** GET /api/promo/{slug}/me — запись текущего покупателя. */
export type PromoMe =
  | { participating: false }
  | {
      participating: true;
      label: string;
      place: number;
      amount: number;
      status: EntryStatus;
      activatesAt: string | null;
    };

export interface PromoConfig {
  /** Адрес акции в API. */
  slug: string;
  title: string;
  /** Полное название приза — только текстом: «Смартфон iPhone 17 Pro Max, 256 ГБ». */
  prizeName: string;
  /** Короткое название для заголовка: «iPhone». */
  prizeShortName: string;
  /** Своё фото приза. Не рекламные изображения Apple. */
  prizeImage: string;
  /** Начало и конец акции, ISO (в настройках — с поясом Алматы, из API — UTC). */
  startsAt: string;
  endsAt: string;
  /** До какого числа объявим победителя: последним чекам нужно 14 дней на подтверждение. */
  resultsBy: string;
  /** За сколько часов до конца скрывать суммы на табло. */
  freezeHoursBeforeEnd: number;
  /** Минимальная сумма заказа для участия, ₸. */
  minOrderAmount: number;
  /** Срок проверки чека, дней (совпадает со сроком возврата). */
  confirmDays: number;
  rulesUrl: string;
  /** Редакция правил «ГГГГ-ММ-ДД»; её же фиксирует согласие покупателя при оформлении. */
  rulesVersion: string;
  /** Категории, из которых берутся товары акции (GUID категорий каталога). */
  productCategoryIds: string[];
}

export interface PromoData {
  /**
   * ok — акция включена, настройки с бэкенда; disabled — бэкенд ответил 404
   * (акция выключена), лендинг отдаёт 404; error — бэкенд недоступен, лендинг
   * не рекламирует акцию, а просит заглянуть позже.
   */
  status: "ok" | "disabled" | "error";
  /** При status ≠ ok — свои настройки: годятся для правил и превью, но не для рекламы. */
  config: PromoConfig;
  /** Отсортировано сервером, место — в записи. */
  leaderboard: LeaderboardEntry[];
  /** Финал: до конца меньше freezeHoursBeforeEnd часов или акция уже закончилась. */
  frozen: boolean;
  /** false — API табло не ответило; страница показывает «Табло обновляется», остальное работает. */
  boardAvailable: boolean;
}
