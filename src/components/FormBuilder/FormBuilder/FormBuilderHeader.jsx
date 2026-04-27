import { Box, Typography, Button, Stack } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DownloadIcon from "@mui/icons-material/Download";

export default function FormBuilderHeader({ onSave, onExport }) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Form Configuration
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Set up your form header and branding
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {onSave && (
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={onSave}
            >
              Save
            </Button>
          )}
          {onExport && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={onExport}
            >
              Export
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
