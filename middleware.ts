import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

  // Decode JWT to check role (without verification - verification happens on API)
  try {
    const payload = decodeJWT(token);

    if (!payload) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check if user is admin (RoleId 1 = SuperAdmin, 2 = Admin)
    // .NET uses full claim URI for role
    const roleClaimKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
    const roleId = payload[roleClaimKey] || payload.RoleId || payload.roleId || payload.role;
    const isAdmin = roleId === 1 || roleId === 2 || roleId === "1" || roleId === "2";

    if (!isAdmin) {
      // Not an admin - redirect to home page
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Admin - allow access
    return NextResponse.next();
  } catch (error) {
    // Invalid token - redirect to home
    return NextResponse.redirect(new URL("/", request.url));
  }
}

// Simple JWT decode (without signature verification)
// Uses atob for Edge Runtime compatibility
function decodeJWT(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    // Convert base64url to base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Pad if necessary
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    // Decode using atob (works in Edge Runtime)
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
