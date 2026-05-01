import { cookies, headers } from "next/headers";

export type LoadApplicantResult =
  | { ok: true; row: Record<string, unknown> }
  | { ok: false; reason: "unauthorized" | "not_found" };

export async function loadApplicant(
  rowId: string,
): Promise<LoadApplicantResult> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(
    `${proto}://${host}/api/data/applicant?rowId=${encodeURIComponent(rowId)}`,
    {
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    },
  );

  if (res.status === 401) {
    return { ok: false, reason: "unauthorized" };
  }
  if (!res.ok) {
    return { ok: false, reason: "not_found" };
  }

  const row = (await res.json()) as Record<string, unknown>;
  return { ok: true, row };
}
