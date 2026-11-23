import {
  LANGS,
  NOINDEX_ROUTES,
  ORGANISATION,
  SITE_URL,
  type Lang,
} from "../consts.ts";
import { pagePath } from "../i18n/pages.ts";
import { ROUTES, alternates, routePath, type RouteId } from "../i18n/routes.ts";
import type { Shell, SitemapDocuments } from "../sanity/queries.ts";
import type { Closure, OpeningDays, OpeningPeriod } from "./opening.ts";

const normalize = (path: string) => `/${path.replace(/^\/+|\/+$/g, "")}`;

const excluded = new Set(NOINDEX_ROUTES.map(normalize));

/** Checks whether a route should be hidden from search. Used by BaseHead. */
export function isNoindexRoute(pathname: string): boolean {
  return excluded.has(normalize(pathname));
}

const liveHost = new URL(SITE_URL).hostname;

/**
 * Whether a host is the public site. Anywhere else the same pages are a
 * copy (a preview on workers.dev, a developer's machine) and stay out of search.
 */
export function isLiveHost(hostname: string): boolean {
  return hostname === liveHost || hostname === `www.${liveHost}`;
}

/* ---------------------------------------------------------------- text -- */

/**
 * A dictionary sentence with its `{name}` gaps filled in, or `undefined`
 * when there is nothing to fill one with, so the page's default stands.
 */
export function fillIn(
  template: string,
  values: Record<string, string | undefined>,
): string | undefined {
  let missing = false;
  const text = template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key]?.trim();
    if (!value) missing = true;
    return value ?? "";
  });
  return missing ? undefined : text;
}

/** Names as one list, each once, in the order given. */
export const listOf = (names: (string | undefined)[]): string =>
  [...new Set(names.filter((name): name is string => Boolean(name?.trim())))]
    .map((name) => name.trim())
    .join(", ");

/** The longest title search results show in full. */
export const TITLE_MAX = 60;
/** The longest description search results show in full. */
export const DESCRIPTION_MAX = 160;

/**
 * A page title with the site's name after it, as long as the two fit in a
 * search result. A long title stands alone rather than being cut.
 */
export function withSiteName(
  title: string,
  siteName: string,
  max = TITLE_MAX,
): string {
  const full = `${title} | ${siteName}`;
  return full.length <= max ? full : title;
}

/**
 * Text as a meta description: one line, no Markdown bold, and cut at a word
 * with an ellipsis when it runs past what a search result shows.
 */
