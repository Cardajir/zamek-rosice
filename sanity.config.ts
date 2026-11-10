import type { ComponentType } from "react";
import { defineConfig } from "sanity";
import { BillIcon } from "@sanity/icons/Bill";
import { CalendarIcon } from "@sanity/icons/Calendar";
import { CaseIcon } from "@sanity/icons/Case";
import { ClockIcon } from "@sanity/icons/Clock";
import { CogIcon } from "@sanity/icons/Cog";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { DownloadIcon } from "@sanity/icons/Download";
import { HeartIcon } from "@sanity/icons/Heart";
import { HelpCircleIcon } from "@sanity/icons/HelpCircle";
import { HomeIcon } from "@sanity/icons/Home";
import { ImagesIcon } from "@sanity/icons/Images";
import { MarkerIcon } from "@sanity/icons/Marker";
import { MenuIcon } from "@sanity/icons/Menu";
import { PlayIcon } from "@sanity/icons/Play";
import { ProjectsIcon } from "@sanity/icons/Projects";
import { TagIcon } from "@sanity/icons/Tag";
import { UsersIcon } from "@sanity/icons/Users";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { documentInternationalization } from "@sanity/document-internationalization";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemas";
import { LANGUAGES } from "./src/sanity/schemas/helpers";
import { SINGLETONS } from "./src/sanity/schemas/singletons";
import { StudioIcon, StudioLayout, studioTheme } from "./src/sanity/studio";

const singletons: readonly string[] = SINGLETONS;

/* Lists under the divider, in the order the site reads them. */
const LISTS: [type: string, title: string, icon: ComponentType][] = [
  ["page", "Stránky", DocumentTextIcon],
  ["post", "Aktuality a akce", CalendarIcon],
  ["tour", "Prohlídky a expozice", MarkerIcon],
  ["ticketList", "Ceníky", BillIcon],
  ["openingPeriod", "Provozní doba", ClockIcon],
  ["venue", "Prostory k pronájmu", CaseIcon],
  ["gallery", "Fotogalerie", ImagesIcon],
  ["fileDocument", "Dokumenty ke stažení", DownloadIcon],
  ["project", "Dotované projekty", ProjectsIcon],
  ["person", "Kontaktní osoby", UsersIcon],
  ["partner", "Partneři", HeartIcon],
  ["mediaMention", "Zámek v médiích", PlayIcon],
  ["faq", "Časté otázky", HelpCircleIcon],
];

const SINGLETON_ITEMS: Record<string, { title: string; icon: ComponentType }> =
  {
    siteSettings: { title: "Nastavení webu", icon: CogIcon },
    navigation: { title: "Navigace", icon: MenuIcon },
    homePage: { title: "Úvodní stránka", icon: HomeIcon },
    visitInfo: { title: "Provoz a oznámení", icon: TagIcon },
  };

export default defineConfig({
  name: "zamek-rosice",
  title: "Zámek Rosice",
  subtitle: "Správa obsahu webu",
  icon: StudioIcon,
  theme: studioTheme,
  studio: { components: { layout: StudioLayout } },
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
                .title(SINGLETON_ITEMS[type]?.title ?? type)
                .icon(SINGLETON_ITEMS[type]?.icon)
                .id(type)
                .child(S.document().schemaType(type).documentId(type)),
            ),
            S.divider(),
            ...LISTS.map(([type, title, icon]) =>
              S.documentTypeListItem(type).title(title).icon(icon),
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
