import type { AttributeDefinition } from "../types/attribute.js";

/** Visualization filter for the destination record form (prototype). */
export type DestinationFieldVisibilityMode = "all" | "hideDeprecated" | "deprecatedOnly";

export function filterAttributesByVisibilityMode(
  attrs: AttributeDefinition[],
  mode: DestinationFieldVisibilityMode,
): AttributeDefinition[] {
  switch (mode) {
    case "hideDeprecated":
      return attrs.filter((a) => a.lifecycleStatus !== "deprecated");
    case "deprecatedOnly":
      return attrs.filter((a) => a.lifecycleStatus === "deprecated");
    default:
      return attrs;
  }
}

/**
 * Responsive column span for destination preview form fields (md+), inspired by Risk manager
 * two-column rows for short inputs. `xs` is always full width in the page.
 *
 * Full row: long text, attachments, multi-value pickers that need horizontal space.
 * Half row: single-line text, single select, user, dates, numbers, boolean, currency, etc.
 */
export function destinationAttributeGridMd(def: AttributeDefinition): 6 | 12 {
  switch (def.type) {
    case "longText":
    case "attachment":
    case "multiSelect":
    case "users":
      return 12;
    default:
      return 6;
  }
}
