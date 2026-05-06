import { Component, type FC, type ReactNode, useState } from "react";
import { Alert, Box, Button, Stack } from "@mui/material";
import { PageHeader } from "@diligentcorp/atlas-react-bundle";
import PageLayout from "../components/PageLayout.js";
import { STR } from "../utils/i18n.js";
import { SchemaManagementView } from "../features/schemaManagementVisionArchive/SchemaManagementView.js";
import { riskSchema, initialCustomAttributes, initialAuditLog } from "../features/schemaViewer/sampleData.js";

class SchemaErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            <strong>Render error:</strong> {(this.state.error as Error).message}
            <pre style={{ fontSize: 11, marginTop: 8, whiteSpace: "pre-wrap" }}>
              {(this.state.error as Error).stack}
            </pre>
          </Alert>
        </Box>
      );
    }
    return this.props.children;
  }
}

/**
 * Schema management page — Vision archive snapshot.
 *
 * Preserves the previous Vision (custom-attributes-v2) implementation of the
 * schema management surface (sectioned, deprecation dialog, controlled reorder
 * sheet) so it can be referenced after the MVP variant is promoted into
 * Vision. Mirrors the original v2 page's controlled reorder-sheet pattern.
 */
const SchemaManagementVisionArchivePage: FC = () => {
  const [reorderSheetOpen, setReorderSheetOpen] = useState(false);

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
          <PageHeader
            pageTitle="Schema management (Vision archive)"
            pageSubtitle={STR.schemaManagement.subtitle}
          />
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
      <SchemaErrorBoundary>
        <SchemaManagementView
          schema={riskSchema}
          initialCustomAttributes={initialCustomAttributes}
          initialAuditEntries={initialAuditLog}
          showAttributeOrderTools
          reorderSheetOpen={reorderSheetOpen}
          onReorderSheetOpenChange={setReorderSheetOpen}
        />
      </SchemaErrorBoundary>
    </PageLayout>
  );
};

export default SchemaManagementVisionArchivePage;
