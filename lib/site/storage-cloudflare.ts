import { env } from "cloudflare:workers";
import type { ContentDocument, SiteContent } from "./content";

export async function readContent(): Promise<ContentDocument | null> {
  if (!env.DB) throw new Error("Content database is unavailable.");
  const row = await env.DB.prepare(
    "SELECT data, revision, updated_at FROM site_content WHERE id = 1",
  ).first<{ data: string; revision: number; updated_at: string }>();
  return row
    ? {
        content: JSON.parse(row.data),
        revision: row.revision,
        updatedAt: row.updated_at,
      }
    : null;
}
export async function writeContent(
  content: SiteContent,
  revision: number,
): Promise<ContentDocument | null> {
  if (!env.DB) throw new Error("Content database is unavailable.");
  const updatedAt = new Date().toISOString();
  const result =
    revision === 0
      ? await env.DB.prepare(
          "INSERT INTO site_content (id, data, revision, updated_at) VALUES (1, ?, 1, ?) ON CONFLICT(id) DO NOTHING",
        )
          .bind(JSON.stringify(content), updatedAt)
          .run()
      : await env.DB.prepare(
          "UPDATE site_content SET data = ?, revision = revision + 1, updated_at = ? WHERE id = 1 AND revision = ?",
        )
          .bind(JSON.stringify(content), updatedAt, revision)
          .run();
  return result.meta.changes
    ? { content, revision: revision + 1, updatedAt }
    : null;
}
export async function putMedia(key: string, bytes: ArrayBuffer, type: string) {
  if (!env.BUCKET) throw new Error("Image storage is unavailable.");
  await env.BUCKET.put(key, bytes, { httpMetadata: { contentType: type } });
}
export async function getMedia(key: string): Promise<Response | null> {
  if (!env.BUCKET) throw new Error("Image storage is unavailable.");
  const file = await env.BUCKET.get(key);
  if (!file) return null;
  const headers = new Headers({
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  });
  file.writeHttpMetadata(headers);
  headers.set("ETag", file.httpEtag);
  return new Response(file.body, { headers });
}
