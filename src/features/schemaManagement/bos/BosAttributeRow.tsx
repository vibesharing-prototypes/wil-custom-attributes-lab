import { useState, type FC } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";

import InfoIcon from "@diligentcorp/atlas-react-bundle/icons/Info";
import { TYPE_LABELS, STR } from "../../../utils/i18n.js";
import { getTypeIcon } from "../components/AttributeTypeSelector.js";
import { BosScopeBadge } from "./BosScopeBadge.js";
import type { BosOotbField } from "./types.js";
import { uiDividerDefaultBorderColor } from "../../../utils/uiDividerBorder.js";

interface Props {
  field: BosOotbField;
}

/**
 * Read-only accordion row for a BOS v2 OOTB field.
 *
 * Extends the visual pattern of AttributeListRow with:
 *   - A BosScopeBadge showing current export fidelity and next-iteration upgrade
 *   - An expanded details panel that shows the BOS field key and scope roadmap
 *     in addition to the standard description and options
 *
 * Always readonly — OOTB fields are never editable from the schema management UI.
 */
export const BosAttributeRow: FC<Props> = ({ field }) => {
  const { name, type, semanticDescription, options, bosScope, bosNextScope, bosFieldKey } = field;

  const TypeIcon = getTypeIcon(type);
  const hasOptions = (type === "singleSelect" || type === "multiSelect") && options && options.length > 0;
  const hasExpandableContent = !!semanticDescription || hasOptions || !!bosFieldKey;

  const [expanded, setExpanded] = useState(false);

  const showBosKeyInfo = bosFieldKey && bosFieldKey !== "—";

  return (
    <Accordion
      data-atlas-alignment="end"
      disableGutters
      elevation={0}
      expanded={hasExpandableContent ? expanded : false}
      onChange={hasExpandableContent ? (_, isExpanded) => setExpanded(isExpanded) : undefined}
      sx={({ tokens }) => ({
        "&:before": { display: "none" },
        borderBottom: "1px solid",
        borderColor: uiDividerDefaultBorderColor(tokens),
        "&:last-of-type": { borderBottom: "none" },
        "&.Mui-expanded": { margin: 0 },
        ...(!hasExpandableContent && {
          "& .MuiAccordionSummary-expandIconWrapper": { display: "none" },
        }),
        "& .MuiAccordionSummary-expandIconWrapper": { transform: "rotate(0deg)" },
        "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": { transform: "rotate(180deg)" },
      })}
    >
      <AccordionSummary
        expandIcon={hasExpandableContent ? <ExpandDownIcon /> : undefined}
        aria-controls={hasExpandableContent ? `bos-attr-${field.id}-details` : undefined}
        id={`bos-attr-${field.id}-header`}
        sx={{
          px: 2,
          minHeight: 0,
          "& .MuiAccordionSummary-content": {
            my: 1.5,
            mr: 1,
            minWidth: 0,
            alignItems: "center",
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          sx={{ width: "100%", minWidth: 0 }}
        >
          {/* Left: icon + name + chips */}
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ minWidth: 0, flex: 1 }}>
            <Box
              sx={({ tokens }) => ({
                color:
                  tokens.semantic.color.type?.secondary?.value ??
                  tokens.semantic.color.type?.muted?.value ??
                  "text.secondary",
                display: "flex",
                flexShrink: 0,
              })}
            >
              <TypeIcon aria-hidden />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                <Typography variant="body2" fontWeight={500} sx={{ whiteSpace: "nowrap" }}>
                  {name}
                </Typography>

                <Chip
                  label={STR.builtIn}
                  size="small"
                  variant="outlined"
                  sx={({ tokens }) => ({
                    height: 18,
                    fontSize: "0.65rem",
                    borderColor: uiDividerDefaultBorderColor(tokens),
                  })}
                />

                {/* BOS scope badge — the key addition vs AttributeListRow */}
                <BosScopeBadge scope={bosScope} nextScope={bosNextScope} />

                {/* Warning badge when field is not currently in BOS */}
                {bosFieldKey === "—" && (
                  <Tooltip title="This field is not currently included in the BOS schema." arrow placement="top">
                    <Chip
                      label="Not in BOS"
                      size="small"
                      variant="outlined"
                      color="default"
                      icon={<InfoIcon />}
                      sx={{
                        height: 18,
                        fontSize: "0.65rem",
                        cursor: "help",
                        borderRadius: "4px",
                        "& .MuiChip-icon": { fontSize: "0.75rem", marginRight: "-4px" },
                      }}
                    />
                  </Tooltip>
                )}
              </Stack>

              {/* Type label + truncated description */}
              <Stack direction="row" alignItems="center" gap={0.75} sx={{ mt: 0.25, minWidth: 0 }}>
                <Typography
                  variant="caption"
                  sx={({ tokens }) => ({
                    color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                    flexShrink: 0,
                  })}
                >
                  {TYPE_LABELS[type]}
                </Typography>
                {semanticDescription && (
                  <Box sx={{ display: "contents" }}>
                    <Typography
                      aria-hidden="true"
                      variant="caption"
                      sx={({ tokens }) => ({
                        color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                        flexShrink: 0,
                        opacity: expanded ? 0 : 1,
                        transition: "opacity 0.2s ease",
                      })}
                    >
                      ·
                    </Typography>
                    <Typography
                      variant="caption"
                      aria-hidden={expanded}
                      sx={({ tokens }) => ({
                        color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        minWidth: 0,
                        opacity: expanded ? 0 : 1,
                        transition: "opacity 0.2s ease",
                      })}
                    >
                      {semanticDescription}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </AccordionSummary>

      {hasExpandableContent && (
        <AccordionDetails
          id={`bos-attr-${field.id}-details`}
          sx={{ px: 2, pt: 0, pb: 2 }}
        >
          <Stack gap={2}>
            {semanticDescription && (
              <Box>
                <SectionLabel>Description</SectionLabel>
                <Typography
                  variant="body2"
                  sx={({ tokens }) => ({ color: tokens.semantic.color.type?.muted?.value ?? "text.secondary" })}
                >
                  {semanticDescription}
                </Typography>
              </Box>
            )}

            {hasOptions && (
              <Box>
                <SectionLabel>Options ({options!.length})</SectionLabel>
                <Stack direction="row" flexWrap="wrap" gap={0.75}>
                  {options!.map((opt) => (
                    <Chip
                      key={opt.id}
                      label={opt.label}
                      size="small"
                      variant="outlined"
                      sx={opt.deprecated ? { textDecoration: "line-through", opacity: 0.5 } : undefined}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* BOS export details */}
            <Divider />
            <Box>
              <SectionLabel>BOS export</SectionLabel>
              <Stack gap={1}>
                <Stack direction="row" gap={1} alignItems="baseline">
                  <Typography
                    variant="caption"
                    sx={({ tokens }) => ({
                      color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                      flexShrink: 0,
                      minWidth: 80,
                    })}
                  >
                    Field key
                  </Typography>
                  <Typography
                    variant="caption"
                    component="code"
                    sx={({ tokens }) => ({
                      fontFamily: "monospace",
                      color: tokens.semantic.color.type?.default?.value ?? "text.primary",
                    })}
                  >
                    {bosFieldKey}
                  </Typography>
                </Stack>

                <Stack direction="row" gap={1} alignItems="center">
                  <Typography
                    variant="caption"
                    sx={({ tokens }) => ({
                      color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                      flexShrink: 0,
                      minWidth: 80,
                    })}
                  >
                    Current scope
                  </Typography>
                  <BosScopeBadge scope={bosScope} nextScope={bosNextScope} />
                </Stack>

                {bosNextScope && bosNextScope !== bosScope && (
                  <Stack direction="row" gap={1} alignItems="baseline">
                    <Typography
                      variant="caption"
                      sx={({ tokens }) => ({
                        color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                        flexShrink: 0,
                        minWidth: 80,
                      })}
                    >
                      Next iteration
                    </Typography>
                    <BosScopeBadge scope={bosNextScope} />
                  </Stack>
                )}
              </Stack>
            </Box>
          </Stack>
        </AccordionDetails>
      )}
    </Accordion>
  );
};

/** Shared label style for expanded detail sections — matches AttributeListRow. */
const SectionLabel: FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography
    sx={({ tokens }) => ({
      fontFamily: tokens.semantic.font.label.sm.fontFamily,
      fontSize: tokens.semantic.font.label.sm.fontSize,
      fontWeight: tokens.semantic.fontWeight.emphasis,
      letterSpacing: tokens.semantic.font.label.sm.letterSpacing,
      lineHeight: tokens.semantic.font.label.sm.lineHeight,
      textTransform: tokens.semantic.font.label.sm.textTransform,
      color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
      display: "block",
      mb: 0.75,
    })}
  >
    {children}
  </Typography>
);
