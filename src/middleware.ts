import { defineMiddleware } from "astro:middleware";
import { langFromPath, rewriteTarget } from "@/i18n/routes.ts";
import { redirectFor } from "@/redirects.ts";
import { isLiveHost } from "@/utils/seo.ts";
import {
  PREVIEW_COOKIE,
  previewToken,
  runAsPreview,
} from "@/sanity/preview.ts";

/* Files, the API, the Studio and the image service keep their paths as they are. */
const KEEP_AS_IS =
  /^\/(api|studio|_image|_astro|_server-islands)(\/|$)|\.[a-z0-9]+$/i;

/*
 * The headers every HTML response carries. No content-security policy yet:
 * the Studio and Sanity's visual editing would each need their own allowance.
 */
const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
};

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;
  const method = context.request.method;
  const isPage =
    (method === "GET" || method === "HEAD") && !KEEP_AS_IS.test(pathname);

  if (isPage) {
    /* A retired address answers with where its content went. */
    const retired = redirectFor(pathname);
    if (retired) return context.redirect(`${retired}${search}`, 301);

    /* A page has one address, and it ends in a slash. */
    if (pathname !== "/" && !pathname.endsWith("/")) {
      return context.redirect(`${pathname}/${search}`, 301);
    }
  }

  context.locals.lang = langFromPath(pathname);
  context.locals.pathname = pathname;

  /*
   * A request is a preview when it carries the cookie `/api/preview` set
   * after the Studio proved it was the Studio. It then reads drafts.
   */
  const token = previewToken();
  const preview = Boolean(
    token && context.cookies.get(PREVIEW_COOKIE)?.value === token,
  );
  context.locals.preview = preview;

  /* English and German addresses are rendered by the Czech page file. */
  const target = isPage ? rewriteTarget(pathname) : undefined;
  const response = await runAsPreview(preview, () =>
    target ? next(target) : next(),
  );

  /* A copy of the site on any other host is not for search engines. */
  if (!isLiveHost(context.url.hostname)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  const type = response.headers.get("Content-Type") ?? "";
  if (type.includes("text/html")) {
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      if (!response.headers.has(name)) response.headers.set(name, value);
    }
    /* Rendered on request: a browser may keep a copy but asks before showing it. */
    if (!response.headers.has("Cache-Control")) {
      response.headers.set("Cache-Control", "no-cache");
    }
    /* The Studio's Presentation pane frames the site; nothing else may. */
    if (!pathname.startsWith("/studio")) {
      response.headers.set("X-Frame-Options", "SAMEORIGIN");
    }
  }
  return response;
});
