import type { Lang } from "@/consts.ts";
import { routePath } from "@/i18n/routes.ts";
import { ui } from "@/i18n/ui.ts";

/** Marks the events listing, or an album from an event, as the page on screen. */
export const EVENTS = Symbol("events");

/**
 * The gallery's album list: the castle's albums, then the albums from events
 * as one more entry. Each link lands on the photographs, past the list.
 */
export function galleryNav(
  albums: { title: string; slug: string }[],
  lang: Lang,
  current: string | typeof EVENTS | undefined,
): { label: string; href: string; current: boolean }[] {
  return [
    ...albums.map((item, index) => ({
      label: item.title,
      /* The first album is the gallery's front page. */
      href: `${
        index === 0
          ? routePath("gallery", lang)
          : routePath("gallery", lang, item.slug)
      }#fotky`,
      current: item.slug === current,
    })),
    {
      label: ui(lang).galleryEvents,
      href: `${routePath("galleryEvents", lang)}#fotky`,
      current: current === EVENTS,
    },
  ];
}
