import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DeliveryPointSelect from "./DeliveryPointSelect";
import { fetchCdekDeliveryPoints } from "@/app/lib/data";

vi.mock("@/app/lib/data", () => ({
  fetchCdekDeliveryPoints: vi.fn(),
}));

const SATPAEVA = {
  code: "ALM173",
  name: "Постамат ALM173",
  address: "ул. Сатпаева, 90",
  workTime: "Пн-Пт 10:00-20:00",
  phone: "+77011234567",
};

const ABAYA = {
  code: "ALM201",
  name: "ПВЗ ALM201",
  address: "пр. Абая, 15",
  workTime: null,
  phone: null,
};

describe("DeliveryPointSelect", () => {
  beforeEach(() => {
    vi.mocked(fetchCdekDeliveryPoints).mockResolvedValue([SATPAEVA, ABAYA]);
  });

  it("загружает пункты выдачи по коду города", async () => {
    render(
      <DeliveryPointSelect cityCode="4756" selectedCode={null} onSelect={vi.fn()} />
    );

    await waitFor(() => expect(fetchCdekDeliveryPoints).toHaveBeenCalledWith("4756"));
    expect(await screen.findByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "ул. Сатпаева, 90" })).toBeInTheDocument();
  });

  it("сообщает, если в городе нет пунктов выдачи", async () => {
    vi.mocked(fetchCdekDeliveryPoints).mockResolvedValue([]);

    render(
      <DeliveryPointSelect cityCode="4756" selectedCode={null} onSelect={vi.fn()} />
    );

    expect(await screen.findByText(/нет пунктов выдачи/i)).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("отдаёт наверх выбранный пункт целиком", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <DeliveryPointSelect cityCode="4756" selectedCode={null} onSelect={onSelect} />
    );

    await user.selectOptions(await screen.findByRole("combobox"), "ALM173");

    // Код ПВЗ обязателен для накладной, поэтому наверх уходит объект с code
    expect(onSelect).toHaveBeenLastCalledWith(SATPAEVA);
  });

  it("показывает реквизиты выбранного пункта", async () => {
    render(
      <DeliveryPointSelect cityCode="4756" selectedCode="ALM173" onSelect={vi.fn()} />
    );

    expect(await screen.findByText("Постамат ALM173")).toBeInTheDocument();
    expect(screen.getByText(/Пн-Пт 10:00-20:00/)).toBeInTheDocument();
    expect(screen.getByText(/\+77011234567/)).toBeInTheDocument();
  });

  it("сбрасывает выбор и перезагружает список при смене города", async () => {
    const onSelect = vi.fn();

    const { rerender } = render(
      <DeliveryPointSelect cityCode="4756" selectedCode="ALM173" onSelect={onSelect} />
    );

    await waitFor(() => expect(fetchCdekDeliveryPoints).toHaveBeenCalledWith("4756"));
    onSelect.mockClear();

    rerender(
      <DeliveryPointSelect cityCode="4961" selectedCode="ALM173" onSelect={onSelect} />
    );

    // Иначе к заказу прицепится ПВЗ из прошлого города
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith(null));
    expect(fetchCdekDeliveryPoints).toHaveBeenCalledWith("4961");
  });
});