export function describe(
  text: string | null | undefined,
  max = DESCRIPTION_MAX,
): string | undefined {
  const line = (text ?? "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
  if (!line) return undefined;
  if (line.length <= max) return line;
  const cut = line.slice(0, max - 1);
  const word = cut.slice(0, Math.max(cut.lastIndexOf(" "), max / 2));
  return `${word.replace(/[\s,;:–—-]+$/, "")}…`;
}

interface Span {
  text?: string;
}

interface Block {
  _type?: string;
  style?: string;
  listItem?: string;
  children?: Span[];
}

const MARKDOWN_PREFIX: Record<string, string> = {
  h1: "# ",
  h2: "## ",
  h3: "### ",
  h4: "#### ",
  h5: "##### ",
  h6: "###### ",
  blockquote: "> ",
};

/**
 * The words of Portable Text: one line per block, or Markdown with headings,
 * lists and quotations marked, for the plain-text files machines read.
 */
export function blocksToText(
  blocks: unknown[] | null | undefined,
  { markdown = false }: { markdown?: boolean } = {},
): string {
  const lines: string[] = [];
  let previousList = false;
  for (const raw of blocks ?? []) {
    const block = raw as Block;
    if (block?._type !== "block") continue;
    const words = (block.children ?? [])
      .map((span) => span.text ?? "")
      .join("")
      .replace(/\s+/g, " ")
      .trim();
    if (!words) continue;
    if (!markdown) {
      /* Running text only: headings do not read as a sentence. */
      if (!/^h\d$/.test(block.style ?? "")) lines.push(words);
      continue;
    }
    const list = Boolean(block.listItem);
    const prefix = list
      ? block.listItem === "number"
        ? "1. "
        : "- "
      : (MARKDOWN_PREFIX[block.style ?? ""] ?? "");
    /* List items stay together; everything else is its own paragraph. */
    if (lines.length > 0) lines.push(list && previousList ? "\n" : "\n\n");
    lines.push(`${prefix}${words}`);
    previousList = list;
  }
  if (markdown) return lines.join("");
  /* Text that followed a salutation heading starts in lower case. */
  const text = lines.join(" ");
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}

/* --------------------------------------------------------- social image -- */

/**
 * An image description worth reading out, or `undefined` for a file name
 * left in its place ("plakat-2026", "IMG_0412").
 */
export function meaningfulAlt(
  alt: string | null | undefined,
): string | undefined {
  const text = alt?.trim();
  return text && /\s/.test(text) ? text : undefined;
}

export const SOCIAL_WIDTH = 1200;
export const SOCIAL_HEIGHT = 630;

/** The picture shown when a page is shared, with its size and description. */
export interface SocialImage {
  src: string;
  width: number;
  height: number;
  alt?: string;
}

/** The site-wide picture: the castle's front across the courtyard of honour. */
export const DEFAULT_SOCIAL_IMAGE: SocialImage = {
  src: "/og-image.jpg",
  width: SOCIAL_WIDTH,
  height: SOCIAL_HEIGHT,
};

/** Behind a tall poster, the site's dark purple fills the sides. */
const FILL = "2c203c";

/**
 * A photograph from Sanity as a 1200 × 630 JPEG for sharing. A landscape
 * photograph is cropped around its marked subject; a tall one, usually a
 * poster with words on it, is shown whole on a dark ground so nothing is cut.
 * A JPEG because not every network that reads the tag takes WebP or AVIF.
 */
export function sanitySocialImage(
  image:
    | {
        url?: string;
        width?: number;
        height?: number;
        alt?: string;
        focus?: { x?: number; y?: number } | null;
      }
    | null
    | undefined,
): SocialImage | undefined {
  if (!image?.url?.startsWith("https://cdn.sanity.io/images/"))
    return undefined;
  const size = `w=${SOCIAL_WIDTH}&h=${SOCIAL_HEIGHT}`;
  const tall =
    image.width && image.height ? image.width / image.height < 1.2 : false;
  const { x, y } = image.focus ?? {};
  const point =
    typeof x === "number" && typeof y === "number"
      ? `&crop=focalpoint&fp-x=${x.toFixed(3)}&fp-y=${y.toFixed(3)}`
      : "";
  const fit = tall ? `fit=fill&bg=${FILL}` : `fit=crop${point}`;
  return {
    src: `${image.url}?${size}&${fit}&fm=jpg&q=80`,
    width: SOCIAL_WIDTH,
    height: SOCIAL_HEIGHT,
    ...(image.alt ? { alt: image.alt } : {}),
  };
}

/* ------------------------------------------------------ structured data -- */

export type Node = Record<string, unknown>;

/** The fixed identifiers every page's graph links to. */
export const SCHEMA_IDS = {
  organisation: `${SITE_URL}/#organization`,
  castle: `${SITE_URL}/#castle`,
  website: `${SITE_URL}/#website`,
} as const;

const isEmpty = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value as object).length === 0);

/**
 * A value with every empty field taken out, however deep: no `undefined`,
 * `null`, empty string, empty list or empty object reaches the page.
 */
export function compact<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(compact).filter((item) => !isEmpty(item)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, field]) => [key, compact(field)] as const)
        .filter(([, field]) => !isEmpty(field)),
    ) as T;
  }
  return value;
}

/** One graph for the page, its nodes linked by `@id`. */
export function schemaGraph(nodes: (Node | undefined)[]): Node {
  return {
    "@context": "https://schema.org",
    "@graph": compact(nodes.filter((node): node is Node => Boolean(node))),
  };
}

/** JSON for a `<script>` element: a `<` in any text cannot close it. */
export function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/** The organisation's details, as Sanity's settings and `ORGANISATION` give them. */
export interface Business {
  /** The name the organisation goes by in this language. */
  name: string;
  legalName?: string;
  street: string;
  postalCode: string;
  locality: string;
  phone?: string;
  mobile?: string;
  email?: string;
  companyId?: string;
  socials?: { network: string; url: string }[];
  latitude?: number;
  longitude?: number;
}

