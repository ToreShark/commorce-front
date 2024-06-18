import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  //   console.log("token", token);
  //   return NextResponse.redirect(new URL('/home', request.url))

  if (!token) {
    // Redirect to the main page if there is no token
    return NextResponse.redirect(new URL('/', request.url));
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

    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log("User data:", userData);
      if (userData.roleId !== 1) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  } 
}

export const config = {
    matcher: ['/dashboard'],
  }
