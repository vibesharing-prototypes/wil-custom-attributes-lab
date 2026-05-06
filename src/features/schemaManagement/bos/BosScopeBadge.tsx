import type { FC } from "react";
import { Chip, Stack, Tooltip, Typography } from "@mui/material";
import ArrowRightIcon from "@diligentcorp/atlas-react-bundle/icons/ArrowRight";
import type { BosScope } from "./types.js";

interface Props {
  scope: BosScope;
  /** When present and different from scope, an upgrade arrow is shown in the badge. */
  nextScope?: BosScope;
}

const SCOPE_LABEL: Record<BosScope, string> = {
  full_value: "Full value",
  presence_only: "Presence only",
  length: "Length",
  count: "Count",
  system: "System",
};

type ChipColor = "default" | "warning" | "success" | "info";

const SCOPE_COLOR: Record<BosScope, ChipColor> = {
  full_value: "success",
  presence_only: "warning",
  length: "warning",
  count: "default",
  system: "default",
};

const SCOPE_TOOLTIP: Record<BosScope, string> = {
  full_value: "The full field value is indexed by BOS and available for search and analytics.",
  presence_only:
    "BOS currently indexes whether this field has a value (TRUE/FALSE). The full value is planned for the next BOS iteration.",
  length:
    "BOS currently indexes the character count of this field at 3-character precision. Full-text indexing is planned for the next BOS iteration.",
  count: "System-computed count of linked objects. Read-only — not configurable.",
  system: "Infrastructure field automatically indexed by BOS. Not configurable.",
};

/**
 * A compact chip showing the current BOS export scope for a field.
 * When a next-iteration scope exists, a small arrow and the target scope label
 * are appended to give stakeholders a sense of the roadmap direction.
 *
 * Used in BosAttributeRow and BosSystemFieldRow to annotate each field's
 * analytics fidelity in the BOS v2 schema exploration page.
 */
export const BosScopeBadge: FC<Props> = ({ scope, nextScope }) => {
  const hasUpgrade = !!nextScope && nextScope !== scope;
  const tooltipText = hasUpgrade
    ? `${SCOPE_TOOLTIP[scope]} Next iteration: ${SCOPE_LABEL[nextScope!]}.`
    : SCOPE_TOOLTIP[scope];

  return (
    <Tooltip title={tooltipText} arrow placement="top">
      <Stack
        direction="row"
        alignItems="center"
        gap={0.25}
        component="span"
        sx={{ display: "inline-flex" }}
      >
        <Chip
          label={SCOPE_LABEL[scope]}
          size="small"
          color={SCOPE_COLOR[scope]}
          variant="outlined"
          sx={{ height: 18, fontSize: "0.65rem", cursor: "help", borderRadius: "4px" }}
        />
        {hasUpgrade && (
          <>
            <ArrowRightIcon
              aria-hidden
              sx={({ tokens }) => ({
                fontSize: "0.75rem",
                color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
              })}
            />
            <Typography
              variant="caption"
              sx={({ tokens }) => ({
                fontSize: "0.65rem",
                color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                lineHeight: 1,
              })}
            >
              {SCOPE_LABEL[nextScope!]}
            </Typography>
          </>
        )}
      </Stack>
    </Tooltip>
  );
};
