/**
 * Splits the home page's promo texts into the two paragraphs the design
 * sets: a blank line before the sentence that opens the second one. Only the
 * Czech text is touched; running it again changes nothing.
 *
 *   npx sanity exec scripts/promo-paragraphs.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-11-01" });

/* The sentence each second paragraph starts with, as the design breaks them. */
const BREAKS = [
  "Vše můžete vidět",
  "K dispozici je vlastní",
  "Parkování autobusů",
];

type Promo = { _key: string; text?: { cs?: string } };

const home = await client.fetch<{ _id: string; promos?: Promo[] } | null>(
  `*[_id == "homePage"][0]{ _id, promos[]{ _key, text } }`,
);
if (!home) throw new Error("No home page document.");

const patch = client.patch(home._id);
let changed = 0;

for (const promo of home.promos ?? []) {
  const text = promo.text?.cs;
  if (!text) continue;
  let next = text;
  for (const start of BREAKS) {
    next = next.replace(new RegExp(`\\s+(?=${start})`), "\n\n");
  }
  if (next !== text) {
    patch.set({ [`promos[_key=="${promo._key}"].text.cs`]: next });
    changed += 1;
  }
}

if (changed === 0) {
  console.log("Nothing to change.");
} else {
  await patch.commit();
  console.log(`Split ${changed} promo text(s) into paragraphs.`);
}
