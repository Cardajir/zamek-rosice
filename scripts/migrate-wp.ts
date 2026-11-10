/**
 * Moves the content of the old WordPress site into Sanity: text pages, tour
 * descriptions, photo albums, news, partners, media mentions and the
 * published documents. Reads the old site's public REST API, so nothing is
 * needed but the address.
 *
 *   npm run migrate              read the old site, write to Sanity
 *   npm run migrate -- --dry     read and convert only, report what would be written
 *
 * Every document has a fixed id, so running it again replaces what it wrote.
 * Downloaded JSON and the list of uploaded files are kept in `tmp/wp`, so a
 * second run uploads nothing twice.
 *
 * Czech only: the old site had no other language.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { htmlToBlocks } from "@portabletext/block-tools";
import { Schema } from "@sanity/schema";
import { JSDOM } from "jsdom";
import { getCliClient } from "sanity/cli";
import { REDIRECTS } from "../src/redirects.ts";

const ORIGIN = "https://zamek-rosice.cz";
const CACHE = "tmp/wp";
const DRY = process.argv.includes("--dry");

const client = getCliClient({ apiVersion: "2026-11-01" });

/* ------------------------------------------------------------- reading -- */

interface WpItem {
  id: number;
  slug: string;
  link: string;
  date: string;
  parent?: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt?: { rendered: string };
  categories?: number[];
  featured_media?: number;
}

interface WpMedia {
  id: number;
  source_url: string;
  alt_text?: string;
  mime_type: string;
  title?: { rendered: string };
  caption?: { rendered: string };
}

mkdirSync(CACHE, { recursive: true });

async function wp<T>(type: string): Promise<T[]> {
  const file = `${CACHE}/${type}.json`;
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8")) as T[];

  const all: T[] = [];
  for (let page = 1; ; page++) {
    const response = await fetch(
      `${ORIGIN}/wp-json/wp/v2/${type}?per_page=100&page=${page}`,
      {
        headers: { "user-agent": "content-migration" },
      },
    );
    if (!response.ok) break;
    const items = (await response.json()) as T[];
    all.push(...items);
    if (page >= Number(response.headers.get("x-wp-totalpages") ?? 1)) break;
  }
  writeFileSync(file, JSON.stringify(all));
  return all;
}

const [pages, posts, media] = await Promise.all([
  wp<WpItem>("pages"),
  wp<WpItem>("posts"),
  wp<WpMedia>("media"),
]);

const pathOf = (item: WpItem) =>
  new URL(item.link).pathname.replace(/\/+$/, "");
const pageAt = (path: string) => {
  const page = pages.find((item) => pathOf(item) === path);
  if (!page) throw new Error(`The old site has no page at ${path}`);
  return page;
};

/* ---------------------------------------------------------------- text -- */

const decode = (html: string) =>
  new JSDOM(`<body>${html}</body>`).window.document.body.textContent ?? "";
const clean = (value: string) =>
  value.replace(/ /g, " ").replace(/\s+/g, " ").trim();
const plain = (html: string) => clean(decode(html));

let keys = 0;
const key = () => `m${(keys++).toString(36).padStart(5, "0")}`;

/*
 * The text part of `blockContent` from src/sanity/schemas/objects.ts, restated
 * without the image member: the converter cannot resolve Sanity's built-in
 * image types outside the Studio, and photographs are placed by hand below.
 */
