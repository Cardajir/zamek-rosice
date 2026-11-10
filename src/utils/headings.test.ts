import assert from "node:assert/strict";
import { test } from "node:test";
import { levelHeadings } from "./headings.ts";

const text = (styles: string[]) =>
  styles.map((style) => ({ _type: "block", style }));
const styles = (blocks: { style?: string }[]) =>
  blocks.map((block) => block.style);

test("text under a page title starts at h2", () => {
  assert.deepEqual(styles(levelHeadings(text(["h4", "normal", "h4"]))), [
    "h2",
    "normal",
    "h2",
  ]);
});

test("a level is never skipped on the way down", () => {
  assert.deepEqual(
    styles(levelHeadings(text(["h2", "h4", "h4", "h2", "h5"]))),
    ["h2", "h3", "h3", "h2", "h3"],
  );
});

test("a well-formed outline is left as it is", () => {
  const blocks = text(["h2", "normal", "h3", "h4", "h3", "h2"]);
  assert.deepEqual(levelHeadings(blocks), blocks);
});

test("an h1 in the text does not compete with the page title", () => {
  assert.deepEqual(styles(levelHeadings(text(["h1", "h2"]))), ["h2", "h3"]);
});

test("a shallower heading after a deeper start becomes its sibling's parent level", () => {
  assert.deepEqual(styles(levelHeadings(text(["h4", "h2", "h4"]))), [
    "h2",
    "h2",
    "h3",
  ]);
});

test("blocks that are not headings pass through untouched", () => {
  const image = { _type: "imageWithAlt", url: "x" };
  const list = { _type: "block", style: "normal", listItem: "bullet" };
  assert.deepEqual(levelHeadings([image, list]), [image, list]);
});
