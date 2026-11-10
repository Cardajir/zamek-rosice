import { defineArrayMember, defineField, defineType } from "sanity";
import { byOrder, localized, orderField } from "./helpers.ts";

/** Set and kept by the document-internationalization plugin. */
const languageField = defineField({
  name: "language",
  title: "Jazyk",
  type: "string",
  readOnly: true,
  hidden: true,
});

const slugField = defineField({
  name: "slug",
  title: "Adresa",
  type: "slug",
  options: { source: "title", maxLength: 96 },
  validation: (rule) => rule.required(),
});

/* Sections of the page builder. General text pages only; key pages live in code. */

const sectionRichText = defineType({
  name: "sectionRichText",
  title: "Text",
  type: "object",
  fields: [defineField({ name: "body", title: "Text", type: "blockContent" })],
  preview: { prepare: () => ({ title: "Text" }) },
});

const sectionMedia = defineType({
  name: "sectionMedia",
  title: "Obrázky",
  type: "object",
  fields: [
    defineField({
      name: "images",
      title: "Obrázky",
      type: "array",
      of: [defineArrayMember({ type: "imageWithAlt" })],
      validation: (rule) => rule.min(1).max(2),
    }),
  ],
  preview: {
    select: { media: "images.0" },
    prepare: ({ media }) => ({ title: "Obrázky", media }),
  },
});

const referencesSection = (name: string, title: string, to: string) =>
  defineType({
    name,
    title,
    type: "object",
    fields: [
      defineField({ name: "heading", title: "Nadpis", type: "string" }),
      defineField({
        name: "items",
        title,
        type: "array",
        of: [defineArrayMember({ type: "reference", to: [{ type: to }] })],
        validation: (rule) => rule.min(1),
      }),
    ],
    preview: {
      select: { heading: "heading" },
      prepare: ({ heading }) => ({ title: heading || title }),
    },
  });

const sectionGallery = defineType({
  name: "sectionGallery",
  title: "Album",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Nadpis", type: "string" }),
    defineField({
      name: "gallery",
      title: "Album",
      type: "reference",
      to: [{ type: "gallery" }],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { heading: "heading" },
    prepare: ({ heading }) => ({ title: heading || "Album" }),
  },
});

const sectionCta = defineType({
  name: "sectionCta",
  title: "Výzva",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Nadpis",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "image", title: "Fotka", type: "imageWithAlt" }),
    defineField({ name: "link", title: "Odkaz", type: "link" }),
  ],
  preview: { select: { title: "heading" } },
});

const sections = [
  sectionRichText,
  sectionMedia,
  referencesSection("sectionPricing", "Ceníky", "ticketList"),
  referencesSection("sectionVenues", "Prostory", "venue"),
  sectionGallery,
  referencesSection("sectionDocuments", "Dokumenty ke stažení", "fileDocument"),
  referencesSection("sectionContact", "Kontaktní osoby", "person"),
  sectionCta,
];

