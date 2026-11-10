import type { Lang } from "@/consts.ts";
import { OPENING_2026 } from "@/data/opening-2026.ts";
import { fallbackShell } from "@/data/shell.ts";
import { pagePath } from "@/i18n/pages.ts";
import { routePath, type RouteId, ROUTES } from "@/i18n/routes.ts";
import type { Closure, OpeningPeriod } from "@/utils/opening.ts";
import { query } from "./client.ts";

/* ------------------------------------------------------------ fragments -- */

export const text = (field: string) => `coalesce(${field}[$lang], ${field}.cs)`;

export const IMAGE = `{
  "url": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "alt": ${text("alt")},
  "caption": ${text("caption")},
  credit,
  "focus": hotspot{ x, y }
}`;

/*
 * A link as stored, with what is needed to turn its target into an address.
 * Pages and news have one document per language: the reference points at the
 * Czech one and the translation is looked up through the plugin's metadata.
 */
const LINK = `{
  "label": ${text("label")},
  kind,
  route,
  url,
  "target": reference->{
    _type,
    parent,
    "slug": select(
      _type in ["page", "post"] => slug.current,
      coalesce(slug[$lang].current, slug.cs.current)
    ),
    "translated": select(
      _type in ["page", "post"] && $lang != "cs" =>
        *[_type == "translation.metadata" && references(^._id)][0]
          .translations[_key == $lang][0].value->{ "slug": slug.current, parent }
    )
  }
}`;

const POST = `{
  title,
  "slug": slug.current,
  kind,
  perex,
  publishedAt,
  eventStart,
  eventEnd,
  eventPrice,
  "image": image${IMAGE}
}`;

/* ---------------------------------------------------------------- types -- */

export interface Image {
  url: string;
  width: number;
  height: number;
  alt?: string;
  caption?: string;
  credit?: string;
  /** The point an editor marked as the photograph's subject, 0 to 1 from the top left. */
  focus?: { x?: number; y?: number } | null;
}

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

interface RawLink {
  label?: string;
  kind?: "internal" | "route" | "external" | "file";
  route?: string;
  url?: string;
  target?: {
    _type: string;
    parent?: string;
    slug?: string;
    translated?: { slug?: string; parent?: string } | null;
  } | null;
}

export interface Post {
  title: string;
  slug: string;
  kind: "news" | "event";
  perex?: string;
  publishedAt: string;
  eventStart?: string;
  eventEnd?: string;
  eventPrice?: string;
  image?: Image;
}

export interface Shell {
  organisation: string;
  street: string;
  postalCode: string;
  locality: string;
  phone?: string;
  mobile?: string;
  email?: string;
  socials: { network: string; url: string }[];
  rating?: { value: number; source?: string; url?: string; label?: string };
  groups: { label: string; items: NavLink[] }[];
  topLinks: NavLink[];
  footerColumns: NavLink[][];
  partners: { name: string; url?: string; logo?: string }[];
  /** Full and reduced admission, for the status bar. */
  prices: number[];
  opening: OpeningPeriod[];
  /** Days the castle is shut whatever the opening hours say. */
  closures: Closure[];
  cta?: { title: string; image?: Image; link?: NavLink };
}

/* ---------------------------------------------------------------- links -- */

const isRoute = (value: unknown): value is RouteId =>
  typeof value === "string" && value in ROUTES;

/** Turn a stored link into a label and an address. `undefined` when it leads nowhere. */
export function resolveLink(
  raw: RawLink | null | undefined,
  lang: Lang,
): NavLink | undefined {
  if (!raw?.label) return undefined;
  const label = raw.label;

  if (raw.kind === "route" && isRoute(raw.route)) {
    return { label, href: routePath(raw.route, lang) };
  }
  if (raw.kind === "external" && raw.url) {
    return { label, href: raw.url, external: /^https?:/.test(raw.url) };
  }

  const target = raw.target;
  if (raw.kind !== "internal" || !target?.slug) return undefined;

  switch (target._type) {
    case "tour":
      return { label, href: routePath("tours", lang, target.slug) };
    case "gallery":
      return { label, href: routePath("gallery", lang, target.slug) };
    case "post": {
      const translated = target.translated?.slug;
      return translated
        ? { label, href: routePath("news", lang, translated) }
        : { label, href: routePath("news", "cs", target.slug) };
    }
    case "page": {
      /* A page with no translation yet is linked in Czech rather than to a 404. */
      const translated = target.translated;
      return translated?.slug
        ? { label, href: pagePath(translated.parent, translated.slug, lang) }
        : { label, href: pagePath(target.parent, target.slug, "cs") };
    }
    default:
      return undefined;
  }
}

const links = (raw: RawLink[] | null | undefined, lang: Lang): NavLink[] =>
  (raw ?? []).flatMap((item) => resolveLink(item, lang) ?? []);

