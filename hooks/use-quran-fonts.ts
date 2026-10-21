"use client";
import { useEffect, useState } from "react";
import { QCF_URL, HAFS_URL } from "@/lib/quran/config";
import type { Verse } from "@/lib/quran/types";
const loaded = new Set<number>();
const inFlight = new Map<number, Promise<void>>();
async function loadPage(page: number) {
  if (loaded.has(page)) return;
  if (inFlight.has(page)) return inFlight.get(page);
  const job = (async () => {
    const font = new FontFace(`QCF_P${page}`, `url("${QCF_URL(page)}")`);
    await font.load();
    document.fonts.add(font);
    loaded.add(page);
  })();
  inFlight.set(page, job);
  try {
    await job;
  } finally {
    inFlight.delete(page);
  }
}
export function useQuranFonts(verses: Verse[], mode: "qcf" | "hafs") {
  const [pages, setPages] = useState<Set<number>>(new Set());
  const [failed, setFailed] = useState(false);
  const [hafsReady, setHafsReady] = useState(false);
  const pageKey = Array.from(
    new Set(
      verses.flatMap((v) => v.words.map((w) => w.v2_page || w.page_number)),
    ),
  )
    .sort((a, b) => a - b)
    .join(",");
  useEffect(() => {
    let alive = true;
    const font = new FontFace("UthmanicHafs", `url("${HAFS_URL}")`);
    font
      .load()
      .then((f) => {
        document.fonts.add(f);
        if (alive) setHafsReady(true);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (mode !== "qcf" || !pageKey) return;
    let alive = true;
    setFailed(false);
    const pendingPages = pageKey.split(",").map(Number);
    Promise.allSettled(pendingPages.map(loadPage)).then((results) => {
      if (alive) {
        setPages(new Set(loaded));
        setFailed(results.some((r) => r.status === "rejected"));
      }
    });
    return () => {
      alive = false;
    };
  }, [pageKey, mode]);
  return { pages, failed, hafsReady };
}
