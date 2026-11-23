// @ts-nocheck -- one-off content patch on untyped documents.
/**
 * The castle's photographs of November 2026: the Hausperský tour opens on its
 * own Rococo salon instead of a photograph from the Žerotínský tour, and the
 * children's tour gets the castle's picture in place of the design's.
 * Photographs are web-sized copies of the castle's files (tmp/email-2026-11).
 * An image already in the dataset (same SHA-1) is not uploaded again, and
 * running it again changes nothing.
 *
 *   npx sanity exec scripts/castle-photos-2026-11.ts --with-user-token              # dry run
 *   npx sanity exec scripts/castle-photos-2026-11.ts --with-user-token -- --apply
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { getCliClient } from "sanity/cli";

const write = process.argv.slice(2).includes("--apply");
const client = getCliClient({ apiVersion: "2026-11-01" });
const FOLDER = "tmp/email-2026-11";

const L = (cs: string, en: string, de: string) => ({ _type: "localizedString", cs, en, de });

const CHANGES = [
  {
    tour: "Hausperský okruh",
    file: "hauspersky-salon.jpg",
    key: "castle-hauspersky-salon",
    /* The photograph from the Žerotínský tour that headed this tour until now. */
    drop: ["image-35a81d487bf61693daef6d13462011acf1a1164a-1181x1772-jpg"],
    alt: L(
      "Rokokový salon s malovanými stěnami, lustrem a zelenou sedací soupravou",
      "A Rococo salon with painted walls, a chandelier and green upholstered furniture",
      "Rokokosalon mit bemalten Wänden, Kronleuchter und grüner Sitzgruppe",
    ),
  },
  {
    tour: "Dětský okruh",
    file: "detsky-okruh.jpg",
    key: "castle-detsky-okruh",
    /* The design's stand-in picture. */
    drop: ["image-d019cfd0b084697ce3fa44962448cd9e93885e66-1920x2560-jpg"],
    alt: L(
      "Malovaná ilustrace rytíře ve zbroji a hospodyňky v kroji",
      "A painted illustration of a knight in armour and a housekeeper in folk dress",
      "Gemalte Illustration eines Ritters in Rüstung und einer Haushälterin in Tracht",
    ),
  },
];

for (const change of CHANGES) {
  const tour = await client.fetch(
    `*[_type == "tour" && title.cs == $title && !(_id in path("drafts.**"))][0]{ _id, images }`,
    { title: change.tour },
  );
  if (!tour) {
    console.log(`! no tour "${change.tour}"`);
    continue;
  }
  const images = tour.images ?? [];
  if (images[0]?._key === change.key && !images.some((i) => change.drop.includes(i.asset?._ref))) {
    console.log(`${change.tour}: nothing to change`);
    continue;
  }

  const body = readFileSync(`${FOLDER}/${change.file}`);
  const sha1hash = createHash("sha1").update(body).digest("hex");
  let asset = await client.fetch(`*[_type == "sanity.imageAsset" && sha1hash == $sha1hash][0]._id`, { sha1hash });
  if (!asset && write) {
    asset = (
      await client.assets.upload("image", body, {
        filename: change.file,
        source: { id: change.file, name: "zamek-rosice" },
      })
    )._id;
  }

  const kept = images.filter((i) => i._key !== change.key && !change.drop.includes(i.asset?._ref));
  const next = [
    {
      _key: change.key,
      _type: "imageWithAlt",
      asset: { _type: "reference", _ref: asset ?? "dry-run" },
      alt: change.alt,
    },
    ...kept,
  ];
  console.log(
    `${change.tour}: ${change.file} first, ${images.length - kept.length} replaced, ${kept.length} kept`,
  );
  if (write) await client.patch(tour._id).set({ images: next }).commit();
}

if (!write) console.log("\nDry run. Add -- --apply to write.");
