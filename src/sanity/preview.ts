import { AsyncLocalStorage } from "node:async_hooks";
import { getSecret } from "astro:env/server";

/**
 * Whether the request being answered is a preview: the Studio's Presentation
 * tool looking at the site with drafts. Decided once per request by the
 * middleware and read wherever a query is made. Request-scoped, so two
 * requests served at once never see each other's answer.
 */
const store = new AsyncLocalStorage<{ preview: boolean }>();

export const isPreview = () => store.getStore()?.preview === true;

export const runAsPreview = <T>(preview: boolean, fn: () => T | Promise<T>) =>
  store.run({ preview }, fn);

/** The cookie that carries the preview. */
export const PREVIEW_COOKIE = "sanity-preview";

/**
 * A secret from the environment, read at run time. Never through
 * `import.meta.env`: the bundler would inline the build machine's value into
 * the Worker and the host's own secrets would go unread.
 */
export const secret = (name: string): string | undefined =>
  getSecret(name) || undefined;

/** What the preview cookie has to carry. Without it there is no preview. */
export const previewToken = () => secret("PREVIEW_SECRET");
