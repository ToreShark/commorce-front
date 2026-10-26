// Цены: одно место для машинного и видимого формата.
//
// Google Merchant Center читал «35,000 ₸» (так печатал toLocaleString() без
// языка на английском) как 35,00 KZT — разделитель тысяч принимался за
// десятичный. Поэтому:
//  - в машинных полях (JSON-LD offers.price, meta product:price:amount) —
//    только целое число без разделителей: "35000";
//  - на странице — целые тенге, тысячи через неразрывный пробел: «35 000 ₸».

/** «35000» — для JSON-LD и мета-тегов. */
export function priceAmount(value: number): string {
  return String(Math.round(value));
}

const kzt = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0, useGrouping: true });

/** «35 000 ₸» — для показа. Без копеек: в тенге их не бывает. */
export function formatPrice(value: number): string {
  return `${kzt.format(Math.round(value))} ₸`;
}
