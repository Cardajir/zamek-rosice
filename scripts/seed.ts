/**
 * Fills an empty dataset with the content the design shows: settings, the
 * menu, tours, price lists, the 2026 opening hours, contacts, albums and a few
 * starting texts. Every document has a fixed id. Running it again only adds
 * what is missing; `--replace` overwrites what it wrote before, including
 * anything the migration or an editor changed since.
 *
 *   npm run seed
 *   npm run seed -- --replace
 *
 * English and German are working translations for an editor to proofread.
 * Photographs are not seeded; the Studio flags the documents that need one.
 */
import { getCliClient } from "sanity/cli";
import { OPENING_2026 } from "../src/data/opening-2026.ts";

const client = getCliClient({ apiVersion: "2026-11-01" });

type Doc = { _id: string; _type: string; [key: string]: unknown };

const L = (cs: string, en: string, de: string) => ({ cs, en, de });
const slug = (cs: string, en: string, de: string) => ({
  cs: { _type: "slug", current: cs },
  en: { _type: "slug", current: en },
  de: { _type: "slug", current: de },
});
const ref = (id: string) => ({ _type: "reference", _ref: id });
let keys = 0;
const key = () => `k${(keys++).toString(36).padStart(4, "0")}`;
const withKeys = <T extends object>(items: T[]) =>
  items.map((item) => ({ _key: key(), ...item }));

const route = (id: string, cs: string, en: string, de: string) => ({
  _type: "link",
  label: L(cs, en, de),
  kind: "route",
  route: id,
});
const pageLink = (id: string, cs: string, en: string, de: string) => ({
  _type: "link",
  label: L(cs, en, de),
  kind: "internal",
  reference: ref(id),
});

/* ---------------------------------------------------------------- pages -- */

/* Text pages the menu and footer point at. Czech only, empty until migrated. */
const PAGES: [id: string, title: string, slug: string, parent: string][] = [
  ["page-navstevni-rad", "Návštěvní řád", "navstevni-rad", "visit"],
  ["page-svatby", "Svatby", "svatby", "events"],
  ["page-skolni-vylety", "Školní výlety", "skolni-vylety", "events"],
  ["page-vystavy", "Výstavy", "vystavy", "events"],
  [
    "page-pronajem-senk",
    "Pronájem společenského prostoru Šenk",
    "pronajem-senk",
    "events",
  ],
  ["page-z-historie", "Z historie", "z-historie", "about"],
  [
    "page-povinna-publicita",
    "Povinná publicita projektů",
    "povinna-publicita-projektu",
    "statutory",
  ],
  [
    "page-pristupnost",
    "Prohlášení o přístupnosti",
    "prohlaseni-o-pristupnosti",
    "none",
  ],
  [
    "page-osobni-udaje",
    "Ochrana osobních údajů",
    "ochrana-osobnich-udaju",
    "none",
  ],
];

const pages: Doc[] = PAGES.map(([_id, title, current, parent]) => ({
  _id,
  _type: "page",
  language: "cs",
  title,
  slug: { _type: "slug", current },
  parent,
}));

/* ---------------------------------------------------------------- tours -- */

interface TourSeed {
  id: string;
  subject: string;
  kind: "tour" | "exhibition" | "outdoor";
  title: [string, string, string];
  slug: [string, string, string];
  perex: [string, string, string];
  duration?: { min?: number; max?: number; unlimited?: boolean };
  free?: boolean;
  showOnHome?: boolean;
}

