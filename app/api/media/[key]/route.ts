import { getMedia } from "#site-storage";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  if (!/^[0-9a-f-]{36}\.(png|jpg|webp)$/.test(key))
    return new Response("Not found", { status: 404 });
  try {
    return (await getMedia(key)) || new Response("Not found", { status: 404 });
  } catch {
    return new Response("Image temporarily unavailable", { status: 503 });
  }
}
