/**
 * The opening-hours table: the rules stored in Sanity turned into the rows a
 * visitor reads. Pure functions over plain data; the words come in from the
 * dictionary, so the same code writes Czech, English and German.
 */

import type { OpeningDays, OpeningPeriod, StartRule } from "./opening.ts";

/** A rule as the table needs it: what it is for, and what the row is called. */
export interface LabelledPeriod extends Omit<OpeningPeriod, "subject"> {
  /** The name of the period: "Květen", "28. 3. – 29. 3.". */
  label?: string;
  note?: string;
  /** Every tour or place the rule applies to. */
  subjects: string[];
}

export interface HoursWords {
  days: Record<OpeningDays, string>;
  closed: string;
  /** "last tour at" */
  lastEntry: string;
  /** "tours start at" */
  startsAt: string;
  /** Sentences with `{name}` where the tour's name goes. */
  startRules: Partial<Record<StartRule, string>>;
}

export interface HoursRow {
  label: string;
  lines: string[];
}

export interface HoursGroup {
  /** The tours and places that keep these hours, in the order given. */
  names: string[];
  rows: HoursRow[];
  /** When tours start, for the subjects that start by a rule. */
  notes: string[];
}

/** `09:00` as `9:00`. */
const time = (value: string) => value.replace(/^0/, "");

const days = (from: string, to: string) =>
  Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      86_400_000,
  ) + 1;

/** One rule as a sentence: "daily 10:00–16:00, last tour at 15:00". */
export function periodLine(period: LabelledPeriod, words: HoursWords): string {
  if (period.closed || !period.opens || !period.closes) return words.closed;

  /* A few named days need no "daily": the label already says which. */
  const everyDayOfAShortRange =
    period.days === "daily" && days(period.dateFrom, period.dateTo) < 7;
  const which = everyDayOfAShortRange ? "" : `${words.days[period.days]} `;

  if (period.startRule === "listed" && period.startTimes?.length) {
    const starts = [...period.startTimes].sort().map(time).join(", ");
    return `${which}${words.startsAt} ${starts}`;
  }

  const hours = `${time(period.opens)}–${time(period.closes)}`;
  const last =
    period.lastEntry && period.lastEntry !== period.closes
      ? `, ${words.lastEntry} ${time(period.lastEntry)}`
      : "";
  return [`${which}${hours}${last}`, period.note].filter(Boolean).join(". ");
}

/** The rows of one subject, in date order; rules sharing a label share a row. */
function rowsFor(
  periods: LabelledPeriod[],
  subject: string,
  words: HoursWords,
): HoursRow[] {
  const rows: HoursRow[] = [];
  const own = periods
    .filter((period) => period.subjects.includes(subject))
    .sort(
      (a, b) =>
        a.dateFrom.localeCompare(b.dateFrom) || a.days.localeCompare(b.days),
    );

  for (const period of own) {
    const label = period.label ?? `${period.dateFrom} – ${period.dateTo}`;
    const line = periodLine(period, words);
    const last = rows.at(-1);
    if (last?.label === label) last.lines.push(line);
    else rows.push({ label, lines: [line] });
  }
  return rows;
}

/** The start rule a subject follows through the season, when it has just one. */
function startRuleOf(
  periods: LabelledPeriod[],
  subject: string,
): StartRule | undefined {
  const rules = new Set(
    periods
      .filter((period) => period.subjects.includes(subject) && !period.closed)
      .map((period) => period.startRule ?? "none"),
  );
  const [only] = [...rules];
  return rules.size === 1 && only !== "none" && only !== "listed"
    ? only
    : undefined;
}

/**
 * The table, one group per set of hours. Subjects that keep the same hours
 * all season are listed together, as the printed timetable does.
 *
 * @param order The subjects in the order they should appear, with their names.
 */
export function hoursTable(
  periods: LabelledPeriod[],
  order: { subject: string; name: string }[],
  words: HoursWords,
): HoursGroup[] {
  const groups = new Map<string, HoursGroup>();

  for (const { subject, name } of order) {
    const rows = rowsFor(periods, subject, words);
    if (rows.length === 0) continue;

    const key = JSON.stringify(rows);
    const group = groups.get(key) ?? { names: [], rows, notes: [] };
    group.names.push(name);

    const rule = startRuleOf(periods, subject);
    const sentence = rule && words.startRules[rule];
    if (sentence) group.notes.push(sentence.replace("{name}", name));

    groups.set(key, group);
  }
  return [...groups.values()];
}