const TOURS: TourSeed[] = [
  {
    id: "tour-zerotin",
    subject: "zerotin",
    kind: "tour",
    title: ["Žerotínský okruh", "Žerotín tour", "Žerotín-Rundgang"],
    slug: ["zerotinsky-okruh", "zerotin-tour", "zerotin-rundgang"],
    perex: [
      "Prohlídka historických interiérů zaměřená na působení a odkaz významného moravského šlechtického rodu Žerotínů.",
      "A tour of the historic interiors, devoted to the life and legacy of the Žerotíns, one of Moravia's great noble families.",
      "Ein Rundgang durch die historischen Innenräume, gewidmet dem Wirken und Vermächtnis des bedeutenden mährischen Adelsgeschlechts Žerotín.",
    ],
    duration: { min: 60, max: 60 },
  },
  {
    id: "tour-hausper",
    subject: "hausper",
    kind: "tour",
    title: ["Hausperský okruh", "Hausperský tour", "Hausperský-Rundgang"],
    slug: ["hauspersky-okruh", "hausper-tour", "hausper-rundgang"],
    perex: [
      "Prohlídka zámeckých komnat přibližující historii a každodenní život šlechtického rodu Hausperských.",
      "A tour of the castle chambers that brings to life the history and everyday world of the Hausperský family.",
      "Ein Rundgang durch die Schlossgemächer, der die Geschichte und den Alltag der Adelsfamilie Hausperský näherbringt.",
    ],
    duration: { min: 60, max: 60 },
  },
  {
    id: "tour-detsky",
    subject: "detsky",
    kind: "tour",
    title: ["Dětský okruh", "Children's tour", "Kinderrundgang"],
    slug: ["detsky-okruh", "childrens-tour", "kinderrundgang"],
    perex: [
      "Prázdninový okruh pro děti. Koná se v červenci a srpnu denně v 10, 12 a 14 hodin.",
      "A summer-holiday tour for children. Runs daily in July and August at 10, 12 and 2 o'clock.",
      "Ein Ferienrundgang für Kinder. Im Juli und August täglich um 10, 12 und 14 Uhr.",
    ],
    duration: { min: 30, max: 40 },
  },
  {
    id: "tour-kryt-co",
    subject: "kryt-co",
    kind: "tour",
    title: [
      "Kryt civilní obrany",
      "Civil defence shelter",
      "Zivilschutzbunker",
    ],
    slug: ["kryt-civilni-obrany", "civil-defence-shelter", "zivilschutzbunker"],
    perex: [
      "Zpřístupněný a plně vybavený podzemní kryt pod zámeckým nádvořím, vybudovaný v období studené války.",
      "A fully equipped underground shelter beneath the castle courtyard, built during the Cold War and open to visitors.",
      "Ein zugänglicher, voll ausgestatteter unterirdischer Schutzraum unter dem Schlosshof, erbaut in der Zeit des Kalten Krieges.",
    ],
    duration: { min: 45, max: 45 },
  },
  {
    id: "tour-mladek",
    subject: "mladek",
    kind: "exhibition",
    title: [
      "Stálá výstava „Meda a Jan Mládek – život, exil, umění“",
      "Permanent exhibition “Meda and Jan Mládek – life, exile, art”",
      "Dauerausstellung „Meda und Jan Mládek – Leben, Exil, Kunst“",
    ],
    slug: ["meda-a-jan-mladek", "meda-and-jan-mladek", "meda-und-jan-mladek"],
    perex: [
      "Životopisná expozice mapující osudy manželů Mládkových, jejich sběratelskou činnost a aktivity v československém exilu.",
      "A biographical exhibition tracing the lives of Meda and Jan Mládek, their collecting and their work in Czechoslovak exile.",
      "Eine biografische Ausstellung über das Schicksal des Ehepaars Mládek, seine Sammeltätigkeit und sein Wirken im tschechoslowakischen Exil.",
    ],
    duration: { min: 30, max: 40 },
  },
  {
    id: "tour-hracky",
    subject: "hracky",
    kind: "exhibition",
    title: [
      "Stálá výstava hraček",
      "Permanent toy exhibition",
      "Dauerausstellung Spielzeug",
    ],
    slug: ["stala-vystava-hracek", "toy-exhibition", "spielzeugausstellung"],
    perex: [
      "Rozsáhlá sbírka historických i novějších hraček, která mapuje vývoj dětských herních předmětů v průběhu času.",
      "A large collection of historic and more recent toys that follows how children's playthings have changed over time.",
      "Eine umfangreiche Sammlung historischer und neuerer Spielsachen, die die Entwicklung des Kinderspielzeugs im Lauf der Zeit zeigt.",
    ],
    duration: { min: 30, max: 40 },
  },
  {
    id: "tour-zahrada",
    subject: "zahrada",
    kind: "outdoor",
    title: ["Zámecká zahrada", "Castle garden", "Schlossgarten"],
    slug: ["zamecka-zahrada", "castle-garden", "schlossgarten"],
    perex: [
      "Zámecký park s historickou úpravou a vzrostlými stromy, určený k procházkám a odpočinku.",
      "The castle park with its historic layout and mature trees, a place for a walk and a rest.",
      "Der Schlosspark mit historischer Gestaltung und altem Baumbestand, zum Spazieren und Ausruhen.",
    ],
    duration: { unlimited: true },
    free: true,
  },
  {
    id: "tour-sklo",
    subject: "sklo",
    kind: "exhibition",
    title: [
      "Výstava rosického skla",
      "Rosice glass exhibition",
      "Ausstellung Rosicer Glas",
    ],
    slug: [
      "vystava-rosickeho-skla",
      "rosice-glass-exhibition",
      "ausstellung-rosicer-glas",
    ],
    perex: [
      "Přehledná ukázka produkce místní sklárny, zaměřená především na tradiční rosické lisované sklo.",
      "A survey of the local glassworks' production, centred on traditional Rosice pressed glass.",
      "Ein Überblick über die Produktion der örtlichen Glashütte, vor allem über das traditionelle Rosicer Pressglas.",
    ],
    showOnHome: false,
  },
];

const tours: Doc[] = TOURS.map((tour, index) => ({
  _id: tour.id,
  _type: "tour",
  title: L(...tour.title),
  slug: slug(...tour.slug),
  kind: tour.kind,
  subject: tour.subject,
  perex: L(...tour.perex),
  duration: tour.duration,
  free: tour.free ?? false,
  showOnHome: tour.showOnHome ?? true,
  order: (index + 1) * 10,
}));

/* ---------------------------------------------------------- price lists -- */

type Row = [
  label: [string, string, string],
  condition: [string, string, string] | null,
  prices: number[],
  unit?: string,
];

const REDUCED: [string, string, string] = [
  "děti do 15 let, studenti s ID, ZTP, ZTPP, senioři 63+",
  "children under 15, students with ID, disabled visitors, seniors 63+",
  "Kinder bis 15 Jahre, Studierende mit Ausweis, Menschen mit Behinderung, Senioren 63+",
];
const FULL: [string, string, string] = [
  "Plné vstupné",
  "Full admission",
  "Regulärer Eintritt",
];
const LOWER: [string, string, string] = [
  "Snížené vstupné",
  "Reduced admission",
  "Ermäßigter Eintritt",
];

