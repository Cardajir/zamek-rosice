import type { Lang } from "@/consts.ts";
import { OPENING_2026 } from "@/data/opening-2026.ts";
import { pagePath } from "@/i18n/pages.ts";
import type { LabelledPeriod } from "@/utils/hours.ts";
import { query } from "./client.ts";
import { IMAGE, text, type Image, type NavLink } from "./queries.ts";

/* Queries for the pages that live in code and read structured documents. */

const clean = <T extends object>(value: T): T =>
  Object.fromEntries(
    Object.entries(value).filter(([, field]) => field != null),
  ) as T;

/* ------------------------------------------------------------ admission -- */

export interface PriceRow {
  label: string;
  condition?: string;
  /** One price, or the full and the reduced one side by side. */
  prices: number[];
  unit?: "czk" | "czkPerHour";
}

export interface PriceList {
  title: string;
  intro?: string;
  note?: string;
  rows: PriceRow[];
}

export interface Admission {
  lists: PriceList[];
  periods: LabelledPeriod[];
  /** Tours and places with opening hours, in the order an editor set. */
  subjects: { subject: string; name: string }[];
}

const ADMISSION = `{
  "lists": *[_type == "ticketList"] | order(order asc){
    "title": ${text("title")},
    "intro": ${text("intro")},
    "note": ${text("note")},
    rows[]{
      "label": ${text("label")},
      "condition": ${text("condition")},
      prices,
      unit
    }
  },
  "periods": *[_type == "openingPeriod"]{
    "label": ${text("label")},
    "note": ${text("note")},
    kind, dateFrom, dateTo, days, closed, opens, closes, lastEntry,
    startRule, startTimes, priority,
    "subjects": appliesTo[]->subject
  },
  "subjects": *[_type == "tour" && defined(subject)] | order(order asc){
    subject,
    "name": ${text("title")}
  }
}`;

/** Price lists and the season's opening hours. */
export async function getAdmission(lang: Lang): Promise<Admission> {
  const raw = await query<Partial<Admission>>(ADMISSION, { lang }, {});

  const periods = (raw.periods ?? []).map((period) => ({
    ...clean(period),
    subjects: (period.subjects ?? []).filter(Boolean),
  }));
  const subjects = raw.subjects ?? [];

  /* With no Sanity the season's fallback still gives a readable table. */
  const fallback = periods.length === 0;
  return {
    lists: (raw.lists ?? [])
      .filter((list) => list.title && list.rows?.length)
      .map((list) => ({
        ...clean(list),
        rows: list.rows
          .filter((row) => row.label)
          .map((row) => ({ ...clean(row), prices: row.prices ?? [] })),
      })),
    periods: fallback
      ? OPENING_2026.map(({ subject, ...rule }) => ({
          ...rule,
          subjects: [subject],
        }))
      : periods,
    subjects: fallback
      ? [...new Set(OPENING_2026.map((rule) => rule.subject))].map(
          (subject) => ({ subject, name: subject }),
        )
      : subjects,
  };
}

/* ----------------------------------------------------------- directions -- */

export interface Directions {
  intro?: string;
  byCar?: string;
  byTrain?: string;
  byBus?: string;
  parking?: string;
  accessibility?: string;
  mapUrl?: string;
  image?: Image;
  location?: { lat: number; lng: number };
}

const DIRECTIONS = `*[_id == "visitInfo"][0]{
  "intro": ${text("intro")},
  "byCar": ${text("byCar")},
  "byTrain": ${text("byTrain")},
  "byBus": ${text("byBus")},
  "parking": ${text("parking")},
  "accessibility": ${text("accessibility")},
  mapUrl,
  "image": image${IMAGE},
  "location": *[_id == "siteSettings"][0].location{ lat, lng }
}`;

/** How to reach the castle. */
export async function getDirections(lang: Lang): Promise<Directions> {
  const raw = clean(await query<Directions>(DIRECTIONS, { lang }, {}));
  return { ...raw, image: raw.image?.url ? raw.image : undefined };
}

/* -------------------------------------------------------------- gallery -- */

export interface Album {
  title: string;
  slug: string;
  count: number;
  /** Its first photographs, for the selection on the gallery's front page. */
  images: Image[];
}

export interface AlbumDetail {
  title: string;
  slug: string;
  images: Image[];
  /** The album's slug in every language, for `hreflang`. */
  slugs: Partial<Record<Lang, string>>;
}

/* A photograph with no author of its own carries the album's. */
const PHOTO = `{
  "url": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "alt": ${text("alt")},
  "caption": ${text("caption")},
  "credit": coalesce(credit, ^.defaultCredit)
}`;

const ALBUMS = `*[_type == "gallery" && count(images) > 0] | order(order asc){
  "title": ${text("title")},
  "slug": coalesce(slug[$lang].current, slug.cs.current),
  "count": count(images),
  "images": images[0..1]${PHOTO}
}`;

const photos = (images: Image[] | null | undefined) =>
  (images ?? []).filter((image) => image?.url).map(clean);

/** Every album that has photographs, in the order an editor set. */
export async function getAlbums(lang: Lang): Promise<Album[]> {
  const albums = await query<Album[]>(ALBUMS, { lang }, []);
  return albums
    .filter((album) => album.title && album.slug)
    .map((album) => ({ ...album, images: photos(album.images) }));
}

