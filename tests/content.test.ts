import assert from "node:assert/strict";
import test from "node:test";
import {
  contentSchema,
  safeImageUrl,
  videoEmbed,
} from "../lib/site/content.ts";
import { defaultContent } from "../lib/site/defaults.ts";
test("archive-derived content meets the server contract", () => {
  assert.equal(contentSchema.safeParse(defaultContent).success, true);
});
test("media rejects script URLs, protocol-relative URLs and local traversal", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,test",
    "//example.com/a.png",
    "/api/media/../../secret",
    "http://example.com/a.png",
  ])
    assert.equal(safeImageUrl(url), false, url);
  assert.equal(safeImageUrl("/brand/logo.png"), true);
  assert.equal(safeImageUrl("https://example.com/photo.jpg"), true);
});
test("video hosts are exact allowlists with validated IDs", () => {
  assert.equal(
    videoEmbed("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  );
  assert.equal(
    videoEmbed("https://vimeo.com/12345"),
    "https://player.vimeo.com/video/12345",
  );
  for (const url of [
    "https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ",
    "https://evil.test/youtube.com",
    "javascript:alert(1)",
    "https://youtu.be/bad",
    "http://vimeo.com/12345",
  ])
    assert.equal(videoEmbed(url), null);
});
test("server rejects malformed registration numbers and oversized content", () => {
  assert.equal(
    contentSchema.safeParse({
      ...defaultContent,
      contact: { ...defaultContent.contact, whatsapp: "javascript:alert(1)" },
    }).success,
    false,
  );
  assert.equal(
    contentSchema.safeParse({
      ...defaultContent,
      teachers: Array(13).fill(defaultContent.teachers[0]),
    }).success,
    false,
  );
});
