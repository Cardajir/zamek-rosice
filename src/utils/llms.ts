import { SITE_URL, formatPhone, type Lang } from "@/consts.ts";
import { pagePath } from "@/i18n/pages.ts";
import { routePath, type RouteId } from "@/i18n/routes.ts";
import { ui } from "@/i18n/ui.ts";
import {
  getAdmission,
  getDirections,
  type PriceRow,
} from "@/sanity/page-queries.ts";
import {
  getLlmsContent,
  getNewsLanguages,
  getShell,
} from "@/sanity/queries.ts";
import { hoursTable } from "@/utils/hours.ts";
import { pragueNow } from "@/utils/opening.ts";
import { blocksToText, describe, pragueDay } from "@/utils/seo.ts";

/*
 * The castle and the site in plain Markdown, for AI assistants and other
 * machines that read `/llms.txt` (https://llmstxt.org). Written on request
 * from the same content as the pages, so it is never out of date. English
 * carries the structure; names and texts stay as editors wrote them.
 */

const url = (path: string) => new URL(path, SITE_URL).href;
const plain = (value?: string) =>
  (value ?? "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();

/** The code pages worth naming, with their title in each language. */
const PAGES: { id: RouteId; title: (lang: Lang) => string }[] = [
  { id: "tours", title: (lang) => ui(lang).toursPageTitle },
  { id: "admission", title: (lang) => ui(lang).admissionTitle },
  { id: "directions", title: (lang) => ui(lang).directionsTitle },
  { id: "news", title: (lang) => ui(lang).news },
  { id: "gallery", title: (lang) => ui(lang).galleryTitle },
  { id: "galleryEvents", title: (lang) => ui(lang).galleryEvents },
  { id: "contact", title: (lang) => ui(lang).contactTitle },
  { id: "media", title: (lang) => ui(lang).mediaTitle },
  { id: "partners", title: (lang) => ui(lang).partnersTitle },
  { id: "statutory", title: (lang) => ui(lang).statutoryTitle },
  { id: "siteMap", title: (lang) => ui(lang).siteMapTitle },
];

const price = ({ prices, unit }: PriceRow) =>
  `${prices.join(" / ")} CZK${unit === "czkPerHour" ? " per hour" : ""}`;

const minutes = (duration?: {
  min?: number;
  max?: number;
  unlimited?: boolean;
}) => {
  if (!duration) return undefined;
  if (duration.unlimited) return "no time limit";
  const { min, max } = duration;
  if (!min && !max) return undefined;
  return `${min && max && min !== max ? `${min}–${max}` : (max ?? min)} minutes`;
};

/** `/llms.txt`, or with `full` the longer `/llms-full.txt` with every page's text. */
export async function llmsText({ full }: { full: boolean }): Promise<string> {
  const en = ui("en");
  const cs = ui("cs");
  const [shell, shellEn, admission, directions, content, newsLanguages] =
    await Promise.all([
      getShell("cs"),
      getShell("en"),
      getAdmission("en"),
      getDirections("en"),
      getLlmsContent(),
      getNewsLanguages(),
    ]);

  const out: string[] = [];
  const line = (...parts: (string | false | undefined)[]) =>
    out.push(parts.filter(Boolean).join(""));

  line(`# ${cs.siteName} (${en.siteName}, ${ui("de").siteName})`);
  line("");
  line(`> ${en.metaHome}`);
  line("");
  line(`${en.siteTagline}.`);
  line("");
  line(
    `This is a summary of the official website of ${en.siteName}, ${url("/")}, for AI assistants. `,
    "The site is in Czech (the default, no prefix), English (/en/) and German (/de/). ",
    "It is generated from the site's content on every request.",
  );

  /* ---- contact */
  line("");
  line("## Contact and location");
  line("");
  line(
    `- Operator: ${shell.organisation}`,
    shellEn.organisation !== shell.organisation && ` (${shellEn.organisation})`,
    shell.companyId && `, company ID (IČ) ${shell.companyId}`,
  );
  line(
    `- Address: ${shell.street}, ${shell.postalCode} ${shell.locality}, Czech Republic`,
  );
  const { lat, lng } = directions.location ?? shell.location ?? {};
  if (lat && lng) line(`- GPS: ${lat}, ${lng}`);
  if (shell.phone)
    line(`- Telephone: ${formatPhone(shell.phone).replace(/\s/g, " ")}`);
  if (shell.mobile)
    line(`- Mobile: ${formatPhone(shell.mobile).replace(/\s/g, " ")}`);
  if (shell.email) line(`- E-mail: ${shell.email}`);
  for (const { network, url: profile } of shell.socials) {
    if (new URL(profile).pathname.replace(/\/+$/, "")) {
      line(`- ${network[0]?.toUpperCase()}${network.slice(1)}: ${profile}`);
    }
  }
  if (directions.intro) line(`- Getting here: ${plain(directions.intro)}`);
  line(
    `- More: ${url(routePath("directions", "en"))} (English), ${url(routePath("contact", "cs"))} (Czech)`,
  );

  /* ---- opening hours */
  const hours = hoursTable(admission.periods, admission.subjects, {
    days: {
      daily: en.daysDaily,
      weekdays: en.daysWeekdays,
      weekends: en.daysWeekends,
      holidays: en.daysHolidays,
      weekendsAndHolidays: en.daysWeekendsAndHolidays,
    },
    closed: en.closed,
    lastEntry: en.lastEntry,
    startsAt: en.startsAt,
    startRules: {
      oddHours: en.startsOddHours,
      evenHours: en.startsEvenHours,
      everyHour: en.startsEveryHour,
    },
  });
  if (hours.length > 0) {
    line("");
    const seasons = [
      ...new Set(
        admission.periods.map((period) => period.dateFrom.slice(0, 4)),
      ),
    ].sort();
    line("## Opening hours");
    line("");
    line(
      seasons.length > 0 && `Season ${seasons.join(", ")}. `,
      `Source: ${url(routePath("admission", "en"))}`,
    );
    for (const group of hours) {
      line("");
      line(`### ${group.names.join(", ")}`);
      line("");
      for (const row of group.rows)
        line(`- ${row.label}: ${row.lines.join("; ")}`);
      for (const note of group.notes) line(`- ${note}`);
    }
    line("");
    line(en.groupsByArrangement);
  }
  const today = pragueNow(new Date()).day;
  const closures = shell.closures.filter(
    ({ from, to }) => (to || from) >= today,
  );
  if (closures.length > 0) {
    line("");
    line(`### ${en.closuresHeading}`);
    line("");
    for (const { from, to, reason } of closures) {
      line(
        `- ${from}${to && to !== from ? ` – ${to}` : ""}`,
        reason && `: ${reason}`,
      );
    }
  }

  /* ---- admission */
  if (admission.lists.length > 0) {
    line("");
    line("## Admission (Czech crowns, CZK)");
    for (const list of admission.lists) {
      line("");
      line(`### ${list.title}`);
      line("");
      if (list.intro) line(`${plain(list.intro)}`, "\n");
      for (const row of list.rows) {
        line(
          `- ${row.label}`,
          row.condition && ` (${row.condition})`,
          `: ${price(row)}`,
        );
      }
      if (list.note) line("\n", plain(list.note));
    }
  }

  /* ---- tours */
  if (content.tours.length > 0) {
    line("");
    line("## Guided tours, exhibitions and the garden");
    line("");
    for (const tour of content.tours) {
      const length = minutes(tour.duration);
      line(
        `- [${tour.titleEn ?? tour.title}](${url(routePath("tours", tour.slugEn ? "en" : "cs", tour.slugEn ?? tour.slug))})`,
        tour.titleEn &&
          tour.titleEn !== tour.title &&
          ` (Czech: ${tour.title})`,
        (tour.perexEn ?? tour.perex) &&
          `: ${plain(tour.perexEn ?? tour.perex)}`,
        length && ` Length: ${length}.`,
        tour.free && " Free entry.",
      );
    }
  }

  /* ---- events */
  const upcoming = content.posts.filter(
    (post) =>
      post.kind === "event" &&
      post.eventStart &&
      pragueDay(post.eventEnd ?? post.eventStart) >= today,
  );
  if (upcoming.length > 0) {
    line("");
    line("## Upcoming events (in Czech)");
    line("");
    for (const post of upcoming) {
      const start = post.eventStart && pragueDay(post.eventStart);
      const end = post.eventEnd && pragueDay(post.eventEnd);
      line(
        `- ${start}${end && end !== start ? ` – ${end}` : ""}: [${post.title}](${url(routePath("news", "cs", post.slug))})`,
        post.perex && ` – ${plain(post.perex)}`,
      );
    }
  }

  /* ---- pages */
  line("");
  line("## Main pages");
  line("");
  line(
    `- ${cs.homePage}: ${url("/")} | ${en.homePage}: ${url(routePath("home", "en"))}`,
  );
  for (const page of PAGES) {
    /* News is written per language; an empty list is not worth a link. */
    const english = page.id !== "news" || newsLanguages.includes("en");
    line(
      `- ${page.title("cs")}: ${url(routePath(page.id, "cs"))}`,
      english && ` | ${page.title("en")}: ${url(routePath(page.id, "en"))}`,
    );
  }
  if (content.pages.length > 0) {
    line("");
    line("### More pages (in Czech)");
    line("");
    for (const page of content.pages) {
      const summary =
        describe(page.perex) ??
        describe(
          blocksToText(
            (page.sections ?? []).flatMap((section) => section.body ?? []),
          ),
        );
      line(
        `- [${page.title}](${url(pagePath(page.parent, page.slug, "cs"))})`,
        summary && `: ${summary}`,
      );
    }
  }

  if (!full) {
    line("");
    line("## Optional");
    line("");
    line(`- [Full text of the tours and pages](${url("/llms-full.txt")})`);
    line(`- [Sitemap](${url("/sitemap.xml")})`);
    return `${out.join("\n")}\n`;
  }

  /* ---- full texts */
  line("");
  line("## Tours in full");
  for (const tour of content.tours) {
    /* The English text where there is one, the Czech one otherwise. */
    const english = Boolean(tour.bodyEn?.length);
    const text = blocksToText(english ? tour.bodyEn : tour.body, {
      markdown: true,
    });
    if (!text) continue;
    line("");
    line(
      `### ${english ? (tour.titleEn ?? tour.title) : tour.title}`,
      !english && " (in Czech)",
    );
    line("");
    line(
      `Source: ${url(english && tour.slugEn ? routePath("tours", "en", tour.slugEn) : routePath("tours", "cs", tour.slug))}`,
    );
    line("");
    line(text.replace(/^(#+) /gm, "#### "));
  }

  const ways: [string, string | undefined][] = [
    [en.byCar, directions.byCar],
    [en.byTrain, directions.byTrain],
    [en.byBus, directions.byBus],
    [en.parking, directions.parking],
    [en.accessibility, directions.accessibility],
  ];
  if (ways.some(([, text]) => text)) {
    line("");
    line(`## ${en.howToGetHere}`);
    for (const [heading, text] of ways) {
      if (!text) continue;
      line("");
      line(`### ${heading}`);
      line("");
      line(text.replace(/\*\*/g, "").trim());
    }
  }

  line("");
  line("## Pages in full (in Czech)");
  for (const page of content.pages) {
    const body = (page.sections ?? []).flatMap((section) => section.body ?? []);
    const text = blocksToText(body, { markdown: true });
    if (!text && !page.perex) continue;
    line("");
    line(`### ${page.title}`);
    line("");
    line(`Source: ${url(pagePath(page.parent, page.slug, "cs"))}`);
    if (page.perex) line("\n", plain(page.perex));
    if (text) line("\n", text.replace(/^(#+) /gm, "#### "));
  }

  if (content.posts.length > 0) {
    line("");
    line("## Recent news (in Czech)");
    line("");
    for (const post of content.posts) {
      line(
        `- ${pragueDay(post.publishedAt)}: [${post.title}](${url(routePath("news", "cs", post.slug))})`,
        post.perex && ` – ${plain(post.perex)}`,
      );
    }
  }

  return `${out.join("\n")}\n`;
}
