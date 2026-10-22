import { accessToken, verifiedAdmin } from "@/lib/supabase/server";
import { readContent } from "./storage-supabase";
import { defaultContent } from "./defaults";
import { contentSchema, type ContentDocument } from "./content";

export async function getContent(): Promise<ContentDocument> {
  const saved = await readContent();
  if (!saved) return { content: defaultContent, revision: 0, updatedAt: null };
  return { ...saved, content: contentSchema.parse(saved.content) };
}
export async function adminUser() {
  try { return await verifiedAdmin(await accessToken()); }
  catch { return null; }
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  return (
    origin !== null &&
    origin === new URL(request.url).origin &&
    request.headers.get("Sec-Fetch-Site") !== "cross-site"
  );
}
