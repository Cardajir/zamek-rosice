import type { APIRoute } from "astro";
import { validatePreviewUrl } from "@sanity/preview-url-secret";
import { sanityClient } from "@/sanity/client.ts";
import { PREVIEW_COOKIE, previewToken, secret } from "@/sanity/preview.ts";

/*
 * Where the Studio's Presentation tool sends the browser to start a preview.
 * The URL carries a secret the Studio wrote into the dataset moments ago;
 * only once that is checked against the dataset does the preview cookie get set.
 */
export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const client = sanityClient();
  const token = previewToken();
  const readToken = secret("SANITY_API_READ_TOKEN");
  if (!client || !token || !readToken) {
    return new Response("Preview is not configured.", { status: 503 });
  }

  const { isValid, redirectTo = "/" } = await validatePreviewUrl(
    client.withConfig({ token: readToken }),
    request.url,
  );
  if (!isValid) return new Response("Invalid preview secret.", { status: 401 });

  cookies.set(PREVIEW_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: new URL(request.url).protocol === "https:",
  });
  return redirect(redirectTo.startsWith("/") ? redirectTo : "/", 307);
};
