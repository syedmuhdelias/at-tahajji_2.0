"use client";
import { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  ChevronUp,
  ChevronDown,
  LoaderCircle,
  Headphones,
  ListMusic,
} from "lucide-react";
import type { Preferences } from "@/lib/quran/types";
import type { useQuranAudio } from "@/hooks/use-quran-audio";
import { RECITERS } from "@/lib/quran/config";
const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
type Props = {
  player: ReturnType<typeof useQuranAudio>;
  prefs: Preferences;
  setPrefs: (fn: (p: Preferences) => Preferences) => void;
  chapterName: string;
  fallbackKey: string;
  onNext: () => void;
  onPrevious: () => void;
  disabled: boolean;
};
export function AudioPlayer({
  player,
  prefs,
  setPrefs,
  chapterName,
  fallbackKey,
  onNext,
  onPrevious,
  disabled,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const change = <K extends keyof Preferences>(k: K, v: Preferences[K]) =>
    setPrefs((p) => ({ ...p, [k]: v }));
  return (
    <section
      className={`audio-player ${expanded ? "player-expanded" : ""}`}
      aria-label="Quran audio player"
    >
      <input
        className="audio-progress"
        aria-label="Seek recitation"
        type="range"
        min="0"
        max={player.duration || 1}
        step="0.01"
        value={Math.min(player.time, player.duration || 1)}
        onChange={(e) => player.seek(Number(e.target.value))}
        disabled={!player.duration}
        style={
          {
            "--progress": `${player.duration ? (player.time / player.duration) * 100 : 0}%`,
          } as React.CSSProperties
        }
      />
      <div className="player-main">
        <div className="player-track">
          <div className="track-icon">
            <Headphones size={21} />
          </div>
          <div>
            <strong>
              {chapterName}{" "}
              <span className="track-ayah">
                · Ayah {(player.key || fallbackKey).split(":")[1]}
              </span>
            </strong>
            <span>{RECITERS.find((r) => r.id === prefs.reciter)?.short}</span>
          </div>
        </div>
        <div className="player-transport">
          <button
            className={`icon-button repeat-button ${prefs.repeat ? "gold" : ""}`}
            onClick={() => change("repeat", !prefs.repeat)}
            aria-label="Repeat current verse"
            aria-pressed={prefs.repeat}
          >
            <Repeat size={18} />
            {prefs.repeat && <i>1</i>}
          </button>
          <button
            className="icon-button"
            disabled={disabled}
            aria-label="Previous verse"
            onClick={onPrevious}
          >
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
            className="main-play"
            disabled={disabled || player.loading}
            aria-label={player.playing ? "Pause recitation" : "Play recitation"}
            onClick={() => void player.toggle(player.key || fallbackKey)}
          >
            {player.loading ? (
              <LoaderCircle className="spin" size={23} />
            ) : player.playing ? (
              <Pause size={23} fill="currentColor" />
            ) : (
              <Play size={23} fill="currentColor" />
            )}
          </button>
          <button
            className="icon-button"
            disabled={disabled}
            aria-label="Next verse"
            onClick={onNext}
          >
            <SkipForward size={20} fill="currentColor" />
          </button>
          <button
            className={`icon-button autoplay-button ${prefs.autoplay ? "gold" : ""}`}
            onClick={() => change("autoplay", !prefs.autoplay)}
            aria-label="Automatically play next verse"
            aria-pressed={prefs.autoplay}
          >
            <ListMusic size={19} />
          </button>
        </div>
        <div className="player-right">
          <span className="audio-clock">
            {clock(player.time)} <span>/ {clock(player.duration)}</span>
          </span>
          <button
            className="icon-button desktop-volume"
            onClick={() => change("volume", prefs.volume ? 0 : 0.85)}
            aria-label={prefs.volume ? "Mute" : "Unmute"}
          >
            {prefs.volume ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <input
            className="volume-slider desktop-volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={prefs.volume}
            onChange={(e) => change("volume", Number(e.target.value))}
            aria-label="Volume"
          />
          <button
            className="player-expand icon-button"
            onClick={() => setExpanded(!expanded)}
            aria-label={
              expanded ? "Collapse audio options" : "Expand audio options"
            }
            aria-expanded={expanded}
          >
            {expanded ? <ChevronDown size={19} /> : <ChevronUp size={19} />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="player-options">
          <label>
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
          <label>
            Speed
            <select
              value={prefs.speed}
              onChange={(e) => change("speed", Number(e.target.value))}
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((x) => (
                <option key={x} value={x}>
                  {x}×
                </option>
              ))}
            </select>
          </label>
          <label className="mobile-volume">
            Volume
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={prefs.volume}
              onChange={(e) => change("volume", Number(e.target.value))}
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={prefs.repeat}
              onChange={(e) => change("repeat", e.target.checked)}
            />{" "}
            Repeat ayah
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={prefs.autoplay}
              onChange={(e) => change("autoplay", e.target.checked)}
            />{" "}
            Auto-play next
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={prefs.follow}
              onChange={(e) => change("follow", e.target.checked)}
            />{" "}
            Follow recitation
          </label>
          <p className="timing-note">
            {player.hasTimings === true
              ? "Word highlighting uses recorded timestamps."
              : player.hasTimings === false
                ? "Word timestamps are unavailable for this recording. Verse highlighting is active."
                : "Choose a verse to begin listening."}
          </p>
        </div>
      )}
      {player.error && (
        <p className="player-error" role="alert">
          {player.error}
        </p>
      )}
      {!expanded && player.hasTimings === false && (
        <p className="player-error">
          Word timing unavailable for this recording · Verse highlighting only
        </p>
      )}
    </section>
  );
}
