import {
  createClient,
  type QueryParams,
  type SanityClient,
} from "@sanity/client";
import { apiVersion, dataset, hasSanity, projectId } from "./env.ts";
import { isPreview, secret } from "./preview.ts";

let published: SanityClient | undefined;

/**
 * The client every query goes through, or `undefined` while no Sanity project
 * is configured. Pages are rendered on request, so the API's CDN is off: a
 * visitor sees a change the moment it is published.
 */
export function sanityClient(): SanityClient | undefined {
  if (!hasSanity) return undefined;
  published ??= createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    perspective: "published",
    stega: { enabled: false, studioUrl: "/studio" },
  });
  return published;
}

/**
 * Run a GROQ query and never throw. A failed request is logged and answered
 * with the fallback, so an outage at Sanity shows the static content a page
 * carries instead of an error page.
 *
 * A preview request reads drafts and carries the marks Visual Editing needs.
 */
export async function query<T>(
  groq: string,
  params: QueryParams,
  fallback: T,
): Promise<T> {
  const client = sanityClient();
  if (!client) return fallback;

  const token = isPreview() ? secret("SANITY_API_READ_TOKEN") : undefined;
  const reader = token
    ? client.withConfig({
        token,
        perspective: "drafts",
        stega: { enabled: true },
      })
    : client;

  try {
    return (await reader.fetch<T | null>(groq, params)) ?? fallback;
  } catch (error) {
    console.error("[sanity] query failed:", error);
    return fallback;
  }
}
