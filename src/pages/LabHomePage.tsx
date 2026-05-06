import { Button, Container, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";

import { STR } from "../utils/i18n.js";

/** Landing route for the lab deploy — experimental surfaces only. */
export default function LabHomePage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="h4" component="h1">
          Lab prototype
        </Typography>
        <Typography variant="body1" sx={({ tokens }) => ({ color: tokens.semantic.color.type?.muted?.value })}>
          Workflows and exploration routes for spikes and stakeholder comparisons. Not the milestone MVP surface.
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          <Button component={RouterLink} to="/workflows" variant="contained">
            {STR.workflowsStub.title}
          </Button>
          <Button component={RouterLink} to="/schema-viewer" variant="outlined">
            Schema viewer
          </Button>
          <Button component={RouterLink} to="/schema-management-bos" variant="outlined">
            Schema management (BOS v1)
          </Button>
          <Button component={RouterLink} to="/schema-management-bos-v2" variant="outlined">
            Schema management (BOS v2)
          </Button>
          <Button component={RouterLink} to="/explorations/permission-card-styles" variant="outlined">
            Permission card styles
          </Button>
          <Button component={RouterLink} to="/explorations/form-preview" variant="outlined">
            {STR.explorations.editFormPreviewNav}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
