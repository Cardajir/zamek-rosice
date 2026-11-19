import type { Lang } from "./consts.ts";
import type { Node, PageType, SocialImage } from "./utils/seo.ts";

/** Page metadata for `BaseHead` and layouts. */
export interface SeoProps {
  /** Page title. The site name is appended while the two fit a search result. */
  title?: string;
  /** Page and social description. Defaults to the home page's. Cut at 160 characters. */
  description?: string;
  /**
   * Social image, 1200 × 630. Defaults to the subpage's own photograph, or
   * the castle's front in `/og-image.jpg`.
   */
  image?: SocialImage;
  /** Open Graph type. */
  type?: "website" | "article";
  /** For an article: when it was published and last changed, ISO 8601. */
  publishedTime?: string;
  modifiedTime?: string;
  /** Override `NOINDEX_ROUTES` for this page's robots tag. */
  noindex?: boolean;
  /** This page in every language it exists in, for `hreflang`. */
  alternates?: { lang: Lang; path: string }[];
  /** The kind of page for structured data. Defaults to `WebPage`. */
  pageType?: PageType;
  /**
   * The pages between the home page and this one, for the breadcrumb in
   * structured data. The home page and this page are added around them.
   */
  breadcrumbs?: { name: string; path: string }[];
  /** Further structured data about what the page shows: an event, an article. */
  schema?: Node[];
}
