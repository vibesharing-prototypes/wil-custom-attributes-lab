import type { AttributeDefinition } from "../../../types/attribute.js";
import type { AuditLogEntry } from "../types.js";
import type { BosOotbField, BosRelationshipField, BosSystemField, BosV2Schema } from "./types.js";

/**
 * BOS v2 Risk schema — enriched with BOS export scope annotations.
 *
 * Sources:
 *   - Confluence Risk Schema: https://diligentbrands.atlassian.net/wiki/spaces/~623d69e8761efb0069cebffa/pages/6153994274/Risk+Schema
 *   - ERM Baseline Configuration (last updated Jan 28, 2026)
 *   - ERM Baseline Configuration Updates H2/2025 (last updated Feb 13, 2026)
 *
 * Changes vs BOS v1 / current riskSchema:
 *   - workflow_status added as OOTB (was missing entirely)
 *   - Information Security added to risk_category options (21 total, was 20)
 *   - risk_owner changed from `user` (single) to `users` (multi) to match BOS array<string>
 *   - System fields (org_id, region, product_tier, metadata.*) modeled as BosSystemField
 *   - Relationship count fields modeled as BosRelationshipField
 *   - All product OOTB fields annotated with bosScope + bosNextScope + bosFieldKey
 */

const SCORE_OPTIONS = [
  { id: "very_low", label: "Very low" },
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "very_high", label: "Very high" },
];

