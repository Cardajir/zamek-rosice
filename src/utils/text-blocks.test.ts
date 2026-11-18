import assert from "node:assert/strict";
import { test } from "node:test";
import {
  formatPlain,
  leadingQuotes,
  listedSegments,
  photoPlaces,
  photoRuns,
} from "./text-blocks.ts";

const block = (text: string, style = "normal", marks: string[] = []) => ({
  _type: "block",
  style,
  children: [{ _type: "span", text, marks }],
});
const item = (text: string) => ({ ...block(text), listItem: "bullet" });

test("quotations a text opens with leave it, each with its source", () => {
  const blocks = [
    block("„Dny jsou dlouhé …“", "blockquote"),
    block("Jeden z návštěvníků, 30.8.2020", "normal", ["em"]),
    block("První odstavec,", "blockquote"),
    block("druhý odstavec.“", "blockquote"),
    block("Vážení přátelé"),
  ];
  const { quotes, rest } = leadingQuotes(blocks);
  assert.deepEqual(quotes, [
    { paragraphs: ["Dny jsou dlouhé …"], source: "Jeden z návštěvníků, 30.8.2020" },
    { paragraphs: ["První odstavec,", "druhý odstavec."], source: undefined },
  ]);
  assert.deepEqual(rest, [blocks[4]]);
});

test("a quotation further down stays in the text", () => {
  const blocks = [block("Úvod"), block("Citace", "blockquote")];
  assert.deepEqual(leadingQuotes(blocks), { quotes: [], rest: blocks });
});

test("an italic paragraph that follows no quotation is not a source", () => {
  const blocks = [block("Kurzíva", "normal", ["em"])];
  assert.deepEqual(leadingQuotes(blocks).quotes, []);
});

test("a line ending in a colon takes the list after it", () => {
  const blocks = [
    block("Úvod"),
    block("Je zakázáno:"),
    item("kouřit,"),
    item("krmit zvířata."),
    block("Závěr"),
  ];
  assert.deepEqual(listedSegments(blocks), [
    { kind: "text", blocks: [blocks[0]] },
    { kind: "listed", label: blocks[1], items: [blocks[2], blocks[3]] },
    { kind: "text", blocks: [blocks[4]] },
  ]);
});

test("a colon with no list after it is ordinary text", () => {
  const blocks = [block("Kontakt:"), block("info@zamek.rosice.cz")];
  assert.deepEqual(listedSegments(blocks), [{ kind: "text", blocks }]);
});

test("plain text keeps its paragraphs, line breaks and bold words", () => {
  assert.deepEqual(formatPlain("**Malé parkoviště** je před zámkem.\n\nA\nB"), [
    [
      [
        { text: "Malé parkoviště", bold: true },
        { text: " je před zámkem.", bold: false },
      ],
    ],
    [[{ text: "A", bold: false }], [{ text: "B", bold: false }]],
  ]);
  assert.deepEqual(formatPlain("  "), []);
});

test("consecutive photographs are gathered into one run, a lone one too", () => {
  const photo = (key: string) => ({ _type: "imageWithAlt", _key: key });
  const blocks = [
    block("Úvod"),
    photo("a"),
    photo("b"),
    block("Mezi"),
    photo("c"),
  ];
  assert.deepEqual(photoRuns(blocks), [
    blocks[0],
    { _type: "photoRun", _key: "a", images: [blocks[1], blocks[2]] },
    blocks[3],
    { _type: "photoRun", _key: "c", images: [blocks[4]] },
  ]);
});

test("photographs fill their rows as the tour pages set them", () => {
  const sizes = (count: number) =>
    photoPlaces(count).map((place) => `${place.size[0]}${place.column}`);
  assert.deepEqual(sizes(1), ["w0"]);
  assert.deepEqual(sizes(3), ["w0", "h0", "h1"]);
  assert.deepEqual(sizes(4), ["h0", "h1", "h0", "h1"]);
  assert.deepEqual(sizes(6), ["h0", "h1", "q0", "q1", "q2", "q3"]);
  assert.deepEqual(sizes(8), [
    "w0", "h0", "h1", "q0", "q1", "q2", "q3", "w0",
  ]);
  assert.deepEqual(sizes(0), []);
});