/* ---------------------------------------------------------------- shell -- */

interface RawPeriod extends Omit<OpeningPeriod, "subject"> {
  subjects?: (string | null)[];
}

interface RawShell {
  settings?: Partial<Shell> | null;
  navigation?: {
    groups?: { label?: string; items?: RawLink[] }[];
    topLinks?: RawLink[];
    footerColumns?: { items?: RawLink[] }[];
  } | null;
  partners?: Shell["partners"];
  prices?: (number | null)[] | null;
  opening?: RawPeriod[];
  closures?: Closure[] | null;
  cta?: { title?: string; image?: Image; link?: RawLink } | null;
}

const SHELL = `{
  "settings": *[_id == "siteSettings"][0]{
    "organisation": ${text("organisation")},
    street, postalCode, locality, phone, mobile, email,
    socials[]{ network, url },
    rating{ value, source, url, "label": ${text("label")} }
  },
  "navigation": *[_id == "navigation"][0]{
    groups[]{ "label": ${text("label")}, items[]${LINK} },
    topLinks[]${LINK},
    footerColumns[]{ items[]${LINK} }
  },
  "partners": *[_type == "partner" && showInFooter == true] | order(order asc){
    name, url, "logo": logo.asset->url
  },
  "prices": *[_type == "ticketList" && showInStatusBar == true][0].rows[0..1]{ "price": prices[0] }.price,
  "opening": *[_type == "openingPeriod"]{
    kind, dateFrom, dateTo, days, closed, opens, closes, lastEntry,
    startRule, startTimes, priority,
    "subjects": appliesTo[]->subject
  },
  "closures": *[_id == "visitInfo"][0].closures[defined(from)]{
    from, to, "reason": ${text("reason")}
  },
  "cta": *[_id == "homePage"][0].cta{
    "title": ${text("title")},
    "image": image${IMAGE},
    link${LINK}
  }
}`;

/** One rule per subject, as `src/utils/opening.ts` reads them. */
function expand(periods: RawPeriod[] | undefined): OpeningPeriod[] {
  return (periods ?? []).flatMap(({ subjects, ...rule }) =>
    (subjects ?? [])
      .filter((subject): subject is string => Boolean(subject))
      .map((subject) => ({ ...rule, subject })),
  );
}

/**
 * What every page shares: contact details, the menu, the footer, admission
 * for the status bar and the opening hours. Anything Sanity does not have yet
 * falls back to the static copy in `src/data`.
 */
export async function getShell(lang: Lang): Promise<Shell> {
  const fallback = fallbackShell(lang);
  const raw = await query<RawShell>(SHELL, { lang }, {});

  const groups = (raw.navigation?.groups ?? [])
    .map((group) => ({
      label: group.label ?? "",
      items: links(group.items, lang),
    }))
    .filter((group) => group.label && group.items.length > 0);
  const topLinks = links(raw.navigation?.topLinks, lang);
  const footerColumns = (raw.navigation?.footerColumns ?? [])
    .map((column) => links(column.items, lang))
    .filter((column) => column.length > 0);
  const prices = (raw.prices ?? []).filter(
    (price): price is number => typeof price === "number",
  );
  const opening = expand(raw.opening);
  const settings = raw.settings ?? {};

  return {
    ...fallback,
    ...Object.fromEntries(
      Object.entries(settings).filter(([, value]) => value != null),
    ),
    socials: settings.socials ?? fallback.socials,
    groups: groups.length > 0 ? groups : fallback.groups,
    topLinks: topLinks.length > 0 ? topLinks : fallback.topLinks,
    footerColumns:
      footerColumns.length > 0 ? footerColumns : fallback.footerColumns,
    partners: raw.partners ?? [],
    prices: prices.length > 0 ? prices : fallback.prices,
    opening: opening.length > 0 ? opening : OPENING_2026,
    closures: (raw.closures ?? []).map(({ from, to, reason }) => ({
      from,
      ...(to ? { to } : {}),
      ...(reason ? { reason } : {}),
    })),
    cta: raw.cta?.title
      ? {
          title: raw.cta.title,
          image: raw.cta.image,
          link: resolveLink(raw.cta.link, lang),
        }
      : fallback.cta,
  };
}

/* ----------------------------------------------------------------- home -- */

export interface TourCard {
  title: string;
  slug: string;
  perex?: string;
  kind: "tour" | "exhibition" | "outdoor";
  duration?: { min?: number; max?: number; unlimited?: boolean };
  free?: boolean;
  image?: Image;
}

export interface Promo {
  eyebrow?: string;
  title: string;
  text?: string;
  images: Image[];
  link?: NavLink;
}

