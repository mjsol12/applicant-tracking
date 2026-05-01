import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite-server";
import { APPWRITE_SESSION_COOKIE } from "@/lib/auth-constants";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession({
      email,
      password,
    });

    if (!session.secret) {
      return NextResponse.json(
        { error: "Could not create a valid session." },
        { status: 500 },
      );
    }

    (await cookies()).set(APPWRITE_SESSION_COOKIE, session.secret, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 },
    );
  }
}
