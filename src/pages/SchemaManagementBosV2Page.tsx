import { Component, type FC, type ReactNode } from "react";
import { Alert, Box, Typography } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { PageHeader } from "@diligentcorp/atlas-react-bundle";
import PageLayout from "../components/PageLayout.js";
import { STR } from "../utils/i18n.js";
import { SchemaManagementBosV2View } from "../features/schemaManagement/bos/SchemaManagementBosV2View.js";
import { bosV2Schema, bosV2InitialCustomAttributes, bosV2InitialAuditLog } from "../features/schemaManagement/bos/bosV2SampleData.js";

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
 * BOS v2 schema management exploration page.
 *
 * Adds on top of BOS v1 (type-constrained) by:
 *   - Showing the full BOS Risk schema with export scope annotations
 *   - Surfacing workflow_status as a missing OOTB attribute
 *   - Correcting risk_owner to multi-user (array<string>)
 *   - Adding Information Security to risk_category (21 options total)
 *   - Grouping system/metadata fields in a collapsible section
 *   - Showing relationship count fields as read-only
 *
 * Exists as a separate page under Explorations so stakeholders can compare
 * the v1 BOS-constrained view against this v2 schema-aware view independently.
 */
const SchemaManagementBosV2Page: FC = () => {
  return (
    <PageLayout>
      <PageHeader
        pageTitle={STR.schemaManagementBosV2.title}
        pageSubtitle={STR.schemaManagementBosV2.subtitle}
      />
      <Box sx={{ mb: 3 }}>
        <Alert severity="info">
          <Box sx={visuallyHidden}>Info</Box>
          <Typography variant="body2" component="span" fontWeight={600}>
            {STR.schemaManagementBosV2.bannerTitle}:{" "}
          </Typography>
          <Typography variant="body2" component="span">
            {STR.schemaManagementBosV2.bannerBody}
          </Typography>
        </Alert>
      </Box>
      <SchemaErrorBoundary>
        <SchemaManagementBosV2View
          schema={bosV2Schema}
          initialCustomAttributes={bosV2InitialCustomAttributes}
          initialAuditEntries={bosV2InitialAuditLog}
        />
      </SchemaErrorBoundary>
    </PageLayout>
  );
};

export default SchemaManagementBosV2Page;
