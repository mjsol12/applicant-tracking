/**
 * Parse a failed API response body into a user-facing string.
 * Supports `{ "error": "..." }` JSON (as returned by this app's route handlers) or plain text.
 */
export function messageFromApiErrorBody(
  bodyText: string,
  fallback: string,
): string {
  try {
    const body = JSON.parse(bodyText) as { error?: unknown };
    if (typeof body.error === "string" && body.error.trim()) {
      return body.error.trim();
    }
  } catch {
    if (bodyText.trim()) {
      return bodyText.trim();
    }
  }
  return fallback;
}

export type FetchJsonOptions = {
  fallbackMessage: string;
  /**
   * When the response status is 401, call this instead of throwing (e.g. pass
   * `() => redirect("/login")` from a Server Component).
   */
  onUnauthorized?: () => never;
};

/**
 * `fetch` + JSON parse on success; on failure reads the body and throws `Error`
 * with a message from the response when possible.
 */
export async function fetchJson<T>(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  options: FetchJsonOptions,
): Promise<T> {
  const res = await fetch(input, init);
  if (res.status === 401 && options.onUnauthorized) {
    options.onUnauthorized();
  }
  if (!res.ok) {
    const bodyText = await res.text();
    throw new Error(
      messageFromApiErrorBody(bodyText, options.fallbackMessage),
    );
  }
  return (await res.json()) as T;
}
