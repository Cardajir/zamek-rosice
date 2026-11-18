// @ts-nocheck -- one-off content patch; the transform runs on untyped Portable Text.
/**
 * Z historie (Czech): the old site set the owners' names in bold inside the
 * running text, which competes with the page's headings. Paragraphs before
 * "Napsali, natočili nebo řekli o zámku" lose their bold; the source titles
 * in that last part keep it, as labels. Neighbouring spans that end up with
 * the same marks are joined. Running it again changes nothing. From the repo root:
 *
 *   npx sanity exec scripts/history-unbold.ts --with-user-token                 # dry run
 *   npx sanity exec scripts/history-unbold.ts --with-user-token -- --apply
 *
 * Published documents are patched, and the draft too when one is open.
 */
import { getCliClient } from "sanity/cli";

const write = process.argv.slice(2).includes("--apply");
const client = getCliClient({ apiVersion: "2026-11-01" });

const STOP = "Napsali, natočili";
const text = (b) => (b.children ?? []).map((s) => s.text ?? "").join("");
const isBold = (s) => (s.marks ?? []).includes("strong");

/** The paragraph without bold, adjacent spans with equal marks joined. */
function unbold(b) {
  const spans = [];
  for (const s of b.children ?? []) {
    const marks = (s.marks ?? []).filter((m) => m !== "strong");
    const last = spans.at(-1);
    if (last && last._type === "span" && s._type === "span" && last.marks.join() === marks.join()) {
      last.text += s.text ?? "";
    } else {
      spans.push({ ...s, marks });
    }
  }
  return { ...b, children: spans };
}

const docs = await client.fetch(
  `*[_type == "page" && language == "cs" && slug.current == "z-historie"]{ _id, sections }`,
);
if (docs.length === 0) console.log("! no page z-historie");

for (const doc of docs) {
  const section = doc.sections?.find((s) => s._type === "sectionRichText");
  const body = section?.body ?? [];
  const stop = body.findIndex((b) => b._type === "block" && text(b).startsWith(STOP));
  const end = stop === -1 ? body.length : stop;
  const changed = [];
  const after = body.map((b, i) => {
    if (i >= end || b._type !== "block" || b.style !== "normal") return b;
    const bold = (b.children ?? []).filter(isBold);
    if (bold.length === 0) return b;
    changed.push(`  ${b._key}  ${bold.map((s) => `"${s.text.trim()}"`).join(", ")}`);
    return unbold(b);
  });
  console.log(`\n${doc._id}: ${changed.length} paragraph(s)`);
  console.log(changed.join("\n"));
  if (!write || changed.length === 0) continue;
  await client
    .patch(doc._id)
    .set({ [`sections[_key=="${section._key}"].body`]: after })
    .commit();
  console.log(`  written ${doc._id}`);
}

if (!write) console.log("\nDry run. Add -- --apply to write.");
