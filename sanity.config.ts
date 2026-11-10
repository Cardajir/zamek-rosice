import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { documentInternationalization } from "@sanity/document-internationalization";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemas";
import { LANGUAGES } from "./src/sanity/schemas/helpers";
import { SINGLETONS } from "./src/sanity/schemas/singletons";

const singletons: readonly string[] = SINGLETONS;

/* Lists under the divider, in the order the site reads them. */
const LISTS: [type: string, title: string][] = [
  ["page", "Stránky"],
  ["post", "Aktuality a akce"],
  ["tour", "Prohlídky a expozice"],
  ["ticketList", "Ceníky"],
  ["openingPeriod", "Provozní doba"],
  ["venue", "Prostory k pronájmu"],
  ["gallery", "Fotogalerie"],
  ["fileDocument", "Dokumenty ke stažení"],
  ["project", "Dotované projekty"],
  ["person", "Kontaktní osoby"],
  ["partner", "Partneři"],
  ["mediaMention", "Zámek v médiích"],
  ["faq", "Časté otázky"],
];

const SINGLETON_TITLES: Record<string, string> = {
  siteSettings: "Nastavení webu",
  navigation: "Navigace",
  homePage: "Úvodní stránka",
  visitInfo: "Provoz a oznámení",
};

export default defineConfig({
  name: "zamek-rosice",
  title: "Zámek Rosice",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Obsah")
          .items([
            ...singletons.map((type) =>
              S.listItem()
                .title(SINGLETON_TITLES[type] ?? type)
                .id(type)
                .child(S.document().schemaType(type).documentId(type)),
            ),
            S.divider(),
            ...LISTS.map(([type, title]) =>
              S.documentTypeListItem(type).title(title),
            ),
          ]),
    }),
    /* Long texts with their own address get one document per language. */
    documentInternationalization({
      supportedLanguages: LANGUAGES.map(({ id, title }) => ({ id, title })),
      schemaTypes: ["page", "post"],
    }),
    presentationTool({
      previewUrl: {
        previewMode: {
          enable: "/api/preview",
          disable: "/api/preview/disable",
        },
      },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  schema: {
    types: schemaTypes,
    /* A singleton is opened from the list, never created a second time. */
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletons.includes(schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) =>
      singletons.includes(schemaType)
        ? actions.filter(
            ({ action }) => action !== "duplicate" && action !== "delete",
          )
        : actions,
  },
});
