/**
 * Addresses that no longer exist and where they lead now, answered with a 301
 * by the middleware. Keys and targets are written without a trailing slash.
 *
 * Two kinds live here: the signpost pages the new menu replaces with
 * dropdowns, and the addresses of the old WordPress site that changed. Old
 * addresses that stayed the same need no entry.
 */
export const REDIRECTS: Record<string, string> = {
  "/navstivte-nas": "/navstivte-nas/prohlidky",
  "/akce-a-moznosti": "/aktuality",
  "/akce": "/aktuality",
  "/o-zamku": "/o-zamku/z-historie",

  "/informace-pro-navstevniky": "/navstivte-nas/prohlidky",
  "/informace-pro-navstevniky/kde-nas-najdete":
    "/navstivte-nas/kde-nas-najdete",
  "/informace-pro-navstevniky/navstevni-rad": "/navstivte-nas/navstevni-rad",
  "/informace-pro-navstevniky/vstupne-a-provozni-doba":
    "/navstivte-nas/vstupne-a-oteviraci-doba",
  "/informace-pro-navstevniky/prohlidkove-okruhy": "/navstivte-nas/prohlidky",
  "/informace-pro-navstevniky/prohlidkove-okruhy/zamecka-expozice":
    "/navstivte-nas/prohlidky",
  "/informace-pro-navstevniky/prohlidkove-okruhy/kryt-civilni-obrany":
    "/navstivte-nas/prohlidky/kryt-civilni-obrany",
  "/informace-pro-navstevniky/prohlidkove-okruhy/stala-vystava-hracek":
    "/navstivte-nas/prohlidky/stala-vystava-hracek",
  "/informace-pro-navstevniky/prohlidkove-okruhy/stala-vystava-meda-a-jan-mladek-zivot-exil-umeni":
    "/navstivte-nas/prohlidky/meda-a-jan-mladek",
  "/informace-pro-navstevniky/prohlidkove-okruhy/stala-vystava-meda-a-jan-mladek":
    "/fotogalerie/meda-a-jan-mladek",
  "/informace-pro-navstevniky/prohlidkove-okruhy/vystava-skla-z-rosicke-sklarny":
    "/navstivte-nas/prohlidky/vystava-rosickeho-skla",
  "/informace-pro-navstevniky/prohlidkove-okruhy/zamecka-zahrada":
    "/navstivte-nas/prohlidky/zamecka-zahrada",

  "/akce-a-moznosti/pronajem-spolecenskeho-prostoru-senk":
    "/akce-a-moznosti/pronajem-senk",

  "/fotogalerie/kryt-co": "/fotogalerie/kryt-civilni-obrany",
  "/fotogalerie/stala-vystava-hracek": "/fotogalerie/vystava-hracek",
  "/fotogalerie/stala-vystava-meda-a-jan-mladek":
    "/fotogalerie/meda-a-jan-mladek",
  "/fotogalerie/vystava-rosickeho-skla": "/fotogalerie/rosicke-sklo",
  "/fotogalerie/zamecky-okruh": "/fotogalerie/zamecke-okruhy",
};

/** Old WordPress posts lived at `/2024/05/slug/`; they are news items now. */
const OLD_POST = /^\/\d{4}\/\d{2}\/([^/]+)$/;

/** Where a retired address leads, or `undefined` when the address is not retired. */
export function redirectFor(pathname: string): string | undefined {
  const bare = `/${pathname.replace(/^\/+|\/+$/g, "")}`;
  const post = bare.match(OLD_POST)?.[1];
  const target = REDIRECTS[bare] ?? (post ? `/aktuality/${post}` : undefined);
  return target && target !== bare ? `${target}/` : undefined;
}
