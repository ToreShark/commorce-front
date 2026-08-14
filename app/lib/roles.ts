/**
 * Роли и доступ к админке.
 *
 * Значения совпадают с enum RoleName на бэкенде и с политиками RolePolicies:
 * админку целиком видят SuperAdmin и Admin, управление пользователями — только SuperAdmin.
 *
 * Модуль должен оставаться свободным от браузерных API: его импортирует middleware,
 * который выполняется в Edge Runtime.
 */

export const ROLE_SUPER_ADMIN = 1;
export const ROLE_ADMIN = 2;

/** .NET кладёт роль в клейм с полным URI. */
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

/** Роли, которым открыт раздел /dashboard. */
export const ADMIN_ROLE_IDS = [ROLE_SUPER_ADMIN, ROLE_ADMIN];

/** Пускать ли в админку. */
export function isAdminRole(roleId: number | null): boolean {
  return roleId !== null && ADMIN_ROLE_IDS.includes(roleId);
}

/**
 * Доступно ли управление пользователями.
 * Бэкенд закрывает эти эндпоинты политикой SuperAdminOnly, поэтому Admin
 * не должен видеть раздел, в котором всё равно получит 403.
 */
export function canManageUsers(roleId: number | null): boolean {
  return roleId === ROLE_SUPER_ADMIN;
}

/**
 * Достаёт RoleId из JWT без проверки подписи — подпись проверяет бэкенд.
 * Нужен и middleware, и клиентским компонентам, поэтому живёт здесь.
 */
export function decodeRoleId(token: string | undefined | null): number | null {
  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as Record<string, unknown>;

    const rawRole =
      payload[ROLE_CLAIM] ?? payload.RoleId ?? payload.roleId ?? payload.role;

    const roleId = Number(rawRole);

    return Number.isFinite(roleId) ? roleId : null;
  } catch {
    return null;
  }
}
