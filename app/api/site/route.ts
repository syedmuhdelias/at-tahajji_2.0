import { z } from "zod";
import { contentSchema } from "@/lib/site/content";
import { adminUser, getContent, sameOrigin } from "@/lib/site/server";
import { writeContent } from "@/lib/site/storage-supabase";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json(await getContent(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Site content could not be loaded. Please try again." },
      { status: 503 },
    );
  }
}
export async function PUT(request: Request) {
  if (!(await adminUser()))
    return Response.json(
      {
        error:
          "Sign in with your site's administrator account to save changes.",
      },
      { status: 401 },
    );
  if (!sameOrigin(request))
    return Response.json(
      { error: "This request must come from the site." },
      { status: 403 },
    );
  try {
    if (Number(request.headers.get("content-length") || 0) > 150000)
      return Response.json({ error: "Content is too large." }, { status: 413 });
    const raw = await request.text();
    if (raw.length > 150000)
      return Response.json({ error: "Content is too large." }, { status: 413 });
    const input = z
      .object({ content: contentSchema, revision: z.number().int().min(0) })
      .safeParse(JSON.parse(raw));
    if (!input.success)
      return Response.json(
        {
          error: input.error.issues
            .map((i) => `${i.path.join(" → ")}: ${i.message}`)
            .join("\n"),
        },
        { status: 400 },
      );
    const saved = await writeContent(input.data.content, input.data.revision);
    if (!saved)
      return Response.json(
        {
          error:
            "Another session saved newer changes. Copy your edits, then reload before saving.",
        },
        { status: 409 },
      );
    return Response.json(saved, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json(
      {
        error:
          "Changes could not be saved. Your draft is still here; please try again.",
      },
      { status: 503 },
    );
  }
}