/** The organisation as the shell has it, the constants filling any gap. */
export function businessOf(
  shell: Pick<
    Shell,
    | "organisation"
    | "street"
    | "postalCode"
    | "locality"
    | "phone"
    | "mobile"
    | "email"
    | "companyId"
    | "socials"
    | "location"
  >,
): Business {
  return {
    name: shell.organisation,
    legalName: ORGANISATION.legalName,
    street: shell.street,
    postalCode: shell.postalCode,
    locality: shell.locality,
    phone: shell.phone,
    mobile: shell.mobile,
    email: shell.email,
    companyId: shell.companyId,
    socials: shell.socials,
    latitude: shell.location?.lat ?? ORGANISATION.latitude,
    longitude: shell.location?.lng ?? ORGANISATION.longitude,
  };
}

const telephone = (value?: string) =>
  value ? value.replace(/[^\d+]/g, "").replace(/^00/, "+") : undefined;

export function postalAddress(business: Business): Node {
  return {
    "@type": "PostalAddress",
    streetAddress: business.street,
    postalCode: business.postalCode,
    addressLocality: business.locality,
    addressCountry: "CZ",
  };
}

/** A profile counts only when it leads to a page, not to a network's front door. */
const profiles = (socials: Business["socials"]) =>
  (socials ?? [])
    .map(({ url }) => url)
    .filter((url) => {
      try {
        return new URL(url).pathname.replace(/\/+$/, "") !== "";
      } catch {
        return false;
      }
    });

/** The organisation that runs the castle and publishes the site. */
export function organisationNode(
  business: Business,
  { brand, logo }: { brand: string; logo: string },
): Node {
  return {
    "@type": "Organization",
    "@id": SCHEMA_IDS.organisation,
    name: business.name,
    legalName: business.legalName,
    alternateName: brand,
    url: `${SITE_URL}/`,
    logo: {
      "@type": "ImageObject",
      url: new URL(logo, SITE_URL).href,
      width: 180,
      height: 180,
    },
    email: business.email,
    telephone: telephone(business.phone ?? business.mobile),
    address: postalAddress(business),
    identifier: business.companyId && {
      "@type": "PropertyValue",
      propertyID: "IČO",
      value: business.companyId,
    },
    sameAs: profiles(business.socials),
  };
}

const DAY = (name: string) => `https://schema.org/${name}`;
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
  DAY,
);
const WEEKEND = ["Saturday", "Sunday"].map(DAY);
const HOLIDAYS = [DAY("PublicHolidays")];

const DAYS_OF_WEEK: Record<OpeningDays, string[]> = {
  daily: [...WEEKDAYS, ...WEEKEND],
  weekdays: WEEKDAYS,
  weekends: WEEKEND,
  holidays: HOLIDAYS,
  weekendsAndHolidays: [...WEEKEND, ...HOLIDAYS],
};

interface HoursSpan {
  kind: OpeningPeriod["kind"];
  days: OpeningDays;
  from: string;
  to: string;
  opens: string;
  closes: string;
}

const covers = (outer: HoursSpan, inner: HoursSpan) =>
  outer !== inner &&
  outer.kind === inner.kind &&
  outer.days === inner.days &&
  outer.from <= inner.from &&
  outer.to >= inner.to &&
  outer.opens <= inner.opens &&
  outer.closes >= inner.closes;

const hoursNode = (span: HoursSpan): Node => ({
  "@type": "OpeningHoursSpecification",
  dayOfWeek: DAYS_OF_WEEK[span.days],
  opens: span.opens,
  closes: span.closes,
  validFrom: span.from,
  validThrough: span.to,
});

/**
 * The castle's opening hours from the season's rules: for the tours and
 * exhibitions that make up "open today", the earliest opening and the latest
 * closing of each period, leaving out a period another one already covers.
 * Exceptions and the castle's closures are the special opening hours.
 */
