"use client";
import { memo } from "react";
import {
  Bookmark,
  BookOpen,
  Check,
  Copy,
  Pause,
  Play,
  Share2,
} from "lucide-react";
import { plainText, TRANSLATIONS } from "@/lib/quran/config";
import type { Verse, Word, Preferences } from "@/lib/quran/types";
type Props = {
  verse: Verse;
  prefs: Preferences;
  pages: Set<number>;
  hafsReady: boolean;
  active: boolean;
  activeWords: number[];
  playing: boolean;
  saved: boolean;
  readingOnly: boolean;
  copied: boolean;
  onPlay: (key: string) => void;
  onBookmark: (key: string) => void;
  onCopy: (verse: Verse) => void;
  onShare: (verse: Verse) => void;
  onTafsir: (key: string) => void;
  onWord: (word: Word, verse: Verse) => void;
};
function VerseCardView({
  verse,
  prefs,
  pages,
  hafsReady,
  active,
  activeWords,
  playing,
  saved,
  readingOnly,
  copied,
  onPlay,
  onBookmark,
  onCopy,
  onShare,
  onTafsir,
  onWord,
}: Props) {
  const translation = verse.translations?.find(
    (t) => t.resource_id === TRANSLATIONS[prefs.language].id,
  );
  return (
    <article
      id={`verse-${verse.verse_key}`}
      data-verse={verse.verse_number}
      className={`verse-card ${active ? "verse-active" : ""}`}
      aria-label={`Ayah ${verse.verse_key}`}
    >
      <div className="verse-toolbar">
        <div className="verse-tools-left">
          <span className="verse-reference">{verse.verse_key}</span>
          <button
            className="icon-button"
            onClick={() => onPlay(verse.verse_key)}
            aria-label={`${active && playing ? "Pause" : "Play"} verse ${verse.verse_key}`}
          >
            {active && playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            className={`icon-button ${saved ? "gold" : ""}`}
            onClick={() => onBookmark(verse.verse_key)}
            aria-label={`${saved ? "Remove" : "Save"} bookmark ${verse.verse_key}`}
            aria-pressed={saved}
          >
            <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
          </button>
          {active && playing && (
            <span className="playing-label">
              <span /> PLAYING
            </span>
          )}
        </div>
        <div className="verse-tools-right">
          <button
            className="icon-button"
            onClick={() => onCopy(verse)}
            aria-label={`Copy verse ${verse.verse_key}`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button
            className="icon-button"
            onClick={() => onShare(verse)}
            aria-label={`Share verse ${verse.verse_key}`}
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>
      <div
        className={`arabic-line ${prefs.wordMeanings ? "with-meanings" : ""}`}
        dir="rtl"
        lang="ar"
        aria-label={verse.text_uthmani}
      >
        {verse.words.map((word) => {
          const end = word.char_type_name === "end";
          const page = word.v2_page || word.page_number;
          const qcf =
            prefs.font === "qcf" && pages.has(page) && word.code_v2 && !end;
          const text = qcf
            ? word.code_v2
            : word.text_qpc_hafs || word.text_uthmani;
          const highlighted = active && activeWords.includes(word.position);
          if (end)
            return (
              <span
                key={word.position}
                className="ayah-marker"
                aria-label={`End of verse ${verse.verse_number}`}
              >
                <span>{word.text_qpc_hafs || word.text_uthmani}</span>
              </span>
            );
          if (word.char_type_name !== "word")
            return (
              <span
                key={word.position}
                style={{ fontFamily: qcf ? `QCF_P${page}` : "UthmanicHafs" }}
              >
                {text}
              </span>
            );
          return (
            <button
              key={word.position}
              className={`quran-word ${highlighted ? "word-active" : ""}`}
              onClick={() => onWord(word, verse)}
              title={
                word.translation
                  ? `${plainText(word.translation.text)} (${word.translation.language_name})`
                  : undefined
              }
              aria-label={`${word.text_uthmani}. ${word.translation?.text || "Word details"}`}
            >
              <span
                style={{
                  fontFamily: qcf ? `QCF_P${page}` : "UthmanicHafs",
                  visibility: qcf || hafsReady ? "visible" : "hidden",
                }}
                aria-hidden="true"
              >
                {text}
              </span>
              {prefs.wordMeanings && (
                <small lang="en" dir="ltr">
                  {word.translation ? plainText(word.translation.text) : "—"}
                </small>
              )}
            </button>
          );
        })}
      </div>
      {!readingOnly && (
        <div className="translation-block">
          <p className="translation" lang={prefs.language}>
            {translation
              ? plainText(translation.text)
              : "Translation unavailable for this verse."}
          </p>
          <span className="translation-attribution">
            {TRANSLATIONS[prefs.language].source}
          </span>
        </div>
      )}
      <div className="verse-footer">
        <button
          className="text-button"
          onClick={() => onTafsir(verse.verse_key)}
        >
          <BookOpen size={15} /> Tafsir <span className="mini-arrow">↗</span>
        </button>
        <span className="verse-location">
          Juz {verse.juz_number} <span>·</span> Page {verse.page_number}
        </span>
      </div>
    </article>
  );
}
export const VerseCard = memo(VerseCardView);
