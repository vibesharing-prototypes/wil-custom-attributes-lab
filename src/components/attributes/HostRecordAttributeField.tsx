import { useId, type FC, type ReactNode } from "react";
import {
  Autocomplete,
  Box,
  FormControl,
  FormControlLabel,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type { AttributeDefinition, Option } from "../../types/attribute.js";
import { STR } from "../../utils/i18n.js";
import { DeprecatedChip } from "../../features/schemaManagement/components/DeprecatedChip.js";
import { HostRecordAttachmentControl, type AttachmentListItem } from "./HostRecordAttachmentControl.js";

/** Sample directory users for `user` / `users` fields (prototype only). */
const SAMPLE_DIRECTORY_USERS = [
  { id: "user-samira", label: "Samira Okafor" },
  { id: "user-jordan", label: "Jordan Lee" },
  { id: "user-marcus", label: "Marcus Chen" },
  { id: "user-elena", label: "Elena Vasquez" },
] as const;

/** Label text + optional deprecated chip at end (destination record preview). */
export function hostRecordFieldLabelNode(definition: AttributeDefinition): ReactNode {
  const isDeprecated = definition.lifecycleStatus === "deprecated";
  return (
    <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.75} component="span">
      <Box component="span" sx={{ fontWeight: 500 }}>
        {definition.name}
      </Box>
      {isDeprecated && <DeprecatedChip reason={definition.deprecationReason} />}
    </Stack>
  );
}

export interface HostRecordAttributeFieldProps {
  definition: AttributeDefinition;
  value: unknown;
  onChange: (next: unknown) => void;
}

/**
 * Renders a host-style editable control for a schema attribute (Risk manager destination preview).
 * Maps Object Library attribute types to appropriate MUI inputs — not wired to a real API.
 */
