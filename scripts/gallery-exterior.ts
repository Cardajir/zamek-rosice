/**
 * Fills the album "Zámecký exteriér" with the 33 photographs from the design
 * file and puts it first in the album list, where the gallery's front page
 * opens it. The originals are the image fills of the rectangles named DSC0…
 * on the design's canvas (4096 px on the long side), saved under their
 * camera names.
 *
 *   npx sanity exec scripts/gallery-exterior.ts --with-user-token -- <folder>
 *   npx sanity exec scripts/gallery-exterior.ts --with-user-token -- <folder> --dry
 *
 * `<folder>` holds the JPEGs and defaults to `tmp/gallery-exterior`. `--dry`
 * only reports. The album keeps its fixed id `gallery-exterier` from the seed;
 * a photograph already in the dataset (same SHA-1) is not uploaded again, and
 * every photograph has a fixed key, so running it again changes nothing.
 * Photographs an editor added to the album since are kept after these.
 *
 * Alternative texts are first drafts for the castellan's review, Czech with
 * English and German working translations.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-11-01" });

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const FOLDER =
  args.find((arg) => !arg.startsWith("--")) ?? "tmp/gallery-exterior";
const ID = "gallery-exterier";

const L = (cs: string, en: string, de: string) => ({
  _type: "localizedString",
  cs,
  en,
  de,
});

/* In the design's order: its gallery mock-up shows the first sixteen. */
const PHOTOS: [file: string, alt: ReturnType<typeof L>][] = [
  [
    "DSC08746.jpg",
    L(
      "Čestné nádvoří s bílými budovami předzámčí",
      "The courtyard of honour with the white buildings of the outer bailey",
      "Ehrenhof mit den weißen Gebäuden der Vorburg",
    ),
  ],
  [
    "DSC08945.jpg",
    L(
      "Renesanční nádvoří s praporci v oknech",
      "The Renaissance courtyard with banners at the windows",
      "Renaissancehof mit Fahnen an den Fenstern",
    ),
  ],
  [
    "DSC08979.jpg",
    L(
      "Arkády nádvoří z ochozu, v popředí muškáty",
      "The courtyard arcades seen from the gallery, geraniums in front",
      "Die Arkaden des Hofes vom Umgang aus, vorn Geranien",
    ),
  ],
  [
    "DSC09067.jpg",
    L(
      "Kvetoucí aksamitníky v zámecké zahradě",
      "Marigolds in flower in the castle garden",
      "Blühende Studentenblumen im Schlossgarten",
    ),
  ],
  [
    "DSC08827.jpg",
    L(
      "Vstupní průčelí zámku se schodištěm a praporci",
      "The castle's entrance front with its steps and banners",
      "Eingangsfassade des Schlosses mit Treppe und Fahnen",
    ),
  ],
  [
    "DSC08903.jpg",
    L(
      "Reliéf Amora s lukem v cviklu arkády",
      "A relief of Cupid with his bow in an arcade spandrel",
      "Relief des Amor mit Bogen im Arkadenzwickel",
    ),
  ],
  [
    "DSC09005.jpg",
    L(
      "Pohled oknem na arkády nádvoří",
      "The courtyard arcades seen through a window",
      "Blick durch ein Fenster auf die Hofarkaden",
    ),
  ],
  [
    "DSC08928.jpg",
    L(
      "Detail kování na dřevěných dveřích",
      "Detail of the studs on a wooden door",
      "Detail der Beschläge an einer Holztür",
    ),
  ],
  [
    "DSC08955.jpg",
    L(
      "Ochoz arkád s květinami nad nádvořím",
      "The arcade gallery with flowers above the courtyard",
      "Arkadenumgang mit Blumen über dem Hof",
    ),
  ],
  [
    "DSC09056.jpg",
    L(
      "Francouzská zahrada s fontánou",
      "The French garden with its fountain",
      "Französischer Garten mit Springbrunnen",
    ),
  ],
  [
    "DSC09066.jpg",
    L(
      "Lekníny na hladině zámeckého jezírka",
      "Water lilies on the castle pond",
      "Seerosen auf dem Schlossteich",
    ),
  ],
  [
    "DSC08835.jpg",
    L(
      "Trojpodlažní arkády renesančního nádvoří",
      "The three storeys of arcades in the Renaissance courtyard",
      "Die dreigeschossigen Arkaden des Renaissancehofes",
    ),
  ],
  [
    "DSC08907.jpg",
    L(
      "Sgrafitová výzdoba fasády",
      "Sgraffito decoration on the façade",
      "Sgraffito-Schmuck an der Fassade",
    ),
  ],
  [
    "DSC09023.jpg",
    L(
      "Hlavice sloupu arkády proti modrému nebi",
      "An arcade column capital against the blue sky",
      "Säulenkapitell der Arkade vor blauem Himmel",
    ),
  ],
  [
    "DSC08905.jpg",
    L(
      "Dva portály v sgrafitové stěně s květinami v kádích",
      "Two portals in a sgraffito wall, with potted plants",
      "Zwei Portale in einer Sgraffito-Wand mit Kübelpflanzen",
    ),
  ],
  [
    "DSC09106.jpg",
    L(
      "Cesta zámeckou zahradou mezi stromy",
      "A path between the trees of the castle garden",
      "Weg zwischen den Bäumen des Schlossgartens",
    ),
  ],
  [
    "DSC08769.jpg",
    L(
      "Průčelí předzámčí z čestného nádvoří",
      "The outer bailey's front from the courtyard of honour",
      "Die Front der Vorburg vom Ehrenhof aus",
    ),
  ],
  [
    "DSC08790.jpg",
    L(
      "Předzámčí za trávníkem čestného nádvoří",
      "The outer bailey beyond the lawn of the courtyard of honour",
      "Die Vorburg hinter dem Rasen des Ehrenhofes",
    ),
  ],
  [
    "DSC08856.jpg",
    L(
      "Arkády nádvoří s posezením",
      "The courtyard arcades with seating",
      "Die Hofarkaden mit Sitzplätzen",
    ),
  ],
  [
    "DSC08859.jpg",
    L(
      "Arkády nádvoří ve stínu",
      "The courtyard arcades in shade",
      "Die Hofarkaden im Schatten",
    ),
  ],
  [
    "DSC08862.jpg",
    L(
      "Klenuté arkády přízemí a patra",
      "The vaulted arcades of the ground and upper floor",
      "Die gewölbten Arkaden von Erd- und Obergeschoss",
    ),
  ],
  [
    "DSC08892.jpg",
    L(
      "Reliéf orla v cviklu arkády",
      "A relief of an eagle in an arcade spandrel",
      "Relief eines Adlers im Arkadenzwickel",
    ),
  ],
  [
    "DSC08898.jpg",
    L(
      "Arkáda s reliéfy a vstupem ke schodišti",
      "An arcade with reliefs and the way to the staircase",
      "Arkade mit Reliefs und dem Zugang zur Treppe",
    ),
  ],
  [
    "DSC08901.jpg",
    L(
      "Přízemní arkády s lavičkou a palmami",
      "The ground-floor arcades with a bench and palms",
      "Die Erdgeschossarkaden mit Bank und Palmen",
    ),
  ],
  [
    "DSC08906.jpg",
    L(
      "Sgrafito a kvetoucí oleandr",
      "Sgraffito and an oleander in flower",
      "Sgraffito und blühender Oleander",
    ),
  ],
  [
    "DSC08921.jpg",
    L(
      "Detail kamenného zdiva",
      "Detail of the stone masonry",
      "Detail des Steinmauerwerks",
    ),
  ],
  [
    "DSC08931.jpg",
    L(
      "Okna se sgrafitem a praporci",
      "Windows with sgraffito and banners",
      "Fenster mit Sgraffito und Fahnen",
    ),
  ],
  [
    "DSC08935.jpg",
    L(
      "Zdobená balustráda ochozu s muškáty",
      "The carved balustrade of the gallery with geraniums",
      "Die verzierte Brüstung des Umgangs mit Geranien",
    ),
  ],
  [
    "DSC08953.jpg",
    L(
      "Nádvoří z ochozu, v popředí muškáty",
      "The courtyard from the gallery, geraniums in front",
      "Der Hof vom Umgang aus, vorn Geranien",
    ),
  ],
  [
    "DSC08958.jpg",
    L(
      "Arkádový ochoz s dlážděnou podlahou",
      "The arcade gallery with its tiled floor",
      "Der Arkadenumgang mit Fliesenboden",
    ),
  ],
  [
    "DSC08970.jpg",
    L(
      "Reliéfy na balustrádě ochozu",
      "Reliefs on the gallery balustrade",
      "Reliefs an der Brüstung des Umgangs",
    ),
  ],
  [
    "DSC09003.jpg",
    L(
      "Arkády nádvoří v rámu okna",
      "The courtyard arcades framed by a window",
      "Die Hofarkaden im Fensterrahmen",
    ),
  ],
  [
    "DSC09061.jpg",
    L("Lekníny ve stínu", "Water lilies in the shade", "Seerosen im Schatten"),
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
    source: { id: file, name: "figma", url: "" },
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
    de: { _type: "slug", current: "schloss-von-aussen" },
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
        title: L("Zámecký exteriér", "Castle exterior", "Schlossäußeres"),
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
