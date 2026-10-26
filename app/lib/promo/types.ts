/**
 * Типы акции «Покупатель месяца». Их же будет отдавать API табло (этап 2),
 * поэтому компоненты зависят только от этих типов, а не от моков.
 */

/** pending — чек на проверке (срок возврата не истёк), confirmed — подтверждён. */
export type EntryStatus = "pending" | "confirmed";

export interface LeaderboardEntry {
  /** Обезличенная метка: «Покупатель №7Q4K». Имён и телефонов на табло нет. */
  label: string;
  /**
   * Сумма заказа в тенге. null — суммы скрыты на финале акции: их убирает
   * слой данных, а не вёрстка, чтобы цифр не было и в HTML.
   */
  amount: number | null;
  status: EntryStatus;
  /** ISO-дата, когда чек станет подтверждённым (для pending). */
  activatesAt?: string;
}

export interface PromoConfig {
  title: string;
  /** Полное название приза — только текстом: «Смартфон iPhone 17 Pro Max, 256 ГБ». */
  prizeName: string;
  /** Короткое название для заголовка: «iPhone». */
  prizeShortName: string;
  /** Своё фото приза. Не рекламные изображения Apple. */
  prizeImage: string;
  /** Начало и конец акции, ISO с поясом Алматы (+05:00). */
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
  config: PromoConfig;
  /** Отсортировано по убыванию суммы, место = индекс + 1. */
  leaderboard: LeaderboardEntry[];
  /** Финал: до конца меньше freezeHoursBeforeEnd часов или акция уже закончилась. */
  frozen: boolean;
}