const row = ([label, condition, prices, unit = "czk"]: Row) => ({
  _type: "row",
  label: L(...label),
  ...(condition ? { condition: L(...condition) } : {}),
  prices,
  unit,
});

const ticketLists: Doc[] = [
  {
    _id: "tickets-expozice",
    _type: "ticketList",
    title: L("Zámecká expozice", "Castle tours", "Schlossführungen"),
    intro: L(
      "Zámek má dva hlavní samostatné prohlídkové okruhy, a to Okruh Hausperský a Okruh Žerotínský. Třetím okruhem je Kryt CO. Prázdninovým okruhem je Dětský okruh. Cena vstupného platí pro každý okruh zvlášť.",
      "The castle has two main tours, the Hausperský tour and the Žerotín tour. The third is the civil defence shelter, and in the summer holidays there is a children's tour. Admission is charged for each tour separately.",
      "Das Schloss hat zwei Hauptrundgänge, den Hausperský- und den Žerotín-Rundgang. Der dritte ist der Zivilschutzbunker, in den Sommerferien gibt es einen Kinderrundgang. Der Eintritt gilt für jeden Rundgang einzeln.",
    ),
    appliesTo: withKeys([ref("tour-hausper"), ref("tour-zerotin")]),
    showInStatusBar: true,
    order: 10,
    rows: withKeys(
      (
        [
          [
            [
              "Plné vstupné hlavní okruhy",
              "Full admission, main tours",
              "Regulärer Eintritt, Hauptrundgänge",
            ],
            ["dospělí", "adults", "Erwachsene"],
            [190],
          ],
          [
            [
              "Snížené vstupné hlavní okruhy",
              "Reduced admission, main tours",
              "Ermäßigter Eintritt, Hauptrundgänge",
            ],
            [
              "děti od 6 do 15 let, studenti s ID, ZTP, ZTPP, senioři 63+",
              "children aged 6 to 15, students with ID, disabled visitors, seniors 63+",
              "Kinder von 6 bis 15 Jahren, Studierende mit Ausweis, Menschen mit Behinderung, Senioren 63+",
            ],
            [140],
          ],
          [
            [
              "Rodinné vstupné hlavní okruhy",
              "Family admission, main tours",
              "Familienkarte, Hauptrundgänge",
            ],
            [
              "2 dospělí + max. 3 děti",
              "2 adults + up to 3 children",
              "2 Erwachsene + max. 3 Kinder",
            ],
            [590],
          ],
          [
            [
              "Kombinované vstupné / Žerotínský i Hausperský okruh",
              "Combined admission / both the Žerotín and Hausperský tours",
              "Kombikarte / Žerotín- und Hausperský-Rundgang",
            ],
            null,
            [340, 240],
          ],
          [
            [
              "Skupinová sleva MŠ a ZŠ",
              "Group rate for nursery and primary schools",
              "Gruppentarif für Kindergärten und Grundschulen",
            ],
            [
              "skupiny dětí z MŠ a ZŠ, na 20 dětí 1 doprovod zdarma",
              "school groups; one accompanying adult free for every 20 children",
              "Schulgruppen; je 20 Kinder eine Begleitperson frei",
            ],
            [70],
          ],
          [
            [
              "Skupinová sleva pro 20 a více osob",
              "Group rate for 20 or more people",
              "Gruppentarif ab 20 Personen",
            ],
            [
              "dospělí / snížené po slevě",
              "adults / reduced, after discount",
              "Erwachsene / ermäßigt, nach Rabatt",
            ],
            [170, 120],
          ],
        ] as Row[]
      ).map(row),
    ),
  },
  {
    _id: "tickets-kryt-co",
    _type: "ticketList",
    title: L(
      "Kryt civilní obrany",
      "Civil defence shelter",
      "Zivilschutzbunker",
    ),
    appliesTo: withKeys([ref("tour-kryt-co")]),
    order: 20,
    rows: withKeys(
      (
        [
          [FULL, null, [100]],
          [LOWER, REDUCED, [80]],
          [
            [
              "Skupinová sleva MŠ a ZŠ",
              "Group rate for nursery and primary schools",
              "Gruppentarif für Kindergärten und Grundschulen",
            ],
            [
              "skupiny dětí z MŠ a ZŠ, na 20 dětí 1 doprovod zdarma",
              "school groups; one accompanying adult free for every 20 children",
              "Schulgruppen; je 20 Kinder eine Begleitperson frei",
            ],
            [60],
          ],
        ] as Row[]
      ).map(row),
    ),
  },
  {
    _id: "tickets-hracky",
    _type: "ticketList",
    title: L(
      "Stálá výstava hraček nebo dětský okruh",
      "Toy exhibition or children's tour",
      "Spielzeugausstellung oder Kinderrundgang",
    ),
    appliesTo: withKeys([ref("tour-hracky"), ref("tour-detsky")]),
    order: 30,
    rows: withKeys(
      (
        [
          [FULL, null, [90]],
          [LOWER, REDUCED, [70]],
          [
            ["Skupinové", "Groups", "Gruppen"],
            [
              "skupiny dětí z MŠ a ZŠ nad 10 osob, na 20 dětí 1 doprovod zdarma",
              "school groups of more than 10; one accompanying adult free for every 20 children",
              "Schulgruppen ab 10 Personen; je 20 Kinder eine Begleitperson frei",
            ],
            [50],
          ],
        ] as Row[]
      ).map(row),
    ),
  },
  {
    _id: "tickets-mladek",
    _type: "ticketList",
    title: L(
      "Meda a Jan Mládek – život, exil, umění",
      "Meda and Jan Mládek – life, exile, art",
      "Meda und Jan Mládek – Leben, Exil, Kunst",
    ),
    appliesTo: withKeys([ref("tour-mladek")]),
    order: 40,
    rows: withKeys(
      (
        [
          [FULL, null, [110]],
          [LOWER, REDUCED, [70]],
        ] as Row[]
      ).map(row),
    ),
  },
  {
    _id: "tickets-foto",
    _type: "ticketList",
    title: L("Fotografování", "Photography", "Fotografieren"),
    order: 50,
    rows: withKeys(
      (
        [
          [
            ["Fotografování", "Photography permit", "Fotoerlaubnis"],
            [
              "platí se před vstupem na prohlídku",
              "paid before the tour begins",
              "vor Beginn der Führung zu bezahlen",
            ],
            [50],
          ],
        ] as Row[]
      ).map(row),
    ),
  },
  {
    _id: "tickets-zahrada",
    _type: "ticketList",
    title: L("Pronájem zahrady", "Garden hire", "Vermietung des Gartens"),
    appliesTo: withKeys([ref("tour-zahrada")]),
    order: 60,
    rows: withKeys(
      (
        [
          [
            ["Pronájem zahrady", "Garden hire", "Vermietung des Gartens"],
            [
              "v závislosti na typu akce a účelu, informace u Správy zámku",
              "depending on the kind and purpose of the event; ask the castle administration",
              "je nach Art und Zweck der Veranstaltung, Auskunft bei der Schlossverwaltung",
            ],
            [150],
            "czkPerHour",
          ],
        ] as Row[]
      ).map(row),
    ),
  },
];

