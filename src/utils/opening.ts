/**
 * Opening hours: which rule applies on a day, when tours start, and whether
 * the castle is open right now. Pure functions over plain data, so the same
 * code answers for rows from Sanity and for the fallback in `src/data`.
 *
 * Every date is a calendar day in Europe/Prague, written `YYYY-MM-DD`; every
 * time is `HH:MM`. Nothing here depends on the zone the Worker runs in.
 */

export type OpeningDays =
  "daily" | "weekdays" | "weekends" | "holidays" | "weekendsAndHolidays";

export type StartRule =
  "none" | "everyHour" | "oddHours" | "evenHours" | "listed";

export interface OpeningPeriod {
  /** What the rule is for: a tour, the garden, the office. */
  subject: string;
  /** An exception overrides any regular period on the days it covers. */
  kind: "regular" | "exception";
  dateFrom: string;
  dateTo: string;
  days: OpeningDays;
  /** Closed on the days this rule covers. */
  closed?: boolean;
  opens?: string;
  closes?: string;
  /** The last moment a visit can begin. Defaults to `closes`. */
  lastEntry?: string;
  startRule?: StartRule;
  /** Start times for `startRule: "listed"`. */
  startTimes?: string[];
  /** Settles a tie between two rules of the same kind and length. */
  priority?: number;
}

const TIME_ZONE = "Europe/Prague";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (year: number, month: number, day: number) =>
  `${year}-${pad(month)}-${pad(day)}`;

/** Minutes since midnight for `HH:MM`. */
export const toMinutes = (time: string): number => {
  const [hours = "0", minutes = "0"] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
};

const fromMinutes = (minutes: number) =>
  `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

/** A calendar day moved by a number of days. */
function shift(day: string, by: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + by);
  return date.toISOString().slice(0, 10);
}

/** Days from one calendar day to another, inclusive of both. */
const span = (from: string, to: string) =>
  Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      86_400_000,
  ) + 1;

/** 0 is Sunday, 6 is Saturday. */
const weekday = (day: string) => new Date(`${day}T00:00:00Z`).getUTCDay();

/** Easter Sunday in the Gregorian calendar (Meeus' algorithm). */
export function easterSunday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return iso(year, month, day);
}

const FIXED_HOLIDAYS = [
  "01-01",
  "05-01",
  "05-08",
  "07-05",
  "07-06",
  "09-28",
  "10-28",
  "11-17",
  "12-24",
  "12-25",
  "12-26",
];

/** Czech public holidays of a year, Good Friday and Easter Monday included. */
export function czechHolidays(year: number): string[] {
  const easter = easterSunday(year);
  return [
    ...FIXED_HOLIDAYS.map((day) => `${year}-${day}`),
    shift(easter, -2),
    shift(easter, 1),
  ].sort();
}

export const isHoliday = (day: string): boolean =>
  czechHolidays(Number(day.slice(0, 4))).includes(day);

function coversDay(period: OpeningPeriod, day: string): boolean {
  if (day < period.dateFrom || day > period.dateTo) return false;
  const weekend = weekday(day) === 0 || weekday(day) === 6;
  const holiday = isHoliday(day);
  switch (period.days) {
    case "daily":
      return true;
    case "weekdays":
      return !weekend && !holiday;
    case "weekends":
      return weekend;
    case "holidays":
      return holiday;
    case "weekendsAndHolidays":
      return weekend || holiday;
  }
}

/**
 * The rule in force for a subject on a day, or `undefined` when none covers
 * it, which means closed. An exception beats a regular period; between two
 * of a kind the shorter date range wins, then the higher priority.
 */
export function periodFor(
  periods: OpeningPeriod[],
  subject: string,
  day: string,
): OpeningPeriod | undefined {
  const rank = (period: OpeningPeriod) => (period.kind === "exception" ? 0 : 1);
  return periods
    .filter((period) => period.subject === subject && coversDay(period, day))
    .sort(
      (a, b) =>
        rank(a) - rank(b) ||
        span(a.dateFrom, a.dateTo) - span(b.dateFrom, b.dateTo) ||
        (b.priority ?? 0) - (a.priority ?? 0),
    )[0];
}

/** When tours start under a rule, in order. Empty for a rule without set starts. */
export function startTimes(period: OpeningPeriod): string[] {
  if (period.closed) return [];
  const rule = period.startRule ?? "none";
  if (rule === "listed") return [...(period.startTimes ?? [])].sort();
  if (rule === "none" || !period.opens || !period.closes) return [];

  const first = Math.ceil(toMinutes(period.opens) / 60);
  const last = Math.floor(toMinutes(period.lastEntry ?? period.closes) / 60);
  const times: string[] = [];
  for (let hour = first; hour <= last; hour++) {
    if (rule === "oddHours" && hour % 2 === 0) continue;
    if (rule === "evenHours" && hour % 2 === 1) continue;
    times.push(fromMinutes(hour * 60));
  }
  return times;
}

/** The calendar day and the time of day in Prague at an instant. */
export function pragueNow(at: Date): { day: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "00";
  return {
    day: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export interface DayHours {
  opens: string;
  closes: string;
  lastEntry: string;
}

/**
 * The hours of a day across several subjects: from the earliest opening to
 * the latest closing. `undefined` when everything is closed that day.
 */
export function hoursOn(
  periods: OpeningPeriod[],
  subjects: string[],
  day: string,
): DayHours | undefined {
  const open = subjects
    .map((subject) => periodFor(periods, subject, day))
    .filter((period): period is OpeningPeriod =>
      Boolean(period && !period.closed && period.opens && period.closes),
    );
  if (open.length === 0) return undefined;

  const earliest = Math.min(...open.map((period) => toMinutes(period.opens!)));
  const latest = Math.max(...open.map((period) => toMinutes(period.closes!)));
  const lastEntry = Math.max(
    ...open.map((period) => toMinutes(period.lastEntry ?? period.closes!)),
  );
  return {
    opens: fromMinutes(earliest),
    closes: fromMinutes(latest),
    lastEntry: fromMinutes(lastEntry),
  };
}

export type OpenState =
  /** Open at this moment. */
  | "open"
  /** Opens later today. */
  | "opensLater"
  /** Was open today and has closed. */
  | "closedForToday"
  /** Not open at all today. */
  | "closed";

export interface OpenStatus {
  state: OpenState;
  /** Today's hours, when the castle opens today at all. */
  today?: DayHours;
  /** The next day it opens after today, looking up to a year ahead. */
  next?: { day: string; hours: DayHours };
}

/** Whether the castle is open at an instant, and when it next opens. */
export function statusAt(
  periods: OpeningPeriod[],
  subjects: string[],
  at: Date,
): OpenStatus {
  const { day, minutes } = pragueNow(at);
  const today = hoursOn(periods, subjects, day);

  const nextOpening = () => {
    for (let ahead = 1; ahead <= 366; ahead++) {
      const candidate = shift(day, ahead);
      const hours = hoursOn(periods, subjects, candidate);
      if (hours) return { day: candidate, hours };
    }
    return undefined;
  };

  if (!today) return { state: "closed", next: nextOpening() };
  if (minutes < toMinutes(today.opens)) return { state: "opensLater", today };
  if (minutes < toMinutes(today.closes)) return { state: "open", today };
  return { state: "closedForToday", today, next: nextOpening() };
}
