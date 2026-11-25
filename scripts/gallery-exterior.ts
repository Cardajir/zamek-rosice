/**
 * Fills the album "Zámecký exteriér" with its 33 photographs and puts it
 * first in the album list, where the gallery's front page opens it. The
 * order is the design's (its gallery mock-up shows the first sixteen). The
 * files are the photographer's originals, sized for the web (3000 px on the
 * long side, sRGB, no EXIF) and saved under their camera names; they replace
 * the image fills first taken from the design file.
 *
 *   npx sanity exec scripts/gallery-exterior.ts --with-user-token -- <folder>
 *   npx sanity exec scripts/gallery-exterior.ts --with-user-token -- <folder> --dry
 *
 * `<folder>` holds the JPEGs and defaults to `tmp/gallery-exterior-web`.
 * `--dry` only reports. The album keeps its fixed id `gallery-exterier` from
 * the seed; a photograph already in the dataset (same SHA-1) is not uploaded
 * again, and every photograph has a fixed key, so a run puts the new file in
 * its photograph's place and running it again changes nothing. Photographs
 * an editor added to the album since are kept after these.
 *
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
  args.find((arg) => !arg.startsWith("--")) ?? "tmp/gallery-exterior-web";
const ID = "gallery-exterier";

const L = (cs: string, en: string) => ({
  _type: "localizedString",
  cs,
  en,
});

/* In the design's order. */
const PHOTOS: [file: string, alt: ReturnType<typeof L>][] = [
  [
    "DSC08746.jpg",
    L(
      "Čestné nádvoří s bílými budovami předzámčí",
      "The courtyard of honour with the white buildings of the outer bailey",
    ),
  ],
  [
    "DSC08945.jpg",
    L(
      "Renesanční nádvoří s praporci v oknech",
      "The Renaissance courtyard with banners at the windows",
    ),
  ],
  [
    "DSC08979.jpg",
    L(
      "Arkády nádvoří z ochozu, v popředí muškáty",
      "The courtyard arcades seen from the gallery, geraniums in front",
    ),
  ],
  [
    "DSC09067.jpg",
    L(
      "Kvetoucí aksamitníky v zámecké zahradě",
      "Marigolds in flower in the castle garden",
    ),
  ],
  [
    "DSC08827.jpg",
    L(
      "Vstupní průčelí zámku se schodištěm a praporci",
      "The castle's entrance front with its steps and banners",
    ),
  ],
  [
    "DSC08903.jpg",
    L(
      "Reliéf Amora s lukem v cviklu arkády",
      "A relief of Cupid with his bow in an arcade spandrel",
    ),
  ],
  [
    "DSC09005.jpg",
    L(
      "Pohled oknem na arkády nádvoří",
      "The courtyard arcades seen through a window",
    ),
  ],
  [
    "DSC08928.jpg",
    L(
      "Detail kování na dřevěných dveřích",
      "Detail of the studs on a wooden door",
    ),
  ],
  [
    "DSC08955.jpg",
    L(
      "Ochoz arkád s květinami nad nádvořím",
      "The arcade gallery with flowers above the courtyard",
    ),
  ],
  [
    "DSC09056.jpg",
    L(
      "Francouzská zahrada s fontánou",
      "The French garden with its fountain",
    ),
  ],
  [
    "DSC09066.jpg",
    L(
      "Lekníny na hladině zámeckého jezírka",
      "Water lilies on the castle pond",
    ),
  ],
  [
    "DSC08835.jpg",
    L(
      "Trojpodlažní arkády renesančního nádvoří",
      "The three storeys of arcades in the Renaissance courtyard",
    ),
  ],
  [
    "DSC08907.jpg",
    L(
      "Sgrafitová výzdoba fasády",
      "Sgraffito decoration on the façade",
    ),
  ],
  [
    "DSC09023.jpg",
    L(
      "Hlavice sloupu arkády proti modrému nebi",
      "An arcade column capital against the blue sky",
    ),
  ],
  [
    "DSC08905.jpg",
    L(
      "Dva portály v sgrafitové stěně s květinami v kádích",
      "Two portals in a sgraffito wall, with potted plants",
    ),
  ],
  [
    "DSC09106.jpg",
    L(
      "Cesta zámeckou zahradou mezi stromy",
      "A path between the trees of the castle garden",
    ),
  ],
  [
    "DSC08769.jpg",
    L(
      "Průčelí předzámčí z čestného nádvoří",
      "The outer bailey's front from the courtyard of honour",
    ),
  ],
  [
    "DSC08790.jpg",
    L(
      "Předzámčí za trávníkem čestného nádvoří",
      "The outer bailey beyond the lawn of the courtyard of honour",
    ),
  ],
  [
    "DSC08856.jpg",
    L(
      "Arkády nádvoří s posezením",
      "The courtyard arcades with seating",
    ),
  ],
  [
    "DSC08859.jpg",
    L(
      "Arkády nádvoří ve stínu",
      "The courtyard arcades in shade",
    ),
  ],
  [
    "DSC08862.jpg",
    L(
      "Klenuté arkády přízemí a patra",
      "The vaulted arcades of the ground and upper floor",
    ),
  ],
  [
    "DSC08892.jpg",
    L(
      "Reliéf orla v cviklu arkády",
      "A relief of an eagle in an arcade spandrel",
    ),
  ],
  [
    "DSC08898.jpg",
    L(
      "Arkáda s reliéfy a vstupem ke schodišti",
      "An arcade with reliefs and the way to the staircase",
    ),
  ],
  [
    "DSC08901.jpg",
    L(
      "Přízemní arkády s lavičkou a palmami",
      "The ground-floor arcades with a bench and palms",
    ),
  ],
  [
    "DSC08906.jpg",
    L(
      "Sgrafito a kvetoucí oleandr",
      "Sgraffito and an oleander in flower",
    ),
  ],
  [
    "DSC08921.jpg",
    L(
      "Detail kamenného zdiva",
      "Detail of the stone masonry",
    ),
  ],
  [
    "DSC08931.jpg",
    L(
      "Okna se sgrafitem a praporci",
      "Windows with sgraffito and banners",
    ),
  ],
  [
    "DSC08935.jpg",
    L(
      "Zdobená balustráda ochozu s muškáty",
      "The carved balustrade of the gallery with geraniums",
    ),
  ],
  [
    "DSC08953.jpg",
    L(
      "Nádvoří z ochozu, v popředí muškáty",
      "The courtyard from the gallery, geraniums in front",
    ),
  ],
  [
    "DSC08958.jpg",
    L(
      "Arkádový ochoz s dlážděnou podlahou",
      "The arcade gallery with its tiled floor",
    ),
  ],
  [
    "DSC08970.jpg",
    L(
      "Reliéfy na balustrádě ochozu",
      "Reliefs on the gallery balustrade",
    ),
  ],
  [
    "DSC09003.jpg",
    L(
      "Arkády nádvoří v rámu okna",
      "The courtyard arcades framed by a window",
    ),
  ],
  [
    "DSC09061.jpg",
    L("Lekníny ve stínu", "Water lilies in the shade"),
  ],
];

