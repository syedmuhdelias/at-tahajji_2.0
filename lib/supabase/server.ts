import { cookies } from "next/headers";
import { supabaseUrl, supabaseKey } from "./config";

export async function accessToken() {
  return (await cookies()).get("mq-access")?.value;
}
export async function supabase(path: string, init: RequestInit = {}, token?: string) {
  const headers = new Headers(init.headers);
  headers.set("apikey", supabaseKey);
  headers.set("Authorization", `Bearer ${token || supabaseKey}`);
  if (init.body && typeof init.body === "string") headers.set("Content-Type", "application/json");
  return fetch(`${supabaseUrl}${path}`, { ...init, headers, cache: "no-store", signal: AbortSignal.timeout(15000) });
}
export async function verifiedAdmin(token?: string) {
  if (!token) return null;
  const response = await supabase("/auth/v1/user", {}, token);
  if (!response.ok) return null;
  const user = await response.json() as { id: string; email?: string };
  // Membership is assigned in SQL by the project owner, never from browser metadata.
  const membership = await supabase(`/rest/v1/myquran_admins?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`, {}, token);
  if (!membership.ok || !(await membership.json() as { user_id: string }[]).length) return null;
  return { userId: user.id, displayName: user.email || "Administrator" };
}
export async function setSession(data: { access_token: string; refresh_token: string; expires_in: number }, secure: boolean) {
  const jar = await cookies();
  const options = { httpOnly: true, sameSite: "lax" as const, secure, path: "/" };
  jar.set("mq-access", data.access_token, { ...options, maxAge: data.expires_in });
  jar.set("mq-refresh", data.refresh_token, { ...options, maxAge: 60 * 60 * 24 * 30 });
}
export async function clearSession() {
  const jar = await cookies();
  jar.delete("mq-access");
  jar.delete("mq-refresh");
}