export function openingHours(
  periods: OpeningPeriod[],
  subjects: readonly string[],
  closures: Closure[] = [],
): { regular: Node[]; special: Node[] } {
  const spans = new Map<string, HoursSpan>();
  for (const period of periods) {
    if (!subjects.includes(period.subject)) continue;
    if (period.closed || !period.opens || !period.closes) continue;
    const key = [period.kind, period.days, period.dateFrom, period.dateTo].join(
      "|",
    );
    const known = spans.get(key);
    spans.set(key, {
      kind: period.kind,
      days: period.days,
      from: period.dateFrom,
      to: period.dateTo,
      opens: known && known.opens < period.opens ? known.opens : period.opens,
      closes:
        known && known.closes > period.closes ? known.closes : period.closes,
    });
  }
  const all = [...spans.values()];
  const kept = all
    .filter((span) => !all.some((other) => covers(other, span)))
    .sort(
      (a, b) => a.from.localeCompare(b.from) || a.days.localeCompare(b.days),
    );

  const closed = closures
    .filter(({ from }) => Boolean(from))
    .map(({ from, to }) => ({
      "@type": "OpeningHoursSpecification",
      opens: "00:00",
      closes: "00:00",
      validFrom: from,
      validThrough: to || from,
    }));

  return {
    regular: kept.filter((span) => span.kind === "regular").map(hoursNode),
    special: [
      ...kept.filter((span) => span.kind === "exception").map(hoursNode),
      ...closed,
    ],
  };
}

/** The castle itself: a historic building open to visitors. */
export function castleNode(
  business: Business,
  {
    name,
    description,
    url,
    image,
    hours,
  }: {
    name: string;
    description?: string;
    url: string;
    image: string;
    hours: { regular: Node[]; special: Node[] };
  },
): Node {
  const { latitude, longitude } = business;
  const located = typeof latitude === "number" && typeof longitude === "number";
  return {
    "@type": ["TouristAttraction", "LandmarksOrHistoricalBuildings"],
    "@id": SCHEMA_IDS.castle,
    name,
    description,
    url,
    image,
    address: postalAddress(business),
    geo: located && {
      "@type": "GeoCoordinates",
      latitude,
      longitude,
    },
    hasMap:
      located &&
      `https://mapy.com/fnc/v1/showmap?mapset=basic&center=${longitude},${latitude}&zoom=17&marker=true`,
    telephone: telephone(business.phone ?? business.mobile),
    openingHoursSpecification: hours.regular,
    specialOpeningHoursSpecification: hours.special,
    isAccessibleForFree: false,
    publicAccess: true,
    maintainer: { "@id": SCHEMA_IDS.organisation },
  };
}

export function websiteNode({
  name,
  alternateName,
  languages,
}: {
  name: string;
  alternateName: string[];
  languages: string[];
}): Node {
  return {
    "@type": "WebSite",
    "@id": SCHEMA_IDS.website,
    url: `${SITE_URL}/`,
    name,
    alternateName,
    inLanguage: languages,
    publisher: { "@id": SCHEMA_IDS.organisation },
  };
}

export type PageType =
  "WebPage" | "CollectionPage" | "ContactPage" | "ImageGallery" | "AboutPage";

export function webPageNode({
  url,
  type = "WebPage",
  name,
  description,
  language,
  image,
  breadcrumb,
  about,
  datePublished,
  dateModified,
}: {
  url: string;
  type?: PageType;
  name: string;
  description?: string;
  language: string;
  image?: SocialImage;
  breadcrumb?: boolean;
  about?: string;
  datePublished?: string;
  dateModified?: string;
}): Node {
  return {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: language,
    isPartOf: { "@id": SCHEMA_IDS.website },
    about: about && { "@id": about },
    primaryImageOfPage: image && {
      "@type": "ImageObject",
      url: image.src,
      width: image.width,
      height: image.height,
      caption: meaningfulAlt(image.alt),
    },
    breadcrumb: breadcrumb ? { "@id": `${url}#breadcrumb` } : undefined,
    datePublished,
    dateModified,
  };
}

/** The way from the home page to this one, the page itself last. */
export function breadcrumbNode(
  url: string,
  items: { name: string; url: string }[],
): Node {
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

const PRAGUE_DAY = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Europe/Prague",
});

