import { defineField } from "sanity";

/** The languages content is written in. Czech is the source. */
export const LANGUAGES = [
  { id: "cs", title: "Čeština" },
  { id: "en", title: "English" },
  { id: "de", title: "Deutsch" },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]["id"];

const isEmpty = (value: unknown): boolean => {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object" && "current" in value)
    return isEmpty(value.current);
  return false;
};

const missing = (value: unknown, languages: readonly LanguageId[]) => {
  const localized = (value ?? {}) as Partial<Record<LanguageId, unknown>>;
  return languages.filter((id) => isEmpty(localized[id]));
};

/** Every language filled in. */
export const requireAll = (value: unknown) => {
  const gaps = missing(value, ["cs", "en", "de"]);
  return gaps.length === 0 || `Chybí překlad: ${gaps.join(", ")}`;
};

/** Czech filled in. */
export const requireCs = (value: unknown) =>
  missing(value, ["cs"]).length === 0 || "Chybí český text";

type LocalizedType =
  | "localizedString"
  | "localizedText"
  | "localizedSlug"
  | "localizedBlockContent";

interface LocalizedOptions {
  /**
   * `all` blocks publishing until cs, en and de are filled. `cs` blocks on
   * Czech and only warns about the others. `false` leaves the field optional.
   */
  required?: "all" | "cs" | false;
  description?: string;
  group?: string;
}

/** A field written once per language inside one document. */
export const localized = (
  name: string,
  title: string,
  type: LocalizedType,
  { required = "all", description, group }: LocalizedOptions = {},
) =>
  defineField({
    name,
    title,
    type,
    description,
    group,
    validation: (rule) => {
      if (required === "all") return rule.custom(requireAll);
      if (required === "cs")
        return [rule.custom(requireCs), rule.custom(requireAll).warning()];
      return rule;
    },
  });

/** A manual position in a list, lowest first. */
export const orderField = defineField({
  name: "order",
  title: "Pořadí",
  type: "number",
  description: "Nižší číslo je výš.",
  initialValue: 100,
});

/** Sorting a document list by `order` in the Studio. */
export const byOrder = [
  {
    title: "Pořadí",
    name: "order",
    by: [{ field: "order", direction: "asc" as const }],
  },
];
