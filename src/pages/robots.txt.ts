import type { APIRoute } from "astro";
import { robotsTxt } from "@/utils/seo.ts";

/* Everyone may read the site, AI crawlers included; the sitemap lists every page. */
export const GET: APIRoute = ({ site, url }) =>
  new Response(robotsTxt(site ?? url.origin), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