/**
 * The calendar day of a moment in Prague. An event's time of day is written
 * in words beside it ("od 18 hodin"), so only the day is certain.
 */
export const pragueDay = (value: string): string =>
  PRAGUE_DAY.format(new Date(value));

const EVENT_STATUS: Record<string, string> = {
  cancelled: "https://schema.org/EventCancelled",
  postponed: "https://schema.org/EventPostponed",
  scheduled: "https://schema.org/EventScheduled",
};

/** A price an editor typed in words, as a number when it is only a number. */
function priceOf(words?: string): { price?: number; free?: boolean } {
  if (!words) return {};
  if (/zdarma|volný|vstup volný|free|frei|kostenlos/i.test(words))
    return { free: true, price: 0 };
  const match = /^\s*(\d+(?:[.,]\d+)?)\s*(?:Kč|CZK|,-)?\s*$/i.exec(words);
  return match ? { price: Number(match[1].replace(",", ".")) } : {};
}

/** An event at the castle, from a news item of the event kind. */
export function eventNode({
  url,
  name,
  description,
  image,
  start,
  end,
  status,
  place,
  ticketUrl,
  price,
  language,
  business,
}: {
  url: string;
  name: string;
  description?: string;
  image?: SocialImage;
  start: string;
  end?: string;
  status?: string;
  place?: string;
  ticketUrl?: string;
  price?: string;
  language: string;
  business: Business;
}): Node {
  const { price: amount, free } = priceOf(price);
  const offer =
    ticketUrl || amount !== undefined
      ? {
          "@type": "Offer",
          url: ticketUrl ?? url,
          price: amount,
          priceCurrency: amount !== undefined ? "CZK" : undefined,
        }
      : undefined;
  return {
    "@type": "Event",
    "@id": `${url}#event`,
    name,
    description,
    url,
    image: image && [image.src],
    startDate: pragueDay(start),
    endDate: end ? pragueDay(end) : undefined,
    eventStatus: EVENT_STATUS[status ?? "scheduled"] ?? EVENT_STATUS.scheduled,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: place ?? business.name,
      address: postalAddress(business),
    },
    organizer: { "@id": SCHEMA_IDS.organisation },
    isAccessibleForFree: free || undefined,
    offers: offer,
    inLanguage: language,
    mainEntityOfPage: { "@id": `${url}#webpage` },
  };
}

/** A news item. Search shows at most 110 characters of a headline. */
export function articleNode({
  url,
  headline,
  description,
  image,
  datePublished,
  dateModified,
  language,
}: {
  url: string;
  headline: string;
  description?: string;
  image?: SocialImage;
  datePublished: string;
  dateModified?: string;
  language: string;
}): Node {
  return {
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    headline: describe(headline, 110),
    description,
    image: image && [image.src],
    datePublished,
    dateModified: dateModified ?? datePublished,
    inLanguage: language,
    author: { "@id": SCHEMA_IDS.organisation },
    publisher: { "@id": SCHEMA_IDS.organisation },
    mainEntityOfPage: { "@id": `${url}#webpage` },
  };
}

/* ------------------------------------------------------------- sitemap -- */

