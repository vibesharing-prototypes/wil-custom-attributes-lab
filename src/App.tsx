import { AppLayout } from "@diligentcorp/atlas-react-bundle";
import { Outlet, Route, Routes } from "react-router";
import "./styles.css";

import LabPrototypeBanner from "./components/LabPrototypeBanner.js";
import Navigation from "./Navigation.js";
import SchemaViewerPage from "./pages/SchemaViewerPage.js";
import SchemaManagementBosPage from "./pages/SchemaManagementBosPage.js";
import SchemaManagementBosV2Page from "./pages/SchemaManagementBosV2Page.js";
import SchemaManagementVisionArchivePage from "./pages/SchemaManagementVisionArchivePage.js";
import PermissionCardStylesExplorationPage from "./pages/PermissionCardStylesExplorationPage.js";
import WorkflowsPlaceholderPage from "./pages/WorkflowsPlaceholderPage.js";
import WorkflowTemplateEditorPage from "./pages/WorkflowTemplateEditorPage.js";
import FormPreviewPage from "./pages/FormPreviewPage.js";
import FormPreviewDestinationPage from "./pages/FormPreviewDestinationPage.js";
import { FORM_PREVIEW_DESTINATION_ROUTE } from "./pages/formPreviewShared.js";
import LabHomePage from "./pages/LabHomePage.js";

/**
 * Lab routes only — workflows + explorations. See PROTOTYPE_SCOPE.md in this folder.
 */
export default function App() {
  return (
    <Routes>
      <Route
        element={
          <AppLayout orgName="Acme Corp — Lab prototype" navigation={<Navigation />}>
            <LabPrototypeBanner />
            <Outlet />
          </AppLayout>
        }
      >
        <Route path="/" element={<LabHomePage />} />
        <Route path="/schema-viewer" element={<SchemaViewerPage />} />
        <Route path="/schema-management-bos" element={<SchemaManagementBosPage />} />
        <Route path="/schema-management-bos-v2" element={<SchemaManagementBosV2Page />} />
        <Route path="/explorations/schema-management-vision" element={<SchemaManagementVisionArchivePage />} />
        <Route path="/explorations/permission-card-styles" element={<PermissionCardStylesExplorationPage />} />
        <Route path="/explorations/form-preview" element={<FormPreviewPage />} />
        <Route path="/workflows" element={<WorkflowsPlaceholderPage />} />
        <Route path="/workflows/template/edit" element={<WorkflowTemplateEditorPage />} />
      </Route>
      <Route path={FORM_PREVIEW_DESTINATION_ROUTE} element={<FormPreviewDestinationPage />} />
    </Routes>
  );
}