/* -------------------------------------------------------- opening hours -- */

const TOUR_BY_SUBJECT = Object.fromEntries(
  TOURS.map((tour) => [tour.subject, tour.id]),
);

const dayLabel = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
const monthLabel = (iso: string, locale: string) => {
  const name = new Intl.DateTimeFormat(locale, {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
  return name.charAt(0).toUpperCase() + name.slice(1);
};
const lastOfMonth = (iso: string) =>
  new Date(Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)), 0))
    .toISOString()
    .slice(0, 10);

/** "Květen" for a whole month, "Červenec – srpen" for whole months, else the dates. */
function periodLabel(from: string, to: string, locale: string): string {
  const wholeMonths = from.endsWith("-01") && to === lastOfMonth(to);
  if (!wholeMonths)
    return `${dayLabel(from, locale)} – ${dayLabel(to, locale)}`;
  const first = monthLabel(from, locale);
  const last = monthLabel(to, locale);
  return first === last ? first : `${first} – ${last}`;
}

/* One document per rule; subjects that share a rule share the document. */
const grouped = new Map<
  string,
  { rule: (typeof OPENING_2026)[number]; subjects: string[] }
>();
for (const period of OPENING_2026) {
  if (!TOUR_BY_SUBJECT[period.subject]) continue;
  const { subject, ...rule } = period;
  const signature = JSON.stringify(rule);
  const group = grouped.get(signature) ?? { rule: period, subjects: [] };
  group.subjects.push(subject);
  grouped.set(signature, group);
}

const openingPeriods: Doc[] = [...grouped.values()].map(
  ({ rule, subjects }) => ({
    _id: `opening-2026-${subjects.join("-")}-${rule.dateFrom}-${rule.days}`,
    _type: "openingPeriod",
    label: L(
      periodLabel(rule.dateFrom, rule.dateTo, "cs-CZ"),
      periodLabel(rule.dateFrom, rule.dateTo, "en-GB"),
      periodLabel(rule.dateFrom, rule.dateTo, "de-DE"),
    ),
    kind: rule.kind,
    appliesTo: withKeys(
      subjects.map((subject) => ref(TOUR_BY_SUBJECT[subject]!)),
    ),
    dateFrom: rule.dateFrom,
    dateTo: rule.dateTo,
    days: rule.days,
    closed: rule.closed ?? false,
    opens: rule.opens,
    closes: rule.closes,
    lastEntry: rule.lastEntry,
    startRule: rule.startRule ?? "none",
    startTimes: rule.startTimes,
    priority: 0,
  }),
);

/* ------------------------------------------------------------- the rest -- */

