import { cookies, headers } from "next/headers";

export type InternalFetchContext = {
  /** Request origin for same-origin API calls from Server Components, e.g. `https://example.com`. */
  origin: string;
  /** Serialized `Cookie` header value, or empty string if none. */
  cookieHeader: string;
};

/**
 * Build origin + forwarded cookies for internal `fetch` to this app’s route handlers
 * from a Server Component or server module.
 */
export async function getInternalFetchContext(): Promise<InternalFetchContext> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return {
    origin: `${proto}://${host}`,
    cookieHeader,
  };
}

/** Common `RequestInit` for internal API calls that must forward the session cookie. */
export function internalServerFetchInit(
  cookieHeader: string,
): RequestInit {
  return {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
    cache: "no-store",
  };
}
