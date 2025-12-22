import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Proxy function for authentication check (migrated from middleware.ts)
export async function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  //   console.log("token", token);
  //   return NextResponse.redirect(new URL('/home', request.url))

  if (!token) {
    // Redirect to the main page if there is no token
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token) {
    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Account/User`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!userResponse.ok) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const userData = await userResponse.json();

    // Redirect to the main page if the user does not have the correct role
    if (userData.roleId !== 1) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
}

export const config = {
  matcher: ["/dashboard"],
};
