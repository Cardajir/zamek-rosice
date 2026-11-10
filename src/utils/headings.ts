/**
 * Heading levels in text an editor wrote. A page has one `h1`, its title, so
 * the text under it starts at `h2` and never skips a level on the way down:
 * a screen reader's outline of the page then matches what is on it. An editor
 * who picks "Heading 4" for its size still gets a heading in the right place.
 */

interface Block {
  _type?: string;
  style?: string;
  [key: string]: unknown;
}

const levelOf = (block: Block): number | undefined => {
  const match = block._type === "block" && /^h([1-6])$/.exec(block.style ?? "");
  return match ? Number(match[1]) : undefined;
};

/**
 * The same blocks with their headings renumbered. Headings an editor gave
 * the same level stay siblings; a heading deeper than the one before it sits
 * exactly one level below.
 *
 * @param first The level of the outermost heading in the text.
 */
export function levelHeadings<T>(blocks: T[], first = 2): T[] {
  const open: { from: number; to: number }[] = [];

  return blocks.map((block) => {
    const from = levelOf(block as Block);
    if (from === undefined) return block;

    while (open.length > 0 && open[open.length - 1]!.from > from) open.pop();

    const parent = open[open.length - 1];
    let to: number;
    if (parent?.from === from) {
      to = parent.to;
    } else {
      to = Math.min(parent ? parent.to + 1 : first, 6);
      open.push({ from, to });
    }

    return to === from ? block : { ...block, style: `h${to}` };
  });
}
