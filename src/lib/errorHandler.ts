import { AppwriteException } from "node-appwrite";
import { NextResponse } from "next/server";

export function handleError(error: unknown) {
    if (error instanceof AppwriteException) {
      const status =
        error.code >= 400 && error.code < 600 ? error.code : 500;
      return NextResponse.json(
        { error: error.message, type: error.type },
        { status }
      );
    }
    if (error instanceof Error && error.message === "No session") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}