export interface Home {
  heading?: string;
  headingLink?: NavLink;
  heroImage?: Image;
  /** The wide photograph above the visitors' rating. */
  secondImage?: Image;
  heritageNote?: string;
  promos: Promo[];
  quote?: { text: string; author?: string; date?: string };
  tours: TourCard[];
  posts: Post[];
}

interface RawHome {
  home?: {
    heading?: string;
    headingLink?: RawLink;
    heroImage?: Image;
    secondImage?: Image;
    heritageNote?: string;
    promos?: (Omit<Promo, "link" | "images"> & {
      images?: Image[];
      link?: RawLink;
    })[];
    quote?: Home["quote"];
  } | null;
  tours?: TourCard[];
  upcoming?: Post[];
  latest?: Post[];
}

const HOME = `{
  "home": *[_id == "homePage"][0]{
    "heading": ${text("heading")},
    headingLink${LINK},
    "heroImage": heroImage${IMAGE},
    "secondImage": secondImage${IMAGE},
    "heritageNote": ${text("heritageNote")},
    promos[]{
      "eyebrow": ${text("eyebrow")},
      "title": ${text("title")},
      "text": ${text("text")},
      images[]${IMAGE},
      link${LINK}
    },
    quote{ "text": ${text("text")}, "author": ${text("author")}, date }
  },
  "tours": *[_type == "tour" && showOnHome == true] | order(order asc){
    "title": ${text("title")},
    "slug": coalesce(slug[$lang].current, slug.cs.current),
    "perex": ${text("perex")},
    kind, duration, free,
    "image": images[0]${IMAGE}
  },
  "upcoming": *[_type == "post" && language == $lang && kind == "event"
      && coalesce(eventEnd, eventStart) >= $now] | order(eventStart asc)[0...4]${POST},
  "latest": *[_type == "post" && language == $lang] | order(publishedAt desc)[0...4]${POST}
}`;

/** The home page: its own texts, the tours it shows and the events list. */
export async function getHome(lang: Lang): Promise<Home> {
  const raw = await query<RawHome>(
    HOME,
    { lang, now: new Date().toISOString() },
    {},
  );
  const home = raw.home ?? {};

  /* Events still to come first, then the newest items, four in all. */
  const seen = new Set<string>();
  const posts = [...(raw.upcoming ?? []), ...(raw.latest ?? [])]
    .filter((post) => !seen.has(post.slug) && Boolean(seen.add(post.slug)))
    .slice(0, 4);

  return {
    heading: home.heading,
    headingLink: resolveLink(home.headingLink, lang),
    heroImage: home.heroImage?.url ? home.heroImage : undefined,
    secondImage: home.secondImage?.url ? home.secondImage : undefined,
    heritageNote: home.heritageNote,
    promos: (home.promos ?? []).map((promo) => ({
      ...promo,
      images: (promo.images ?? []).filter((image) => image?.url),
      link: resolveLink(promo.link, lang),
    })),
    quote: home.quote?.text ? home.quote : undefined,
    tours: (raw.tours ?? []).map((tour) => ({
      ...tour,
      image: tour.image?.url ? tour.image : undefined,
    })),
    posts,
  };
}

/* ----------------------------------------------------------------- page -- */

export interface TextPage {
  title: string;
  perex?: string;
  parent?: string;
  slug: string;
  /** The same page in the other languages, for `hreflang`. */
  translations: { lang: Lang; slug: string; parent?: string }[];
}

const PAGE = `*[_type == "page" && language == $lang && slug.current == $slug
    && coalesce(parent, "none") == $parent][0]{
  title, perex, parent, "slug": slug.current,
  "translations": *[_type == "translation.metadata" && references(^._id)][0]
    .translations[]{ "lang": _key, "slug": value->slug.current, "parent": value->parent }
}`;

/** A page-builder page by where it sits and its slug, or `undefined`. */
export async function getPage(
  lang: Lang,
  parent: string,
  slug: string,
): Promise<TextPage | undefined> {
  const page = await query<TextPage | null>(PAGE, { lang, parent, slug }, null);
  if (!page) return undefined;
  return {
    ...page,
    translations: (page.translations ?? []).filter((item) => item?.slug),
  };
}

/** The shell for this request, loaded once however many components ask. */
export function shellFor(locals: App.Locals): Promise<Shell> {
  locals.shell ??= getShell(locals.lang ?? "cs");
  return locals.shell;
}

/* ----------------------------------------------------- formatted text -- */

/* Portable Text with its photographs resolved to an address and a size. */
const BODY = `[]{
  ...,
  _type == "imageWithAlt" => {
    "url": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height,
    "alt": ${text("alt")},
    "caption": ${text("caption")},
    credit
  }
}`;

/* ---------------------------------------------------------- text page -- */