const ALBUM = `*[_type == "gallery"
    && coalesce(slug[$lang].current, slug.cs.current) == $slug][0]{
  "title": ${text("title")},
  "slug": coalesce(slug[$lang].current, slug.cs.current),
  "images": images[]${PHOTO},
  "slugs": { "cs": slug.cs.current, "en": slug.en.current, "de": slug.de.current }
}`;

/** One album by its slug in a language, or `undefined`. */
export async function getAlbum(
  lang: Lang,
  slug: string,
): Promise<AlbumDetail | undefined> {
  const album = await query<AlbumDetail | null>(ALBUM, { lang, slug }, null);
  if (!album) return undefined;
  return {
    ...album,
    images: photos(album.images),
    slugs: clean(album.slugs ?? {}),
  };
}

/* -------------------------------------------------------------- contact -- */

export interface Person {
  name: string;
  role?: string;
  phone?: string;
  email?: string;
}

const PEOPLE = `*[_type == "person"] | order(order asc){
  name, "role": ${text("role")}, phone, email
}`;

/** The people to write or call, in the order an editor set. */
export async function getPeople(lang: Lang): Promise<Person[]> {
  const people = await query<Person[]>(PEOPLE, { lang }, []);
  return people.filter((person) => person.name).map(clean);
}

/* ---------------------------------------------------------------- media -- */

export interface MediaMention {
  title: string;
  outlet?: string;
  date?: string;
  url: string;
  kind?: "video" | "article" | "podcast" | "tv";
}

const MEDIA = `*[_type == "mediaMention"] | order(date desc, _createdAt asc){
  title, outlet, date, url, kind
}`;

/** Where the castle appeared, newest first. */
export async function getMedia(): Promise<MediaMention[]> {
  const mentions = await query<MediaMention[]>(MEDIA, {}, []);
  return mentions
    .filter((item) => item.title && /^https?:\/\//.test(item.url ?? ""))
    .map(clean);
}

/* ------------------------------------------------------------- partners -- */

export interface Partner {
  name: string;
  description?: string;
  url?: string;
  logo?: { url: string; width: number; height: number };
}

const PARTNERS = `*[_type == "partner"] | order(order asc){
  name,
  "description": ${text("description")},
  url,
  "logo": logo.asset->{
    url,
    "width": metadata.dimensions.width,
    "height": metadata.dimensions.height
  }
}`;

/** The castle's partners, in the order an editor set. */
export async function getPartners(lang: Lang): Promise<Partner[]> {
  const partners = await query<Partner[]>(PARTNERS, { lang }, []);
  return partners.filter((partner) => partner.name).map(clean);
}

/* ------------------------------------------------------------ statutory -- */

export type DocumentCategory =
  "report" | "budget" | "outlook" | "order" | "other";

export interface FileDocument {
  title: string;
  category: DocumentCategory;
  year?: number;
  url: string;
  /** Size in bytes. */
  size?: number;
  extension?: string;
}

export interface Statutory {
  founder?: string;
  companyId?: string;
  bankAccount?: string;
  documents: FileDocument[];
  /** Text pages that belong to this part of the site. */
  pages: NavLink[];
}

interface RawPage {
  title?: string;
  slug?: string;
  parent?: string;
}

interface RawStatutory {
  settings?: Pick<Statutory, "founder" | "companyId" | "bankAccount"> | null;
  documents?: (Omit<FileDocument, "url" | "size" | "extension"> & {
    file?: Pick<FileDocument, "url" | "size" | "extension"> | null;
  })[];
  pages?: RawPage[];
  pagesCs?: RawPage[];
}

/* A document offers its translation where one was uploaded. */
const STATUTORY = `{
  "settings": *[_id == "siteSettings"][0]{
    "founder": ${text("founder")}, companyId, bankAccount
  },
  "documents": *[_type == "fileDocument"] | order(year desc, title.cs asc){
    "title": ${text("title")},
    category,
    year,
    "file": coalesce(
      select($lang == "en" => fileEn, $lang == "de" => fileDe),
      file
    ).asset->{ url, size, extension }
  },
  "pages": *[_type == "page" && language == $lang && parent == "statutory"]
    | order(title asc){ title, "slug": slug.current, parent },
  "pagesCs": *[_type == "page" && language == "cs" && parent == "statutory"]
    | order(title asc){ title, "slug": slug.current, parent }
}`;

/** Legal details of the organisation and the documents it has to publish. */
export async function getStatutory(lang: Lang): Promise<Statutory> {
  const raw = await query<RawStatutory>(STATUTORY, { lang }, {});

  /* Until a page is translated its Czech version is what there is to link. */
  const translated = (raw.pages ?? []).length > 0;
  const pages = (translated ? raw.pages : raw.pagesCs) ?? [];

  return {
    ...clean(raw.settings ?? {}),
    documents: (raw.documents ?? []).flatMap(({ file, ...document }) =>
      document.title && file?.url ? [clean({ ...document, ...file })] : [],
    ),
    pages: pages.flatMap((page) =>
      page.title && page.slug
        ? [
            {
              label: page.title,
              href: pagePath(page.parent, page.slug, translated ? lang : "cs"),
            },
          ]
        : [],
    ),
  };
}
