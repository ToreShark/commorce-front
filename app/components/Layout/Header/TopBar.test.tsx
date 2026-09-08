import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TopBar from "./TopBar";
import { notifyAuthChanged } from "@/app/lib/authEvents";

const getCurrentUser = vi.fn();

vi.mock("@/app/lib/data", () => ({
  getCurrentUser: () => getCurrentUser(),
}));

const USER = {
  id: "3bd3b082-77bc-4361-5984-08dcb5287b05",
  firstName: "Иван",
  lastName: "Иванов",
  role: "Basic",
  isAdmin: false,
};

/**
 * Шапка и вход, выданный без перехода на другую страницу.
 *
 * Признак «вошёл» — строка в localStorage, а компонент читает её один раз на
 * монтировании и живёт в layout, который при переходах внутри SPA не
 * перемонтируется. Покупатель, подтвердивший заказ кодом, до F5 видел «Войти».
 * Разбор: I_STORE/docs/checkout-cart-reset-and-autologin-2026-09-08.md.
 */
describe("Шапка: признак входа", () => {
  beforeEach(() => {
    localStorage.clear();
    getCurrentUser.mockReset();
  });

  it("зовёт войти, пока входа нет", async () => {
    render(<TopBar />);

    expect(await screen.findByText("Войти")).toBeInTheDocument();
    // Без токена запрос не нужен: /api/auth/me всё равно ответит отказом
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it("показывает покупателя, не дожидаясь перезагрузки страницы", async () => {
    render(<TopBar />);
    expect(await screen.findByText("Войти")).toBeInTheDocument();

    // Так выглядит подтверждение заказа кодом: токен положили, перехода нет
    localStorage.setItem("accessToken", "живой-токен");
    getCurrentUser.mockResolvedValue({ success: true, user: USER });
    await act(async () => notifyAuthChanged());

    await waitFor(() =>
      expect(screen.getByText("Иван Иванов")).toBeInTheDocument()
    );
    expect(screen.queryByText("Войти")).not.toBeInTheDocument();
  });

  it("возвращает «Войти», если вход отозвали", async () => {
    localStorage.setItem("accessToken", "живой-токен");
    getCurrentUser.mockResolvedValue({ success: true, user: USER });

    render(<TopBar />);
    expect(await screen.findByText("Иван Иванов")).toBeInTheDocument();

    // Токен протух и его забыли — показывать имя дальше нельзя
    localStorage.removeItem("accessToken");
    await act(async () => notifyAuthChanged());

    await waitFor(() => expect(screen.getByText("Войти")).toBeInTheDocument());
  });
})
