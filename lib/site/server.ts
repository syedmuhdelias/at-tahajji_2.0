import { getChatGPTUser } from "@/app/chatgpt-auth";
import { readContent } from "#site-storage";
import { defaultContent } from "./defaults";
import { contentSchema, type ContentDocument } from "./content";

export async function getContent(): Promise<ContentDocument> {
  const saved = await readContent();
  if (!saved) return { content: defaultContent, revision: 0, updatedAt: null };
  return { ...saved, content: contentSchema.parse(saved.content) };
}
export async function adminUser() {
  const user = await getChatGPTUser();
  if (!user) return null;
  // This site's verified hosting policy admits only its owner. If the audience
  // is expanded, configure this explicit allowlist BEFORE changing that policy.
  const allowlist = process.env.SITE_ADMIN_USER_IDS?.split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return !allowlist?.length || allowlist.includes(user.userId) ? user : null;
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  return (
    origin !== null &&
    origin === new URL(request.url).origin &&
    request.headers.get("Sec-Fetch-Site") !== "cross-site"
  );
}
