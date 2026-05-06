import type { AttributeDefinition } from "../../../types/attribute.js";

/**
 * BOS-specific type extensions for the Schema Management BOS v2 exploration.
 *
 * These types layer analytics/export metadata onto the existing attribute model
 * without modifying the canonical AttributeDefinition type. Non-breaking relative
 * to M2/M3 schema management surfaces.
 */

/**
 * The BOS export scope describes what fidelity of data BOS currently indexes
 * for a given field. Sourced from:
 * https://diligentbrands.atlassian.net/wiki/spaces/~623d69e8761efb0069cebffa/pages/6153994274/Risk+Schema
 */
export type BosScope =
  /** Full string / select value is indexed. */
  | "full_value"
  /** BOS indexes TRUE/FALSE only — whether the field has any value or selection. */
  | "presence_only"
  /** BOS indexes character count at 3-char precision (integer). Not the full text. */
  | "length"
  /** System-computed integer count of linked objects. */
  | "count"
  /** Infrastructure field auto-indexed by BOS. Not user-configurable. */
  | "system";

/**
 * An OOTB attribute enriched with BOS export metadata.
 * Extends AttributeDefinition — no changes to the base type required.
 */
export interface BosOotbField extends AttributeDefinition {
  /** Current BOS export fidelity for this field. */
  bosScope: BosScope;
  /**
   * Planned scope for the next BOS iteration (from the Confluence schema doc).
   * When present and different from bosScope, the badge shows an upgrade arrow.
   */
  bosNextScope?: BosScope;
  /**
   * The actual field key emitted in BOS output (e.g. `metadata.workflow_status`,
   * `name_length`). Shown in the expanded row for developer/analytics reference.
   */
  bosFieldKey: string;
}

/** A system or infrastructure field auto-indexed by BOS — not an AttributeDefinition. */
export interface BosSystemField {
  id: string;
  name: string;
  /** The BOS field key (e.g. `org_id`, `metadata.created_at`). */
  bosFieldKey: string;
  /** Primitive BOS type label (e.g. "integer", "string", "timestamp", "bigint"). */
  bosType: string;
  description: string;
}

/** A system-computed relationship count field. Read-only; admins cannot configure it. */
export interface BosRelationshipField {
  id: string;
  name: string;
  bosFieldKey: string;
  description: string;
}

/**
 * Full BOS v2 schema for an object type.
 * Separates product-facing OOTB attributes from infrastructure and computed fields.
 */
export interface BosV2Schema {
  objectType: string;
  objectName: string;
  objectDescription: string;
  /** Product-facing OOTB attributes with BOS scope annotations. */
  ootbFields: BosOotbField[];
  /** Infrastructure/context fields always auto-indexed by BOS. */
  systemFields: BosSystemField[];
  /** Computed relationship count fields emitted by BOS. */
  relationshipFields: BosRelationshipField[];
}
