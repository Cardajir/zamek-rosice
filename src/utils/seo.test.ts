import assert from "node:assert/strict";
import { test } from "node:test";
import type { OpeningPeriod } from "./opening.ts";
import {
  blocksToText,
  compact,
  describe,
  eventNode,
  fillIn,
  isLiveHost,
  jsonForScript,
  meaningfulAlt,
  openingHours,
  organisationNode,
  robotsTxt,
  sanitySocialImage,
  sitemapEntries,
  sitemapXml,
  withSiteName,
  type Business,
} from "./seo.ts";

test("only the public domain counts as the live site", () => {
  assert.equal(isLiveHost("zamek-rosice.cz"), true);
  assert.equal(isLiveHost("www.zamek-rosice.cz"), true);
  assert.equal(isLiveHost("zamek-rosice.example.workers.dev"), false);
  assert.equal(isLiveHost("localhost"), false);
});

test("the site name follows a title only while both fit a search result", () => {
  assert.equal(
    withSiteName("Kontakty", "Zámek Rosice"),
    "Kontakty | Zámek Rosice",
  );
  const long = "Stálá výstava „Meda a Jan Mládek – život, exil, umění“";
  assert.equal(withSiteName(long, "Zámek Rosice"), long);
});

test("a description is one line, cut at a word within 160 characters", () => {
  assert.equal(describe("  Dva **tučné**\n\nřádky "), "Dva tučné řádky");
  assert.equal(describe(""), undefined);
  const cut = describe("slovo ".repeat(60)) ?? "";
  assert.ok(cut.length <= 160);
  assert.ok(cut.endsWith("slovo…"));
});

test("a sentence with an empty gap gives way to the default", () => {
  assert.equal(
    fillIn("Partneři: {list}.", { list: "A, B" }),
    "Partneři: A, B.",
  );
  assert.equal(fillIn("Partneři: {list}.", { list: "" }), undefined);
});

test("Portable Text reads as running text or as Markdown", () => {
  const blocks = [
    { _type: "block", style: "h3", children: [{ text: "Vážení snoubenci," }] },
    { _type: "block", style: "normal", children: [{ text: "jsme rádi." }] },
    { _type: "block", listItem: "bullet", children: [{ text: "jedna" }] },
    { _type: "block", listItem: "bullet", children: [{ text: "dvě" }] },
    { _type: "imageWithAlt" },
  ];
  assert.equal(blocksToText(blocks), "Jsme rádi. jedna dvě");
  assert.equal(
    blocksToText(blocks, { markdown: true }),
    "### Vážení snoubenci,\n\njsme rádi.\n\n- jedna\n- dvě",
  );
});

test("a shared photograph is 1200 × 630: landscape cropped, a poster shown whole", () => {
  const base = "https://cdn.sanity.io/images/p/d/a-2000x1000.jpg";
  const wide = sanitySocialImage({
    url: base,
    width: 2000,
    height: 1000,
    focus: { x: 0.5, y: 0.25 },
  });
  assert.equal(
    wide?.src,
    `${base}?w=1200&h=630&fit=crop&crop=focalpoint&fp-x=0.500&fp-y=0.250&fm=jpg&q=80`,
  );
  const tall = sanitySocialImage({ url: base, width: 1000, height: 1400 });
  assert.match(tall?.src ?? "", /fit=fill&bg=2c203c/);
  assert.equal(sanitySocialImage({ url: "/local.jpg" }), undefined);
});

test("a file name is not an image description", () => {
  assert.equal(meaningfulAlt("plakat-2026"), undefined);
  assert.equal(meaningfulAlt("Arkády nádvoří"), "Arkády nádvoří");
});

test("structured data carries no empty fields and cannot close its script", () => {
  assert.deepEqual(
    compact({ a: 1, b: undefined, c: [], d: { e: null }, f: [0, ""] }),
    { a: 1, f: [0] },
  );
  assert.equal(jsonForScript({ t: "</script>" }), '{"t":"\\u003c/script>"}');
});

const business: Business = {
  name: "Správa zámku Rosice, příspěvková organizace",
  street: "Žerotínovo náměstí 1",
  postalCode: "665 01",
  locality: "Rosice",
  phone: "+420 546 412 891",
  companyId: "00486591",
  socials: [
    { network: "facebook", url: "https://www.facebook.com/zamek.rosice.cz" },
    { network: "instagram", url: "https://www.instagram.com/" },
  ],
};

test("the organisation links only real profiles and gives its company number", () => {
  const node = organisationNode(business, {
    brand: "Zámek Rosice",
    logo: "/logo.png",
  });
  assert.deepEqual(node.sameAs, ["https://www.facebook.com/zamek.rosice.cz"]);
  assert.equal(node.telephone, "+420546412891");
  assert.deepEqual(node.identifier, {
    "@type": "PropertyValue",
    propertyID: "IČO",
    value: "00486591",
  });
});

