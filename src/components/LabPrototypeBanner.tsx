import { Box, Link } from "@mui/material";

const PROTOTYPES_DOC = "https://github.com/dil-wrahn/arc-core-wil/blob/main/PROTOTYPES.md";

export default function LabPrototypeBanner() {
  return (
    <Box
      component="aside"
      sx={({ tokens }) => ({
        px: 2,
        py: 1.25,
        borderBottom: 1,
        borderColor: "divider",
        backgroundColor: tokens.semantic.color.surface?.subtle?.value ?? "action.hover",
        typography: "body2",
        color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
      })}
    >
      Lab prototype: experimental workflows and explorations. Scope and deploy URLs:{" "}
      <Link href={PROTOTYPES_DOC} target="_blank" rel="noopener noreferrer" underline="always">
        PROTOTYPES.md
      </Link>
      .
    </Box>
  );
}
