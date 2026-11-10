import { LANG_LOCALES, type Lang } from "../consts.ts";
import { STATUS_SUBJECTS } from "../data/opening-2026.ts";
import { ui } from "../i18n/ui.ts";
import { statusAt, type Closure, type OpeningPeriod } from "./opening.ts";

export interface OpenStatusText {
  /** Whether the castle opens today and has not closed yet. */
  isOpen: boolean;
  /** "Open today", "Closed today" and the like. */
  label: string;
  /** Today's hours, or when it next opens. */
  detail?: string;
}

/** The status-bar wording for an instant, in a language. */
export function openStatusText(
  periods: OpeningPeriod[],
  lang: Lang,
  at: Date = new Date(),
  closures?: Closure[],
): OpenStatusText {
  const t = ui(lang);
  const status = statusAt(periods, STATUS_SUBJECTS, at, closures);

  const time = (value: string) => value.replace(/^0/, "");
  const range = (hours: { opens: string; closes: string }) =>
    `${time(hours.opens)} – ${time(hours.closes)}`;
  const day = (value: string) =>
    new Intl.DateTimeFormat(LANG_LOCALES[lang], {
      day: "numeric",
      month: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${value}T00:00:00Z`));

  const isOpen = status.state === "open" || status.state === "opensLater";
  const label = status.special
    ? t.closedSpecially
    : {
        open: t.openToday,
        opensLater: t.openToday,
        closedForToday: t.closedForToday,
        closed: t.closedToday,
      }[status.state];
  const detail =
    isOpen && status.today
      ? range(status.today)
      : status.next
        ? `${t.nextOpening} ${day(status.next.day)}, ${range(status.next.hours)}`
        : undefined;

  return { isOpen, label, detail };
}
