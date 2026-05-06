import type { FC } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Link,
  Snackbar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router";
import type { AttributeDefinition, AttributeType, ObjectSchema } from "../../types/attribute.js";
import type { AuditLogEntry } from "./types.js";
import { atlasToastAlertSurfaceSx } from "../../utils/atlasToastLayout.js";
import { STR } from "../../utils/i18n.js";
import { uiDividerDefaultBorderColor } from "../../utils/uiDividerBorder.js";
import { useSchemaManagement } from "./hooks/useSchemaManagement.js";
import { AttributeFormSheet } from "./components/AttributeFormSheet.js";
import { AuditLogDrawer } from "../schemaManagement/components/AuditLogDrawer.js";
import { DeprecationDialog } from "./components/DeprecationDialog.js";
import { AttributeListRow } from "./components/AttributeListRow.js";
import type { FormSheetMode } from "./types.js";
import { FormPreviewReorderSheet } from "../../pages/FormPreviewReorderSheet.js";
import {
  FORM_PREVIEW_DESTINATION_ROUTE,
  buildMergedSchemaSections,
  getCustomAttributesHydratedFromPersistence,
  persistFormPreviewCustomAttributes,
} from "../../pages/formPreviewShared.js";
import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import HistoryIcon from "@diligentcorp/atlas-react-bundle/icons/History";

type FilterMode = "all" | "base" | "custom";

interface Props {
  schema: ObjectSchema;
  /** Starting set of custom attributes — can be empty for a clean M1 prototype */
  initialCustomAttributes?: AttributeDefinition[];
  /**
   * Pre-seeded audit entries for the initial custom attributes (e.g. "created" events
   * that would have been recorded by the backend when those attributes were first defined).
   */
  initialAuditEntries?: AuditLogEntry[];
  /**
   * When provided, restricts the attribute type selector to these types.
   * Used by the BOS-constrained variant to surface only supported types.
   */
  allowedTypes?: AttributeType[];
  /**
   * Main schema page: disclaimer + context preview link, edit attribute order sheet,
   * and sessionStorage hydration for custom attribute order/sections (aligned with form preview).
   */
  showAttributeOrderTools?: boolean;
  /** Controlled by the page header when `showAttributeOrderTools` — opens the attribute-order drawer. */
  reorderSheetOpen?: boolean;
  onReorderSheetOpenChange?: (open: boolean) => void;
}

function applyAttributeFilter(attrs: AttributeDefinition[], mode: FilterMode): AttributeDefinition[] {
  if (mode === "all") return attrs;
  if (mode === "base") return attrs.filter((a) => a.isOotb === true);
  return attrs.filter((a) => a.isOotb !== true);
}

function hideDeprecatedRows(attrs: AttributeDefinition[], showDeprecated: boolean): AttributeDefinition[] {
  if (showDeprecated) return attrs;
  return attrs.filter((a) => a.lifecycleStatus !== "deprecated");
}

/**
 * The full M1 schema management surface — Vision archive snapshot.
 *
 * Layout:
 *   1. Optional prototype chrome (disclaimer; edit order is opened from the page header) when showAttributeOrderTools
 *   2. Toolbar — All / Base / Custom filter, change history, add custom attribute
 *   3. Merged sections — OOTB + custom attributes per schema section (custom chip retained on custom rows)
 *   4. Per-section "recently deleted" disclosure at the bottom of each section
 *   5. Side sheet, dialogs, drawer, toasts — same interaction pattern as before
 */
