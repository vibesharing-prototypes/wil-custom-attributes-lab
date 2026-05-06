import type { FC } from "react";
import { useCallback, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  Link,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import DataIcon from "@diligentcorp/atlas-react-bundle/icons/Data";
import LinkIcon from "@diligentcorp/atlas-react-bundle/icons/Link";
import type { AttributeDefinition } from "../../../types/attribute.js";
import type { AuditLogEntry } from "../types.js";
import { atlasToastAlertSurfaceSx } from "../../../utils/atlasToastLayout.js";
import { STR } from "../../../utils/i18n.js";
import { useSchemaManagement } from "../hooks/useSchemaManagement.js";
import { AttributeManagementList } from "../components/AttributeManagementList.js";
import { AttributeFormSheet } from "../components/AttributeFormSheet.js";
import { AuditLogDrawer } from "../components/AuditLogDrawer.js";
import { DeleteAttributeDialog } from "../components/DeleteAttributeDialog.js";
import { BOS_ALLOWED_TYPES } from "../components/AttributeTypeSelector.js";
import { BosAttributeRow } from "./BosAttributeRow.js";
import { BosScopeBadge } from "./BosScopeBadge.js";
import type { BosRelationshipField, BosSystemField, BosV2Schema } from "./types.js";
import type { FormSheetMode } from "../types.js";
import { uiDividerDefaultBorderColor } from "../../../utils/uiDividerBorder.js";

interface Props {
  schema: BosV2Schema;
  initialCustomAttributes?: AttributeDefinition[];
  initialAuditEntries?: AuditLogEntry[];
}

/**
 * Schema management view for the BOS v2 exploration.
 *
 * Layout:
 *   1. Base schema — OOTB product attributes with BOS scope badges
 *   2. System & metadata — collapsible infrastructure fields, auto-indexed by BOS
 *   3. Relationship fields — system-computed counts, read-only
 *   4. Custom attributes — full CRUD (reuses existing AttributeManagementList)
 *   5. Side sheet, dialogs, drawer, toasts — same interaction pattern as SchemaManagementView
 *
 * Non-breaking: does not modify any existing component. All new components live
 * in the bos/ folder and are only used by this view and SchemaManagementBosV2Page.
 */
export const SchemaManagementBosV2View: FC<Props> = ({
  schema,
  initialCustomAttributes = [],
  initialAuditEntries = [],
}) => {
  const {
    customAttributes,
    auditLog,
    toast,
    hideToast,
    addAttribute,
    updateAttribute,
    deleteAttribute,
  } = useSchemaManagement(initialCustomAttributes, initialAuditEntries);

  const [sheetMode, setSheetMode] = useState<FormSheetMode>(null);
  const [editingAttribute, setEditingAttribute] = useState<AttributeDefinition | null>(null);
  const [deletingAttribute, setDeletingAttribute] = useState<AttributeDefinition | null>(null);
  const [auditLogOpen, setAuditLogOpen] = useState(false);
  const [auditLogAttributeId, setAuditLogAttributeId] = useState<string | null>(null);
  const [systemSectionOpen, setSystemSectionOpen] = useState(false);

  const openGlobalAuditLog = useCallback(() => {
    setAuditLogAttributeId(null);
    setAuditLogOpen(true);
  }, []);

  const openAttributeAuditLog = useCallback((attributeId: string) => {
    setAuditLogAttributeId(attributeId);
    setAuditLogOpen(true);
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
    if (!attr || attr.isOotb) return;
    setDeletingAttribute(attr);
  }, [editingAttribute]);

  const handleDeleteConfirm = useCallback(
    (id: string, reason?: string) => {
      const attr = deletingAttribute ?? customAttributes.find((a) => a.id === id);
      if (attr) deleteAttribute(attr, reason);
      handleSheetClose();
    },
    [deleteAttribute, deletingAttribute, customAttributes, handleSheetClose],
  );

  const handleViewHistory = useCallback(
    (attr: AttributeDefinition) => {
      openAttributeAuditLog(attr.id);
    },
    [openAttributeAuditLog],
  );

  const auditLogAttributeName = auditLogAttributeId
    ? customAttributes.find((a) => a.id === auditLogAttributeId)?.name ??
      [...auditLog].reverse().find((e) => e.attributeId === auditLogAttributeId)?.attributeName ??
      null
    : null;

  const editingLastModified = editingAttribute
    ? [...auditLog].reverse().find((e) => e.attributeId === editingAttribute.id) ?? null
    : null;

  return (
    <Stack gap={4}>
      {/* ── 1. Base schema (OOTB product attributes) ── */}
      <Box>
        <Typography variant="h2" sx={{ fontWeight: 600 }}>
          Base schema
        </Typography>
        <Typography
          variant="body2"
          sx={({ tokens }) => ({ color: tokens.semantic.color.type?.default?.value ?? "text.primary", mt: 0.5, mb: 2 })}
        >
          Built-in attributes provided by the platform. Each row shows the current BOS export scope and the
          planned next-iteration scope.
        </Typography>

        <Box sx={{ borderRadius: 1, overflow: "hidden" }}>
          {schema.ootbFields.map((field) => (
            <BosAttributeRow key={field.id} field={field} />
          ))}
        </Box>

        {/* ── System & metadata (collapsible) ── */}
        <Accordion
          disableGutters
          elevation={0}
          expanded={systemSectionOpen}
          onChange={(_, isExpanded) => setSystemSectionOpen(isExpanded)}
          sx={({ tokens }) => ({
            mt: 2,
            border: "1px solid",
            borderColor: uiDividerDefaultBorderColor(tokens),
            borderRadius: "8px !important",
            "&:before": { display: "none" },
            backgroundColor: tokens.semantic.color.surface?.subtle?.value ?? "transparent",
          })}
        >
          <AccordionSummary
            expandIcon={<ExpandDownIcon />}
            sx={{
              px: 2,
              minHeight: 0,
              "& .MuiAccordionSummary-content": { my: 1.5, mr: 1, alignItems: "center" },
              "& .MuiAccordionSummary-expandIconWrapper": { transform: "rotate(0deg)" },
              "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": { transform: "rotate(180deg)" },
            }}
          >
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Box
                sx={({ tokens }) => ({
                  color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                  display: "flex",
                })}
              >
                <DataIcon aria-hidden />
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Typography variant="body2" fontWeight={500}>
                    System &amp; metadata fields
                  </Typography>
                  <Chip
                    label={`${schema.systemFields.length} fields`}
                    size="small"
                    variant="outlined"
                    sx={({ tokens }) => ({
                      height: 18,
                      fontSize: "0.65rem",
                      borderColor: uiDividerDefaultBorderColor(tokens),
                    })}
                  />
                </Stack>
                <Typography
                  variant="caption"
                  sx={({ tokens }) => ({ color: tokens.semantic.color.type?.muted?.value ?? "text.secondary" })}
                >
                  Infrastructure fields always auto-indexed by BOS — no configuration needed
                </Typography>
              </Box>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
            <Stack gap={0}>
              {schema.systemFields.map((field, index) => (
                <SystemFieldRow
                  key={field.id}
                  field={field}
                  isLast={index === schema.systemFields.length - 1}
                />
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* ── 2. Relationship fields ── */}
      <Box>
        <Stack direction="row" alignItems="center" gap={1.5} mb={1}>
          <Box
            sx={({ tokens }) => ({
              color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
              display: "flex",
            })}
          >
            <LinkIcon aria-hidden />
          </Box>
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 600 }}>
              Relationship fields
            </Typography>
            <Typography
              variant="body2"
              sx={({ tokens }) => ({ color: tokens.semantic.color.type?.default?.value ?? "text.primary" })}
            >
              System-computed integer counts of linked objects. Read-only — not configurable.
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={({ tokens }) => ({
            border: "1px solid",
            borderColor: uiDividerDefaultBorderColor(tokens),
            borderRadius: 1,
            overflow: "hidden",
          })}
        >
          {schema.relationshipFields.map((field, index) => (
            <RelationshipFieldRow
              key={field.id}
              field={field}
              isLast={index === schema.relationshipFields.length - 1}
            />
          ))}
        </Box>
      </Box>

      {/* ── 3. Custom attributes ── */}
      <AttributeManagementList
        attributes={customAttributes}
        auditLog={auditLog}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onViewAuditLog={openGlobalAuditLog}
        onViewAttributeHistory={handleViewHistory}
      />

      {/* ── Side sheet ── */}
      <AttributeFormSheet
        mode={sheetMode}
        editingAttribute={editingAttribute}
        onSave={handleSave}
        onClose={handleSheetClose}
        allowedTypes={BOS_ALLOWED_TYPES}
        existingAttributes={customAttributes}
        lastModifiedEntry={editingLastModified}
        onViewHistory={
          editingAttribute ? () => openAttributeAuditLog(editingAttribute.id) : undefined
        }
        onRequestDelete={handleRequestDelete}
      />

      {/* ── Delete confirmation dialog ── */}
      <DeleteAttributeDialog
        attribute={deletingAttribute}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingAttribute(null)}
      />

      {/* ── Audit log drawer ── */}
      <AuditLogDrawer
        open={auditLogOpen}
        entries={auditLog}
        attributeId={auditLogAttributeId}
        attributeName={auditLogAttributeName}
        onClose={() => setAuditLogOpen(false)}
        onViewFullLog={openGlobalAuditLog}
        onSelectAttribute={openAttributeAuditLog}
      />

      {/* ── Toast ── */}
      <Snackbar
        open={toast.open}
        /* Success and info (and warning): 5s. Error: stay until dismissed — revisit with product. */
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
    </Stack>
  );
};

