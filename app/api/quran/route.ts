import { quranFetch, QuranError } from "@/lib/quran/server";
import { PAGE_SIZE, RECITERS } from "@/lib/quran/config";
export const dynamic = "force-dynamic";
function integer(
  value: string | null,
  min: number,
  max: number,
  fallback?: number,
) {
  const n = value === null ? fallback : Number(value);
  if (n === undefined || !Number.isInteger(n) || n < min || n > max)
    throw new QuranError("Invalid Quran reference.", 400);
  return n;
}
function verseKey(value: string | null) {
  if (!value || !/^\d{1,3}:\d{1,3}$/.test(value))
    throw new QuranError("Invalid verse reference.", 400);
  const [c, v] = value.split(":");
  integer(c, 1, 114);
  integer(v, 1, 286);
  return value;
}
const verseOptions = `words=true&word_fields=code_v2,v2_page,text_uthmani,text_qpc_hafs&fields=text_uthmani&translations=39,20,33&language=en&mushaf=1&per_page=${PAGE_SIZE}`;
export async function GET(request: Request) {
  try {
    const p = new URL(request.url).searchParams;
    const resource = p.get("resource");
    let path: string;
    switch (resource) {
      case "chapters":
        path = "/chapters?language=en";
        break;
      case "verses":
        path = `/verses/by_chapter/${integer(p.get("chapter"), 1, 114)}?${verseOptions}&page=${integer(p.get("page"), 1, 15, 1)}`;
        break;
      case "verse":
        path = `/verses/by_key/${verseKey(p.get("key"))}?${verseOptions}`;
        break;
      case "audio": {
        const id = integer(p.get("reciter"), 1, 20, 7);
        if (!RECITERS.some((r) => r.id === id))
          throw new QuranError("Unsupported reciter.", 400);
        path = `/recitations/${id}/by_ayah/${verseKey(p.get("key"))}?fields=segments,duration,format&segments=true`;
        break;
      }
      case "tafsir":
        path = `/tafsirs/en-tafisr-ibn-kathir/by_ayah/${verseKey(p.get("key"))}`;
        break;
      case "locate": {
        const kind = p.get("kind");
        if (kind !== "page" && kind !== "juz")
          throw new QuranError("Invalid navigation type.", 400);
        path = `/verses/by_${kind}/${integer(p.get("number"), 1, kind === "page" ? 604 : 30)}?per_page=1&fields=text_uthmani`;
        break;
      }
      case "search": {
        const query = (p.get("q") || "").trim().slice(0, 120);
        if (query.length < 2)
          throw new QuranError("Enter at least two characters.", 400);
        const lang = ["ms", "en", "id"].includes(p.get("language") || "")
          ? p.get("language")
          : "ms";
        path = `/search?q=${encodeURIComponent(query)}&size=20&page=${integer(p.get("page"), 1, 100, 1)}&language=${lang}`;
        break;
      }
      default:
        throw new QuranError("Unknown Quran resource.", 400);
    }
    return Response.json(await quranFetch(path), {
      headers: {
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const known = error instanceof QuranError;
    return Response.json(
      {
        error: known
          ? error.message
          : "Could not connect to the Quran provider. Please try again.",
      },
      {
        status: known ? error.status : 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