export const bosV2Schema: BosV2Schema = {
  objectType: "risk",
  objectName: "Risk",
  objectDescription:
    "A potential event or condition that could negatively affect organizational objectives. Risks are assessed, scored, owned, and linked to controls, mitigation plans, and processes across the GRC suite. Managed by the Risk Manager and Risk Essentials toolkits.",

  ootbFields: [
    // ── Workflow ──────────────────────────────────────────────────────────────
    {
      id: "workflow_status",
      name: "Workflow status",
      type: "singleSelect",
      isOotb: true,
      bosScope: "presence_only",
      bosNextScope: "full_value",
      bosFieldKey: "metadata.workflow_status",
      options: [
        { id: "unassessed", label: "Unassessed" },
        { id: "in_progress", label: "In progress" },
        { id: "in_review", label: "In review" },
        { id: "assessed", label: "Assessed" },
        { id: "draft", label: "Draft" },
        { id: "identification", label: "Identification" },
        { id: "analysis", label: "Analysis" },
        { id: "assessment", label: "Assessment" },
        { id: "response", label: "Response" },
        { id: "approval", label: "Approval" },
        { id: "monitoring", label: "Monitoring" },
        { id: "archive", label: "Archive" },
      ],
      semanticDescription:
        "Current stage in the risk lifecycle workflow. Used for filtering, routing, and portfolio-level status reporting. One of the highest-value fields for operational dashboards.",
    },

    // ── Overview ──────────────────────────────────────────────────────────────
    {
      id: "name",
      name: "Name",
      type: "text",
      isOotb: true,
      bosScope: "length",
      bosNextScope: "full_value",
      bosFieldKey: "name_length",
      semanticDescription:
        "The title of this risk record. Should be concise and specific enough to distinguish the risk within a portfolio. Required before the record can be moved out of Draft status. BOS currently indexes character count (3-char precision); full-text search is planned for the next iteration.",
    },
    {
      id: "risk_description",
      name: "Risk description",
      type: "longText",
      isOotb: true,
      bosScope: "length",
      bosNextScope: "full_value",
      bosFieldKey: "description_length",
      semanticDescription:
        "Plain-language summary of the risk, its drivers, and potential impact on the organization. Planned display rename: 'Description'. BOS currently indexes character count (3-char precision).",
    },
    {
      id: "risk_category",
      name: "Risk category",
      type: "singleSelect",
      isOotb: true,
      bosScope: "presence_only",
      bosNextScope: "full_value",
      bosFieldKey: "risk_category",
      options: [
        { id: "acquisition", label: "Acquisition" },
        { id: "artificial_intelligence", label: "Artificial Intelligence" },
        { id: "brand_reputation", label: "Brand & Reputation Relevance & Execution" },
        { id: "business_industry", label: "Business and Industry" },
        { id: "business_continuity", label: "Business Continuity" },
        { id: "company_culture", label: "Company Culture" },
        { id: "competitor", label: "Competitor" },
        { id: "customer_retention", label: "Customer Retention" },
        { id: "economic", label: "Economic" },
        { id: "financial", label: "Financial" },
        { id: "fraud", label: "Fraud" },
        { id: "growth", label: "Growth" },
        { id: "human_resource", label: "Human Resource" },
        { id: "information_security", label: "Information Security" },
        { id: "it_infosec", label: "IT/Infosec" },
        { id: "legislative_regulatory", label: "Legislative and Regulatory" },
        { id: "market_expansion", label: "Market Expansion" },
        { id: "operational", label: "Operational" },
        { id: "process_efficiency", label: "Process or Operational Efficiency" },
        { id: "regulatory_compliance", label: "Regulatory/Compliance" },
        { id: "third_party", label: "Third Party" },
      ],
      semanticDescription:
        "Primary classification used for portfolio-level reporting and ownership routing. Planned display rename: 'Category'. 21 options — note that 'Information Security' and 'IT/Infosec' are distinct categories in BOS.",
    },
    {
      id: "risk_id",
      name: "Risk ID",
      type: "text",
      isOotb: true,
      bosScope: "length",
      bosNextScope: "full_value",
      bosFieldKey: "risk_id_length",
      semanticDescription:
        "Unique identifier for this risk record. Used for cross-referencing in reports, audits, and control mappings (e.g. 'RISK-2024-001'). BOS currently indexes character count (3-char precision).",
    },
    {
      id: "risk_owner",
      name: "Risk owner",
      // Changed from "user" (single) to "users" (multi) to align with BOS array<string>
      type: "users",
      isOotb: true,
      bosScope: "presence_only",
      bosNextScope: "full_value",
      bosFieldKey: "risk_owner",
      semanticDescription:
        "Accountable individual(s) or group(s) responsible for monitoring and responding to this risk. BOS models this as array<string> and supports multiple owners and groups. Planned display rename: 'Owner'.",
    },

    // ── Score ─────────────────────────────────────────────────────────────────
    {
      id: "risk_impact",
      name: "Impact",
      type: "singleSelect",
      isOotb: true,
      bosScope: "presence_only",
      bosNextScope: "full_value",
      bosFieldKey: "impact",
      options: SCORE_OPTIONS,
      semanticDescription:
        "Severity of consequences if this risk materializes, assessed before controls are applied. Planned display rename: 'Impact (inherent)'. Used together with Likelihood to derive the Inherent Risk Score.",
    },
    {
      id: "likelihood",
      name: "Likelihood",
      type: "singleSelect",
      isOotb: true,
      bosScope: "presence_only",
      bosNextScope: "full_value",
      bosFieldKey: "likelihood",
      options: SCORE_OPTIONS,
      semanticDescription:
        "Probability that this risk will occur, assessed before controls are applied. Planned display rename: 'Likelihood (inherent)'. Used together with Impact to derive the Inherent Risk Score.",
    },
    {
      id: "inherent_risk_score",
      name: "Inherent risk score",
      type: "singleSelect",
      isOotb: true,
      bosScope: "presence_only",
      bosNextScope: "full_value",
      bosFieldKey: "inherent_risk_score",
      options: SCORE_OPTIONS,
      semanticDescription:
        "Overall risk level before any controls are applied, derived from Likelihood × Impact. Planned display rename: 'Inherent Risk Rating'. Used to prioritize mitigation effort and compare risks across the portfolio.",
    },
    {
      id: "residual_risk_score",
      name: "Residual risk score",
      type: "singleSelect",
      isOotb: true,
      bosScope: "presence_only",
      bosNextScope: "full_value",
      bosFieldKey: "residual_risk_score",
      options: SCORE_OPTIONS,
      semanticDescription:
        "Remaining risk level after controls and mitigations have been applied. Planned display rename: 'Residual Risk Rating'. Compared against Inherent Risk Score to assess control effectiveness.",
    },

    // ── Attachments ───────────────────────────────────────────────────────────
    {
      id: "risk_attachment",
      name: "Attachment",
      type: "attachment",
      attachmentMode: "multiple",
      isOotb: true,
      // Not currently included in the BOS schema — presence_only as a conservative default
      bosScope: "presence_only",
      bosFieldKey: "—",
      semanticDescription:
        "Documents that support or substantiate this risk record, such as audit findings, incident reports, regulatory notices, or risk assessments. Not currently included in the BOS schema.",
    },
  ],

  // ── System & metadata fields ───────────────────────────────────────────────
  // Infrastructure fields always auto-indexed by BOS. Not user-configurable.
  systemFields: [
    {
      id: "org_id",
      name: "Org ID",
      bosFieldKey: "org_id",
      bosType: "integer",
      description: "Organization identifier. Context field auto-populated for every record. Example: 100.",
    },
    {
      id: "region",
      name: "Region",
      bosFieldKey: "region",
      bosType: "string",
      description: "AWS region where the record is stored. Example: us-west-2.",
    },
    {
      id: "product_tier",
      name: "Product tier",
      bosFieldKey: "product_tier",
      bosType: "string",
      description: "Product tier associated with this record. Example: Risk Manager.",
    },
    {
      id: "metadata_id",
      name: "ID",
      bosFieldKey: "metadata.id",
      bosType: "bigint",
      description: "Unique risk record identifier in the platform database. Example: 12345.",
    },
    {
      id: "created_at",
      name: "Created at",
      bosFieldKey: "metadata.created_at",
      bosType: "timestamp",
      description: "Record creation time, rounded to hourly precision. Example: 2024-01-15 14:00:00.",
    },
    {
      id: "updated_at",
      name: "Last updated at",
      bosFieldKey: "metadata.updated_at",
      bosType: "timestamp",
      description: "Last update time, rounded to hourly precision. Example: 2024-01-16 10:00:00.",
    },
    {
      id: "created_by",
      name: "Created by",
      bosFieldKey: "metadata.created_by",
      bosType: "string",
      description: "Hashed user ID of the creator. Anonymized for privacy in BOS. Example: a1b2c3d4e5f6…",
    },
    {
      id: "updated_by",
      name: "Last updated by",
      bosFieldKey: "metadata.updated_by",
      bosType: "string",
      description: "Hashed user ID of the last editor. Anonymized for privacy in BOS. Example: 9z8y7x6w5v4u…",
    },
  ],

  // ── Relationship count fields ──────────────────────────────────────────────
  // System-computed integer fields. BOS indexes how many linked objects exist.
  relationshipFields: [
    {
      id: "assets_count",
      name: "Assets",
      bosFieldKey: "assets_count",
      description: "Number of linked assets.",
    },
    {
      id: "controls_count",
      name: "Controls",
      bosFieldKey: "controls_count",
      description: "Number of linked controls.",
    },
    {
      id: "risk_assessments_count",
      name: "Risk assessments",
      bosFieldKey: "risk_assessments_count",
      description: "Number of linked risk assessments.",
    },
    {
      id: "risks_count",
      name: "Risks",
      bosFieldKey: "risks_count",
      description: "Number of cross-linked risks.",
    },
    {
      id: "objectives_count",
      name: "Objectives",
      bosFieldKey: "objectives_count",
      description: "Number of linked objectives.",
    },
    {
      id: "processes_count",
      name: "Processes",
      bosFieldKey: "processes_count",
      description: "Number of linked processes.",
    },
    {
      id: "risk_mitigations_count",
      name: "Risk mitigations",
      bosFieldKey: "risk_mitigations_count",
      description: "Number of linked risk mitigations.",
    },
  ],
};

