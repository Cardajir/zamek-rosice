/**
 * A photograph from Sanity at a width, in the best format the browser takes.
 * Sanity's own CDN does the resizing, so an editor's 6 MB upload never
 * reaches a visitor as it is.
 */
export function sized(url: string, width: number): string {
  if (!url.startsWith("https://cdn.sanity.io/images/")) return url;
  return `${url}?w=${width}&fit=max&auto=format&q=75`;
}

/** Width and height scaled down to a width, keeping the proportions. */
export function scaled(
  image: { width?: number; height?: number },
  width: number,
): { width?: number; height?: number } {
  if (!image.width || !image.height) return {};
  const target = Math.min(width, image.width);
  return {
    width: target,
    height: Math.round((image.height / image.width) * target),
  };
}
