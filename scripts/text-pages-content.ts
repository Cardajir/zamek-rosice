// @ts-nocheck -- one-off content patch; the transforms run on untyped Portable Text.
/**
 * Content patch for the design pass on Z historie, Návštěvní řád and Kde nás
 * najdete (Czech). Run from the repo root:
 *
 *   npx sanity exec scripts/text-pages-content.ts --with-user-token                 # dry run
 *   npx sanity exec scripts/text-pages-content.ts --with-user-token -- --apply
 *   ... -- --apply --short-terrai   # keep only the first sentence of the terrai.cz quote
 *
 * - Návštěvní řád: "NÁVŠTĚVNÍ ŘÁD" + "zámeckého areálu a zámku Rosice" become one
 *   Heading 2, "Vážení návštěvníci," Heading 3, "Správa zámku Rosice" Heading 4.
 * - Z historie: the opening visitor quotes get the "Citace" style (marks dropped),
 *   their italic source lines stay; the English copy of the first quote on the Czech
 *   page is removed; "Vážení přátelé, …" becomes Heading 4.
 * - visitInfo (Kde nás najdete, cs): paragraphs, line break and **bold** as in Figma.
 * Published documents are patched, and the draft too when one is open.
 */
import { getCliClient } from "sanity/cli";
// Pure content transforms for the Sanity patch (and the local ?patched preview).
const text = (b) => (b.children ?? []).map((s) => s.text ?? "").join("");
const plain = (b, style, marks = []) => ({
  ...b,
  style,
  markDefs: [],
  children: [{ _type: "span", _key: `${b._key}s`, text: text(b).trim(), marks }],
});

/** Návštěvní řád: title, greeting and signature become headings. */
function patchRules(blocks) {
  const out = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const t = b._type === "block" ? text(b).trim() : "";
    if (t === "NÁVŠTĚVNÍ ŘÁD" && text(blocks[i + 1] ?? {}).trim().startsWith("zámeckého areálu")) {
      out.push({
        ...plain(b, "h2"),
        children: [{ _type: "span", _key: `${b._key}s`, text: "Návštěvní řád zámeckého areálu a zámku Rosice", marks: [] }],
      });
      i += 1;
      continue;
    }
    if (t === "Vážení návštěvníci,") { out.push(plain(b, "h3")); continue; }
    if (t === "Správa zámku Rosice") { out.push(plain(b, "h4")); continue; }
    out.push(b);
  }
  return out;
}

/**
 * Z historie: the visitors' quotations become quotations (the English copy of
 * the first one on the Czech page is dropped), the greeting a heading.
 * `shortTerrai` keeps only the first sentence of the long terrai.cz excerpt.
 */
function patchHistory(blocks, { shortTerrai = false } = {}) {
  const out = [];
  let quoteZone = true;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const t = b._type === "block" ? text(b).trim() : "";
    const marks = (b.children ?? []).flatMap((s) => s.marks ?? []);
    if (quoteZone && b._type === "block") {
      if (t.startsWith("„The days are long")) continue;
      if (marks.includes("strong") && marks.includes("em")) {
        if (shortTerrai && t.startsWith("„Místní zámek")) {
          out.push({ ...plain(b, "blockquote"), children: [{ _type: "span", _key: `${b._key}s`, text: "„Místní zámek vlastní město a stará se dobře.“", marks: [] }] });
          while (blocks[i + 1] && (blocks[i + 1].children ?? []).some((s) => (s.marks ?? []).includes("strong"))) i += 1;
          continue;
        }
        out.push(plain(b, "blockquote"));
        continue;
      }
      if (marks.length > 0 && marks.every((m) => m === "em")) { out.push(plain(b, "normal", ["em"])); continue; }
      quoteZone = false;
    }
    if (t === "Vážení přátelé, vítáme Vás na oficiálních webových stránkách zámku Rosice.") { out.push(plain(b, "h4")); continue; }
    out.push(b);
  }
  return out;
}

/** Kde nás najdete: the paragraphs and bold words of the design (Czech). */
const DIRECTIONS_CS = {
  intro:
    "Město Rosice leží cca 20 km západně od Brna.\n\n**GPS souřadnice:** 49°10’56.80″N 16°23’10.52″E (49.182445, 16.386256)",
  byCar:
    "**Rosice jsou snadno přístupné z dálnice D1**, na příjezdu od Brna i od Prahy jsou umístěny informační tabule a směrovky vedoucí až k zámku. Samotný objekt zámku je na Žerotínově nám. 1, které bezprostředně navazuje na Komenského náměstí (zde je městské parkoviště bez poplatku). Ostatní viz mapa.\n\n**Malé parkoviště** se nachází i přímo před zámkem a v současné době je částečně zpoplatněno, částečně bez poplatku. Zájezdové autobusy objednaných výprav mají možnost parkovat po domluvě na 1. nádvoří zámku.",
  byTrain:
    "Vlaková stanice je vzdálená asi **15 minut chůze** od zámku. Při pohledu z nádraží je zámek jednou z dominant města. Stanice Rosice leží na trati Brno – Jihlava, trasa IDOS JMK S4.",
  byBus:
    "**Stanice Rosice** – Trávníky, asi 10 minut chůze od zámku.\n**Stanice Rosice** – Brněnská nebo Husova, asi 20 minut chůze od zámku.",
};

const args = process.argv.slice(2);
const write = args.includes("--apply");
const shortTerrai = args.includes("--short-terrai");
const client = getCliClient({ apiVersion: "2026-11-01" });

const ids = async (id: string) =>
  await client.fetch<string[]>(`*[_id in [$id, "drafts." + $id]]._id`, { id });

async function patchPage(slug: string, transform: (blocks: any[]) => any[]) {
  const page = await client.fetch<any>(
    `*[_type == "page" && language == "cs" && slug.current == $slug][0]{ _id, sections }`,
    { slug },
  );
  if (!page) return console.log(`! no page ${slug}`);
  const section = page.sections?.[0];
  const before = section.body as any[];
  const after = transform(before);
  console.log(`\n${slug}: ${before.length} -> ${after.length} blocks`);
  for (const b of after.slice(0, 14)) {
    const t = (b.children ?? []).map((s: any) => s.text).join("");
    console.log(`  ${b._type === "block" ? (b.style ?? "normal").padEnd(10) : b._type} ${t.slice(0, 70)}`);
  }
  if (!write) return;
  for (const id of await ids(page._id.replace(/^drafts\./, ""))) {
    await client.patch(id).set({ [`sections[_key=="${section._key}"].body`]: after }).commit();
    console.log(`  written ${id}`);
  }
}

await patchPage("navstevni-rad", patchRules);
await patchPage("z-historie", (blocks) => patchHistory(blocks, { shortTerrai }));

console.log("\nvisitInfo (cs):");
for (const [field, value] of Object.entries(DIRECTIONS_CS)) {
  console.log(`  ${field}: ${value.replace(/\n/g, " | ")}`);
}
if (write) {
  for (const id of await ids("visitInfo")) {
    await client
      .patch(id)
      .set(Object.fromEntries(Object.entries(DIRECTIONS_CS).map(([k, v]) => [`${k}.cs`, v])))
      .commit();
    console.log(`  written ${id}`);
  }
} else {
  console.log("\nDry run. Add -- --apply to write.");
}
