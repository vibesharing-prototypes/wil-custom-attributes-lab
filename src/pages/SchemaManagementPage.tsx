import { Component, type FC, type ReactNode, useCallback, useRef } from "react";
import { Alert, Box, Button, Stack } from "@mui/material";
import { PageHeader } from "@diligentcorp/atlas-react-bundle";
import HistoryIcon from "@diligentcorp/atlas-react-bundle/icons/History";
import PageLayout from "../components/PageLayout.js";
import { STR } from "../utils/i18n.js";
import { SchemaManagementView } from "../features/schemaManagement/SchemaManagementView.js";
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
 * Schema management page (M1).
 * Surfaces the full write surface for custom attribute lifecycle:
 * add, edit, and delete (with confirmation).
 *
 * Permission gate: in production, only users with manage_schema:{object_type} reach this page.
 * In the prototype, access is simulated via navigation — no real auth enforced.
 */
const SchemaManagementPage: FC = () => {
  const openGlobalAuditRef = useRef<(() => void) | null>(null);
  const registerOpenGlobalAuditLog = useCallback((open: () => void) => {
    openGlobalAuditRef.current = open;
  }, []);

  return (
    <PageLayout>
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        gap={2}
        sx={{ mb: 1 }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <PageHeader pageTitle={STR.schemaManagement.title} pageSubtitle={STR.schemaManagement.subtitle} />
        </Box>
        <Button
          variant="text"
          color="primary"
          startIcon={<HistoryIcon aria-hidden />}
          onClick={() => openGlobalAuditRef.current?.()}
          aria-label={STR.auditLog.globalTitle}
          sx={{ flexShrink: 0, mt: 0.25 }}
        >
          {STR.auditLog.auditLogButton}
        </Button>
      </Stack>
      <SchemaErrorBoundary>
        <SchemaManagementView
          schema={riskSchema}
          initialCustomAttributes={initialCustomAttributes}
          initialAuditEntries={initialAuditLog}
          showAttributeOrderTools
          onRegisterOpenGlobalAuditLog={registerOpenGlobalAuditLog}
        />
      </SchemaErrorBoundary>
    </PageLayout>
  );
};

export default SchemaManagementPage;
