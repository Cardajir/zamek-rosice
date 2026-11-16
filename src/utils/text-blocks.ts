/**
 * Shapes in text an editor wrote that the design draws as more than running
 * text: the quotations a page opens with, and a list introduced by a line
 * ending in a colon.
 */

interface Span {
  _type?: string;
  text?: string;
  marks?: string[];
}

interface Block {
  _type?: string;
  style?: string;
  listItem?: string;
  children?: Span[];
}

export interface Quote {
  /** The quotation's paragraphs, without quotation marks around them. */
  paragraphs: string[];
  /** Who said or wrote it, when the text names them. */
  source?: string;
}

const asBlock = (value: unknown): Block =>
  value && typeof value === "object" ? (value as Block) : {};

const isText = (block: Block) => block._type === "block" && !block.listItem;

const textOf = (block: Block) =>
  (block.children ?? []).map((span) => span.text ?? "").join("");

const isQuote = (block: Block) =>
  isText(block) && block.style === "blockquote" && textOf(block).trim() !== "";

/* A source is an ordinary paragraph set wholly in italics. */
const isSource = (block: Block) => {
  if (!isText(block) || (block.style ?? "normal") !== "normal") return false;
  const spans = (block.children ?? []).filter((span) => span.text?.trim());
  return (
    spans.length > 0 && spans.every((span) => span.marks?.includes("em"))
  );
};

const OPENING = /^[\s„“”"«»‚‘’']+/;
const CLOSING = /[\s„“”"«»‚‘’']+$/;

/**
 * The quotations a text opens with, and the text after them. Each is one or
 * more paragraphs in the quotation style, optionally followed by an italic
 * paragraph naming its source. The quotation marks an editor typed are
 * dropped, so the design's own can be set around the whole quotation.
 */
export function leadingQuotes<T>(blocks: T[]): { quotes: Quote[]; rest: T[] } {
  const quotes: Quote[] = [];
  let index = 0;

  while (index < blocks.length && isQuote(asBlock(blocks[index]))) {
    const paragraphs: string[] = [];
    while (index < blocks.length && isQuote(asBlock(blocks[index]))) {
      paragraphs.push(textOf(asBlock(blocks[index])).trim());
      index += 1;
    }
    let source: string | undefined;
    if (index < blocks.length && isSource(asBlock(blocks[index]))) {
      source = textOf(asBlock(blocks[index])).trim();
      index += 1;
    }
    const last = paragraphs.length - 1;
    paragraphs[0] = paragraphs[0]!.replace(OPENING, "");
    paragraphs[last] = paragraphs[last]!.replace(CLOSING, "");
    quotes.push({ paragraphs, source });
  }

  return { quotes, rest: blocks.slice(index) };
}

export type Segment<T> =
  | { kind: "text"; blocks: T[] }
  | { kind: "listed"; label: T; items: T[] };

/* A short paragraph ending in a colon introduces the list right after it. */
const isLabel = (block: Block) => {
  if (!isText(block) || (block.style ?? "normal") !== "normal") return false;
  const text = textOf(block).trim();
  return text.endsWith(":") && text.length <= 60;
};

/**
 * The text cut where a list follows a line that introduces it ("Je
 * zakázáno:"). The design sets such a list beside its line, between rules.
 */
export function listedSegments<T>(blocks: T[]): Segment<T>[] {
  const segments: Segment<T>[] = [];
  let text: T[] = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index]!;
    const next = asBlock(blocks[index + 1]);
    if (isLabel(asBlock(block)) && next._type === "block" && next.listItem) {
      if (text.length > 0) segments.push({ kind: "text", blocks: text });
      text = [];
      const items: T[] = [];
      index += 1;
      while (index < blocks.length && asBlock(blocks[index]).listItem) {
        items.push(blocks[index]!);
        index += 1;
      }
      segments.push({ kind: "listed", label: block, items });
      continue;
    }
    text.push(block);
    index += 1;
  }

  if (text.length > 0) segments.push({ kind: "text", blocks: text });
  return segments;
}

export interface Run {
  text: string;
  bold: boolean;
}

/**
 * Plain text from a Studio text field with the little formatting it allows:
 * an empty line starts a paragraph, a line break stays one, and `**words**`
 * are set in bold. Paragraphs come back as lines of runs.
 */
export function formatPlain(value: string | undefined): Run[][][] {
  if (!value?.trim()) return [];
  return value
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) =>
      paragraph.split(/[\n\u{2028}]/u).map((line) =>
        line
          .split(/(\*\*[^*]+\*\*)/)
          .filter(Boolean)
          .map((part) =>
            part.startsWith("**") && part.endsWith("**") && part.length > 4
              ? { text: part.slice(2, -2), bold: true }
              : { text: part, bold: false },
          ),
      ),
    );
}
