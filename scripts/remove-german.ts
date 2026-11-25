// @ts-nocheck -- one-off content clean-up on untyped documents.
/**
 * The German version was dropped before launch. This removes what is left of
 * it in the dataset: the `de` value of every localised field (an object that
 * also has `cs`), the German file of a document (`fileDe`), and documents
 * written in German (`language == "de"`). Drafts are cleaned as well.
 * Running it again changes nothing.
 *
 *   npx sanity exec scripts/remove-german.ts --with-user-token              # dry run
 *   npx sanity exec scripts/remove-german.ts --with-user-token -- --apply
 */
import { getCliClient } from "sanity/cli";

const write = process.argv.slice(2).includes("--apply");
const client = getCliClient({ apiVersion: "2026-11-01" });

/** Copies a value without German: `de` beside `cs`, and `fileDe`. */
function strip(value, found) {
  if (Array.isArray(value)) return value.map((item) => strip(item, found));
  if (!value || typeof value !== "object") return value;
  const out = {};
  const localised = "cs" in value || "en" in value;
  for (const [key, item] of Object.entries(value)) {
    if ((key === "de" && localised) || key === "fileDe") {
      found.count += 1;
      continue;
    }
    out[key] = strip(item, found);
  }
  return out;
}

const ids = await client.fetch(`*[!(_type match "sanity.*") && !(_type match "system.*")]._id`);
const german = [];
const patched = [];
let fields = 0;
const tx = client.transaction();

for (const id of ids) {
  const doc = await client.getDocument(id);
  if (!doc) continue;
  if (doc.language === "de") {
    german.push(`${id} (${doc._type}${doc.title ? `: ${typeof doc.title === "string" ? doc.title : doc.title.de ?? doc.title.cs}` : ""})`);
    tx.delete(id);
    continue;
  }
  const found = { count: 0 };
  const clean = strip(doc, found);
  if (found.count === 0) continue;
  fields += found.count;
  patched.push(`${id}: ${found.count}`);
  const { _id, _type, _rev, _createdAt, _updatedAt, ...rest } = clean;
  tx.createOrReplace({ _id, _type, _createdAt, ...rest });
}

console.log(`Documents in German, deleted: ${german.length}`);
for (const line of german) console.log(`  ${line}`);
console.log(`German values removed: ${fields} in ${patched.length} documents`);
for (const line of patched.slice(0, 80)) console.log(`  ${line}`);

if (write) {
  await tx.commit();
  console.log("\nWritten.");
} else console.log("\nDry run. Add -- --apply to write.");
