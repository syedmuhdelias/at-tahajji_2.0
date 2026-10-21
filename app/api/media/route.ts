import { adminUser, sameOrigin } from "@/lib/site/server";
import { putMedia } from "#site-storage";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (!(await adminUser()))
    return Response.json(
      { error: "Administrator sign-in is required." },
      { status: 401 },
    );
  if (!sameOrigin(request))
    return Response.json(
      { error: "This request must come from the site." },
      { status: 403 },
    );
  if (Number(request.headers.get("content-length") || 0) > 5_500_000)
    return Response.json(
      { error: "Images must be under 5 MB." },
      { status: 413 },
    );
  try {
    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof File) || file.size > 5_000_000 || file.size < 12)
      return Response.json(
        { error: "Choose a PNG, JPEG or WebP image under 5 MB." },
        { status: 400 },
      );
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let type = "",
      extension = "";
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      type = "image/jpeg";
      extension = "jpg";
    } else if (
      [137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b)
    ) {
      type = "image/png";
      extension = "png";
    } else if (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    ) {
      type = "image/webp";
      extension = "webp";
    }
    if (!type || type !== file.type)
      return Response.json(
        { error: "The file must be a valid PNG, JPEG or WebP image." },
        { status: 400 },
      );
    const key = `${crypto.randomUUID()}.${extension}`;
    await putMedia(key, buffer, type);
    return Response.json({ url: `/api/media/${key}` });
  } catch {
    return Response.json(
      { error: "The image could not be uploaded. Please try again." },
      { status: 503 },
    );
  }
}
