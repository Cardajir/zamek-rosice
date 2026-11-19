import type { APIRoute } from "astro";

/* The old WordPress site's sitemap address, still known to search engines. */
export const GET: APIRoute = ({ redirect }) => redirect("/sitemap.xml", 301);
