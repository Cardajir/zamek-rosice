import { DEFAULT_LANG, LANGS, type Lang } from "../consts.ts";

/**
 * Every page that lives in code, with its address in each language. Czech is
 * the path of the `.astro` file; English and German are rewritten onto it by
 * the middleware, so one file serves all three.
 *
 * A route ending in a detail (`tours`, `news`, `gallery`) also serves
 * `<path>/<slug>`, where the slug comes from Sanity.
 */
export const ROUTES = {
  home: { cs: "/", en: "/", de: "/" },
  tours: {
    cs: "/navstivte-nas/prohlidky",
    en: "/visit/tours",
    de: "/besuch/fuehrungen",
  },
  admission: {
    cs: "/navstivte-nas/vstupne-a-oteviraci-doba",
    en: "/visit/admission-and-opening-hours",
    de: "/besuch/eintritt-und-oeffnungszeiten",
  },
  directions: {
    cs: "/navstivte-nas/kde-nas-najdete",
    en: "/visit/getting-here",
    de: "/besuch/anfahrt",
  },
  news: { cs: "/aktuality", en: "/news", de: "/aktuelles" },
  gallery: { cs: "/fotogalerie", en: "/photo-gallery", de: "/fotogalerie" },
  media: {
    cs: "/o-zamku/zamek-v-mediich",
    en: "/about/in-the-media",
    de: "/ueber-das-schloss/in-den-medien",
  },
  partners: {
    cs: "/o-zamku/partneri-zamku",
    en: "/about/partners",
    de: "/ueber-das-schloss/partner",
  },
  contact: { cs: "/kontakt", en: "/contact", de: "/kontakt" },
  statutory: {
    cs: "/statutarni-a-povinne-informace",
    en: "/statutory-information",
    de: "/pflichtinformationen",
  },
  siteMap: { cs: "/mapa-stranek", en: "/site-map", de: "/seitenuebersicht" },
} as const satisfies Record<string, Record<Lang, string>>;

export type RouteId = keyof typeof ROUTES;

/** Routes whose address continues with a slug from Sanity. */
const WITH_DETAIL: ReadonlySet<RouteId> = new Set(["tours", "news", "gallery"]);

const isLang = (value: string): value is Lang =>
  (LANGS as readonly string[]).includes(value);

const trim = (path: string) => path.replace(/^\/+|\/+$/g, "");

/** The language a pathname is served in. Anything unprefixed is Czech. */
export function langFromPath(pathname: string): Lang {
  const [first] = trim(pathname).split("/");
  return first && isLang(first) && first !== DEFAULT_LANG
    ? first
    : DEFAULT_LANG;
}

/** The pathname with its language prefix taken off. Starts with `/`, no trailing slash. */
export function stripLang(pathname: string): string {
  const segments = trim(pathname).split("/").filter(Boolean);
  if (segments[0] && isLang(segments[0]) && segments[0] !== DEFAULT_LANG)
    segments.shift();
  return `/${segments.join("/")}`;
}

/** Put a language prefix on a path that has none. Ends with a slash, as canonical URLs do. */
export function withLang(path: string, lang: Lang): string {
  const bare = trim(path);
  const prefix = lang === DEFAULT_LANG ? "" : `/${lang}`;
  return bare ? `${prefix}/${bare}/` : `${prefix}/`;
}

/** The address of a code route in a language, with an optional detail slug. */
export function routePath(id: RouteId, lang: Lang, slug?: string): string {
  const base = ROUTES[id][lang];
  return withLang(slug ? `${base}/${slug}` : base, lang);
}

export interface RouteMatch {
  id: RouteId;
  lang: Lang;
  /** The detail slug, when the path continues past the route. */
  slug?: string;
}

/**
 * Which code route a pathname belongs to, read in the language of its prefix.
 * `undefined` when the path is not a code route: a page-builder page, a file,
 * or nothing at all.
 */
export function matchRoute(pathname: string): RouteMatch | undefined {
  const lang = langFromPath(pathname);
  const bare = stripLang(pathname);

  for (const id of Object.keys(ROUTES) as RouteId[]) {
    const base = ROUTES[id][lang];
    if (bare === base) return { id, lang };
    if (WITH_DETAIL.has(id) && bare.startsWith(`${base}/`)) {
      const slug = bare.slice(base.length + 1);
      if (slug && !slug.includes("/")) return { id, lang, slug };
    }
  }
  return undefined;
}

/**
 * The Czech path a request is rendered by: the `.astro` file's own address.
 * `undefined` when the request is already Czech or is not a code route.
 */
export function rewriteTarget(pathname: string): string | undefined {
  const match = matchRoute(pathname);
  if (!match || match.lang === DEFAULT_LANG) return undefined;
  const base = ROUTES[match.id][DEFAULT_LANG];
  return match.slug
    ? `${base}/${match.slug}/`
    : base === "/"
      ? "/"
      : `${base}/`;
}

/**
 * Every language version of a code route, for `hreflang` and the language
 * switcher. A detail page passes the slug each language uses; a language
 * without one is left out, since that page does not exist there.
 */
export function alternates(
  id: RouteId,
  slugs?: Partial<Record<Lang, string>>,
): { lang: Lang; path: string }[] {
  return LANGS.flatMap((lang) => {
    if (slugs && !slugs[lang]) return [];
    return [{ lang, path: routePath(id, lang, slugs?.[lang]) }];
  });
}
