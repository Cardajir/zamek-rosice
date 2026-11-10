import type { APIRoute } from "astro";
import { PREVIEW_COOKIE } from "@/sanity/preview.ts";

/* The way out of a preview: cookie gone, back to the published page. */
export const GET: APIRoute = ({ request, cookies, redirect }) => {
  cookies.delete(PREVIEW_COOKIE, { path: "/" });
  const back = new URL(request.url).searchParams.get("redirect") ?? "/";
  return redirect(
    back.startsWith("/") && !back.startsWith("//") ? back : "/",
    307,
  );
};