export interface SitemapEntry {
  /** Path on the site, with its trailing slash. */
  path: string;
  /** Every language version, this one included, for `hreflang`. */
  alternates?: { lang: string; path: string }[];
  /** When the content last changed, ISO 8601. */
  lastmod?: string;
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * A sitemap with every language version of each address beside it, the
 * Czech one standing for `x-default`. Each address appears once.
 */
export function sitemapXml(
  entries: SitemapEntry[],
  site: string | URL,
  defaultLang = "cs",
): string {
  const absolute = (path: string) => escapeXml(new URL(path, site).href);
  const seen = new Set<string>();
  const urls = entries.flatMap((entry) => {
    if (seen.has(entry.path)) return [];
    seen.add(entry.path);
    const alternates = entry.alternates ?? [];
    const fallback = alternates.find((item) => item.lang === defaultLang);
    const links =
      alternates.length > 1
        ? [
            ...alternates.map(
              (item) =>
                `<xhtml:link rel="alternate" hreflang="${item.lang}" href="${absolute(item.path)}"/>`,
            ),
            ...(fallback
              ? [
                  `<xhtml:link rel="alternate" hreflang="x-default" href="${absolute(fallback.path)}"/>`,
                ]
              : []),
          ]
        : [];
    const lastmod = entry.lastmod
      ? [`<lastmod>${escapeXml(entry.lastmod)}</lastmod>`]
      : [];
    return [
      [
        "<url>",
        `<loc>${absolute(entry.path)}</loc>`,
        ...lastmod,
        ...links,
        "</url>",
      ].join(""),
    ];
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

const isLang = (value: string): value is Lang =>
  (LANGS as readonly string[]).includes(value);

/**
 * Every indexable address: the code pages in each language (news only where
 * there is news), each tour and album under the slugs it has, and each news
 * item and text page with its translations. The first castle album is the
 * gallery's front page and has no address of its own; albums from events
 * all have theirs.
 */
export function sitemapEntries(
  documents: SitemapDocuments,
  newsLanguages: readonly Lang[],
): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const add = (versions: { lang: Lang; path: string }[], lastmod?: string) => {
    for (const version of versions) {
      if (isNoindexRoute(version.path)) continue;
      entries.push({ path: version.path, alternates: versions, lastmod });
    }
  };

  for (const id of Object.keys(ROUTES) as RouteId[]) {
    const versions = alternates(id).filter(
      (item) => id !== "news" || newsLanguages.includes(item.lang),
    );
    add(versions);
  }
  for (const tour of documents.tours) {
    if (tour.slugs.cs) add(alternates("tours", tour.slugs), tour.updatedAt);
  }
  const front = documents.albums.find((album) => album.category !== "events");
  for (const album of documents.albums) {
    if (album !== front && album.slugs.cs) {
      add(alternates("gallery", album.slugs), album.updatedAt);
    }
  }
  for (const post of documents.posts) {
    if (!isLang(post.lang)) continue;
    const others = (post.translations ?? []).flatMap((item) =>
      isLang(item.lang) && item.slug && item.lang !== post.lang
        ? [{ lang: item.lang, path: routePath("news", item.lang, item.slug) }]
        : [],
    );
    const own = {
      lang: post.lang,
      path: routePath("news", post.lang, post.slug),
    };
    entries.push({
      path: own.path,
      alternates: [own, ...others],
      lastmod: post.updatedAt,
    });
  }
  for (const page of documents.pages) {
    if (!isLang(page.lang)) continue;
    const own = {
      lang: page.lang,
      path: pagePath(page.parent, page.slug, page.lang),
    };
    const others = (page.translations ?? []).flatMap((item) =>
      isLang(item.lang) && item.slug && item.lang !== page.lang
        ? [
            {
              lang: item.lang,
              path: pagePath(item.parent, item.slug, item.lang),
            },
          ]
        : [],
    );
    if (!isNoindexRoute(own.path)) {
      entries.push({
        path: own.path,
        alternates: [own, ...others],
        lastmod: page.updatedAt,
      });
    }
  }
  return entries;
}

/* -------------------------------------------------------------- robots -- */

/**
 * Crawlers named so it is plain they are welcome: the search engines' and
 * the AI assistants' own. A crawler that finds its name reads only its own
 * group, so each one repeats the paths that stay closed.
 */
export const WELCOME_CRAWLERS = [
  "Googlebot",
  "Bingbot",
  "SeznamBot",
  "Applebot",
  "DuckDuckBot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "meta-externalagent",
  "DuckAssistBot",
  "MistralAI-User",
  "CCBot",
];

/** Paths with nothing to read: the form's API and the Studio. */
export const CLOSED_PATHS = ["/api/", "/studio/"];

export function robotsTxt(site: string | URL): string {
  const group = (agents: string[]) => [
    ...agents.map((agent) => `User-agent: ${agent}`),
    "Allow: /",
    ...CLOSED_PATHS.map((path) => `Disallow: ${path}`),
  ];
  return [
    ...group(["*"]),
    "",
    ...group(WELCOME_CRAWLERS),
    "",
    `Sitemap: ${new URL("/sitemap.xml", site).href}`,
    "",
  ].join("\n");
}
