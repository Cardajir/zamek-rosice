/**
 * Puts the photo albums in the order of the old website, zamek-rosice.cz
 * (2026-11-18), as the castle asked: the album list there runs Zámecké
 * okruhy, Meda a Jan Mládek, Zámecká zahrada, hračky, sklo, kryt, svatby,
 * Šenk, výstavní prostory. The exterior album the new site adds opens the
 * list, as the design draws it, and Edukační centrum, also new, closes it.
 *
 *   npx sanity exec scripts/gallery-order.ts --with-user-token
 *   npx sanity exec scripts/gallery-order.ts --with-user-token -- --dry
 *
 * `--dry` only reports. Only `order` is set, on the published album and on
 * its draft if there is one; running it again changes nothing. Albums the
 * list below does not know are reported and left where they are.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-11-01" });

const DRY = process.argv.slice(2).includes("--dry");

/*
 * Album ids and their place, ten apart so an editor can slot an album in
 * between by hand; the garden takes such a slot, so nothing else moves.
 */
const ORDER: [id: string, order: number][] = [
  ["gallery-exterier", 10],
  ["gallery-okruhy", 20],
  ["gallery-mladek", 30],
  ["gallery-zahrada", 35],
  ["gallery-hracky", 40],
  ["gallery-sklo", 50],
  ["gallery-kryt-co", 60],
  ["gallery-svatby", 70],
  ["gallery-senk", 80],
  ["gallery-vystavni-prostory", 90],
  ["gallery-edukacni-centrum", 100],
];
const place = new Map(ORDER);

type Album = { _id: string; order?: number; title?: string; count?: number };

const albums = await client.fetch<Album[]>(
  `*[_type == "gallery"]{ _id, order, "title": title.cs, "count": count(images) }`,
  {},
  { perspective: "raw" },
);

const published = (id: string) => id.replace(/^drafts\./, "");
const known = new Set(albums.map((album) => published(album._id)));

const missing = [...place.keys()].filter((id) => !known.has(id));
const extra = [...known].filter((id) => !place.has(id));

const transaction = client.transaction();
let changed = 0;

for (const album of albums) {
  const order = place.get(published(album._id));
  if (order === undefined) continue;
  const note = album.count ? `${album.count} photos` : "no photos, hidden";
  if (album.order === order) {
    console.log(`  ${album._id} "${album.title}" (${note}): ${order}`);
    continue;
  }
  console.log(
    `* ${album._id} "${album.title}" (${note}): ${album.order ?? "-"} -> ${order}`,
  );
  transaction.patch(album._id, (patch) => patch.set({ order }));
  changed += 1;
}

if (missing.length) console.log(`Not in the dataset: ${missing.join(", ")}`);
if (extra.length) console.log(`Not in the list, left as they are: ${extra.join(", ")}`);

if (changed === 0) {
  console.log("Nothing to change.");
} else if (DRY) {
  console.log(`Dry run: ${changed} album(s) would change, nothing written.`);
} else {
  await transaction.commit();
  console.log(`Set the order of ${changed} album(s) in ${client.config().dataset}.`);
}
