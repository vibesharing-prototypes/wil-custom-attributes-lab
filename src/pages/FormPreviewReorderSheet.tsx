import type { FC } from "react";
import { useEffect, useState } from "react";
import { Box, Button, Drawer, IconButton, Stack, Typography } from "@mui/material";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import type { AttributeDefinition, ObjectSchema } from "../types/attribute.js";
import { riskSchema } from "../features/schemaViewer/sampleData.js";
import { STR } from "../utils/i18n.js";
import { uiDividerDefaultBorderColor } from "../utils/uiDividerBorder.js";
import { FormPreviewSectionedReorderList } from "./FormPreviewSectionedReorderList.js";

interface Props {
  open: boolean;
  /** Saved order when the sheet opens; used to reset draft on open. */
  attributes: AttributeDefinition[];
  onDismiss: () => void;
  onSave: (ordered: AttributeDefinition[]) => void;
  /** Section layout for reorder; defaults to Risk sample schema. */
  schema?: ObjectSchema;
}

/**
 * Large right-side sheet to reorder custom attributes in-context on the form preview page.
 */
export const FormPreviewReorderSheet: FC<Props> = ({ open, attributes, onDismiss, onSave, schema = riskSchema }) => {
  const [draft, setDraft] = useState<AttributeDefinition[]>(attributes);

  useEffect(() => {
    if (open) {
      setDraft(structuredClone(attributes));
    }
  }, [open, attributes]);

  const handleSave = () => {
    onSave(structuredClone(draft));
  };

  const titleId = "form-preview-reorder-sheet-title";

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onDismiss}
      PaperProps={{
        role: "dialog",
        "aria-labelledby": titleId,
        "aria-modal": "true",
        sx: {
          width: { xs: "100%", sm: 560, md: 720 },
          maxWidth: "100vw",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box
        sx={({ tokens }) => ({
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          px: 3,
          py: 2,
          borderBottom: "1px solid",
          borderColor: uiDividerDefaultBorderColor(tokens),
          flexShrink: 0,
        })}
      >
        <Stack gap={0.5} sx={{ minWidth: 0 }}>
          <Typography id={titleId} variant="h2" sx={{ fontWeight: 600, fontSize: "1.25rem" }}>
            {STR.formPreview.reorderSheetTitle}
          </Typography>
          <Typography
            variant="body2"
            sx={({ tokens }) => ({ color: tokens.semantic.color.type?.muted?.value ?? "text.secondary" })}
          >
            {STR.formPreview.reorderSheetDescription}
          </Typography>
        </Stack>
        <IconButton
          onClick={onDismiss}
          size="small"
          aria-label={STR.formPreview.reorderSheetClose}
          edge="end"
          sx={{ flexShrink: 0, mt: 0.25 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", minHeight: 0 }} aria-label={STR.formPreview.reorderSheetListAria}>
        {draft.length === 0 ? (
          <Typography
            variant="body2"
            sx={({ tokens }) => ({ color: tokens.semantic.color.type?.muted?.value ?? "text.secondary" })}
          >
            {STR.schemaManagement.emptyState}
          </Typography>
        ) : (
          <FormPreviewSectionedReorderList draft={draft} setDraft={setDraft} schema={schema} />
        )}
      </Box>

      <Box
        sx={({ tokens }) => ({
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
          flexWrap: "wrap",
          px: 3,
          py: 2,
          borderTop: "1px solid",
          borderColor: uiDividerDefaultBorderColor(tokens),
          flexShrink: 0,
        })}
      >
        <Button variant="outlined" color="primary" onClick={onDismiss}>
          {STR.form.cancel}
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          {STR.form.save}
        </Button>
      </Box>
    </Drawer>
  );
};
