import type { APIRoute } from "astro";
import { llmsText } from "@/utils/llms.ts";

/* The castle and the site in brief, for AI assistants (https://llmstxt.org). */
export const GET: APIRoute = async () =>
  new Response(await llmsText({ full: false }), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