test("opening hours take the widest hours of a period and drop covered ones", () => {
  const rule = (
    subject: string,
    extra: Partial<OpeningPeriod>,
  ): OpeningPeriod => ({
    subject,
    kind: "regular",
    dateFrom: "2026-07-01",
    dateTo: "2026-08-31",
    days: "daily",
    opens: "10:00",
    closes: "16:00",
    ...extra,
  });
  const { regular, special } = openingHours(
    [
      rule("hausper", { opens: "09:00", closes: "17:00" }),
      rule("detsky", { closes: "15:00" }),
      rule("hracky", { dateFrom: "2026-07-10", dateTo: "2026-07-20" }),
      rule("zahrada", { opens: "08:00" }),
      rule("hausper", {
        kind: "exception",
        dateFrom: "2026-03-28",
        dateTo: "2026-03-29",
      }),
    ],
    ["hausper", "detsky", "hracky"],
    [{ from: "2026-12-24" }],
  );
  assert.equal(regular.length, 1);
  assert.equal(regular[0].opens, "09:00");
  assert.equal(regular[0].closes, "17:00");
  assert.equal(special.length, 2);
  assert.equal(special[1].validThrough, "2026-12-24");
  assert.equal(special[1].opens, "00:00");
});

test("an event gives its day in Prague, its state, and a price only when it is a number", () => {
  const event = eventNode({
    url: "https://zamek-rosice.cz/aktuality/jarmark/",
    name: "Jarmark",
    start: "2026-12-04T23:30:00Z",
    status: "cancelled",
    price: "150 Kč",
    language: "cs-CZ",
    business,
  });
  assert.equal(event.startDate, "2026-12-05");
  assert.equal(event.eventStatus, "https://schema.org/EventCancelled");
  assert.deepEqual(event.offers, {
    "@type": "Offer",
    url: "https://zamek-rosice.cz/aktuality/jarmark/",
    price: 150,
    priceCurrency: "CZK",
  });
  const inWords = eventNode({
    url: "u",
    name: "n",
    start: "2026-12-05T08:00:00Z",
    price: "dobrovolné",
    language: "cs-CZ",
    business,
  });
  assert.equal(inWords.offers, undefined);
});

test("the sitemap lists every language once, with hreflang, and leaves out the first album", () => {
  const entries = sitemapEntries(
    {
      tours: [{ slugs: { cs: "zerotinsky-okruh", en: "zerotin-tour" } }],
      albums: [
        { slugs: { cs: "koncert", en: "concert" }, category: "events" },
        { slugs: { cs: "zamecky-exterier" }, category: "castle" },
        { slugs: { cs: "kryt" } },
      ],
      posts: [
        {
          lang: "cs",
          slug: "jarmark",
          translations: [
            { lang: "cs", slug: "jarmark" },
            { lang: "en", slug: "fair" },
          ],
        },
      ],
      pages: [{ lang: "cs", slug: "svatby", parent: "events" }],
    },
    ["cs"],
  );
  const paths = entries.map((entry) => entry.path);
  assert.ok(paths.includes("/navstivte-nas/prohlidky/zerotinsky-okruh/"));
  assert.ok(paths.includes("/en/visit/tours/zerotin-tour/"));
  assert.ok(!paths.includes("/de/besuch/fuehrungen/zerotinsky-okruh/"));
  assert.ok(paths.includes("/fotogalerie/kryt/"));
  assert.ok(!paths.includes("/fotogalerie/zamecky-exterier/"));
  assert.ok(paths.includes("/fotogalerie/koncert/"));
  assert.ok(paths.includes("/en/photo-gallery/concert/"));
  assert.ok(paths.includes("/fotogalerie/z-akci/"));
  assert.ok(paths.includes("/en/photo-gallery/events/"));
  assert.ok(!paths.some((path) => path.startsWith("/de/")));
  assert.ok(paths.includes("/aktuality/"));
  assert.ok(!paths.includes("/en/news/"));
  assert.ok(paths.includes("/akce-a-moznosti/svatby/"));
  assert.equal(new Set(paths).size, paths.length);

  const xml = sitemapXml(entries, "https://zamek-rosice.cz");
  assert.ok(
    xml.includes(
      [
        "<loc>https://zamek-rosice.cz/aktuality/jarmark/</loc>",
        '<xhtml:link rel="alternate" hreflang="cs" href="https://zamek-rosice.cz/aktuality/jarmark/"/>',
        '<xhtml:link rel="alternate" hreflang="en" href="https://zamek-rosice.cz/en/news/fair/"/>',
        '<xhtml:link rel="alternate" hreflang="x-default" href="https://zamek-rosice.cz/aktuality/jarmark/"/>',
      ].join(""),
    ),
  );
});

test("robots.txt welcomes AI crawlers and points to the sitemap", () => {
  const robots = robotsTxt("https://zamek-rosice.cz");
  assert.match(robots, /User-agent: GPTBot/);
  assert.match(robots, /User-agent: ClaudeBot/);
  assert.match(robots, /Disallow: \/studio\//);
  assert.match(robots, /Sitemap: https:\/\/zamek-rosice\.cz\/sitemap\.xml/);
});
