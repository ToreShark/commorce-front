/** Строка «Размеры и характеристики» товара в том виде, как её пишет админка. */
export type PropertyRow = { id: number; Название: string; Значение: string };

/**
 * propertiesJson бывает двух форматов: массив строк { Название, Значение } (так пишет
 * админка) и, у старых товаров, объект { "Цвет": "Белый" }. Читать его только через
 * эту функцию — витрина, разбиравшая лишь объект, падала на массиве.
 * Пустые строки (без названия и значения) отбрасываются.
 */
export function parseProperties(json?: string | null): PropertyRow[] {
  if (!json) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    console.error("Не удалось разобрать propertiesJson", json);
    return [];
  }

  let rows: PropertyRow[] = [];
  if (Array.isArray(parsed)) {
    rows = parsed
      .filter((item) => item && typeof item === "object")
      .map((item: Record<string, unknown>, i) => ({
        id: i,
        Название: String(item["Название"] ?? item["name"] ?? item["Name"] ?? ""),
        Значение: String(item["Значение"] ?? item["value"] ?? item["Value"] ?? ""),
      }));
  } else if (parsed && typeof parsed === "object") {
    rows = Object.entries(parsed).map(([key, value], i) => ({
      id: i,
      Название: key,
      Значение: String(value ?? ""),
    }));
  }

  return rows
    .filter((row) => row.Название.trim() !== "" || row.Значение.trim() !== "")
    .map((row, i) => ({ ...row, id: i }));
}
