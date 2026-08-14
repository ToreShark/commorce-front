import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeRoleId, isAdminRole } from "@/app/lib/roles";

// Routes that require admin access
const ADMIN_ROUTES = ["/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route requires admin access
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  // Get the access token from cookies (saved as "token" by telegramLogin)
  const token = request.cookies.get("token")?.value;

  // If no token, redirect to home
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Роль читаем без проверки подписи — подпись проверяет бэкенд на каждом запросе.
  // Набор ролей общий с бэкендом, см. RolePolicies.AdminArea
  const roleId = decodeRoleId(token);

  if (!isAdminRole(roleId)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
