// @ts-nocheck -- one-off content patch; the transforms run on untyped documents.
/**
 * The castle's notes of November 2026, the parts that are content:
 *
 * - the menu: Aktuality leaves "Akce a pronájmy" and stands on its own next
 *   to "O zámku";
 * - the contact people as the castle listed them;
 * - partners: one renamed, four added (logos follow when the castle sends them);
 * - the glass exhibition's text;
 * - the wedding order form's title;
 * - Povinná publicita projektů: each project's title becomes a heading, so the
 *   projects stand apart, and the text pasted line by line from a PDF is
 *   joined back into paragraphs.
 *
 * Running it again changes nothing. From the repo root:
 *
 *   npx sanity exec scripts/castle-notes-2026-11.ts --with-user-token              # dry run
 *   npx sanity exec scripts/castle-notes-2026-11.ts --with-user-token -- --apply
 */
import { getCliClient } from "sanity/cli";

const write = process.argv.slice(2).includes("--apply");
const client = getCliClient({ apiVersion: "2026-11-01" });
const tx = client.transaction();
const log = (line: string) => console.log(line);
const text = (b) => (b.children ?? []).map((s) => s.text ?? "").join("");

/* ---------------------------------------------------------------- menu -- */
{
  const nav = await client.getDocument("navigation");
  const groups = nav.groups ?? [];
  const news = groups.flatMap((g) => g.items ?? []).find((i) => i.route === "news");
  const has = (nav.mainLinks ?? []).some((i) => i.route === "news");
  if (news && !has) {
    tx.patch("navigation", (p) =>
      p
        .set({
          groups: groups.map((g) => ({
            ...g,
            items: (g.items ?? []).filter((i) => i.route !== "news"),
          })),
        })
        .set({ mainLinks: [{ ...news, _key: "mainNews" }] }),
    );
    log(`menu: "${news.label.cs}" moves out of its group to the main bar`);
  } else log("menu: nothing to change");
}

/* -------------------------------------------------------------- people -- */
const PEOPLE = [
  {
    _id: "person-vaverka",
    order: 10,
    name: "PhDr. Ludvík Vaverka",
    role: { cs: "kastelán", en: "castellan", de: "Kastellan" },
  },
  {
    _id: "person-durkajova",
    order: 20,
    name: "Ing. Iva Durkajová",
    role: {
      cs: "zástupkyně kastelána a správkyně sbírkových a mobiliárních fondů",
      en: "deputy castellan and keeper of the collections and furnishings",
      de: "stellvertretende Kastellanin und Verwalterin der Sammlungs- und Mobiliarbestände",
    },
  },
  {
    _id: "person-pokorna",
    order: 30,
    name: "Bc. Renata Pokorná",
    role: {
      cs: "administrativa, objednávky, back-office",
      en: "administration, bookings, back office",
      de: "Verwaltung, Bestellungen, Backoffice",
    },
  },
  {
    _id: "person-krskova",
    order: 40,
    name: "Mgr. Michaela Kršková",
    role: {
      cs: "stálá průvodkyně, program Edukačního centra a školní výlety",
      en: "resident guide, Education Centre programme and school trips",
      de: "ständige Führerin, Programm des Bildungszentrums und Schulausflüge",
    },
  },
];
for (const person of PEOPLE) {
  const current = await client.getDocument(person._id);
  const same =
    current &&
    current.name === person.name &&
    current.order === person.order &&
    JSON.stringify(current.role) === JSON.stringify(person.role);
  if (same) continue;
  if (current) {
    tx.patch(person._id, (p) => p.set({ name: person.name, order: person.order, role: person.role }));
    log(`person: update ${person.name}, ${person.role.cs}`);
  } else {
    tx.create({ _type: "person", ...person });
    log(`person: add ${person.name}, ${person.role.cs}`);
  }
}
if (await client.getDocument("person-koubkova")) {
  tx.delete("person-koubkova");
  log("person: remove Mgr. Hana Koubková (no longer on the castle's list)");
}

/* ------------------------------------------------------------ partners -- */
const RENAME = "Spolek pohraniční historie – Opevnění Vratěnín – Bunkr spolku pohraniční historie";
{
  const vratenin = await client.getDocument("partner-wp-50");
  if (vratenin && vratenin.name !== RENAME) {
    tx.patch("partner-wp-50", (p) => p.set({ name: RENAME }));
    log(`partner: "${vratenin.name}" -> "${RENAME}"`);
  }
}
const PARTNERS = [
  {
    _id: "partner-startech",
    order: 70,
    name: "STARTECH spol. s r.o., Rosice",
    description: {
      cs: "Dárce finančních prostředků na koncertní klavír",
      en: "Donor of funds for the concert grand piano",
      de: "Spender von Mitteln für den Konzertflügel",
    },
    url: "https://www.startech-ricany.cz",
  },
  {
    _id: "partner-panep",
    order: 80,
    name: "PANEP s.r.o., Rosice",
    description: {
      cs: "Dárce finančních prostředků a koncertní klavír",
      en: "Donor of funds and of the concert grand piano",
      de: "Spender von Mitteln und des Konzertflügels",
    },
    url: "https://panep.cz/index.php?locale=cs",
  },
  {
    _id: "partner-petactyricitka",
    order: 90,
    name: "Klub vojenské historie Pětačtyřicítka Brno, z.s.",
    url: "https://www.petactyricitka.cz",
  },
  {
    _id: "partner-cetnicka-stanice-kurim",
    order: 100,
    name: "Četnická stanice Kuřim",
    url: "https://www.kulturakurim.cz/cetnicka-stanice",
  },
];
for (const partner of PARTNERS) {
  if (await client.getDocument(partner._id)) continue;
  tx.create({ _type: "partner", showInFooter: false, ...partner });
  log(`partner: add ${partner.name}`);
}

