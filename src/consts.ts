/** Site name. Appended to every page title and used as `og:site_name`. */
export const SITE_NAME = "Zámek Rosice";
/** Fallback meta description for pages that don't set their own. */
export const SITE_DESCRIPTION =
  "Žerotínská renesanční perla nedaleko Brna. Prohlídkové okruhy, stálé výstavy, zámecká zahrada, svatby a pronájmy na zámku Rosice.";
/** Canonical origin. Resolves canonical URLs, social images, and the sitemap. */
export const SITE_URL = "https://zamek-rosice.cz";
/** BCP 47 locale tag used to format dates and numbers. */
export const SITE_LOCALE = "cs-CZ";
/** Every opening time and "today" is read in this zone, wherever the Worker runs. */
export const SITE_TIME_ZONE = "Europe/Prague";

/** The language the site is authored in. Served from the root, without a prefix. */
export const DEFAULT_LANG = "cs" as const;
/** Every language the site ships, in the order they appear in the language switcher. */
export const LANGS = ["cs", "en", "de"] as const;

export type Lang = (typeof LANGS)[number];

/** BCP 47 tag per language, for `<html lang>`, dates and numbers. */
export const LANG_LOCALES: Record<Lang, string> = {
  cs: "cs-CZ",
  en: "en-GB",
  de: "de-DE",
};

/** What each language calls itself, for the language switcher. */
export const LANG_NAMES: Record<Lang, string> = {
  cs: "Čeština",
  en: "English",
  de: "Deutsch",
};

/**
 * The organisation behind the site, for structured data and as the fallback
 * while the settings document in Sanity is empty.
 */
export const ORGANISATION = {
  name: "Zámek Rosice",
  legalName: "Správa zámku Rosice, příspěvková organizace",
  street: "Žerotínovo náměstí 1",
  locality: "Rosice",
  postalCode: "665 01",
  phone: "+420 546 412 891",
  mobile: "+420 606 683 229",
  email: "info@zamek.rosice.cz",
  latitude: 49.182445,
  longitude: 16.386256,
} as const;

/** Routes excluded from search and the sitemap. Surrounding slashes are ignored. */
export const NOINDEX_ROUTES: string[] = [
  "/404",
  "/studio",
  "/styleguide",
  "/example-components",
];