export interface PageSection {
  _type: string;
  _key: string;
  body?: unknown[];
}

const PAGE_SECTIONS = `*[_type == "page" && language == $lang && slug.current == $slug
    && coalesce(parent, "none") == $parent][0].sections[]{
  _type, _key,
  "body": body${BODY}
}`;

/** The sections of a page-builder page, in order. */
export async function getPageSections(
  lang: Lang,
  parent: string,
  slug: string,
): Promise<PageSection[]> {
  return query<PageSection[]>(PAGE_SECTIONS, { lang, parent, slug }, []);
}

/* ---------------------------------------------------------------- news -- */

export interface News {
  /** The item an editor pinned above the list. */
  featured?: Post;
  /** Events that have not ended yet, soonest first. */
  upcoming: Post[];
  /** Everything else, newest first. */
  archive: Post[];
}

const NEWS = `{
  "featured": *[_type == "post" && language == $lang && featured == true]
    | order(publishedAt desc)[0]${POST},
  "upcoming": *[_type == "post" && language == $lang && kind == "event"
      && coalesce(eventEnd, eventStart) >= $now] | order(eventStart asc)${POST},
  "all": *[_type == "post" && language == $lang] | order(publishedAt desc)${POST}
}`;

/** The news page: the pinned item, what is coming, and the archive. */
export async function getNews(lang: Lang): Promise<News> {
  const raw = await query<{
    featured?: Post | null;
    upcoming?: Post[];
    all?: Post[];
  }>(NEWS, { lang, now: new Date().toISOString() }, {});
  const upcoming = raw.upcoming ?? [];
  const shown = new Set(upcoming.map((post) => post.slug));
  return {
    featured: raw.featured ?? undefined,
    upcoming,
    archive: (raw.all ?? []).filter((post) => !shown.has(post.slug)),
  };
}

export interface PostDetail extends Post {
  body?: unknown[];
  eventTimeNote?: string;
  eventPlace?: string;
  eventTicketUrl?: string;
  eventStatus?: string;
  /** The same item in the other languages, for `hreflang`. */
  translations: { lang: string; slug: string }[];
}

const POST_DETAIL = `*[_type == "post" && language == $lang && slug.current == $slug][0]{
  title, "slug": slug.current, kind, perex, publishedAt,
  eventStart, eventEnd, eventPrice, eventTimeNote, eventPlace, eventTicketUrl, eventStatus,
  "image": image${IMAGE},
  "body": body${BODY},
  "translations": *[_type == "translation.metadata" && references(^._id)][0]
    .translations[]{ "lang": _key, "slug": value->slug.current }
}`;

/** One news item or event by its slug, or `undefined`. */
export async function getPost(
  lang: Lang,
  slug: string,
): Promise<PostDetail | undefined> {
  const post = await query<PostDetail | null>(
    POST_DETAIL,
    { lang, slug },
    null,
  );
  if (!post) return undefined;
  return {
    ...post,
    image: post.image?.url ? post.image : undefined,
    translations: (post.translations ?? []).filter((item) => item?.slug),
  };
}

/* --------------------------------------------------------------- tours -- */

export interface TourDetail extends TourCard {
  body?: unknown[];
  images: Image[];
  /** The tour's slug in every language, for `hreflang`. */
  slugs: Partial<Record<Lang, string>>;
}

const TOUR_FIELDS = `
  "title": ${text("title")},
  "slug": coalesce(slug[$lang].current, slug.cs.current),
  "perex": ${text("perex")},
  kind, duration, free,
  "image": images[0]${IMAGE}`;

const TOURS = `*[_type == "tour"] | order(order asc){${TOUR_FIELDS}}`;

/** Every tour and exhibition, in the order an editor set. */
export async function getTours(lang: Lang): Promise<TourCard[]> {
  const tours = await query<TourCard[]>(TOURS, { lang }, []);
  return tours.map((tour) => ({
    ...tour,
    image: tour.image?.url ? tour.image : undefined,
  }));
}

const TOUR = `*[_type == "tour" && coalesce(slug[$lang].current, slug.cs.current) == $slug][0]{
  ${TOUR_FIELDS},
  "body": coalesce(body[$lang], body.cs)${BODY},
  "images": images[]${IMAGE},
  "slugs": { "cs": slug.cs.current, "en": slug.en.current, "de": slug.de.current }
}`;

/** One tour by its slug in a language, or `undefined`. */
export async function getTour(
  lang: Lang,
  slug: string,
): Promise<TourDetail | undefined> {
  const tour = await query<TourDetail | null>(TOUR, { lang, slug }, null);
  if (!tour) return undefined;
  return {
    ...tour,
    image: tour.image?.url ? tour.image : undefined,
    images: (tour.images ?? []).filter((image) => image?.url),
  };
}
