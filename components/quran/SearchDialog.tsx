"use client";
import { useEffect, useRef, useState } from "react";
import { Search, ArrowUpRight, LoaderCircle } from "lucide-react";
import { Dialog } from "./Dialog";
import { api } from "@/lib/quran/client";
import { parseReference, plainText, TRANSLATIONS } from "@/lib/quran/config";
import type { Chapter, Language } from "@/lib/quran/types";
type SearchResult = {
  verse_key: string;
  text?: string;
  translations?: {
    text: string;
    name?: string;
    resource_id?: number;
    language_name?: string;
  }[];
};
export function SearchDialog({
  chapters,
  language,
  onNavigate,
  onClose,
}: {
  chapters: Chapter[];
  language: Language;
  onNavigate: (chapter: number, ayah?: number) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const matches = chapters
    .filter((c) =>
      `${c.id} ${c.name_simple} ${c.name_complex} ${c.translated_name.name}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .slice(0, 7);
  const go = (c: number, a = 1) => {
    const chapter = chapters.find((x) => x.id === c);
    if (!chapter || a < 1 || a > chapter.verses_count) {
      setError("That verse reference does not exist.");
      return;
    }
    onNavigate(c, a);
    onClose();
  };
  const search = async () => {
    const ref = parseReference(query);
    if (ref) {
      go(ref.chapter, ref.ayah);
      return;
    }
    if (/^\d+$/.test(query)) {
      go(Number(query));
      return;
    }
    if (query.trim().length < 2) {
      setError("Enter at least two characters to search translations.");
      return;
    }
    controller.current?.abort();
    const c = new AbortController();
    controller.current = c;
    setBusy(true);
    setError("");
    setSearched(true);
    try {
      const data = await api<{ search: { results: SearchResult[] } }>(
        { resource: "search", q: query, language },
        c.signal,
      );
      setResults(data.search?.results || []);
    } catch (e) {
      if (!c.signal.aborted)
        setError(e instanceof Error ? e.message : "Search unavailable.");
    } finally {
      if (!c.signal.aborted) setBusy(false);
    }
  };
  return (
    <Dialog title="Find your verse" onClose={onClose} wide>
      <form
        className="global-search"
        onSubmit={(e) => {
          e.preventDefault();
          void search();
        }}
      >
        <Search size={21} />
        <input
          autoFocus
          placeholder="Search a surah, translation, or 2:255"
          value={query}
          onChange={(e) => {
            controller.current?.abort();
            setBusy(false);
            setQuery(e.target.value);
            setSearched(false);
            setResults([]);
            setError("");
          }}
          aria-label="Search the Quran"
        />
        <button type="submit" className="primary-button" disabled={busy}>
          {busy ? <LoaderCircle size={17} className="spin" /> : "Search"}
        </button>
      </form>
      <p className="field-help">
        Try “Al-Masad”, “mercy”, or a verse reference such as “2:255”.
      </p>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      {!searched && (
        <>
          <p className="eyebrow result-heading">
            {query ? "SURAHS" : "QUICK ACCESS"}
          </p>
          {(query
            ? matches
            : chapters.filter((c) => [1, 2, 18, 36, 55, 67, 111].includes(c.id))
          ).map((c) => (
            <button
              className="search-result"
              key={c.id}
              onClick={() => go(c.id)}
            >
              <span className="surah-number">{c.id}</span>
              <span>
                <strong>{c.name_simple}</strong>
                <small>
                  {c.translated_name.name} · {c.verses_count} ayahs
                </small>
              </span>
              <ArrowUpRight size={16} />
            </button>
          ))}
        </>
      )}
      {searched && !busy && !error && results.length === 0 && (
        <p className="empty-message">
          No translation matches. Try another keyword or a verse reference.
        </p>
      )}
      {results.map((r, i) => (
        <button
          key={`${r.verse_key}-${i}`}
          className="search-result translation-result"
          onClick={() => {
            const [c, a] = r.verse_key.split(":").map(Number);
            go(c, a);
          }}
        >
          <span className="verse-reference">{r.verse_key}</span>
          <span>
            {plainText(
              (
                r.translations?.find(
                  (t) => t.resource_id === TRANSLATIONS[language].id,
                ) || r.translations?.[0]
              )?.text ||
                r.text ||
                "Open verse",
            )}
            <small>
              {(
                r.translations?.find(
                  (t) => t.resource_id === TRANSLATIONS[language].id,
                ) || r.translations?.[0]
              )?.name || "Quran Foundation"}
            </small>
          </span>
          <ArrowUpRight size={16} />
        </button>
      ))}
    </Dialog>
  );
}
