/** Site name. Appended to every page title and used as `og:site_name`. */
/**
 * The castle's Sanity project. Public: it ships in every page that loads a
 * photograph. It is the default so a fresh clone shows the real content with
 * nothing to set up; `PUBLIC_SANITY_PROJECT_ID` in `.env` overrides it, and
 * the value `none` runs the site without a CMS.
 */
export const SANITY_PROJECT_ID = "fhk95ye1";

/** The project id to use, given what the environment asks for. */
export const sanityProjectId = (configured: string | undefined): string =>
  configured === "none" ? "" : configured || SANITY_PROJECT_ID;

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
export const LANGS = ["cs", "en"] as const;

export type Lang = (typeof LANGS)[number];

/** BCP 47 tag per language, for `<html lang>`, dates and numbers. */
export const LANG_LOCALES: Record<Lang, string> = {
  cs: "cs-CZ",
  en: "en-GB",
};

/** What each language calls itself, for the language switcher. */
export const LANG_NAMES: Record<Lang, string> = {
  cs: "Čeština",
  en: "English",
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

/**
 * A telephone number as the design writes it: the country code in brackets,
 * then the nine digits in threes, "(+420) 606 683 229". A Czech or Slovak
 * number is recognised however it was typed, and one without a code is taken
 * as Czech. Non-breaking spaces keep it on one line. Anything else is shown
 * as it was entered.
 */
export const formatPhone = (value: string): string => {
  const typed = value.trim();
  const digits = typed.replace(/[^\d+]/g, "").replace(/^00/, "+");
  const match = /^(?:\+(420|421))?(\d{9})$/.exec(digits);
  if (!match) return typed;
  const [, code = "420", number] = match;
  return `(+${code}) ${number.replace(/(\d{3})(?=\d)/g, "$1 ")}`.replaceAll(
    " ",
    " ",
  );
};

/** Routes excluded from search and the sitemap. Surrounding slashes are ignored. */
export const NOINDEX_ROUTES: string[] = [
  "/404",
  "/studio",
  "/styleguide",
  "/example-components",
];