const persons: Doc[] = [
  [
    "person-vaverka",
    "PhDr. Ludvík Vaverka",
    L("kastelán", "castellan", "Kastellan"),
  ],
  [
    "person-koubkova",
    "Mgr. Hana Koubková",
    L(
      "zástupkyně kastelána, ekonomka",
      "deputy castellan, finance officer",
      "stellvertretende Kastellanin, Ökonomin",
    ),
  ],
  [
    "person-durkajova",
    "Ing. Iva Durkajová",
    L(
      "správkyně sbírkových a mobiliárních fondů",
      "keeper of the collections and furnishings",
      "Verwalterin der Sammlungs- und Mobiliarbestände",
    ),
  ],
].map(([_id, name, role], index) => ({
  _id: _id as string,
  _type: "person",
  name,
  role,
  order: (index + 1) * 10,
}));

const GALLERIES: [
  id: string,
  title: [string, string, string],
  slug: [string, string, string],
][] = [
  [
    "gallery-exterier",
    ["Zámecký exteriér", "Castle exterior", "Schloss von außen"],
    ["zamecky-exterier", "castle-exterior", "schloss-von-aussen"],
  ],
  [
    "gallery-okruhy",
    ["Zámecké okruhy", "Castle tours", "Schlossrundgänge"],
    ["zamecke-okruhy", "castle-tours", "schlossrundgaenge"],
  ],
  [
    "gallery-mladek",
    [
      "Stálá výstava Meda a Jan Mládek",
      "Meda and Jan Mládek exhibition",
      "Ausstellung Meda und Jan Mládek",
    ],
    ["meda-a-jan-mladek", "meda-and-jan-mladek", "meda-und-jan-mladek"],
  ],
  [
    "gallery-hracky",
    ["Zámecká výstava hraček", "Toy exhibition", "Spielzeugausstellung"],
    ["vystava-hracek", "toy-exhibition", "spielzeugausstellung"],
  ],
  [
    "gallery-sklo",
    [
      "Výstava rosického skla",
      "Rosice glass exhibition",
      "Ausstellung Rosicer Glas",
    ],
    ["rosicke-sklo", "rosice-glass", "rosicer-glas"],
  ],
  [
    "gallery-kryt-co",
    ["Kryt civilní obrany", "Civil defence shelter", "Zivilschutzbunker"],
    ["kryt-civilni-obrany", "civil-defence-shelter", "zivilschutzbunker"],
  ],
  [
    "gallery-svatby",
    ["Svatby na zámku", "Weddings at the castle", "Hochzeiten im Schloss"],
    ["svatby-na-zamku", "weddings", "hochzeiten"],
  ],
  [
    "gallery-senk",
    [
      "Společenský prostor Šenk",
      "The Šenk function room",
      "Gesellschaftsraum Šenk",
    ],
    [
      "spolecensky-prostor-senk",
      "senk-function-room",
      "gesellschaftsraum-senk",
    ],
  ],
  [
    "gallery-vystavni-prostory",
    ["Výstavní prostory", "Exhibition rooms", "Ausstellungsräume"],
    ["vystavni-prostory", "exhibition-rooms", "ausstellungsraeume"],
  ],
  [
    "gallery-edukacni-centrum",
    ["Edukační centrum", "Education centre", "Bildungszentrum"],
    ["edukacni-centrum", "education-centre", "bildungszentrum"],
  ],
];

const galleries: Doc[] = GALLERIES.map(([_id, title, address], index) => ({
  _id,
  _type: "gallery",
  title: L(...title),
  slug: slug(...address),
  defaultCredit: "fotoarchiv Správy zámku Rosice",
  order: (index + 1) * 10,
}));

const siteSettings: Doc = {
  _id: "siteSettings",
  _type: "siteSettings",
  organisation: L(
    "Správa zámku Rosice, příspěvková organizace",
    "Rosice Castle Administration, a public-benefit organisation",
    "Verwaltung des Schlosses Rosice, Beitragsorganisation",
  ),
  street: "Žerotínovo náměstí 1",
  postalCode: "665 01",
  locality: "Rosice",
  location: { _type: "geopoint", lat: 49.182445, lng: 16.386256 },
  phone: "+420 546 412 891",
  mobile: "+420 606 683 229",
  email: "info@zamek.rosice.cz",
  rating: {
    value: 4.7,
    source: "Mapy.com",
    label: L(
      "Fantastické hodnocení zákazníků",
      "Outstanding visitor ratings",
      "Hervorragende Besucherbewertungen",
    ),
  },
};