const blockContentType = Schema.compile({
  name: "migration",
  types: [
    {
      type: "object",
      name: "holder",
      fields: [
        {
          name: "body",
          type: "array",
          of: [
            {
              type: "block",
              styles: ["normal", "h2", "h3", "h4", "blockquote"].map(
                (value) => ({ title: value, value }),
              ),
              lists: ["bullet", "number"].map((value) => ({
                title: value,
                value,
              })),
              marks: {
                decorators: ["strong", "em"].map((value) => ({
                  title: value,
                  value,
                })),
                annotations: [
                  {
                    name: "link",
                    type: "object",
                    fields: [{ name: "href", type: "url" }],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
})
  .get("holder")
  .fields.find((field: { name: string }) => field.name === "body").type;

/* ------------------------------------------------------------- uploads -- */

const mediaByUrl = new Map(
  media.map((item) => [normalise(item.source_url), item]),
);
const mediaById = new Map(media.map((item) => [item.id, item]));

function normalise(url: string): string {
  const absolute = new URL(url, ORIGIN);
  absolute.protocol = "https:";
  absolute.hash = "";
  return decodeURI(absolute.href);
}

/** The upload a resized copy (`photo-1024x683.jpg`) was made from. */
function original(url: string): string {
  const full = normalise(url);
  if (mediaByUrl.has(full)) return full;
  const stripped = full.replace(/-\d+x\d+(\.[a-z0-9]+)$/i, "$1");
  return mediaByUrl.has(stripped) ? stripped : full;
}

const isUpload = (url: string) =>
  normalise(url).startsWith(`${ORIGIN}/wp-content/uploads/`);

const ASSETS_FILE = `${CACHE}/assets.json`;
const assets: Record<string, string> = existsSync(ASSETS_FILE)
  ? JSON.parse(readFileSync(ASSETS_FILE, "utf8"))
  : {};
const failed: string[] = [];

/** Upload a file from the old site once and return its asset id. */
async function upload(
  url: string,
  kind: "image" | "file",
): Promise<string | undefined> {
  const source = original(url);
  if (assets[source]) return assets[source];
  if (DRY) return `dry-${kind}`;

  try {
    const response = await fetch(encodeURI(source), {
      headers: { "user-agent": "content-migration" },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = Buffer.from(await response.arrayBuffer());
    const filename = decodeURIComponent(source.split("/").pop() ?? "file");
    const asset = await client.assets.upload(kind, body, {
      filename,
      source: { id: source, name: "wordpress", url: source },
    });
    assets[source] = asset._id;
    writeFileSync(ASSETS_FILE, JSON.stringify(assets, null, 1));
    return asset._id;
  } catch (error) {
    failed.push(`${source} (${(error as Error).message})`);
    return undefined;
  }
}

/** A weak alternative text is a file name; a good one says what is in the picture. */
const weakAlts: string[] = [];

function altFor(
  url: string,
  given: string | undefined,
  caption: string | undefined,
): string {
  const item = mediaByUrl.get(original(url));
  const candidates = [
    given,
    item?.alt_text,
    caption,
    plain(item?.caption?.rendered ?? ""),
  ];
  const good = candidates.map((value) => clean(value ?? "")).find(Boolean);
  if (good) return good;
  const title =
    plain(item?.title?.rendered ?? "") || "Fotografie ze zámku Rosice";
  weakAlts.push(`${title}  <-  ${original(url).split("/").pop()}`);
  return title;
}

interface Photo {
  src: string;
  alt?: string;
  caption?: string;
}

async function imageBlock(photo: Photo, credit?: string) {
  const asset = await upload(photo.src, "image");
  if (!asset) return undefined;
  return {
    _type: "imageWithAlt",
    _key: key(),
    asset: { _type: "reference", _ref: asset },
    alt: {
      _type: "localizedString",
      cs: altFor(photo.src, photo.alt, photo.caption),
    },
    ...(photo.caption
      ? { caption: { _type: "localizedString", cs: photo.caption } }
      : {}),
    ...(credit ? { credit } : {}),
  };
}

/* ---------------------------------------------------------- conversion -- */

/** Old addresses lead to their new ones; links to uploads become Sanity files. */
function newPath(href: string): string | undefined {
  let url: URL;
  try {
    url = new URL(href, ORIGIN);
  } catch {
    return undefined;
  }
  if (
    url.hostname !== "zamek-rosice.cz" &&
    url.hostname !== "www.zamek-rosice.cz"
  )
    return undefined;
  const bare = url.pathname.replace(/\/+$/, "") || "/";
  const target = REDIRECTS[bare] ?? bare;
  return target === "/" ? "/" : `${target}/`;
}

interface Converted {
  blocks: unknown[];
  photos: Photo[];
  files: { url: string; label: string }[];
}

/**
 * Turn a page's HTML into Portable Text. Photographs are taken out and
 * returned on their own unless `inlineImages` keeps them in the text.
 */
async function convert(
  html: string,
  { inlineImages = false } = {},
): Promise<Converted> {
  const document = new JSDOM(`<body>${html}</body>`).window.document;
  const body = document.body;
  const photos: Photo[] = [];
  const files: Converted["files"] = [];

  for (const node of body.querySelectorAll(
    "style, link, script, form, iframe, hr, noscript",
  ))
    node.remove();

  /* A download block has the link twice: the title, then a "Stáhnout" button. */
  for (const button of body.querySelectorAll("a.wp-block-file__button"))
    button.remove();

  /* Tiled galleries and figures become a list of photographs. */
  const mark = (photo: Photo, at: Element) => {
    photos.push(photo);
    if (inlineImages) {
      const placeholder = document.createElement("p");
      placeholder.textContent = `[[photo:${photos.length - 1}]]`;
      at.replaceWith(placeholder);
    } else {
      at.remove();
    }
  };

  for (const item of body.querySelectorAll(".tiled-gallery-item")) {
    const img = item.querySelector("img");
    const src = img?.getAttribute("data-orig-file") ?? img?.getAttribute("src");
    if (src && isUpload(src)) {
      photos.push({
        src,
        alt: clean(img?.getAttribute("alt") ?? ""),
        caption:
          clean(
            item.querySelector(".tiled-gallery-caption")?.textContent ?? "",
          ) || undefined,
      });
    }
  }
  for (const gallery of body.querySelectorAll(".tiled-gallery"))
    gallery.remove();

  for (const figure of body.querySelectorAll("figure")) {
    const images = [...figure.querySelectorAll("img")];
    if (images.length === 0) continue;
    const nested = figure.querySelector("figure");
    if (nested) continue;
    const caption =
      clean(figure.querySelector("figcaption")?.textContent ?? "") || undefined;
    const img = images[0]!;
    const src = img.getAttribute("src");
    if (src && isUpload(src))
      mark({ src, alt: clean(img.getAttribute("alt") ?? ""), caption }, figure);
    else figure.remove();
  }
  for (const img of body.querySelectorAll("img")) {
    const src = img.getAttribute("src");
    const holder = img.closest("a") ?? img;
    if (src && isUpload(src))
      mark({ src, alt: clean(img.getAttribute("alt") ?? "") }, holder);
    else holder.remove();
  }

  /* A two-column table reads as "label: value"; wider ones as cells in a row. */
  for (const table of body.querySelectorAll("table")) {
    const fragment = document.createDocumentFragment();
    for (const row of table.querySelectorAll("tr")) {
      const cells = [...row.querySelectorAll("td, th")]
        .map((cell) => cell.innerHTML.trim())
        .filter(Boolean);
      if (cells.length === 0) continue;
      const paragraph = document.createElement("p");
      paragraph.innerHTML =
        cells.length === 2
          ? `<strong>${cells[0]}:</strong> ${cells[1]}`
          : cells.join(" · ");
      fragment.append(paragraph);
    }
    (table.closest("figure") ?? table).replaceWith(fragment);
  }

  /* The page title is the only h1; deeper levels than h4 do not exist here. */
  const retag = (from: string, to: string) => {
    for (const node of body.querySelectorAll(from)) {
      const next = document.createElement(to);
      next.innerHTML = node.innerHTML;
      node.replaceWith(next);
    }
  };
  retag("h1", "h2");
  retag("h5", "h4");
  retag("h6", "h4");

  for (const link of body.querySelectorAll("a")) {
    const href = link.getAttribute("href") ?? "";
    if (/\.(pdf|docx?|xlsx?|zip)$/i.test(href) && isUpload(href)) {
      const label = clean(link.textContent ?? "");
      files.push({ url: href, label });
      const asset = await upload(href, "file");
      const [, id, extension] = asset?.match(/^file-(.+)-([a-z0-9]+)$/) ?? [];
      if (id && extension) {
        const { projectId, dataset } = client.config();
        link.setAttribute(
          "href",
          `https://cdn.sanity.io/files/${projectId}/${dataset}/${id}.${extension}`,
        );
      }
      continue;
    }
    /* A bare domain typed as a link target resolved against the page it was on. */
    const stray = href.match(
      /^https?:\/\/zamek-rosice\.cz\/.*\/(www\.[^/]+\..+)$/,
    );
    if (stray) {
      link.setAttribute("href", `https://${stray[1]}`);
      continue;
    }
    const moved = newPath(href);
    if (moved) link.setAttribute("href", moved);
    else if (!/^(https?:|mailto:|tel:)/.test(href))
      link.replaceWith(...link.childNodes);
  }

  for (const paragraph of body.querySelectorAll("p")) {
    if (!clean(paragraph.textContent ?? "")) paragraph.remove();
  }

  const converted = htmlToBlocks(body.innerHTML, blockContentType, {
    parseHtml: (source) => new JSDOM(source).window.document,
    keyGenerator: key,
  }) as { _type: string; children?: { text?: string }[] }[];

  const blocks: unknown[] = [];
  for (const block of converted) {
    const text =
      block.children?.map((child) => child.text ?? "").join("") ?? "";
    const placeholder = text.match(/^\[\[photo:(\d+)\]\]$/);
    if (placeholder) {
      const image = await imageBlock(photos[Number(placeholder[1])]!);
      if (image) blocks.push(image);
    } else if (block._type !== "block" || clean(text)) {
      blocks.push(block);
    }
  }
  return { blocks, photos, files };
}

/* ----------------------------------------------------------- documents -- */

type Doc = { _id: string; _type: string; [field: string]: unknown };
const documents: Doc[] = [];
const patches: { id: string; set: Record<string, unknown> }[] = [];
const report: string[] = [];

const withKeys = <T extends object>(items: T[]) =>
  items.map((item) => ({ _key: key(), ...item }));

/* Text pages: one rich-text section, photographs kept where they stood. */
const TEXT_PAGES: [
  id: string,
  oldPath: string,
  slug: string,
  parent: string,
][] = [
  [
    "page-navstevni-rad",
    "/informace-pro-navstevniky/navstevni-rad",
    "navstevni-rad",
    "visit",
  ],
  ["page-svatby", "/akce-a-moznosti/svatby", "svatby", "events"],
  [
    "page-skolni-vylety",
    "/akce-a-moznosti/skolni-vylety",
    "skolni-vylety",
    "events",
  ],
  ["page-vystavy", "/akce-a-moznosti/vystavy", "vystavy", "events"],
  [
    "page-pronajem-senk",
    "/akce-a-moznosti/pronajem-spolecenskeho-prostoru-senk",
    "pronajem-senk",
    "events",
  ],
  ["page-z-historie", "/o-zamku/z-historie", "z-historie", "about"],
  [
    "page-povinna-publicita",
    "/statutarni-a-povinne-informace/povinna-publicita-projektu",
    "povinna-publicita-projektu",
    "statutory",
  ],
  [
    "page-pristupnost",
    "/prohlaseni-o-pristupnosti",
    "prohlaseni-o-pristupnosti",
    "none",
  ],
  [
    "page-osobni-udaje",
    "/ochrana-osobnich-udaju",
    "ochrana-osobnich-udaju",
    "none",
  ],
];

const orderFiles: { url: string; label: string }[] = [];

for (const [id, oldPath, slug, parent] of TEXT_PAGES) {
  const source = pageAt(oldPath);
  const { blocks, photos, files } = await convert(source.content.rendered, {
    inlineImages: true,
  });
  if (id === "page-svatby") orderFiles.push(...files);
  documents.push({
    _id: id,
    _type: "page",
    language: "cs",
    title: plain(source.title.rendered),
    slug: { _type: "slug", current: slug },
    parent,
    sections: [{ _type: "sectionRichText", _key: key(), body: blocks }],
  });
  report.push(
    `page ${id}: ${blocks.length} blocks, ${photos.length} photos, ${files.length} files`,
  );
}

/* Tours: the description and the photographs of each tour's own page. */
const TOUR_PAGES: [id: string, oldPath: string][] = [
  [
    "tour-kryt-co",
    "/informace-pro-navstevniky/prohlidkove-okruhy/kryt-civilni-obrany",
  ],
  [
    "tour-hracky",
    "/informace-pro-navstevniky/prohlidkove-okruhy/stala-vystava-hracek",
  ],
  [
    "tour-mladek",
    "/informace-pro-navstevniky/prohlidkove-okruhy/stala-vystava-meda-a-jan-mladek-zivot-exil-umeni",
  ],
  [
    "tour-sklo",
    "/informace-pro-navstevniky/prohlidkove-okruhy/vystava-skla-z-rosicke-sklarny",
  ],
  [
    "tour-zahrada",
    "/informace-pro-navstevniky/prohlidkove-okruhy/zamecka-zahrada",
  ],
];

/* The overview page shows one photograph per tour: the one a card should lead with. */
const overview = new JSDOM(
  pageAt("/informace-pro-navstevniky/prohlidkove-okruhy").content.rendered,
).window.document;
const leadPhoto = new Map<string, Photo>();
for (const img of overview.querySelectorAll("figure img")) {
  const link = img
    .closest("div")
    ?.parentElement?.querySelector("a[href*='prohlidkove-okruhy/']");
  const href = link?.getAttribute("href");
  const src = img.getAttribute("src");
  if (!href || !src) continue;
  const path = new URL(href, ORIGIN).pathname.replace(/\/+$/, "");
  if (!leadPhoto.has(path))
    leadPhoto.set(path, { src, alt: clean(img.getAttribute("alt") ?? "") });
}

async function tourImages(oldPath: string, photos: Photo[]) {
  const lead = leadPhoto.get(oldPath);
  const all = lead
    ? [
        lead,
        ...photos.filter((photo) => original(photo.src) !== original(lead.src)),
      ]
    : photos;
  const blocks = [];
  for (const photo of all) {
    const image = await imageBlock(photo);
    if (image) blocks.push(image);
  }
  return blocks;
}

for (const [id, oldPath] of TOUR_PAGES) {
  const { blocks, photos } = await convert(pageAt(oldPath).content.rendered);
  const images = await tourImages(oldPath, photos);
  patches.push({
    id,
    set: { "body.cs": blocks, ...(images.length > 0 ? { images } : {}) },
  });
  report.push(`tour ${id}: ${blocks.length} blocks, ${images.length} photos`);
}

/*
 * The two main tours shared one page on the old site. Its introduction goes
 * to both; the paragraphs under each tour's name go to that tour.
 */
{
  const oldPath =
    "/informace-pro-navstevniky/prohlidkove-okruhy/zamecka-expozice";
  const { blocks, photos } = await convert(pageAt(oldPath).content.rendered);
  const textOf = (block: unknown) =>
    ((block as { children?: { text?: string }[] }).children ?? [])
      .map((child) => child.text ?? "")
      .join("");

  const parts: Record<"intro" | "zerotin" | "hausper" | "rest", unknown[]> = {
    intro: [],
    zerotin: [],
    hausper: [],
    rest: [],
  };
  let current: keyof typeof parts = "intro";
  for (const block of blocks) {
    const text = clean(textOf(block));
    if (/^Okruh Žerotínský$/i.test(text)) current = "zerotin";
    else if (/^Okruh Hausperský$/i.test(text)) current = "hausper";
    else if (/^Fotografie/i.test(text)) current = "rest";
    else parts[current].push(block);
  }

  const images = await tourImages(oldPath, photos);
  const rekey = (items: unknown[]) =>
    JSON.parse(
      JSON.stringify(items).replace(
        /"_key":"[^"]+"/g,
        () => `"_key":"${key()}"`,
      ),
    );
  for (const tour of ["zerotin", "hausper"] as const) {
    patches.push({
      id: `tour-${tour}`,
      set: {
        "body.cs": rekey([...parts.intro, ...parts[tour]]),
        images: rekey(images),
      },
    });
    report.push(
      `tour tour-${tour}: ${parts.intro.length + parts[tour].length} blocks, ${images.length} photos (shared with the other main tour)`,
    );
  }
}

/* Photo albums. */
const ALBUMS: [id: string, oldSlug: string][] = [
  ["gallery-okruhy", "zamecky-okruh"],
  ["gallery-mladek", "stala-vystava-meda-a-jan-mladek"],
  ["gallery-hracky", "stala-vystava-hracek"],
  ["gallery-sklo", "vystava-rosickeho-skla"],
  ["gallery-kryt-co", "kryt-co"],
  ["gallery-svatby", "svatby-na-zamku"],
  ["gallery-senk", "spolecensky-prostor-senk"],
  ["gallery-vystavni-prostory", "vystavni-prostory"],
  ["gallery-zahrada", "zamecka-zahrada"],
];

for (const [id, oldSlug] of ALBUMS) {
  const source = pageAt(`/fotogalerie/${oldSlug}`);
  const { photos } = await convert(source.content.rendered);
  const credit = plain(source.content.rendered).match(/\(c\)[^.]*\./i)?.[0];
  const images = [];
  for (const photo of photos) {
    const image = await imageBlock(photo);
    if (image) images.push(image);
  }
  const set: Record<string, unknown> = { images };
  if (credit) set.defaultCredit = clean(credit.replace(/^\(c\)\s*/i, "© "));
  if (id === "gallery-zahrada") {
    /* The design's album list has no garden; the old site did. Kept as its own album. */
    documents.push({
      _id: id,
      _type: "gallery",
      title: {
        cs: "Zámecká zahrada",
        en: "Castle garden",
        de: "Schlossgarten",
      },
      slug: {
        cs: { _type: "slug", current: "zamecka-zahrada" },
        en: { _type: "slug", current: "castle-garden" },
        de: { _type: "slug", current: "schlossgarten" },
      },
      order: 15,
      ...set,
    });
  } else {
    patches.push({ id, set });
  }
  report.push(`album ${id}: ${images.length} photos`);
}

/* News. Two items are events with a date stated in their text. */
const EVENTS: Record<string, { start: string; end?: string }> = {
  "vystava-betlemu-hvezda-nad-rosicemi-od-5-12-26": {
    start: "2026-12-05T08:00:00.000Z",
  },
  "last-minute-sezony-2026": { start: "2026-10-31T08:00:00.000Z" },
};

const skipped: string[] = [];
for (const source of posts) {
  const text = plain(source.content.rendered);
  if (!text) {
    skipped.push(
      `${plain(source.title.rendered).slice(0, 60)} (${source.date.slice(0, 10)}): no text`,
    );
    continue;
  }
  const { blocks } = await convert(source.content.rendered, {
    inlineImages: true,
  });
  const cover = source.featured_media
    ? mediaById.get(source.featured_media)
    : undefined;
  const image = cover?.mime_type.startsWith("image/")
    ? await imageBlock({ src: cover.source_url, alt: cover.alt_text })
    : undefined;
  const excerpt = plain(source.excerpt?.rendered ?? "")
    .replace(/\s*(…|&hellip;)?\s*Pokračování textu.*$/i, "")
    .replace(/\s*…$/, "");
  const perex =
    (excerpt || text).slice(0, 297).replace(/\s+\S*$/, "") +
    (text.length > 297 ? "…" : "");
  const event = EVENTS[source.slug];

  documents.push({
    _id: `post-wp-${source.id}`,
    _type: "post",
    language: "cs",
    kind: event ? "event" : "news",
    title: plain(source.title.rendered),
    slug: { _type: "slug", current: source.slug },
    publishedAt: new Date(`${source.date}+01:00`).toISOString(),
    perex,
    body: blocks,
    featured: source.slug === "last-minute-sezony-2026",
    ...(image ? { image: { ...image, _key: undefined } } : {}),
    ...(event
      ? {
          eventStart: event.start,
          eventEnd: event.end,
          eventStatus: "scheduled",
        }
      : {}),
  });
}
report.push(
  `posts: ${posts.length - skipped.length} migrated, ${skipped.length} skipped`,
);

/* Partners: "Name, what they do www.example.cz". */
{
  const document = new JSDOM(pageAt("/o-zamku/partneri-zamku").content.rendered)
    .window.document;
  let order = 10;
  for (const paragraph of document.querySelectorAll("p")) {
    const name = clean(paragraph.querySelector("strong")?.textContent ?? "");
    if (!name) continue;
    const site = clean(paragraph.querySelector("mark")?.textContent ?? "");
    const description = clean(
      (paragraph.textContent ?? "")
        .replace(paragraph.querySelector("strong")?.textContent ?? "", "")
        .replace(site, ""),
    ).replace(/^,\s*/, "");
    documents.push({
      _id: `partner-wp-${order}`,
      _type: "partner",
      name,
      ...(description ? { description: { cs: description } } : {}),
      ...(site ? { url: `https://${site.replace(/^https?:\/\//, "")}` } : {}),
      showInFooter: false,
      order,
    });
    order += 10;
  }
  report.push(`partners: ${order / 10 - 1}`);
}

/* The castle in the media: a title in bold, then the link under it. */
{
  const document = new JSDOM(
    pageAt("/o-zamku/zamek-v-mediich").content.rendered,
  ).window.document;
  const kindOf = (url: string) =>
    /youtube|youtu\.be|stream\.cz/.test(url)
      ? "video"
      : /soundcloud|podcast/.test(url)
        ? "podcast"
        : /ceskatelevize/.test(url)
          ? "tv"
          : "article";
  let title = "";
  let count = 0;
  for (const node of document.body.children) {
    const bold = clean(
      [...node.querySelectorAll("strong")]
        .map((item) => item.textContent)
        .join(" "),
    );
    const link = node.querySelector("a")?.getAttribute("href");
    const frame = node.querySelector("iframe")?.getAttribute("src");
    if (bold && !link) title = clean(node.textContent ?? "") || bold;
    let url = link ?? undefined;
    if (!url && frame) url = new URL(frame).searchParams.get("url") ?? frame;
    if (!url || !title) continue;
    const stray = url.match(
      /^https?:\/\/zamek-rosice\.cz\/.*\/(www\.[^/]+\..+)$/,
    );
    if (stray) url = `https://${stray[1]}`;
    documents.push({
      _id: `media-wp-${++count}`,
      _type: "mediaMention",
      title,
      url: url
        /* The old site has a link typed "thttps://". */
        .replace(/^.*?(?=https?:\/\/)/i, "")
        .replace("youtube.com/embed/", "youtube.com/watch?v=")
        .replace(/\?feature=oembed$/, ""),
      kind: kindOf(url),
    });
    title = "";
  }
  report.push(`media mentions: ${count}`);
}

/* Published documents, and the order form and price list for weddings. */
{
  const document = new JSDOM(
    pageAt("/statutarni-a-povinne-informace").content.rendered,
  ).window.document;
  const categoryOf = (title: string) =>
    /závěrečn/i.test(title)
      ? "report"
      : /výhled/i.test(title)
        ? "outlook"
        : /rozpoč/i.test(title)
          ? "budget"
          : "other";
  const seen = new Set<string>();
  const add = async (url: string, label: string, category: string) => {
    const source = original(url);
    if (seen.has(source) || !label) return;
    seen.add(source);
    const asset = await upload(url, "file");
    if (!asset) return;
    const year = label.match(/(20\d\d)(?!.*20\d\d)/)?.[1];
    documents.push({
      _id: `file-wp-${seen.size}`,
      _type: "fileDocument",
      title: { cs: label },
      category,
      ...(year ? { year: Number(year) } : {}),
      file: { _type: "file", asset: { _type: "reference", _ref: asset } },
    });
  };
  for (const link of document.querySelectorAll(
    ".wp-block-file a:not(.wp-block-file__button)",
  )) {
    const label = clean(link.textContent ?? "");
    await add(link.getAttribute("href") ?? "", label, categoryOf(label));
  }
  for (const file of orderFiles) await add(file.url, file.label, "order");
  report.push(`downloads: ${seen.size}`);

  /* Statutory details and the Facebook page, as the old site states them. */
  const rows = Object.fromEntries(
    [...document.querySelectorAll("tr")].map((row) => {
      const [label, value] = [...row.querySelectorAll("td")].map((cell) =>
        clean(cell.textContent ?? ""),
      );
      return [label ?? "", value ?? ""];
    }),
  );
  const contact = new JSDOM(pageAt("/kontakt").content.rendered).window
    .document;
  const facebook = contact
    .querySelector("a[href*='facebook.com']")
    ?.getAttribute("href");
  patches.push({
    id: "siteSettings",
    set: {
      ...(rows["IČ"] ? { companyId: rows["IČ"] } : {}),
      ...(rows["Bankovní spojení"]
        ? { bankAccount: rows["Bankovní spojení"] }
        : {}),
      ...(facebook
        ? {
            socials: withKeys([
              { _type: "social", network: "facebook", url: facebook },
            ]),
          }
        : {}),
    },
  });
}

/* ----------------------------------------------------------------- run -- */

/* The sample news the first seed wrote from the design is replaced by the real news. */
const SAMPLE_POSTS = [
  "post-vystava-betlemu-2026",
  "post-last-minute-2026",
  "post-kryt-co-uzavren",
  "post-virtuozove-2026",
];

if (!DRY) {
  const transaction = client.transaction();
  for (const document of documents) transaction.createOrReplace(document);
  for (const { id, set } of patches)
    transaction.patch(id, (patch) => patch.set(set));
  for (const id of SAMPLE_POSTS) transaction.delete(id);
  await transaction.commit();
}

console.log(
  DRY
    ? "Dry run, nothing written.\n"
    : `Written to ${client.config().dataset}.\n`,
);
console.log(report.join("\n"));
console.log(
  `\ndocuments: ${documents.length}, patched: ${patches.length}, files uploaded or reused: ${Object.keys(assets).length}`,
);
if (skipped.length > 0)
  console.log(`\nSkipped posts:\n  ${skipped.join("\n  ")}`);
if (weakAlts.length > 0) {
  console.log(
    `\n${weakAlts.length} photographs have only a file name for alternative text. First ten:\n  ${weakAlts.slice(0, 10).join("\n  ")}`,
  );
  writeFileSync(`${CACHE}/weak-alts.txt`, weakAlts.join("\n"));
}
if (failed.length > 0)
  console.log(`\nCould not fetch:\n  ${failed.join("\n  ")}`);
