import type { Lang } from "../consts.ts";
import { withLang } from "./routes.ts";

/**
 * Where a page-builder page sits. The page's own slug comes from Sanity; the
 * part of the site it belongs to gives the start of its address.
 */
export const PAGE_PARENTS = {
  none: { cs: "", en: "", de: "" },
  visit: { cs: "/navstivte-nas", en: "/visit", de: "/besuch" },
  events: { cs: "/akce-a-moznosti", en: "/events", de: "/veranstaltungen" },
  about: { cs: "/o-zamku", en: "/about", de: "/ueber-das-schloss" },
  statutory: {
    cs: "/statutarni-a-povinne-informace",
    en: "/statutory-information",
    de: "/pflichtinformationen",
  },
} as const satisfies Record<string, Record<Lang, string>>;

export type PageParent = keyof typeof PAGE_PARENTS;

const isParent = (value: unknown): value is PageParent =>
  typeof value === "string" && value in PAGE_PARENTS;

/** The address of a page-builder page in a language. */
export function pagePath(parent: unknown, slug: string, lang: Lang): string {
  const base = PAGE_PARENTS[isParent(parent) ? parent : "none"][lang];
  return withLang(`${base}/${slug}`, lang);
}

/**
 * Which page a pathname asks for: the part of the site and the slug, read in
 * the language of the prefix. `undefined` when the path has more levels than
 * a page can have.
 */
export function matchPage(
  bare: string,
  lang: Lang,
): { parent: PageParent; slug: string } | undefined {
  const parents = Object.keys(PAGE_PARENTS) as PageParent[];
  for (const parent of parents) {
    const base = PAGE_PARENTS[parent][lang];
    if (!base || !bare.startsWith(`${base}/`)) continue;
    const slug = bare.slice(base.length + 1);
    if (slug && !slug.includes("/")) return { parent, slug };
  }
  const slug = bare.replace(/^\//, "");
  return slug && !slug.includes("/") ? { parent: "none", slug } : undefined;
}
