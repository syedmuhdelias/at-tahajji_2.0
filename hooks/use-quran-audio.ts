"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/quran/client";
import { audioUrl } from "@/lib/quran/config";
import { activeWordsAt, normalizeSegments } from "@/lib/quran/timing";
import type { AudioFile, Preferences, Segment } from "@/lib/quran/types";
export function useQuranAudio(
  prefs: Preferences,
  onAdvance: (key: string) => void,
) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const timings = useRef<Segment[]>([]);
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const config = useRef(prefs);
  config.current = prefs;
  const advance = useRef(onAdvance);
  advance.current = onAdvance;
  const loaded = useRef<{ key: string; reciter: number } | null>(null);
  const keyRef = useRef<string | null>(null);
  const [key, setKey] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [words, setWords] = useState<number[]>([]);
  const [hasTimings, setHasTimings] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const sync = useCallback(() => {
    const a = audio.current;
    if (!a) return;
    setTime(a.currentTime || 0);
    const active = activeWordsAt(timings.current, a.currentTime);
    setWords((prev) =>
      prev.length === active.length && prev.every((x, i) => x === active[i])
        ? prev
        : active,
    );
  }, []);
  useEffect(() => {
    const a = new Audio();
    a.preload = "metadata";
    audio.current = a;
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      const active = activeWordsAt(timings.current, a.currentTime);
      setWords((prev) =>
        prev.length === active.length && prev.every((x, i) => x === active[i])
          ? prev
          : active,
      );
      if (now - last > 90) {
        setTime(a.currentTime);
        last = now;
      }
      if (!a.paused) frame = requestAnimationFrame(tick);
    };
    const onPlay = () => {
      setPlaying(true);
      setLoading(false);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };
    const onPause = () => {
      setPlaying(false);
      cancelAnimationFrame(frame);
      sync();
    };
    const onMetadata = () => {
      setDuration(Number.isFinite(a.duration) ? a.duration : 0);
      setLoading(false);
    };
    const onEnd = () => {
      cancelAnimationFrame(frame);
      setWords([]);
      if (config.current.repeat) {
        a.currentTime = 0;
        a.play().catch(() => setError("Tap Play to continue recitation."));
      } else {
        setPlaying(false);
        if (config.current.autoplay && keyRef.current)
          advance.current(keyRef.current);
      }
    };
    const onError = () => {
      setLoading(false);
      setPlaying(false);
      setWords([]);
      setError(
        "This recitation could not be loaded. Try again or choose another reciter.",
      );
      loaded.current = null;
    };
    a.addEventListener("playing", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("loadedmetadata", onMetadata);
    a.addEventListener("durationchange", onMetadata);
    a.addEventListener("ended", onEnd);
    a.addEventListener("timeupdate", sync);
    a.addEventListener("seeked", sync);
    a.addEventListener("error", onError);
    return () => {
      generation.current++;
      controller.current?.abort();
      cancelAnimationFrame(frame);
      a.pause();
      a.removeEventListener("error", onError);
      a.src = "";
      audio.current = null;
    };
  }, [sync]);
  useEffect(() => {
    if (audio.current) {
      audio.current.volume = prefs.volume;
      audio.current.playbackRate = prefs.speed;
    }
  }, [prefs.volume, prefs.speed]);
  const load = useCallback(async (verseKey: string, autoplay = true) => {
    const a = audio.current;
    if (!a) return;
    controller.current?.abort();
    const request = ++generation.current;
    const abort = new AbortController();
    controller.current = abort;
    a.pause();
    a.removeAttribute("src");
    a.load();
    timings.current = [];
    loaded.current = null;
    keyRef.current = verseKey;
    setKey(verseKey);
    setTime(0);
    setDuration(0);
    setWords([]);
    setHasTimings(null);
    setError("");
    setLoading(true);
    try {
      const reciter = config.current.reciter;
      const data = await api<{ audio_files: AudioFile[] }>(
        { resource: "audio", key: verseKey, reciter },
        abort.signal,
      );
      if (request !== generation.current) return;
      const file =
        data.audio_files?.find((f) => f.verse_key === verseKey) ||
        data.audio_files?.[0];
      if (!file?.url)
        throw new Error("Audio is unavailable for this verse and reciter.");
      timings.current = normalizeSegments(file.segments);
      setHasTimings(timings.current.length > 0);
      loaded.current = { key: verseKey, reciter };
      a.src = audioUrl(file.url);
      a.volume = config.current.volume;
      a.playbackRate = config.current.speed;
      a.load();
      if (autoplay) await a.play();
      else setLoading(false);
    } catch (e) {
      if (abort.signal.aborted || request !== generation.current) return;
      setLoading(false);
      setPlaying(false);
      setError(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "Tap Play to start recitation in this browser."
          : e instanceof Error
            ? e.message
            : "Recitation could not be loaded.",
      );
    }
  }, []);
  const toggle = useCallback(
    async (fallbackKey: string) => {
      const a = audio.current;
      if (!a) return;
      setError("");
      if (
        loaded.current?.key === fallbackKey &&
        loaded.current.reciter === config.current.reciter
      ) {
        if (a.paused) {
          try {
            await a.play();
          } catch {
            setError("Tap Play again to start recitation.");
          }
        } else a.pause();
      } else await load(fallbackKey);
    },
    [load],
  );
  const stop = useCallback(() => {
    generation.current++;
    controller.current?.abort();
    audio.current?.pause();
    if (audio.current) {
      audio.current.removeAttribute("src");
      audio.current.load();
    }
    loaded.current = null;
    timings.current = [];
    keyRef.current = null;
    setKey(null);
    setTime(0);
    setDuration(0);
    setWords([]);
    setPlaying(false);
    setLoading(false);
    setHasTimings(null);
    setError("");
  }, []);
  const seek = useCallback(
    (seconds: number) => {
      if (audio.current && Number.isFinite(audio.current.duration)) {
        audio.current.currentTime = Math.max(
          0,
          Math.min(seconds, audio.current.duration),
        );
        sync();
      }
    },
    [sync],
  );
  const priorReciter = useRef(prefs.reciter);
  useEffect(() => {
    if (priorReciter.current !== prefs.reciter) {
      priorReciter.current = prefs.reciter;
      if (keyRef.current) void load(keyRef.current, !audio.current?.paused);
    }
  }, [prefs.reciter, load]);
  return {
    key,
    playing,
    loading,
    time,
    duration,
    words,
    hasTimings,
    error,
    load,
    toggle,
    stop,
    seek,
    pause: () => audio.current?.pause(),
  };
}
