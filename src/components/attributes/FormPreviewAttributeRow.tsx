import type { FC } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import type { AttributeDefinition } from "../../types/attribute.js";
import { TYPE_LABELS, STR } from "../../utils/i18n.js";
import { uiDividerDefaultBorderColor } from "../../utils/uiDividerBorder.js";
import { ariaDescribedBy } from "../../utils/a11y.js";
import { getTypeIcon } from "../../features/schemaManagement/components/AttributeTypeSelector.js";
import { DeprecatedChip } from "../../features/schemaManagement/components/DeprecatedChip.js";
import { AttributeDescription } from "./parts/AttributeDescription.js";


interface Props {
  definition: AttributeDefinition;
}

/**
 * Form preview / builder row: same chrome as schema management (icon, name, chips, type).
 * Omits record values — those belong to the host app’s object form, not this layout preview.
 */
export const FormPreviewAttributeRow: FC<Props> = ({ definition }) => {
  const {
    id,
    name,
    type,
    lifecycleStatus,
    deprecationReason,
    semanticDescription,
    isOotb,
  } = definition;

  const TypeIcon = getTypeIcon(type);
  const isDeprecated = lifecycleStatus === "deprecated";
  const labelId = `form-preview-label-${id}`;
  const descId = `form-preview-desc-${id}`;
  const describedBy = ariaDescribedBy([semanticDescription ? descId : undefined]);

  return (
    <Box
      component="section"
      aria-labelledby={labelId}
      aria-describedby={describedBy}
      sx={({ tokens }) => ({
        py: 1.5,
        borderBottom: "1px solid",
        borderColor: uiDividerDefaultBorderColor(tokens),
        "&:last-of-type": { borderBottom: "none" },
      })}
    >
      <Stack direction="row" alignItems="flex-start" gap={1.5} sx={{ minWidth: 0 }}>
        <Box
          sx={({ tokens }) => ({
            color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
            display: "flex",
            flexShrink: 0,
            mt: 0.25,
          })}
        >
          <TypeIcon aria-hidden />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
            <Typography
              id={labelId}
              variant="body2"
              component="h3"
              fontWeight={500}
              sx={{
                textDecoration: isDeprecated ? "line-through" : "none",
                m: 0,
              }}
            >
              {name}
            </Typography>
            {isDeprecated && <DeprecatedChip reason={deprecationReason} />}
            {isOotb === false && (
              <Chip
                label={STR.custom}
                size="small"
                variant="outlined"
                sx={({ tokens }) => ({
                  height: 18,
                  fontSize: "0.65rem",
                  borderColor: uiDividerDefaultBorderColor(tokens),
                })}
              />
            )}
          </Stack>
          <Typography
            variant="caption"
            component="p"
            sx={({ tokens }) => ({
              color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
              m: 0,
              mt: 0.25,
            })}
          >
            {TYPE_LABELS[type]}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ mt: 0.75 }}>
        <AttributeDescription id={descId} text={semanticDescription} />
      </Box>
    </Box>
  );
};
