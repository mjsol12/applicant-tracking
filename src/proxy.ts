import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { APPWRITE_SESSION_COOKIE } from "@/lib/auth-constants";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasSession = Boolean(request.cookies.get(APPWRITE_SESSION_COOKIE)?.value);

  if (pathname !== "/login" && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
