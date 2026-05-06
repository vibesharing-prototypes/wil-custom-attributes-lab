import { Component, type FC, type ReactNode } from "react";
import { Alert, Box, Typography } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { PageHeader } from "@diligentcorp/atlas-react-bundle";
import PageLayout from "../components/PageLayout.js";
import { STR } from "../utils/i18n.js";
import { SchemaManagementView } from "../features/schemaManagement/SchemaManagementView.js";
import { riskSchema, initialCustomAttributes, initialAuditLog } from "../features/schemaViewer/sampleData.js";
import { BOS_ALLOWED_TYPES } from "../features/schemaManagement/components/AttributeTypeSelector.js";

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
 * BOS-constrained schema management page.
 *
 * This variant restricts the available attribute types to the subset supported
 * by the current BOS configuration. It exists alongside the full schema management
 * view (/) so stakeholders can compare the realistic v1 BOS experience against the
 * unconstrained product vision.
 *
 * BOS-limited types: text, longText, number, date, dateTime, boolean,
 * singleSelect, multiSelect (newly available), user.
 * Types like currency, attachment, users, and contact fields are planned for Q2.
 *
 * Permission gate: in production, only users with manage_schema:{object_type} reach
 * this page. In the prototype, access is simulated via navigation — no real auth enforced.
 */
const SchemaManagementBosPage: FC = () => {
  return (
    <PageLayout>
      <PageHeader
        pageTitle={STR.schemaManagementBos.title}
        pageSubtitle={STR.schemaManagementBos.subtitle}
      />
      <Box sx={{ mb: 3 }}>
        <Alert severity="info">
          <Box sx={visuallyHidden}>Info</Box>
          <Typography variant="body2" component="span" fontWeight={600}>
            {STR.schemaManagementBos.bannerTitle}:{" "}
          </Typography>
          <Typography variant="body2" component="span">
            {STR.schemaManagementBos.bannerBody}
          </Typography>
        </Alert>
      </Box>
      <SchemaErrorBoundary>
        <SchemaManagementView
          schema={riskSchema}
          initialCustomAttributes={initialCustomAttributes}
          initialAuditEntries={initialAuditLog}
          allowedTypes={BOS_ALLOWED_TYPES}
        />
      </SchemaErrorBoundary>
    </PageLayout>
  );
};

export default SchemaManagementBosPage;
