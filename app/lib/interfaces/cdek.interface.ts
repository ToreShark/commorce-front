/**
 * Интерфейсы для работы с API доставки СДЭК
 */

/** Город из справочника СДЭК */
export interface CdekCity {
  code: string;
  city: string;
  region: string | null;
  country: string | null;
  fullName: string;
}

/** Вариант доставки */
export interface DeliveryOption {
  type: string; // "pickup", "cdek_pvz", "cdek_courier"
  name: string;
  cost: number;
  daysMin: number;
  daysMax: number;
  tariffCode?: number;
}

/** Ответ API поиска городов */
export interface CitiesSearchResponse {
  success: boolean;
  cities: CdekCity[];
  error?: string;
}

/** Ответ API расчёта доставки */
export interface CalculateDeliveryResponse {
  success: boolean;
  options: DeliveryOption[];
  error?: string;
}

/** Адрес доставки для запроса */
export interface DeliveryAddressRequest {
  city: string;
  cityCode: string;
  street: string;
  house: string;
  apartment?: string;
  postalCode?: string;
  comment?: string;
}

/** Получатель */
export interface RecipientRequest {
  name: string;
  phone: string;
  email?: string;
}

/** Запрос на установку доставки */
export interface SetDeliveryRequest {
  orderId: string;
  deliveryType: string;
  cdekDeliveryPointCode?: string;
  address?: DeliveryAddressRequest;
  recipient?: RecipientRequest;
}

/** Ответ на установку доставки */
export interface SetDeliveryResponse {
  success: boolean;
  orderId: string;
  deliveryType: string;
  deliveryCost: number;
  deliveryDaysMin?: number;
  deliveryDaysMax?: number;
  error?: string;
}
