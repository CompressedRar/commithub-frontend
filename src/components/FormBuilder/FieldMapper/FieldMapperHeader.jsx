import { Box, Typography, Button } from "@mui/material";
import { Download as DownloadIcon, Clear as ClearIcon } from "@mui/icons-material";

export default function FieldMapperHeader({
  onGridSettingsClick,
  onExport,
  onClearMapping,
}) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="h5" fontWeight="bold">
        Field Mapper (Multi-Span)
      </Typography>
      <Box display="flex" gap={1}>
        <Button
          variant="outlined"
          size="small"
          onClick={onGridSettingsClick}
        >
          Grid Settings
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={onExport}
        >
          Export
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<ClearIcon />}
          onClick={onClearMapping}
        >
          Clear Mapping
        </Button>
      </Box>
    </Box>
  );
}
