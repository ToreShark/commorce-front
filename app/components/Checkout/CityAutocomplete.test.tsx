import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CityAutocomplete from "./CityAutocomplete";
import { searchCdekCities } from "@/app/lib/data";

vi.mock("@/app/lib/data", () => ({
  searchCdekCities: vi.fn(),
}));

const ALMATY = {
  code: "4756",
  city: "Алматы",
  region: "городской округ Алматы",
  country: "Казахстан",
  fullName: "Алматы, городской округ Алматы, Казахстан",
};

const ALMALYBAK = {
  code: "44638",
  city: "Алмалыбак",
  region: "Карасайский район, Алматинская область",
  country: "Казахстан",
  fullName: "Алмалыбак, Карасайский район, Алматинская область, Казахстан",
};

describe("CityAutocomplete", () => {
  beforeEach(() => {
    vi.mocked(searchCdekCities).mockResolvedValue([ALMATY, ALMALYBAK]);
  });

  it("не дёргает справочник, пока введён один символ", async () => {
    const user = userEvent.setup();
    render(<CityAutocomplete onCitySelect={vi.fn()} />);

    await user.type(screen.getByRole("textbox"), "А");

    // Ждём дольше дебаунса, чтобы убедиться, что запроса действительно нет
    await new Promise((resolve) => setTimeout(resolve, 700));
    expect(searchCdekCities).not.toHaveBeenCalled();
  });

  it("шлёт один запрос на серию быстрых нажатий", async () => {
    const user = userEvent.setup();
    render(<CityAutocomplete onCitySelect={vi.fn()} />);

    await user.type(screen.getByRole("textbox"), "Алматы");

    await waitFor(() => expect(searchCdekCities).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    });
    expect(searchCdekCities).toHaveBeenCalledWith("Алматы");
  });

  it("показывает найденные города с регионом", async () => {
    const user = userEvent.setup();
    render(<CityAutocomplete onCitySelect={vi.fn()} />);

    await user.type(screen.getByRole("textbox"), "Алм");

    expect(await screen.findByText("Алматы", {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText("Алмалыбак")).toBeInTheDocument();
    expect(screen.getByText("городской округ Алматы")).toBeInTheDocument();
  });

  it("отдаёт выбранный город наверх и подставляет полное название", async () => {
    const onCitySelect = vi.fn();
    const user = userEvent.setup();
    render(<CityAutocomplete onCitySelect={onCitySelect} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "Алм");
    await user.click(await screen.findByText("Алматы", {}, { timeout: 3000 }));

    // Код города — то, ради чего компонент существует: по нему считается доставка
    expect(onCitySelect).toHaveBeenCalledWith(ALMATY);
    expect(input).toHaveValue(ALMATY.fullName);
    expect(screen.queryByText("Алмалыбак")).not.toBeInTheDocument();
  });

  it("не открывает список, если ничего не найдено", async () => {
    vi.mocked(searchCdekCities).mockResolvedValue([]);

    const user = userEvent.setup();
    render(<CityAutocomplete onCitySelect={vi.fn()} />);

    await user.type(screen.getByRole("textbox"), "Йцукен");

    await waitFor(() => expect(searchCdekCities).toHaveBeenCalled(), { timeout: 3000 });
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("не роняет ввод, если справочник недоступен", async () => {
    vi.mocked(searchCdekCities).mockRejectedValue(new Error("network"));

    const user = userEvent.setup();
    render(<CityAutocomplete onCitySelect={vi.fn()} />);

    await user.type(screen.getByRole("textbox"), "Алматы");

    await waitFor(() => expect(searchCdekCities).toHaveBeenCalled(), { timeout: 3000 });
    expect(screen.getByRole("textbox")).toHaveValue("Алматы");
  });
});