export const page = defineType({
  name: "page",
  title: "Stránka",
  type: "document",
  fields: [
    languageField,
    defineField({
      name: "title",
      title: "Titulek (h1)",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    slugField,
    defineField({
      name: "parent",
      title: "Nadřazená část webu",
      type: "string",
      description: "Určuje začátek adresy.",
      options: {
        list: [
          { title: "Bez nadřazené", value: "none" },
          { title: "Pro návštěvníky", value: "visit" },
          { title: "Akce a pronájmy", value: "events" },
          { title: "O zámku", value: "about" },
          { title: "Povinné a statutární informace", value: "statutory" },
        ],
      },
      initialValue: "none",
    }),
    defineField({ name: "perex", title: "Perex", type: "text", rows: 3 }),
    defineField({
      name: "image",
      title: "Hlavní obrázek",
      type: "imageWithAlt",
    }),
    defineField({
      name: "sections",
      title: "Sekce",
      type: "array",
      of: sections.map((section) => defineArrayMember({ type: section.name })),
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: { select: { title: "title", subtitle: "language", media: "image" } },
});

export const post = defineType({
  name: "post",
  title: "Aktualita / akce",
  type: "document",
  groups: [
    { name: "content", title: "Obsah", default: true },
    { name: "event", title: "Akce" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    languageField,
    defineField({
      name: "kind",
      title: "Druh",
      type: "string",
      group: "content",
      options: {
        list: [
          { title: "Aktualita", value: "news" },
          { title: "Akce", value: "event" },
        ],
        layout: "radio",
      },
      initialValue: "news",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Titulek",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    { ...slugField, group: "content" },
    defineField({
      name: "publishedAt",
      title: "Datum zveřejnění",
      type: "datetime",
      group: "content",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Obrázek / plakát",
      type: "imageWithAlt",
      group: "content",
    }),
    defineField({
      name: "perex",
      title: "Perex",
      type: "text",
      rows: 3,
      group: "content",
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: "body",
      title: "Text",
      type: "blockContent",
      group: "content",
    }),
    defineField({
      name: "featured",
      title: "Zvýraznit nahoře",
      type: "boolean",
      description: "Poloha „Last minute“ nad výpisem.",
      group: "content",
      initialValue: false,
    }),
    defineField({
      name: "eventStart",
      title: "Začátek akce",
      type: "datetime",
      group: "event",
      hidden: ({ document }) => document?.kind !== "event",
      validation: (rule) =>
        rule.custom((value, { document }) =>
          document?.kind === "event" && !value ? "Akce potřebuje datum" : true,
        ),
    }),
    defineField({
      name: "eventEnd",
      title: "Konec akce",
      type: "datetime",
      group: "event",
      description: "Prázdné znamená jednodenní akci.",
      hidden: ({ document }) => document?.kind !== "event",
      validation: (rule) => rule.min(rule.valueOfField("eventStart")),
    }),
    defineField({
      name: "eventTimeNote",
      title: "Čas slovy",
      type: "string",
      group: "event",
      description: "Např. „od 18 hodin“.",
      hidden: ({ document }) => document?.kind !== "event",
    }),
    defineField({
      name: "eventVenue",
      title: "Místo (prostor zámku)",
      type: "reference",
      to: [{ type: "venue" }],
      group: "event",
      hidden: ({ document }) => document?.kind !== "event",
    }),
    defineField({
      name: "eventPlace",
      title: "Místo slovy",
      type: "string",
      group: "event",
      hidden: ({ document }) => document?.kind !== "event",
    }),
    defineField({
      name: "eventPrice",
      title: "Vstupné slovy",
      type: "string",
      group: "event",
      hidden: ({ document }) => document?.kind !== "event",
    }),
    defineField({
      name: "eventTicketUrl",
      title: "Odkaz na vstupenky",
      type: "url",
      group: "event",
      hidden: ({ document }) => document?.kind !== "event",
    }),
    defineField({
      name: "eventStatus",
      title: "Stav",
      type: "string",
      group: "event",
      options: {
        list: [
          { title: "Koná se", value: "scheduled" },
          { title: "Zrušeno", value: "cancelled" },
          { title: "Přesunuto", value: "postponed" },
        ],
        layout: "radio",
      },
      initialValue: "scheduled",
      hidden: ({ document }) => document?.kind !== "event",
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  orderings: [
    {
      title: "Nejnovější",
      name: "newest",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "Podle data akce",
      name: "event",
      by: [{ field: "eventStart", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      kind: "kind",
      language: "language",
      media: "image",
    },
    prepare: ({ title, kind, language, media }) => ({
      title,
      subtitle: `${kind === "event" ? "Akce" : "Aktualita"} · ${language ?? "cs"}`,
      media,
    }),
  },
});

export const fileDocument = defineType({
  name: "fileDocument",
  title: "Dokument ke stažení",
  type: "document",
  fields: [
    localized("title", "Název", "localizedString", { required: "cs" }),
    defineField({
      name: "category",
      title: "Kategorie",
      type: "string",
      options: {
        list: [
          { title: "Závěrečná zpráva", value: "report" },
          { title: "Rozpočet", value: "budget" },
          { title: "Střednědobý výhled", value: "outlook" },
          { title: "Objednávka a ceník", value: "order" },
          { title: "Ostatní", value: "other" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "year", title: "Rok", type: "number" }),
    defineField({
      name: "file",
      title: "Soubor",
      type: "file",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "fileEn", title: "Soubor anglicky", type: "file" }),
    defineField({ name: "fileDe", title: "Soubor německy", type: "file" }),
    defineField({ name: "validUntil", title: "Platí do", type: "date" }),
  ],
  orderings: [
    { title: "Rok", name: "year", by: [{ field: "year", direction: "desc" }] },
  ],
  preview: { select: { title: "title.cs", subtitle: "year" } },
});

export const project = defineType({
  name: "project",
  title: "Dotovaný projekt",
  type: "document",
  fields: [
    localized("title", "Název projektu", "localizedString", { required: "cs" }),
    defineField({ name: "applicant", title: "Žadatel", type: "string" }),
    defineField({
      name: "registrationNumber",
      title: "Registrační číslo",
      type: "string",
    }),
    defineField({
      name: "programme",
      title: "Dotační program",
      type: "string",
    }),
    defineField({
      name: "totalCost",
      title: "Výdaje celkem (Kč)",
      type: "number",
    }),
    defineField({
      name: "eligibleCost",
      title: "Způsobilé výdaje (Kč)",
      type: "number",
    }),
    defineField({
      name: "supportRate",
      title: "Míra podpory (%)",
      type: "number",
    }),
    localized("activities", "Klíčové aktivity", "localizedText", {
      required: "cs",
    }),
    defineField({
      name: "logos",
      title: "Loga",
      type: "array",
      of: [defineArrayMember({ type: "imageWithAlt" })],
    }),
    orderField,
  ],
  orderings: byOrder,
  preview: { select: { title: "title.cs", subtitle: "programme" } },
});

export const person = defineType({
  name: "person",
  title: "Kontaktní osoba",
  type: "document",
  orderings: byOrder,
  fields: [
    defineField({
      name: "name",
      title: "Jméno",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    localized("role", "Funkce", "localizedString"),
    defineField({ name: "phone", title: "Telefon", type: "string" }),
    defineField({
      name: "email",
      title: "E-mail",
      type: "string",
      validation: (rule) => rule.email(),
    }),
    defineField({ name: "photo", title: "Foto", type: "imageWithAlt" }),
    orderField,
  ],
  preview: { select: { title: "name", subtitle: "role.cs", media: "photo" } },
});

export const partner = defineType({
  name: "partner",
  title: "Partner zámku",
  type: "document",
  orderings: byOrder,
  fields: [
    defineField({
      name: "name",
      title: "Název",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    localized("description", "Popis", "localizedText", { required: false }),
    defineField({ name: "url", title: "Web", type: "url" }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      description: "Odkaz s logem dostane jako přístupný název jméno partnera.",
    }),
    defineField({
      name: "showInFooter",
      title: "Zobrazit v patičce",
      type: "boolean",
      initialValue: false,
    }),
    orderField,
  ],
  preview: { select: { title: "name", media: "logo" } },
});

export const mediaMention = defineType({
  name: "mediaMention",
  title: "Zámek v médiích",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Název",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "outlet", title: "Médium", type: "string" }),
    defineField({ name: "date", title: "Datum", type: "date" }),
    defineField({
      name: "url",
      title: "Odkaz",
      type: "url",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "kind",
      title: "Typ",
      type: "string",
      options: {
        list: [
          { title: "Video", value: "video" },
          { title: "Článek", value: "article" },
          { title: "Podcast", value: "podcast" },
          { title: "TV", value: "tv" },
        ],
      },
    }),
  ],
  orderings: [
    {
      title: "Nejnovější",
      name: "newest",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: { select: { title: "title", subtitle: "outlet" } },
});

export const faq = defineType({
  name: "faq",
  title: "Častá otázka",
  type: "document",
  orderings: byOrder,
  fields: [
    localized("question", "Otázka", "localizedString"),
    localized("answer", "Odpověď", "localizedText"),
    orderField,
  ],
  preview: { select: { title: "question.cs" } },
});

export const contentTypes = [
  ...sections,
  page,
  post,
  fileDocument,
  project,
  person,
  partner,
  mediaMention,
  faq,
];
