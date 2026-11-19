import type { APIRoute } from "astro";
import { getNewsLanguages, getSitemapDocuments } from "@/sanity/queries.ts";
import { sitemapEntries, sitemapXml } from "@/utils/seo.ts";

/*
 * Every indexable page in every language, read from Sanity on request: the
 * site is rendered on demand, so a build-time sitemap would know only the
 * pages that live in code.
 */
export const GET: APIRoute = async ({ site, url }) => {
  const [documents, newsLanguages] = await Promise.all([
    getSitemapDocuments(),
    getNewsLanguages(),
  ]);
  const xml = sitemapXml(
    sitemapEntries(documents, newsLanguages),
    site ?? url.origin,
  );
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
