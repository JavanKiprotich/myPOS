import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET
);

export async function middleware(
  request: NextRequest
) {
  const token =
    request.cookies.get("session")?.value;

  const pathname =
    request.nextUrl.pathname;

  // Public routes
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  try {
    const { payload } =
      await jwtVerify(token, secret);

    const role = payload.role;

    // Cashier restrictions
    if (
      role === "CASHIER" &&
      (
        pathname.startsWith("/products") ||
        pathname.startsWith("/inventory") ||
        pathname.startsWith("/expenses")
      )
    ) {
      return NextResponse.redirect(
        new URL("/", request.url)
      );
    }

    // Manager restrictions
    if (
      role === "MANAGER" &&
      pathname.startsWith("/users")
    ) {
      return NextResponse.redirect(
        new URL("/", request.url)
      );
    }

    return NextResponse.next();

  } catch {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/products/:path*",
    "/inventory/:path*",
    "/customers/:path*",
    "/credit/:path*",
    "/expenses/:path*",
    "/sales/:path*",
    "/receipt/:path*",
    "/pos/:path*",
    "/users/:path*",
  ],
};