const keyOf = (file: string) => `exterior-${file.replace(/\.jpg$/i, "")}`;

/** Upload a photograph once; a file already in the dataset is reused. */
async function assetFor(file: string): Promise<string> {
  const path = join(FOLDER, file);
  if (!existsSync(path)) throw new Error(`Missing ${path}`);
  const body = readFileSync(path);
  const sha1hash = createHash("sha1").update(body).digest("hex");
  const existing = await client.fetch<string | null>(
    `*[_type == "sanity.imageAsset" && sha1hash == $sha1hash][0]._id`,
    { sha1hash },
  );
  if (existing) return existing;
  if (DRY) return `dry-${sha1hash}`;
  const asset = await client.assets.upload("image", body, {
    filename: file,
    source: { id: file, name: "photographer" },
  });
  return asset._id;
}

const images: {
  _type: "imageWithAlt";
  _key: string;
  asset: { _type: "reference"; _ref: string };
  alt: ReturnType<typeof L>;
}[] = [];
for (const [file, alt] of PHOTOS) {
  const asset = await assetFor(file);
  images.push({
    _type: "imageWithAlt",
    _key: keyOf(file),
    asset: { _type: "reference", _ref: asset },
    alt,
  });
  console.log(`${file} -> ${asset}`);
}

type Album = { _id: string; images?: { _key: string }[]; order?: number };
const ours = new Set(images.map((image) => image._key));

/* The album first: before every other album in the editors' order. */
const others = await client.fetch<number | null>(
  `math::min(*[_type == "gallery" && !(_id in [$id, "drafts." + $id])].order)`,
  { id: ID },
);

const transaction = client.transaction();
transaction.createIfNotExists({
  _id: ID,
  _type: "gallery",
  slug: {
    cs: { _type: "slug", current: "zamecky-exterier" },
    en: { _type: "slug", current: "castle-exterior" },
  },
  order: 10,
});

for (const id of [ID, `drafts.${ID}`]) {
  const album = await client.fetch<Album | null>(`*[_id == $id][0]`, { id });
  if (!album && id !== ID) continue;
  const kept = (album?.images ?? []).filter((image) => !ours.has(image._key));
  const order = album?.order ?? 10;
  transaction.patch(id, (patch) =>
    patch
      .set({
        title: L("Zámecký exteriér", "Castle exterior"),
        images: [...images, ...kept],
        ...(others !== null && order >= others ? { order: others - 5 } : {}),
      }),
  );
  if (kept.length) console.log(`${id}: keeps ${kept.length} other photographs`);
}

if (DRY) {
  console.log(`Dry run: ${images.length} photographs, nothing written.`);
} else {
  await transaction.commit();
  console.log(
    `Album ${ID} "Zámecký exteriér" now holds ${images.length} photographs in ${client.config().dataset}.`,
  );
}
