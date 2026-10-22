import { cookies } from "next/headers";
import { z } from "zod";
import { sameOrigin } from "@/lib/site/server";
import { accessToken, clearSession, setSession, supabase, verifiedAdmin } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
const sessionSchema = z.object({ access_token: z.string(), refresh_token: z.string(), expires_in: z.number().positive() });
const error = (message: string, status = 400) => Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  if (!sameOrigin(request)) return error("This request must come from the website.", 403);
  const { action } = await params;
  const origin = new URL(request.url).origin;
  try {
    if (action === "logout") {
      const token = await accessToken();
      try { if (token) await supabase("/auth/v1/logout", { method: "POST" }, token); }
      finally { await clearSession(); }
      return new Response(null, { status: 303, headers: { Location: "/admin", "Cache-Control": "no-store" } });
    }
    if (action === "refresh") {
      const refresh = (await cookies()).get("mq-refresh")?.value;
      if (!refresh) return error("Please sign in.", 401);
      const result = await supabase("/auth/v1/token?grant_type=refresh_token", { method: "POST", body: JSON.stringify({ refresh_token: refresh }) });
      if (!result.ok) { await clearSession(); return error("Your session expired. Please sign in.", 401); }
      const data = sessionSchema.parse(await result.json());
      if (!(await verifiedAdmin(data.access_token))) { await clearSession(); return error("Administrator access is required.", 403); }
      await setSession(data, origin.startsWith("https:"));
      return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    }
    const raw = await request.text();
    if (raw.length > 10000) return error("Request too large.", 413);
    const body = JSON.parse(raw);
    if (action === "login") {
      const input = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(1024) }).parse(body);
      const result = await supabase("/auth/v1/token?grant_type=password", { method: "POST", body: JSON.stringify(input) });
      if (!result.ok) return error(result.status === 429 ? "Too many attempts. Please try again later." : "Sign-in failed. Check your email and password.", result.status === 429 ? 429 : 401);
      const data = sessionSchema.parse(await result.json());
      if (!(await verifiedAdmin(data.access_token))) return error("This account has no My Quran admin access. Run the Supabase setup SQL after creating the admin user.", 403);
      await setSession(data, origin.startsWith("https:"));
      return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    }
    if (action === "recover") {
      const { email } = z.object({ email: z.string().email().max(254) }).parse(body);
      const result = await supabase(`/auth/v1/recover?redirect_to=${encodeURIComponent(origin + "/admin/reset-password")}`, { method: "POST", body: JSON.stringify({ email }) });
      if (!result.ok) return error("Reset email could not be requested. Check Supabase email delivery settings or try again later.", 503);
      return Response.json({ ok: true });
    }
    if (action === "password") {
      const input = z.object({ token: z.string().min(20).max(8192), password: z.string().min(12).max(1024) }).parse(body);
      if (!(await verifiedAdmin(input.token))) return error("This reset link is expired or the account has no admin access.", 401);
      const result = await supabase("/auth/v1/user", { method: "PUT", body: JSON.stringify({ password: input.password }) }, input.token);
      if (!result.ok) return error("Password update failed. Use a new reset link and a different password.");
      await clearSession();
      return Response.json({ ok: true });
    }
    return error("Not found.", 404);
  } catch (e) {
    return error(e instanceof z.ZodError || e instanceof SyntaxError ? "Check the form fields. New passwords must have at least 12 characters." : "Supabase could not be reached. Please try again.", e instanceof z.ZodError || e instanceof SyntaxError ? 400 : 503);
  }
}
