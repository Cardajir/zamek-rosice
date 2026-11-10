import { defineArrayMember, defineField, defineType } from "sanity";
import { localized } from "./helpers.ts";

/** Documents there is exactly one of. Their id is their type name. */
export const SINGLETONS = [
  "siteSettings",
  "navigation",
  "homePage",
  "visitInfo",
] as const;

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Nastavení webu",
  type: "document",
  groups: [
    { name: "contact", title: "Kontakt", default: true },
    { name: "legal", title: "Statutární údaje" },
    { name: "social", title: "Sítě a hodnocení" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    localized("organisation", "Název organizace", "localizedString", {
      group: "contact",
    }),
    defineField({
      name: "street",
      title: "Ulice",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "postalCode",
      title: "PSČ",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "locality",
      title: "Obec",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "location",
      title: "GPS",
      type: "geopoint",
      group: "contact",
    }),
    defineField({
      name: "phone",
      title: "Telefon",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "mobile",
      title: "Mobil",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "email",
      title: "E-mail",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "formRecipient",
      title: "E-mail pro kontaktní formulář",
      type: "string",
      description: "Kam chodí zprávy z formuláře. Na webu se nezobrazuje.",
      group: "contact",
      validation: (rule) => rule.email(),
    }),
    localized("founder", "Zřizovatel", "localizedString", {
      required: false,
      group: "legal",
    }),
    defineField({
      name: "companyId",
      title: "IČ",
      type: "string",
      group: "legal",
    }),
    defineField({
      name: "bankAccount",
      title: "Bankovní spojení",
      type: "string",
      group: "legal",
    }),
    defineField({
      name: "socials",
      title: "Sociální sítě",
      type: "array",
      group: "social",
      of: [
        defineArrayMember({
          name: "social",
          type: "object",
          fields: [
            defineField({
              name: "network",
              title: "Síť",
              type: "string",
              options: {
                list: [
                  { title: "Facebook", value: "facebook" },
                  { title: "Instagram", value: "instagram" },
                  { title: "YouTube", value: "youtube" },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              title: "Odkaz",
              type: "url",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "network", subtitle: "url" } },
        }),
      ],
    }),
    defineField({
      name: "rating",
      title: "Hodnocení",
      type: "object",
      group: "social",
      fields: [
        defineField({
          name: "value",
          title: "Hodnota",
          type: "number",
          validation: (rule) => rule.min(0).max(5).precision(1),
        }),
        defineField({
          name: "source",
          title: "Zdroj",
          type: "string",
          description: "Např. Mapy.com.",
        }),
        defineField({ name: "url", title: "Odkaz na hodnocení", type: "url" }),
        localized("label", "Popisek", "localizedString", { required: false }),
      ],
    }),
    defineField({
      name: "seo",
      title: "Výchozí SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: { prepare: () => ({ title: "Nastavení webu" }) },
});

const navItem = defineArrayMember({ type: "link", title: "Položka" });

export const navigation = defineType({
  name: "navigation",
  title: "Navigace",
  type: "document",
  fields: [
    defineField({
      name: "groups",
      title: "Hlavní menu",
      type: "array",
      description: "Tři rozbalovací skupiny vlevo od loga.",
      validation: (rule) => rule.max(3),
      of: [
        defineArrayMember({
          name: "group",
          title: "Skupina",
          type: "object",
          fields: [
            localized("label", "Název skupiny", "localizedString"),
            defineField({
              name: "items",
              title: "Položky",
              type: "array",
              of: [navItem],
            }),
          ],
          preview: { select: { title: "label.cs" } },
        }),
      ],
    }),
    defineField({
      name: "topLinks",
      title: "Odkazy vpravo v liště",
      type: "array",
      of: [navItem],
    }),
    defineField({
      name: "footerColumns",
      title: "Sloupce patičky",
      type: "array",
      validation: (rule) => rule.max(3),
      of: [
        defineArrayMember({
          name: "column",
          title: "Sloupec",
          type: "object",
          fields: [
            defineField({
              name: "items",
              title: "Odkazy",
              type: "array",
              of: [navItem],
            }),
          ],
          preview: {
            select: { first: "items.0.label.cs" },
            prepare: ({ first }) => ({
              title: first ? `${first} …` : "Sloupec",
            }),
          },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Navigace" }) },
});

export const homePage = defineType({
  name: "homePage",
  title: "Úvodní stránka",
  type: "document",
  fields: [
    localized("heading", "Hlavní nadpis (h1)", "localizedText"),
    defineField({
      name: "headingLink",
      title: "Odkaz pod nadpisem",
      type: "link",
    }),
    defineField({
      name: "heroImage",
      title: "Fotka v záhlaví",
      type: "imageWithAlt",
    }),
    defineField({
      name: "secondImage",
      title: "Druhá fotka",
      type: "imageWithAlt",
      description: "Přes celou šířku nad hodnocením návštěvníků.",
    }),
    localized("heritageNote", "Poznámka pod druhou fotkou", "localizedString", {
      required: false,
      description: "Např. „Národní kulturní památka od roku 2022“.",
    }),
    defineField({
      name: "promos",
      title: "Promo bloky",
      type: "array",
      description: "Svatba, Šenk, školní výlety.",
      of: [
        defineArrayMember({
          name: "promo",
          title: "Blok",
          type: "object",
          fields: [
            localized("eyebrow", "Štítek", "localizedString", {
              required: false,
            }),
            localized("title", "Nadpis", "localizedString"),
            localized("text", "Text", "localizedText"),
            defineField({
              name: "images",
              title: "Fotky",
              type: "array",
              of: [defineArrayMember({ type: "imageWithAlt" })],
              validation: (rule) => rule.max(3),
            }),
            defineField({ name: "link", title: "Odkaz", type: "link" }),
          ],
          preview: { select: { title: "title.cs", media: "images.0" } },
        }),
      ],
    }),
    defineField({
      name: "quote",
      title: "Citace",
      type: "object",
      fields: [
        localized("text", "Text", "localizedText"),
        localized("author", "Autor", "localizedString"),
        defineField({ name: "date", title: "Datum", type: "date" }),
      ],
    }),
    defineField({
      name: "cta",
      title: "Výzva na konci",
      type: "object",
      fields: [
        localized("title", "Nadpis", "localizedString"),
        defineField({ name: "image", title: "Fotka", type: "imageWithAlt" }),
        defineField({ name: "link", title: "Odkaz", type: "link" }),
      ],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Úvodní stránka" }) },
});

export const visitInfo = defineType({
  name: "visitInfo",
  title: "Provoz a oznámení",
  type: "document",
  fields: [
    defineField({
      name: "notices",
      title: "Oznámení",
      type: "array",
      description:
        "Krátká provozní zpráva v liště: uzavírka okruhu, změna hodin. Vždy ve všech třech jazycích.",
      of: [
        defineArrayMember({
          name: "notice",
          title: "Oznámení",
          type: "object",
          fields: [
            localized("text", "Text", "localizedString"),
            defineField({
              name: "tone",
              title: "Tón",
              type: "string",
              options: {
                list: [
                  { title: "Informace", value: "info" },
                  { title: "Upozornění", value: "warning" },
                ],
                layout: "radio",
              },
              initialValue: "info",
            }),
            defineField({
              name: "from",
              title: "Zobrazit od",
              type: "date",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "to",
              title: "Zobrazit do",
              type: "date",
              validation: (rule) =>
                rule.required().min(rule.valueOfField("from")),
            }),
            defineField({ name: "link", title: "Odkaz", type: "link" }),
          ],
          preview: { select: { title: "text.cs", subtitle: "to" } },
        }),
      ],
    }),
    localized("intro", "Kde nás najdete: úvod", "localizedText", {
      required: false,
    }),
    localized("byCar", "Automobilem", "localizedText", { required: false }),
    localized("byTrain", "Vlakem", "localizedText", { required: false }),
    localized("byBus", "Autobusem", "localizedText", { required: false }),
    localized("parking", "Parkování", "localizedText", { required: false }),
    localized("accessibility", "Bezbariérovost", "localizedText", {
      required: false,
    }),
    defineField({ name: "mapUrl", title: "Odkaz na mapu", type: "url" }),
    defineField({ name: "image", title: "Fotka", type: "imageWithAlt" }),
  ],
  preview: { prepare: () => ({ title: "Provoz a oznámení" }) },
});

export const singletonTypes = [siteSettings, navigation, homePage, visitInfo];
