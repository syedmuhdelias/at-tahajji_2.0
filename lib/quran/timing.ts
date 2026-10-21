import type { Segment } from "./types";
/** Legacy ayah timestamps: [startWordIndex0, endWordIndexExclusive0, startMs, endMs].
 * Foundation triplets: [wordPosition1, startMs, endMs]. Preserve recorded ranges;
 * a multiword interval is highlighted together, never divided into guessed timings. */
export function normalizeSegments(raw: unknown): Segment[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .flatMap((entry: unknown) => {
      if (!Array.isArray(entry) || (entry.length !== 3 && entry.length !== 4))
        return [];
      const s = entry.map(Number);
      if (!s.every(Number.isFinite)) return [];
      const [from, to, start, end] =
        s.length === 4
          ? [s[0] + 1, s[1], s[2], s[3]]
          : [s[0], s[0], s[1], s[2]];
      if (
        !Number.isInteger(from) ||
        !Number.isInteger(to) ||
        from < 1 ||
        to < from ||
        to > 300 ||
        start < 0 ||
        end <= start
      )
        return [];
      return [
        {
          words: Array.from({ length: to - from + 1 }, (_, i) => from + i),
          start,
          end,
        },
      ];
    })
    .sort((a, b) => a.start - b.start);
}
const NONE: number[] = [];
export function activeWordsAt(segments: Segment[], seconds: number): number[] {
  const ms = seconds * 1000;
  for (let i = segments.length - 1; i >= 0; i--) {
    if (ms >= segments[i].start && ms < segments[i].end)
      return segments[i].words;
  }
  return NONE;
}
