/** Creates field-name slugs. Used by Choice, Input, Range, Select, and Textarea. */
export function slug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Creates a fragment id from a title in any language: "Zámecká expozice"
 * becomes "zamecka-expozice". Used to link a tour to its own price list.
 */
export function anchor(text: string): string {
  return slug(text.normalize("NFD").replace(/[̀-ͯ]/g, ""));
}
