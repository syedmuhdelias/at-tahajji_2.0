"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  BookOpen,
  Menu,
  Search,
  Globe2,
  Moon,
  Sun,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Bookmark,
  ArrowUpRight,
  List,
  AlignJustify,
  Play,
  Volume2,
  LoaderCircle,
  WifiOff,
  Info,
  X,
} from "lucide-react";
import { useReaderState } from "@/hooks/use-reader-state";
import { useQuranFonts } from "@/hooks/use-quran-fonts";
import { useQuranAudio } from "@/hooks/use-quran-audio";
import { api } from "@/lib/quran/client";
import {
  PAGE_SIZE,
  THEMES,
  TRANSLATIONS,
  plainText,
  parseReference,
  audioUrl,
} from "@/lib/quran/config";
import type {
  Chapter,
  Verse,
  VersePage,
  Word,
  Language,
} from "@/lib/quran/types";
import { Sidebar } from "./Sidebar";
import { VerseCard } from "./VerseCard";
import { AudioPlayer } from "./AudioPlayer";
import { Settings } from "./Settings";
import { Dialog } from "./Dialog";
import { SearchDialog } from "./SearchDialog";
import { TafsirDialog } from "./TafsirDialog";
import { Brand } from "@/components/site/Brand";
import type { SiteContent } from "@/lib/site/content";
const NO_WORDS: number[] = [];
export default function QuranReader({
  branding,
}: {
  branding: SiteContent["branding"];
}) {
  const {
    prefs,
    setPrefs,
    bookmarks,
    toggleBookmark,
    progress,
    setProgress,
    ready,
    storageWarning,
  } = useReaderState();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterError, setChapterError] = useState("");
  const [chapterRetry, setChapterRetry] = useState(0);
  const [target, setTarget] = useState({ chapter: 111, ayah: 1, version: 0 });
  const [initialized, setInitialized] = useState(false);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [bismillah, setBismillah] = useState<Verse | null>(null);
  const [pagination, setPagination] = useState<VersePage["pagination"] | null>(
    null,
  );
  const [firstPage, setFirstPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [error, setError] = useState("");
  const [visibleKey, setVisibleKey] = useState("111:1");
  const [sidebar, setSidebar] = useState(true);
  const [settings, setSettings] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [about, setAbout] = useState(false);
  const [readingOnly, setReadingOnly] = useState(false);
  const [tafsir, setTafsir] = useState<string | null>(null);
  const [wordDetail, setWordDetail] = useState<{
    word: Word;
    verse: Verse;
  } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [offline, setOffline] = useState(false);
  const requestId = useRef(0);
  const queuedPlay = useRef<string | null>(null);
  const pendingScroll = useRef<string | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const wordAudio = useRef<HTMLAudioElement | null>(null);
  const advanceRef = useRef<(key: string) => void>(() => {});
  const player = useQuranAudio(prefs, (key) => advanceRef.current(key));
  const fonts = useQuranFonts(verses, prefs.font);
  const chapter = chapters.find((c) => c.id === target.chapter);
  const currentVerse =
    verses.find((v) => v.verse_key === visibleKey) || verses[0];
  useEffect(() => {
    const c = new AbortController();
    setChapterError("");
    api<{ chapters: Chapter[] }>({ resource: "chapters" }, c.signal)
      .then((d) => {
        if (
          d.chapters.length !== 114 ||
          d.chapters.reduce((n, ch) => n + ch.verses_count, 0) !== 6236
        )
          throw new Error(
            "The Quran catalogue could not be verified. Please try again.",
          );
        setChapters(d.chapters);
      })
      .catch((e) => {
        if (!c.signal.aborted) setChapterError(e.message);
      });
    api<{ verse: Verse }>({ resource: "verse", key: "1:1" }, c.signal)
      .then((d) => setBismillah(d.verse))
      .catch(() => {});
    return () => c.abort();
  }, [chapterRetry]);
  useEffect(() => {
    if (!ready || initialized) return;
    const ref = parseReference(location.hash.slice(1));
    const saved = ref || progress;
    const initial =
      saved && saved.chapter >= 1 && saved.chapter <= 114
        ? saved
        : { chapter: 111, ayah: 1 };
    setTarget({ ...initial, version: 0 });
    pendingScroll.current = `${initial.chapter}:${initial.ayah}`;
    setVisibleKey(`${initial.chapter}:${initial.ayah}`);
    setInitialized(true);
    if (window.innerWidth < 1000) setSidebar(false);
  }, [ready, initialized, progress]);
  useEffect(() => {
    if (!initialized) return;
    const c = new AbortController();
    const id = ++requestId.current;
    const page = Math.floor((target.ayah - 1) / PAGE_SIZE) + 1;
    setLoading(true);
    setError("");
    setVerses([]);
    setPagination(null);
    setFirstPage(page);
    setMoreLoading(false);
    api<VersePage>(
      { resource: "verses", chapter: target.chapter, page },
      c.signal,
    )
      .then((d) => {
        if (id !== requestId.current) return;
        if (!d.verses?.length)
          throw new Error(
            "This verse could not be found. Choose another ayah.",
          );
        setVerses(d.verses);
        setPagination(d.pagination);
        setLoading(false);
      })
      .catch((e) => {
        if (!c.signal.aborted && id === requestId.current) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => c.abort();
  }, [target, initialized]);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      wordAudio.current?.pause();
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), 2200);
    return () => clearTimeout(t);
  }, [copied]);
  const navigate = useCallback(
    (c: number, ayah = 1, play = false) => {
      const ch = chapters.find((x) => x.id === c);
      if (ch && (ayah < 1 || ayah > ch.verses_count)) {
        setToast("That ayah does not exist in this surah.");
        return;
      }
      player.stop();
      wordAudio.current?.pause();
      queuedPlay.current = play ? `${c}:${ayah}` : null;
      pendingScroll.current = `${c}:${ayah}`;
      setVisibleKey(`${c}:${ayah}`);
      setTarget((prev) => ({ chapter: c, ayah, version: prev.version + 1 }));
      history.replaceState(null, "", `#${c}:${ayah}`);
      if (window.innerWidth < 1000) setSidebar(false);
    },
    [chapters, player.stop],
  );
  useEffect(() => {
    const handle = () => {
      const r = parseReference(location.hash.slice(1));
      if (r && r.chapter >= 1 && r.chapter <= 114) navigate(r.chapter, r.ayah);
    };
    window.addEventListener("hashchange", handle);
    return () => window.removeEventListener("hashchange", handle);
  }, [navigate]);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("dialog") || /INPUT|TEXTAREA|SELECT/.test(el.tagName))
        return;
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") ||
        e.key === "/"
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSidebar(false);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  useEffect(() => {
    if (!verses.length) return;
    const key = pendingScroll.current;
    if (key && verses.some((v) => v.verse_key === key)) {
      pendingScroll.current = null;
      requestAnimationFrame(() => {
        if (target.ayah === 1) window.scrollTo({ top: 0, behavior: "instant" });
        else
          document
            .getElementById(`verse-${key}`)
            ?.scrollIntoView({ block: "start", behavior: "instant" });
      });
    }
    const play = queuedPlay.current;
    if (play && verses.some((v) => v.verse_key === play)) {
      queuedPlay.current = null;
      void player.load(play);
    }
  }, [verses, target.ayah, player.load]);
  useEffect(() => {
    if (!verses.length || !ready) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) {
          const ayah = Number((visible[0].target as HTMLElement).dataset.verse);
          setVisibleKey(`${target.chapter}:${ayah}`);
          setProgress({ chapter: target.chapter, ayah, updatedAt: Date.now() });
        }
      },
      { rootMargin: "-18% 0px -50% 0px", threshold: 0 },
    );
    verses.forEach((v) => {
      const el = document.getElementById(`verse-${v.verse_key}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [verses, ready, target.chapter, setProgress]);
  useEffect(() => {
    if (!player.key || !prefs.follow) return;
    const el = document.getElementById(`verse-${player.key}`);
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.top < 130 || r.bottom > innerHeight - 130)
        el.scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
          block: "center",
        });
    }
  }, [player.key, prefs.follow, verses]);
  const loadMore = useCallback(async () => {
    if (!pagination?.next_page || moreLoading) return;
    const id = requestId.current;
    setMoreLoading(true);
    setError("");
    try {
      const d = await api<VersePage>({
        resource: "verses",
        chapter: target.chapter,
        page: pagination.next_page,
      });
      if (id !== requestId.current) return;
      setVerses((prev) => [
        ...prev,
        ...d.verses.filter(
          (v) => !prev.some((x) => x.verse_key === v.verse_key),
        ),
      ]);
      setPagination(d.pagination);
    } catch (e) {
      if (id === requestId.current)
        setError(
          e instanceof Error ? e.message : "Unable to load more verses.",
        );
    } finally {
      if (id === requestId.current) setMoreLoading(false);
    }
  }, [pagination, moreLoading, target.chapter]);
  useEffect(() => {
    if (!sentinel.current || !pagination?.next_page || error) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadMore();
      },
      { rootMargin: "300px" },
    );
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [loadMore, pagination, error]);
  const moveAudio = useCallback(
    (direction: number, from?: string) => {
      const [c, a] = (from || player.key || visibleKey).split(":").map(Number);
      const ch = chapters.find((x) => x.id === c);
      if (!ch) return;
      let nextC = c,
        nextA = a + direction;
      if (nextA > ch.verses_count) {
        nextC = c + 1;
        nextA = 1;
      } else if (nextA < 1) {
        nextC = c - 1;
        nextA = chapters.find((x) => x.id === nextC)?.verses_count || 1;
      }
      if (nextC < 1 || nextC > 114) {
        player.pause();
        setToast("You have reached the end of the Quran.");
        return;
      }
      const key = `${nextC}:${nextA}`;
      if (nextC === target.chapter && verses.some((v) => v.verse_key === key)) {
        void player.load(key);
      } else navigate(nextC, nextA, true);
    },
    [
      player.key,
      player.load,
      visibleKey,
      chapters,
      target.chapter,
      verses,
      navigate,
    ],
  );
  advanceRef.current = (key) => moveAudio(1, key);
  const onPlay = useCallback(
    (key: string) => {
      wordAudio.current?.pause();
      void player.toggle(key);
    },
    [player.toggle],
  );
  const onBookmark = useCallback(
    (key: string) => {
      toggleBookmark(key, chapter?.name_simple || `Surah ${target.chapter}`);
    },
    [toggleBookmark, chapter?.name_simple, target.chapter],
  );
  const copyVerse = useCallback(
    async (v: Verse) => {
      const t = v.translations.find(
        (t) => t.resource_id === TRANSLATIONS[prefs.language].id,
      );
      try {
        await navigator.clipboard.writeText(
          `${v.text_uthmani}\n\n${t ? plainText(t.text) : ""}\n\nQuran ${v.verse_key} · ${TRANSLATIONS[prefs.language].source}\n${location.origin}/quran#${v.verse_key}`,
        );
        setCopied(v.verse_key);
        setToast("Verse copied.");
      } catch {
        setToast("Clipboard access is unavailable in this browser.");
      }
    },
    [prefs.language],
  );
  const shareVerse = useCallback(async (v: Verse) => {
    const url = `${location.origin}/quran#${v.verse_key}`;
    try {
      if (navigator.share)
        await navigator.share({ title: `My Quran · ${v.verse_key}`, url });
      else {
        await navigator.clipboard.writeText(url);
        setToast("Verse link copied.");
      }
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError"))
        setToast(
          "Sharing is unavailable. Use the verse reference to navigate.",
        );
    }
  }, []);
  const onWord = useCallback(
    (word: Word, verse: Verse) => setWordDetail({ word, verse }),
    [],
  );
  const locate = useCallback(
    async (kind: "juz" | "page", number: number) => {
      const d = await api<{ verses: Verse[] }>({
        resource: "locate",
        kind,
        number,
      });
      if (!d.verses?.length) throw new Error("No verses were found.");
      const [c, a] = d.verses[0].verse_key.split(":").map(Number);
      navigate(c, a);
    },
    [navigate],
  );
  const closeSidebar = useCallback(() => setSidebar(false), []);
  const openBookmarks = useCallback(() => setBookmarksOpen(true), []);
  const playWord = async () => {
    if (!wordDetail?.word.audio_url) return;
    player.pause();
    wordAudio.current?.pause();
    const a = new Audio(audioUrl(wordDetail.word.audio_url));
    a.volume = prefs.volume;
    wordAudio.current = a;
    try {
      await a.play();
    } catch {
      setToast("Word audio is temporarily unavailable.");
    }
  };
  const closeWord = () => {
    wordAudio.current?.pause();
    setWordDetail(null);
  };
  const color = prefs.background.slice(1);
  const brightness =
    (parseInt(color.slice(0, 2), 16) * 299 +
      parseInt(color.slice(2, 4), 16) * 587 +
      parseInt(color.slice(4, 6), 16) * 114) /
    1000;
  const light = brightness > 160;
  const themeStyle = useMemo(
    () =>
      ({
        "--bg": prefs.background,
        "--accent": prefs.accent,
        "--arabic": prefs.arabicColor,
        "--arabic-size": `${prefs.arabicSize}px`,
        "--translation-size": `${prefs.translationSize}px`,
        "--arabic-line-height": prefs.lineHeight,
      }) as CSSProperties,
    [
      prefs.background,
      prefs.accent,
      prefs.arabicColor,
      prefs.arabicSize,
      prefs.translationSize,
      prefs.lineHeight,
    ],
  );
  const fontStatus =
    prefs.font === "hafs"
      ? "Uthmanic Hafs"
      : fonts.failed
        ? "Uthmanic Hafs fallback"
        : "QCF V2 · Madani";
  return (
    <div
      className={`quran-app ${sidebar ? "with-sidebar" : ""}`}
      data-light={light}
      style={themeStyle}
    >
      <a className="skip-link" href="#reading-area">
        Skip to Quran reader
      </a>
      <header className="topbar">
        <div className="brand-group">
          <button
            className="icon-button menu-toggle"
            aria-label="Toggle navigation"
            aria-expanded={sidebar}
            onClick={() => setSidebar(!sidebar)}
          >
            <Menu size={20} />
          </button>
          <Brand branding={branding} compact />
        </div>
        <button className="top-search" onClick={() => setSearchOpen(true)}>
          <Search size={16} />
          <span>Find a surah or verse</span>
          <kbd>⌘ K</kbd>
        </button>
        <nav className="top-actions" aria-label="Reader tools">
          <button
            className="icon-button mobile-search"
            aria-label="Search Quran"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={20} />
          </button>
          <label className="language-select">
            <Globe2 size={17} />
            <select
              aria-label="Translation language"
              value={prefs.language}
              onChange={(e) =>
                setPrefs((p) => ({
                  ...p,
                  language: e.target.value as Language,
                }))
              }
            >
              {Object.entries(TRANSLATIONS).map(([k, t]) => (
                <option value={k} key={k}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <span className="nav-separator" />
          <button
            className="icon-button"
            onClick={() => {
              const t = THEMES[light ? 0 : 4];
              setPrefs((p) => ({
                ...p,
                theme: t.id,
                accent: t.accent,
                background: t.background,
                arabicColor: t.arabicColor,
              }));
            }}
            aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
          >
            {light ? <Moon size={19} /> : <Sun size={19} />}
          </button>
          <button
            className="icon-button"
            onClick={() => setSettings(true)}
            aria-label="Open reading settings"
          >
            <Settings2 size={20} />
          </button>
        </nav>
      </header>
      <Sidebar
        chapters={chapters}
        selected={target.chapter}
        open={sidebar}
        onClose={closeSidebar}
        onNavigate={navigate}
        onLocate={locate}
        onBookmarks={openBookmarks}
        bookmarkCount={bookmarks.length}
        progress={progress}
      />
      <main className="main-content" id="reading-area">
        <div className="reading-toolbar">
          <div className="page-meta">
            <BookOpen size={15} />
            <span>
              Page {currentVerse?.page_number || chapter?.pages[0] || "—"}
            </span>
            <i />
            <span>Juz {currentVerse?.juz_number || "—"}</span>
          </div>
          <div className="view-toggle" aria-label="Reading display">
            <button
              className={!readingOnly ? "selected" : ""}
              aria-pressed={!readingOnly}
              onClick={() => setReadingOnly(false)}
            >
              <List size={14} /> Translation
            </button>
            <button
              className={readingOnly ? "selected" : ""}
              aria-pressed={readingOnly}
              onClick={() => setReadingOnly(true)}
            >
              <AlignJustify size={14} /> Reading
            </button>
          </div>
          <button
            className="text-button toolbar-settings"
            onClick={() => setSettings(true)}
          >
            <Settings2 size={15} /> Reading settings
          </button>
        </div>
        {offline && (
          <div className="notice" role="status">
            <WifiOff size={16} /> You’re offline. Loaded verses remain visible;
            new content and audio need a connection.
          </div>
        )}
        {storageWarning && (
          <div className="notice" role="status">
            Browser storage is unavailable. Your preferences and bookmarks will
            last for this visit.
          </div>
        )}
        <div className="reader-container">
          <div className="chapter-heading">
            <div className="chapter-kicker">
              <span className="chapter-index">
                {String(target.chapter).padStart(3, "0")}
              </span>
              <span>
                SURAH {target.chapter} <i>·</i>{" "}
                {chapter
                  ? chapter.revelation_place === "madinah"
                    ? "MEDINAN"
                    : "MECCAN"
                  : "LOADING"}
              </span>
            </div>
            <div className="chapter-title-row">
              <div>
                <h1>{chapter?.name_simple || "My Quran"}</h1>
                <p>
                  {chapter?.translated_name.name ||
                    "Your space to read and reflect"}{" "}
                  <span>·</span> {chapter?.verses_count || "—"} ayahs
                </p>
              </div>
              <span
                className="chapter-arabic"
                lang="ar"
                dir="rtl"
                style={{ visibility: fonts.hafsReady ? "visible" : "hidden" }}
              >
                {chapter?.name_arabic}
              </span>
            </div>
            <div className="chapter-actions">
              <button
                className="primary-button"
                disabled={!verses.length}
                onClick={() => onPlay(player.key || verses[0].verse_key)}
              >
                <Headphones size={16} />
                {player.playing ? "Pause recitation" : "Listen to surah"}
              </button>
              <button
                className="secondary-button"
                onClick={() => setAbout(true)}
              >
                <Info size={15} /> About this reader
              </button>
              <span className="font-badge">
                <span /> {fontStatus}
              </span>
            </div>
          </div>
          {chapterError && (
            <div className="error-box" role="alert">
              <p>{chapterError}</p>
              <button
                className="secondary-button"
                onClick={() => setChapterRetry((x) => x + 1)}
              >
                Retry Quran catalogue
              </button>
            </div>
          )}
          {fonts.failed && (
            <div className="notice">
              {fonts.hafsReady
                ? "A Mushaf page font could not load. Official Uthmanic Hafs is being used for those words."
                : "The Arabic font is still unavailable. Check your connection and reload for accurate Mushaf typography."}
            </div>
          )}
          {!loading &&
            chapter?.bismillah_pre &&
            firstPage === 1 &&
            bismillah &&
            fonts.hafsReady && (
              <section className="bismillah" aria-label="Bismillah">
                <div className="bismillah-ornament">
                  <span />
                  <i>✦</i>
                  <span />
                </div>
                <p lang="ar" dir="rtl">
                  {bismillah.words
                    .filter((w) => w.char_type_name === "word")
                    .map((w) => w.text_qpc_hafs || w.text_uthmani)
                    .join(" ")}
                </p>
                <small>
                  {plainText(
                    bismillah.translations.find(
                      (t) => t.resource_id === TRANSLATIONS[prefs.language].id,
                    )?.text || "",
                  )}
                </small>
              </section>
            )}
          {loading && (
            <div className="reader-loading" role="status">
              <LoaderCircle size={24} className="spin" />
              <strong>Opening the Quran…</strong>
              <p>Loading authentic text and translations.</p>
              <div className="verse-skeleton" />
              <div className="verse-skeleton" />
            </div>
          )}
          {!loading && firstPage > 1 && (
            <button
              className="previous-verses secondary-button"
              onClick={() =>
                navigate(
                  target.chapter,
                  Math.max(1, (firstPage - 2) * PAGE_SIZE + 1),
                )
              }
            >
              <ChevronLeft size={15} /> Earlier ayahs
            </button>
          )}
          <div className={readingOnly ? "verses reading-mode" : "verses"}>
            {verses.map((verse) => (
              <VerseCard
                key={verse.verse_key}
                verse={verse}
                prefs={prefs}
                pages={fonts.pages}
                hafsReady={fonts.hafsReady}
                active={player.key === verse.verse_key}
                activeWords={
                  player.key === verse.verse_key ? player.words : NO_WORDS
                }
                playing={player.key === verse.verse_key && player.playing}
                saved={bookmarks.some((b) => b.key === verse.verse_key)}
                readingOnly={readingOnly}
                copied={copied === verse.verse_key}
                onPlay={onPlay}
                onBookmark={onBookmark}
                onCopy={copyVerse}
                onShare={shareVerse}
                onTafsir={setTafsir}
                onWord={onWord}
              />
            ))}
          </div>
          {error && (
            <div className="error-box" role="alert">
              <p>{error}</p>
              <button
                className="secondary-button"
                onClick={() =>
                  verses.length
                    ? void loadMore()
                    : setTarget((p) => ({ ...p, version: p.version + 1 }))
                }
              >
                Try again
              </button>
            </div>
          )}
          {pagination?.next_page && (
            <div ref={sentinel} className="load-more">
              <button
                className="secondary-button"
                disabled={moreLoading}
                onClick={() => void loadMore()}
              >
                {moreLoading ? (
                  <LoaderCircle size={16} className="spin" />
                ) : null}
                {moreLoading ? "Loading more ayahs…" : "Load more ayahs"}
              </button>
              <small>
                {verses.length} of {chapter?.verses_count} ayahs loaded
              </small>
            </div>
          )}
          {!loading && verses.length > 0 && !pagination?.next_page && (
            <div className="surah-complete">
              <span className="completion-ornament">✦</span>
              <p>End of Surah {chapter?.name_simple}</p>
              <div className="surah-pagination">
                <button
                  className="secondary-button"
                  disabled={target.chapter === 1}
                  onClick={() => navigate(target.chapter - 1)}
                >
                  <ChevronLeft size={16} /> Previous surah
                </button>
                <button
                  className="secondary-button"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  Back to top
                </button>
                <button
                  className="primary-button"
                  disabled={target.chapter === 114}
                  onClick={() => navigate(target.chapter + 1)}
                >
                  Next surah <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
          <footer className="reader-footer">
            <span className="footer-brand">
              <BookOpen size={14} /> My Quran
            </span>
            <p>
              Quran data provided by{" "}
              <a
                href="https://quran.foundation"
                target="_blank"
                rel="noreferrer"
              >
                Quran.Foundation
              </a>
            </p>
            <div>
              <button onClick={() => setAbout(true)}>Sources</button>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
            </div>
          </footer>
        </div>
      </main>
      <AudioPlayer
        player={player}
        prefs={prefs}
        setPrefs={setPrefs}
        chapterName={chapter?.name_simple || "My Quran"}
        fallbackKey={visibleKey}
        onNext={() => moveAudio(1)}
        onPrevious={() => moveAudio(-1)}
        disabled={!verses.length}
      />
      {settings && (
        <Settings
          prefs={prefs}
          setPrefs={setPrefs}
          onClose={() => setSettings(false)}
        />
      )}{" "}
      {searchOpen && (
        <SearchDialog
          chapters={chapters}
          language={prefs.language}
          onNavigate={navigate}
          onClose={() => setSearchOpen(false)}
        />
      )}{" "}
      {tafsir && (
        <TafsirDialog verseKey={tafsir} onClose={() => setTafsir(null)} />
      )}
      {bookmarksOpen && (
        <Dialog title="Your bookmarks" onClose={() => setBookmarksOpen(false)}>
          <p className="panel-intro">
            Verses to return to, saved in this browser.
          </p>
          {bookmarks.length === 0 ? (
            <div className="empty-bookmarks">
              <Bookmark size={32} />
              <h3>A place for meaningful ayahs</h3>
              <p>Tap the bookmark beside any verse to save it here.</p>
            </div>
          ) : (
            bookmarks.map((b) => (
              <div className="bookmark-row" key={b.key}>
                <button
                  onClick={() => {
                    const [c, a] = b.key.split(":").map(Number);
                    navigate(c, a);
                    setBookmarksOpen(false);
                  }}
                >
                  <Bookmark size={17} />
                  <span>
                    <strong>{b.chapterName}</strong>
                    <small>Ayah {b.key}</small>
                  </span>
                  <ArrowUpRight size={17} />
                </button>
                <button
                  className="icon-button"
                  aria-label={`Remove bookmark ${b.key}`}
                  onClick={() => toggleBookmark(b.key, b.chapterName)}
                >
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </Dialog>
      )}
      {wordDetail && (
        <Dialog
          title={`Word meaning · ${wordDetail.verse.verse_key}`}
          onClose={closeWord}
        >
          <div className="word-detail">
            <p
              lang="ar"
              dir="rtl"
              style={{
                fontFamily:
                  prefs.font === "qcf" &&
                  fonts.pages.has(
                    wordDetail.word.v2_page || wordDetail.word.page_number,
                  )
                    ? `QCF_P${wordDetail.word.v2_page || wordDetail.word.page_number}`
                    : "UthmanicHafs",
              }}
            >
              {prefs.font === "qcf" &&
              fonts.pages.has(
                wordDetail.word.v2_page || wordDetail.word.page_number,
              )
                ? wordDetail.word.code_v2
                : wordDetail.word.text_qpc_hafs || wordDetail.word.text_uthmani}
            </p>
            <span className="word-transliteration">
              {wordDetail.word.transliteration?.text}
            </span>
            <h3>
              {wordDetail.word.translation
                ? plainText(wordDetail.word.translation.text)
                : "Meaning unavailable"}
            </h3>
            <small>
              {wordDetail.word.translation?.language_name || "English"} word
              meaning · Quran Foundation
            </small>
            {wordDetail.word.audio_url && (
              <button
                className="primary-button"
                onClick={() => void playWord()}
              >
                <Volume2 size={16} /> Listen to this word
              </button>
            )}
            <p className="field-help">
              Word-by-word learning audio uses the provider’s teaching
              recitation and may differ from your selected reciter.
            </p>
          </div>
        </Dialog>
      )}
      {about && (
        <Dialog
          title="A space to read and reflect"
          onClose={() => setAbout(false)}
        >
          <div className="about-reader">
            <span className="brand-emblem">
              <BookOpen size={28} />
            </span>
            <h3>My Quran</h3>
            <p>
              An independent Quran reader, inspired by the clarity of Quran.com.
              Read all 114 surahs and 6,236 ayahs in the standard Hafs
              numbering.
            </p>
            <h4>Authentic sources</h4>
            <p>
              Quran data provided by{" "}
              <a
                href="https://quran.foundation"
                target="_blank"
                rel="noreferrer"
              >
                Quran.Foundation
              </a>
              . Arabic is rendered with King Fahd Quran Complex QCF V2 page
              fonts, with official Uthmanic Hafs as a fallback.
            </p>
            <p>
              Malay: Abdullah Muhammad Basmeih.
              <br />
              English: Saheeh International.
              <br />
              Indonesian: Indonesian Islamic Affairs Ministry.
              <br />
              Tafsir: Ibn Kathir (Abridged), in English.
            </p>
            <h4>Listen and follow</h4>
            <p>
              Word highlighting follows actual provider timestamps. Where timing
              covers a group of words, the group is highlighted together. A
              recording without word timing uses verse highlighting and displays
              a notice.
            </p>
            <h4>Your reading stays yours</h4>
            <p>
              Bookmarks, reading progress, and preferences stay in your browser.
              Audio and Quran content require an internet connection. We do not
              generate Quran text or interpretations.
            </p>
            <div className="about-links">
              <a href="/privacy">
                Privacy policy <ArrowUpRight size={14} />
              </a>
              <a href="/terms">
                Terms of use <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </Dialog>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
