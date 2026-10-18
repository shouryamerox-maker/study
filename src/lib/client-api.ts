/** Small fetch wrapper for client components. All mutations go through /api/v1. */
export class ClientApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: { path: string; message: string }[],
  ) {
    super(message);
  }
}

export async function apiFetch<T = unknown>(path: string, init: { method?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: init.method ?? (init.body !== undefined ? "POST" : "GET"),
      headers: init.body !== undefined ? { "content-type": "application/json" } : undefined,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: init.signal,
      credentials: "same-origin",
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ClientApiError(0, "You appear to be offline. Check your connection and try again.", "network");
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = (json as { error?: { message?: string; code?: string; details?: { path: string; message: string }[] } }).error;
    throw new ClientApiError(res.status, err?.message ?? `Request failed (${res.status}).`, err?.code, err?.details);
  }
  return json as T;
}

export function fieldErrors(e: unknown): Record<string, string> {
  if (!(e instanceof ClientApiError) || !e.details) return {};
  const out: Record<string, string> = {};
  for (const d of e.details) if (!out[d.path]) out[d.path] = d.message;
  return out;
}
