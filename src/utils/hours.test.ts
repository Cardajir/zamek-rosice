import assert from "node:assert/strict";
import { test } from "node:test";
import {
  hoursTable,
  periodLine,
  type HoursWords,
  type LabelledPeriod,
} from "./hours.ts";

const words: HoursWords = {
  days: {
    daily: "denně",
    weekdays: "pracovní dny",
    weekends: "sobota, neděle",
    holidays: "svátky",
    weekendsAndHolidays: "sobota, neděle, svátky",
  },
  closed: "zavřeno",
  lastEntry: "poslední prohlídka v",
  startsAt: "začátky v",
  startRules: {
    oddHours: "{name}: začátek vždy v lichou hodinu.",
    evenHours: "{name}: začátek vždy v sudou hodinu.",
  },
};

const may = (
  subjects: string[],
  extra: Partial<LabelledPeriod> = {},
): LabelledPeriod => ({
  label: "Květen",
  kind: "regular",
  dateFrom: "2026-05-01",
  dateTo: "2026-05-31",
  days: "daily",
  opens: "10:00",
  closes: "16:00",
  lastEntry: "15:00",
  subjects,
  ...extra,
});

test("a rule reads as days, hours and the last tour", () => {
  assert.equal(
    periodLine(may(["a"]), words),
    "denně 10:00–16:00, poslední prohlídka v 15:00",
  );
});

test("a morning hour loses its leading zero", () => {
  assert.equal(
    periodLine(may(["a"], { opens: "09:00", lastEntry: undefined }), words),
    "denně 9:00–16:00",
  );
});

test("a few named days are not called daily", () => {
  const easter = may(["a"], {
    label: "3. 4. – 6. 4.",
    kind: "exception",
    dateFrom: "2026-04-03",
    dateTo: "2026-04-06",
  });
  assert.equal(
    periodLine(easter, words),
    "10:00–16:00, poslední prohlídka v 15:00",
  );
});

test("listed starts replace the hours", () => {
  const summer = may(["a"], {
    startRule: "listed",
    startTimes: ["12:00", "10:00", "14:00"],
  });
  assert.equal(
    periodLine(summer, words),
    "denně začátky v 10:00, 12:00, 14:00",
  );
});

test("a closed rule says so", () => {
  assert.equal(periodLine(may(["a"], { closed: true }), words), "zavřeno");
});

test("subjects with the same hours share a group and keep their start rules", () => {
  const table = hoursTable(
    [
      may(["hausper"], { startRule: "oddHours" }),
      may(["zerotin"], { startRule: "evenHours" }),
      may(["kryt-co", "mladek"]),
      may(["zahrada"], {
        opens: "08:00",
        closes: "17:00",
        lastEntry: undefined,
      }),
    ],
    [
      { subject: "zerotin", name: "Žerotínský okruh" },
      { subject: "hausper", name: "Hausperský okruh" },
      { subject: "kryt-co", name: "Kryt" },
      { subject: "zahrada", name: "Zahrada" },
      { subject: "sklo", name: "Sklo" },
    ],
    words,
  );

  assert.equal(table.length, 2);
  assert.deepEqual(table[0]?.names, [
    "Žerotínský okruh",
    "Hausperský okruh",
    "Kryt",
  ]);
  assert.deepEqual(table[0]?.notes, [
    "Žerotínský okruh: začátek vždy v sudou hodinu.",
    "Hausperský okruh: začátek vždy v lichou hodinu.",
  ]);
  assert.deepEqual(table[1]?.names, ["Zahrada"]);
  assert.deepEqual(table[1]?.rows, [
    { label: "Květen", lines: ["denně 8:00–17:00"] },
  ]);
});

test("rules that share a label share a row", () => {
  const table = hoursTable(
    [
      may(["zahrada"], {
        label: "Duben – Říjen",
        days: "weekdays",
        opens: "08:00",
        closes: "17:00",
        lastEntry: undefined,
      }),
      may(["zahrada"], {
        label: "Duben – Říjen",
        days: "weekendsAndHolidays",
        closes: "17:00",
        lastEntry: undefined,
      }),
    ],
    [{ subject: "zahrada", name: "Zahrada" }],
    words,
  );
  assert.deepEqual(table[0]?.rows, [
    {
      label: "Duben – Říjen",
      lines: ["pracovní dny 8:00–17:00", "sobota, neděle, svátky 10:00–17:00"],
    },
  ]);
});
