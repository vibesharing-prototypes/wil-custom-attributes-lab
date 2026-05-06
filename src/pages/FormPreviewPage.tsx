import type { FC } from "react";
import { Alert, Box, Button, Snackbar, Stack, Typography } from "@mui/material";
import { PageHeader } from "@diligentcorp/atlas-react-bundle";
import { Link } from "react-router";
import PageLayout from "../components/PageLayout.js";
import { FormPreviewAttributeRow } from "../components/attributes/FormPreviewAttributeRow.js";
import { atlasToastAlertSurfaceSx } from "../utils/atlasToastLayout.js";
import { STR } from "../utils/i18n.js";
import { uiDividerDefaultBorderColor } from "../utils/uiDividerBorder.js";
import { FormPreviewReorderSheet } from "./FormPreviewReorderSheet.js";
import { FORM_PREVIEW_DESTINATION_ROUTE, useFormPreviewAttributeOrder } from "./formPreviewShared.js";

const FormPreviewPage: FC = () => {
  const {
    orderedCustomAttributes,
    reorderSheetOpen,
    setReorderSheetOpen,
    toastOpen,
    hideToast,
    handleReorderSave,
    sections,
  } = useFormPreviewAttributeOrder();

  return (
    <PageLayout>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ md: "flex-start" }}
        justifyContent="space-between"
        gap={2}
        sx={{ mb: 1 }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <PageHeader pageTitle={STR.formPreview.title} pageSubtitle={STR.formPreview.subtitle} />
        </Box>
        <Button
          type="button"
          variant="outlined"
          color="primary"
          onClick={() => setReorderSheetOpen(true)}
          sx={{ flexShrink: 0, alignSelf: { xs: "stretch", md: "flex-start" }, mt: { md: 0.5 } }}
        >
          {STR.formPreview.editAttributeOrder}
        </Button>
      </Stack>
      <Alert
        severity="info"
        sx={{ mt: 2, mb: 2 }}
        action={
          <Button
            component={Link}
            to={FORM_PREVIEW_DESTINATION_ROUTE}
            variant="outlined"
            size="small"
            color="inherit"
          >
            {STR.formPreview.viewInContext}
          </Button>
        }
      >
        <Typography variant="body1">{STR.formPreview.disclaimer}</Typography>
      </Alert>
      <Stack gap={3} sx={{ width: 1 }}>
        {sections.map((section) => (
          <Box key={section.id}>
            <Typography component="h4" variant="h4" sx={{ fontWeight: 600, mb: 1, px: 2 }}>
              {section.title}
            </Typography>
            <Box
              sx={({ tokens }) => ({
                border: "1px solid",
                borderColor: uiDividerDefaultBorderColor(tokens),
                borderRadius: 1,
                px: 2,
              })}
            >
              {section.attributes.map((def) => (
                <FormPreviewAttributeRow key={def.id} definition={def} />
              ))}
            </Box>
          </Box>
        ))}
      </Stack>

      <FormPreviewReorderSheet
        open={reorderSheetOpen}
        attributes={orderedCustomAttributes}
        onDismiss={() => setReorderSheetOpen(false)}
        onSave={handleReorderSave}
      />

      <Snackbar
        open={toastOpen}
        autoHideDuration={5000}
        onClose={hideToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ top: "88px !important", right: "24px !important" }}
      >
        <Alert severity="success" aria-live="polite" onClose={hideToast} sx={atlasToastAlertSurfaceSx}>
          {STR.formPreview.formUpdatedToast}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default FormPreviewPage;
