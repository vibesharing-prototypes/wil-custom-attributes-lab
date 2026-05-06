/**
 * Seeded values for the Risk manager destination preview — interactive but not persisted.
 */
export const DESTINATION_FORM_INITIAL_VALUES: Record<string, unknown> = {
  name: "Third-party concentration — cloud infrastructure",
  risk_description:
    "Critical workloads and sensitive data are concentrated with a small set of hyperscale cloud providers. A prolonged outage, contractual dispute, or compliance action could simultaneously affect multiple business units and breach recovery targets.\n\nMitigation focuses on multi-region design, exit planning, and contractual SLAs — residual exposure remains where true multi-vendor redundancy is cost-prohibitive.",
  risk_category: "third_party",
  risk_id: "R-2841",
  risk_owner: "user-samira",
  risk_impact: "high",
  likelihood: "medium",
  inherent_risk_score: "high",
  residual_risk_score: "medium",
  risk_attachment: [
    { id: "att-1", name: "Cloud resilience review — Q1.pdf", sizeLabel: "312 KB" },
    { id: "att-2", name: "Vendor_subprocessor_list.xlsx", sizeLabel: "89 KB" },
  ],
  "custom-likelihood-residual": "low",
  "custom-impact-residual": "medium",
  "custom-assessment-due-date": "2026-06-30T09:00",
  "custom-risk-appetite": "cautious",
};