const navigation: Doc = {
  _id: "navigation",
  _type: "navigation",
  groups: withKeys([
    {
      _type: "group",
      label: L("Pro návštěvníky", "For visitors", "Für Besucher"),
      items: withKeys([
        route("tours", "Prohlídkové okruhy", "Tours", "Führungen"),
        route("directions", "Kde nás najdete", "Getting here", "Anfahrt"),
        route(
          "admission",
          "Vstupné a provozní doba",
          "Admission and opening hours",
          "Eintritt und Öffnungszeiten",
        ),
        pageLink(
          "page-navstevni-rad",
          "Návštěvní řád",
          "Visitor rules",
          "Besucherordnung",
        ),
      ]),
    },
    {
      _type: "group",
      label: L(
        "Akce a pronájmy",
        "Events and venue hire",
        "Veranstaltungen und Vermietung",
      ),
      items: withKeys([
        route("news", "Aktuality", "News", "Aktuelles"),
        pageLink("page-svatby", "Svatby", "Weddings", "Hochzeiten"),
        pageLink(
          "page-skolni-vylety",
          "Školní výlety",
          "School trips",
          "Schulausflüge",
        ),
        pageLink("page-vystavy", "Výstavy", "Exhibitions", "Ausstellungen"),
        pageLink(
          "page-pronajem-senk",
          "Pronájem společenského prostoru Šenk",
          "Hire of the Šenk function room",
          "Vermietung des Gesellschaftsraums Šenk",
        ),
      ]),
    },
    {
      _type: "group",
      label: L("O zámku", "About the castle", "Über das Schloss"),
      items: withKeys([
        pageLink("page-z-historie", "Z historie", "History", "Geschichte"),
        route("media", "Zámek v médiích", "In the media", "In den Medien"),
        route("partners", "Partneři zámku", "Partners", "Partner"),
        route("gallery", "Fotogalerie", "Photo gallery", "Fotogalerie"),
      ]),
    },
  ]),
  topLinks: withKeys([
    route("contact", "Kontakty", "Contact", "Kontakt"),
    route(
      "statutory",
      "Povinné a statutární informace",
      "Statutory information",
      "Pflichtinformationen",
    ),
  ]),
  footerColumns: withKeys([
    {
      _type: "column",
      items: withKeys([
        route("home", "Úvodní stránka", "Home", "Startseite"),
        route(
          "news",
          "Akce a pronájmy",
          "Events and venue hire",
          "Veranstaltungen und Vermietung",
        ),
        pageLink(
          "page-z-historie",
          "O zámku",
          "About the castle",
          "Über das Schloss",
        ),
        route("contact", "Kontakty", "Contact", "Kontakt"),
      ]),
    },
    {
      _type: "column",
      items: withKeys([
        pageLink(
          "page-svatby",
          "Svatba na zámku",
          "Weddings at the castle",
          "Hochzeit im Schloss",
        ),
        pageLink(
          "page-pronajem-senk",
          "Pronájem Šenku",
          "Hire of the Šenk",
          "Vermietung des Šenk",
        ),
        pageLink(
          "page-skolni-vylety",
          "Pro školy",
          "For schools",
          "Für Schulen",
        ),
        route("tours", "Zámecká expozice", "Castle tours", "Schlossführungen"),
        {
          _type: "link",
          label: L(
            "Kryt civilní obrany",
            "Civil defence shelter",
            "Zivilschutzbunker",
          ),
          kind: "internal",
          reference: ref("tour-kryt-co"),
        },
      ]),
    },
    {
      _type: "column",
      items: withKeys([
        route(
          "statutory",
          "Povinné a statutární informace",
          "Statutory information",
          "Pflichtinformationen",
        ),
        pageLink(
          "page-povinna-publicita",
          "Povinná publicita projektů",
          "Project publicity",
          "Projektpublizität",
        ),
        pageLink(
          "page-pristupnost",
          "Prohlášení o přístupnosti",
          "Accessibility statement",
          "Erklärung zur Barrierefreiheit",
        ),
        pageLink(
          "page-osobni-udaje",
          "Ochrana osobních údajů",
          "Privacy",
          "Datenschutz",
        ),
      ]),
    },
  ]),
};

const promo = (
  title: [string, string, string],
  text: [string, string, string],
  link: ReturnType<typeof pageLink>,
) => ({
  _type: "promo",
  eyebrow: L(
    "Akce & pronájmy",
    "Events & venue hire",
    "Veranstaltungen & Vermietung",
  ),
  title: L(...title),
  text: L(...text),
  link,
});

