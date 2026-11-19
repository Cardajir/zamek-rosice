import type { APIRoute } from "astro";
import { llmsText } from "@/utils/llms.ts";

/* `/llms.txt` with the full text of the tours and pages. */
export const GET: APIRoute = async () =>
  new Response(await llmsText({ full: true }), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
