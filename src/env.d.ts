declare namespace App {
  interface Locals {
    /** The language of the address the visitor asked for. */
    lang: import("./consts.ts").Lang;
    /** The address the visitor asked for, before any rewrite onto a Czech page file. */
    pathname: string;
    /** Whether this request is the Studio previewing drafts. */
    preview: boolean;
    /** What every page shares, loaded once per request. */
    shell?: Promise<import("./sanity/queries.ts").Shell>;
  }
}
