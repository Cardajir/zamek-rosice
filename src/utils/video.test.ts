import { test } from "node:test";
import assert from "node:assert/strict";
import { embedUrl, parseVideo, youtubeThumbnail } from "./video.ts";

test("YouTube links are read whichever way they were copied", () => {
  const id = "dQw4w9WgXcQ";
  for (const link of [
    `https://www.youtube.com/watch?v=${id}&t=42s`,
    `https://youtu.be/${id}?si=abc`,
    `https://m.youtube.com/watch?v=${id}`,
    `https://www.youtube.com/shorts/${id}`,
    `https://www.youtube.com/embed/${id}`,
    `https://www.youtube.com/live/${id}`,
  ]) {
    assert.deepEqual(parseVideo(link), { provider: "youtube", id }, link);
  }
  assert.equal(
    embedUrl({ provider: "youtube", id }),
    `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
  );
  assert.equal(
    youtubeThumbnail({ provider: "youtube", id }),
    `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
  );
});

test("Vimeo links keep an unlisted video's hash and ask not to track", () => {
  assert.deepEqual(parseVideo("https://vimeo.com/76979871"), {
    provider: "vimeo",
    id: "76979871",
  });
  assert.deepEqual(parseVideo("https://vimeo.com/76979871/abc123def0"), {
    provider: "vimeo",
    id: "76979871",
    hash: "abc123def0",
  });
  assert.deepEqual(
    parseVideo("https://player.vimeo.com/video/76979871?h=abc123"),
    { provider: "vimeo", id: "76979871", hash: "abc123" },
  );
  assert.equal(
    embedUrl({ provider: "vimeo", id: "76979871", hash: "abc123" }),
    "https://player.vimeo.com/video/76979871?dnt=1&h=abc123",
  );
});

test("anything else is not a video the site can play", () => {
  assert.equal(parseVideo(undefined), undefined);
  assert.equal(parseVideo("not a link"), undefined);
  assert.equal(parseVideo("https://www.youtube.com/@zamekrosice"), undefined);
  assert.equal(parseVideo("https://www.youtube.com/watch?v=short"), undefined);
  assert.equal(parseVideo("https://vimeo.com/channels/staffpicks"), undefined);
  assert.equal(parseVideo("https://example.com/video.mp4"), undefined);
});
