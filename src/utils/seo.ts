import { NOINDEX_ROUTES, SITE_URL } from "../consts.ts";

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
