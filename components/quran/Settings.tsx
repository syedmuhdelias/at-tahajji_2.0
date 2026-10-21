"use client";
import { Check, RotateCcw, Type, Palette, Headphones } from "lucide-react";
import type { Preferences } from "@/lib/quran/types";
import {
  DEFAULT_PREFS,
  THEMES,
  TRANSLATIONS,
  RECITERS,
} from "@/lib/quran/config";
import { Dialog } from "./Dialog";
export function Settings({
  prefs,
  setPrefs,
  onClose,
}: {
  prefs: Preferences;
  setPrefs: (fn: (p: Preferences) => Preferences) => void;
  onClose: () => void;
}) {
  const change = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setPrefs((p) => ({ ...p, [key]: value }));
  return (
    <Dialog title="Make it yours" drawer onClose={onClose}>
      <p className="panel-intro">A comfortable space for your daily reading.</p>
      <div className="settings-section">
        <h3>
          <Palette size={17} /> Appearance
        </h3>
        <div className="theme-grid">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`theme-choice ${prefs.theme === t.id ? "theme-selected" : ""}`}
              onClick={() =>
                setPrefs((p) => ({
                  ...p,
                  theme: t.id,
                  accent: t.accent,
                  background: t.background,
                  arabicColor: t.arabicColor,
                }))
              }
            >
              <span
                className="theme-preview"
                style={{ background: t.background, color: t.accent }}
              >
                <span>Aa</span>
                {prefs.theme === t.id && <Check size={14} />}
              </span>
              <small>{t.name}</small>
            </button>
          ))}
        </div>
        <div className="color-settings">
          {(
            [
              { key: "accent", label: "Highlight color" },
              { key: "background", label: "Background" },
              { key: "arabicColor", label: "Arabic text" },
            ] as const
          ).map(({ key, label }) => (
            <label key={key}>
              {label}
              <span>
                <code>{prefs[key]}</code>
                <input
                  type="color"
                  value={prefs[key]}
                  onChange={(e) => change(key, e.target.value)}
                  aria-label={label}
                />
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className="settings-section">
        <h3>
          <Type size={17} /> Reading & typography
        </h3>
        <label className="field-label">
          Arabic font
          <select
            value={prefs.font}
            onChange={(e) =>
              change("font", e.target.value as Preferences["font"])
            }
          >
            <option value="qcf">QCF V2 · Madani Mushaf</option>
            <option value="hafs">Uthmanic Hafs · Official Unicode</option>
          </select>
        </label>
        <p className="field-help">
          QCF V2 loads the authentic font for each Mushaf page. If unavailable,
          the reader uses official Uthmanic Hafs text and font.
        </p>
        {(
          [
            {
              key: "arabicSize",
              label: "Arabic font size",
              min: 24,
              max: 64,
              step: 1,
              unit: "px",
            },
            {
              key: "translationSize",
              label: "Translation size",
              min: 13,
              max: 24,
              step: 1,
              unit: "px",
            },
            {
              key: "lineHeight",
              label: "Line spacing",
              min: 1.7,
              max: 3.3,
              step: 0.05,
              unit: "×",
            },
          ] as const
        ).map((s) => (
          <label className="range-field" key={s.key}>
            <span>
              {s.label}
              <output>
                {Number(prefs[s.key].toFixed(2))}
                {s.unit}
              </output>
            </span>
            <input
              aria-label={s.label}
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={prefs[s.key]}
              onChange={(e) => change(s.key, Number(e.target.value))}
            />
          </label>
        ))}
        <label className="field-label">
          Translation language
          <select
            value={prefs.language}
            onChange={(e) =>
              change("language", e.target.value as Preferences["language"])
            }
          >
            {Object.entries(TRANSLATIONS).map(([key, t]) => (
              <option key={key} value={key}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="switch-row">
          Show word-by-word meanings
          <input
            type="checkbox"
            checked={prefs.wordMeanings}
            onChange={(e) => change("wordMeanings", e.target.checked)}
          />
        </label>
        <p className="field-help">
          English word meanings are provided by Quran Foundation. The verse
          translation follows your language selection.
        </p>
      </div>
      <div className="settings-section">
        <h3>
          <Headphones size={17} /> Recitation
        </h3>
        <label className="field-label">
          Reciter
          <select
            value={prefs.reciter}
            onChange={(e) => change("reciter", Number(e.target.value))}
          >
            {RECITERS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label">
          Playback speed
          <select
            value={prefs.speed}
            onChange={(e) => change("speed", Number(e.target.value))}
          >
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((n) => (
              <option value={n} key={n}>
                {n}×
              </option>
            ))}
          </select>
        </label>
        <label className="switch-row">
          Auto-play next ayah
          <input
            type="checkbox"
            checked={prefs.autoplay}
            onChange={(e) => change("autoplay", e.target.checked)}
          />
        </label>
        <label className="switch-row">
          Follow the active ayah
          <input
            type="checkbox"
            checked={prefs.follow}
            onChange={(e) => change("follow", e.target.checked)}
          />
        </label>
      </div>
      <button
        className="secondary-button reset-button"
        onClick={() => setPrefs(() => ({ ...DEFAULT_PREFS }))}
      >
        <RotateCcw size={15} /> Restore defaults
      </button>
      <p className="field-help">
        Preferences and bookmarks are saved only in this browser.
      </p>
    </Dialog>
  );
}