const homePage: Doc = {
  _id: "homePage",
  _type: "homePage",
  heading: L(
    "Žerotínská renesanční perla, nedaleko od Brna. Místo, kde se již v 17. století dělala velká evropská politika",
    "A Renaissance jewel of the Žerotín family, a short way from Brno. A place where European politics was shaped as early as the 17th century",
    "Eine Renaissance-Perle der Familie Žerotín, unweit von Brünn. Ein Ort, an dem schon im 17. Jahrhundert große europäische Politik gemacht wurde",
  ),
  headingLink: pageLink(
    "page-z-historie",
    "více o historii",
    "more about the history",
    "mehr zur Geschichte",
  ),
  heritageNote: L(
    "Národní kulturní památka od roku 2022",
    "National cultural monument since 2022",
    "Nationales Kulturdenkmal seit 2022",
  ),
  promos: withKeys([
    promo(
      [
        "Romantická svatba na zámku",
        "A romantic castle wedding",
        "Romantische Hochzeit im Schloss",
      ],
      [
        "Svatební obřady se mohou konat v případě velké svatby (do 140 osob) v Hudebním sálu, menší svatby (do 30 osob) v Habsburském salonku, případně v kapli (cca 12 osob), nebo v oblíbené zámecké zahradě. Do těchto prostor Vám rádi umístíme malou svatební výzdobu, židle apod. Vše můžete vidět na fotografiích nebo po dohodě osobně. Nezajišťujeme svatební hostiny, bohužel Vám zatím nemůžeme na zámku nabídnout ani ubytování. Pro hostinu ale můžete využít Společenský prostor Šenk, který Vám nabídne dostatečné prostory historického sálu se zázemím kuchyně a přípravny.",
        "Ceremonies can be held in the Music Hall for a large wedding (up to 140 guests), in the Habsburg Salon for a smaller one (up to 30), in the chapel (about 12), or in the much-loved castle garden. We are glad to set out simple decoration, chairs and the like. You can see everything in the photographs or, by arrangement, in person. We do not cater wedding receptions and cannot yet offer accommodation at the castle. For the reception you can use the Šenk function room, a historic hall with a kitchen and preparation room.",
        "Trauungen können bei einer großen Hochzeit (bis 140 Gäste) im Musiksaal stattfinden, bei einer kleineren (bis 30) im Habsburger Salon, in der Kapelle (etwa 12) oder im beliebten Schlossgarten. Gern stellen wir eine kleine Dekoration, Stühle und Ähnliches bereit. Alles sehen Sie auf den Fotos oder nach Absprache vor Ort. Hochzeitsessen richten wir nicht aus und können im Schloss noch keine Übernachtung anbieten. Für die Feier steht der Gesellschaftsraum Šenk zur Verfügung, ein historischer Saal mit Küche und Vorbereitungsraum.",
      ],
      pageLink("page-svatby", "číst více", "read more", "weiterlesen"),
    ),
    promo(
      [
        "Historický Šenk s velkým funkčním krbem",
        "The historic Šenk with its great working fireplace",
        "Der historische Šenk mit großem Kamin",
      ],
      [
        "V přízemí zámku se nachází historický sál s velkým funkčním krbem, který dodává prostoru neopakovatelnou dobovou atmosféru. S kapacitou do 60 osob je Šenk vhodným místem pro pořádání soukromých oslav, narozeninových setkání, ale i firemních akcí, porad či seminářů. K dispozici je vlastní sociální zařízení a malá kuchyňka vybavená myčkou i základním nádobím. Nájemce obdrží klíče od zámeckých vrat a není tak vázán na otevírací dobu zámku. Vzhledem k náročnosti na vytápění prostor nepronajímáme v zimním období (od listopadu do dubna).",
        "On the ground floor of the castle is a historic hall with a large working fireplace that gives the room an atmosphere all its own. With space for up to 60 people, the Šenk suits private celebrations and birthday gatherings as well as company events, meetings and seminars. It has its own toilets and a small kitchen with a dishwasher and basic tableware. The hirer receives keys to the castle gate and is not bound by the castle's opening hours. Because the hall is hard to heat, we do not hire it out in winter (November to April).",
        "Im Erdgeschoss des Schlosses befindet sich ein historischer Saal mit großem, funktionsfähigem Kamin, der dem Raum eine unverwechselbare Atmosphäre verleiht. Mit Platz für bis zu 60 Personen eignet sich der Šenk für private Feiern und Geburtstage ebenso wie für Firmenveranstaltungen, Besprechungen und Seminare. Es gibt eigene Sanitäranlagen und eine kleine Küche mit Geschirrspüler und Grundgeschirr. Der Mieter erhält Schlüssel zum Schlosstor und ist nicht an die Öffnungszeiten gebunden. Wegen des Heizaufwands vermieten wir den Raum im Winter (November bis April) nicht.",
      ],
      pageLink("page-pronajem-senk", "číst více", "read more", "weiterlesen"),
    ),
    promo(
      [
        "Oblíbená destinace školních výletů",
        "A favourite destination for school trips",
        "Ein beliebtes Ziel für Schulausflüge",
      ],
      [
        "Zámek bývá častým cílem školních výletů. Menší děti mohou navštívit Stálou výstavu hraček, starší děti zámeckou expozici s přizpůsobeným výkladem, případně s průvodkyní v historickém kostýmu. Každoročně připravujeme pro školní výlety i doplňkový program, sledujte proto náš web i facebook Zámek Rosice. Parkování autobusů s návštěvníky je možné zdarma přímo v areálu zámku na I. nádvoří. Pro odpočinek mohou návštěvníci využít i malou Kafárnu a zámeckou zahradu.",
        "The castle is a frequent destination for school trips. Younger children can visit the toy exhibition, older ones the castle tour with commentary adapted to their age, or with a guide in period costume. Each year we also prepare an additional programme for school trips, so keep an eye on our website and the Zámek Rosice Facebook page. Coaches can park free of charge in the first courtyard. Visitors can rest in the small café and the castle garden.",
        "Das Schloss ist ein häufiges Ziel von Schulausflügen. Kleinere Kinder können die Spielzeugausstellung besuchen, ältere den Schlossrundgang mit altersgerechter Führung oder mit einer Führerin im historischen Kostüm. Jedes Jahr bereiten wir für Schulausflüge ein Zusatzprogramm vor; verfolgen Sie unsere Website und die Facebook-Seite Zámek Rosice. Busse parken kostenlos im ersten Schlosshof. Zum Ausruhen laden das kleine Café und der Schlossgarten ein.",
      ],
      pageLink("page-skolni-vylety", "číst více", "read more", "weiterlesen"),
    ),
  ]),
  quote: {
    text: L(
      "Dny jsou dlouhé, ale roky jsou krátké, možná to není dominanta, ale obsahuje spoustu vzpomínek Karla staršího ze Žerotína, českého šlechtice a vynikajícího vlivného politika, jehož celý život byl jako nejúchvatnější kniha.",
      "The days are long but the years are short. It may not be a landmark, yet it holds so many memories of Karel the Elder of Žerotín, a Czech nobleman and an outstanding, influential statesman whose whole life read like the most captivating of books.",
      "Die Tage sind lang, aber die Jahre sind kurz. Es mag keine Dominante sein, doch es birgt viele Erinnerungen an Karl den Älteren von Žerotín, einen böhmischen Adligen und herausragenden, einflussreichen Politiker, dessen ganzes Leben wie das fesselndste Buch war.",
    ),
    author: L(
      "Návštěvník zámku Rosice",
      "A visitor to Rosice Castle",
      "Ein Besucher des Schlosses Rosice",
    ),
    date: "2020-08-30",
  },
  cta: {
    title: L(
      "Máte dotaz? Neváhejte se nám ozvat",
      "Have a question? Do get in touch",
      "Haben Sie eine Frage? Schreiben Sie uns",
    ),
    link: route(
      "contact",
      "přejít na kontakty",
      "go to contacts",
      "zu den Kontakten",
    ),
  },
};

