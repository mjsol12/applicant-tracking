import {
  getInternalFetchContext,
  internalServerFetchInit,
} from "@/lib/fetch/internal-context";
import { API_URL_APPLICANT } from "@/config/applicant";

export type LoadApplicantResult =
  | { ok: true; row: Record<string, unknown> }
  | { ok: false; reason: "unauthorized" | "not_found" };

export async function loadApplicant(
  rowId: string,
): Promise<LoadApplicantResult> {
  const { origin, cookieHeader } = await getInternalFetchContext();

  const res = await fetch(
    `${origin}${API_URL_APPLICANT}?rowId=${encodeURIComponent(rowId)}`,
    internalServerFetchInit(cookieHeader),
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
