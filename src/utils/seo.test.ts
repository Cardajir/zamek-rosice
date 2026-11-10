import assert from "node:assert/strict";
import { test } from "node:test";
import { isLiveHost } from "./seo.ts";

test("only the public domain counts as the live site", () => {
  assert.equal(isLiveHost("zamek-rosice.cz"), true);
  assert.equal(isLiveHost("www.zamek-rosice.cz"), true);
  assert.equal(isLiveHost("zamek-rosice.example.workers.dev"), false);
  assert.equal(isLiveHost("localhost"), false);
});