/**
 * Pre-seeded custom attributes for the BOS v2 prototype.
 * Reuses the same set as the BOS v1 page for consistency.
 */
export const bosV2InitialCustomAttributes: AttributeDefinition[] = [
  {
    id: "custom-likelihood-residual",
    name: "Likelihood (residual)",
    type: "singleSelect",
    isOotb: false,
    lifecycleStatus: "active",
    options: [
      { id: "very_low", label: "Very low" },
      { id: "low", label: "Low" },
      { id: "medium", label: "Medium" },
      { id: "high", label: "High" },
      { id: "very_high", label: "Very high" },
    ],
    semanticDescription:
      "Probability that this risk will occur after existing controls and mitigations are applied. Used alongside Impact (residual) to derive the residual risk rating. Planned for promotion to a built-in Score field.",
  },
  {
    id: "custom-impact-residual",
    name: "Impact (residual)",
    type: "singleSelect",
    isOotb: false,
    lifecycleStatus: "active",
    options: [
      { id: "very_low", label: "Very low" },
      { id: "low", label: "Low" },
      { id: "medium", label: "Medium" },
      { id: "high", label: "High" },
      { id: "very_high", label: "Very high" },
    ],
    semanticDescription:
      "Severity of consequences after controls and mitigations are applied. Used alongside Likelihood (residual) to derive the residual risk rating. Planned for promotion to a built-in Score field.",
  },
  {
    id: "custom-assessment-due-date",
    name: "Assessment due date",
    type: "dateTime",
    isOotb: false,
    lifecycleStatus: "active",
    semanticDescription:
      "Date by which the next formal risk assessment must be completed. Used to trigger review reminders and identify overdue assessments in portfolio dashboards.",
  },
  {
    id: "custom-risk-appetite",
    name: "Risk appetite",
    type: "singleSelect",
    isOotb: false,
    lifecycleStatus: "active",
    options: [
      { id: "averse", label: "Averse" },
      { id: "minimal", label: "Minimal" },
      { id: "cautious", label: "Cautious" },
      { id: "open", label: "Open" },
      { id: "hungry", label: "Hungry" },
    ],
    semanticDescription:
      "The organization's stated level of risk appetite for this risk type. Compared against the current risk score to flag out-of-appetite exposures.",
  },
];

export const bosV2InitialAuditLog: AuditLogEntry[] = [
  ...bosV2InitialCustomAttributes.map((attr) => ({
    id: `audit-bos-v2-${attr.id}`,
    attributeId: attr.id,
    attributeName: attr.name,
    action: "created" as const,
    actor: "Schema Administrator",
    timestamp: "2025-03-26T10:00:00.000Z",
  })),
  {
    id: "audit-bos-v2-deleted-risk-tier-legacy",
    attributeId: "custom-risk-tier-legacy",
    attributeName: "Risk tier (legacy)",
    action: "deleted",
    actor: "Schema Administrator",
    timestamp: "2025-11-20T14:00:00.000Z",
    deleteSnapshot: { attributeType: "text", sectionId: "overview" },
  },
];
