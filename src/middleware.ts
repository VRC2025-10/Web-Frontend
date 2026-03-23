import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionId = request.cookies.get("session_id");
  const isDevelopmentMockMode =
    process.env.NODE_ENV === "development" &&
    !new Set(["0", "false", "off"]).has(
      process.env.NEXT_PUBLIC_USE_DEV_MOCKS?.trim().toLowerCase() ?? ""
    );

  if (isDevelopmentMockMode) {
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (pathname === "/login" && sessionId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/settings") && !sessionId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect_to", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/schedule") && !sessionId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect_to", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && !sessionId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect_to", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/settings/:path*", "/schedule/:path*", "/admin/:path*"],
};
