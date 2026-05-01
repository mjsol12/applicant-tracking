import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { APPWRITE_SESSION_COOKIE } from "@/lib/auth-constants";
import { createSessionClient } from "@/lib/appwrite-server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get(APPWRITE_SESSION_COOKIE)?.value;

  if (session) {
    try {
      const { account } = await createSessionClient();
      await account.deleteSession("current");
    } catch {
      // Ignore remote delete failures and still clear local cookie.
    }
  }

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(APPWRITE_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
