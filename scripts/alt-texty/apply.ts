/**
 * Writes the alt texts `read.py` collected back into Sanity.
 *
 *   npm run alt:apply                      # dry run, prints what would change
 *   npm run alt:apply -- --apply           # writes
 *   npm run alt:apply -- --apply --force   # also overwrites texts edited since the export
 *   npm run alt:apply -- other.json --apply
 *
 * Each change names a document, the path of the photo in it and the asset the
 * photo was at export time. A photo that has since been moved, removed or
 * replaced is skipped, and so is one whose Czech alt was edited in the Studio
 * since the export, unless `--force`. The published document is patched, and
 * its draft too when one is open, so publishing the draft keeps the new text.
 *
 * The English alt of a changed photo is left as it was; the run
 * lists them, since they no longer match the Czech.
 */
import { readFileSync } from "node:fs";
import { getCliClient } from "sanity/cli";

type Change = {
  id: number;
  docId: string;
  docType: string;
  path: string;
  assetRef: string;
  old: string;
  new: string;
  hadTranslation: boolean;
};

type Image = {
  _type: string;
  asset?: { _ref?: string };
  alt?: { cs?: string; en?: string };
};

const args = process.argv.slice(2);
const write = args.includes("--apply");
const force = args.includes("--force");
const file =
  args.find((a) => !a.startsWith("--")) ?? "tmp/alt-texty/zmeny.json";

const client = getCliClient({ apiVersion: "2026-11-01" });
const changes: Change[] = JSON.parse(readFileSync(file, "utf8"));

/** Every imageWithAlt in a document by the same path export.py wrote. */
function images(value: unknown, path = "", found = new Map<string, Image>()) {
  if (Array.isArray(value)) {
    value.forEach((item, i) => {
      const step =
        item && typeof item === "object" && "_key" in item
          ? `[_key=="${(item as { _key: string })._key}"]`
          : `[${i}]`;
      images(item, path + step, found);
    });
  } else if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (obj._type === "imageWithAlt" && (obj.asset as Image["asset"])?._ref)
      found.set(path, obj as Image);
    for (const [key, child] of Object.entries(obj))
      if (key !== "asset") images(child, path ? `${path}.${key}` : key, found);
  }
  return found;
}

const norm = (s: string | undefined) => (s ?? "").split(/\s+/).join(" ").trim();

const byDoc = Map.groupBy(changes, (c) => c.docId);
const skipped: string[] = [];
const stale: number[] = [];
let done = 0;

for (const [docId, docChanges] of byDoc) {
  const [published, draft] = await Promise.all([
    client.getDocument(docId),
    client.getDocument(`drafts.${docId}`),
  ]);
  const targets = [published, draft].filter(Boolean) as { _id: string }[];
  if (!published) {
    docChanges.forEach((c) =>
      skipped.push(`č. ${c.id}: dokument ${docId} už neexistuje`),
    );
    continue;
  }
  const tx = client.transaction();
  let any = false;
  for (const c of docChanges) {
    const now = images(published).get(c.path);
    if (now?.asset?._ref !== c.assetRef) {
      skipped.push(
        `č. ${c.id}: fotka v ${docId} se od exportu přesunula nebo vyměnila`,
      );
      continue;
    }
    if (norm(now.alt?.cs) !== norm(c.old) && !force) {
      skipped.push(
        `č. ${c.id}: alt se mezitím ve Studiu změnil na „${now.alt?.cs}“ (--force přepíše)`,
      );
      continue;
    }
    console.log(`č. ${c.id} ${docId}\n   „${c.old}“\n → „${c.new}“`);
    for (const target of targets) {
      if (!images(target).has(c.path)) continue;
      tx.patch(target._id, (p) =>
        p
          .setIfMissing({ [`${c.path}.alt`]: { _type: "localizedString" } })
          .set({ [`${c.path}.alt.cs`]: c.new }),
      );
    }
    if (now.alt?.en) stale.push(c.id);
    any = true;
    done++;
  }
  /* Without --apply, Sanity still checks the patches, but stores nothing. */
  if (any) await tx.commit({ autoGenerateArrayKeys: false, dryRun: !write });
}

console.log(
  `\n${write ? "Zapsáno" : "Zapsalo by se (zkouška, přidej --apply)"}: ${done}`,
);
if (skipped.length)
  console.log(`Přeskočeno ${skipped.length}:\n  ${skipped.join("\n  ")}`);
if (stale.length)
  console.log(
    `Anglický alt už neodpovídá českému, přeložit: č. ${stale.join(", ")}`,
  );
