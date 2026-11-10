import type { SchemaTypeDefinition } from "sanity";
import { contentTypes } from "./content.ts";
import { objectTypes } from "./objects.ts";
import { singletonTypes } from "./singletons.ts";
import { visitTypes } from "./visit.ts";

/**
 * Every document and object type the Studio knows about. The model and the
 * reasons behind it are in docs/02-sanity-model.md.
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  ...objectTypes,
  ...singletonTypes,
  ...visitTypes,
  ...contentTypes,
];
