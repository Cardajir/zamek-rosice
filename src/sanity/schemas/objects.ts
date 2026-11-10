import { defineArrayMember, defineField, defineType } from "sanity";
import { LANGUAGES, localized, requireCs } from "./helpers.ts";

const perLanguage = (type: string, extra: Record<string, unknown> = {}) =>
  LANGUAGES.map(({ id, title }) =>
    defineField({ name: id, title, type, ...extra }),
  );

export const localizedString = defineType({
  name: "localizedString",
  title: "Text v jazycích",
  type: "object",
  fields: perLanguage("string"),
  options: { columns: 1 },
});

export const localizedText = defineType({
  name: "localizedText",
  title: "Delší text v jazycích",
  type: "object",
  fields: perLanguage("text", { rows: 3 }),
});

export const localizedSlug = defineType({
  name: "localizedSlug",
  title: "Adresa v jazycích",
  type: "object",
  fields: LANGUAGES.map(({ id, title }) =>
    defineField({
      name: id,
      title,
      type: "slug",
      options: {
        maxLength: 96,
        source: (doc) => {
          const name = (doc.title ?? doc.name) as
            Record<string, string> | undefined;
          return name?.[id] ?? "";
        },
      },
    }),
  ),
});

/**
 * Formatted text. There is no h1 on purpose: a page has exactly one, and it
 * is the page's title.
 */
export const blockContent = defineType({
  name: "blockContent",
  title: "Formátovaný text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Odstavec", value: "normal" },
        { title: "Nadpis 2", value: "h2" },
        { title: "Nadpis 3", value: "h3" },
        { title: "Nadpis 4", value: "h4" },
        { title: "Citace", value: "blockquote" },
      ],
      lists: [
        { title: "Odrážky", value: "bullet" },
        { title: "Číslování", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Tučně", value: "strong" },
          { title: "Kurzíva", value: "em" },
        ],
        annotations: [
          defineArrayMember({
            name: "link",
            title: "Odkaz",
            type: "object",
            fields: [
              defineField({
                name: "href",
                title: "Adresa",
                type: "url",
                validation: (rule) =>
                  rule.required().uri({
                    allowRelative: true,
                    scheme: ["https", "http", "mailto", "tel"],
                  }),
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({ type: "imageWithAlt" }),
  ],
});

export const localizedBlockContent = defineType({
  name: "localizedBlockContent",
  title: "Formátovaný text v jazycích",
  type: "object",
  fields: perLanguage("blockContent"),
});

/**
 * A photograph. The alternative text is required: an image without one is
 * invisible to a screen reader, and a link made only of that image has no name.
 */
export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Obrázek",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Popis obrázku (alt)",
      type: "localizedString",
      description: "Co je na obrázku, jednou větou. Čte ho čtečka obrazovky.",
      validation: (rule) => rule.custom(requireCs),
    }),
    defineField({ name: "caption", title: "Popisek", type: "localizedString" }),
    defineField({ name: "credit", title: "Autor", type: "string" }),
  ],
});

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "metaTitle",
      title: "Titulek",
      type: "localizedString",
      description: "Když zůstane prázdný, použije se název.",
    }),
    defineField({
      name: "metaDescription",
      title: "Popis",
      type: "localizedText",
      description: "Do 160 znaků.",
    }),
    defineField({
      name: "ogImage",
      title: "Obrázek pro sdílení",
      type: "image",
    }),
    defineField({
      name: "noindex",
      title: "Skrýt před vyhledávači",
      type: "boolean",
    }),
  ],
});

/** Where a link leads: a document of the site, an address, a file, a phone or an e-mail. */
export const link = defineType({
  name: "link",
  title: "Odkaz",
  type: "object",
  fields: [
    localized("label", "Text odkazu", "localizedString"),
    defineField({
      name: "kind",
      title: "Druh",
      type: "string",
      options: {
        list: [
          { title: "Stránka webu", value: "internal" },
          { title: "Pevná stránka (trasa v kódu)", value: "route" },
          { title: "Externí adresa", value: "external" },
          { title: "Soubor", value: "file" },
        ],
        layout: "radio",
      },
      initialValue: "internal",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "reference",
      title: "Stránka",
      type: "reference",
      to: [
        { type: "page" },
        { type: "tour" },
        { type: "venue" },
        { type: "gallery" },
        { type: "post" },
      ],
      description: "U stránek a aktualit vždy česká verze.",
      hidden: ({ parent }) => parent?.kind !== "internal",
    }),
    defineField({
      name: "route",
      title: "Pevná stránka",
      type: "string",
      options: {
        list: [
          { title: "Úvod", value: "home" },
          { title: "Prohlídkové okruhy", value: "tours" },
          { title: "Vstupné a provozní doba", value: "admission" },
          { title: "Kde nás najdete", value: "directions" },
          { title: "Aktuality", value: "news" },
          { title: "Fotogalerie", value: "gallery" },
          { title: "Zámek v médiích", value: "media" },
          { title: "Partneři zámku", value: "partners" },
          { title: "Kontakty", value: "contact" },
          { title: "Povinné a statutární informace", value: "statutory" },
        ],
      },
      hidden: ({ parent }) => parent?.kind !== "route",
    }),
    defineField({
      name: "url",
      title: "Adresa",
      type: "url",
      validation: (rule) =>
        rule.uri({ scheme: ["https", "http", "mailto", "tel"] }),
      hidden: ({ parent }) => parent?.kind !== "external",
    }),
    defineField({
      name: "file",
      title: "Soubor",
      type: "reference",
      to: [{ type: "fileDocument" }],
      hidden: ({ parent }) => parent?.kind !== "file",
    }),
  ],
  preview: { select: { title: "label.cs", subtitle: "kind" } },
});

export const objectTypes = [
  localizedString,
  localizedText,
  localizedSlug,
  blockContent,
  localizedBlockContent,
  imageWithAlt,
  seo,
  link,
];