// ─── Supporting row components ─────────────────────────────────────────────────

interface SystemFieldRowProps {
  field: BosSystemField;
  isLast: boolean;
}

const SystemFieldRow: FC<SystemFieldRowProps> = ({ field, isLast }) => (
  <Box
    sx={({ tokens }) => ({
      py: 1.25,
      px: 1,
      borderBottom: isLast ? "none" : "1px solid",
      borderColor: uiDividerDefaultBorderColor(tokens),
    })}
  >
    <Stack direction="row" alignItems="flex-start" gap={2}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 180, flexShrink: 0 }}>
        <Typography variant="body2" fontWeight={500}>
          {field.name}
        </Typography>
        <BosScopeBadge scope="system" />
      </Stack>
      <Stack gap={0.25} sx={{ minWidth: 0 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography
            variant="caption"
            component="code"
            sx={({ tokens }) => ({
              fontFamily: "monospace",
              color: tokens.semantic.color.type?.secondary?.value ?? "text.secondary",
            })}
          >
            {field.bosFieldKey}
          </Typography>
          <Chip
            label={field.bosType}
            size="small"
            variant="outlined"
            sx={({ tokens }) => ({
              height: 16,
              fontSize: "0.6rem",
              borderColor: uiDividerDefaultBorderColor(tokens),
            })}
          />
        </Stack>
        <Typography
          variant="caption"
          sx={({ tokens }) => ({ color: tokens.semantic.color.type?.muted?.value ?? "text.secondary" })}
        >
          {field.description}
        </Typography>
      </Stack>
    </Stack>
  </Box>
);

interface RelationshipFieldRowProps {
  field: BosRelationshipField;
  isLast: boolean;
}

const RelationshipFieldRow: FC<RelationshipFieldRowProps> = ({ field, isLast }) => (
  <Box
    sx={({ tokens }) => ({
      py: 1.25,
      px: 2,
      borderBottom: isLast ? "none" : "1px solid",
      borderColor: uiDividerDefaultBorderColor(tokens),
    })}
  >
    <Stack direction="row" alignItems="center" gap={2}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 180, flexShrink: 0 }}>
        <Typography variant="body2" fontWeight={500}>
          {field.name}
        </Typography>
        <BosScopeBadge scope="count" />
      </Stack>
      <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          component="code"
          sx={({ tokens }) => ({
            fontFamily: "monospace",
            color: tokens.semantic.color.type?.secondary?.value ?? "text.secondary",
            flexShrink: 0,
          })}
        >
          {field.bosFieldKey}
        </Typography>
        <Chip
          label="integer"
          size="small"
          variant="outlined"
          sx={({ tokens }) => ({
            height: 16,
            fontSize: "0.6rem",
            borderColor: uiDividerDefaultBorderColor(tokens),
          })}
        />
        <Typography
          variant="caption"
          sx={({ tokens }) => ({
            color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          })}
        >
          {field.description}
        </Typography>
      </Stack>
    </Stack>
  </Box>
);
