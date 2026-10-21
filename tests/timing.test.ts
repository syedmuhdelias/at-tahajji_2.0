import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeSegments, activeWordsAt } from "../lib/quran/timing.ts";
// Actual Alafasy 111:1 timestamps verified from the provider. No Quran text fixture.
const alafasy = [
  [0, 1, 30, 790],
  [1, 2, 800, 1320],
  [2, 3, 1330, 3880],
  [3, 4, 3890, 5440],
  [4, 5, 5450, 6680],
];
test("authentic Al-Masad timing follows each word and leaves real pauses unhighlighted", () => {
  const s = normalizeSegments(alafasy);
  assert.deepEqual(activeWordsAt(s, 0), []);
  assert.deepEqual(activeWordsAt(s, 0.5), [1]);
  assert.deepEqual(activeWordsAt(s, 0.795), []);
  assert.deepEqual(activeWordsAt(s, 0.8), [2]);
  assert.deepEqual(activeWordsAt(s, 2), [3]);
  assert.deepEqual(activeWordsAt(s, 4.5), [4]);
  assert.deepEqual(activeWordsAt(s, 6), [5]);
  assert.deepEqual(activeWordsAt(s, 6.68), []);
});
test("backward and forward seeks recalculate from the media clock", () => {
  const s = normalizeSegments(alafasy);
  assert.deepEqual(activeWordsAt(s, 6), [5]);
  assert.deepEqual(activeWordsAt(s, 0.2), [1]);
  assert.deepEqual(activeWordsAt(s, 4.4), [4]);
  assert.deepEqual(activeWordsAt(s, 1.1), [2]);
});
test("pausing leaves the same word at the unchanged currentTime", () => {
  const s = normalizeSegments(alafasy);
  assert.equal(activeWordsAt(s, 2.12), activeWordsAt(s, 2.12));
});
test("normalizes numeric strings and Foundation triplets", () => {
  assert.deepEqual(normalizeSegments([["0", "1", "30", "790"]]), [
    { words: [1], start: 30, end: 790 },
  ]);
  assert.deepEqual(normalizeSegments([[2, 100, 900]]), [
    { words: [2], start: 100, end: 900 },
  ]);
});
test("preserves multiword intervals without inventing per-word boundaries", () => {
  const s = normalizeSegments([[0, 3, 100, 1400]]);
  assert.deepEqual(activeWordsAt(s, 0.4), [1, 2, 3]);
  assert.deepEqual(activeWordsAt(s, 1.3), [1, 2, 3]);
});
test("rejects missing, malformed, negative, and reversed timing ranges", () => {
  for (const raw of [
    undefined,
    null,
    {},
    [],
    [[0, 1, 10]],
    [[0, 1, 900, 100]],
    [[0, 1, -30, 100]],
    [[0, 1, "bad", 100]],
    [[0, 0, 0, 10]],
  ])
    assert.deepEqual(normalizeSegments(raw), []);
});
test("repeated recorded word intervals remain usable", () => {
  const s = normalizeSegments([
    [0, 1, 10, 100],
    [0, 1, 500, 900],
  ]);
  assert.deepEqual(activeWordsAt(s, 0.6), [1]);
  assert.deepEqual(activeWordsAt(s, 0.3), []);
});
