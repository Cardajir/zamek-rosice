// @ts-nocheck
/**
 * Puts the photograph the design gives each tour card on the home page first
 * in that tour's photographs, where the card (and the tour's own page) takes
 * it from. The originals are the image fills of the home page's tour cards in
 * the design file, saved as JPEGs under the names below.
 *
 *   npx sanity exec scripts/home-tour-photos.ts --with-user-token -- <folder>
 *   npx sanity exec scripts/home-tour-photos.ts --with-user-token -- <folder> --dry
 *
 * `<folder>` defaults to `tmp/home-tour-photos`. `--dry` only reports. A tour
 * is found by its Czech title. A photograph already in the dataset (same
 * SHA-1) is not uploaded again; one the tour already has is moved to the
 * front with its own alt text. Every new entry has a fixed key, so running it
 * again changes nothing. The other photographs stay, after it, in their
 * order.
 *
 * The focus point centres the crop the design shows on the square card.
 * Alternative texts are first drafts for the castellan's review, Czech with
 * English working translations.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-11-01" });

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const FOLDER =
  args.find((arg) => !arg.startsWith("--")) ?? "tmp/home-tour-photos";

const L = (cs: string, en: string) => ({
  _type: "localizedString",
  cs,
  en,
});

interface Card {
  title: string;
  file: string;
  key: string;
  alt: ReturnType<typeof L>;
  /** Centre of the design's crop, as a share of the photograph's width and height. */
  focus?: { x: number; y: number };
}

/* In the design's order on the home page. */
const CARDS: Card[] = [
  {
    title: "Žerotínský okruh",
    file: "zerotinsky-okruh.jpg",
    key: "home-card-zerotin",
    alt: L(
      "Vyřezávaná skříň a portrét v sále se štukovou klenbou",
      "A carved cabinet and a portrait in a hall with a stucco vault",
    ),
    focus: { x: 0.337, y: 0.5 },
  },
  {
    title: "Hausperský okruh",
    file: "hauspersky-okruh.jpg",
    key: "home-card-hausper",
    alt: L(
      "Portrét šlechtice nad vyřezávanou židlí a svícnem",
      "A nobleman's portrait above a carved chair and a candelabrum",
    ),
  },
  {
    title: "Dětský okruh",
    file: "detsky-okruh.jpg",
    key: "home-card-detsky",
    alt: L(
      "Mosazný lustr pod bílým stropem",
      "A brass chandelier under a white ceiling",
    ),
  },
  {
    title: "Kryt civilní obrany",
    file: "kryt-civilni-obrany.jpg",
    key: "home-card-kryt",
    alt: L(
      "Ovládací panel v krytu civilní obrany",
      "The control panel in the civil defence shelter",
    ),
    focus: { x: 0.678, y: 0.469 },
  },
  {
    title: "Stálá výstava „Meda a Jan Mládek – život, exil, umění“",
    file: "meda-a-jan-mladek.jpg",
    key: "home-card-mladek",
    alt: L(
      "Žluté panely výstavy s nápisy Washington a Paříž",
      "The exhibition's yellow panels headed Washington and Paris",
    ),
  },
  {
    title: "Stálá výstava hraček",
    file: "vystava-hracek.jpg",
    key: "home-card-hracky",
    alt: L(
      "Porcelánová panenka v krajkových šatech s medvídkem",
      "A porcelain doll in a lace dress with a teddy bear",
    ),
  },
  {
    title: "Zámecká zahrada",
    file: "zamecka-zahrada.jpg",
    key: "home-card-zahrada",
    alt: L(
      "Zámecká zahrada s fontánou a lavičkami ve stínu stromů",
      "The castle garden with its fountain and benches in the shade of trees",
    ),
    focus: { x: 0.495, y: 0.473 },
  },
];

/* Quotation marks differ between the design and the dataset; compare without them. */
const plain = (text = "") =>
  text
    .normalize("NFC")
    .replace(/[„“”"]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

type Photo = {
  _key: string;
  _type?: string;
  asset?: { _ref: string };
  alt?: unknown;
  hotspot?: unknown;
  crop?: unknown;
};
type Tour = { _id: string; title?: string; images?: Photo[] };

const tours = await client.fetch<Tour[]>(
  `*[_type == "tour" && !(_id in path("drafts.**"))]{ _id, "title": title.cs, images[]{ ..., asset } }`,
);

for (const card of CARDS) {
  const tour = tours.find((item) => plain(item.title) === plain(card.title));
  if (!tour) {
    console.log(`✗ ${card.title}: no tour with this title.`);
    continue;
  }

  const path = join(FOLDER, card.file);
  if (!existsSync(path)) {
    console.log(`✗ ${card.title}: ${path} is missing.`);
    continue;
  }
  const buffer = readFileSync(path);
  const sha1 = createHash("sha1").update(buffer).digest("hex");

  let assetId = await client.fetch<string | null>(
    `*[_type == "sanity.imageAsset" && sha1hash == $sha1][0]._id`,
    { sha1 },
  );

  const images = tour.images ?? [];
  const first = images[0];
  const before = `${images.length} photo(s), first ${first?.asset?._ref ?? "none"}`;

  if (assetId && first?.asset?._ref === assetId) {
    console.log(`= ${card.title}: already first (${assetId}).`);
    continue;
  }

  if (!assetId) {
    if (DRY) {
      console.log(
        `+ ${card.title}: would upload ${card.file} (${Math.round(buffer.length / 1024)} kB) and put it first. Now: ${before}.`,
      );
      continue;
    }
    const asset = await client.assets.upload("image", buffer, {
      filename: card.file,
    });
    assetId = asset._id;
  }

  const existing = images.find((image) => image.asset?._ref === assetId);
  const entry: Photo = existing ?? {
    _key: card.key,
    _type: "imageWithAlt",
    asset: { _ref: assetId },
    alt: card.alt,
    ...(card.focus && {
      hotspot: {
        _type: "sanity.imageHotspot",
        x: card.focus.x,
        y: card.focus.y,
        width: 1,
        height: 1,
      },
    }),
  };
  const next = [entry, ...images.filter((image) => image !== existing)];

  if (DRY) {
    console.log(
      `~ ${card.title}: would ${existing ? "move its photo" : "add the uploaded photo"} ${assetId} to the front. Now: ${before}.`,
    );
    continue;
  }

  await client.patch(tour._id).set({ images: next }).commit();
  console.log(`✓ ${card.title}: ${assetId} is first.`);
}
