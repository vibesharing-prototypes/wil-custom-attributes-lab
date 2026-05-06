import type { FC } from "react";
import { useState } from "react";
import { PageHeader } from "@diligentcorp/atlas-react-bundle";
import CircleLineIcon from "@diligentcorp/atlas-react-bundle/icons/CircleLine";
import PenIcon from "@diligentcorp/atlas-react-bundle/icons/Pen";
import VisibleIcon from "@diligentcorp/atlas-react-bundle/icons/Visible";
import {
  Box,
  FormControl,
  FormControlLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import PageLayout from "../components/PageLayout.js";
import { PermissionLevelPick } from "../features/roleAccessControl/PermissionLevelPick.js";
import type { PermissionLevel } from "../features/roleAccessControl/types.js";
import { STR } from "../utils/i18n.js";
import { uiDividerDefaultBorderColor } from "../utils/uiDividerBorder.js";

const S = STR.explorations.permissionCardStyles;

const SAMPLE_ROW_DEFS = [
  { id: "overview", label: S.rowOverview },
  { id: "details", label: S.rowDetails },
  { id: "assessment", label: S.rowAssessment },
  { id: "mitigation", label: S.rowMitigation },
  { id: "ownership", label: S.rowOwnership },
] as const;

type RowId = (typeof SAMPLE_ROW_DEFS)[number]["id"];

function rowMapFrom(
  tuples: readonly [RowId, PermissionLevel][],
): Record<RowId, PermissionLevel> {
  return Object.fromEntries(tuples) as Record<RowId, PermissionLevel>;
}

const INITIAL_RADIO = rowMapFrom([
  ["overview", "view"],
  ["details", "view"],
  ["assessment", "edit"],
  ["mitigation", "edit"],
  ["ownership", "view"],
]);

const INITIAL_DROPDOWN = rowMapFrom([
  ["overview", "edit"],
  ["details", "view"],
  ["assessment", "none"],
  ["mitigation", "view"],
  ["ownership", "edit"],
]);

const INITIAL_ICONS = rowMapFrom([
  ["overview", "edit"],
  ["details", "none"],
  ["assessment", "edit"],
  ["mitigation", "view"],
  ["ownership", "view"],
]);

const INITIAL_LEGACY = rowMapFrom([
  ["overview", "view"],
  ["details", "edit"],
  ["assessment", "none"],
  ["mitigation", "view"],
  ["ownership", "edit"],
]);

function PermissionStyleCardHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <Box
      sx={({ tokens }) => ({
        px: 2,
        pt: 2,
        pb: 1.5,
        borderBottom: 1,
        borderColor: uiDividerDefaultBorderColor(tokens),
      })}
    >
      <Stack direction="row" alignItems="baseline" gap={1} flexWrap="wrap" columnGap={1.5}>
        <Typography component="h2" variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          {subtitle}
        </Typography>
      </Stack>
    </Box>
  );
}

