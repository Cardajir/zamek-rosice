import { defineArrayMember, defineField, defineType } from "sanity";
import { byOrder, localized, orderField } from "./helpers.ts";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const timeField = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    type: "string",
    description: description ?? "Ve tvaru 09:00.",
    validation: (rule) => rule.regex(TIME, { name: "čas HH:MM" }),
  });

export const tour = defineType({
  name: "tour",
  title: "Prohlídka / expozice",
  type: "document",
  orderings: byOrder,
  fields: [
    localized("title", "Název", "localizedString"),
    localized("slug", "Adresa", "localizedSlug"),
    defineField({
      name: "kind",
      title: "Druh",
      type: "string",
      options: {
        list: [
          { title: "Prohlídkový okruh", value: "tour" },
          { title: "Stálá výstava", value: "exhibition" },
          { title: "Venkovní", value: "outdoor" },
        ],
        layout: "radio",
      },
      initialValue: "tour",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subject",
      title: "Klíč pro provozní dobu",
      type: "string",
      description:
        "Krátký název bez mezer, např. hausper, zerotin, kryt-co. Podle něj se páruje provozní doba.",
      validation: (rule) =>
        rule.regex(/^[a-z0-9-]+$/, { name: "malá písmena, číslice a pomlčka" }),
    }),
    localized("perex", "Perex", "localizedText"),
    localized("body", "Text", "localizedBlockContent", { required: false }),
    defineField({
      name: "duration",
      title: "Délka",
      type: "object",
      fields: [
        defineField({
          name: "min",
          title: "Od (minut)",
          type: "number",
          validation: (rule) => rule.min(0),
        }),
        defineField({
          name: "max",
          title: "Do (minut)",
          type: "number",
          validation: (rule) => rule.min(0),
        }),
        defineField({
          name: "unlimited",
          title: "Není omezená",
          type: "boolean",
        }),
      ],
      options: { columns: 3 },
    }),
    defineField({
      name: "free",
      title: "Vstup volný",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "images",
      title: "Fotky",
      type: "array",
      of: [defineArrayMember({ type: "imageWithAlt" })],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "gallery",
      title: "Album",
      type: "reference",
      to: [{ type: "gallery" }],
    }),
    defineField({
      name: "showOnHome",
      title: "Zobrazit na úvodu",
      type: "boolean",
      initialValue: true,
    }),
    orderField,
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: {
    select: { title: "title.cs", subtitle: "kind", media: "images.0" },
  },
});

export const ticketList = defineType({
  name: "ticketList",
  title: "Ceník",
  type: "document",
  orderings: byOrder,
  fields: [
    localized("title", "Název", "localizedString"),
    localized("intro", "Úvodní text", "localizedText", { required: false }),
    defineField({
      name: "appliesTo",
      title: "Platí pro",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "tour" }, { type: "venue" }],
        }),
      ],
    }),
    defineField({
      name: "rows",
      title: "Řádky",
      type: "array",
      validation: (rule) => rule.min(1),
      of: [
        defineArrayMember({
          name: "row",
          title: "Řádek",
          type: "object",
          fields: [
            localized("label", "Název", "localizedString"),
            localized("condition", "Podmínka", "localizedString", {
              required: false,
            }),
            defineField({
              name: "prices",
              title: "Ceny",
              type: "array",
              description:
                "Obvykle jedna. Dvě, když řádek ukazuje plné a snížené vedle sebe.",
              of: [defineArrayMember({ type: "number" })],
              validation: (rule) => rule.min(1).max(2),
            }),
            defineField({
              name: "unit",
              title: "Jednotka",
              type: "string",
              options: {
                list: [
                  { title: "Kč", value: "czk" },
                  { title: "Kč / hod", value: "czkPerHour" },
                ],
              },
              initialValue: "czk",
            }),
          ],
          preview: {
            select: {
              title: "label.cs",
              first: "prices.0",
              second: "prices.1",
            },
            prepare: ({ title, first, second }) => ({
              title,
              subtitle:
                [first, second]
                  .filter((price) => price !== undefined)
                  .join(" / ") + " Kč",
            }),
          },
        }),
      ],
    }),
    localized("note", "Poznámka", "localizedText", { required: false }),
    defineField({
      name: "showInStatusBar",
      title: "Ukázat v horní liště",
      type: "boolean",
      description:
        "Lišta ukáže první dvě ceny tohoto ceníku jako základní a zvýhodněné vstupné. Zapnuté jen u jednoho.",
      initialValue: false,
    }),
    orderField,
  ],
  preview: { select: { title: "title.cs" } },
});

