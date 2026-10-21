"use client";
import { memo, useEffect, useRef, useState } from "react";
import {
  Search,
  X,
  Bookmark,
  ArrowUpRight,
  History,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import type { Chapter, Progress } from "@/lib/quran/types";
type Props = {
  chapters: Chapter[];
  selected: number;
  open: boolean;
  onClose: () => void;
  onNavigate: (chapter: number, ayah?: number) => void;
  onLocate: (kind: "juz" | "page", number: number) => Promise<void>;
  onBookmarks: () => void;
  bookmarkCount: number;
  progress: Progress | null;
};
export const Sidebar = memo(function Sidebar({
  chapters,
  selected,
  open,
  onClose,
  onNavigate,
  onLocate,
  onBookmarks,
  bookmarkCount,
  progress,
}: Props) {
  const [tab, setTab] = useState("Surah");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const active = useRef<HTMLButtonElement | null>(null);
  const chapter = chapters.find((c) => c.id === selected);
  useEffect(() => {
    active.current?.scrollIntoView({ block: "center" });
  }, [selected, chapters, tab, open]);
  const locate = async (kind: "juz" | "page", n: number) => {
    setBusy(true);
    setError("");
    try {
      await onLocate(kind, n);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Navigation unavailable.");
    } finally {
      setBusy(false);
    }
  };
  const normalized = query.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]/g, "");
  const filtered = chapters.filter((c) =>
    [
      c.name_simple,
      c.name_complex,
      c.name_arabic,
      c.translated_name.name,
      String(c.id),
    ].some((s) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06ff]/g, "")
        .includes(normalized),
    ),
  );
  return (
    <>
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
      <aside
        className={`sidebar ${open ? "sidebar-open" : ""}`}
        aria-label="Quran navigation"
      >
        <div className="sidebar-top">
          <span className="eyebrow">EXPLORE THE QURAN</span>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Collapse navigation"
          >
            <X size={17} />
          </button>
        </div>
        <div className="navigation-tabs" role="group" aria-label="Navigate by">
          {["Surah", "Ayah", "Juz", "Page"].map((t) => (
            <button
              key={t}
              aria-pressed={tab === t}
              onClick={() => {
                setTab(t);
                setError("");
              }}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "Surah" && (
          <>
            <label className="sidebar-search">
              <Search size={16} />
              <input
                placeholder="Search a surah"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search surahs"
              />
              <kbd>/</kbd>
            </label>
            <div className="surah-list">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  ref={c.id === selected ? active : undefined}
                  className={`surah-item ${c.id === selected ? "selected" : ""}`}
                  aria-current={c.id === selected ? "page" : undefined}
                  onClick={() => onNavigate(c.id)}
                >
                  <span className="surah-number">
                    {String(c.id).padStart(2, "0")}
                  </span>
                  <span className="surah-name">
                    {c.name_simple}
                    <small>{c.translated_name.name}</small>
                  </span>
                  <span className="surah-count">{c.verses_count}</span>
                </button>
              ))}
              {chapters.length === 0 && (
                <p className="muted sidebar-empty">Loading 114 surahs…</p>
              )}
              {chapters.length > 0 && filtered.length === 0 && (
                <p className="muted sidebar-empty">No matching surahs.</p>
              )}
            </div>
          </>
        )}
        {tab === "Ayah" && (
          <div className="sidebar-scroll">
            <p className="sidebar-hint">
              Jump to an ayah in <strong>{chapter?.name_simple}</strong>.
            </p>
            <div className="number-grid">
              {Array.from({ length: chapter?.verses_count || 0 }, (_, i) => (
                <button key={i} onClick={() => onNavigate(selected, i + 1)}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
        {tab === "Juz" && (
          <div className="sidebar-scroll">
            <p className="sidebar-hint">Read one of the 30 parts.</p>
            {Array.from({ length: 30 }, (_, i) => (
              <button
                disabled={busy}
                className="juz-item"
                key={i}
                onClick={() => void locate("juz", i + 1)}
              >
                <span>Juz {String(i + 1).padStart(2, "0")}</span>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        )}
        {tab === "Page" && (
          <div className="sidebar-scroll">
            <p className="sidebar-hint">
              Go to a page in the 604-page Madani Mushaf.
            </p>
            <form
              className="page-form"
              onSubmit={(e) => {
                e.preventDefault();
                void locate("page", Number(page));
              }}
            >
              <label htmlFor="mushaf-page">Page number</label>
              <input
                id="mushaf-page"
                required
                type="number"
                min="1"
                max="604"
                value={page}
                placeholder="1–604"
                onChange={(e) => setPage(e.target.value)}
              />
              <button className="primary-button" disabled={busy} type="submit">
                Go to page <ArrowUpRight size={16} />
              </button>
            </form>
            <div className="number-grid">
              {[1, 50, 100, 200, 300, 400, 500, 603, 604].map((n) => (
                <button
                  disabled={busy}
                  key={n}
                  onClick={() => void locate("page", n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
        {busy && (
          <p className="sidebar-status">
            <LoaderCircle className="spin" size={15} /> Finding your place…
          </p>
        )}
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        <div className="sidebar-bottom">
          <button className="bookmarks-link" onClick={onBookmarks}>
            <Bookmark size={17} /> My bookmarks <span>{bookmarkCount}</span>
          </button>
          {progress && (
            <button
              className="resume-card"
              onClick={() => onNavigate(progress.chapter, progress.ayah)}
            >
              <span className="resume-icon">
                <History size={19} />
              </span>
              <span>
                <small>CONTINUE YOUR JOURNEY</small>
                <strong>
                  {chapters.find((c) => c.id === progress.chapter)
                    ?.name_simple || `Surah ${progress.chapter}`}{" "}
                  <i>
                    · {progress.chapter}:{progress.ayah}
                  </i>
                </strong>
              </span>
              <ArrowUpRight size={17} />
            </button>
          )}
          <div className="sidebar-footnote">A little, every day.</div>
        </div>
      </aside>
    </>
  );
});
