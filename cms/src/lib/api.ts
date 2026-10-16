export const ADMIN_API_URL = (process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:8001").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Turn a FastAPI error body into one readable line. */
function errorMessage(body: unknown, fallback: string): string {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d: { loc?: (string | number)[]; msg?: string }) => {
        const loc = Array.isArray(d.loc) ? d.loc.filter((x) => x !== "body").join(".") : "";
        // Pydantic prefixes custom validator messages with "Value error, "
        const msg = (d.msg ?? "Invalid value").replace(/^Value error, /, "");
        const field = loc.replace(/_/g, " ");
        return field ? `${field.charAt(0).toUpperCase()}${field.slice(1)}: ${msg}` : msg;
      })
      .join("; ");
  }
  return fallback;
}

/**
 * Call the admin API from the browser. The session is the httpOnly cookie set by /auth/login,
 * so no token is ever readable by page scripts.
 */
export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const jsonBody = init.body != null && !(init.body instanceof FormData);
  const res = await fetch(`${ADMIN_API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(jsonBody ? { "Content-Type": "application/json" } : {}),
      ...(init.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, errorMessage(body, res.statusText));
  }
  return res.status === 204 ? (undefined as T) : res.json();
}
