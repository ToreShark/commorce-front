import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SideBar from "./SideBar";

function makeToken(roleId: number) {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const payload = {
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": String(roleId),
  };

  return `${encode({ alg: "HS256" })}.${encode(payload)}.signature`;
}

function signIn(roleId: number) {
  document.cookie = `token=${makeToken(roleId)}`;
}

afterEach(() => {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
});

describe("Меню админки", () => {
  it("показывает раздел пользователей супер-администратору", async () => {
    signIn(1);

    render(<SideBar setActivePage={vi.fn()} />);

    expect(await screen.findByText("Пользователи")).toBeInTheDocument();
  });

  it("скрывает раздел пользователей от администратора", async () => {
    // Бэкенд закрывает эти эндпоинты политикой SuperAdminOnly:
    // показывать пункт, который вернёт 403, нельзя
    signIn(2);

    render(<SideBar setActivePage={vi.fn()} />);

    // Остальная админка администратору доступна
    expect(await screen.findByText("Товары")).toBeInTheDocument();
    expect(screen.queryByText("Пользователи")).not.toBeInTheDocument();
  });

  it("скрывает раздел пользователей без токена", async () => {
    render(<SideBar setActivePage={vi.fn()} />);

    await waitFor(() =>
      expect(screen.queryByText("Пользователи")).not.toBeInTheDocument()
    );
  });
});