const visitInfo: Doc = {
  _id: "visitInfo",
  _type: "visitInfo",
  intro: L(
    "Město Rosice leží cca 20 km západně od Brna. GPS souřadnice: 49°10’56.80″N 16°23’10.52″E (49.182445, 16.386256)",
    "The town of Rosice lies about 20 km west of Brno. GPS coordinates: 49°10’56.80″N 16°23’10.52″E (49.182445, 16.386256)",
    "Die Stadt Rosice liegt etwa 20 km westlich von Brünn. GPS-Koordinaten: 49°10’56.80″N 16°23’10.52″E (49.182445, 16.386256)",
  ),
  byCar: L(
    "Rosice jsou snadno přístupné z dálnice D1, na příjezdu od Brna i od Prahy jsou umístěny informační tabule a směrovky vedoucí až k zámku. Samotný objekt zámku je na Žerotínově nám. 1, které bezprostředně navazuje na Komenského náměstí (zde je městské parkoviště bez poplatku). Malé parkoviště se nachází i přímo před zámkem a v současné době je částečně zpoplatněno, částečně bez poplatku. Zájezdové autobusy objednaných výprav mají možnost parkovat po domluvě na 1. nádvoří zámku.",
    "Rosice is easy to reach from the D1 motorway; coming from either Brno or Prague, information boards and signs lead all the way to the castle. The castle stands at Žerotínovo náměstí 1, right next to Komenského náměstí, where there is a free municipal car park. A small car park directly in front of the castle is partly paid and partly free. Coaches of pre-booked groups may park in the first courtyard by arrangement.",
    "Rosice ist von der Autobahn D1 gut erreichbar; aus Richtung Brünn wie aus Richtung Prag führen Hinweistafeln und Wegweiser bis zum Schloss. Das Schloss steht am Žerotínovo náměstí 1, unmittelbar neben dem Komenského náměstí mit kostenlosem städtischem Parkplatz. Ein kleiner Parkplatz direkt vor dem Schloss ist teils gebührenpflichtig, teils kostenlos. Reisebusse angemeldeter Gruppen können nach Absprache im ersten Schlosshof parken.",
  ),
  byTrain: L(
    "Vlaková stanice je vzdálená asi 15 minut chůze od zámku. Při pohledu z nádraží je zámek jednou z dominant města. Stanice Rosice leží na trati Brno – Jihlava, trasa IDOS JMK S4.",
    "The railway station is about a 15-minute walk from the castle, which is one of the town's landmarks as seen from the station. Rosice station is on the Brno – Jihlava line, regional service S4.",
    "Der Bahnhof liegt etwa 15 Gehminuten vom Schloss entfernt, das vom Bahnhof aus eine der Dominanten der Stadt ist. Der Bahnhof Rosice liegt an der Strecke Brünn – Jihlava, Regionallinie S4.",
  ),
  byBus: L(
    "Stanice Rosice – Trávníky, asi 10 minut chůze od zámku. Stanice Rosice – Brněnská nebo Husova, asi 20 minut chůze od zámku.",
    "The Rosice – Trávníky stop is about a 10-minute walk from the castle. The Rosice – Brněnská and Husova stops are about 20 minutes away on foot.",
    "Die Haltestelle Rosice – Trávníky liegt etwa 10 Gehminuten vom Schloss. Die Haltestellen Rosice – Brněnská und Husova sind etwa 20 Gehminuten entfernt.",
  ),
};

/* ------------------------------------------------------------------ run -- */

const documents: Doc[] = [
  siteSettings,
  ...pages,
  ...tours,
  ...galleries,
  ...persons,
  ...ticketLists,
  ...openingPeriods,
  navigation,
  homePage,
  visitInfo,
];

const transaction = client.transaction();
/* Later runs add what is missing and leave edited or migrated documents alone. */
const replace = process.argv.includes("--replace");
for (const document of documents) {
  if (replace) transaction.createOrReplace(document);
  else transaction.createIfNotExists(document);
}
await transaction.commit();

const counts = documents.reduce<Record<string, number>>((all, { _type }) => {
  all[_type] = (all[_type] ?? 0) + 1;
  return all;
}, {});
console.log(
  `Seeded ${documents.length} documents into ${client.config().dataset}:`,
  counts,
);
