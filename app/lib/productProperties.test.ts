import { describe, expect, it } from "vitest";
import { parseProperties } from "./productProperties";

describe("parseProperties", () => {
  it("читает массив, который пишет админка, и отбрасывает пустые строки", () => {
    const json =
      '[{"id":0,"Название":"Размер","Значение":"44"},{"id":1,"Название":"","Значение":""},{"id":2,"Название":"Размер","Значение":"48"}]';
    expect(parseProperties(json)).toEqual([
      { id: 0, Название: "Размер", Значение: "44" },
      { id: 1, Название: "Размер", Значение: "48" },
    ]);
  });

  it("читает старый объектный формат", () => {
    expect(parseProperties('{"Цвет":"Белый","Материал":"Керамика"}')).toEqual([
      { id: 0, Название: "Цвет", Значение: "Белый" },
      { id: 1, Название: "Материал", Значение: "Керамика" },
    ]);
  });

  it("возвращает пустой список на пустом, {} и битом JSON", () => {
    expect(parseProperties("")).toEqual([]);
    expect(parseProperties("{}")).toEqual([]);
    expect(parseProperties("[]")).toEqual([]);
    expect(parseProperties("{не json")).toEqual([]);
  });
});
