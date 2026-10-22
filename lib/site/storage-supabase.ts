import { accessToken, supabase } from "../supabase/server";
import type { ContentDocument, SiteContent } from "./content";
type Row = { content: SiteContent; revision: number; updated_at: string };
function document(row: Row): ContentDocument { return { content: row.content, revision: row.revision, updatedAt: row.updated_at }; }
export async function readContent(): Promise<ContentDocument | null> {
  const result = await supabase("/rest/v1/myquran_content?id=eq.1&select=content,revision,updated_at");
  if (!result.ok) throw new Error("Supabase content unavailable. Run supabase/setup.sql.");
  const rows = await result.json() as Row[];
  return rows.length ? document(rows[0]) : null;
}
export async function writeContent(content: SiteContent, revision: number): Promise<ContentDocument | null> {
  const token = await accessToken();
  if (!token) throw new Error("Sign in required");
  const result = await supabase("/rest/v1/rpc/myquran_save_content", {
    method: "POST", body: JSON.stringify({ new_content: content, expected_revision: revision }),
  }, token);
  if (!result.ok) throw new Error("Supabase save failed");
  const rows = await result.json() as Row[];
  return rows.length ? document(rows[0]) : null;
}
export async function putMedia(key: string, bytes: ArrayBuffer, type: string) {
  const token = await accessToken();
  if (!token) throw new Error("Sign in required");
  const result = await supabase(`/storage/v1/object/myquran-media/${key}`, {
    method: "POST", headers: { "Content-Type": type }, body: bytes,
  }, token);
  if (!result.ok) throw new Error("Supabase upload failed");
}
export async function getMedia(key: string): Promise<Response | null> {
  const result = await supabase(`/storage/v1/object/public/myquran-media/${key}`);
  if (result.status === 404) return null;
  if (!result.ok) throw new Error("Supabase media unavailable");
  return new Response(result.body, { headers: {
    "Content-Type": result.headers.get("Content-Type") || "application/octet-stream",
    "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff",
  } });
}
