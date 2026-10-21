"use client";
import { useCallback, useEffect, useState } from "react";
import { DEFAULT_PREFS, RECITERS, THEMES } from "@/lib/quran/config";
import type { Preferences, Bookmark, Progress } from "@/lib/quran/types";
const read = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
};
const color = (v: unknown, fallback: string) =>
  typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v : fallback;
const clamp = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.min(max, Math.max(min, v))
    : fallback;
export function useReaderState() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [ready, setReady] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  useEffect(() => {
    const p = read("myquran:preferences:v1");
    if (p && typeof p === "object")
      setPrefs({
        ...DEFAULT_PREFS,
        theme: THEMES.some((t) => t.id === p.theme) ? p.theme : "gold",
        accent: color(p.accent, DEFAULT_PREFS.accent),
        background: color(p.background, DEFAULT_PREFS.background),
        arabicColor: color(p.arabicColor, DEFAULT_PREFS.arabicColor),
        arabicSize: clamp(p.arabicSize, 24, 64, 38),
        translationSize: clamp(p.translationSize, 13, 24, 16),
        lineHeight: clamp(p.lineHeight, 1.7, 3.3, 2.35),
        font: p.font === "hafs" ? "hafs" : "qcf",
        language: ["ms", "en", "id"].includes(p.language) ? p.language : "ms",
        reciter: RECITERS.some((r) => r.id === p.reciter) ? p.reciter : 7,
        speed: clamp(p.speed, 0.5, 2, 1),
        volume: clamp(p.volume, 0, 1, 0.85),
        repeat: p.repeat === true,
        autoplay: p.autoplay !== false,
        follow: p.follow !== false,
        wordMeanings: p.wordMeanings === true,
      });
    const b = read("myquran:bookmarks:v1");
    if (Array.isArray(b))
      setBookmarks(
        b
          .filter(
            (x) =>
              x &&
              typeof x.key === "string" &&
              /^\d{1,3}:\d{1,3}$/.test(x.key) &&
              typeof x.chapterName === "string",
          )
          .slice(0, 1000),
      );
    const r = read("myquran:progress:v1");
    if (
      r &&
      Number.isInteger(r.chapter) &&
      r.chapter >= 1 &&
      r.chapter <= 114 &&
      Number.isInteger(r.ayah) &&
      r.ayah >= 1 &&
      r.ayah <= 286
    )
      setProgress(r);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("myquran:preferences:v1", JSON.stringify(prefs));
      localStorage.setItem("myquran:bookmarks:v1", JSON.stringify(bookmarks));
      if (progress)
        localStorage.setItem("myquran:progress:v1", JSON.stringify(progress));
    } catch {
      setStorageWarning(true);
    }
  }, [prefs, bookmarks, progress, ready]);
  const toggleBookmark = useCallback(
    (key: string, chapterName: string) =>
      setBookmarks((prev) =>
        prev.some((b) => b.key === key)
          ? prev.filter((b) => b.key !== key)
          : [...prev, { key, chapterName, savedAt: Date.now() }],
      ),
    [],
  );
  return {
    prefs,
    setPrefs,
    bookmarks,
    toggleBookmark,
    progress,
    setProgress,
    ready,
    storageWarning,
  };
}
