// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import { existsSync } from "node:fs";
import { loadEnv } from "vite";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import sanity from "@sanity/astro";
import { SITE_URL } from "./src/consts.ts";
import { isNoindexRoute } from "./src/utils/seo.ts";

/*
 * The config runs before Vite fills `import.meta.env`, so the Sanity project
 * is read from `.env` here by hand. Without one the site builds and runs with
 * no CMS, and the Studio and its React runtime are left out.
 */
const env = {
  ...loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "PUBLIC_"),
  ...process.env,
};
const projectId = env.PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = env.PUBLIC_SANITY_DATASET || "production";

/*
 * On Windows the Studio integration's dev-only module dedupe resolves the
 * bare `sanity` import to its package.json, and the Studio never boots.
 */
if (process.platform === "win32") {
  process.env.SANITY_ASTRO_DISABLE_MODULE_DEDUPE = "1";
}

/*
 * Romie is a commercial face and is not committed. Drop the two files into
 * src/assets/fonts and the headings switch over; without them the build
 * runs on the serif fallback declared in base.css.
 */
const ROMIE = "./src/assets/fonts/romie-medium.woff2";
const ROMIE_ITALIC = "./src/assets/fonts/romie-medium-italic.woff2";
const hasRomie = existsSync(ROMIE) && existsSync(ROMIE_ITALIC);

/*
 * Typed loosely: the font list's type is a union over providers that a
 * conditional entry cannot be narrowed to from a .mjs file.
 */
/** @type {any[]} */
const romie = hasRomie
  ? [
      {
        name: "Romie",
        cssVariable: "--font-romie",
        provider: fontProviders.local(),
        fallbacks: ["serif"],
        options: {
          variants: [
            { weight: 500, style: "normal", src: [ROMIE] },
            { weight: 500, style: "italic", src: [ROMIE_ITALIC] },
          ],
        },
      },
    ]
  : [];

export default defineConfig({
  site: SITE_URL,
  /*
   * Rendered on request by a Cloudflare Worker, so a visitor sees content the
   * moment it is published and "open today" is always today. The Worker has
   * no sharp: local images go through the Cloudflare Images binding.
   */
  output: "server",
  adapter: cloudflare({ imageService: "cloudflare-binding" }),
  /* No sign-ins, no carts: nothing to keep between requests. */
  session: false,
  integrations: [
    ...(projectId
      ? [
          sanity({
            projectId,
            dataset,
            apiVersion: "2026-11-01",
            useCdn: false,
            studioBasePath: "/studio",
            studioRouterHistory: "browser",
            stega: { studioUrl: "/studio" },
          }),
          react(),
        ]
      : []),
    sitemap({
      filter: (page) => !isNoindexRoute(new URL(page).pathname),
    }),
  ],
  fonts: [
    {
      /* Body face. OFL licensed, fetched at build time and served from this origin. */
      name: "Manrope",
      cssVariable: "--font-manrope",
      provider: fontProviders.fontsource(),
      weights: [400, 500, 600, 700],
      styles: ["normal"],
      subsets: ["latin", "latin-ext"],
    },
    ...romie,
  ],
  /* Photos from the CMS come from Sanity's own CDN; Astro must be told the host. */
  image: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  vite: {
    build: { cssTarget: "safari15.4" },
    /* Lets BaseHead preload Romie only when the files are there. */
    define: { "import.meta.env.HAS_ROMIE": JSON.stringify(hasRomie) },
  },
});
