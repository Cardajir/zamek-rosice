import assert from "node:assert/strict";
import { test } from "node:test";
import { formatPlain, leadingQuotes, listedSegments } from "./text-blocks.ts";

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
