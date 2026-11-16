import { sanityProjectId } from "../consts.ts";

/**
 * Sanity connection details. The project id and dataset are public: they ship
 * in the client bundle either way. A clone without a `.env` uses the castle's
 * own project; `PUBLIC_SANITY_PROJECT_ID=none` runs the site without a CMS,
 * and then the Studio is not mounted.
 *
 * Vite fills `import.meta.env`; the Sanity CLI runs outside Vite and reads
 * `process.env` instead.
 */
const fromVite =
  (import.meta as { env?: Record<string, string | undefined> }).env ?? {};
const fromNode =
  typeof process !== "undefined"
    ? (process.env as Record<string, string | undefined>)
    : {};

const read = (name: string) => fromVite[name] || fromNode[name] || "";

export const projectId = sanityProjectId(read("PUBLIC_SANITY_PROJECT_ID"));

export const dataset = read("PUBLIC_SANITY_DATASET") || "production";

/** Whether a Sanity project is configured at all. */
export const hasSanity = projectId !== "";

/**
 * Pinning the API to a date freezes its behaviour, so a later Sanity release
 * cannot change what a query returns. Move it deliberately.
 */
export const apiVersion = "2026-11-01";
