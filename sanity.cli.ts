import { existsSync } from "node:fs";
import { defineCliConfig } from "sanity/cli";

/*
 * The CLI runs outside Vite, so `.env` is read here by hand. What it needs to
 * know for `sanity cors`, `sanity exec` and the like.
 */
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineCliConfig({
  api: {
    projectId: process.env.PUBLIC_SANITY_PROJECT_ID ?? "",
    dataset: process.env.PUBLIC_SANITY_DATASET || "production",
  },
});
