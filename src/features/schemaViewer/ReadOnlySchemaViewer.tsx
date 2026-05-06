import type { FC } from "react";
import { Box, Divider, Stack, Typography } from "@mui/material";
import type { ObjectSchema } from "../../types/attribute.js";
import { AttributeRenderer } from "../../components/attributes/AttributeRenderer/AttributeRenderer.js";
import { uiDividerDefaultBorderColor } from "../../utils/uiDividerBorder.js";

interface Props {
  schema: ObjectSchema;
  /**
   * When true, write controls (create, edit, delete) are shown for Schema Administrators.
   * This is the M1 schema management capability layered on top of the M0 read-only view.
   * The M1 schema management UI extends this surface — it does not replace it.
   * In M0 this is always false.
   */
  canManageSchema?: boolean;
}

/**
 * Object Library component: read-only schema viewer.
 * Displays object name, description, and all attributes with type and semantic description.
 * Host apps embed this component — they do not build their own schema viewer.
 *
 * Extensibility: pass canManageSchema=true to activate M1 write controls.
 */
export const ReadOnlySchemaViewer: FC<Props> = ({ schema, canManageSchema = false }) => {
  const ootbAttributes = schema.attributes.filter((a) => a.isOotb !== false);
  const customAttributes = schema.attributes.filter((a) => a.isOotb === false);

  return (
    <Stack gap={3}>
      {/* Object header */}
      <Box>
        <Typography variant="h5" component="h2">
          {schema.objectName}
        </Typography>
        {schema.objectDescription && (
          <Typography
            variant="body2"
            sx={({ tokens }) => ({
              color: tokens.semantic.color.type.muted.value,
              mt: 0.5,
            })}
          >
            {schema.objectDescription}
          </Typography>
        )}
      </Box>

      <Divider />

      {/* OOTB attributes — flat list, M0 default (no sections until M3) */}
      <Stack>
        {ootbAttributes.map((attr) => (
          <AttributeRenderer key={attr.id} definition={attr} state="readOnly" />
        ))}
      </Stack>

      {/* Custom attributes section — rendered when present (M1 data) */}
      {customAttributes.length > 0 && (
        <>
          <Divider />
          <Typography variant="subtitle2" component="h3">
            Custom attributes
          </Typography>
          <Stack>
            {customAttributes.map((attr) => (
              <AttributeRenderer key={attr.id} definition={attr} state="readOnly" />
            ))}
          </Stack>
        </>
      )}

      {/*
       * M1 TODO: When canManageSchema is true, render:
       * - "Add attribute" button
       * - Edit and delete controls per attribute
       * - Recently deleted attributes (visually distinct)
       * The M1 schema management UI extends this surface; consult M1 FR-1 through FR-17.
       */}
      {canManageSchema && (
        <Box
          sx={({ tokens }) => ({
            mt: 1,
            p: 2,
            border: "1px dashed",
            borderColor: uiDividerDefaultBorderColor(tokens),
            borderRadius: 1,
          })}
        >
          <Typography
            variant="caption"
            sx={({ tokens }) => ({ color: tokens.semantic.color.type.muted.value })}
          >
            Schema management controls (M1) — coming soon
          </Typography>
        </Box>
      )}
    </Stack>
  );
};
