import { test } from "node:test";
import assert from "node:assert/strict";
import {
  czechHolidays,
  easterSunday,
  hoursOn,
  isHoliday,
  periodFor,
  pragueNow,
  startTimes,
  statusAt,
  type OpeningPeriod,
} from "./opening.ts";
import { OPENING_2026, STATUS_SUBJECTS } from "../data/opening-2026.ts";

test("Easter Sunday", () => {
  assert.equal(easterSunday(2024), "2024-03-31");
  assert.equal(easterSunday(2025), "2025-04-20");
  assert.equal(easterSunday(2026), "2026-04-05");
  assert.equal(easterSunday(2027), "2027-03-28");
});

test("Czech holidays include Good Friday and Easter Monday", () => {
  const holidays = czechHolidays(2026);
  assert.equal(holidays.length, 13);
  assert.ok(holidays.includes("2026-04-03"));
  assert.ok(holidays.includes("2026-04-06"));
  assert.ok(isHoliday("2026-10-28"));
  assert.ok(!isHoliday("2026-10-27"));
});

test("April opens on weekends and holidays only", () => {
  /* Wednesday */
  assert.equal(periodFor(OPENING_2026, "hausper", "2026-04-15"), undefined);
  /* Saturday */
  assert.equal(
    periodFor(OPENING_2026, "hausper", "2026-04-18")?.opens,
    "10:00",
  );
  /* Good Friday, a weekday that is a holiday */
  assert.equal(
    periodFor(OPENING_2026, "hausper", "2026-04-03")?.opens,
    "10:00",
  );
});

test("an exception beats the regular period it overlaps", () => {
  const periods: OpeningPeriod[] = [
    {
      subject: "x",
      kind: "regular",
      dateFrom: "2026-05-01",
      dateTo: "2026-05-31",
      days: "daily",
      opens: "10:00",
      closes: "16:00",
    },
    {
      subject: "x",
      kind: "exception",
      dateFrom: "2026-05-12",
      dateTo: "2026-05-12",
      days: "daily",
      closed: true,
    },
  ];
  assert.equal(periodFor(periods, "x", "2026-05-11")?.closed, undefined);
  assert.equal(periodFor(periods, "x", "2026-05-12")?.closed, true);
  assert.equal(hoursOn(periods, ["x"], "2026-05-12"), undefined);
});

test("between two regular periods the shorter range wins, then priority", () => {
  const base = {
    subject: "x",
    kind: "regular",
    days: "daily",
    closes: "16:00",
  } as const;
  const periods: OpeningPeriod[] = [
    { ...base, dateFrom: "2026-01-01", dateTo: "2026-12-31", opens: "08:00" },
    { ...base, dateFrom: "2026-06-01", dateTo: "2026-06-30", opens: "09:00" },
    {
      ...base,
      dateFrom: "2026-06-01",
      dateTo: "2026-06-30",
      opens: "10:00",
      priority: 5,
    },
  ];
  assert.equal(periodFor(periods, "x", "2026-03-01")?.opens, "08:00");
  assert.equal(periodFor(periods, "x", "2026-06-15")?.opens, "10:00");
});

test("the Hausper tour starts on odd hours, the Žerotín tour on even", () => {
  const hausper = periodFor(OPENING_2026, "hausper", "2026-07-15")!;
  const zerotin = periodFor(OPENING_2026, "zerotin", "2026-07-15")!;
  assert.deepEqual(startTimes(hausper), ["09:00", "11:00", "13:00", "15:00"]);
  assert.deepEqual(startTimes(zerotin), ["10:00", "12:00", "14:00", "16:00"]);
});

test("the children's tour runs at its listed times", () => {
  const period = periodFor(OPENING_2026, "detsky", "2026-08-01")!;
  assert.deepEqual(startTimes(period), ["10:00", "12:00", "14:00"]);
  assert.equal(periodFor(OPENING_2026, "detsky", "2026-06-30"), undefined);
});

test("the garden keeps weekday hours, except on a holiday", () => {
  /* Tuesday */
  assert.equal(
    periodFor(OPENING_2026, "zahrada", "2026-05-05")?.opens,
    "08:00",
  );
  /* Friday 8 May, a public holiday */
  assert.equal(
    periodFor(OPENING_2026, "zahrada", "2026-05-08")?.opens,
    "10:00",
  );
  /* Out of season */
  assert.equal(periodFor(OPENING_2026, "zahrada", "2026-02-10"), undefined);
});

test("the time of day is read in Prague, summer and winter", () => {
  assert.deepEqual(pragueNow(new Date("2026-07-15T07:30:00Z")), {
    day: "2026-07-15",
    minutes: 570,
  });
  assert.deepEqual(pragueNow(new Date("2026-12-31T23:30:00Z")), {
    day: "2027-01-01",
    minutes: 30,
  });
});

test("status through a summer day", () => {
  const at = (time: string) =>
    statusAt(OPENING_2026, STATUS_SUBJECTS, new Date(time));

  const early = at("2026-07-15T06:00:00Z");
  assert.equal(early.state, "opensLater");
  assert.deepEqual(early.today, {
    opens: "09:00",
    closes: "17:00",
    lastEntry: "16:00",
  });

  assert.equal(at("2026-07-15T10:00:00Z").state, "open");

  const evening = at("2026-07-15T16:00:00Z");
  assert.equal(evening.state, "closedForToday");
  assert.equal(evening.next?.day, "2026-07-16");
});

test("out of season the status names the next opening day", () => {
  const status = statusAt(
    OPENING_2026,
    STATUS_SUBJECTS,
    new Date("2026-03-10T10:00:00Z"),
  );
  assert.equal(status.state, "closed");
  assert.equal(status.next?.day, "2026-03-28");
  assert.equal(status.next?.hours.opens, "10:00");
});
