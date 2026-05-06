import type { FC, ReactNode } from "react";
import { useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Container,
  IconButton,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { SectionHeader } from "@diligentcorp/atlas-react-bundle";
import ArrowLeftIcon from "@diligentcorp/atlas-react-bundle/icons/ArrowLeft";
import { useNavigate } from "react-router";
import { HostRecordAttributeField } from "../components/attributes/HostRecordAttributeField.js";
import { STR } from "../utils/i18n.js";
import { DESTINATION_FORM_INITIAL_VALUES } from "./destinationFormInitialValues.js";
import { usePersistedFormPreviewSections } from "./formPreviewShared.js";

/** Material Design `cloud_done` path rendered via MUI SvgIcon. */
const CloudDoneIcon: FC<{ sx?: object }> = (props) => (
  <SvgIcon {...props} aria-hidden>
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17l5.59-5.59L17 10l-7 7z" />
  </SvgIcon>
);

/**
 * Pill-shaped metadata chip matching Figma spec:
 * surface-variant background, small rounded rect, flex layout.
 */
const MetaChip: FC<{ children: ReactNode }> = ({ children }) => (
  <Box
    component="span"
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: "2px",
      px: 0.5,
      pb: "1px",
      borderRadius: "4px",
      backgroundColor: "var(--Color-Surface-Variant, #F3F3F3)",
      fontSize: "0.8125rem",
      lineHeight: 1.5,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </Box>
);

const FormPreviewDestinationPage: FC = () => {
  const navigate = useNavigate();
  const sections = usePersistedFormPreviewSections();
  const { presets } = useTheme();
  const StatusIndicator = (presets as Record<string, any>).StatusIndicatorPresets?.components
    ?.StatusIndicator as FC<{
    color?: "warning" | "success" | "error" | "information" | "generic" | "subtle";
    label?: string;
    "aria-label"?: string;
  }> | undefined;

  const [values, setValues] = useState<Record<string, unknown>>(() => ({
    ...DESTINATION_FORM_INITIAL_VALUES,
  }));

  return (
    <Box
      component="div"
      sx={({ tokens }) => ({
        minHeight: "100dvh",
        width: "100%",
        background: tokens.semantic.gradients.background.default.value,
      })}
    >
      <Box
        component="header"
        role="banner"
        sx={({ tokens, zIndex }) => ({
          position: "sticky",
          top: 0,
          zIndex: zIndex.appBar,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: tokens.component.globalHeader.gap.value,
          width: 1,
          boxSizing: "border-box",
          minHeight: tokens.component.globalHeader.height.value,
          pl: tokens.component.globalHeader.paddingLeft.value,
          pr: `calc(${tokens.component.globalHeader.paddingRight.value} + 12px)`,
          borderBottomWidth: tokens.component.globalHeader.borderBottomWidth.value,
          borderBottomStyle: tokens.component.globalHeader.borderBottomStyle.value,
          borderBottomColor: tokens.component.globalHeader.borderBottomColor.value,
          backgroundColor: tokens.semantic.color.surface.default.value,
        })}
      >
        <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0, flex: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label={STR.formPreviewDestination.backAria}
            onClick={() => navigate(-1)}
            size="medium"
          >
            <ArrowLeftIcon aria-hidden />
          </IconButton>
          <Typography component="span" variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
            {STR.formPreviewDestination.shellTitle}
          </Typography>
        </Stack>
      </Box>

      <Box component="main">
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Stack gap={3}>
            {/* ── Breadcrumbs ── */}
            <Breadcrumbs aria-label="Breadcrumb" sx={{ flexWrap: "wrap" }}>
              <Typography variant="body1" color="text.secondary">
                {STR.formPreviewDestination.breadcrumbRiskManager}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {STR.formPreviewDestination.breadcrumbRegister}
              </Typography>
              <Typography variant="body1" color="text.primary">
                {STR.formPreviewDestination.breadcrumbRecord}
              </Typography>
            </Breadcrumbs>

            {/* ── Record header: title + metadata + actions ── */}
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" gap={1.5} sx={{ flexWrap: "wrap" }}>
                  <IconButton
                    size="small"
                    aria-label={STR.formPreviewDestination.backAria}
                    onClick={() => navigate(-1)}
                    sx={{ ml: -0.5 }}
                  >
                    <ArrowLeftIcon aria-hidden />
                  </IconButton>
                  <Typography variant="h1" component="h1" sx={{ fontWeight: 600 }}>
                    {STR.formPreviewDestination.pageTitle}
                  </Typography>
                  {StatusIndicator ? (
                    <StatusIndicator color="warning" label={STR.formPreviewDestination.statusInReview} />
                  ) : (
                    <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>
                      {STR.formPreviewDestination.statusInReview}
                    </Typography>
                  )}
                </Stack>

                {/* Metadata attribute chips */}
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={0.75}
                  sx={{ flexWrap: "wrap", mt: 0.75, pl: 4.5 }}
                >
                  <MetaChip>{STR.formPreviewDestination.metaObjectType}</MetaChip>
                  <MetaChip>{STR.formPreviewDestination.metaRiskId}</MetaChip>
                  <MetaChip>
                    <Typography component="span" variant="body2" color="text.secondary">
                      {STR.formPreviewDestination.metaBusinessUnit}
                    </Typography>
                    <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>
                      {STR.formPreviewDestination.metaBusinessUnitValue}
                    </Typography>
                  </MetaChip>
                  <MetaChip>
                    <Typography component="span" variant="body2" color="text.secondary">
                      {STR.formPreviewDestination.metaRiskOwner}
                    </Typography>
                    <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>
                      {STR.formPreviewDestination.metaRiskOwnerValue}
                    </Typography>
                  </MetaChip>
                </Stack>

                <Typography
                  variant="body2"
                  sx={({ tokens }) => ({
                    color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                    mt: 0.5,
                    pl: 4.5,
                  })}
                >
                  {STR.formPreviewDestination.pageSubtitle}
                </Typography>
              </Box>

              {/* Right actions: Saved indicator + Move to button */}
              <Stack
                direction="row"
                alignItems="flex-start"
                gap={2}
                sx={{ flexShrink: 0 }}
              >
                <Tooltip title={STR.formPreviewDestination.savedTooltip} arrow placement="bottom">
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={0.5}
                    sx={({ tokens }) => ({
                      color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                      cursor: "default",
                      minHeight: 36,
                    })}
                  >
                    <CloudDoneIcon sx={{ fontSize: "1.125rem" }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {STR.formPreviewDestination.savedIndicator}
                    </Typography>
                  </Stack>
                </Tooltip>

                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  sx={{ textTransform: "none", gap: 1, alignItems: "center" }}
                >
                  {STR.formPreviewDestination.workflowMoveButton}
                  {StatusIndicator ? (
                    <StatusIndicator color="success" label={STR.formPreviewDestination.workflowNextStatus} />
                  ) : (
                    <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>
                      {STR.formPreviewDestination.workflowNextStatus}
                    </Typography>
                  )}
                </Button>
              </Stack>
            </Stack>

            <Alert severity="info">{STR.formPreviewDestination.prototypeBanner}</Alert>

            {sections.map((section) => {
              const sectionAttrs = section.attributes;
              return (
                <SectionHeader key={section.id} title={section.title}>
                  <Stack gap={3} sx={{ pt: 2, width: 1 }}>
                    {sectionAttrs.length === 0 ? (
                      <Typography variant="body1" color="text.secondary">
                        {STR.formPreviewDestination.sectionNoFields}
                      </Typography>
                    ) : (
                      sectionAttrs.map((def) => (
                        <Box key={def.id} sx={{ minWidth: 0 }}>
                          <HostRecordAttributeField
                            definition={def}
                            value={values[def.id]}
                            onChange={(next) => setValues((prev) => ({ ...prev, [def.id]: next }))}
                          />
                        </Box>
                      ))
                    )}
                  </Stack>
                </SectionHeader>
              );
            })}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default FormPreviewDestinationPage;
