"use client";
import { useEffect, useState } from "react";
import { BookOpen, LoaderCircle, ExternalLink } from "lucide-react";
import { Dialog } from "./Dialog";
import { api } from "@/lib/quran/client";
import { plainText } from "@/lib/quran/config";
type Tafsir = {
  resource_name: string;
  text: string;
  verses: Record<string, unknown>;
  translated_name?: { language_name: string };
};
export function TafsirDialog({
  verseKey,
  onClose,
}: {
  verseKey: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<Tafsir | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const c = new AbortController();
    setError("");
    api<{ tafsir: Tafsir }>({ resource: "tafsir", key: verseKey }, c.signal)
      .then((r) => setData(r.tafsir))
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      });
    return () => c.abort();
  }, [verseKey, retry]);
  return (
    <Dialog title={`Tafsir · ${verseKey}`} onClose={onClose} wide>
      <div className="tafsir-source">
        <BookOpen size={22} />
        <div>
          <strong>{data?.resource_name || "Ibn Kathir (Abridged)"}</strong>
          <small>English · Provided by Quran Foundation</small>
        </div>
      </div>
      {!data && !error && (
        <div className="loading-box">
          <LoaderCircle className="spin" /> Loading authentic tafsir…
        </div>
      )}
      {error && (
        <div className="error-box" role="alert">
          <p>{error}</p>
          <button
            className="secondary-button"
            onClick={() => setRetry((n) => n + 1)}
          >
            Try again
          </button>
        </div>
      )}
      {data && (
        <>
          <p className="tafsir-coverage">
            This commentary covers{" "}
            {Object.keys(data.verses || {}).join(", ") || verseKey}.
          </p>
          <div className="tafsir-text">
            {plainText(data.text)
              .split(/\n{2,}/)
              .map((p, i) => (
                <p key={i} dir="auto">
                  {p}
                </p>
              ))}
          </div>
        </>
      )}
      <a
        className="text-button external-source"
        target="_blank"
        rel="noreferrer"
        href={`https://quran.com/${verseKey}/tafsirs/en-tafisr-ibn-kathir`}
      >
        View source on Quran.com <ExternalLink size={14} />
      </a>
    </Dialog>
  );
}
