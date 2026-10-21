// Standalone Next.js uses local disk; the hosted Workerd condition selects D1/R2.
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import type { ContentDocument, SiteContent } from "./content";
const directory = path.join(process.cwd(), ".data");
let pending: Promise<unknown> = Promise.resolve();
export async function readContent(): Promise<ContentDocument | null> {
  try {
    return JSON.parse(
      await readFile(path.join(directory, "content.json"), "utf8"),
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
export async function writeContent(
  content: SiteContent,
  revision: number,
): Promise<ContentDocument | null> {
  const operation = pending.then(async () => {
    const previous = await readContent();
    if ((previous?.revision || 0) !== revision) return null;
    const document = {
      content,
      revision: revision + 1,
      updatedAt: new Date().toISOString(),
    };
    await mkdir(directory, { recursive: true });
    const temporary = path.join(
      directory,
      `content-${crypto.randomUUID()}.tmp`,
    );
    await writeFile(temporary, JSON.stringify(document), { mode: 0o600 });
    await rename(temporary, path.join(directory, "content.json"));
    return document;
  });
  pending = operation.catch(() => {});
  return operation;
}
export async function putMedia(key: string, bytes: ArrayBuffer, type: string) {
  await mkdir(path.join(directory, "media"), { recursive: true });
  await writeFile(path.join(directory, "media", key), Buffer.from(bytes));
  await writeFile(path.join(directory, "media", `${key}.type`), type);
}
export async function getMedia(key: string): Promise<Response | null> {
  try {
    const file = await readFile(path.join(directory, "media", key));
    const type = await readFile(
      path.join(directory, "media", `${key}.type`),
      "utf8",
    );
    return new Response(file, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
