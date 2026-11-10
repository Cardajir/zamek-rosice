import type { Lang } from "./consts.ts";

/** Page metadata for `BaseHead` and layouts. */
export interface SeoProps {
  /** Page title. The site name is appended. */
  title?: string;
  /** Page and social description. Defaults to `SITE_DESCRIPTION`. */
  description?: string;
  /** Social image. Defaults to `/og-image.jpg`. */
  image?: string;
  /** Open Graph type. */
  type?: "website" | "article";
  /** Override `NOINDEX_ROUTES` for this page's robots tag. */
  noindex?: boolean;
  /** This page in every language it exists in, for `hreflang`. */
  alternates?: { lang: Lang; path: string }[];
}
