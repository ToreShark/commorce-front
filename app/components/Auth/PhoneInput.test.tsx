import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import PhoneInput from "./PhoneInput";

/**
 * Поле ввода телефона.
 *
 * Номер — идентификатор покупателя: по нему ищут строку в Users и на неё вешают
 * заказы. Поле, отдающее не тот номер, разводит одного человека по разным
 * пользователям, и «История заказов» показывает пустоту.
 * Разбор: I_STORE/docs/purchase-history-empty-2026-09-08.md.
 */
describe("PhoneInput", () => {
  /** Компонент управляемый — держим значение так же, как это делают формы. */
  function Harness({ onClean }: { onClean: (value: string) => void }) {
    const [value, setValue] = useState("");

    return (
      <PhoneInput
        value={value}
        onChange={(clean) => {
          setValue(clean);
          onClean(clean);
        }}
        placeholder="+7 (___) ___-__-__"
      />
    );
  }

  async function typePhone(typed: string) {
    const onClean = vi.fn();
    const user = userEvent.setup();

    render(<Harness onClean={onClean} />);
    await user.type(screen.getByPlaceholderText("+7 (___) ___-__-__"), typed);

    return onClean.mock.calls.at(-1)?.[0];
  }

  it("набранные десять цифр дополняет кодом страны", async () => {
    // При фокусе поле подставляет «+7», человек добирает остальное
    expect(await typePhone("7073816081")).toBe("77073816081");
  });

  it("номер с кодом страны не удваивает его", async () => {
    // Фокус подставляет «+7», и набранный целиком номер давал 12 цифр.
    // Обрезка до 11 оставляла чужой номер: 77701123456 вместо 77011234567
    expect(await typePhone("+77011234567")).toBe("77011234567");
  });

  it("привычную восьмёрку заменяет кодом страны", async () => {
    expect(await typePhone("87011234567")).toBe("77011234567");
  });
});
