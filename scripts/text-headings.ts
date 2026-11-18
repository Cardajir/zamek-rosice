// @ts-nocheck -- one-off content patch; the transforms run on untyped Portable Text.
/**
 * Headings for the logical parts of Svatby and Z historie (Czech): the
 * paragraphs the old site set in bold capitals or bold to title a part become
 * real headings, so the text shows its parts and spaces them as headings.
 * Levels follow the design's text pages (Návštěvní řád): Heading 2 for a part
 * of the page (the design's H3), Heading 3 for a part within it (H5, italic).
 * Blocks are found by key and their expected opening words; running it again
 * changes nothing. Run from the repo root:
 *
 *   npx sanity exec scripts/text-headings.ts --with-user-token                 # dry run
 *   npx sanity exec scripts/text-headings.ts --with-user-token -- --apply
 *
 * Published documents are patched, and the draft too when one is open.
 */
import { getCliClient } from "sanity/cli";

const text = (b) => (b.children ?? []).map((s) => s.text ?? "").join("");
const heading = (b, style, value) => ({
  ...b,
  style,
  markDefs: [],
  children: [{ _type: "span", _key: `${b._key}s`, text: value, marks: [] }],
});

/* key, the words the block must start with, the heading level and its text. */
const SVATBY = [
  ["m00028", "ROMANTICKÁ SVATBA", "h2", "Romantická svatba a fotografování svateb na zámku"],
  ["m0002w", "Informace o mimosoudním", "h3", "Informace o mimosoudním řešení spotřebitelských sporů (ADR) – doložka ADR"],
  ["m00037", "HUDEBNÍ SÁL", "h3", "Hudební sál – místo pro velkou svatbu (cca 120–140 osob)"],
  ["m0003s", "ZÁMECKÁ ZAHRADA", "h3", "Zámecká zahrada – místo pro romantickou svatbu venku"],
  ["m0004h", "ZÁMECKÁ KAPLE", "h3", "Zámecká kaple – místo pro malou svatbu (do cca 14 osob)"],
  ["m0004x", "HABSBURSKÝ SALONEK", "h3", "Habsburský salonek – místo pro menší svatbu (do cca 30 osob)"],
];

const HISTORY = [
  ["m0009k", "Stručná historie zámku", "h2", "Stručná historie zámku a jeho majitelů"],
  ["m000c5", "Stavební vývoj", "h2", "Stavební vývoj Rosického hradu a zámku"],
  ["m000c7", "Raně gotické období", "h3", "Raně gotické období"],
  ["m000cf", "Pozdně gotické", "h3", "Pozdně gotické / raně renesanční období"],
  ["m000cl", "Renesance / manýrismus", "h3", "Renesance / manýrismus"],
  ["m000cr", "Barokní období", "h3", "Barokní období"],
  ["m000d1", "Klasicismus", "h3", "Klasicismus"],
  ["m000d5", "Neoklasicismus", "h3", "Neoklasicismus"],
  ["m000db", "Napsali, natočili", "h2", "Napsali, natočili nebo řekli o zámku"],
];

/** Each listed block becomes its heading; one whose words differ is left alone. */
function headings(list) {
  return (blocks, log) =>
    blocks.map((b) => {
      const entry = list.find(([key]) => key === b._key);
      if (!entry) return b;
      const [, start, style, value] = entry;
      if (b.style === style && text(b) === value) return b;
      if (!text(b).trim().startsWith(start)) {
        log.push(`  ! ${b._key} no longer starts with "${start}", left alone`);
        return b;
      }
      log.push(`  ${b.style.padEnd(6)} -> ${style}  "${text(b).trim()}"\n${" ".repeat(20)}"${value}"`);
      return heading(b, style, value);
    });
}

/** Svatby: the greeting on the first line of a paragraph becomes a Heading 3 above it. */
function greeting(blocks, log) {
  return blocks.flatMap((b) => {
    const first = b.children?.[0];
    const match = b._type === "block" && b.style === "normal" && /^(Vážení snoubenci,)\s*\n/.exec(first?.text ?? "");
    if (!match) return [b];
    log.push(`  normal -> h3      "${match[1]}" (split off the paragraph under it)`);
    return [
      heading({ ...b, _key: `${b._key}h` }, "h3", match[1]),
      { ...b, children: [{ ...first, text: first.text.slice(match[0].length) }, ...b.children.slice(1)] },
    ];
  });
}

const args = process.argv.slice(2);
const write = args.includes("--apply");
const client = getCliClient({ apiVersion: "2026-11-01" });

/* Each copy (published, and the draft when one is open) is patched from its own text. */
async function patchPage(slug, transforms) {
  const docs = await client.fetch(
    `*[_type == "page" && language == "cs" && slug.current == $slug]{ _id, sections }`,
    { slug },
  );
  if (docs.length === 0) return console.log(`! no page ${slug}`);
  for (const doc of docs) {
    const section = doc.sections?.find((s) => s._type === "sectionRichText");
    const log = [];
    const after = transforms.reduce((blocks, transform) => transform(blocks, log), section?.body ?? []);
    console.log(`\n${slug} (${doc._id}):`);
    if (log.length === 0) {
      console.log("  nothing to change");
      continue;
    }
    console.log(log.join("\n"));
    if (!write) continue;
    await client.patch(doc._id).set({ [`sections[_key=="${section._key}"].body`]: after }).commit();
    console.log(`  written ${doc._id}`);
  }
}

await patchPage("svatby", [greeting, headings(SVATBY)]);
await patchPage("z-historie", [headings(HISTORY)]);

if (!write) console.log("\nDry run. Add -- --apply to write.");
