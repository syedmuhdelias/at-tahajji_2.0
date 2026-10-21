// Server-only module. Only the route handler imports this file. No NEXT_PUBLIC secrets.
const PUBLIC_BASE = "https://api.quran.com/api/v4";
const FOUNDATION_BASE = "https://apis.quran.foundation/content/api/v4";
const cache = new Map<string, { until: number; value: unknown }>();
const pending = new Map<string, Promise<unknown>>();
let token: { value: string; expires: number } | null = null;
let tokenPromise: Promise<string> | null = null;
export class QuranError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}
async function getToken(): Promise<string> {
  if (token && token.expires > Date.now() + 60000) return token.value;
  if (tokenPromise) return tokenPromise;
  tokenPromise = (async () => {
    const response = await fetch(
      "https://oauth2.quran.foundation/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${process.env.QURAN_CLIENT_ID}:${process.env.QURAN_CLIENT_SECRET}`)}`,
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          scope: "content",
        }),
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!response.ok)
      throw new QuranError(
        "Quran Foundation authentication failed. Check the server credentials.",
        503,
      );
    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };
    token = {
      value: data.access_token,
      expires: Date.now() + data.expires_in * 1000,
    };
    return token.value;
  })();
  try {
    return await tokenPromise;
  } finally {
    tokenPromise = null;
  }
}
export async function quranFetch<T = unknown>(path: string): Promise<T> {
  const hit = cache.get(path);
  if (hit && hit.until > Date.now()) return hit.value as T;
  if (pending.has(path)) return pending.get(path) as Promise<T>;
  const job = (async () => {
    const authenticated = !!(
      process.env.QURAN_CLIENT_ID && process.env.QURAN_CLIENT_SECRET
    );
    const headers: Record<string, string> = { Accept: "application/json" };
    if (authenticated) {
      headers["x-client-id"] = process.env.QURAN_CLIENT_ID!;
      headers["x-auth-token"] = await getToken();
    }
    const response = await fetch(
      (authenticated ? FOUNDATION_BASE : PUBLIC_BASE) + path,
      { headers, signal: AbortSignal.timeout(20000) },
    );
    if (response.status === 429)
      throw new QuranError(
        "The Quran provider is busy. Please wait a moment and try again.",
        429,
      );
    if (!response.ok)
      throw new QuranError(
        response.status === 401 || response.status === 403
          ? "The Quran provider requires access approval. Configure Quran Foundation credentials on the server."
          : "Quran content is temporarily unavailable. Please try again.",
        503,
      );
    const value = await response.json();
    if (cache.size >= 250) cache.delete(cache.keys().next().value!);
    cache.set(path, { until: Date.now() + 3600000, value });
    return value;
  })();
  pending.set(path, job);
  try {
    return (await job) as T;
  } finally {
    pending.delete(path);
  }
}
