import type { Preferences, Language } from "./types";
export const PAGE_SIZE = 20;
export const TRANSLATIONS: Record<
  Language,
  { id: number; name: string; source: string }
> = {
  ms: { id: 39, name: "Bahasa Melayu", source: "Abdullah Muhammad Basmeih" },
  en: { id: 20, name: "English", source: "Saheeh International" },
  id: {
    id: 33,
    name: "Bahasa Indonesia",
    source: "Indonesian Ministry of Religious Affairs",
  },
};
export const RECITERS = [
  { id: 7, name: "Mishary Rashid Alafasy", short: "Mishary Alafasy" },
  { id: 3, name: "Abdur-Rahman as-Sudais", short: "Abdur-Rahman as-Sudais" },
  { id: 4, name: "Abu Bakr al-Shatri", short: "Abu Bakr al-Shatri" },
  { id: 6, name: "Mahmoud Khalil Al-Husary", short: "Mahmoud Al-Husary" },
];
export const THEMES = [
  {
    id: "gold",
    name: "Dark Gold",
    accent: "#E7B451",
    background: "#1D1F23",
    arabicColor: "#FFFFFF",
  },
  {
    id: "emerald",
    name: "Emerald Green",
    accent: "#73CAA8",
    background: "#192420",
    arabicColor: "#F2F8F4",
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    accent: "#7DB9ED",
    background: "#19222C",
    arabicColor: "#F1F6FC",
  },
  {
    id: "purple",
    name: "Royal Purple",
    accent: "#BDA0ED",
    background: "#241E2D",
    arabicColor: "#F8F3FF",
  },
  {
    id: "cream",
    name: "Light Cream",
    accent: "#947027",
    background: "#F7F3EA",
    arabicColor: "#29261F",
  },
];
export const DEFAULT_PREFS: Preferences = {
  theme: "gold",
  accent: "#E7B451",
  background: "#1D1F23",
  arabicColor: "#FFFFFF",
  arabicSize: 38,
  translationSize: 16,
  lineHeight: 2.35,
  font: "qcf",
  language: "ms",
  reciter: 7,
  speed: 1,
  volume: 0.85,
  repeat: false,
  autoplay: true,
  follow: true,
  wordMeanings: false,
};
export const QCF_URL = (page: number) =>
  `https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p${page}.woff2`;
export const HAFS_URL =
  "https://verses.quran.foundation/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2";
export const audioUrl = (path: string) =>
  path.startsWith("https://")
    ? path
    : `https://verses.quran.foundation/${path.replace(/^\//, "")}`;
export function plainText(html: string) {
  return html
    .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, "")
    .replace(/<\/(?:p|h\d|div)>/gi, "\n\n")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => {
      const v = Number(n);
      return v <= 0x10ffff ? String.fromCodePoint(v) : "";
    })
    .trim();
}
export function parseReference(value: string) {
  const match = value.trim().match(/^(\d{1,3})\s*[:：]\s*(\d{1,3})$/);
  return match ? { chapter: Number(match[1]), ayah: Number(match[2]) } : null;
}
