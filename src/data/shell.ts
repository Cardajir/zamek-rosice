import { ORGANISATION, type Lang } from "../consts.ts";
import { routePath, type RouteId } from "../i18n/routes.ts";
import { ui } from "../i18n/ui.ts";
import type { NavLink, Shell } from "../sanity/queries.ts";

type Labels = Record<Lang, string>;

const ROUTE_LABELS: Record<Exclude<RouteId, "siteMap">, Labels> = {
  home: { cs: "Úvodní stránka", en: "Home", de: "Startseite" },
  tours: { cs: "Prohlídkové okruhy", en: "Tours", de: "Führungen" },
  admission: {
    cs: "Vstupné a provozní doba",
    en: "Admission and opening hours",
    de: "Eintritt und Öffnungszeiten",
  },
  directions: { cs: "Kde nás najdete", en: "Getting here", de: "Anfahrt" },
  news: { cs: "Aktuality", en: "News", de: "Aktuelles" },
  gallery: { cs: "Fotogalerie", en: "Photo gallery", de: "Fotogalerie" },
  media: { cs: "Zámek v médiích", en: "In the media", de: "In den Medien" },
  partners: { cs: "Partneři zámku", en: "Partners", de: "Partner" },
  contact: { cs: "Kontakty", en: "Contact", de: "Kontakt" },
  statutory: {
    cs: "Povinné a statutární informace",
    en: "Statutory information",
    de: "Pflichtinformationen",
  },
};

const GROUP_LABELS: Labels[] = [
  { cs: "Pro návštěvníky", en: "For visitors", de: "Für Besucher" },
  {
    cs: "Akce a pronájmy",
    en: "Events and venue hire",
    de: "Veranstaltungen und Vermietung",
  },
  { cs: "O zámku", en: "About the castle", de: "Über das Schloss" },
];

const GROUP_ROUTES: Exclude<RouteId, "siteMap">[][] = [
  ["tours", "directions", "admission"],
  ["news"],
  ["media", "partners", "gallery"],
];

/**
 * The shell as it stands with no CMS at all: the pages that live in code,
 * the organisation's contact details and the published 2026 admission.
 */
export function fallbackShell(lang: Lang): Omit<Shell, "opening" | "partners"> {
  const link = (id: Exclude<RouteId, "siteMap">): NavLink => ({
    label: ROUTE_LABELS[id][lang],
    href: routePath(id, lang),
  });

  return {
    organisation: ORGANISATION.legalName,
    street: ORGANISATION.street,
    postalCode: ORGANISATION.postalCode,
    locality: ORGANISATION.locality,
    phone: ORGANISATION.phone,
    mobile: ORGANISATION.mobile,
    email: ORGANISATION.email,
    socials: [],
    groups: GROUP_ROUTES.map((routes, index) => ({
      label: GROUP_LABELS[index]![lang],
      items: routes.map(link),
    })),
    topLinks: [link("contact"), link("statutory")],
    footerColumns: [
      [link("home"), link("news"), link("contact")],
      [link("tours")],
      [link("statutory")],
    ],
    prices: [190, 140],
    cta: {
      title: ui(lang).contactCta,
      link: { label: ui(lang).goToContact, href: routePath("contact", lang) },
    },
  };
}
