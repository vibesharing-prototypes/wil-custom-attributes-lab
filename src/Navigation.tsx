import { useRef, useState } from "react";
import { NavLink, NavSection, RoutedNavLink } from "@diligentcorp/atlas-react-bundle/global-nav";
import ArchiveIcon from "@diligentcorp/atlas-react-bundle/icons/Archive";
import DocumentIcon from "@diligentcorp/atlas-react-bundle/icons/Document";
import EditIcon from "@diligentcorp/atlas-react-bundle/icons/Edit";
import FlowsIcon from "@diligentcorp/atlas-react-bundle/icons/Flows";
import LogoLabIcon from "@diligentcorp/atlas-react-bundle/icons/LogoLab";
import SettingsIcon from "@diligentcorp/atlas-react-bundle/icons/Settings";

import { NavigationDeploymentIndicator } from "./components/NavigationDeploymentIndicator.js";
import { useGlobalNavRailExpanded } from "./hooks/useGlobalNavRailExpanded.js";
import { useThemePreference, type TokenMode } from "./contexts/ThemePreferenceContext.js";
import { STR } from "./utils/i18n.js";

/**
 * Lab nav: workflows + explorations + theme. No primary schema management or roles.
 */
export default function Navigation() {
  const { tokenMode, setTokenMode } = useThemePreference();
  const [configOpen, setConfigOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(true);
  const [explorationsOpen, setExplorationsOpen] = useState(true);

  const themeLabels: Record<TokenMode, string> = {
    lens: "Lens (legacy)",
    "atlas-light": "Light",
    "atlas-dark": "Dark",
  };

  const navRootRef = useRef<HTMLDivElement>(null);
  const navRailExpanded = useGlobalNavRailExpanded(navRootRef);

  return (
    <div
      ref={navRootRef}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        alignSelf: "stretch",
        flex: 1,
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          // overflow-y other than visible forces overflow-x to clip; inset content so focus
          // rings on atlas-gn-nav-link are not cropped on the left/right.
          paddingInline: 6,
        }}
      >
      <RoutedNavLink to="/" end label="Lab home">
        <LogoLabIcon slot="icon" />
      </RoutedNavLink>

      <RoutedNavLink to="/workflows" label={STR.workflowsStub.title}>
        <FlowsIcon slot="icon" />
      </RoutedNavLink>

      <NavSection
        label="Explorations"
        isOpen={explorationsOpen}
        onOpen={() => setExplorationsOpen(true)}
        onClose={() => setExplorationsOpen(false)}
      >
        <LogoLabIcon slot="icon" />

        <RoutedNavLink to="/schema-viewer" label="Schema viewer">
          <DocumentIcon slot="icon" />
        </RoutedNavLink>
        <RoutedNavLink to="/schema-management-bos" label="Schema management (BOS v1)">
          <ArchiveIcon slot="icon" />
        </RoutedNavLink>
        <RoutedNavLink to="/schema-management-bos-v2" label="Schema management (BOS v2)">
          <ArchiveIcon slot="icon" />
        </RoutedNavLink>
        <RoutedNavLink to="/explorations/schema-management-vision" label="Schema management (Vision archive)">
          <ArchiveIcon slot="icon" />
        </RoutedNavLink>
        <RoutedNavLink to="/explorations/permission-card-styles" label="Permission card styles">
          <EditIcon slot="icon" />
        </RoutedNavLink>
        <RoutedNavLink to="/explorations/form-preview" label={STR.explorations.editFormPreviewNav}>
          <DocumentIcon slot="icon" />
        </RoutedNavLink>
      </NavSection>

      <hr />

      <NavSection
        label="App settings"
        isOpen={configOpen}
        onOpen={() => setConfigOpen(true)}
        onClose={() => setConfigOpen(false)}
      >
        <SettingsIcon slot="icon" />

        <NavSection
          label="Theme"
          isOpen={themeOpen}
          onOpen={() => setThemeOpen(true)}
          onClose={() => setThemeOpen(false)}
        >
          {(["lens", "atlas-light", "atlas-dark"] as TokenMode[]).map((mode) => (
            <NavLink
              key={mode}
              as="button"
              label={themeLabels[mode]}
              isCurrent={tokenMode === mode}
              onClick={() => setTokenMode(mode)}
            />
          ))}
        </NavSection>
      </NavSection>
      </div>
      <div
        aria-hidden={navRailExpanded ? undefined : true}
        style={{
          flexShrink: 0,
          opacity: navRailExpanded ? 1 : 0,
          maxHeight: navRailExpanded ? 220 : 0,
          overflow: "hidden",
          transition: "opacity 120ms ease-out, max-height 150ms ease-out",
          pointerEvents: navRailExpanded ? "auto" : "none",
        }}
      >
        <NavigationDeploymentIndicator />
      </div>
    </div>
  );
}
