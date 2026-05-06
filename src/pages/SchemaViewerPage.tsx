import type { FC } from "react";
import { PageHeader } from "@diligentcorp/atlas-react-bundle";
import PageLayout from "../components/PageLayout.js";
import { ReadOnlySchemaViewer } from "../features/schemaViewer/ReadOnlySchemaViewer.js";
import { riskSchema } from "../features/schemaViewer/sampleData.js";
import { STR } from "../utils/i18n.js";

/**
 * M0: Read-only schema viewer page.
 * Embeds ReadOnlySchemaViewer as a host app would — providing the page chrome,
 * while the viewer component itself is the reusable Object Library deliverable.
 */
const SchemaViewerPage: FC = () => {
  return (
    <PageLayout>
      <PageHeader
        pageTitle={STR.schemaViewer.title}
        pageSubtitle={STR.schemaViewer.subtitle}
      />
      <ReadOnlySchemaViewer schema={riskSchema} />
    </PageLayout>
  );
};

export default SchemaViewerPage;
