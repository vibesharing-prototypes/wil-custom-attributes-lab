import { useRef, useState, type ChangeEvent, type DragEvent, type FC, type ReactNode } from "react";
import { Box, IconButton, Link, Paper, Stack, Typography } from "@mui/material";
import { DropZone } from "@diligentcorp/atlas-react-bundle";
import ArrowUpIcon from "@diligentcorp/atlas-react-bundle/icons/ArrowUp";
import CloudIcon from "@diligentcorp/atlas-react-bundle/icons/Cloud";
import DocumentIcon from "@diligentcorp/atlas-react-bundle/icons/Document";
import RemoveCircleIcon from "@diligentcorp/atlas-react-bundle/icons/RemoveCircle";
import { STR } from "../../utils/i18n.js";

export type AttachmentListItem = { id: string; name: string; sizeLabel: string };

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function appendFilesFromFileList(
  fileList: FileList | null,
  existing: AttachmentListItem[],
  multiple: boolean,
): AttachmentListItem[] {
  if (!fileList?.length) return existing;
  const added: AttachmentListItem[] = Array.from(fileList).map((file) => ({
    id: `local-${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
    name: file.name,
    sizeLabel: formatFileSize(file.size),
  }));
  const next = [...existing, ...added];
  return multiple ? next : next.slice(-1);
}

/** Cloud + upward arrow, aligned with Atlas Lens upload affordance. */
function CloudUploadMark() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "relative",
        width: 56,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={({ tokens }) => ({
          display: "flex",
          color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
          "& svg": { width: 44, height: 44 },
        })}
      >
        <CloudIcon />
      </Box>
      <Box
        sx={({ tokens }) => ({
          position: "absolute",
          bottom: 10,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          color: tokens.semantic.color.type?.default?.value ?? "text.primary",
          "& svg": { width: 18, height: 18 },
        })}
      >
        <ArrowUpIcon />
      </Box>
    </Box>
  );
}

export interface HostRecordAttachmentControlProps {
  fieldId: string;
  helperId: string;
  titleLabel: ReactNode;
  helperText?: string;
  isDeprecated: boolean;
  disabled: boolean;
  multiple: boolean;
  files: AttachmentListItem[];
  onChange: (next: AttachmentListItem[]) => void;
}

/**
 * Atlas {@link DropZone} for the dashed target; file rows are static (not draggable).
 */
export const HostRecordAttachmentControl: FC<HostRecordAttachmentControlProps> = ({
  fieldId,
  helperId,
  titleLabel,
  helperText,
  isDeprecated,
  disabled,
  multiple,
  files,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFileDragging, setIsFileDragging] = useState(false);
  const dragDepth = useRef(0);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragDepth.current += 1;
    setIsFileDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsFileDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = 0;
    setIsFileDragging(false);
    if (disabled) return;
    onChange(appendFilesFromFileList(e.dataTransfer.files, files, multiple));
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list?.length) return;
    onChange(appendFilesFromFileList(list, files, multiple));
    e.target.value = "";
  };

  const remove = (id: string) => onChange(files.filter((f) => f.id !== id));

  const openFilePicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <Box component="section" aria-labelledby={fieldId}>
      <Stack
        gap={2}
        sx={{
          mt: 0.5,
          maxWidth: 600,
          width: 1,
          mx: "auto",
        }}
      >
        <Box
          component="h3"
          id={fieldId}
          sx={{
            m: 0,
            typography: "body1",
            fontWeight: 600,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            columnGap: 0.75,
            rowGap: 0.5,
          }}
        >
          {titleLabel}
        </Box>
        {helperText && (
          <Typography
            id={helperId}
            variant="body1"
            component="p"
            sx={({ tokens }) => ({
              m: 0,
              color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
            })}
          >
            {helperText}
          </Typography>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          disabled={disabled}
          aria-hidden
          tabIndex={-1}
          style={{ display: "none" }}
          onChange={onInputChange}
        />

        <DropZone
          isDragging={isFileDragging}
          state={isDeprecated ? "error" : undefined}
          message={isDeprecated ? STR.formPreviewDestination.deprecatedDropZoneMessage : undefined}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          role="region"
          aria-label={STR.formPreviewDestination.hostFormDropZoneAria}
          sx={{
            opacity: disabled ? 0.6 : 1,
            width: 1,
          }}
        >
          <Stack alignItems="center" justifyContent="center" gap={1.5} sx={{ py: 1, px: 1, textAlign: "center" }}>
            <CloudUploadMark />
            <Typography variant="body1" color="text.primary" component="p" sx={{ m: 0 }}>
              {STR.formPreviewDestination.hostFormDropZoneDragPrefix}{" "}
              <Link
                component="button"
                type="button"
                variant="body1"
                onClick={openFilePicker}
                disabled={disabled}
                underline="always"
                sx={{
                  verticalAlign: "baseline",
                  fontWeight: 400,
                  p: 0,
                  border: 0,
                  background: "none",
                  cursor: disabled ? "not-allowed" : "pointer",
                  font: "inherit",
                }}
              >
                {STR.formPreviewDestination.hostFormDropZoneLink}
              </Link>
            </Typography>
            <Stack gap={0.25} alignItems="center">
              <Typography
                variant="body1"
                sx={({ tokens }) => ({
                  m: 0,
                  fontSize: "0.8125rem",
                  color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                })}
              >
                {STR.formPreviewDestination.hostFormDropZoneFormats}
              </Typography>
              <Typography
                variant="body1"
                sx={({ tokens }) => ({
                  m: 0,
                  fontSize: "0.8125rem",
                  color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                })}
              >
                {STR.formPreviewDestination.hostFormDropZoneMaxSize}
              </Typography>
            </Stack>
          </Stack>
        </DropZone>

        <Stack gap={1.5} sx={{ width: 1, maxWidth: 600, mx: "auto" }}>
          {files.map((f) => (
            <Paper
              key={f.id}
              variant="outlined"
              sx={({ tokens, shape }) => ({
                p: 2,
                borderRadius: shape.borderRadius,
                bgcolor: "background.paper",
                borderColor: isDeprecated
                  ? tokens.semantic.color.action?.destructive?.default?.value ?? "error.main"
                  : tokens.semantic.color.outline?.default?.value ?? "divider",
              })}
            >
              <Stack direction="row" alignItems="center" gap={2}>
                <Box
                  sx={({ tokens }) => ({
                    display: "flex",
                    flexShrink: 0,
                    color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                  })}
                  aria-hidden
                >
                  <DocumentIcon />
                </Box>
                <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0, textAlign: "start" }}>
                  <Typography variant="body1" fontWeight={600} noWrap title={f.name}>
                    {f.name}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={({ tokens }) => ({
                      color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                      fontSize: "0.8125rem",
                    })}
                  >
                    {f.sizeLabel}
                  </Typography>
                </Stack>
                {!disabled && (
                  <IconButton
                    edge="end"
                    size="small"
                    aria-label={STR.formPreviewDestination.hostFormRemoveFileAria(f.name)}
                    onClick={() => remove(f.id)}
                    sx={{ flexShrink: 0 }}
                  >
                    <RemoveCircleIcon aria-hidden />
                  </IconButton>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};
