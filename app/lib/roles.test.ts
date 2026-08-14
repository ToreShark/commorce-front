import { describe, expect, it } from "vitest";
import {
  ROLE_ADMIN,
  ROLE_SUPER_ADMIN,
  canManageUsers,
  decodeRoleId,
  isAdminRole,
} from "./roles";

/** Собирает JWT с нужным клеймом роли: подпись не проверяется, важна только полезная нагрузка. */
function makeToken(payload: Record<string, unknown>) {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  return `${encode({ alg: "HS256" })}.${encode(payload)}.signature`;
}

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

describe("Роли админки", () => {
  it("пускает в админку SuperAdmin и Admin", () => {
    expect(isAdminRole(ROLE_SUPER_ADMIN)).toBe(true);
    expect(isAdminRole(ROLE_ADMIN)).toBe(true);
  });

  it("не пускает модератора, обычного пользователя и гостя", () => {
    expect(isAdminRole(3)).toBe(false);
    expect(isAdminRole(4)).toBe(false);
    expect(isAdminRole(null)).toBe(false);
  });

  it("отдаёт управление пользователями только SuperAdmin", () => {
    // Бэкенд закрывает эти эндпоинты политикой SuperAdminOnly
    expect(canManageUsers(ROLE_SUPER_ADMIN)).toBe(true);
    expect(canManageUsers(ROLE_ADMIN)).toBe(false);
    expect(canManageUsers(null)).toBe(false);
  });

  it("читает роль из клейма .NET", () => {
    expect(decodeRoleId(makeToken({ [ROLE_CLAIM]: "2" }))).toBe(ROLE_ADMIN);
  });

  it("понимает роль числом и альтернативными именами клейма", () => {
    expect(decodeRoleId(makeToken({ [ROLE_CLAIM]: 1 }))).toBe(ROLE_SUPER_ADMIN);
    expect(decodeRoleId(makeToken({ RoleId: 2 }))).toBe(ROLE_ADMIN);
    expect(decodeRoleId(makeToken({ role: "1" }))).toBe(ROLE_SUPER_ADMIN);
  });

  it("возвращает null на мусорный или пустой токен", () => {
    expect(decodeRoleId(undefined)).toBeNull();
    expect(decodeRoleId("")).toBeNull();
    expect(decodeRoleId("не.токен")).toBeNull();
    expect(decodeRoleId("aaa.bbb.ccc")).toBeNull();
    expect(decodeRoleId(makeToken({ sub: "user" }))).toBeNull();
  });
});
