export type Chapter = {
  id: number;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  translated_name: { name: string };
  verses_count: number;
  revelation_place: string;
  pages: number[];
  bismillah_pre: boolean;
};
export type Word = {
  id: number;
  position: number;
  char_type_name: string;
  code_v2?: string;
  v2_page?: number;
  page_number: number;
  text_uthmani: string;
  text_qpc_hafs?: string;
  audio_url?: string;
  translation?: { text: string; language_name: string };
  transliteration?: { text: string };
};
export type Verse = {
  id: number;
  verse_key: string;
  verse_number: number;
  page_number: number;
  juz_number: number;
  hizb_number: number;
  text_uthmani: string;
  words: Word[];
  translations: { resource_id: number; text: string }[];
};
export type VersePage = {
  verses: Verse[];
  pagination: {
    current_page: number;
    next_page: number | null;
    total_pages: number;
    total_records: number;
  };
};
export type Segment = { words: number[]; start: number; end: number };
export type AudioFile = {
  url: string;
  segments?: number[][];
  duration?: number;
  verse_key: string;
};
export type Language = "ms" | "en" | "id";
export type Preferences = {
  theme: string;
  accent: string;
  background: string;
  arabicColor: string;
  arabicSize: number;
  translationSize: number;
  lineHeight: number;
  font: "qcf" | "hafs";
  language: Language;
  reciter: number;
  speed: number;
  volume: number;
  repeat: boolean;
  autoplay: boolean;
  follow: boolean;
  wordMeanings: boolean;
};
export type Bookmark = { key: string; chapterName: string; savedAt: number };
export type Progress = { chapter: number; ayah: number; updatedAt: number };