export const openingPeriod = defineType({
  name: "openingPeriod",
  title: "Provozní doba (období)",
  type: "document",
  fields: [
    localized("label", "Název", "localizedString", {
      description: "Jak se období jmenuje v tabulce: „Květen“, „Velikonoce“.",
    }),
    defineField({
      name: "kind",
      title: "Druh",
      type: "string",
      description: "Výjimka má na své dny přednost před běžným obdobím.",
      options: {
        list: [
          { title: "Běžné období", value: "regular" },
          { title: "Výjimka", value: "exception" },
        ],
        layout: "radio",
      },
      initialValue: "regular",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "appliesTo",
      title: "Platí pro",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "tour" }, { type: "venue" }],
        }),
      ],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "dateFrom",
      title: "Od",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "dateTo",
      title: "Do",
      type: "date",
      validation: (rule) => rule.required().min(rule.valueOfField("dateFrom")),
    }),
    defineField({
      name: "days",
      title: "Dny",
      type: "string",
      description: "Svátky se počítají samy, včetně Velikonoc.",
      options: {
        list: [
          { title: "Denně", value: "daily" },
          { title: "Pracovní dny", value: "weekdays" },
          { title: "Víkendy", value: "weekends" },
          { title: "Svátky", value: "holidays" },
          { title: "Víkendy a svátky", value: "weekendsAndHolidays" },
        ],
      },
      initialValue: "daily",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "closed",
      title: "Zavřeno",
      type: "boolean",
      initialValue: false,
    }),
    {
      ...timeField("opens", "Otevřeno od"),
      hidden: ({ parent }) => parent?.closed === true,
    },
    {
      ...timeField("closes", "Otevřeno do"),
      hidden: ({ parent }) => parent?.closed === true,
    },
    {
      ...timeField(
        "lastEntry",
        "Poslední prohlídka",
        "Ve tvaru 15:00. Prázdné znamená do zavření.",
      ),
      hidden: ({ parent }) => parent?.closed === true,
    },
    defineField({
      name: "startRule",
      title: "Začátky prohlídek",
      type: "string",
      options: {
        list: [
          { title: "Bez pevných začátků", value: "none" },
          { title: "Každou celou hodinu", value: "everyHour" },
          { title: "V lichou hodinu", value: "oddHours" },
          { title: "V sudou hodinu", value: "evenHours" },
          { title: "Vyjmenované časy", value: "listed" },
        ],
      },
      initialValue: "none",
      hidden: ({ parent }) => parent?.closed === true,
    }),
    defineField({
      name: "startTimes",
      title: "Časy začátků",
      type: "array",
      of: [
        defineArrayMember({
          type: "string",
          validation: (rule) => rule.regex(TIME, { name: "čas HH:MM" }),
        }),
      ],
      hidden: ({ parent }) => parent?.startRule !== "listed",
    }),
    localized("note", "Poznámka", "localizedString", { required: false }),
    defineField({
      name: "priority",
      title: "Priorita",
      type: "number",
      description:
        "Rozhodne, když dvě stejně dlouhá období téhož druhu platí na stejný den. Vyšší vyhrává.",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Od data",
      name: "dateFrom",
      by: [{ field: "dateFrom", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "label.cs",
      from: "dateFrom",
      to: "dateTo",
      kind: "kind",
      closed: "closed",
    },
    prepare: ({ title, from, to, kind, closed }) => ({
      title,
      subtitle: `${from ?? "?"} – ${to ?? "?"}${kind === "exception" ? " · výjimka" : ""}${closed ? " · zavřeno" : ""}`,
    }),
  },
});

export const venue = defineType({
  name: "venue",
  title: "Prostor k pronájmu",
  type: "document",
  orderings: byOrder,
  fields: [
    localized("title", "Název", "localizedString"),
    localized("slug", "Adresa", "localizedSlug"),
    defineField({
      name: "uses",
      title: "Využití",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: [
          { title: "Svatební obřad", value: "ceremony" },
          { title: "Svatební hostina", value: "wedding" },
          { title: "Oslava", value: "party" },
          { title: "Seminář", value: "seminar" },
          { title: "Výstava", value: "exhibition" },
        ],
      },
    }),
    defineField({
      name: "capacity",
      title: "Kapacita (osob)",
      type: "number",
      validation: (rule) => rule.min(0),
    }),
    localized("capacityNote", "Poznámka ke kapacitě", "localizedString", {
      required: false,
    }),
    localized("description", "Popis", "localizedText"),
    localized("equipment", "Vybavení", "localizedText", { required: false }),
    defineField({
      name: "closedMonths",
      title: "Měsíce mimo provoz",
      type: "array",
      description:
        "Čísla měsíců, kdy prostor nejde pronajmout. Šenk: 11, 12, 1, 2, 3, 4.",
      of: [
        defineArrayMember({
          type: "number",
          validation: (rule) => rule.min(1).max(12).integer(),
        }),
      ],
    }),
    defineField({
      name: "images",
      title: "Fotky",
      type: "array",
      of: [defineArrayMember({ type: "imageWithAlt" })],
    }),
    defineField({
      name: "gallery",
      title: "Album",
      type: "reference",
      to: [{ type: "gallery" }],
    }),
    defineField({
      name: "contact",
      title: "Kontaktní osoba",
      type: "reference",
      to: [{ type: "person" }],
    }),
    orderField,
  ],
  preview: {
    select: {
      title: "title.cs",
      subtitle: "capacityNote.cs",
      media: "images.0",
    },
  },
});

export const gallery = defineType({
  name: "gallery",
  title: "Fotogalerie (album)",
  type: "document",
  orderings: byOrder,
  fields: [
    localized("title", "Název", "localizedString"),
    localized("slug", "Adresa", "localizedSlug"),
    defineField({
      name: "defaultCredit",
      title: "Výchozí autor",
      type: "string",
      description: "Použije se u fotek, které nemají vlastního autora.",
    }),
    defineField({
      name: "images",
      title: "Fotky",
      type: "array",
      options: { layout: "grid" },
      of: [defineArrayMember({ type: "imageWithAlt" })],
    }),
    orderField,
  ],
  preview: { select: { title: "title.cs", media: "images.0" } },
});

export const visitTypes = [tour, ticketList, openingPeriod, venue, gallery];