export const SchemaManagementView: FC<Props> = ({
  schema,
  initialCustomAttributes = [],
  initialAuditEntries = [],
  allowedTypes,
  showAttributeOrderTools = false,
  reorderSheetOpen: reorderSheetOpenProp,
  onReorderSheetOpenChange,
}) => {
  const hydratedInitial = useMemo(
    () => getCustomAttributesHydratedFromPersistence(structuredClone(initialCustomAttributes), schema),
    [schema, initialCustomAttributes],
  );

  const {
    customAttributes,
    auditLog,
    toast,
    hideToast,
    addAttribute,
    updateAttribute,
    deleteAttribute,
    replaceCustomAttributes,
  } = useSchemaManagement(hydratedInitial, initialAuditEntries);

  const [sheetMode, setSheetMode] = useState<FormSheetMode>(null);
  const [editingAttribute, setEditingAttribute] = useState<AttributeDefinition | null>(null);
  const [deletingAttribute, setDeletingAttribute] = useState<AttributeDefinition | null>(null);

  const [auditLogOpen, setAuditLogOpen] = useState(false);
  const [auditLogAttributeId, setAuditLogAttributeId] = useState<string | null>(null);

  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [deprecatedVisibleBySection, setDeprecatedVisibleBySection] = useState<Record<string, boolean>>({});

  const [internalReorderSheetOpen, setInternalReorderSheetOpen] = useState(false);
  const [reorderToastOpen, setReorderToastOpen] = useState(false);

  const reorderControlled =
    showAttributeOrderTools &&
    typeof onReorderSheetOpenChange === "function" &&
    typeof reorderSheetOpenProp === "boolean";
  const reorderSheetOpen = reorderControlled ? reorderSheetOpenProp : internalReorderSheetOpen;
  const setReorderSheetOpen = reorderControlled ? onReorderSheetOpenChange : setInternalReorderSheetOpen;

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!showAttributeOrderTools) return;
    const st = location.state as { openAttributeReorder?: boolean } | null | undefined;
    if (st?.openAttributeReorder) {
      setReorderSheetOpen(true);
      navigate(
        { pathname: location.pathname, search: location.search, hash: location.hash },
        { replace: true, state: {} },
      );
    }
  }, [location, navigate, showAttributeOrderTools, setReorderSheetOpen]);

  const mergedSections = useMemo(
    () => buildMergedSchemaSections(schema, customAttributes),
    [schema, customAttributes],
  );

  const openGlobalAuditLog = useCallback(() => {
    setAuditLogAttributeId(null);
    setAuditLogOpen(true);
  }, []);

  const openAttributeAuditLog = useCallback((attributeId: string, _attributeName?: string) => {
    setAuditLogAttributeId(attributeId);
    setAuditLogOpen(true);
  }, []);

  const closeAuditLog = useCallback(() => {
    setAuditLogOpen(false);
  }, []);

  const handleAdd = useCallback(() => {
    setEditingAttribute(null);
    setSheetMode("create");
  }, []);

  const handleEdit = useCallback((attr: AttributeDefinition) => {
    setEditingAttribute(attr);
    setSheetMode("edit");
  }, []);

  const handleSheetClose = useCallback(() => {
    setSheetMode(null);
    setEditingAttribute(null);
  }, []);

  const handleSave = useCallback(
    (def: Omit<AttributeDefinition, "id"> & { id?: string }) => {
      if (def.id) {
        const oldAttr = customAttributes.find((a) => a.id === def.id);
        updateAttribute(def.id, def, oldAttr);
      } else {
        addAttribute(def);
      }
    },
    [addAttribute, updateAttribute, customAttributes],
  );

  const handleRequestDelete = useCallback(() => {
    const attr = editingAttribute;
    if (!attr || attr.isOotb || attr.lifecycleStatus !== "active") return;
    setDeletingAttribute(attr);
  }, [editingAttribute]);

  const handleDeleteConfirm = useCallback(
    (id: string, reason?: string) => {
      const name = deletingAttribute?.name ?? editingAttribute?.name;
      deleteAttribute(id, reason, name);
      handleSheetClose();
    },
    [deleteAttribute, deletingAttribute, editingAttribute, handleSheetClose],
  );

  const handleViewHistory = useCallback(
    (attr: AttributeDefinition) => {
      openAttributeAuditLog(attr.id);
    },
    [openAttributeAuditLog],
  );

  const handleReorderSheetSave = useCallback(
    (next: AttributeDefinition[]) => {
      replaceCustomAttributes(next);
      persistFormPreviewCustomAttributes(next, schema);
      setReorderSheetOpen(false);
      setReorderToastOpen(true);
    },
    [replaceCustomAttributes, schema, setReorderSheetOpen],
  );

  const sections = schema.sections ?? [];

  const auditLogAttribute = auditLogAttributeId
    ? [...customAttributes, ...schema.attributes].find((a) => a.id === auditLogAttributeId)
    : null;

  const editingLastModified = editingAttribute
    ? [...auditLog].reverse().find((e) => e.attributeId === editingAttribute.id) ?? null
    : null;

  return (
    <Stack gap={3}>
      {showAttributeOrderTools && (
        <Alert
          severity="info"
          action={
            <Button component={RouterLink} to={FORM_PREVIEW_DESTINATION_ROUTE} variant="outlined" size="small" color="inherit">
              {STR.formPreview.viewInContext}
            </Button>
          }
        >
          <Typography variant="body1">{STR.formPreview.disclaimer}</Typography>
        </Alert>
      )}

      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ md: "center" }}
        justifyContent="space-between"
        gap={2}
      >
        <ToggleButtonGroup
          exclusive
          size="small"
          value={filterMode}
          onChange={(_, v: FilterMode | null) => {
            if (v != null) setFilterMode(v);
          }}
          aria-label={STR.schemaManagement.attributeFilterAria}
        >
          <ToggleButton value="all" aria-label={STR.schemaManagement.filterAll}>
            {STR.schemaManagement.filterAll}
          </ToggleButton>
          <ToggleButton value="base" aria-label={STR.schemaManagement.filterBase}>
            {STR.schemaManagement.filterBase}
          </ToggleButton>
          <ToggleButton value="custom" aria-label={STR.schemaManagement.filterCustom}>
            {STR.schemaManagement.filterCustom}
          </ToggleButton>
        </ToggleButtonGroup>

        <Stack direction="row" gap={1} flexShrink={0} flexWrap="wrap" justifyContent={{ xs: "flex-start", md: "flex-end" }}>
          <Button variant="text" startIcon={<HistoryIcon aria-hidden />} onClick={openGlobalAuditLog} aria-label={STR.auditLog.globalTitle}>
            {STR.auditLog.auditLogButton}
          </Button>
          <Button variant="contained" startIcon={<AddIcon aria-hidden />} onClick={handleAdd} aria-label={STR.schemaManagement.addCustomAttribute}>
            {STR.schemaManagement.addCustomAttribute}
          </Button>
        </Stack>
      </Stack>

      <Stack gap={3} sx={{ width: 1 }}>
        {mergedSections.map((section) => {
          const filtered = applyAttributeFilter(section.attributes, filterMode);
          const showDep = deprecatedVisibleBySection[section.id] === true;
          const visibleRows = hideDeprecatedRows(filtered, showDep);
          const deprecatedInFiltered = filtered.filter((a) => a.lifecycleStatus === "deprecated").length;

          return (
            <Box key={section.id}>
              <Typography component="h2" variant="h4" sx={{ fontWeight: 600, mb: 1, px: 2 }}>
                {section.title}
              </Typography>
              <Box
                sx={{
                  overflow: "hidden",
                }}
              >
                {visibleRows.length === 0 ? (
                  <Typography
                    variant="body2"
                    sx={({ tokens }) => ({
                      px: 2,
                      py: 3,
                      color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                    })}
                  >
                    {STR.schemaManagement.sectionEmptyForFilter}
                  </Typography>
                ) : (
                  <Box sx={{ overflow: "hidden" }}>
                    {visibleRows.map((attr, index) => (
                      <Box
                        key={attr.id}
                        sx={({ tokens }) =>
                          index < visibleRows.length - 1
                            ? {
                                borderBottom: "1px solid",
                                borderColor: uiDividerDefaultBorderColor(tokens),
                              }
                            : undefined
                        }
                      >
                        <AttributeListRow
                          attribute={attr}
                          readonly={attr.isOotb === true}
                          onEdit={attr.isOotb ? undefined : handleEdit}
                          onViewHistory={attr.isOotb ? undefined : handleViewHistory}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                {deprecatedInFiltered > 0 && (
                  <Box
                    sx={({ tokens }) => ({
                      px: 1.5,
                      py: 1,
                      borderTop: "1px solid",
                      borderColor: uiDividerDefaultBorderColor(tokens),
                    })}
                  >
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      underline="always"
                      onClick={() =>
                        setDeprecatedVisibleBySection((prev) => ({
                          ...prev,
                          [section.id]: !showDep,
                        }))
                      }
                      sx={({ tokens }) => ({
                        color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                        cursor: "pointer",
                      })}
                    >
                      {showDep
                        ? STR.schemaManagement.hideRecentlyDeleted
                        : STR.schemaManagement.showRecentlyDeleted(deprecatedInFiltered)}
                    </Link>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Stack>

      <AttributeFormSheet
        mode={sheetMode}
        editingAttribute={editingAttribute}
        onSave={handleSave}
        onClose={handleSheetClose}
        allowedTypes={allowedTypes}
        existingAttributes={customAttributes}
        lastModifiedEntry={editingLastModified}
        onViewHistory={
          editingAttribute ? () => openAttributeAuditLog(editingAttribute.id) : undefined
        }
        onRequestDelete={handleRequestDelete}
        sections={sections}
      />

      <DeprecationDialog
        attribute={deletingAttribute}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingAttribute(null)}
      />

      <AuditLogDrawer
        open={auditLogOpen}
        entries={auditLog}
        attributeId={auditLogAttributeId}
        attributeName={auditLogAttribute?.name}
        onClose={closeAuditLog}
        onViewFullLog={openGlobalAuditLog}
        onSelectAttribute={openAttributeAuditLog}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={toast.severity === "error" ? null : 5000}
        onClose={hideToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ top: "88px !important", right: "24px !important" }}
      >
        <Alert severity={toast.severity} aria-live="polite" onClose={hideToast} sx={atlasToastAlertSurfaceSx}>
          {toast.message}
          {toast.attributeId && (
            <>
              {" "}
              <Link
                component="button"
                underline="always"
                onClick={() => {
                  openAttributeAuditLog(toast.attributeId!);
                  hideToast();
                }}
                sx={{ verticalAlign: "baseline", cursor: "pointer" }}
              >
                {STR.auditLog.viewHistory}
              </Link>
            </>
          )}
        </Alert>
      </Snackbar>

      <Snackbar
        open={reorderToastOpen}
        autoHideDuration={5000}
        onClose={() => setReorderToastOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ top: "88px !important", right: "24px !important" }}
      >
        <Alert severity="success" aria-live="polite" onClose={() => setReorderToastOpen(false)} sx={atlasToastAlertSurfaceSx}>
          {STR.formPreview.formUpdatedToast}
        </Alert>
      </Snackbar>

      {showAttributeOrderTools && (
        <FormPreviewReorderSheet
          open={reorderSheetOpen}
          attributes={customAttributes}
          schema={schema}
          onDismiss={() => setReorderSheetOpen(false)}
          onSave={handleReorderSheetSave}
        />
      )}
    </Stack>
  );
};