export const HostRecordAttributeField: FC<HostRecordAttributeFieldProps> = ({ definition, value, onChange }) => {
  const baseId = useId();
  const fieldId = `${baseId}-${definition.id}`;
  const helperId = `${fieldId}-helper`;
  const isDeprecated = definition.lifecycleStatus === "deprecated";
  const disabled = isDeprecated;
  const helperText = definition.semanticDescription;
  const fieldLabel = hostRecordFieldLabelNode(definition);

  const commonInputProps = {
    id: fieldId,
    disabled,
    size: "medium" as const,
    fullWidth: true,
    label: fieldLabel,
    error: isDeprecated,
    helperText,
    FormHelperTextProps: { id: helperId },
    inputProps: { "aria-describedby": helperId },
  };

  switch (definition.type) {
    case "text":
    case "url":
    case "email":
    case "phone": {
      const inputType =
        definition.type === "url" ? "url" : definition.type === "email" ? "email" : definition.type === "phone" ? "tel" : "text";
      return (
        <Box component="section" aria-labelledby={fieldId}>
          <TextField
            {...commonInputProps}
            value={value == null ? "" : String(value)}
            onChange={(e) => onChange(e.target.value)}
            type={inputType}
            multiline={false}
          />
        </Box>
      );
    }

    case "longText":
      return (
        <Box component="section" aria-labelledby={fieldId}>
          <TextField
            {...commonInputProps}
            value={value == null ? "" : String(value)}
            onChange={(e) => onChange(e.target.value)}
            multiline
            minRows={4}
          />
        </Box>
      );

    case "number": {
      const n = value == null || value === "" ? "" : String(value);
      return (
        <Box component="section" aria-labelledby={fieldId}>
          <TextField
            {...commonInputProps}
            value={n}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") onChange("");
              else if (!Number.isNaN(Number(raw))) onChange(Number(raw));
            }}
            type="number"
          />
        </Box>
      );
    }

    case "currency": {
      const str = value == null ? "" : String(value);
      return (
        <Box component="section" aria-labelledby={fieldId}>
          <TextField
            {...commonInputProps}
            value={str}
            onChange={(e) => onChange(e.target.value)}
            type="text"
            InputProps={{
              startAdornment: <InputAdornment position="start">USD</InputAdornment>,
            }}
          />
        </Box>
      );
    }

    case "date": {
      const str = value == null ? "" : String(value).slice(0, 10);
      return (
        <Box component="section" aria-labelledby={fieldId}>
          <TextField
            {...commonInputProps}
            value={str}
            onChange={(e) => onChange(e.target.value)}
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      );
    }

    case "dateTime": {
      const str = value == null ? "" : String(value);
      return (
        <Box component="section" aria-labelledby={fieldId}>
          <TextField
            {...commonInputProps}
            value={str}
            onChange={(e) => onChange(e.target.value)}
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      );
    }

    case "boolean":
      return (
        <Box component="section">
          <FormControl error={isDeprecated} disabled={disabled} variant="standard" sx={{ width: 1 }}>
            <Stack sx={{ mt: 0.5 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!value}
                    onChange={(e) => onChange(e.target.checked)}
                    inputProps={{ "aria-describedby": helperId }}
                  />
                }
                label={fieldLabel}
              />
              {helperText && (
                <Typography
                  id={helperId}
                  variant="body1"
                  component="p"
                  sx={({ tokens }) => ({
                    m: 0,
                    mt: 0.5,
                    ml: 4.5,
                    color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                  })}
                >
                  {helperText}
                </Typography>
              )}
            </Stack>
          </FormControl>
        </Box>
      );

    case "singleSelect": {
      const options = definition.options ?? [];
      const selected = options.find((o) => o.id === value) ?? null;
      return (
        <Box component="section" aria-labelledby={fieldId}>
          <Autocomplete<Option, false, false, false>
            disabled={disabled}
            options={options}
            getOptionLabel={(o) => o.label}
            getOptionDisabled={(o) => !!o.deprecated && o.id !== value}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            value={selected}
            onChange={(_, opt) => onChange(opt?.id ?? "")}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.label}
                {option.deprecated ? ` (${STR.deprecated})` : ""}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label={fieldLabel}
                error={isDeprecated}
                helperText={helperText}
                disabled={disabled}
                fullWidth
                size="medium"
                FormHelperTextProps={{ id: helperId }}
                inputProps={{
                  ...params.inputProps,
                  "aria-describedby": helperId,
                }}
              />
            )}
          />
        </Box>
      );
    }

    case "multiSelect": {
      const options = definition.options ?? [];
      const ids = Array.isArray(value) ? (value as string[]) : [];
      const selected = options.filter((o) => ids.includes(o.id));
      return (
        <Box component="section" aria-labelledby={fieldId}>
          <Autocomplete<Option, true, false, false>
            disabled={disabled}
            multiple
            options={options}
            getOptionLabel={(o) => o.label}
            getOptionDisabled={(o) => {
              if (!o.deprecated) return false;
              const ids = Array.isArray(value) ? (value as string[]) : [];
              return !ids.includes(o.id);
            }}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            value={selected}
            onChange={(_, opts) => onChange(opts.map((o) => o.id))}
            renderInput={(params) => (
              <TextField
                {...params}
                label={fieldLabel}
                error={isDeprecated}
                helperText={helperText}
                disabled={disabled}
                fullWidth
                size="medium"
                FormHelperTextProps={{ id: helperId }}
                inputProps={{
                  ...params.inputProps,
                  "aria-describedby": helperId,
                }}
              />
            )}
          />
        </Box>
      );
    }

    case "user": {
      const opts = [...SAMPLE_DIRECTORY_USERS];
      const selected = opts.find((u) => u.id === value) ?? null;
      return (
        <Box component="section" aria-labelledby={fieldId}>
          <Autocomplete<(typeof SAMPLE_DIRECTORY_USERS)[number], false, false, false>
            disabled={disabled}
            options={opts}
            getOptionLabel={(u) => u.label}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            value={selected}
            onChange={(_, u) => onChange(u?.id ?? "")}
            renderInput={(params) => (
              <TextField
                {...params}
                label={fieldLabel}
                error={isDeprecated}
                helperText={helperText}
                disabled={disabled}
                fullWidth
                size="medium"
                placeholder={STR.formPreviewDestination.hostFormUserPlaceholder}
                FormHelperTextProps={{ id: helperId }}
                inputProps={{
                  ...params.inputProps,
                  "aria-describedby": helperId,
                }}
              />
            )}
          />
        </Box>
      );
    }

    case "users": {
      const opts = [...SAMPLE_DIRECTORY_USERS];
      const ids = Array.isArray(value) ? (value as string[]) : [];
      const selected = opts.filter((u) => ids.includes(u.id));
      return (
        <Box component="section" aria-labelledby={fieldId}>
          <Autocomplete<(typeof SAMPLE_DIRECTORY_USERS)[number], true, false, false>
            disabled={disabled}
            multiple
            options={opts}
            getOptionLabel={(u) => u.label}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            value={selected}
            onChange={(_, users) => onChange(users.map((u) => u.id))}
            renderInput={(params) => (
              <TextField
                {...params}
                label={fieldLabel}
                error={isDeprecated}
                helperText={helperText}
                disabled={disabled}
                fullWidth
                size="medium"
                placeholder={STR.formPreviewDestination.hostFormUsersPlaceholder}
                FormHelperTextProps={{ id: helperId }}
                inputProps={{
                  ...params.inputProps,
                  "aria-describedby": helperId,
                }}
              />
            )}
          />
        </Box>
      );
    }

    case "attachment": {
      const files = Array.isArray(value) ? (value as AttachmentListItem[]) : [];
      const multiple = definition.attachmentMode !== "single";

      return (
        <HostRecordAttachmentControl
          fieldId={fieldId}
          helperId={helperId}
          titleLabel={fieldLabel}
          helperText={helperText}
          isDeprecated={isDeprecated}
          disabled={disabled}
          multiple={multiple}
          files={files}
          onChange={(next) => onChange(next)}
        />
      );
    }

    default: {
      return (
        <Box component="section">
          <Typography variant="body1" color="text.secondary">
            {definition.name}: unsupported type in destination preview
          </Typography>
        </Box>
      );
    }
  }
};