/** Same control and row layout as `CustomRoleEditView` custom permission rows. */
const ResponsiveRoleEditorPermissionCard: FC = () => {
  const [levels, setLevels] = useState<Record<RowId, PermissionLevel>>(() => ({
    ...INITIAL_RADIO,
  }));

  return (
    <Paper
      variant="outlined"
      sx={({ tokens }) => ({
        borderRadius: 2,
        borderColor: uiDividerDefaultBorderColor(tokens),
        overflow: "hidden",
      })}
    >
      <PermissionStyleCardHeader title={S.cardResponsiveTitle} subtitle={S.cardResponsiveSubtitle} />
      <Box sx={{ px: 2, py: 0.5 }}>
        {SAMPLE_ROW_DEFS.map((row, index) => {
          const labelId = `perm-responsive-${row.id}-label`;
          return (
            <Box
              key={row.id}
              sx={({ tokens }) => ({
                display: "flex",
                flexDirection: "row",
                alignItems: { xs: "flex-start", md: "center" },
                justifyContent: "space-between",
                gap: 2,
                py: 1.75,
                borderBottom:
                  index < SAMPLE_ROW_DEFS.length - 1 ? `1px solid` : "none",
                borderColor:
                  index < SAMPLE_ROW_DEFS.length - 1
                    ? uiDividerDefaultBorderColor(tokens)
                    : undefined,
              })}
            >
              <Typography
                id={labelId}
                component="span"
                variant="body1"
                sx={{ flex: "1 1 auto", minWidth: 0, wordBreak: "break-word" }}
              >
                {row.label}
              </Typography>
              <PermissionLevelPick
                name={`explore-responsive-${row.id}`}
                ariaLabelledby={labelId}
                value={levels[row.id]}
                onChange={(level) => setLevels((prev) => ({ ...prev, [row.id]: level }))}
              />
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

const LegacySegmentedTogglePermissionCard: FC = () => {
  const [levels, setLevels] = useState<Record<RowId, PermissionLevel>>(() => ({
    ...INITIAL_LEGACY,
  }));

  return (
    <Paper
      variant="outlined"
      sx={({ tokens }) => ({
        borderRadius: 2,
        borderColor: uiDividerDefaultBorderColor(tokens),
        overflow: "hidden",
      })}
    >
      <PermissionStyleCardHeader title={S.cardLegacyTitle} subtitle={S.cardLegacySubtitle} />
      <Box sx={{ px: 2, py: 0.5 }}>
        {SAMPLE_ROW_DEFS.map((row, index) => (
          <Box
            key={row.id}
            sx={({ tokens }) => ({
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              py: 1.75,
              borderBottom:
                index < SAMPLE_ROW_DEFS.length - 1 ? `1px solid` : "none",
              borderColor:
                index < SAMPLE_ROW_DEFS.length - 1
                  ? uiDividerDefaultBorderColor(tokens)
                  : undefined,
            })}
          >
            <Typography variant="body1" sx={{ flex: 1, minWidth: 0 }}>
              {row.label}
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={levels[row.id]}
              onChange={(_, v) => {
                if (v != null) setLevels((prev) => ({ ...prev, [row.id]: v as PermissionLevel }));
              }}
              aria-label={`${row.label} — ${STR.roleAccess.allowPermissionsTitle}`}
              sx={{ flexShrink: 0 }}
            >
              <ToggleButton value="none">{STR.roleAccess.levelNone}</ToggleButton>
              <ToggleButton value="view">{STR.roleAccess.levelView}</ToggleButton>
              <ToggleButton value="edit">{STR.roleAccess.levelEdit}</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

const InlineRadioPermissionCard: FC = () => {
  const [levels, setLevels] = useState<Record<RowId, PermissionLevel>>(() => ({
    ...INITIAL_RADIO,
  }));

  const setLevel = (id: RowId, level: PermissionLevel) => {
    setLevels((prev) => ({ ...prev, [id]: level }));
  };

  return (
    <Paper
      variant="outlined"
      sx={({ tokens }) => ({
        borderRadius: 2,
        borderColor: uiDividerDefaultBorderColor(tokens),
        overflow: "hidden",
      })}
    >
      <PermissionStyleCardHeader title={S.cardInlineRadioTitle} subtitle={S.cardInlineRadioSubtitle} />
      <Box sx={{ px: 2, py: 0.5 }}>
        {SAMPLE_ROW_DEFS.map((row, index) => {
          const labelId = `perm-inline-${row.id}-label`;
          return (
            <Box
              key={row.id}
              sx={({ tokens }) => ({
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                py: 1.75,
                borderBottom:
                  index < SAMPLE_ROW_DEFS.length - 1 ? `1px solid` : "none",
                borderColor:
                  index < SAMPLE_ROW_DEFS.length - 1
                    ? uiDividerDefaultBorderColor(tokens)
                    : undefined,
              })}
            >
              <Typography
                id={labelId}
                component="span"
                variant="body1"
                sx={{ flex: 1, minWidth: 0 }}
              >
                {row.label}
              </Typography>
              <RadioGroup
                row
                aria-labelledby={labelId}
                name={`perm-inline-${row.id}`}
                value={levels[row.id]}
                onChange={(_, v) => setLevel(row.id, v as PermissionLevel)}
                sx={{
                  flexShrink: 0,
                  flexDirection: "row",
                  flexWrap: "nowrap",
                  columnGap: "16px",
                  m: 0,
                  "& .MuiFormControlLabel-root": { mr: 0, ml: 0 },
                }}
              >
                {(["none", "view", "edit"] as const).map((level) => (
                  <FormControlLabel
                    key={level}
                    value={level}
                    control={<Radio size="small" color="primary" disableRipple />}
                    sx={{
                      mr: 0,
                      ml: 0,
                      columnGap: "12px",
                      alignItems: "center",
                      "& .MuiFormControlLabel-label": {
                        marginInlineStart: 0,
                      },
                    }}
                    label={
                      <Typography
                        variant="body1"
                        component="span"
                        sx={{
                          color:
                            levels[row.id] === level ? "primary.main" : "text.secondary",
                        }}
                      >
                        {level === "none"
                          ? STR.roleAccess.levelNone
                          : level === "view"
                            ? STR.roleAccess.levelView
                            : STR.roleAccess.levelEdit}
                      </Typography>
                    }
                  />
                ))}
              </RadioGroup>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

const DropdownPermissionCard: FC = () => {
  const [levels, setLevels] = useState<Record<RowId, PermissionLevel>>(() => ({
    ...INITIAL_DROPDOWN,
  }));

  const onSelect = (id: RowId) => (e: SelectChangeEvent<PermissionLevel>) => {
    setLevels((prev) => ({ ...prev, [id]: e.target.value as PermissionLevel }));
  };

  return (
    <Paper
      variant="outlined"
      sx={({ tokens }) => ({
        borderRadius: 2,
        borderColor: uiDividerDefaultBorderColor(tokens),
        overflow: "hidden",
      })}
    >
      <PermissionStyleCardHeader title={S.cardDropdownTitle} subtitle={S.cardDropdownSubtitle} />
      <Box sx={{ px: 2, py: 0.5 }}>
        {SAMPLE_ROW_DEFS.map((row, index) => (
          <Box
            key={row.id}
            sx={({ tokens }) => ({
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              py: 1.75,
              borderBottom:
                index < SAMPLE_ROW_DEFS.length - 1 ? `1px solid` : "none",
              borderColor:
                index < SAMPLE_ROW_DEFS.length - 1
                  ? uiDividerDefaultBorderColor(tokens)
                  : undefined,
            })}
          >
            <Typography variant="body1" sx={{ flex: 1, minWidth: 0 }}>
              {row.label}
            </Typography>
            <FormControl sx={{ minWidth: 112, flexShrink: 0 }}>
              <Select<PermissionLevel>
                value={levels[row.id]}
                onChange={onSelect(row.id)}
                displayEmpty
                inputProps={{
                  "aria-label": `${row.label} — ${STR.roleAccess.allowPermissionsTitle}`,
                }}
              >
                <MenuItem value="none">{STR.roleAccess.levelNone}</MenuItem>
                <MenuItem value="view">{STR.roleAccess.levelView}</MenuItem>
                <MenuItem value="edit">{STR.roleAccess.levelEdit}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

const IconOnlyPermissionCard: FC = () => {
  const [levels, setLevels] = useState<Record<RowId, PermissionLevel>>(() => ({
    ...INITIAL_ICONS,
  }));

  return (
    <Paper
      variant="outlined"
      sx={({ tokens }) => ({
        borderRadius: 2,
        borderColor: uiDividerDefaultBorderColor(tokens),
        overflow: "hidden",
      })}
    >
      <PermissionStyleCardHeader title={S.cardIconTitle} subtitle={S.cardIconSubtitle} />
      <Box sx={{ px: 2, py: 0.5 }}>
        {SAMPLE_ROW_DEFS.map((row, index) => (
          <Box
            key={row.id}
            sx={({ tokens }) => ({
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              py: 1.75,
              borderBottom:
                index < SAMPLE_ROW_DEFS.length - 1 ? `1px solid` : "none",
              borderColor:
                index < SAMPLE_ROW_DEFS.length - 1
                  ? uiDividerDefaultBorderColor(tokens)
                  : undefined,
            })}
          >
            <Typography variant="body1" sx={{ flex: 1, minWidth: 0 }}>
              {row.label}
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={levels[row.id]}
              onChange={(_, v) => {
                if (v != null) setLevels((prev) => ({ ...prev, [row.id]: v as PermissionLevel }));
              }}
              aria-label={`${row.label} — ${STR.roleAccess.allowPermissionsTitle}`}
              sx={{ flexShrink: 0, gap: 0.5 }}
            >
              <Tooltip title={STR.roleAccess.levelNone}>
                <ToggleButton value="none" aria-label={STR.roleAccess.levelNone} sx={{ px: 1, py: 0.75, minWidth: 40 }}>
                  <CircleLineIcon size="md" aria-hidden />
                </ToggleButton>
              </Tooltip>
              <Tooltip title={STR.roleAccess.levelView}>
                <ToggleButton value="view" aria-label={STR.roleAccess.levelView} sx={{ px: 1, py: 0.75, minWidth: 40 }}>
                  <VisibleIcon size="md" aria-hidden />
                </ToggleButton>
              </Tooltip>
              <Tooltip title={STR.roleAccess.levelEdit}>
                <ToggleButton value="edit" aria-label={STR.roleAccess.levelEdit} sx={{ px: 1, py: 0.75, minWidth: 40 }}>
                  <PenIcon size="md" aria-hidden />
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

/**
 * Explorations: side-by-side permission row patterns for roles / PAC-style UIs.
 */
const PermissionCardStylesExplorationPage: FC = () => {
  return (
    <PageLayout>
      <PageHeader pageTitle={S.pageTitle} pageSubtitle={S.pageSubtitle} />
      <Stack gap={3} sx={{ maxWidth: 720 }}>
        <ResponsiveRoleEditorPermissionCard />
        <LegacySegmentedTogglePermissionCard />
        <InlineRadioPermissionCard />
        <DropdownPermissionCard />
        <IconOnlyPermissionCard />
      </Stack>
    </PageLayout>
  );
};

export default PermissionCardStylesExplorationPage;