/* --------------------------------------------------------------- glass -- */
const GLASS =
  "Stálá expozice, která je součástí, resp. poslední částí prohlídkových okruhů. Výstava není samostatně přístupná, ale je vždy na konci prohlídky Žerotínského či Hausperského okruhu. Vystavujeme kolekce skla, které se vyrábělo v rosické sklárně až do konce 80. let minulého století. Návštěvníci si zde často uvědomí, že vlastně tohle mají doma, a taky tohle, a tamto …";
{
  const glass = await client.getDocument("tour-sklo");
  const first = glass?.body?.cs?.[0];
  if (first && text(first) !== GLASS) {
    const path = `body.cs[_key=="${first._key}"].children`;
    tx.patch("tour-sklo", (p) =>
      p.set({ [path]: [{ _type: "span", _key: `${first._key}t`, text: GLASS, marks: [] }] }),
    );
    log("glass: new text");
  }
}

/* ---------------------------------------------------- wedding order form -- */
{
  const TITLE = "Objednávka a ceník pro svatby";
  const form = await client.getDocument("file-wp-8");
  if (form && form.title?.cs !== TITLE) {
    tx.patch("file-wp-8", (p) => p.set({ "title.cs": TITLE }));
    log(`document: "${form.title?.cs}" -> "${TITLE}"`);
  }
}

/* ------------------------------------------------------ project publicity -- */
const TITLES: Record<string, string> = {
  m000dx: "Rosický zámek jako kulturní a vzdělávací prostor, místo, kde se již v 17. století dělala evropská politika",
  m000g9: "Revitalizace zámku Rosice",
  m000ht: "Zámek Rosice, klíčová aktivita 5, Voda a renesance – efektivní nakládání se srážkovými vodami",
  m000ml: "Obnova historické parketové podlahy ve velkém sále v jihovýchodním rohu prvního patra zámku Rosice",
  m000mq: "Obnova spojovacího můstku do zámecké zahrady",
};
/* The project description pasted from a PDF, one line to a block. */
const LINES_FROM = "m000jn";
const LINES_TO = "m000mj";
{
  const docs = await client.fetch(
    `*[_type == "page" && language == "cs" && slug.current == "povinna-publicita-projektu"]{ _id, sections }`,
  );
  for (const doc of docs) {
    const section = doc.sections?.find((s) => s._type === "sectionRichText");
    if (!section) continue;
    const body = section.body ?? [];
    const changes: string[] = [];
    const out = [];
    let joining = null;
    let joined = 0;
    let inLines = false;
    for (const b of body) {
      if (b._key === LINES_FROM) inLines = true;
      /* The next project's title ends the run, also once LINES_TO is merged away. */
      if (TITLES[b._key]) {
        inLines = false;
        joining = null;
      }
      if (b._type === "block" && TITLES[b._key] && (b.style !== "h3" || text(b) !== TITLES[b._key])) {
        out.push({
          ...b,
          style: "h3",
          markDefs: [],
          children: [{ _type: "span", _key: `${b._key}s`, text: TITLES[b._key], marks: [] }],
        });
        changes.push(`  heading: "${TITLES[b._key]}"`);
      } else if (inLines && b._type === "block" && b.style === "normal") {
        const line = text(b).trim();
        if (joining) {
          joining.children[0].text += ` ${line}`;
          joined += 1;
        } else {
          joined = 0;
          joining = {
            ...b,
            markDefs: [],
            children: [{ _type: "span", _key: `${b._key}s`, text: line, marks: [] }],
          };
          out.push(joining);
        }
        if (/[.!?]$/.test(line)) {
          if (joined > 0) changes.push(`  paragraph: "${joining.children[0].text.slice(0, 70)}…"`);
          joining = null;
        }
      } else {
        out.push(b);
      }
      if (b._key === LINES_TO) {
        inLines = false;
        joining = null;
      }
    }
    if (changes.length === 0) {
      log(`publicity ${doc._id}: nothing to change`);
      continue;
    }
    log(`publicity ${doc._id}: ${body.length} blocks -> ${out.length}`);
    for (const change of changes) log(change);
    tx.patch(doc._id, (p) => p.set({ [`sections[_key=="${section._key}"].body`]: out }));
  }
}

if (write) {
  await tx.commit();
  log("\nWritten.");
} else log("\nDry run. Add -- --apply to write.");
